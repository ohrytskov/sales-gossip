import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGlobal } from '@/hooks/useGlobal'
import FloatingInput from '@/components/FloatingInput'
import CreatePostModal from '@/components/CreatePostModal'
import { getUser } from '@/firebase/rtdb/users'

export default function Toolbar() {
  const { user } = useAuth()
  const { showToast } = useGlobal()
  const [searchValue, setSearchValue] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handlePostClick = async () => {
    if (!user?.uid) return
    try {
      const userData = await getUser(user.uid)
      if (userData?.public?.isBanned) {
        showToast('Your account has been banned and you cannot create posts.')
        return
      }
      setShowModal(true)
    } catch (error) {
      console.error('Error checking ban status:', error)
      showToast('Error checking account status. Please try again.')
    }
  }

  return (
    <>
      <div data-layer="Toolbar" className="Toolbar w-[684px] h-24 relative bg-[#f7ebf0] rounded-xl outline outline-1 outline-offset-[-1px] outline-[#aa336a] overflow-hidden">
        <img
          data-layer="Avatar"
          className="Avatar h-12 w-12 left-[24px] top-[24px] absolute rounded-full border border-[#e8e8eb]"
          src={user?.photoURL || 'https://placehold.co/48x48'}
          alt={user?.displayName || 'User avatar'}
        />
        <button
          data-layer="Primary Button"
          onClick={handlePostClick}
          className="PrimaryButton h-12 px-4 py-2 left-[597px] top-[24px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">Post</div>
        </button>
        <div data-layer="Search" className="Search absolute left-[88px] top-[24px] w-[477px]">
          <FloatingInput
            id="search-input"
            type="text"
            value={searchValue}
            onChange={setSearchValue}
            label="Start a post"
            rounded="full"
            className="!h-12"
            errorOutlineClass="outline-[#b7b7c2]"
            errorLabelClass="text-[#64647c]"
          />
        </div>
      </div>
      <CreatePostModal open={showModal} onClose={() => setShowModal(false)} initialBody={searchValue} />
    </>
  )
}
