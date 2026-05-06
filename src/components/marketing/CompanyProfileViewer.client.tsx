'use client'

import dynamic from 'next/dynamic'

const CompanyProfileViewer = dynamic(
  () =>
    import('./CompanyProfileViewer').then(
      (mod) => mod.CompanyProfileViewer // or default if you switch
    ),
  { ssr: false }
)

export default function CompanyProfileViewerClient(props: any) {
  return <CompanyProfileViewer {...props} />
}