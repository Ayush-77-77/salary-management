import { Alert, AutoComplete, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { errorMessages } from '../api/client'
import { createEmployee, updateEmployee } from '../api/employees'

function toFormValues(employee) {
  if (!employee) return {}

  return {
    full_name: employee.full_name,
    email: employee.email,
    job_title: employee.job_title,
    country_id: employee.country.id,
    department_id: employee.department.id,
    salary: Number(employee.salary),
    hire_date: dayjs(employee.hire_date),
  }
}

function toAttributes(values) {
  return { ...values, hire_date: values.hire_date.format('YYYY-MM-DD') }
}

export default function EmployeeFormModal({ open, employee, countries, departments, jobTitles, onClose, onSaved }) {
  const [form] = Form.useForm()
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)
  const countryId = Form.useWatch('country_id', form)
  const currency = countries.find((country) => country.id === countryId)?.currency

  async function handleFinish(values) {
    setSaving(true)
    setErrors([])
    try {
      const attributes = toAttributes(values)
      const saved = employee ? await updateEmployee(employee.id, attributes) : await createEmployee(attributes)
      onSaved(saved)
    } catch (requestError) {
      setErrors(errorMessages(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={employee ? 'Edit employee' : 'Add employee'}
      okText={employee ? 'Save changes' : 'Add employee'}
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onClose}
      afterClose={() => setErrors([])}
      destroyOnHidden
    >
      {errors.length > 0 && (
        <Alert
          type="error"
          showIcon
          title="Could not save the employee"
          description={errors.join(', ')}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={toFormValues(employee)}
        onFinish={handleFinish}
        preserve={false}
      >
        <Form.Item label="Full name" name="full_name" rules={[{ required: true, whitespace: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Job title" name="job_title" rules={[{ required: true, whitespace: true }]}>
          <AutoComplete
            options={jobTitles.map((title) => ({ value: title }))}
            showSearch={{
              filterOption: (input, option) => option.value.toLowerCase().includes(input.toLowerCase()),
            }}
          />
        </Form.Item>
        <Form.Item label="Department" name="department_id" rules={[{ required: true }]}>
          <Select
            options={departments.map((department) => ({ value: department.id, label: department.name }))}
            showSearch={{ optionFilterProp: 'label' }}
          />
        </Form.Item>
        <Form.Item label="Country" name="country_id" rules={[{ required: true }]}>
          <Select
            options={countries.map((country) => ({ value: country.id, label: country.name }))}
            showSearch={{ optionFilterProp: 'label' }}
          />
        </Form.Item>
        <Form.Item label="Annual salary" name="salary" rules={[{ required: true }]}>
          <InputNumber min={0.01} precision={2} style={{ width: '100%' }} prefix={currency} />
        </Form.Item>
        <Form.Item label="Hire date" name="hire_date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} disabledDate={(date) => date.isAfter(dayjs(), 'day')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
