import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useRequest from './useRequest'

describe('useRequest', () => {
  it('returns the data once the request resolves', async () => {
    const request = vi.fn().mockResolvedValue(['India'])
    const { result } = renderHook(() => useRequest(request))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(['India'])
  })

  it('returns the API error message', async () => {
    const request = vi.fn().mockRejectedValue({ response: { data: { errors: ['Country not found'] } } })
    const { result } = renderHook(() => useRequest(request))

    await waitFor(() => expect(result.current.error).toBe('Country not found'))
    expect(result.current.loading).toBe(false)
  })

  it('aborts the previous request when the request changes', async () => {
    const signals = []
    const first = vi.fn((signal) => {
      signals.push(signal)
      return new Promise(() => {})
    })
    const second = vi.fn().mockResolvedValue('second')
    const { result, rerender } = renderHook(({ request }) => useRequest(request), { initialProps: { request: first } })

    rerender({ request: second })

    await waitFor(() => expect(result.current.data).toBe('second'))
    expect(signals.every((signal) => signal.aborted)).toBe(true)
  })

  it('does nothing without a request', () => {
    const { result } = renderHook(() => useRequest(null))

    expect(result.current).toMatchObject({ data: null, loading: false, error: null })
  })

  it('runs the request again on reload', async () => {
    const request = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second')
    const { result } = renderHook(() => useRequest(request))
    await waitFor(() => expect(result.current.data).toBe('first'))

    act(() => result.current.reload())

    await waitFor(() => expect(result.current.data).toBe('second'))
  })
})
