// customer.routes.ts

import { Router } from "express";
import {
  getCustomerDetails,
  getCustomers,
  lookupCustomerByPhoneNumber,
} from "./customer.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeAdmin } from "../../middlewares/admin.middleware";

const router = Router();

router.get("/", authenticateUser, authorizeAdmin, getCustomers);
router.get("/lookup", authenticateUser, authorizeAdmin, lookupCustomerByPhoneNumber);
router.get("/:id", authenticateUser, authorizeAdmin, getCustomerDetails);

export default router;
