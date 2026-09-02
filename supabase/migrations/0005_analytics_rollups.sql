-- ============================================================================
-- First-party analytics aggregation.
--
-- WHY THIS EXISTS. The admin's analytics panel was written against Vercel's
-- Web Analytics READ API, which is not part of their documented, versioned REST
-- surface — it is the endpoint their own dashboard calls. It returned nothing
-- usable, which is exactly the failure mode that was flagged when it was built.
--
-- Collection is unaffected either way: the Vercel tracker still runs and their
-- dashboard still works. This gives the admin panel its own source that cannot
-- be taken away by someone else's undocumented endpoint changing shape.
--
-- Aggregation happens in Postgres rather than by pulling rows into the app and
-- counting them in JavaScript. A year of traffic is a lot of rows to move
-- across the network to produce eight numbers.
-- ============================================================================

-- Daily visitors and views. `visitor_hash` rotates every day by construction
-- (the date is in the digest), so a distinct count per day is exactly right and
-- a distinct count across days is deliberately meaningless.
create or replace function wildhands.analytics_timeseries(since timestamptz)
returns table (day date, visitors bigint, views bigint)
language sql
stable
security definer
set search_path = wildhands, pg_temp
as $$
  select
    date_trunc('day', created_at)::date as day,
    count(distinct visitor_hash) as visitors,
    count(*) as views
  from wildhands.page_views
  where created_at >= since
  group by 1
  order by 1;
$$;

/* One function for every breakdown, chosen by name, so the admin cannot pass
   an arbitrary column into a query. `dimension` is validated against a fixed
   list rather than interpolated. */
create or replace function wildhands.analytics_breakdown(
  since timestamptz,
  dimension text,
  max_rows integer default 8
)
returns table (label text, value bigint)
language plpgsql
stable
security definer
set search_path = wildhands, pg_temp
as $$
begin
  if dimension not in ('path', 'referrer_host', 'country', 'device', 'utm_source') then
    raise exception 'unsupported dimension: %', dimension;
  end if;

  return query execute format(
    $q$
      select coalesce(nullif(%I::text, ''), 'Direct') as label, count(*) as value
      from wildhands.page_views
      where created_at >= $1
      group by 1
      order by value desc
      limit $2
    $q$,
    dimension
  ) using since, max_rows;
end;
$$;

revoke all on function wildhands.analytics_timeseries(timestamptz) from public, anon, authenticated;
revoke all on function wildhands.analytics_breakdown(timestamptz, text, integer) from public, anon, authenticated;
grant execute on function wildhands.analytics_timeseries(timestamptz) to service_role;
grant execute on function wildhands.analytics_breakdown(timestamptz, text, integer) to service_role;

-- Retention. Nothing here is worth keeping for years, and page_views is the one
-- table on this schema that grows without bound.
create or replace function wildhands.prune_page_views()
returns void
language sql
security definer
set search_path = wildhands, pg_temp
as $$
  delete from wildhands.page_views where created_at < now() - interval '400 days';
$$;

revoke all on function wildhands.prune_page_views() from public, anon, authenticated;
grant execute on function wildhands.prune_page_views() to service_role;
