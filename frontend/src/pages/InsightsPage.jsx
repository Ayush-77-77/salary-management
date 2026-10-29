import { Alert, Button, Card, Col, Flex, Progress, Row, Select, Statistic, Table, Typography } from 'antd'
import { useCallback, useState } from 'react'
import { fetchCountryStats, fetchJobTitleStats, fetchSummary } from '../api/insights'
import useRequest from '../hooks/useRequest'
import formatMoney from '../utils/formatMoney'

function salaryColumns(currency) {
  return [
    { title: 'Headcount', dataIndex: 'headcount', align: 'right' },
    {
      title: 'Min',
      dataIndex: 'min_salary',
      align: 'right',
      render: (amount, row) => formatMoney(amount, currency ?? row.currency),
    },
    {
      title: 'Average',
      dataIndex: 'average_salary',
      align: 'right',
      render: (amount, row) => formatMoney(amount, currency ?? row.currency),
    },
    {
      title: 'Max',
      dataIndex: 'max_salary',
      align: 'right',
      render: (amount, row) => formatMoney(amount, currency ?? row.currency),
    },
  ]
}

export default function InsightsPage() {
  const [selectedCountryId, setSelectedCountryId] = useState(null)

  const summary = useRequest(fetchSummary)
  const countryStats = useRequest(fetchCountryStats)

  const countries = countryStats.data ?? []
  const countryId = selectedCountryId ?? countries[0]?.country_id
  const jobTitleRequest = useCallback((signal) => fetchJobTitleStats(countryId, signal), [countryId])
  const jobTitleStats = useRequest(countryId ? jobTitleRequest : null)

  const currency = jobTitleStats.data?.country.currency
  const jobTitles = jobTitleStats.data?.job_titles ?? []
  const highestAverage = Math.max(...jobTitles.map((row) => Number(row.average_salary)), 1)
  const error = summary.error || countryStats.error || jobTitleStats.error

  const countryColumns = [
    { title: 'Country', dataIndex: 'name' },
    { title: 'Currency', dataIndex: 'currency' },
    ...salaryColumns(),
    {
      title: '',
      key: 'drill-down',
      render: (_, row) => (
        <Button type="link" onClick={() => setSelectedCountryId(row.country_id)}>
          View job titles
        </Button>
      ),
    },
  ]

  const jobTitleColumns = [
    { title: 'Job title', dataIndex: 'job_title' },
    ...salaryColumns(currency),
    {
      title: '% of highest-paid role',
      key: 'comparison',
      width: 220,
      render: (_, row) => (
        <Progress
          percent={Math.round((Number(row.average_salary) / highestAverage) * 100)}
          status="normal"
          format={(percent) => `${percent}%`}
          size="small"
        />
      ),
    },
  ]

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Salary Insights
      </Typography.Title>

      {error && <Alert type="error" showIcon title={error} />}

      <Row gutter={[16, 16]}>
        {[
          ['Employees', 'total_employees'],
          ['Countries', 'total_countries'],
          ['Departments', 'total_departments'],
        ].map(([title, key]) => (
          <Col xs={24} sm={8} key={key}>
            <Card>
              <Statistic title={title} value={summary.data?.[key]} loading={summary.loading} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Salary by country">
        <Typography.Paragraph type="secondary">
          Each country is shown in its local currency, so amounts are not compared across countries.
        </Typography.Paragraph>
        <Table
          rowKey="country_id"
          columns={countryColumns}
          dataSource={countries}
          loading={countryStats.loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Card
        title="Salary by job title"
        extra={
          <Select
            aria-label="Country for job titles"
            value={countryId}
            onChange={setSelectedCountryId}
            options={countries.map((country) => ({ value: country.country_id, label: country.name }))}
            style={{ width: 200 }}
          />
        }
      >
        <Table
          rowKey="job_title"
          columns={jobTitleColumns}
          dataSource={jobTitles}
          loading={countryStats.loading || jobTitleStats.loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </Flex>
  )
}
