import { describe, expect, it } from 'vitest'
import formatMoney from './formatMoney'

describe('formatMoney', () => {
  it('formats the amount in the given currency without decimals', () => {
    expect(formatMoney('102582.40', 'USD')).toBe('$102,582')
  })

  it('uses the currency symbol of other countries', () => {
    expect(formatMoney('2400000.0', 'INR')).toBe('₹2,400,000')
    expect(formatMoney('66802', 'GBP')).toBe('£66,802')
  })
})
