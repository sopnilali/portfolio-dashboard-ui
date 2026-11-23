'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Briefcase,
  BookOpen,
  GraduationCap,
  Layers,
  Mail,
  ListTree,
  ChevronRight,
} from 'lucide-react'
import { useAppSelector } from '@/components/Redux/hooks'
import { useGetAllProjectsQuery } from '@/components/Redux/features/project/projectApi'
import { useGetAllBlogsQuery } from '@/components/Redux/features/blog/blogApi'
import { useGetAllSkillsQuery } from '@/components/Redux/features/skill/skillApi'
import { useGetAllExperiencesQuery } from '@/components/Redux/features/experience/experienceApi'
import { useGetAllContactsQuery } from '@/components/Redux/features/contact/contactApi'
import { useGetAllMenusQuery } from '@/components/Redux/features/menu/menuApi'
import { useGetAllAboutQuery } from '@/components/Redux/features/about/aboutApi'
import { normalizeList } from '@/components/Utils/normalizeArray'
import {
  normalizeAboutPayload,
  parseAboutRecord,
} from '@/components/Types/about.type'

type AuthSliceUser = {
  name?: string
  email?: string
} | null

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
}

type StatTone = 'violet' | 'cyan' | 'rose' | 'amber' | 'emerald' | 'sky'

const toneStyles: Record<StatTone, string> = {
  violet: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/20',
  rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  sky: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
}

const card = 'rounded-xl border border-line bg-surface-1'

function SkeletonNum() {
  return <span className="inline-block h-6 w-10 animate-pulse rounded bg-white/10" />
}

type Status = 'ok' | 'error' | 'loading'

