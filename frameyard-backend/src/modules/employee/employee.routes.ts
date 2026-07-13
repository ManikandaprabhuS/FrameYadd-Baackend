import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import {
  activateEmployeeController,
  createEmployeeController,
  deactivateEmployeeController,
  deleteEmployeeController,
  getEmployeeByIdController,
  getEmployeesController,
  resetEmployeePasswordController,
  updateEmployeeController,
} from "./employee.controller";

const router = Router();

router.use(authenticateUser, authorizeRoles("ADMIN"));

router.post("/", createEmployeeController);
router.get("/", getEmployeesController);
router.get("/:id", getEmployeeByIdController);
router.put("/:id", updateEmployeeController);
router.delete("/:id", deleteEmployeeController);
router.patch("/:id/activate", activateEmployeeController);
router.patch("/:id/deactivate", deactivateEmployeeController);
router.patch("/:id/reset-password", resetEmployeePasswordController);

export default router;
