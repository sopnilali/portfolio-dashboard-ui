'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const UserRegisterForm = () => {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>()
  const password = watch('password')

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading('Creating account...')
    try {
      // TODO: Implement registration API call
      toast.success('Account created successfully!', { id: toastId })
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed', { id: toastId })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="backdrop-blur-md bg-white/10 p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-white mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-200 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-white mb-2">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-200 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-white mb-2">Password</label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-200 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-white text-gray-600 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Create Account
          </button>
        </form>
        <div className="text-white text-sm mt-2">
          Already have an account? <Link href="/login" className="text-white text-sm text-center">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default UserRegisterForm
