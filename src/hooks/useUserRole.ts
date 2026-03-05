"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Role, Department, canAccessPage, hasMinRole } from "@/lib/permissions";

interface UserRoleData {
  role: Role;
  department?: Department;
  isLoading: boolean;
  canAccess: (path: string) => boolean;
  hasRole: (minRole: Role) => boolean;
}

export function useUserRole(): UserRoleData {
  const { data: session } = useSession();
  const [role, setRole] = useState<Role>("member");
  const [department, setDepartment] = useState<Department | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user's role from Employee table
        const res = await fetch(`/api/team?email=${encodeURIComponent(session.user.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.employees && data.employees.length > 0) {
            const employee = data.employees[0];
            setRole(employee.role || "member");
            setDepartment(employee.department);
          } else {
            // Check if admin email (hardcoded for now)
            const adminEmails = [
              "admin@modmedia.asia", 
              "tom@modmedia.asia", 
              "attapon@modmedia.asia",
              "attapon.tom@gmail.com"
            ];
            if (adminEmails.includes(session.user.email.toLowerCase())) {
              setRole("admin");
              setDepartment("management");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, [session?.user?.email]);

  const canAccess = (path: string): boolean => {
    return canAccessPage(path, role, department);
  };

  const hasRoleCheck = (minRole: Role): boolean => {
    return hasMinRole(role, minRole);
  };

  return {
    role,
    department,
    isLoading,
    canAccess,
    hasRole: hasRoleCheck,
  };
}
