import React from 'react';

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
  label,
  className = '',
  ...rest
}) {
  return (
    <div
      {...rest}
      className={
        `relative bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-400 ` +
        `focus-within:shadow-[2px_2px_4px_0px_rgba(16,17,42,0.20)] focus-within:outline ` +
        `focus-within:outline-1 focus-within:outline-offset-[-1px] focus-within:outline-slate-900 ` +
        `h-14 px-4 ${className}`
      }
    >
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full h-full text-base font-normal font-['Inter'] outline-none pt-4"
      />
      <label
        htmlFor={id}
        className={`absolute left-4 text-zinc-400 top-[9px] text-xs leading-none translate-y-0 w-56 justify-start font-normal font-['Inter']
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0
          peer-focus:top-[9px] peer-focus:text-xs peer-focus:leading-none peer-focus:translate-y-0 peer-hover:top-[9px] peer-hover:text-xs peer-hover:leading-none peer-hover:translate-y-0
          ${value
            ? 'transition-none peer-focus:transition-all peer-focus:duration-200 peer-hover:transition-all peer-hover:duration-200'
            : 'transition-all duration-200'
          }
        `}
      >
        {label}
      </label>
    </div>
  );
}
