import { afterEach, describe, expect, it, vi } from 'vitest'
import { setToken } from '../auth/tokenStorage'
import client, { errorMessages, setUnauthorizedHandler } from './client'

function respondWith(status, data = {}) {
  client.defaults.adapter = vi.fn(async (config) => {
    const response = { status, data, headers: {}, config }
    if (status >= 400) {
      throw Object.assign(new Error(`Request failed with status ${status}`), { response, config })
    }
    return response
  })
  return client.defaults.adapter
}

describe('api client', () => {
  afterEach(() => {
    setUnauthorizedHandler(() => {})
  })

  it('sends the saved token as a bearer header', async () => {
    setToken('jwt-token')
    const adapter = respondWith(200)

    await client.get('/employees')

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer jwt-token')
  })

  it('sends no auth header without a token', async () => {
    const adapter = respondWith(200)

    await client.get('/employees')

    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined()
  })

  it('calls the unauthorized handler on a 401', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    respondWith(401, { errors: ['Unauthorized'] })

    await expect(client.get('/employees')).rejects.toThrow()
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call the unauthorized handler for other errors', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    respondWith(422, { errors: ['Salary must be greater than 0'] })

    await expect(client.get('/employees')).rejects.toThrow()
    expect(handler).not.toHaveBeenCalled()
  })

  describe('errorMessages', () => {
    it('returns the API error messages', () => {
      expect(errorMessages({ response: { data: { errors: ['Email has already been taken'] } } })).toEqual([
        'Email has already been taken',
      ])
    })

    it('falls back to a generic message when the API sent none', () => {
      expect(errorMessages(new Error('Network Error'))).toEqual(['Something went wrong. Please try again.'])
    })
  })
})
