import Head from 'next/head'
import { useRouter } from 'next/router'
import { buildCanonicalUrl, buildTitle, SEO_DEFAULT_DESCRIPTION, SEO_SITE_NAME } from '@/utils/seo'

export default function SeoHead({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  noindex = false,
  ogType = 'website',
  ogImage,
  jsonLd
}) {
  const router = useRouter()

  const resolvedPath = canonicalPath || router?.asPath || '/'
  const canonical = canonicalUrl || buildCanonicalUrl(resolvedPath)

  const metaTitle = buildTitle(title)
  const metaDescription = (description || SEO_DEFAULT_DESCRIPTION).trim()
  const robots = noindex ? 'noindex,nofollow' : 'index,follow'

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />

      <meta property="og:site_name" content={SEO_SITE_NAME} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}

      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </Head>
  )
}

