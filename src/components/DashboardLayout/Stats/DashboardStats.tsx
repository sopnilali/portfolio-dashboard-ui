"use client"

import React from 'react'
import { useGetAllProjectsQuery } from '@/components/Redux/features/project/projectApi'
import { useGetAllBlogsQuery } from '@/components/Redux/features/blog/blogApi'
import { MdWork, MdArticle, MdSchool, MdCode } from 'react-icons/md'
import { useGetAllSkillsQuery } from '@/components/Redux/features/skill/skillApi'
import { useGetAllExperiencesQuery } from '@/components/Redux/features/experience/experienceApi'

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
    <div className="">

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-gray-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardStats
