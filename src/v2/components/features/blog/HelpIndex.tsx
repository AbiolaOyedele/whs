import { formatPostDate, POSTS_PER_PAGE } from '@v2/content/blog'
import { sortedGuides } from '@v2/content/resources'
import { Pagination } from '@v2/components/features/blog/Pagination'
import { PostCard } from '@v2/components/features/blog/PostCard'

interface HelpIndexProps {
  page?: number
}

/** The list of case studies, shared by /resources and /resources/page/n. */
export function HelpIndex({ page = 1 }: HelpIndexProps) {
  const guides = sortedGuides()
  const totalPages = Math.max(1, Math.ceil(guides.length / POSTS_PER_PAGE))
  const visible = guides.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  return (
    <div className="overflow-hidden rounded-b-4xl">
      <div className="slate bg-slate-50">
        <div className="container">
          <div className="mb-fluid-xl grid gap-gutter pt-safe-header md:grid-cols-12">
            <div className="md:col-span-8">
              <h1 className="text-heading-lg">Work</h1>
            </div>
          </div>
          <div className="anim-transform-opacity -delay-3">
            <div className="grid gap-gutter md:grid-cols-3">
              {visible.map((guide) => (
                <PostCard
                  key={guide.slug}
                  href={`/resources/${guide.slug}`}
                  title={guide.title}
                  date={guide.date}
                  dateLabel={formatPostDate(guide.date)}
                  labels={[]}
                  artSeed={guide.artSeed}
                  icon={guide.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 py-fluid-3xl">
        <div className="container flex justify-center">
          <Pagination basePath="/resources" current={page} total={totalPages} />
        </div>
      </div>
    </div>
  )
}
