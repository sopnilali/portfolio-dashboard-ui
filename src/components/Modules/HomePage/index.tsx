"use client"


import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/components/Redux/features/auth/authSlice'
import { toast } from 'sonner'
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation'
import { FaHome, FaSignOutAlt, FaUser } from 'react-icons/fa'

const HomePage = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { user } = useSelector((state: any) => state.auth)


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


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
            <header className="bg-gray-800 text-white shadow-md">
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
                        {/* Show nav on all screen sizes, but style for mobile */}
                        <nav className="flex space-x-6 relative">
                            <div className="relative" ref={dropdownRef}>
                                {user ? (
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                    >
                                        <span className="text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <FaUser className="text-gray-200 " />
                                                {user.name || "User"}
                                            </div>
                                        </span>
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg transition-colors text-gray-300"
                                    >
                                        Login
                                    </Link>
                                )}

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2">
                                        {user?.role === "Admin" && (
                                            <Link
                                                href={"/dashboard"}
                                                className="w-full  px-3 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                                            >
                                                <FaHome className="text-gray-200 " />
                                                Dashboard
                                            </Link>
                                            
                                        )
                                        
                                        }
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                                        >
                                            <FaSignOutAlt className="text-red-400" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            </header>



            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center bg-gray-900">
                {/* Animated Background */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 z-0 pointer-events-none"
                >
                    <svg
                        className="w-full h-full"
                        viewBox="0 0 1440 800"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ minHeight: 400 }}
                    >

                        <rect width="1440" height="800" fill="url(#bg-gradient-dark)" />
                        <g>
                            <motion.circle
                                cx="400"
                                cy="400"
                                r="180"
                                fill="gray"
                                style={{ opacity: 0.18 }}
                                animate={{
                                    cy: [400, 350, 400],
                                    r: [180, 210, 180],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 8,
                                    ease: "easeInOut",
                                }}
                            />
                            <motion.circle
                                cx="1100"
                                cy="300"
                                r="120"
                                fill="gray"
                                style={{ opacity: 0.13 }}
                                animate={{
                                    cy: [300, 340, 300],
                                    r: [120, 150, 120],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 10,
                                    ease: "easeInOut",
                                    delay: 2,
                                }}
                            />
                            <motion.circle
                                cx="800"
                                cy="600"
                                r="90"
                                fill="gray"
                                style={{ opacity: 0.10 }}
                                animate={{
                                    cy: [600, 570, 600],
                                    r: [90, 120, 90],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 12,
                                    ease: "easeInOut",
                                    delay: 1,
                                }}
                            />
                        </g>
                    </svg>
                </div>
                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-center z-10 text-white drop-shadow-lg"
                >
                   Welcome to My Portfolio Dashboard
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-white">© 2025 Portfolio. All rights reserved. Design By Md Abdul Adud</p>
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
