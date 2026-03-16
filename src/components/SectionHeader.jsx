export default function SectionHeader({
  icon = null,
  title,
  description = '',
  actions = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="flex-shrink-0">
            {icon}
          </div>
        ) : null}

        <div>
          {title ? (
            <h1 className="text-black text-xl font-medium font-inter leading-7">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p className="mt-2 text-[#454662] text-base font-normal font-inter leading-normal">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex items-center gap-4">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
