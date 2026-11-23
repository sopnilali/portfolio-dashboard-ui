import bcrypt from "bcryptjs";
import AppError from "../lib/AppError";
import config from "../lib/config";
import prisma from "../lib/prisma";
import { FileUploader } from "../lib/upload";

const searchAbleFields = ["email"];
export const userFilterableFields = ["email", "role", "status", "searchTerm"];

const createUser = async (req: any) => {
  if (req.file) {
    const uploadFile = await FileUploader.uploadToCloudinary(req.file);
    req.body.avaterUrl = uploadFile?.secure_url;
  }

  req.body.password = await bcrypt.hash(req.body.password, config.saltRounds);

  return prisma.user.create({ data: req.body });
};

const getAllUser = async (params: any, options: any) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const { searchTerm, ...filterData } = params;
  const andCondition: any[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: searchAbleFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({ [key]: { equals: filterData[key] } })),
    });
  }

  const where = andCondition.length > 0 ? { AND: andCondition } : {};

  const data = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avaterUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const total = await prisma.user.count({ where });

  return { meta: { page, limit, total }, data };
};

const getSingleUser = async (id: string) => prisma.user.findUnique({ where: { id } });

const updateUser = async (id: string, req: any) => {
  if (req.file) {
    const result = await FileUploader.uploadToCloudinary(req.file);
    req.body.avaterUrl = result?.secure_url;
  }
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, config.saltRounds);
  } else {
    delete req.body.password;
  }

  return prisma.user.update({ where: { id }, data: req.body });
};

const deleteUser = async (id: string) => prisma.user.delete({ where: { id } });

const SoftdeleteUser = async (id: string) => {
  const existUser = await prisma.user.findUnique({ where: { id } });
  if (!existUser) {
    throw new AppError(400, "User Not Found");
  }
  return prisma.user.update({ where: { id }, data: { isDeleted: true } });
};

export const UserService = {
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser,
  SoftdeleteUser,
};
