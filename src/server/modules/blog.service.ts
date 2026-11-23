import { FileUploader } from "../lib/upload"
import prisma from "../lib/prisma"

const createBlog = async (req: any) => {
    const file = req.file
    if (file) {
        const uploadfile = await FileUploader.uploadToCloudinary(file)
        req.body.imageUrl = uploadfile?.secure_url
    }

    const { title, shortdescription, content, tags, imageUrl, status } = req.body

    const result = await prisma.blog.create({
        data: {
            title,
            shortdescription,
            content,
            tags,
            imageUrl,
            status,
            userId: req.user.id,
        },
    })
    return result
}

const getAllBlog = async () => {
    const result = await prisma.blog.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    avaterUrl: true,
                    role: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return result
}

const getSingleBlog = async (id: string) => {
    const result = await prisma.blog.findUnique({
        where: { id },
        include: {
            user: true
        }
    })
    return result
}
const updateBlog = async (id: string, req: any) => {
    const file = req.file
    if (file) {
        const uploadfile = await FileUploader.uploadToCloudinary(file)
        req.body.imageUrl = uploadfile?.secure_url
    }

    const { id: _, createdAt, updatedAt, user, userId, ...data } = req.body

    const result = await prisma.blog.update({
        where: { id },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.shortdescription !== undefined && { shortdescription: data.shortdescription }),
            ...(data.content !== undefined && { content: data.content }),
            ...(data.tags !== undefined && { tags: data.tags }),
            ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
            ...(data.status !== undefined && { status: data.status }),
        },
    })
    return result
}

const deleteBlog = async (id: string) => {
    const result = await prisma.blog.delete({
        where: { id }
    })
    return result
}

const editorUpload = async (req: any) => {
    const result = await FileUploader.uploadEditorFileToCloudinary(req.file)
    return result
}

export const BlogService = {
    createBlog,
    getAllBlog,
    getSingleBlog,
    updateBlog,
    deleteBlog,
    editorUpload
}
