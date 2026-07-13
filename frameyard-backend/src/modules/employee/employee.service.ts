import prisma from "../../config/prisma";
import { supabaseAdmin } from "../../config/supabase";

type EmployeeFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  department?: string;
};

const employeeSelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  designation: true,
  department: true,
  role: true,
  isActive: true,
  createdBy: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
};

const logEmployeeAction = (action: string, adminId: string, employeeId: string) => {
  console.log(`[Employee] ${action}`, {
    adminId,
    employeeId,
    timestamp: new Date().toISOString(),
  });
};

const buildEmployeeId = () =>
  `EMP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export const createEmployee = async (data: any, adminId: string) => {
  const email = String(data.email).trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return { success: false, statusCode: 409, message: "Employee email already exists" };
  }

  const authResult = await supabaseAdmin.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      name: data.name,
      role: "EMPLOYEE",
    },
  });

  if (authResult.error || !authResult.data.user) {
    return {
      success: false,
      statusCode: 400,
      message: authResult.error?.message || "Failed to create employee auth account",
    };
  }

  try {
    const authUserId = authResult.data.user.id;
    const employee = await prisma.user.create({
      data: {
        id: authUserId,
        name: data.name.trim(),
        email,
        phoneNumber: `EMP-${authUserId}`,
        isEmailVerified: true,
        role: "EMPLOYEE",
        employeeId: buildEmployeeId(),
        designation: data.designation.trim(),
        department: data.department.trim(),
        createdBy: adminId,
      },
      select: employeeSelect,
    });

    logEmployeeAction("Employee Created", adminId, employee.id);
    return { success: true, statusCode: 201, message: "Employee created successfully", employee };
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(authResult.data.user.id);
    throw error;
  }
};

export const getEmployees = async (filters: EmployeeFilters) => {
  const skip = (filters.page - 1) * filters.limit;
  const where: any = { role: "EMPLOYEE" };

  if (filters.status === "active") where.isActive = true;
  if (filters.status === "inactive") where.isActive = false;
  if (filters.department) where.department = { contains: filters.department, mode: "insensitive" };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { employeeId: { contains: filters.search, mode: "insensitive" } },
      { designation: { contains: filters.search, mode: "insensitive" } },
      { department: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [employees, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: employeeSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    employees,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  };
};

export const getEmployeeById = async (id: string) => {
  return prisma.user.findFirst({
    where: { id, role: "EMPLOYEE" },
    select: employeeSelect,
  });
};

export const updateEmployee = async (id: string, data: any, adminId: string) => {
  const employee = await getEmployeeById(id);

  if (!employee) return { success: false, statusCode: 404, message: "Employee not found" };

  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.designation !== undefined) payload.designation = data.designation.trim();
  if (data.department !== undefined) payload.department = data.department.trim();

  const updatedEmployee = await prisma.user.update({
    where: { id },
    data: payload,
    select: employeeSelect,
  });

  logEmployeeAction("Employee Updated", adminId, id);
  return { success: true, statusCode: 200, message: "Employee updated successfully", employee: updatedEmployee };
};

export const setEmployeeActive = async (id: string, isActive: boolean, adminId: string) => {
  const employee = await getEmployeeById(id);

  if (!employee) return { success: false, statusCode: 404, message: "Employee not found" };

  const updatedEmployee = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: employeeSelect,
  });

  logEmployeeAction(isActive ? "Employee Activated" : "Employee Deactivated", adminId, id);
  return {
    success: true,
    statusCode: 200,
    message: isActive ? "Employee activated successfully" : "Employee deactivated successfully",
    employee: updatedEmployee,
  };
};

export const deleteEmployee = async (id: string, adminId: string) => {
  const employee = await getEmployeeById(id);

  if (!employee) return { success: false, statusCode: 404, message: "Employee not found" };

  await prisma.user.delete({ where: { id } });
  await supabaseAdmin.auth.admin.deleteUser(id);
  logEmployeeAction("Employee Deleted", adminId, id);

  return { success: true, statusCode: 200, message: "Employee deleted successfully" };
};

export const resetEmployeePassword = async (id: string, password: string, adminId: string) => {
  const employee = await getEmployeeById(id);

  if (!employee) return { success: false, statusCode: 404, message: "Employee not found" };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password });

  if (error) return { success: false, statusCode: 400, message: error.message };

  logEmployeeAction("Password Reset", adminId, id);
  return { success: true, statusCode: 200, message: "Employee password reset successfully" };
};
