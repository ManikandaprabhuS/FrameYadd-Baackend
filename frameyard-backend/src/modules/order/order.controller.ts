import { AuthRequest } from "../../middlewares/auth.middleware";
import { Parser } from "json2csv";
import { createOrder, exportAllOrders, getAllOrders, getMyOrders, getOrderById, updateOrderStatus } from "./order.service";
import { Response } from "express";

export const checkout = async (
  req: AuthRequest,
  res: Response
) => {
  const result =await createOrder(req.user!.id);
  return res.status(200).json(result);
};

export const fetchMyOrders =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const result =await getMyOrders(req.user!.id);
    return res.status(200).json(result);
};
export const fetchOrderById =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const result =await getOrderById(String(req.params.id),req.user!.id);
    return res.status(200).json(result);
};

export const fetchAllOrders = async (
  req: AuthRequest,
  res: Response
) => {
  const query: Parameters<typeof getAllOrders>[0] = {};
  if (typeof req.query.page === "string") query.page = Number(req.query.page);
  if (typeof req.query.limit === "string") query.limit = Number(req.query.limit);
  if (typeof req.query.search === "string") query.search = req.query.search;
  if (typeof req.query.status === "string") query.status = req.query.status;
  if (typeof req.query.dateFilter === "string") query.dateFilter = req.query.dateFilter;

  const result = await getAllOrders(query);

  return res.status(200).json(result);
};

export const exportOrders = async (
  req: AuthRequest,
  res: Response
) => {
  const query: Parameters<typeof exportAllOrders>[0] = {};
  if (typeof req.query.search === "string") query.search = req.query.search;
  if (typeof req.query.status === "string") query.status = req.query.status;
  if (typeof req.query.dateFilter === "string") query.dateFilter = req.query.dateFilter;

  const orders = await exportAllOrders(query);

  const rows = orders.flatMap((order) =>
    order.orderItems.map((item) => ({
      CustomerName: order.user.name,
      CustomerEmail: order.user.email,
      OrderNumber: order.orderNumber,
      OrderStatus: order.orderStatus,
      OrderDate: order.createdAt.toISOString(),
      ProductName: item.productName,
      FrameSize: item.frameSize,
      MountType: item.mountType,
      GlassType: item.glassType,
      Quantity: item.quantity,
      UnitPrice: item.price,
      Subtotal: item.subtotal,
      OrderTotal: order.totalAmount,
    }))
  );

  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header("Content-Type", "text/csv");
  res.attachment(`orders-${Date.now()}.csv`);
  return res.send(csv);
};
export const changeOrderStatus = async (
  req: AuthRequest,
  res: Response
) => {

  const result =
    await updateOrderStatus(
      String(req.params.id),
      req.body.orderStatus
    );

  return res.status(200).json(result);
};