function StatusDot({ status }: { status: Status }) {
  const color =
    status === 'ok' ? 'bg-emerald-400' : status === 'error' ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'
  const label = status === 'ok' ? 'Synced' : status === 'error' ? 'Error' : 'Loading'
  return (
    <span className="inline-flex items-center gap-1.5 text-gray-300">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}

const DashboardStats = () => {
  const user = useAppSelector((s) => s.auth.user) as AuthSliceUser

  const projectsQ = useGetAllProjectsQuery(undefined)
  const blogsQ = useGetAllBlogsQuery(undefined)
  const skillsQ = useGetAllSkillsQuery(undefined)
  const expQ = useGetAllExperiencesQuery(undefined)
  const contactsQ = useGetAllContactsQuery(undefined)
  const menusQ = useGetAllMenusQuery(undefined)
  const aboutQ = useGetAllAboutQuery(undefined)

  const projectCount = projectsQ.data?.data?.length ?? 0
  const blogCount = normalizeList(blogsQ.data?.data).length
  const skillCount = skillsQ.data?.data?.length ?? 0
  const expCount = expQ.data?.data?.length ?? 0
  const contactCount = normalizeList(contactsQ.data?.data).length
  const menuCount = normalizeList(menusQ.data?.data).length

  const hasProfile = useMemo(() => {
    const payload =
      aboutQ.data?.data !== undefined ? aboutQ.data.data : aboutQ.data
    const raw = normalizeAboutPayload(payload)
    const items = raw
      .map(parseAboutRecord)
      .filter((x): x is NonNullable<typeof x> => x !== null)
    return items.length > 0
  }, [aboutQ.data])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const dateLine = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const statusOf = (q: { isError: boolean; isLoading: boolean; data?: unknown }): Status =>
    q.isError ? 'error' : q.data !== undefined ? 'ok' : q.isLoading ? 'loading' : 'ok'

  const stats = [
    { key: 'projects', label: 'Projects', value: projectCount, loading: projectsQ.isLoading && projectsQ.data === undefined, icon: Briefcase, tone: 'violet' as StatTone, href: '/dashboard/admin/project' },
    { key: 'blogs', label: 'Blog posts', value: blogCount, loading: blogsQ.isLoading && blogsQ.data === undefined, icon: BookOpen, tone: 'rose' as StatTone, href: '/dashboard/admin/blog' },
    { key: 'skills', label: 'Skills', value: skillCount, loading: skillsQ.isLoading && skillsQ.data === undefined, icon: Layers, tone: 'cyan' as StatTone, href: '/dashboard/admin/skill' },
    { key: 'exp', label: 'Experience', value: expCount, loading: expQ.isLoading && expQ.data === undefined, icon: GraduationCap, tone: 'amber' as StatTone, href: '/dashboard/admin/experience' },
    { key: 'contacts', label: 'Contacts', value: contactCount, loading: contactsQ.isLoading && contactsQ.data === undefined, icon: Mail, tone: 'sky' as StatTone, href: '/dashboard/admin/contact' },
    { key: 'menus', label: 'Menu items', value: menuCount, loading: menusQ.isLoading && menusQ.data === undefined, icon: ListTree, tone: 'emerald' as StatTone, href: '/dashboard/admin/menu' },
  ]

  const quickLinks = [
    { title: 'Projects', description: 'Portfolio work & media', href: '/dashboard/admin/project' },
    { title: 'Blog', description: 'Posts & publishing', href: '/dashboard/admin/blog' },
    { title: 'Skills', description: 'Stack & tools', href: '/dashboard/admin/skill' },
    { title: 'Experience', description: 'Timeline & roles', href: '/dashboard/admin/experience' },
    { title: 'Contacts', description: 'Inbox & messages', href: '/dashboard/admin/contact' },
    { title: 'Menu', description: 'Site navigation', href: '/dashboard/admin/menu' },
    { title: 'Profile', description: 'Public bio & avatar', href: '/profile' },
    { title: 'API', description: 'Endpoint reference', href: '/dashboard/admin/api' },
  ]

  const health: { label: string; status: Status }[] = [
    { label: 'Projects', status: statusOf(projectsQ) },
    { label: 'Blog', status: statusOf(blogsQ) },
    { label: 'Skills', status: statusOf(skillsQ) },
    { label: 'Contacts', status: statusOf(contactsQ) },
  ]

  return (
    <div className="mx-auto space-y-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-end justify-between gap-2"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            {greeting},{' '}
            <span className="text-gray-400">{user?.name?.trim() || 'there'}</span>
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">{dateLine}</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-surface-2"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${hasProfile ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {hasProfile ? 'Public profile live' : 'Profile not set up'}
            <ArrowUpRight className="h-3 w-3 text-gray-500" />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      >
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <motion.div key={s.key} variants={fadeUp}>
              <Link
                href={s.href}
                className={`${card} group block p-3.5 transition-colors hover:border-white/15 hover:bg-surface-2`}
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${toneStyles[s.tone]}`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 transition-colors group-hover:text-gray-300" />
                </div>
                <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-white">
                  {s.loading ? <SkeletonNum /> : s.value.toLocaleString()}
                </div>
                <p className="mt-0.5 text-[11px] text-gray-500">{s.label}</p>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 lg:grid-cols-12"
      >
        <motion.section variants={fadeUp} className={`${card} lg:col-span-8`}>
          <h2 className="border-b border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            Quick launch
          </h2>
          <div className="grid gap-px sm:grid-cols-2">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="group flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-white/3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-gray-200 group-hover:text-white">{q.title}</p>
                  <p className="truncate text-[11px] text-gray-500">{q.description}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-600 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-300" />
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.aside variants={fadeUp} className={`${card} lg:col-span-4`}>
          <h2 className="border-b border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            System status
          </h2>
          <ul className="divide-y divide-line text-[13px]">
            {health.map((h) => (
              <li key={h.label} className="flex items-center justify-between px-4 py-2.5 text-gray-400">
                <span>{h.label} API</span>
                <StatusDot status={h.status} />
              </li>
            ))}
            <li className="flex items-center justify-between px-4 py-2.5 text-gray-400">
              <span>Public profile</span>
              <span className={hasProfile ? 'text-emerald-300' : 'text-gray-500'}>
                {aboutQ.isLoading ? '…' : hasProfile ? 'Present' : 'Missing'}
              </span>
            </li>
          </ul>
        </motion.aside>
      </motion.div>
    </div>
  )
}

export default DashboardStats
