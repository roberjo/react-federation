import { observer } from 'mobx-react-lite'
import { useStores } from '../../contexts/StoreContext'

export const LoginPage = observer(() => {
  const { authStore } = useStores()

  const handleLogin = () => {
    authStore.login()
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-50">
      <div className="bg-white rounded-lg shadow-card p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">
          Financial Services Portal
        </h1>
        <p className="text-dark-600 mb-6">
          Sign in to access your account
        </p>
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Sign In
        </button>
        <p className="text-sm text-dark-500 mt-4 text-center">
          Use: trader@example.com, compliance@example.com, sales@example.com, or admin@example.com
        </p>
      </div>
    </div>
  )
})

