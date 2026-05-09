export default function SegmentedControl({
  options = [],
  value,
  onChange = () => {},
  className = '',
  activeClassName = 'bg-[#79244b] text-white font-medium',
  inactiveClassName = 'text-[#10112a] font-normal hover:bg-[#f7e8ee]',
}: any) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-[#e8e8eb] bg-white p-1 ${className}`}>
      {options.map((option: any) => {
        const active = option === value

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`h-8 px-3 rounded-md flex items-center justify-center text-sm leading-[22px] transition-colors ${
              active ? activeClassName : inactiveClassName
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
