import { render } from '@testing-library/react'
import { App as AntApp } from 'antd'
import { MemoryRouter } from 'react-router'
import App from '../App'

export default function renderApp(path = '/') {
  return render(
    <AntApp>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AntApp>,
  )
}
