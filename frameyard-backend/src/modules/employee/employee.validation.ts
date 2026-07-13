const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreateEmployee = (body: any) => {
  const errors: string[] = [];

  if (!body.name?.trim()) errors.push("Employee name is required");
  if (!body.email?.trim()) errors.push("Email address is required");
  if (body.email && !emailRegex.test(body.email)) errors.push("Valid email address is required");
  if (!body.designation?.trim()) errors.push("Designation is required");
  if (!body.department?.trim()) errors.push("Department is required");
  if (!body.password?.trim()) errors.push("Temporary password is required");
  if (body.password && body.password.length < 8) errors.push("Temporary password must be at least 8 characters");

  return errors;
};

export const validateUpdateEmployee = (body: any) => {
  const errors: string[] = [];

  if (body.name !== undefined && !body.name?.trim()) errors.push("Employee name cannot be empty");
  if (body.designation !== undefined && !body.designation?.trim()) errors.push("Designation cannot be empty");
  if (body.department !== undefined && !body.department?.trim()) errors.push("Department cannot be empty");

  return errors;
};

export const validateResetPassword = (body: any) => {
  const errors: string[] = [];

  if (!body.password?.trim()) errors.push("New password is required");
  if (body.password && body.password.length < 8) errors.push("New password must be at least 8 characters");

  return errors;
};
