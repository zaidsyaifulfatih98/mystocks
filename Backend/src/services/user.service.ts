import prisma from "../configs/prisma-client.config";

export const userService = {
  async getAll() {
    return await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
    });
  },

  async getById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  },

  async update(id: string, data: { name?: string; email?: string }) {
    return await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, createdAt: true },
    });
  },
};