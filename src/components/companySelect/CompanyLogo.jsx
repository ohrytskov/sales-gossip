import { useEffect, useMemo, useRef, useState } from 'react'

const makeInitialSvgDataUrl = (text) => {
  const initial = (text || '').toString().trim().charAt(0).toUpperCase() || '?'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#0f172a"/><circle cx="50" cy="50" r="40" fill="#10b981"/><text x="50" y="58" font-family="Inter, Arial, sans-serif" font-size="48" fill="#ffffff" text-anchor="middle" alignment-baseline="middle">${initial}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default function CompanyLogo({ website, name, alt, className, onResolved }) {
  const fallback = makeInitialSvgDataUrl(name || alt)
  const [src, setSrc] = useState(fallback)
  const lastResolvedRef = useRef(null)
  const onResolvedRef = useRef(onResolved)

  useEffect(() => {
    onResolvedRef.current = onResolved
  }, [onResolved])

  const host = useMemo(() => {
    let hostCandidate = website || ''
    try {
      if (!/^https?:\/\//i.test(hostCandidate)) {
        hostCandidate = `https://${hostCandidate}`
      }
      return new URL(hostCandidate).host
    } catch {
      return (website || '').replace(/^https?:\/\//i, '').split('/')[0]
    }
  }, [website])

  const hostNoWww = useMemo(() => host.replace(/^www\./i, ''), [host])

  const list = useMemo(() => {
    const domain = (hostNoWww || host).replace(/:\d+$/, '')
    const candidates = [
      domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : '',
      domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : '',
      `https://${host}/favicon.ico`,
      `https://${host}/favicon.png`,
      `https://${host}/favicon.jpg`,
      `https://${host}/favicon.gif`,
    ]
    if (hostNoWww && hostNoWww !== host) candidates.push(`https://www.${hostNoWww}/favicon.ico`)
    const seen = new Set()
    return candidates.filter(candidate => {
      if (!candidate) return false
      if (seen.has(candidate)) return false
      seen.add(candidate)
      return true
    })
  }, [host, hostNoWww])

  useEffect(() => {
    let cancelled = false
    const timers = []

    const tryOne = (url) => {
      return new Promise(resolve => {
        const img = new Image()
        let done = false
        const cleanup = () => {
          img.onload = null
          img.onerror = null
        }
        img.onload = () => {
          if (done) return
          done = true
          cleanup()
          resolve(true)
        }
        img.onerror = () => {
          if (done) return
          done = true
          cleanup()
          resolve(false)
        }
        const t = setTimeout(() => {
          if (done) return
          done = true
          cleanup()
          resolve(false)
        }, 4000)
        timers.push(t)
        img.src = url
      })
    }

    const run = async () => {
      for (const url of list) {
        if (cancelled) return
        const ok = await tryOne(url)
        if (ok && !cancelled) {
          setSrc(url)
          const cb = onResolvedRef.current
          if (cb && url !== lastResolvedRef.current) {
            lastResolvedRef.current = url
            cb(url)
          }
          return
        }
      }
      if (!cancelled) {
        setSrc(fallback)
        const cb = onResolvedRef.current
        if (cb && fallback !== lastResolvedRef.current) {
          lastResolvedRef.current = fallback
          cb(fallback)
        }
      }
    }

    run()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [list, fallback])

  return (
    <img
      src={src}
      referrerPolicy="no-referrer"
      onError={(e) => {
        const img = e.currentTarget
        if (img.dataset.fallbackApplied) return
        img.dataset.fallbackApplied = '1'
        img.src = fallback
      }}
      alt={alt}
      className={className}
    />
  )
}

