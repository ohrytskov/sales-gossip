import { useEffect, useRef, useState, useMemo } from 'react'
import slugify from 'slugify'
import useRtdbDataKey from '@/hooks/useRtdbData'

function CompanyLogo({ website, name, alt, className, onResolved }) {
  const makeInitialSvgDataUrl = (text) => {
    const initial = (text || '').toString().trim().charAt(0).toUpperCase() || '?'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#0f172a"/><circle cx="50" cy="50" r="40" fill="#10b981"/><text x="50" y="58" font-family="Inter, Arial, sans-serif" font-size="48" fill="#ffffff" text-anchor="middle" alignment-baseline="middle">${initial}</text></svg>`
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }

  const fallback = makeInitialSvgDataUrl(name || alt)
  const [src, setSrc] = useState(fallback)
  const lastResolvedRef = useRef(null)

  const host = useMemo(() => {
    let h = website || ''
    try {
      if (!/^https?:\/\//i.test(h)) {
        h = `https://${h}`
      }
      return new URL(h).host
    } catch {
      return (website || '').replace(/^https?:\/\//i, '').split('/')[0]
    }
  }, [website])

  const hostNoWww = useMemo(() => host.replace(/^www\./i, ''), [host])

  const list = useMemo(() => {
    const candidates = [
      `https://logo.clearbit.com/${host}`,
      `https://${host}/favicon.ico`,
      `https://${host}/favicon.png`,
      `https://${host}/favicon.jpg`,
      `https://${host}/favicon.gif`,
    ]
    if (hostNoWww) candidates.push(`https://www.${hostNoWww}/favicon.ico`)
    const seen = new Set()
    return candidates.filter(c => {
      if (!c) return false
      if (seen.has(c)) return false
      seen.add(c)
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
          if (onResolved && url !== lastResolvedRef.current) {
            lastResolvedRef.current = url
            onResolved(url)
          }
          return
        }
      }
      if (!cancelled) {
        setSrc(fallback)
        if (onResolved && fallback !== lastResolvedRef.current) {
          lastResolvedRef.current = fallback
          onResolved(fallback)
        }
      }
    }

    run()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [website, name])

  return (
    <img
      src={src}
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

export default function CompanySelect({ value, onChange }) {

  const top = 425
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const companyInputRef = useRef(null)
  const dropdownRef = useRef(null)
  const listRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef(null)
  const fetchInProgressRef = useRef(false)
  const debounceTimerRef = useRef(null)
  // track the term for which companies were last fetched
  const lastFetchedTermRef = useRef('')

  const [companies, setCompanies] = useState([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  const handleResolvedLogo = (id, logoUrl) => {
    setCompanies(prev => prev.map(c =>
      c.id === id ? { ...c, logo: logoUrl } : c
    ))
  }

  const { data: sk1 } = useRtdbDataKey('useauth/sk1')
  const apiKey = sk1 || ''

  const fetchCompanies = async (q = '') => {
    // cancel any scheduled debounce run (we're starting a fetch now)
    try {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    } catch (e) { }

    // do not start a fetch when another is in progress
    if (fetchInProgressRef.current) return
    fetchInProgressRef.current = true
    setLoadingCompanies(true)
    try {

      /*
      const body = {
        model: "gpt-5-mini",
        verbosity: "low",
        reasoning_effort: "low",
        messages: [
          {
            "role": "developer",
            "content": [
              {
                "type": "text",
                "text": "You - helpful search companies assistant. Return please result as an array of JSON objects with companies names and websites URLs. Return empty array if no results found."
              }
            ]
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": `Lets try to find nine popular U.S. companies that contain term ${q} in title.`
              }
            ]
          }
        ],
        response_format: {
          "type": "json_schema",
          "json_schema": {
            "name": "companies_list",
            "strict": true,
            "schema": {
              "type": "object",
              "properties": {
                "companies": {
                  "type": "array",
                  "description": "An array of company and website pairs.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "company": {
                        "type": "string",
                        "description": "The name of the company."
                      },
                      "website": {
                        "type": "string",
                        "description": "The website URL of the company."
                      }
                    },
                    "required": [
                      "company",
                      "website"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "companies"
              ],
              "additionalProperties": false
            }
          }
        },
        store: false
      }
*/

      /*
            const body = {
              model: "gpt-5-mini",
              input: [
                {
                  "role": "developer",
                  "content": [
                    {
                      "type": "input_text",
                      "text": "You - helpful search companies assistant. Return please result as an array of JSON objects with companies names and websites URLs. Return empty array if no results found."
                    }
                  ]
                },
                {
                  "role": "user",
                  "content": [
                    {
                      "type": "input_text",
                      "text": `Lets try to find nine popular U.S. companies that contain term ${q} in title.`
                    }
                  ]
                }
              ],
              text: {
                "format": {
                  "type": "json_schema",
                  "name": "companies_list",
                  "strict": true,
                  "schema": {
                    "type": "object",
                    "properties": {
                      "companies": {
                        "type": "array",
                        "description": "Array of companies with their names and website URLs.",
                        "items": {
                          "type": "object",
                          "properties": {
                            "name": {
                              "type": "string",
                              "description": "The name of the company."
                            },
                            "website_url": {
                              "type": "string",
                              "description": "The website URL of the company."
                            }
                          },
                          "required": [
                            "name",
                            "website_url"
                          ],
                          "additionalProperties": false
                        }
                      }
                    },
                    "required": [
                      "companies"
                    ],
                    "additionalProperties": false
                  }
                },
                "verbosity": "medium"
              },
              reasoning: {
                "effort": "medium"
              },
              tools: [
                {
                  "type": "web_search",
                  "user_location": {
                    "type": "approximate",
                    "country": "US"
                  },
                  "search_context_size": "medium"
                }
              ],
              store: false,
            }
            */

      const body = {
        model: "gpt-4.1-mini",
        input: [
          {
            "role": "system",
            "content": [
              {
                "type": "input_text",
                "text": "You - helpful search companies assistant. Return please result as an array of JSON objects with companies names and websites URLs. Return empty array if no results found."
              }
            ]
          },
          {
            "role": "user",
            "content": [
              {
                "type": "input_text",
                "text": `Lets try to find nine popular U.S. companies that contain term ${q} in title.`
              }
            ]
          }
        ],
        text: {
          "format": {
            "type": "json_schema",
            "name": "companies_list",
            "strict": true,
            "schema": {
              "type": "object",
              "properties": {
                "companies": {
                  "type": "array",
                  "description": "Array of companies with their names and website URLs.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string",
                        "description": "The name of the company."
                      },
                      "website_url": {
                        "type": "string",
                        "description": "The website URL of the company."
                      }
                    },
                    "required": [
                      "name",
                      "website_url"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "companies"
              ],
              "additionalProperties": false
            }
          }
        },
        reasoning: {},
        tools: [
          {
            "type": "web_search",
            "user_location": {
              "type": "approximate",
              "country": "US"
            },
            "search_context_size": "high"
          }
        ],
        store: false,
      }

      //const res = await fetch('https://api.openai.com/v1/chat/completions', {
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      })

      const json = await res.json()
      let content = ''
      if (Array.isArray(json?.output)) {
        const msg = json.output.filter(o => o.type === 'message').pop()
        content = msg?.content?.[0]?.text ?? ''
      } else {
        content = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? ''
      }
      let parsed = null
      try {
        parsed = JSON.parse(content)
      } catch (err) {
        // try to extract a JSON object or array from the text
        const objMatch = content.match(/\{[\s\S]*\}/)
        const arrMatch = content.match(/\[[\s\S]*\]/)
        const substr = objMatch ? objMatch[0] : (arrMatch ? arrMatch[0] : null)
        try { parsed = substr ? JSON.parse(substr) : null } catch (e) { parsed = null }
      }

      let arr = []
      if (Array.isArray(parsed)) arr = parsed
      else if (parsed && Array.isArray(parsed.companies)) arr = parsed.companies

      // process parsed response into companies list (deduplicated)
      const mapped = (Array.isArray(arr) ? arr : []).map((item) => {
        const title = String(
          (typeof item === 'string')
            ? item
            : item.company || item.name || item.title || ''
        ).trim()
        const website = (typeof item === 'object' && item)
          ? (item.website || item.url || item.website_url || '')
          : ''
        let id = slugify(title, { lower: true, strict: true })
        if (!id && website) {
          try { id = slugify(new URL(website).host || website, { lower: true, strict: true }) }
          catch (e) { /* ignore */ }
        }
        return { id, title, logo: null, website }
      })
      const seen = new Set()
      const unique = []
      for (const it of mapped) {
        const key = (it.id || it.title || '').toString().toLowerCase()
        if (key && !seen.has(key)) {
          seen.add(key)
          unique.push(it)
        }
      }
      setCompanies(unique)
      lastFetchedTermRef.current = q
    } catch (e) {
      // silent
      console.log('CompanySelect: fetchCompanies', e)
    } finally {
      setLoadingCompanies(false)
      fetchInProgressRef.current = false
    }
  }

  // Debounce fetch after typing stops for 2 seconds
  useEffect(() => {
    const v = (searchTerm || '').trim()
    if (!v) return
    // if a fetch is already running, cancel any scheduled run and don't schedule another
    if (fetchInProgressRef.current) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      return
    }

    const t = setTimeout(() => {
      // ensure no fetch in progress
      if (fetchInProgressRef.current) return
      try { fetchCompanies(v) } catch (err) { /* ignore */ }
      debounceTimerRef.current = null
    }, 2000)
    debounceTimerRef.current = t
    return () => {
      try { clearTimeout(debounceTimerRef.current) } catch (e) { }
      debounceTimerRef.current = null
    }
  }, [searchTerm])

  useEffect(() => {
    if ((!value || value === '') && companies.length && typeof onChange === 'function') {
      // Only set when there's no selection yet and a list is available.
      onChange(companies[0])
    }
  }, [companies?.length, value])

  // close dropdown on outside click or escape
  useEffect(() => {
    if (!showCompanyDropdown) return
    const handleClick = (e) => {
      if (companyInputRef.current && companyInputRef.current.contains(e.target)) return
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return
      setShowCompanyDropdown(false)
    }
    const handleKey = (e) => { if (e.key === 'Escape') setShowCompanyDropdown(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [showCompanyDropdown])

  // focus search input when dropdown opens
  useEffect(() => {
    if (!showCompanyDropdown) return
    setTimeout(() => {
      try { searchInputRef.current?.focus() } catch (e) { }
    }, 0)
  }, [showCompanyDropdown])

  const baseFiltered = (companies || []).filter(c => !searchTerm || (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
  // displayed companies (unique, no duplication)
  const displayedCompanies = (baseFiltered || []).map((c, idx) => ({ ...c, _displayKey: `${(c.id || c.title || idx).toString()}__${idx}` }))
  const selectedCompany = value && typeof value === 'object'
    ? value
    : companies.find(c => c.id === (value || '')) || null

  return (
    <div
      data-layer="Input field"
      ref={companyInputRef}
      className={`InputField w-[778px] h-14 left-[24px] absolute ${showCompanyDropdown ? 'bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(10,10,25,0.16)] border border-[#0a0a19]' : 'bg-[#f2f2f4] rounded-2xl border border-[#e8e8eb]'} relative cursor-pointer`}
      style={{ top: `${top}px` }}
      onClick={(e) => { e.stopPropagation(); setShowCompanyDropdown(true); try { searchInputRef.current?.focus() } catch (err) { } }}
    >
      <div
        data-svg-wrapper
        data-layer="Frame"
        className="Frame left-[738px] top-[16px] absolute"
        style={{ transform: showCompanyDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms ease' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_215_642)">
            <path d="M6 9L12 15L18 9" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_215_642">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      {/* Input row: logo + search input, vertically centered */}
      <div className="flex items-center h-full px-4">
        <div className="flex-shrink-0">
          {showCompanyDropdown ? (
            // show search icon when active
            <svg width="24" height="24" viewBox="0 0 24 24" className="w-8 h-8 text-[#9495a5]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#9495A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            selectedCompany ? (
              <CompanyLogo
                website={selectedCompany.website}
                name={selectedCompany.title}
                alt={selectedCompany.title || 'company'}
                className="w-8 h-8 rounded-full border border-[#f2f2f4]"
                onResolved={url => {
                  handleResolvedLogo(selectedCompany.id, url)
                  if (typeof onChange === 'function') {
                    onChange({ ...selectedCompany, logo: url })
                  }
                }}
              />
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15.5" fill="#B7B7C2" stroke="#E8E8EB" />
              </svg>
            )
          )}
        </div>
        <input
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => {
            const v = e.target.value
            setSearchTerm(v)
            setShowCompanyDropdown(true)
          }}
          onFocus={() => setShowCompanyDropdown(true)}
          placeholder={selectedCompany?.title || 'Search companies'}
          className={`ml-3 bg-transparent outline-none text-sm text-[#151636] flex-1 ${showCompanyDropdown ? 'pl-0' : ''}`}
          aria-label="Search companies"
        />
      </div>

      {showCompanyDropdown && (
        <>
          {loadingCompanies && (
            <div
              ref={dropdownRef}
              className="Frame48097063 absolute z-50 bg-white rounded-xl shadow-[0px_0px_12px_0px_rgba(10,10,25,0.24)] overflow-hidden"
              style={{ left: 0, bottom: 'calc(100% + 12px)', width: '240px', height: '160px' }}
              role="dialog"
              aria-live="polite"
            >
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-[#10112a] rounded-full animate-spin" />
              </div>
            </div>
          )}
          {!loadingCompanies && baseFiltered?.length ? (
            <div
              ref={dropdownRef}
              className="Frame48097063 absolute z-50 bg-white rounded-xl shadow-[0px_4px_8px_0px_rgba(10,10,25,0.16)] flex flex-col"
              // gap between the input top and the dropdown bottom: 12px
              style={{ left: 0, bottom: 'calc(100% + 12px)', width: '160px', height: '399px', overflowX: 'hidden' }}
              role="listbox"
            >
              {/* header removed: search lives on the modal itself */}
              <div ref={listRef} className="p-4 flex-1 overflow-auto" style={{ overflowX: 'hidden' }}
                onWheel={(e) => {
                  try {
                    const el = listRef.current
                    if (!el) return
                    const atTop = el.scrollTop <= 0
                    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
                    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
                      //e.preventDefault()
                      e.stopPropagation()
                    }
                  } catch (err) {
                    // ignore
                  }
                }}>
                <div className="inline-flex flex-col justify-start items-start gap-4" style={{ minHeight: 0 }}>
                  {displayedCompanies.map((c) => (
                    <div
                      key={c._displayKey}
                      className="w-full inline-flex justify-start items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 overflow-hidden"
                      onClick={(ev) => { ev.stopPropagation(); if (typeof onChange === 'function') onChange(c); setSearchTerm(''); setShowCompanyDropdown(false); }}
                      role="option"
                      aria-selected={value === c.id}
                    >
                      <CompanyLogo website={c.website} name={c.title} alt={c.title || 'logo'} className="w-8 h-8 rounded-full border border-[#f2f2f4]" />
                      <div className="CompanyName justify-start text-[#10112a] text-sm font-normal font-['Inter'] truncate whitespace-nowrap max-w-[88px]">{c.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (!loadingCompanies && lastFetchedTermRef.current && lastFetchedTermRef.current === searchTerm && companies.length === 0 ? (
            <div
              ref={dropdownRef}
              className="Frame48097063 absolute z-50 bg-white rounded-xl shadow-[0px_0px_12px_0px_rgba(10,10,25,0.24)] overflow-hidden"
              style={{ left: 0, bottom: 'calc(100% + 12px)', width: '240px', height: '160px' }}
              role="dialog"
              aria-live="polite"
            >
              <div className="Frame48097067 size-14 left-[91px] top-[32px] absolute overflow-hidden">
                <div data-svg-wrapper data-layer="app-window-search-text--Streamline-Freehand" className="AppWindowSearchTextStreamlineFreehand left-[5.60px] top-[5.60px] absolute">
                  <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_215_1328)">
                      <circle cx="30" cy="27" r="10" fill="#FFE0E0" />
                      <path d="M3.11856 2.72899C3.13666 2.59188 3.10338 2.45292 3.02513 2.33888C2.94689 2.22484 2.82921 2.14379 2.69477 2.11134C2.56033 2.07889 2.41864 2.09733 2.29699 2.16312C2.17534 2.22891 2.08233 2.33739 2.03589 2.46766C0.598557 8.47832 0.766557 27.7983 1.99856 32.8943C2.80122 36.0677 12.1532 36.161 15.5319 36.1797C15.6792 36.1541 15.8128 36.0774 15.9091 35.963C16.0053 35.8486 16.0581 35.7038 16.0581 35.5543C16.0581 35.4048 16.0053 35.2601 15.9091 35.1457C15.8128 35.0313 15.6792 34.9545 15.5319 34.929C12.8252 34.7983 6.75856 34.3877 4.33189 33.0623C3.62256 32.6703 3.51056 33.417 3.08122 22.1797C2.91322 17.793 2.76389 14.5823 2.72656 10.6437C2.81989 10.289 2.87589 4.07299 3.11856 2.72899Z" fill="#17183B" />
                      <path d="M36.6029 8.94409C27.6989 8.94409 23.0695 7.93609 4.45885 8.94409C4.34321 8.95858 4.23532 9.01 4.15124 9.09072C4.06716 9.17144 4.01138 9.27713 3.99219 9.39209V9.59743C4.01473 9.7226 4.08214 9.83526 4.1818 9.9143C4.28145 9.99333 4.4065 10.0333 4.53352 10.0268C10.6002 9.91476 12.1309 11.0721 36.6215 10.0268C36.7162 10.0761 36.8221 10.0999 36.9288 10.0959C37.0354 10.092 37.1393 10.0604 37.23 10.0042C37.3208 9.94805 37.3955 9.86926 37.4466 9.77556C37.4978 9.68186 37.5237 9.57648 37.5219 9.46974C37.52 9.36301 37.4905 9.25858 37.4361 9.1667C37.3818 9.07483 37.3045 8.99865 37.2118 8.94565C37.1191 8.89265 37.0143 8.86464 36.9075 8.86436C36.8008 8.86409 36.6958 8.89157 36.6029 8.94409Z" fill="#17183B" />
                      <path d="M5.09934 2.35558C10.3633 2.07558 37.0753 2.76625 38.1207 3.64358C38.7927 4.20358 39.1287 9.56092 39.3153 11.1103C39.6513 13.9849 39.9127 16.4676 40.062 19.3796C40.0858 19.5083 40.1539 19.6245 40.2545 19.7082C40.3551 19.7919 40.4818 19.8378 40.6127 19.8378C40.7435 19.8378 40.8703 19.7919 40.9709 19.7082C41.0714 19.6245 41.1395 19.5083 41.1633 19.3796C41.1633 16.7289 40.9953 13.6116 40.8087 10.9983C40.622 8.38492 40.8087 3.53158 39.4087 2.26225C36.7393 -0.25775 9.22468 0.731584 5.00601 1.10492C4.85861 1.13933 4.72837 1.22528 4.63877 1.34727C4.54917 1.46926 4.50612 1.61926 4.51739 1.7702C4.52865 1.92114 4.59349 2.06308 4.7002 2.17042C4.80691 2.27776 4.94847 2.34343 5.09934 2.35558Z" fill="#17183B" />
                      <path d="M7.09686 6.5359C7.22907 6.67194 7.38723 6.78008 7.56197 6.85392C7.73671 6.92776 7.92449 6.96581 8.11419 6.96581C8.30389 6.96581 8.49167 6.92776 8.66641 6.85392C8.84115 6.78008 8.99931 6.67194 9.13153 6.5359C9.29249 6.26054 9.34718 5.93582 9.28529 5.62292C9.2234 5.31003 9.0492 5.03058 8.79552 4.83723C7.52619 4.10923 5.95819 5.39723 7.09686 6.5359Z" fill="#9B2E60" />
                      <path d="M11.4638 6.08926C11.5963 6.22818 11.7556 6.33877 11.932 6.41433C12.1085 6.4899 12.2985 6.52886 12.4904 6.52886C12.6824 6.52886 12.8724 6.4899 13.0489 6.41433C13.2253 6.33877 13.3846 6.22818 13.5171 6.08926C13.69 5.80755 13.7514 5.47142 13.6892 5.1468C13.627 4.82218 13.4458 4.5325 13.1811 4.33459C11.8931 3.64392 10.3251 4.93192 11.4638 6.08926Z" fill="#9B2E60" />
                      <path d="M16.245 6.08926C16.3775 6.22818 16.5368 6.33877 16.7133 6.41433C16.8898 6.4899 17.0797 6.52886 17.2717 6.52886C17.4637 6.52886 17.6536 6.4899 17.8301 6.41433C18.0066 6.33877 18.1659 6.22818 18.2984 6.08926C18.4756 5.80878 18.5395 5.47139 18.4771 5.14553C18.4147 4.81967 18.2307 4.52975 17.9624 4.33459C16.6744 3.64392 15.1064 4.93192 16.245 6.08926Z" fill="#9B2E60" />
                      <path d="M44.6895 41.4809C43.2621 38.9239 41.6263 36.489 39.7988 34.2009C45.6788 24.8675 33.3401 15.2542 24.0815 22.3662C22.1669 23.7623 20.8304 25.8117 20.3247 28.1267C19.8191 30.4416 20.1794 32.8616 21.3375 34.9289C24.1375 39.4649 29.6255 40.5289 29.5321 38.9795C29.5274 38.9084 29.5086 38.8389 29.477 38.775C29.4453 38.7111 29.4013 38.6541 29.3475 38.6073C29.2937 38.5605 29.2313 38.5247 29.1636 38.5021C29.096 38.4795 29.0246 38.4705 28.9535 38.4755C26.3401 38.6062 23.7455 36.1982 22.6255 34.1822C21.7733 32.447 21.5761 30.4626 22.0699 28.5936C22.5637 26.7247 23.7155 25.0967 25.3135 24.0089C30.6895 20.0515 37.9695 22.4595 39.3508 27.7422C40.5641 32.3529 36.6441 36.8515 32.6495 38.2515C32.4935 38.3035 32.3646 38.4153 32.2911 38.5624C32.2176 38.7094 32.2055 38.8796 32.2575 39.0355C32.3094 39.1915 32.4212 39.3204 32.5683 39.3939C32.7153 39.4674 32.8855 39.4795 33.0415 39.4275C33.837 39.1728 34.6011 38.8284 35.3188 38.4009C36.0095 39.3715 37.7828 41.7982 37.9508 42.1342C41.7961 47.6409 46.0708 45.4009 44.6895 41.4809ZM42.8228 43.3475C41.4415 44.0569 37.4841 39.2409 36.2335 37.8409C37.2395 37.1479 38.1388 36.3115 38.9028 35.3582C39.4815 36.1795 43.7935 42.7875 42.8601 43.2729L42.8228 43.3475Z" fill="#17183B" />
                    </g>
                    <defs>
                      <clipPath id="clip0_215_1328">
                        <rect width="44.8" height="44.8" fill="white" transform="translate(0.601562 0.599609)" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              <div data-layer="Label-text" className="LabelText w-44 left-[31px] top-[96px] absolute text-center justify-start text-[#0a0a19] text-sm font-medium font-['Inter'] leading-tight">
                No search results found for “{searchTerm}”
              </div>
            </div>
          ) : null)}
        </>
      )}
    </div>
  )
}
