// customer.routes.ts

import { Router } from "express";
import {
  getCustomerDetails,
  getCustomers,
  lookupCustomerByPhoneNumber,
} from "./customer.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), getCustomers);
router.get("/lookup", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), lookupCustomerByPhoneNumber);
router.get("/:id", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), getCustomerDetails);

export default router;
