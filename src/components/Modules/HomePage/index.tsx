"use client"


import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/components/Redux/features/auth/authSlice'
import { toast } from 'sonner'
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation'

const HomePage = () => {

    const { user } = useSelector((state: any) => state.auth)

    const dispatch = useDispatch()
    const router = useRouter();

    const handleLogout = () => {
        toast.success("Logged out successfully");
        Cookies.remove('accessToken'); // Replace 'accessToken' with the actual cookie name(s) you're using
        Cookies.remove('refreshToken'); // Replace 'refreshToken' with the actual cookie name(s) you're using
        router.push("/login");
        dispatch(logout())
    }


    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-2xl font-bold"
                        >
                            Portfolio Dashboard
                        </motion.div>
                        <nav className="hidden md:flex space-x-6">
                            {user ? (
                                <button onClick={handleLogout} className="hover:text-blue-600 transition-colors">Logout</button>
                            ) : (
                                <Link href="/login" className="hover:text-blue-600 transition-colors">Login</Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-center"
                >
                    This is Portfolio Dashboard
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-white">© 2025 Portfolio. All rights reserved.</p>
                        </div>
                        <div className="flex space-x-4">
                            <a href="#" className="text-white  transition-colors">Privacy Policy</a>
                            <a href="#" className="text-white  transition-colors">Terms of Service</a>
                            <a href="#" className="text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
