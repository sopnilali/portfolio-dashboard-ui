import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { FaSignOutAlt, FaHome } from "react-icons/fa";
import { Menu, ChevronDown, Sun, Moon } from "lucide-react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/components/Redux/hooks";
import { logout } from "@/components/Redux/features/auth/authSlice";

interface HeaderProps {
    toggleSidebar: () => void;
}

const titles: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/admin/project": "Projects",
    "/dashboard/admin/skill": "Skills",
    "/dashboard/admin/blog": "Blog",
    "/dashboard/admin/experience": "Experience",
    "/dashboard/admin/contact": "Contact",
    "/dashboard/admin/menu": "Menu",
    "/dashboard/admin/api": "API Endpoints",
    "/profile": "Profile",
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { user }: any = useAppSelector((state) => state.auth);
    const initial = (user?.name?.trim()?.[0] || "U").toUpperCase();

    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        let saved: string | null = null;
        try {
            saved = localStorage.getItem("dash-theme");
        } catch {
            /* storage unavailable */
        }
        const initial = saved === "light" ? "light" : "dark";
        setTheme(initial);
        document.documentElement.dataset.theme = initial;
        return () => {
            delete document.documentElement.dataset.theme;
        };
    }, []);

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.dataset.theme = next;
        try {
            localStorage.setItem("dash-theme", next);
        } catch {
            /* storage unavailable */
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logged out successfully");
        Cookies.remove("refreshToken");
        Cookies.remove("accessToken");
        router.push("/login");
    };

    return (
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface-0/80 px-4 backdrop-blur-md lg:px-6">
            <button
                onClick={toggleSidebar}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
                aria-label="Open sidebar"
            >
                <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-[13px]">
                <span className="text-gray-500">Dashboard</span>
                <span className="text-gray-700">/</span>
                <span className="font-medium text-white">{titles[pathname] ?? "Dashboard"}</span>
            </div>

            <button
                onClick={toggleTheme}
                className="ml-auto rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-white/5"
                >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 text-[11px] font-semibold text-white">
                        {initial}
                    </span>
                    <span className="hidden text-[13px] text-gray-300 sm:block">{user?.name || "User"}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 overflow-hidden rounded-lg border border-line bg-surface-2 py-1 shadow-xl shadow-black/40">
                        <Link
                            href="/"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <FaHome className="text-gray-400" />
                            Home
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <FaSignOutAlt className="text-rose-400" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
