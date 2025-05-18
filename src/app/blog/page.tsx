"use client"

import { useGetBlogQuery } from '@/components/Redux/features/blog/blogApi'
import React from 'react'
import Image from 'next/image'
import './blog.css'

const BlogDetails = () => {
    const id = "ed7f7962-e149-4cee-80a0-9e1f76259a1c"
    const { data: blog } = useGetBlogQuery(id)

    return (
        <div className="blog-container">
            {/* Blog Header */}
            <div className="blog-header">
                <h1 className="blog-title">{blog?.data?.title}</h1>
                <div className="blog-meta">
                    <span className="blog-date">
                        {new Date(blog?.data?.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            {/* Featured Image */}
            {blog?.data?.thumbnail && (
                <div className="blog-image-container">
                    <Image
                        src={blog.data.thumbnail}
                        alt={blog.data.title}
                        fill
                        className="blog-image"
                    />
                </div>
            )}


            <div className='blog-content' dangerouslySetInnerHTML={{ __html: blog?.data?.content }} />
        </div>
    )
}

export default BlogDetails
