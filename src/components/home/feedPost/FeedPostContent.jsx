import Link from 'next/link'
import { unescape as unescapeHtml } from 'html-escaper'

export default function FeedPostContent({
  isDetail,
  title,
  postId,
  excerpt = '',
  moreLink,
  showMore,
  onToggleShowMore,
  ReactQuill,
  tags = [],
  companyLogo = '',
  companyName = '',
  isLogoVisible,
  onLogoError,
}) {
  return (
    <div className="px-4">
      {isDetail ? (
        <h2 className="text-xl font-medium text-slate-900 font-['Inter'] leading-7 mb-2">{title}</h2>
      ) : (
        <Link href={`/postDetails?postId=${encodeURIComponent(postId)}`}>
          <h2 className="text-xl font-medium text-slate-900 font-['Inter'] leading-7 mb-2 hover:underline">{title}</h2>
        </Link>
      )}

      <div className="text-sm text-slate-900 leading-snug font-medium font-['Inter'] mb-2">
        <ReactQuill className="create-post-quill" theme="snow" readOnly modules={{ toolbar: false }} value={unescapeHtml(excerpt)} />
        {moreLink && (
          <span onClick={onToggleShowMore} className="text-slate-900 text-sm font-semibold font-['Inter'] leading-snug cursor-pointer">
            {showMore ? 'less' : 'more'}
          </span>
        )}
      </div>

      <div className="inline-flex items-center gap-4 mb-4">
        {companyLogo && isLogoVisible && (
          <img
            src={companyLogo}
            alt={companyName}
            className="w-6 h-6 rounded-full border border-gray-200"
            onError={onLogoError}
          />
        )}

        <div className="-ml-3 text-slate-900 text-sm font-medium font-['Inter']">{companyName}</div>

        <div className="w-px h-6 bg-zinc-100" />

        {tags.map((tag) => (
          <div key={tag} className="h-6 px-3 py-1 bg-zinc-100 rounded-lg flex items-center justify-center gap-2">
            <span className="text-slate-900 text-xs font-normal font-['Inter'] leading-tight">#{tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

