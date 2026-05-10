import { RefObject, useEffect } from 'react'

type AnyEvent = MouseEvent | TouchEvent

export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: AnyEvent) => void,
): void {
  useEffect(() => {
    const listener = (e: AnyEvent) => {
      const target = e.target as Node | null
      if (!ref.current || (target && ref.current.contains(target))) return
      handler(e)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
