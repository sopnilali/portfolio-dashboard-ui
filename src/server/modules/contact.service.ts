import prisma from "../lib/prisma"

const createContact = async (req: any)=> {
    const result = await prisma.contact.create({
        data: req.body
    })
    return result
}

const getAllContact = async ()=> {
    const result = await prisma.contact.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
    return result
}

const updateContact = async (id: string, req: any)=> {
    const result = await prisma.contact.update({
        where: { id },
        data: req.body
    })
    return result
}

const deleteContact = async (id: string)=> {
    const result = await prisma.contact.delete({
        where: { id }
    })
    return result
}


export const ContactService = {
    createContact,
    getAllContact,
    updateContact,
    deleteContact
}