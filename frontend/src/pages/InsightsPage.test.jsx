import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCountryStats, fetchJobTitleStats, fetchSummary } from '../api/insights'
import InsightsPage from './InsightsPage'

vi.mock('../api/insights', () => ({
  fetchSummary: vi.fn(),
  fetchCountryStats: vi.fn(),
  fetchJobTitleStats: vi.fn(),
}))

const india = { country_id: 1, name: 'India', code: 'IN', currency: 'INR' }
const usa = { country_id: 2, name: 'United States', code: 'US', currency: 'USD' }

function stats(headcount, min, average, max) {
  return { headcount, min_salary: min, average_salary: average, max_salary: max }
}

function jobTitlesFor(country, rows) {
  return { country: { id: country.country_id, name: country.name, currency: country.currency }, job_titles: rows }
}

describe('InsightsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    fetchSummary.mockResolvedValue({ total_employees: 10000, total_countries: 8, total_departments: 8 })
    fetchCountryStats.mockResolvedValue([
      { ...india, ...stats(2414, '1010000.0', '2588074.0', '5619300.0') },
      { ...usa, ...stats(2602, '40100.0', '102582.4', '224900.0') },
    ])
    fetchJobTitleStats.mockImplementation(async (countryId) =>
      countryId === india.country_id
        ? jobTitlesFor(india, [{ job_title: 'Engineering Manager', ...stats(184, '3607700.0', '4648067.4', '5619300.0') }])
        : jobTitlesFor(usa, [{ job_title: 'Account Executive', ...stats(390, '64000.0', '80100.0', '100000.0') }]),
    )
  })

  it('shows the org summary', async () => {
    render(<InsightsPage />)

    expect(await screen.findByText('10,000')).toBeInTheDocument()
    expect(screen.getAllByText('8')).toHaveLength(2)
  })

  it('shows salary stats per country in local currency', async () => {
    render(<InsightsPage />)

    const indiaRow = (await screen.findByRole('cell', { name: 'India' })).closest('tr')
    expect(within(indiaRow).getByText('INR 2,588,074')).toBeInTheDocument()

    const usaRow = screen.getByRole('cell', { name: 'United States' }).closest('tr')
    expect(within(usaRow).getByText('USD 102,582')).toBeInTheDocument()
  })

  it('drills into the first country by default', async () => {
    render(<InsightsPage />)

    expect(await screen.findByText('Engineering Manager')).toBeInTheDocument()
    expect(screen.getByText('INR 4,648,067')).toBeInTheDocument()
    expect(fetchJobTitleStats).toHaveBeenCalledWith(india.country_id, expect.any(AbortSignal))
  })

  it('switches the drill-down to the chosen country', async () => {
    render(<InsightsPage />)
    await screen.findByText('Engineering Manager')

    const usaRow = screen.getByRole('cell', { name: 'United States' }).closest('tr')
    await userEvent.click(within(usaRow).getByRole('button', { name: 'View job titles' }))

    expect(await screen.findByText('Account Executive')).toBeInTheDocument()
    expect(screen.getByText('USD 80,100')).toBeInTheDocument()
    expect(screen.queryByText('Engineering Manager')).not.toBeInTheDocument()
  })

  it('shows an error when the insights cannot be loaded', async () => {
    fetchCountryStats.mockRejectedValue({ response: { data: { errors: ['Unauthorized'] } } })

    render(<InsightsPage />)

    await waitFor(() => expect(screen.getByText('Unauthorized')).toBeInTheDocument())
  })
})
