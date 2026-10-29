import { describe, expect, it } from 'vitest'
import { buildSearchParams } from './employees'

describe('buildSearchParams', () => {
  it('maps the page query to Ransack params', () => {
    const params = buildSearchParams({
      page: 2,
      perPage: 50,
      search: 'asha',
      countryId: 3,
      departmentId: 4,
      jobTitle: 'Software Engineer',
      sort: 'salary desc',
    })

    expect(params).toEqual({
      page: 2,
      per_page: 50,
      q: {
        full_name_or_email_i_cont: 'asha',
        country_id_eq: 3,
        department_id_eq: 4,
        job_title_eq: 'Software Engineer',
        s: 'salary desc',
      },
    })
  })

  it('leaves out an empty search', () => {
    expect(buildSearchParams({ page: 1, search: '' }).q.full_name_or_email_i_cont).toBeUndefined()
  })
})
