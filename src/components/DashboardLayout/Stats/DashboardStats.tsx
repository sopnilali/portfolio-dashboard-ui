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
  Sparkles,
  UserCircle,
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
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 30 } },
}

type StatTone = 'violet' | 'cyan' | 'rose' | 'amber' | 'emerald' | 'sky'

const toneStyles: Record<
  StatTone,
  { gradient: string; iconBg: string; glow: string; border: string }
> = {
  violet: {
    gradient: 'from-violet-500/20 via-transparent to-transparent',
    iconBg: 'bg-violet-500/90 shadow-lg shadow-violet-900/50',
    glow: 'from-violet-500/35',
    border: 'border-violet-500/25',
  },
  cyan: {
    gradient: 'from-cyan-500/18 via-transparent to-transparent',
    iconBg: 'bg-cyan-500/90 shadow-lg shadow-cyan-900/40',
    glow: 'from-cyan-500/30',
    border: 'border-cyan-500/20',
  },
  rose: {
    gradient: 'from-rose-500/18 via-transparent to-transparent',
    iconBg: 'bg-rose-500/90 shadow-lg shadow-rose-900/35',
    glow: 'from-rose-500/30',
    border: 'border-rose-500/20',
  },
  amber: {
    gradient: 'from-amber-500/16 via-transparent to-transparent',
    iconBg: 'bg-amber-500/95 shadow-lg shadow-amber-900/35',
    glow: 'from-amber-500/28',
    border: 'border-amber-500/20',
  },
  emerald: {
    gradient: 'from-emerald-500/18 via-transparent to-transparent',
    iconBg: 'bg-emerald-500/90 shadow-lg shadow-emerald-900/40',
    glow: 'from-emerald-500/30',
    border: 'border-emerald-500/20',
  },
  sky: {
    gradient: 'from-sky-500/18 via-transparent to-transparent',
    iconBg: 'bg-sky-500/90 shadow-lg shadow-sky-900/35',
    glow: 'from-sky-500/30',
    border: 'border-sky-500/22',
  },
}

