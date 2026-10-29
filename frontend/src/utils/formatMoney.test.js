import { describe, expect, it } from 'vitest'
import formatMoney from './formatMoney'

describe('formatMoney', () => {
  it('formats the amount with the ISO currency code and no decimals', () => {
    expect(formatMoney('102582.40', 'USD')).toBe('USD 102,582')
  })

  it('uses the code for every currency so dollar currencies are never confused', () => {
    expect(formatMoney('83300', 'AUD')).toBe('AUD 83,300')
    expect(formatMoney('2400000.0', 'INR')).toBe('INR 2,400,000')
  })
})
