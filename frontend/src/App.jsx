import { Spin } from 'antd'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'
import AppLayout from './layouts/AppLayout'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'))
const InsightsPage = lazy(() => import('./pages/InsightsPage'))

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Spin fullscreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
