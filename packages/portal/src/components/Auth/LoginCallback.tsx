import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../contexts/StoreContext'

export const LoginCallback = observer(() => {
  const { authStore } = useStores()
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await authStore.loadUserData()
        navigate('/', { replace: true })
      } catch (error) {
        console.error('Login callback error:', error)
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [authStore, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Completing login...</div>
    </div>
  )
})

