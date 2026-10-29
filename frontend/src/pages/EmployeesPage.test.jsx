import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App as AntApp } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmployee, deleteEmployee, fetchEmployees, updateEmployee } from '../api/employees'
import { fetchCountries, fetchDepartments, fetchJobTitles } from '../api/lookups'
import EmployeesPage from './EmployeesPage'

vi.mock('../api/employees', () => ({
  fetchEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}))

vi.mock('../api/lookups', () => ({
  fetchCountries: vi.fn(),
  fetchDepartments: vi.fn(),
  fetchJobTitles: vi.fn(),
}))

const india = { id: 1, name: 'India', code: 'IN', currency: 'INR' }
const usa = { id: 2, name: 'United States', code: 'US', currency: 'USD' }
const engineering = { id: 1, name: 'Engineering' }

const asha = {
  id: 10,
  full_name: 'Asha Rao',
  email: 'asha@acme.test',
  job_title: 'Software Engineer',
  salary: '2400000.0',
  hire_date: '2021-03-01',
  country: india,
  department: engineering,
}

function lastQuery() {
  return fetchEmployees.mock.calls.at(-1)[0]
}

function renderPage() {
  return render(
    <AntApp>
      <EmployeesPage />
    </AntApp>,
  )
}

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    fetchEmployees.mockResolvedValue({
      employees: [asha],
      meta: { page: 1, per_page: 25, total_count: 1, total_pages: 1 },
    })
    fetchCountries.mockResolvedValue([india, usa])
    fetchDepartments.mockResolvedValue([engineering])
    fetchJobTitles.mockResolvedValue(['Software Engineer'])
  })

  it('lists employees with salary in their local currency', async () => {
    renderPage()

    expect(await screen.findByText('Asha Rao')).toBeInTheDocument()
    expect(screen.getByText('₹2,400,000')).toBeInTheDocument()
    expect(screen.getByText('1 Mar 2021')).toBeInTheDocument()
    expect(screen.getByText('1 employees')).toBeInTheDocument()
  })

  it('searches by name or email from the first page', async () => {
    renderPage()
    await screen.findByText('Asha Rao')

    await userEvent.type(screen.getByPlaceholderText('Search name or email'), '  asha {enter}')

    await waitFor(() => expect(lastQuery()).toMatchObject({ search: 'asha', page: 1 }))
  })

  it('filters by country', async () => {
    renderPage()
    await screen.findByText('Asha Rao')

    await userEvent.click(screen.getAllByRole('combobox')[0])
    await userEvent.click(await screen.findByTitle('United States'))

    await waitFor(() => expect(lastQuery()).toMatchObject({ countryId: usa.id, page: 1 }))
  })

  it('sorts by salary on the server', async () => {
    renderPage()
    await screen.findByText('Asha Rao')

    await userEvent.click(screen.getByRole('columnheader', { name: /Salary/ }))

    await waitFor(() => expect(lastQuery()).toMatchObject({ sort: 'salary asc' }))
  })

  it('shows required field errors and does not submit an empty form', async () => {
    renderPage()
    await screen.findByText('Asha Rao')

    await userEvent.click(screen.getByRole('button', { name: 'Add employee' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add employee' }))

    expect(await within(dialog).findByText("'full_name' is required")).toBeInTheDocument()
    expect(createEmployee).not.toHaveBeenCalled()
  })

  it('edits an employee and reloads the list', async () => {
    updateEmployee.mockResolvedValue({ ...asha, salary: '2600000.0' })
    renderPage()
    await screen.findByText('Asha Rao')

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')
    const salary = within(dialog).getByLabelText('Annual salary')
    await userEvent.clear(salary)
    await userEvent.type(salary, '2600000')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(updateEmployee).toHaveBeenCalledWith(10, {
        full_name: 'Asha Rao',
        email: 'asha@acme.test',
        job_title: 'Software Engineer',
        department_id: 1,
        country_id: 1,
        salary: 2600000,
        hire_date: '2021-03-01',
      }),
    )
    expect(await screen.findByText('Asha Rao updated')).toBeInTheDocument()
    expect(fetchEmployees).toHaveBeenCalledTimes(2)
  })

  it('shows the API validation errors in the form', async () => {
    updateEmployee.mockRejectedValue({ response: { data: { errors: ['Email has already been taken'] } } })
    renderPage()
    await screen.findByText('Asha Rao')

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))

    expect(await within(dialog).findByText('Email has already been taken')).toBeInTheDocument()
  })

  it('deletes an employee after confirmation', async () => {
    deleteEmployee.mockResolvedValue()
    renderPage()
    await screen.findByText('Asha Rao')

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const confirmation = (await screen.findByText('Delete Asha Rao?')).closest('.ant-popover')
    await userEvent.click(within(confirmation).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteEmployee).toHaveBeenCalledWith(10))
    expect(await screen.findByText('Asha Rao deleted')).toBeInTheDocument()
  })
})
