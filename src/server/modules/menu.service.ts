import prisma from "../lib/prisma"

const createMenu = async (req: any) => {
    const body = Array.isArray(req.body)
        ? req.body
        : Array.isArray(req.body?.data)
          ? req.body.data
          : null

    if (body) {
        const result = await prisma.menu.createMany({
            data: body.map((item: any) => ({
                label: item.label,
                path: item.path,
                order: item.order ?? 0,
                isActive: item.isActive ?? true,
                isExternal: item.isExternal ?? false,
            })),
        })
        return result
    }

    const result = await prisma.menu.create({
        data: req.body,
    })
    return result
}

const getAllMenu = async () => {
    const result = await prisma.menu.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
    })
    return result
}

const getAllMenuAdmin = async () => {
    const result = await prisma.menu.findMany({
        orderBy: { order: "asc" },
    })
    return result
}

const getSingleMenu = async (id: string) => {
    const result = await prisma.menu.findUnique({
        where: { id },
    })
    return result
}

const updateMenu = async (id: string, req: any) => {
    const { id: _, createdAt, updatedAt, ...data } = req.body

    const result = await prisma.menu.update({
        where: { id },
        data: {
            ...(data.label !== undefined && { label: data.label }),
            ...(data.path !== undefined && { path: data.path }),
            ...(data.order !== undefined && { order: data.order }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.isExternal !== undefined && { isExternal: data.isExternal }),
        },
    })
    return result
}

const deleteMenu = async (id: string) => {
    const result = await prisma.menu.delete({
        where: { id },
    })
    return result
}

export const MenuService = {
    createMenu,
    getAllMenu,
    getAllMenuAdmin,
    getSingleMenu,
    updateMenu,
    deleteMenu,
}
