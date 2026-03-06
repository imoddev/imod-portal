"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  nickname: string | null;
  department: string;
  jobTitle: string | null;
  role: string;
  profileImage: string | null;
  managerId: string | null;
}

interface OrgPerson {
  id: string;
  name: string;
  nickname?: string;
  role: string;
  title: string;
  department: string;
  avatar?: string;
  children?: OrgPerson[];
}

const departmentConfig: Record<string, { color: string; gradient: string; border: string; text: string }> = {
  management: { 
    color: "bg-purple-500", 
    gradient: "from-purple-500 to-pink-500",
    border: "border-purple-300",
    text: "text-purple-700"
  },
  "content-it": { 
    color: "bg-blue-500", 
    gradient: "from-blue-500 to-cyan-500",
    border: "border-blue-300",
    text: "text-blue-700"
  },
  "content-ev": { 
    color: "bg-emerald-500", 
    gradient: "from-emerald-500 to-teal-500",
    border: "border-emerald-300",
    text: "text-emerald-700"
  },
  revenue: { 
    color: "bg-amber-500", 
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-300",
    text: "text-amber-700"
  },
  production: { 
    color: "bg-rose-500", 
    gradient: "from-rose-500 to-red-500",
    border: "border-rose-300",
    text: "text-rose-700"
  },
  creative: { 
    color: "bg-pink-500", 
    gradient: "from-pink-500 to-fuchsia-500",
    border: "border-pink-300",
    text: "text-pink-700"
  },
  dev: { 
    color: "bg-slate-600", 
    gradient: "from-slate-600 to-zinc-600",
    border: "border-slate-400",
    text: "text-slate-700"
  },
};

const departmentNames: Record<string, string> = {
  management: "Management",
  "content-it": "Content IT",
  "content-ev": "Content EV",
  revenue: "Revenue",
  production: "Production",
  creative: "Creative",
  dev: "Development",
};

// Convert flat employee list to tree structure
function buildOrgTree(employees: Employee[]): OrgPerson | null {
  if (employees.length === 0) return null;

  // Find CEO/admin or first management person
  const ceo = employees.find(e => e.role === "admin" || e.department === "management") || employees[0];
  
  // Group by department
  const byDept: Record<string, Employee[]> = {};
  employees.forEach(emp => {
    if (emp.id === ceo.id) return; // Skip CEO
    if (!byDept[emp.department]) byDept[emp.department] = [];
    byDept[emp.department].push(emp);
  });

  // Build tree
  const ceoNode: OrgPerson = {
    id: ceo.id,
    name: ceo.name,
    nickname: ceo.nickname || undefined,
    role: ceo.role,
    title: ceo.jobTitle || "CEO",
    department: ceo.department,
    avatar: ceo.profileImage || undefined,
    children: [],
  };

  // Add department leads and members
  Object.entries(byDept).forEach(([dept, members]) => {
    // Find lead
    const lead = members.find(m => m.role === "lead" || m.role === "manager");
    const others = members.filter(m => m.id !== lead?.id);

    if (lead) {
      const leadNode: OrgPerson = {
        id: lead.id,
        name: lead.name,
        nickname: lead.nickname || undefined,
        role: lead.role,
        title: lead.jobTitle || "Team Lead",
        department: lead.department,
        avatar: lead.profileImage || undefined,
        children: others.map(m => ({
          id: m.id,
          name: m.name,
          nickname: m.nickname || undefined,
          role: m.role,
          title: m.jobTitle || "Member",
          department: m.department,
          avatar: m.profileImage || undefined,
        })),
      };
      ceoNode.children!.push(leadNode);
    } else if (others.length > 0) {
      // No lead, add directly under CEO
      others.forEach(m => {
        ceoNode.children!.push({
          id: m.id,
          name: m.name,
          nickname: m.nickname || undefined,
          role: m.role,
          title: m.jobTitle || "Member",
          department: m.department,
          avatar: m.profileImage || undefined,
        });
      });
    }
  });

  return ceoNode;
}

interface PersonCardProps {
  person: OrgPerson;
  isRoot?: boolean;
}

