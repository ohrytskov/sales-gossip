import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/home/Logo'
import { useAuth } from '@/hooks/useAuth'
import { useGlobal } from '@/hooks/useGlobal'
import Search from '@/components/home/Search'
import FloatingInput from '@/components/FloatingInput'
import Menu from '@/components/home/Menu'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useRouter } from 'next/router'
import CreatePostModal from '@/components/CreatePostModal'
import HelpCenterModal from '@/components/HelpCenterModal'
import Notifications from '@/components/notifications'
import SearchDropdown from '@/components/SearchDropdown'
import useNotifications from '@/hooks/useNotifications'
import { getUser } from '@/firebase/rtdb/users'

export default function Header() {
  const [selectedTab, setSelectedTab] = useState('gossips')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const { user, loading } = useAuth()
  const { showToast } = useGlobal()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHelpCenter, setShowHelpCenter] = useState(false)
  const { unreadCount } = useNotifications(user?.uid)
  const bellButtonRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const path = router.pathname === '/' ? 'gossips' : router.pathname.slice(1)
    setSelectedTab(path)
  }, [router.pathname])

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSearchDropdown(false)
      }
    }
    if (showUserMenu || showSearchDropdown) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showUserMenu, showSearchDropdown])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setShowUserMenu(false)
      // redirect to login page after sign out
      try { router.push('/login') } catch (e) { /* ignore */ }
    } catch (e) {
      console.error('Failed to log out', e)
    }
  }

  const handleCreateClick = async () => {
    if (!user?.uid) return
    try {
      const userData = await getUser(user.uid)
      if (userData?.public?.isBanned) {
        showToast('Your account has been banned and you cannot create posts.')
        return
      }
      setShowCreate(true)
    } catch (error) {
      console.error('Error checking ban status:', error)
      showToast('Error checking account status. Please try again.')
    }
  }

  return (
    <>
      <header className="w-full bg-white border-b border-gray-300">
      <div className="max-w-[1440px] mx-auto w-full min-h-[72px] px-[142px] flex items-center justify-between">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-pink-700 text-xl font-black">SalesGossip</span>
        </div>
        <div className="relative" ref={searchInputRef}>
          <FloatingInput
            id="home-search"
            value={searchQuery}
            onChange={setSearchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            label="Search Gossips"
            className="bg-zinc-100 rounded-full inline-flex justify-start items-center gap-2 overflow-hidden px-4"
            rounded="full"
            style={{ width: '328px', height: '40px', outline: 'none', boxShadow: 'none' }}
            inputProps={{
              className: "text-zinc-400 text-base font-normal leading-none",
              'aria-label': 'Search Gossips'
            }}
            rightElement={<Search />}
          />
          <SearchDropdown isOpen={showSearchDropdown} searchQuery={searchQuery} />
        </div>
      </div>

      {/* Middle: Nav Menu */}
      <Menu selectedTab={selectedTab} onSelect={setSelectedTab} />

      {/* Right side: If logged in show actions, else show Login */}
      {user ? (
        <div className="flex items-center gap-4">
          <div className="h-6 w-px bg-gray-300" />
          <button
            type="button"
            onClick={handleCreateClick}
            className="h-10 px-5 py-2 bg-white rounded-full outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-center items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9.375 15.833V4.167a.625.625 0 1 1 1.25 0v11.666a.625.625 0 1 1-1.25 0Z" fill="#AA336A"/>
              <path d="M15.833 9.375a.625.625 0 1 1 0 1.25H4.167a.625.625 0 1 1 0-1.25h11.666Z" fill="#AA336A"/>
            </svg>
            <span className="text-pink-700 text-sm font-semibold">Create</span>
          </button>
          <button
            ref={bellButtonRef}
            type="button"
            onClick={() => setShowNotifications((s) => !s)}
            className="relative w-10 h-10 rounded-full bg-white outline outline-1 outline-gray-300 flex items-center justify-center"
            aria-haspopup="dialog"
            aria-expanded={showNotifications}
          >
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 3a2 2 0 1 1 4 0c1.148.543 2.127 1.388 2.832 2.445.705 1.057 1.109 2.286 1.168 3.555V12c.075.622.295 1.217.642 1.738.347.521.812.953 1.357 1.262H1c.545-.309 1.01-.741 1.357-1.262.347-.521.567-1.116.643-1.738V9c.06-1.269.464-2.498 1.168-3.555C4.872 4.388 5.851 3.543 7 3Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-700 text-white text-xs leading-4 text-center flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-sm font-semibold overflow-hidden"
              onClick={() => setShowUserMenu((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={showUserMenu}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                (user.displayName || user.email || 'U').slice(0,1).toUpperCase()
              )}
            </button>
{showUserMenu && (
  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-md py-1 z-50">
    <Link
      href="/settings"
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-900 hover:bg-gray-50"
      onClick={() => setShowUserMenu(false)}
    >
      <span className="w-5 h-5 inline-flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g clipPath="url(#clip0_407_12611)">
            <path d="M6.88333 2.878C7.16733 1.70733 8.83267 1.70733 9.11667 2.878C9.15928 3.05387 9.24281 3.21719 9.36047 3.35467C9.47813 3.49215 9.62659 3.5999 9.79377 3.66916C9.96094 3.73843 10.1421 3.76723 10.3225 3.75325C10.5029 3.73926 10.6775 3.68287 10.832 3.58867C11.8607 2.962 13.0387 4.13933 12.412 5.16867C12.3179 5.3231 12.2616 5.49756 12.2477 5.67785C12.2337 5.85814 12.2625 6.03918 12.3317 6.20625C12.4009 6.37333 12.5085 6.52172 12.6458 6.63937C12.7831 6.75702 12.9463 6.8406 13.122 6.88333C14.2927 7.16733 14.2927 8.83267 13.122 9.11667C12.9461 9.15928 12.7828 9.24281 12.6453 9.36047C12.5079 9.47813 12.4001 9.62659 12.3308 9.79377C12.2616 9.96094 12.2328 10.1421 12.2468 10.3225C12.2607 10.5029 12.3171 10.6775 12.4113 10.832C13.038 11.8607 11.8607 13.0387 10.8313 12.412C10.6769 12.3179 10.5024 12.2616 10.3222 12.2477C10.1419 12.2337 9.96082 12.2625 9.79375 12.3317C9.62667 12.4009 9.47828 12.5085 9.36063 12.6458C9.24298 12.7831 9.1594 12.9463 9.11667 13.122C8.83267 14.2927 7.16733 14.2927 6.88333 13.122C6.84072 12.9461 6.75719 12.7828 6.63953 12.6453C6.52187 12.5079 6.37341 12.4001 6.20623 12.3308C6.03906 12.2616 5.85789 12.2328 5.67748 12.2468C5.49706 12.2607 5.3225 12.3171 5.168 12.4113C4.13933 13.038 2.96133 11.8607 3.588 10.8313C3.68207 10.6769 3.73837 10.5024 3.75232 10.3222C3.76628 10.1419 3.7375 9.96082 3.66831 9.79375C3.59913 9.62667 3.49151 9.47828 3.35418 9.36063C3.21686 9.24298 3.05371 9.1594 2.878 9.11667C1.70733 8.83267 1.70733 7.16733 2.878 6.88333C3.05387 6.84072 3.21719 6.75719 3.35467 6.63953C3.49215 6.52187 3.5999 6.37341 3.66916 6.20623C3.73843 6.03906 3.76723 5.85789 3.75325 5.67748C3.73926 5.49706 3.68287 5.3225 3.58867 5.168C2.962 4.13933 4.13933 2.96133 5.16867 3.588C5.83533 3.99333 6.69933 3.63467 6.88333 2.878Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 8C6 8.53043 6.21071 9.03914 6.58579 9.41421C6.96086 9.78929 7.46957 10 8 10C8.53043 10 9.03914 9.78929 9.41421 9.41421C9.78929 9.03914 10 8.53043 10 8C10 7.46957 9.78929 6.96086 9.41421 6.58579C9.03914 6.21071 8.53043 6 8 6C7.46957 6 6.96086 6.21071 6.58579 6.58579C6.21071 6.96086 6 7.46957 6 8Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <defs>
            <clipPath id="clip0_407_12611">
              <rect width="16" height="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </span>
      <span className="flex-1 text-left">Settings</span>
    </Link>

    <button
      type="button"
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-900 hover:bg-gray-50"
      onClick={() => setShowUserMenu(false)}
    >
      <span className="w-5 h-5 inline-flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g clipPath="url(#clip0_407_12617)">
            <path d="M13.0009 8.38047L8.00085 13.3325L3.00085 8.38047C2.67106 8.05955 2.41128 7.67382 2.23788 7.24757C2.06449 6.82131 1.98123 6.36378 1.99334 5.90376C2.00546 5.44375 2.11269 4.99123 2.30829 4.5747C2.50389 4.15817 2.78361 3.78664 3.12984 3.48353C3.47608 3.18041 3.88132 2.95227 4.32006 2.81346C4.7588 2.67466 5.22152 2.6282 5.6791 2.67701C6.13667 2.72582 6.57918 2.86885 6.97877 3.09708C7.37835 3.32531 7.72635 3.63381 8.00085 4.00314C8.27654 3.63649 8.62494 3.33069 9.02425 3.10488C9.42356 2.87907 9.86518 2.73811 10.3215 2.69082C10.7778 2.64353 11.2389 2.69094 11.676 2.83007C12.1132 2.9692 12.5169 3.19706 12.8619 3.49938C13.2069 3.80171 13.4858 4.172 13.6811 4.58707C13.8765 5.00214 13.984 5.45306 13.9971 5.91161C14.0101 6.37016 13.9284 6.82647 13.7569 7.25197C13.5855 7.67748 13.3281 8.06302 13.0009 8.38447" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <defs>
            <clipPath id="clip0_407_12617">
              <rect width="16" height="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </span>
      <span className="flex-1 text-left">Liked posts</span>
    </button>

    <button
      type="button"
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-900 hover:bg-gray-50"
      onClick={() => {
        setShowUserMenu(false)
        setShowHelpCenter(true)
      }}
    >
      <span className="w-5 h-5 inline-flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g clipPath="url(#clip0_407_12622)">
          
          <path d="M5.33398 5.33203C5.33398 4.8016 5.57982 4.29289 6.0174 3.91782C6.45499 3.54274 7.04848 3.33203 7.66732 3.33203H8.33398C8.95282 3.33203 9.54632 3.54274 9.9839 3.91782C10.4215 4.29289 10.6673 4.8016 10.6673 5.33203C10.6919 5.76487 10.5751 6.19396 10.3346 6.55468C10.0941 6.9154 9.74297 7.18822 9.33398 7.33203C8.925 7.52378 8.57382 7.88754 8.33334 8.3685C8.09286 8.84946 7.9761 9.42158 8.00065 9.9987" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12.668V12.6746" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
          <clipPath id="clip0_407_12622">
            <rect width="16" height="16" fill="white"/>
          </clipPath>
        </defs>
        </svg>
      </span>
      <span className="flex-1 text-left">Help center</span>
    </button>

    <div className="border-t mt-1" />

    <button
      className="w-full text-left px-4 py-2 text-sm text-slate-900 hover:bg-gray-50"
      onClick={handleLogout}
    >
      Log out
    </button>
  </div>
)}
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
            style={{ visibility: loading ? 'hidden' : 'visible' }}
          >
            Log in
          </Link>
        )}
      </div>
      </header>
      <Notifications open={showNotifications} onClose={() => setShowNotifications(false)} bellButtonRef={bellButtonRef} />
      <CreatePostModal open={showCreate} onClose={() => setShowCreate(false)} />
      <HelpCenterModal open={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
    </>
  )
}
