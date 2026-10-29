import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { errorMessages } from '../api/client'
import useAuth from '../auth/useAuth'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname ?? '/employees'

  if (user) return <Navigate to={redirectTo} replace />

  async function handleFinish({ email, password }) {
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(errorMessages(requestError).join(', '))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 380 }}>
        <Typography.Title level={3}>ACME Salary Management</Typography.Title>
        <Typography.Paragraph type="secondary">Sign in to manage employee salaries.</Typography.Paragraph>

        {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Sign in
          </Button>
        </Form>
      </Card>
    </Flex>
  )
}
