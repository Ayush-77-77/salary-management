import { Spin } from 'antd'
import { Navigate, useLocation } from 'react-router'
import useAuth from './useAuth'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spin fullscreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return children
}
