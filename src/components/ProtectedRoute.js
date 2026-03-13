import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import PageState from '@/components/PageState'
import { buildLoginHref } from '@/utils/authRedirect'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const loginHref = buildLoginHref(router.asPath)

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginHref)
    }
  }, [user, loading, router, loginHref])

  if (loading) {
    return (
      <PageState
        loading
        title="Checking your session"
        description="Please wait while we load your account."
      />
    )
  }

  if (!user) {
    return (
      <PageState
        title="Log in to continue"
        description="This page is available after you log in."
        actionHref={loginHref}
        actionLabel="Log in"
      />
    )
  }

  return children
}

export default ProtectedRoute