function SkeletonNum() {
  return <span className="inline-block h-9 w-14 animate-pulse rounded-lg bg-gray-700/80" />
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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const stats = [
    {
      key: 'projects',
      label: 'Projects',
      value: projectCount,
      loading: projectsQ.isLoading && projectsQ.data === undefined,
      icon: Briefcase,
      tone: 'violet' as StatTone,
      href: '/dashboard/admin/project',
    },
    {
      key: 'blogs',
      label: 'Blog posts',
      value: blogCount,
      loading: blogsQ.isLoading && blogsQ.data === undefined,
      icon: BookOpen,
      tone: 'rose' as StatTone,
      href: '/dashboard/admin/blog',
    },
    {
      key: 'skills',
      label: 'Skills',
      value: skillCount,
      loading: skillsQ.isLoading && skillsQ.data === undefined,
      icon: Layers,
      tone: 'cyan' as StatTone,
      href: '/dashboard/admin/skill',
    },
    {
      key: 'exp',
      label: 'Experience',
      value: expCount,
      loading: expQ.isLoading && expQ.data === undefined,
      icon: GraduationCap,
      tone: 'amber' as StatTone,
      href: '/dashboard/admin/experience',
    },
    {
      key: 'contacts',
      label: 'Contacts',
      value: contactCount,
      loading: contactsQ.isLoading && contactsQ.data === undefined,
      icon: Mail,
      tone: 'sky' as StatTone,
      href: '/dashboard/admin/contact',
    },
    {
      key: 'menus',
      label: 'Menu items',
      value: menuCount,
      loading: menusQ.isLoading && menusQ.data === undefined,
      icon: ListTree,
      tone: 'emerald' as StatTone,
      href: '/dashboard/admin/menu',
    },
  ]

  const quickLinks = [
    { title: 'Projects', description: 'Portfolio work & media', href: '/dashboard/admin/project' },
    { title: 'Blog', description: 'Posts & publishing', href: '/dashboard/admin/blog' },
    { title: 'Skills', description: 'Stack & tools', href: '/dashboard/admin/skill' },
    { title: 'Experience', description: 'Timeline & roles', href: '/dashboard/admin/experience' },
    { title: 'Contacts', description: 'Inbox & messages', href: '/dashboard/admin/contact' },
    { title: 'Menu', description: 'Site navigation CRUD', href: '/dashboard/admin/menu' },
    { title: 'Profile', description: 'Public bio & avatar', href: '/profile' },
  ]

  return (
    <div className="relative max-w-7xl mx-auto pb-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
        <div className="absolute -left-16 -top-24 h-80 w-80 rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute bottom-0 left-1/4 h-64 w-[28rem] rounded-full bg-fuchsia-600/8 blur-[100px]" />
      </div>

      <motion.header
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <motion.div variants={fadeUp}>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-300/85 mb-2">
            Command center
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {user?.name?.trim() || 'creator'}
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">{dateLine}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">
            Live counts from your API — jump into any module or tune your{' '}
            <Link href="/profile" className="text-violet-300 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-200">
              public profile
            </Link>{' '}
            without leaving context.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-white/10 bg-gray-900/55 px-5 py-4 backdrop-blur-md shadow-xl shadow-black/30"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            <Sparkles className="h-4 w-4 text-amber-300/90" />
            Snapshot
          </div>
          <p className="mt-2 text-sm text-gray-300">
            {hasProfile ? (
              <span className="text-emerald-300/95">●</span>
            ) : (
              <span className="text-amber-400/90">●</span>
            )}{' '}
            {hasProfile ? 'Profile synced from GET /about' : 'No profile row yet — finish setup in Profile'}
          </p>
          <Link
            href="/profile"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200"
          >
            Open profile workspace
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </motion.header>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        {stats.map((s) => {
          const Tone = toneStyles[s.tone]
          const Icon = s.icon
          return (
            <motion.div key={s.key} variants={fadeUp}>
              <Link
                href={s.href}
                className={`group relative block overflow-hidden rounded-2xl border ${Tone.border} bg-gray-900/50 p-5 shadow-lg shadow-black/25 backdrop-blur-sm transition-colors hover:bg-gray-900/70`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${Tone.gradient}`}
                  aria-hidden
                />
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${Tone.glow} to-transparent blur-2xl opacity-60 transition-opacity group-hover:opacity-100`}
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                        {s.label}
                      </p>
                      <div className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-white">
                        {s.loading ? <SkeletonNum /> : s.value.toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`rounded-xl p-2.5 text-white ring-4 ring-black/25 ${Tone.iconBg}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-400 group-hover:text-violet-300">
                    Manage
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-10 grid gap-6 lg:grid-cols-12"
      >
        <motion.section variants={fadeUp} className="lg:col-span-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Quick launch</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="group rounded-2xl border border-gray-700/70 bg-gray-800/35 p-4 transition-all hover:border-violet-500/35 hover:bg-gray-800/55"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-100 group-hover:text-white">{q.title}</p>
                    <p className="mt-1 text-[12px] text-gray-500 group-hover:text-gray-400">{q.description}</p>
                  </div>
                  <span className="rounded-lg bg-gray-950/80 p-2 text-gray-400 ring-1 ring-gray-700/80 transition-colors group-hover:text-violet-300 group-hover:ring-violet-500/30">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.aside variants={fadeUp} className="lg:col-span-4">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
            <UserCircle className="h-4 w-4 text-violet-400" />
            Health
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-950/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-2 border-b border-gray-800/80 pb-3">
              <div>
                <p className="text-sm font-medium text-gray-200">Content surface</p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                  Totals aggregate list endpoints across modules. Empty states usually mean{' '}
                  <code className="rounded bg-gray-800 px-1 py-px text-[10px] text-gray-300">GET</code>{' '}
                  returned zero rows.
                </p>
              </div>
            </div>
            <ul className="space-y-2.5 text-[12px] text-gray-400">
              <li className="flex justify-between gap-2 border-b border-gray-800/50 pb-2">
                <span>Projects API</span>
                <span
                  className={
                    projectsQ.isError
                      ? 'text-rose-400'
                      : projectsQ.data !== undefined || !projectsQ.isLoading
                        ? 'text-emerald-400/95'
                        : 'text-amber-300/90'
                  }
                >
                  {projectsQ.isError ? 'Error' : projectsQ.data !== undefined ? 'Synced' : '…'}
                </span>
              </li>
              <li className="flex justify-between gap-2 border-b border-gray-800/50 pb-2">
                <span>Blog feed</span>
                <span
                  className={
                    blogsQ.isError
                      ? 'text-rose-400'
                      : blogsQ.data !== undefined || !blogsQ.isLoading
                        ? 'text-emerald-400/95'
                        : 'text-amber-300/90'
                  }
                >
                  {blogsQ.isError ? 'Error' : blogsQ.data !== undefined ? 'Synced' : '…'}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Public profile block</span>
                <span className={hasProfile ? 'text-emerald-400/95' : 'text-gray-500'}>
                  {aboutQ.isLoading ? '…' : hasProfile ? 'Present' : 'Missing'}
                </span>
              </li>
            </ul>
          </div>
        </motion.aside>
      </motion.div>
    </div>
  )
}

export default DashboardStats
