import client from './client'

export function buildSearchParams({ page, perPage, search, countryId, departmentId, jobTitle, sort }) {
  return {
    page,
    per_page: perPage,
    q: {
      full_name_or_email_i_cont: search || undefined,
      country_id_eq: countryId,
      department_id_eq: departmentId,
      job_title_eq: jobTitle,
      s: sort,
    },
  }
}

export async function fetchEmployees(query, { signal } = {}) {
  const { data } = await client.get('/employees', { params: buildSearchParams(query), signal })
  return data
}

export async function createEmployee(attributes) {
  const { data } = await client.post('/employees', { employee: attributes })
  return data.employee
}

export async function updateEmployee(id, attributes) {
  const { data } = await client.patch(`/employees/${id}`, { employee: attributes })
  return data.employee
}

export async function deleteEmployee(id) {
  await client.delete(`/employees/${id}`)
}
