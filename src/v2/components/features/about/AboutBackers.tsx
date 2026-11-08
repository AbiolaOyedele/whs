import { Rail } from '@v2/components/ui/Rail'
import { aboutBackers } from '@v2/content/about'

/** The slate band under the white panel: a heading, a line that draws in and a row of tiles that drifts. */
export function AboutBackers() {
  return (
    <div className="slate wrapper relative z-2 -mt-7.5 bg-slate-50 max-md:py-fluid-3xl md:-mt-15 md:py-fluid-4xl">
      <div className="section-spacing">
        <div className="container">
          <h2 className="text-heading-md mb-fluid-2xl text-center">{aboutBackers.heading}</h2>
        </div>
        <div>
          <div className="container">
            <div className="animated-line" />
          </div>
          <Rail itemCount={aboutBackers.names.length} direction={-1} velocity={0.5} tile className="my-0!">
            {aboutBackers.names.map((name, index) => (
              <div key={index} className="c-about-backer group relative flex aspect-220/200 items-center justify-center">
                <span className="absolute inset-0 rounded-md bg-white transition-transform duration-200 ease-in-out group-focus-within:scale-97 group-hover:scale-97" />
                <span className="text-label relative z-2 px-3 text-center whitespace-normal">{name}</span>
              </div>
            ))}
          </Rail>
        </div>
      </div>
    </div>
  )
}
