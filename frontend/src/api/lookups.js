import client from './client'

export async function fetchCountries() {
  const { data } = await client.get('/countries')
  return data.countries
}

export async function fetchDepartments() {
  const { data } = await client.get('/departments')
  return data.departments
}

export async function fetchJobTitles() {
  const { data } = await client.get('/job_titles')
  return data.job_titles
}
