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
import { motion } from 'framer-motion'

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
        <motion.div
            className="min-h-screen bg-black/10 flex items-center justify-center "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="backdrop-blur-2xl bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/20"
                initial={{ scale: 0.95, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
            >
                <motion.h2
                    className="text-3xl font-bold text-black mb-6 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Welcome Back
                </motion.h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <label htmlFor="email" className="block text-black mb-2">Email</label>
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
                            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-black/20 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/30"
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-200 text-sm mt-1">{errors.email.message}</p>}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <label htmlFor="password" className="block text-black mb-2">Password</label>
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
                            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/20 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/30"
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-red-200 text-sm mt-1">{errors.password.message}</p>}
                    </motion.div>
                    <motion.button
                        type="submit"
                        className="w-full bg-black/10 backdrop-blur-sm text-black py-2 rounded-lg font-semibold hover:bg-black/30 transition-all duration-300 border border-black/20"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        Sign In
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    )
}

export default LoginForm
