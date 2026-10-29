import { useCallback } from 'react'
import { fetchEmployees } from '../api/employees'
import useRequest from './useRequest'

export default function useEmployees(query) {
  const request = useCallback((signal) => fetchEmployees(query, { signal }), [query])
  const { data, error, loading, reload } = useRequest(request)

  return { employees: data?.employees ?? [], meta: data?.meta ?? null, error, loading, reload }
}
