import { ContentPage, PageSection } from '@v2/components/features/content-page/ContentPage'
import { NumberedGrid } from '@v2/components/features/content-page/NumberedGrid'
import { LLMS_TOOL } from '@v2/content/tools'
import { LlmsTxtGenerator } from './LlmsTxtGenerator'

/** /tools/llms-txt-generator: the generator, how it works, and what the file is for. */
export function LlmsToolPage() {
  return (
    <ContentPage title={LLMS_TOOL.title} intro={LLMS_TOOL.intro}>
      <LlmsTxtGenerator />
      <PageSection title="How it works">
        <NumberedGrid items={LLMS_TOOL.steps} columns={3} />
      </PageSection>
      <PageSection title={LLMS_TOOL.explainer.title}>
        <p className="text-body-lg max-w-160">{LLMS_TOOL.explainer.body}</p>
      </PageSection>
    </ContentPage>
  )
}
