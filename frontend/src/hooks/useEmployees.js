import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { errorMessages } from '../api/client'
import { fetchEmployees } from '../api/employees'

export default function useEmployees(query) {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ query: null, reloadCount: null, employees: [], meta: null, error: null })

  useEffect(() => {
    const controller = new AbortController()

    fetchEmployees(query, { signal: controller.signal })
      .then(({ employees, meta }) => setResult({ query, reloadCount, employees, meta, error: null }))
      .catch((error) => {
        if (axios.isCancel(error)) return
        setResult((previous) => ({ ...previous, query, reloadCount, error: errorMessages(error).join(', ') }))
      })

    return () => controller.abort()
  }, [query, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  const loading = result.query !== query || result.reloadCount !== reloadCount

  return { employees: result.employees, meta: result.meta, error: result.error, loading, reload }
}
