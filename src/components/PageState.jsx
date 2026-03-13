import Link from 'next/link'

export default function PageState({
  title,
  description = '',
  actionHref = '',
  actionLabel = '',
  onAction,
  loading = false,
}) {
  return (
    <div className="flex w-full items-center justify-center py-12">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-[#e8e8eb] bg-white px-6 py-10 text-center">
        {loading ? (
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-[#79244b]/20 border-t-[#79244b]"
            aria-label={title || 'Loading'}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7e8ee] text-[#79244b]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 7V12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16H12.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.29 3.85993L1.82004 18C1.64541 18.3024 1.553 18.6452 1.55205 18.9944C1.5511 19.3436 1.64166 19.6869 1.81464 19.9903C1.98762 20.2937 2.23694 20.5465 2.53796 20.7238C2.83898 20.901 3.18133 20.9965 3.53004 21H20.47C20.8187 20.9965 21.1611 20.901 21.4621 20.7238C21.7631 20.5465 22.0125 20.2937 22.1854 19.9903C22.3584 19.6869 22.449 19.3436 22.448 18.9944C22.4471 18.6452 22.3547 18.3024 22.18 18L13.71 3.85993C13.5318 3.56604 13.2809 3.32306 12.9814 3.15482C12.6819 2.98658 12.3441 2.89893 12 2.90039C11.6559 2.89893 11.3181 2.98658 11.0186 3.15482C10.7192 3.32306 10.4682 3.56604 10.29 3.85993Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {title ? (
          <h2 className="mt-4 text-xl font-semibold text-[#10112a]">
            {title}
          </h2>
        ) : null}

        {description ? (
          <p className="mt-3 text-sm leading-6 text-[#454662]">
            {description}
          </p>
        ) : null}

        {actionLabel ? (
          actionHref ? (
            <Link
              href={actionHref}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#aa336a] px-5 text-sm font-semibold text-white"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#aa336a] px-5 text-sm font-semibold text-white"
            >
              {actionLabel}
            </button>
          )
        ) : null}
      </div>
    </div>
  )
}
