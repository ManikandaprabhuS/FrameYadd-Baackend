import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  resetEmployeePassword,
  setEmployeeActive,
  updateEmployee,
} from "./employee.service";
import {
  validateCreateEmployee,
  validateResetPassword,
  validateUpdateEmployee,
} from "./employee.validation";

const getAdminId = (req: AuthRequest) => req.user!.id;

export const createEmployeeController = async (req: AuthRequest, res: Response) => {
  const errors = validateCreateEmployee(req.body);
  if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

  const result = await createEmployee(req.body, getAdminId(req));
  return res.status(result.statusCode).json(result);
};

export const getEmployeesController = async (req: AuthRequest, res: Response) => {
  const result = await getEmployees({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: String(req.query.search || "").trim(),
    status: String(req.query.status || "all"),
    department: String(req.query.department || "").trim(),
  });

  return res.status(200).json({ success: true, ...result });
};

export const getEmployeeByIdController = async (req: AuthRequest, res: Response) => {
  const employee = await getEmployeeById(String(req.params.id));
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

  return res.status(200).json({ success: true, employee });
};

export const updateEmployeeController = async (req: AuthRequest, res: Response) => {
  const errors = validateUpdateEmployee(req.body);
  if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

  const result = await updateEmployee(String(req.params.id), req.body, getAdminId(req));
  return res.status(result.statusCode).json(result);
};

export const activateEmployeeController = async (req: AuthRequest, res: Response) => {
  const result = await setEmployeeActive(String(req.params.id), true, getAdminId(req));
  return res.status(result.statusCode).json(result);
};

export const deactivateEmployeeController = async (req: AuthRequest, res: Response) => {
  const result = await setEmployeeActive(String(req.params.id), false, getAdminId(req));
  return res.status(result.statusCode).json(result);
};

export const deleteEmployeeController = async (req: AuthRequest, res: Response) => {
  const result = await deleteEmployee(String(req.params.id), getAdminId(req));
  return res.status(result.statusCode).json(result);
};

export const resetEmployeePasswordController = async (req: AuthRequest, res: Response) => {
  const errors = validateResetPassword(req.body);
  if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

  const result = await resetEmployeePassword(String(req.params.id), req.body.password, getAdminId(req));
  return res.status(result.statusCode).json(result);
};
