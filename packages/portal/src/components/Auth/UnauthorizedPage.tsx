import { useNavigate } from 'react-router-dom'

export const UnauthorizedPage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-50">
      <div className="bg-white rounded-lg shadow-card p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-danger-600 mb-4">
          Access Denied
        </h1>
        <p className="text-dark-600 mb-6">
          You don't have permission to access this resource.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

