import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response } from "express";
import { addToCart, getCart, removeCartItem, updateCartItem } from "./cart.service";

export const addItemToCart = async (
  req: AuthRequest,
  res: Response
) => {

  const result = await addToCart(
    req.user!.id,
    req.body
  );

  return res.status(200).json(result);
};

export const fetchCart = async (
  req: AuthRequest,
  res: Response
) => {

  const result =
    await getCart(
      req.user!.id
    );

  return res.status(200).json(result);
};

export const updateCartItemController =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const result =
      await updateCartItem(
        String(req.params.id),
        Number(req.body.quantity)
      );

    return res.status(200).json(result);
};

export const removeCartItemController =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const result =
      await removeCartItem(
        String(req.params.id)
      );

    return res.status(200).json(result);
};
