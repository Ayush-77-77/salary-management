import { useCallback, useEffect, useState } from 'react'
import { errorMessages } from '../api/client'
import { fetchCountries, fetchDepartments, fetchJobTitles } from '../api/lookups'

export default function useLookups() {
  const [lookups, setLookups] = useState({ countries: [], departments: [], jobTitles: [] })
  const [error, setError] = useState(null)

  const handleError = useCallback((requestError) => setError(errorMessages(requestError).join(', ')), [])

  useEffect(() => {
    Promise.all([fetchCountries(), fetchDepartments(), fetchJobTitles()])
      .then(([countries, departments, jobTitles]) => setLookups({ countries, departments, jobTitles }))
      .catch(handleError)
  }, [handleError])

  const reloadJobTitles = useCallback(() => {
    fetchJobTitles()
      .then((jobTitles) => setLookups((previous) => ({ ...previous, jobTitles })))
      .catch(handleError)
  }, [handleError])

  return { ...lookups, error, reloadJobTitles }
}
