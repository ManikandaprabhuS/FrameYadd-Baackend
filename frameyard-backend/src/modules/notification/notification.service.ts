import prisma from "../../config/prisma";

export const getNotifications = async () => {
  return prisma.notification.findMany({
    orderBy: {
      date: "desc",
    },
  });
};

export const markAllRead = async () => {
  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  return prisma.notification.findMany({
    orderBy: {
      date: "desc",
    },
  });
};

export const toggleRead = async (id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });
  if (!notification) {
    throw new Error("Notification not found");
  }
  return prisma.notification.update({
    where: { id },
    data: { read: !notification.read },
  });
};

export const deleteNotification = async (id: string) => {
  await prisma.notification.delete({
    where: { id },
  });
  return { success: true };
};
