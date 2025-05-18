import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaUser, FaSignOutAlt, FaHome } from "react-icons/fa";
import Cookies from "js-cookie";
import Link from "next/link";
import { Home } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/components/Redux/hooks";
import { logout, selectCurrentToken } from "@/components/Redux/features/auth/authSlice";
import { verifyToken } from "@/components/Utils/verifyToken";

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { user }: any = useAppSelector((state) => state.auth);


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

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logged out successfully");
        Cookies.remove("refreshToken");
        Cookies.remove("accessToken");
        router.push("/login");
    };

    const handleProfileClick = () => {
        router.push("/profile");
        setIsDropdownOpen(false);
    };

    return (
        <header className="sticky top-0 z-20 bg-gray-800 backdrop-blur-sm border-b border-gray-700 p-4">
            <div className="flex justify-between items-center">
                <div className="flex-1 sm:block">
                    <h2 className="text-xl font-semibold text-white pl-10 md:pl-10 lg:pl-0">
                        Dashboard Overview
                    </h2>
                    <p className="text-sm text-gray-400 mt-1 pl-10 md:pl-10 lg:pl-0">
                        Welcome back, {user?.name || "Admin"}
                    </p>
                </div>

                <div className="flex justify-end gap-4">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                        >
                            <span className="text-gray-300 flex items-center gap-2">
                                <FaUser className="text-gray-200 " />
                                {user?.name || "User"}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2">
                                <Link
                                    href={"/"}
                                    className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <FaHome className="text-white " />
                                    Home
                                </Link>
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
                </div>
            </div>

            {/* Mobile Sidebar Toggle */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden absolute top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
                ☰
            </button>
        </header>
    );
};

export default Header;
