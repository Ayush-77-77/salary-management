import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { errorMessages } from '../api/client'

export default function useRequest(request) {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ request: null, reloadCount: null, data: null, error: null })

  useEffect(() => {
    if (!request) return

    const controller = new AbortController()

    request(controller.signal)
      .then((data) => setResult({ request, reloadCount, data, error: null }))
      .catch((error) => {
        if (axios.isCancel(error)) return
        setResult((previous) => ({ ...previous, request, reloadCount, error: errorMessages(error).join(', ') }))
      })

    return () => controller.abort()
  }, [request, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  const loading = Boolean(request) && (result.request !== request || result.reloadCount !== reloadCount)

  return { data: result.data, error: result.error, loading, reload }
}