function PersonCard({ person, isRoot }: PersonCardProps) {
  const config = departmentConfig[person.department] || departmentConfig.dev;
  
  return (
    <div 
      className={cn(
        "group relative transition-all duration-300 ease-out",
        "hover:scale-105 hover:-translate-y-1"
      )}
    >
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-300",
        config.gradient,
        "group-hover:opacity-30"
      )} />
      
      {/* Card */}
      <div 
        className={cn(
          "relative rounded-2xl p-4 backdrop-blur-sm transition-all duration-300",
          "bg-white/80 dark:bg-slate-900/80",
          "border-2 shadow-lg",
          config.border,
          "group-hover:shadow-2xl group-hover:border-opacity-80",
          isRoot && "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50",
          isRoot ? "w-56" : "w-44"
        )}
      >
        <div className="flex flex-col items-center text-center gap-3">
          {/* Avatar with ring */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-r blur-sm",
              config.gradient,
              "opacity-60"
            )} />
            <Avatar className={cn(
              "relative ring-2 ring-white shadow-md",
              isRoot ? "h-16 w-16" : "h-12 w-12"
            )}>
              <AvatarImage src={person.avatar} />
              <AvatarFallback className={cn(
                "bg-gradient-to-br text-white font-semibold",
                config.gradient
              )}>
                {person.nickname?.[0] || person.name[0]}
              </AvatarFallback>
            </Avatar>
            
            {/* Role badge */}
            {person.role !== "member" && (
              <div className={cn(
                "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                "bg-white shadow-md border",
                config.text
              )}>
                {person.role === "admin" ? "CEO" : "LEAD"}
              </div>
            )}
          </div>
          
          {/* Name */}
          <div className="space-y-0.5">
            <p className={cn(
              "font-semibold tracking-tight",
              isRoot ? "text-base" : "text-sm"
            )}>
              {person.nickname || person.name}
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {person.title}
            </p>
          </div>
          
          {/* Department tag */}
          <div className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium",
            "bg-gradient-to-r text-white shadow-sm",
            config.gradient
          )}>
            {departmentNames[person.department] || person.department}
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrgNodeProps {
  person: OrgPerson;
  isRoot?: boolean;
  level?: number;
}

function OrgNode({ person, isRoot, level = 0 }: OrgNodeProps) {
  const hasChildren = person.children && person.children.length > 0;
  
  return (
    <div className="flex flex-col items-center">
      <PersonCard person={person} isRoot={isRoot} />
      
      {hasChildren && (
        <>
          {/* Vertical line */}
          <div className={cn(
            "w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-200",
            "dark:from-gray-600 dark:to-gray-700"
          )} />
          
          {/* Horizontal connector */}
          {person.children!.length > 1 && (
            <div className="relative h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"
              style={{ width: `${Math.max((person.children!.length - 1) * 180, 100)}px` }}
            />
          )}
          
          {/* Children container */}
          <div className="flex gap-2 pt-0">
            {person.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className={cn(
                  "w-0.5 h-8 bg-gradient-to-b from-gray-200 to-gray-300",
                  "dark:from-gray-700 dark:to-gray-600"
                )} />
                <OrgNode person={child} level={level + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgChart() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/team");
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.employees || []);
        } else {
          setError("Failed to load team data");
        }
      } catch (err) {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">กำลังโหลด...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        {error}
      </div>
    );
  }

  const orgTree = buildOrgTree(employees);

  if (!orgTree) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        ไม่มีข้อมูลพนักงาน
      </div>
    );
  }

  // Count unique departments
  const deptCount = new Set(employees.map(e => e.department)).size;

  return (
    <div className="w-full overflow-x-auto">
      {/* Background pattern */}
      <div className="relative min-w-max">
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Chart */}
        <div className="relative flex flex-col items-center py-12 px-8">
          <OrgNode person={orgTree} isRoot />
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-dashed">
        {Object.entries(departmentNames).map(([id, name]) => {
          const config = departmentConfig[id];
          const count = employees.filter(e => e.department === id).length;
          if (count === 0) return null;
          return (
            <div 
              key={id} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={cn(
                "w-3 h-3 rounded-full bg-gradient-to-r shadow-sm",
                config?.gradient || "from-gray-400 to-gray-500"
              )} />
              <span className="text-xs font-medium text-muted-foreground">{name} ({count})</span>
            </div>
          );
        })}
      </div>
      
      {/* Stats */}
      <div className="flex justify-center gap-8 mt-6 text-center">
        <div>
          <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            {deptCount}
          </p>
          <p className="text-xs text-muted-foreground">ทีม</p>
        </div>
        <div>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            {employees.length}
          </p>
          <p className="text-xs text-muted-foreground">คน</p>
        </div>
      </div>
    </div>
  );
}
