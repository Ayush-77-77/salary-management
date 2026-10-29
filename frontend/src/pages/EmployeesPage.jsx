import { App, Alert, Button, Flex, Input, Popconfirm, Select, Space, Table, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { errorMessages } from '../api/client'
import { deleteEmployee } from '../api/employees'
import EmployeeFormModal from '../components/EmployeeFormModal'
import useEmployees from '../hooks/useEmployees'
import useLookups from '../hooks/useLookups'
import formatMoney from '../utils/formatMoney'

const INITIAL_QUERY = { page: 1, perPage: 25, sort: 'full_name asc' }
const SORT_FIELDS = { full_name: 'full_name', salary: 'salary', hire_date: 'hire_date' }

function sortOrderFor(sort, field) {
  const [column, direction] = sort.split(' ')
  if (column !== field) return null
  return direction === 'desc' ? 'descend' : 'ascend'
}

export default function EmployeesPage() {
  const { message } = App.useApp()
  const [query, setQuery] = useState(INITIAL_QUERY)
  const [editing, setEditing] = useState(null)
  const { employees, meta, loading, error, reload } = useEmployees(query)
  const { countries, departments, jobTitles, error: lookupsError, reloadJobTitles } = useLookups()

  function updateFilters(changes) {
    setQuery((previous) => ({ ...previous, ...changes, page: 1 }))
  }

  function handleTableChange(pagination, _filters, sorter) {
    const field = SORT_FIELDS[sorter.field]
    const sort = field && sorter.order ? `${field} ${sorter.order === 'descend' ? 'desc' : 'asc'}` : INITIAL_QUERY.sort

    setQuery((previous) => ({
      ...previous,
      page: sort === previous.sort ? pagination.current : 1,
      perPage: pagination.pageSize,
      sort,
    }))
  }

  function handleSaved(employee) {
    message.success(editing === 'new' ? `${employee.full_name} added` : `${employee.full_name} updated`)
    setEditing(null)
    reload()
    reloadJobTitles()
  }

  async function handleDelete(employee) {
    try {
      await deleteEmployee(employee.id)
      message.success(`${employee.full_name} deleted`)
      if (employees.length === 1 && query.page > 1) {
        setQuery((previous) => ({ ...previous, page: previous.page - 1 }))
      } else {
        reload()
      }
    } catch (requestError) {
      message.error(errorMessages(requestError).join(', '))
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      sorter: true,
      sortOrder: sortOrderFor(query.sort, 'full_name'),
      render: (name, employee) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{name}</Typography.Text>
          <Typography.Text type="secondary">{employee.email}</Typography.Text>
        </Space>
      ),
    },
    { title: 'Job title', dataIndex: 'job_title' },
    { title: 'Department', dataIndex: ['department', 'name'] },
    { title: 'Country', dataIndex: ['country', 'name'] },
    {
      title: 'Salary',
      dataIndex: 'salary',
      align: 'right',
      sorter: true,
      sortOrder: sortOrderFor(query.sort, 'salary'),
      render: (salary, employee) => formatMoney(salary, employee.country.currency),
    },
    {
      title: 'Hire date',
      dataIndex: 'hire_date',
      sorter: true,
      sortOrder: sortOrderFor(query.sort, 'hire_date'),
      render: (date) => dayjs(date).format('D MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, employee) => (
        <Space>
          <Button type="link" onClick={() => setEditing(employee)}>
            Edit
          </Button>
          <Popconfirm
            title={`Delete ${employee.full_name}?`}
            description="This cannot be undone."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(employee)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Employees
        </Typography.Title>
        <Button type="primary" onClick={() => setEditing('new')}>
          Add employee
        </Button>
      </Flex>

      {(error || lookupsError) && <Alert type="error" showIcon title={error || lookupsError} />}

      <Flex wrap gap={12}>
        <Input.Search
          placeholder="Search name or email"
          allowClear
          onSearch={(search) => updateFilters({ search: search.trim() })}
          style={{ width: 260 }}
        />
        <Select
          placeholder="Country"
          allowClear
          options={countries.map((country) => ({ value: country.id, label: country.name }))}
          onChange={(countryId) => updateFilters({ countryId })}
          style={{ width: 180 }}
        />
        <Select
          placeholder="Department"
          allowClear
          options={departments.map((department) => ({ value: department.id, label: department.name }))}
          onChange={(departmentId) => updateFilters({ departmentId })}
          style={{ width: 180 }}
        />
        <Select
          placeholder="Job title"
          allowClear
          showSearch={{ optionFilterProp: 'label' }}
          options={jobTitles.map((title) => ({ value: title, label: title }))}
          onChange={(jobTitle) => updateFilters({ jobTitle })}
          style={{ width: 220 }}
        />
      </Flex>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={employees}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: query.page,
          pageSize: query.perPage,
          total: meta?.total_count ?? 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
          showTotal: (total) => `${total.toLocaleString()} employees`,
        }}
      />

      <EmployeeFormModal
        key={editing === 'new' ? 'new' : editing?.id}
        open={editing !== null}
        employee={editing === 'new' ? null : editing}
        countries={countries}
        departments={departments}
        jobTitles={jobTitles}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />
    </Flex>
  )
}
