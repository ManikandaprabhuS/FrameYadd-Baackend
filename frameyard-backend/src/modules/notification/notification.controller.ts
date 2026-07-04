import { Request, Response } from "express";
import * as notificationService from "./notification.service";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getNotifications();
    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.markAllRead();
    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark notifications as read",
    });
  }
};

export const toggleRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const notification = await notificationService.toggleRead(id);
    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle notification read status",
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await notificationService.deleteNotification(id);
    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete notification",
    });
  }
};
