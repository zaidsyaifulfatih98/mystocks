import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './page/LoginPage'
import RegisterPage from './page/RegisterPage'
import DashboardPage from './page/DashboardPage'
import TransactionsPage from './page/TransactionsPage'
import TransactionFormPage from './page/TransactionFormPage'
import IHSGPage from './page/IHSGPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/transactions',
    element: <ProtectedRoute><TransactionsPage /></ProtectedRoute>,
  },
  {
    path: '/transactions/new',
    element: <ProtectedRoute><TransactionFormPage /></ProtectedRoute>,
  },
  {
    path: '/transactions/:id/edit',
    element: <ProtectedRoute><TransactionFormPage /></ProtectedRoute>,
  },
  {
    path: '/ihsg',
    element: <ProtectedRoute><IHSGPage /></ProtectedRoute>,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)