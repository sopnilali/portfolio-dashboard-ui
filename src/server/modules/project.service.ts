
import { FileUploader } from "../lib/upload"
import prisma from "../lib/prisma"

const createProject = async (req: any)=> {
    const file = req.file
    if(file){
        const uploadfile = await FileUploader.uploadToCloudinary(file)
        req.body.imageUrl = uploadfile?.secure_url
    }
    
    const result = await prisma.$transaction(async (tx) => {
        // Create new record
        const newRecord = await tx.project.create({
            data: req.body
        })
        
        return newRecord
    })
    
    return result
}

const getAllProject = async ()=> {
    const result = await prisma.project.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
    return result
}

const getSingleProject = async (id: string)=> {
    const result = await prisma.project.findUnique({
        where: {
            id,
        }
    })
    return result
}

const updateProject = async (id: string, req: any)=> {
    const file = req.file
    if(file){
        const uploadfile = await FileUploader.uploadToCloudinary(file)
        req.body.imageUrl = uploadfile?.secure_url
    }
    const result = await prisma.project.update({
        where: {
            id
        },
        data: req.body
    })
    return result
}

const deleteProject = async (id: string)=> {
    const result = await prisma.project.delete({
        where: {
            id
        }
    })
    return result
}

export const ProjectService = {
    createProject,
    getAllProject,
    getSingleProject,
    updateProject,
    deleteProject
}