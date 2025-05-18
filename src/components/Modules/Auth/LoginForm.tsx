"use client"

import React from 'react'
import { useDispatch } from 'react-redux'
import { setUser } from '@/components/Redux/features/auth/authSlice'
import { toast } from 'sonner'
import { useLoginMutation } from '@/components/Redux/features/auth/authApi'
import Router from 'next/router'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie';
import { verifyToken } from '@/components/Utils/verifyToken'
import { TUser } from '@/components/Types/user.type'
import Link from 'next/link'

type FormData = {
    email: string
    password: string
}

const LoginForm = () => {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirectPath");
    const router = useRouter();
    const [Login] = useLoginMutation()
    const dispatch = useDispatch()

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

    const onSubmit = async (data: FormData) => {
        const toastId = toast.loading('Logging in');

        try {
            const userInfo = {
                email: data?.email,
                password: data?.password
            }
            const res = await Login(userInfo).unwrap();
            const user = verifyToken(res?.data?.accessToken) as TUser;

            // ✅ Set tokens as cookies
            Cookies.set('accessToken', res?.data?.accessToken, { expires: 7, secure: true });

            dispatch(setUser({
                user: user,
                token: res?.data?.accessToken
            }))
            router.push('/dashboard');
            // console.log(res)
            toast.success(res.message, { id: toastId });
        } catch (error: any) {
            toast.error(error.data.message, { id: toastId });

        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="backdrop-blur-md bg-white/10 p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
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
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-red-200 text-sm mt-1">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-white/20 backdrop-blur-sm text-white py-2 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/20"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginForm
