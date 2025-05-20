import LoginForm from '@/components/Modules/Auth/LoginForm'
import React from 'react'

export const metadata = {
  title: 'Login | Admin Dashboard',
  description: 'Login to your account',
}

const LoginPage = () => {
  return (
    <div>
      <LoginForm />
    </div>
  )
}

export default LoginPage
