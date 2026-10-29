import client from './client'

export async function fetchSummary(signal) {
  const { data } = await client.get('/insights/summary', { signal })
  return data.summary
}

export async function fetchCountryStats(signal) {
  const { data } = await client.get('/insights/countries', { signal })
  return data.countries
}

export async function fetchJobTitleStats(countryId, signal) {
  const { data } = await client.get('/insights/job_titles', { params: { country_id: countryId }, signal })
  return data
}
