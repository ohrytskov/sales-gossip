/**
 * FloatingInput renders an input with animated floating label.
 *
 * Props:
 * - id: string, input id and htmlFor label
 * - type: string, input type
 * - value: string, current input value
 * - onChange: function, called with new value on change
 * - label: string, label text
 * - className: string, additional Tailwind classes for positioning/layout
 * - ...rest: any, passed through as attributes on the container div
 */
export default function FloatingInput({
  id,
  type = 'text',
  value,
  onChange,
  onFocus = null,
  label,
  className = '',
  error = false,
  inputProps = {},
  rightElement = null,
  helperText = '',
  helperTextType = 'error', // 'error' | 'success' | 'info'
  // optional custom classes to override default error colors (useful for matching designs)
  errorOutlineClass = '',
  errorLabelClass = '',
  helperErrorClass = '',
  rounded = '2xl', // '2xl' | 'full'
  multiline = false,
  rows = 3,
  // new: maxLength and showCount control: if provided, a used/remaining counter is rendered
  maxLength = null,
  showCount = false,
  ...rest
}) {
  const baseInputClass = "peer w-full h-full text-base font-normal font-['Inter'] outline-none pt-4 bg-transparent";
  const userInputClass = inputProps.className ? ` ${inputProps.className}` : '';
  const prClass = rightElement ? ' pr-16' : '';
  const mergedInputProps = { ...inputProps };
  // add resize-none for multiline textarea to remove bottom-right resize handle
  mergedInputProps.className = `${baseInputClass}${prClass}${userInputClass}${multiline ? ' resize-none' : ''}`.trim();
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-2xl';
  // label classes: for multiline, show label near first line when empty and float/scale
  // to the very top on focus/hover or when value exists. Use transform-scale for smooth shrinking.
  const labelColorClass = error ? (errorLabelClass || 'text-red-700') : 'text-zinc-400'
  const labelCommon = `${labelColorClass} left-4 text-xs leading-none translate-y-0 w-full justify-start font-normal font-['Inter'] transform origin-left`
  // when value exists we want label slightly smaller by default; otherwise full size when placeholder shown
  const forcedScale = value ? 'scale-90' : ''
  const labelState = multiline
    ? `top-[6px] peer-placeholder-shown:top-[18px] peer-placeholder-shown:text-base peer-placeholder-shown:scale-100 peer-focus:top-[6px] peer-focus:text-xs peer-focus:scale-80 peer-hover:top-[6px] peer-hover:text-xs peer-hover:leading-none peer-hover:translate-y-0 peer-hover:scale-80 group-hover:top-[6px] group-hover:text-xs group-hover:leading-none group-hover:translate-y-0 group-hover:scale-80`
    : `top-[9px] peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-focus:top-[9px] peer-focus:text-xs peer-focus:leading-none peer-focus:translate-y-0 peer-hover:top-[9px] peer-hover:text-xs peer-hover:leading-none peer-hover:translate-y-0 peer-hover:scale-80 group-hover:top-[9px] group-hover:text-xs group-hover:leading-none group-hover:translate-y-0 group-hover:scale-80`

  const labelTransition = 'transition-all duration-150 ease-in-out'

  const containerHeightClass = multiline ? '' : 'h-14'

  const outlineColorClass = error ? (errorOutlineClass || 'outline-red-700') : 'outline-gray-400'

  return (
    <div
      {...rest}
      className={`relative group bg-white ${roundedClass} outline outline-1 outline-offset-[-1px] ${outlineColorClass} ${containerHeightClass} px-4 ${className}`}
    >
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder=" "
          rows={rows}
          {...mergedInputProps}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder=" "
          {...mergedInputProps}
        />
      )}
      <label htmlFor={id} className={`absolute ${labelCommon} ${forcedScale} ${labelState} ${labelTransition}`}>
        {label}
      </label>
      {rightElement ? (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      ) : null}
      {helperText ? (
        <div
          className={
            `absolute left-4 top-[60px] text-xs font-normal font-['Inter'] leading-none ` +
            (helperTextType === 'success'
              ? 'text-green-600'
              : helperTextType === 'info'
              ? 'text-zinc-500'
              : (helperErrorClass || 'text-red-700'))
          }
        >
          {helperText}
        </div>
      ) : null}
      {showCount && (maxLength || inputProps?.maxLength) ? (
        <div data-layer="count" className={`absolute right-[15px] top-[calc(100%+8px)] Count text-right justify-start text-[#454662] text-xs font-normal font-['Inter'] leading-none`}>
          {`${(value || '').length}/${(maxLength || inputProps?.maxLength)}`}
        </div>
      ) : null}
    </div>
  );
}
