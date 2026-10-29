import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentUser, login } from './api/auth'
import { setToken } from './auth/tokenStorage'
import renderApp from './test/renderApp'

vi.mock('./api/auth', () => ({
  login: vi.fn(),
  fetchCurrentUser: vi.fn(),
}))

const hrUser = { id: 1, email: 'hr@acme.test' }

describe('App authentication flow', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects to the login page when not signed in', async () => {
    renderApp('/insights')

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('signs in and returns to the page the user asked for', async () => {
    login.mockResolvedValue({ token: 'jwt-token', user: hrUser })
    renderApp('/insights')

    await userEvent.type(await screen.findByLabelText('Email'), 'hr@acme.test')
    await userEvent.type(screen.getByLabelText('Password'), 'pass@acme')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Salary Insights' })).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith('hr@acme.test', 'pass@acme')
    expect(localStorage.getItem('token')).toBe('jwt-token')
  })

  it('shows the API error for wrong credentials', async () => {
    login.mockRejectedValue({ response: { data: { errors: ['Invalid email or password'] } } })
    renderApp('/login')

    await userEvent.type(await screen.findByLabelText('Email'), 'hr@acme.test')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('restores the session from a saved token', async () => {
    setToken('saved-token')
    fetchCurrentUser.mockResolvedValue(hrUser)

    renderApp('/employees')

    expect(await screen.findByRole('heading', { name: 'Employees' })).toBeInTheDocument()
    expect(screen.getByText('hr@acme.test')).toBeInTheDocument()
  })

  it('drops an expired saved token and shows the login page', async () => {
    setToken('expired-token')
    fetchCurrentUser.mockRejectedValue({ response: { status: 401 } })

    renderApp('/employees')

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('logs out', async () => {
    setToken('saved-token')
    fetchCurrentUser.mockResolvedValue(hrUser)
    renderApp('/employees')

    await userEvent.click(await screen.findByRole('button', { name: 'Log out' }))

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })
})
