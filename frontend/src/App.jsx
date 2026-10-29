import { Navigate, Route, Routes } from 'react-router'
import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'
import AppLayout from './layouts/AppLayout'
import EmployeesPage from './pages/EmployeesPage'
import InsightsPage from './pages/InsightsPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}
