import axios from 'axios'
import { getToken } from '../auth/tokenStorage'

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api/v1`,
})

let handleUnauthorized = () => {}

export function setUnauthorizedHandler(handler) {
  handleUnauthorized = handler
}

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) handleUnauthorized()
    return Promise.reject(error)
  },
)

export function errorMessages(error) {
  return error.response?.data?.errors ?? ['Something went wrong. Please try again.']
}

export default client
