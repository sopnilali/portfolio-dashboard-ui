import prisma from "../lib/prisma"

const createExperience = async (req: any)=> {
    
    const result = await prisma.$transaction(async (tx) => {
        
        // Create new record
        const newRecord = await tx.experience.create({
            data: req.body
        })
        
        return newRecord
    })
    
    return result
}


const getAllExperience = async ()=> {
    const result = await prisma.experience.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
    return result
}

const updateExperience = async (id: string, req: any)=> {
    const result = await prisma.experience.update({
        where: { id },
        data: req.body
    })
    return result
}

const deleteExperience = async (id: string)=> {
    const result = await prisma.experience.delete({
        where: { id }
    })
    return result
}

export const ExperienceService = {
    createExperience,
    getAllExperience,
    updateExperience,
    deleteExperience
}
