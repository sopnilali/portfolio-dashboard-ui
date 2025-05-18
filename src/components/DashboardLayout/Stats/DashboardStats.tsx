"use client"

import React from 'react'
import { useGetAllProjectsQuery } from '@/components/Redux/features/project/projectApi'
import { useGetAllBlogsQuery } from '@/components/Redux/features/blog/blogApi'
import { MdWork, MdArticle, MdSchool, MdCode } from 'react-icons/md'
import { useGetAllSkillsQuery } from '@/components/Redux/features/skill/skillApi'
import { useGetAllExperiencesQuery } from '@/components/Redux/features/experience/experienceApi'
import { motion, AnimatePresence } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: "spring",
      stiffness: 200,
      damping: 22,
    }
  }),
  hover: {
    scale: 1.04,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    transition: { type: "spring", stiffness: 300, damping: 18 }
  }
}

const DashboardStats = () => {
  const { data: projects } = useGetAllProjectsQuery(undefined)
  const { data: blogs } = useGetAllBlogsQuery(undefined)
  const { data: experiences } = useGetAllExperiencesQuery(undefined)
  const { data: skills } = useGetAllSkillsQuery(undefined)

  const stats = [
    {
      title: "Total Projects",
      value: projects?.data?.length || 0,
      icon: <MdWork className="w-8 h-8" />,
      color: "bg-gray-500"
    },
    {
      title: "Total Blogs",
      value: blogs?.data?.length || 0,
      icon: <MdArticle className="w-8 h-8" />,
      color: "bg-gray-500"
    },
    {
      title: "Total Experiences",
      value: experiences?.data?.length || 0,
      icon: <MdSchool className="w-8 h-8" />,
      color: "bg-gray-500"
    },
    {
      title: "Total Skills",
      value: skills?.data?.length || 0,
      icon: <MdCode className="w-8 h-8" />,
      color: "bg-gray-500"
    }
  ]

  return (
    <div>
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-gray-100 rounded-lg shadow-md p-6 cursor-pointer"
              custom={index}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardVariants}
              whileHover="hover"
              layout
            >
              <div className="flex items-center justify-between">
                <div>
                  <motion.p
                    className="text-sm font-medium text-gray-600"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05, duration: 0.3 }}
                  >
                    {stat.title}
                  </motion.p>
                  <motion.p
                    className="text-2xl font-semibold text-gray-900 mt-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 + index * 0.05, duration: 0.3 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div
                  className={`${stat.color} p-3 rounded-full text-white flex items-center justify-center`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.28 + index * 0.05, type: "spring", stiffness: 180 }}
                >
                  {stat.icon}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}

export default DashboardStats
