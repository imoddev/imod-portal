// Role-Based Access Control (RBAC)
// Roles: admin > manager > lead > member

export type Role = "admin" | "manager" | "lead" | "member";
export type Department = "content-it" | "content-ev" | "revenue" | "production" | "creative" | "dev" | "management";

// Define page access by role
export const pageAccess: Record<string, {
  minRole?: Role;
  departments?: Department[];
  description: string;
}> = {
  // Everyone can access
  "/dashboard": { description: "Dashboard" },
  "/calendar": { description: "ปฏิทิน" },
  "/team": { description: "Team Directory" },
  "/hr": { description: "HR (ลา/OT)" },
  
  // Content team
  "/content": { description: "Content Hub" },
  "/content/news": { description: "News Database" },
  "/draft": { description: "Draft Generator" },
  "/my-tasks": { description: "My Tasks" },
  "/templates": { description: "Templates" },
  "/tools": { description: "Tools" },
  
  // Manager+ only
  "/analytics": { minRole: "manager", description: "Analytics" },
  "/assets": { minRole: "manager", description: "Asset Management" },
  "/report": { minRole: "manager", description: "Reports & Payroll" },
  "/hr/admin": { minRole: "manager", description: "HR Admin (อนุมัติ)" },
  "/timesheet": { minRole: "lead", description: "Timesheet" },
  "/content-calendar": { minRole: "lead", description: "Content Calendar" },
  
  // Revenue team only
  "/ratecard": { departments: ["revenue", "management"], description: "Rate Card" },
  "/revenue": { departments: ["revenue", "management"], description: "Revenue Dashboard" },
  "/quotation": { departments: ["revenue", "management"], description: "ใบเสนอราคา" },
  
  // Production team only
  "/production": { departments: ["production", "creative", "management"], description: "Production Board" },
  
  // Admin only
  "/settings": { minRole: "admin", description: "Settings" },
  "/admin/settings": { minRole: "admin", description: "Admin Settings" },
  "/admin/monitoring": { minRole: "admin", description: "Token Monitoring" },
  "/audit": { minRole: "admin", description: "Audit Log" },
  "/youtube": { minRole: "manager", description: "YouTube Analytics" },
};

// Role hierarchy (higher index = more permissions)
const roleHierarchy: Role[] = ["member", "lead", "manager", "admin"];

export function hasMinRole(userRole: Role, minRole: Role): boolean {
  const userIndex = roleHierarchy.indexOf(userRole);
  const minIndex = roleHierarchy.indexOf(minRole);
  return userIndex >= minIndex;
}

export function canAccessPage(
  path: string,
  userRole: Role,
  userDepartment?: Department
): boolean {
  // Find matching page config
  const pageConfig = pageAccess[path];
  
  // If no config, allow by default (for API routes, etc.)
  if (!pageConfig) return true;
  
  // Check role requirement
  if (pageConfig.minRole && !hasMinRole(userRole, pageConfig.minRole)) {
    return false;
  }
  
  // Check department requirement
  if (pageConfig.departments && pageConfig.departments.length > 0) {
    if (!userDepartment || !pageConfig.departments.includes(userDepartment)) {
      // Allow admin/manager to access all department pages
      if (!hasMinRole(userRole, "manager")) {
        return false;
      }
    }
  }
  
  return true;
}

// Get allowed menu items for a user
export function getAllowedMenuItems(
  userRole: Role,
  userDepartment?: Department
): string[] {
  return Object.keys(pageAccess).filter(path => 
    canAccessPage(path, userRole, userDepartment)
  );
}
