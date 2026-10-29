import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCurrentUser, login as loginRequest } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import { AuthContext } from './AuthContext'
import { clearToken, getToken, setToken } from './tokenStorage'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await loginRequest(email, password)
    setToken(token)
    setUser(loggedInUser)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    if (!getToken()) return

    fetchCurrentUser()
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false))
  }, [logout])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}
