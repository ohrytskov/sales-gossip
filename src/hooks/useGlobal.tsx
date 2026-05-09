import { createContext, ReactNode, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

type Toast = {
  message: string
  type: ToastType
}

type GlobalContextValue = {
  userId: string | null
  setUserId: (value: string | null) => void
  toast: Toast | null
  showToast: (message: string, type?: ToastType) => void
  hideToast: () => void
}

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined)

const useGlobal = (): GlobalContextValue => {
  const context = useContext(GlobalContext)
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider')
  }
  return context
}

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const hideToast = () => setToast(null)

  return (
    <GlobalContext.Provider value={{ userId, setUserId, toast, showToast, hideToast }}>
      {children}
    </GlobalContext.Provider>
  )
}

export { GlobalProvider, useGlobal }
