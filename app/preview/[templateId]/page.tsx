import { redirect } from "next/navigation"

export default async function LegacyPreviewRedirectPage({
  params,
}: Readonly<{
  params: Promise<{ templateId: string }>
}>) {
  const { templateId } = await params
  redirect(`/preview/page-templates/${templateId}`)
}
