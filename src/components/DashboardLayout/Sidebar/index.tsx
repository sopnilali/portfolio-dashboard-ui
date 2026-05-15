import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  MdCode,
  MdContactPage,
  MdMenu,
  MdPerson,
  MdSchool,
  MdSpaceDashboard,
  MdWorkOff,
} from "react-icons/md";
import { useAppSelector } from "@/components/Redux/hooks";
import { LiaBlogger } from "react-icons/lia";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

type MenuItem = {
  name: string;
  icon: React.ReactNode;
  link: string;
};

type MenuSection = {
  label: string;
  items: MenuItem[];
};

const mainSection: MenuSection = {
  label: "Main",
  items: [
    { name: "Overview", icon: <MdSpaceDashboard />, link: "/dashboard" },
  ],
};

const manageSection: MenuSection = {
  label: "Manage",
  items: [
    { name: "Projects", icon: <MdWorkOff />, link: "/dashboard/admin/project" },
    { name: "Skills", icon: <MdCode />, link: "/dashboard/admin/skill" },
    { name: "Blog", icon: <LiaBlogger />, link: "/dashboard/admin/blog" },
    { name: "Experience", icon: <MdSchool />, link: "/dashboard/admin/experience" },
    { name: "Contact", icon: <MdContactPage />, link: "/dashboard/admin/contact" },
    { name: "Menu", icon: <MdMenu />, link: "/dashboard/admin/menu" },
  ],
};

const accountSection: MenuSection = {
  label: "Account",
  items: [
    { name: "Profile", icon: <MdPerson />, link: "/profile" },
  ],
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const user = useAppSelector((state) => state.auth.user) as User | null;
  const pathname = usePathname();

  const isAdmin =
    user?.role === "ADMIN" || user?.role === "Admin";

  const sections: MenuSection[] = [
    mainSection,
    manageSection,
    ...(isAdmin ? [accountSection] : []),
  ];

  return (
    <aside
      className={`fixed z-40 top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:block`}
    >
      <div className="relative p-6 h-full flex flex-col">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {user?.role === "Admin"
              ? "Admin Dashboard"
              : user?.role === "User"
                ? "User Dashboard"
                : "Dashboard"}
          </h1>
        </div>

        <nav className="flex-1 space-y-6 border-t border-gray-700 pt-4 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.link}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        pathname === item.link ? "bg-gray-700 text-white" : "text-gray-300"
                      } hover:bg-gray-700 hover:text-white transition-colors`}
                    >
                      <span className="material-icons-outlined">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="pt-4 border-t border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300">⚙️</span>
            </div>
            <span className="text-sm text-gray-300">Settings</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
