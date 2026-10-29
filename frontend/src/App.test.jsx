import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'ACME Salary Management' })).toBeInTheDocument()
  })
})
