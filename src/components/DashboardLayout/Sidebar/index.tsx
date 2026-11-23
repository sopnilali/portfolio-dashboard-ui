import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  MdApi,
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

const apiSection: MenuSection = {
  label: "API",
  items: [
    { name: "API Endpoints", icon: <MdApi />, link: "/dashboard/admin/api" },
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
    ...(isAdmin ? [accountSection, apiSection] : []),
  ];

  const isActive = (link: string) =>
    link === "/dashboard" ? pathname === link : pathname === link || pathname.startsWith(link + "/");

  const initial = (user?.name?.trim()?.[0] || "U").toUpperCase();

  return (
    <aside
      className={`fixed z-40 top-0 left-0 h-full w-56 bg-surface-1 border-r border-line transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:block`}
    >
      <div className="relative flex h-full flex-col">
        {/* Brand */}
        <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-line px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-[13px] font-bold text-white shadow-lg shadow-violet-950/50">
            {initial}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold text-white">
              {user?.role === "Admin" ? "Admin" : user?.role === "User" ? "User" : "Dashboard"}
            </p>
            <p className="text-[10px] text-gray-500">Portfolio CMS</p>
          </div>
          <button
            className="ml-auto text-gray-500 hover:text-white lg:hidden"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.link);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.link}
                        className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                          active
                            ? "bg-white/6 font-medium text-white"
                            : "text-gray-400 hover:bg-white/4 hover:text-gray-100"
                        }`}
                      >
                        {active && (
                          <span className="absolute -left-2.5 top-1/2 h-4 w-0.75 -translate-y-1/2 rounded-r bg-accent" />
                        )}
                        <span
                          className={`text-[17px] ${active ? "text-accent" : "text-gray-500 group-hover:text-gray-300"}`}
                        >
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className="shrink-0 border-t border-line p-2.5">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[12px] font-semibold text-gray-300 ring-1 ring-line">
              {initial}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12px] font-medium text-gray-200">{user?.name || "User"}</p>
              <p className="truncate text-[10px] text-gray-500">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
