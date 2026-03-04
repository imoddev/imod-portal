"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

// iMoD Organization Structure (Updated: Mar 2026)
const orgData: OrgPerson = {
  id: "ceo",
  name: "อรรถพล ทะแพงพันธ์",
  nickname: "ต้อม",
  role: "admin",
  title: "CEO & Founder",
  department: "management",
  children: [
    // Content IT Team
    {
      id: "content-it-lead",
      name: "ฐิติรัตน์ กินเรศ",
      nickname: "เต็นท์",
      role: "lead",
      title: "หัวหน้าทีม Content IT",
      department: "content-it",
      children: [
        { id: "gift", name: "ณัฐธิดา สุริยอดารา", nickname: "กิ๊ฟ", role: "member", title: "Content Writer", department: "content-it" },
        { id: "kan", name: "ศศิธากาญจน์ ศรีทนทิพย์", nickname: "กานต์", role: "member", title: "Content Writer", department: "content-it" },
        { id: "baikun", name: "กรองกาญจน์ ฤทธิ์วงศ์", nickname: "ใบคูณ", role: "member", title: "Content Writer", department: "content-it" },
        { id: "art-content", name: "ศักดาพัฒน์ กอดจัน", nickname: "อาร์ต", role: "member", title: "Content Writer", department: "content-it" },
      ],
    },
    // Content EV Team
    {
      id: "content-ev-lead",
      name: "Zakura Kim",
      nickname: "ซากุระ",
      role: "lead",
      title: "หัวหน้าทีม Content EV",
      department: "content-ev",
      children: [
        { id: "pun", name: "ปุณ", nickname: "ปุน", role: "member", title: "Content Writer", department: "content-ev" },
      ],
    },
    // Revenue Team
    {
      id: "revenue-lead",
      name: "มิวกิ",
      nickname: "มิว",
      role: "lead",
      title: "หัวหน้าฝ่าย Revenue",
      department: "revenue",
      children: [
        { id: "ai", name: "ทิพวรรณ", nickname: "อาย", role: "member", title: "HR & Sales Support", department: "revenue" },
        { id: "sa", name: "น้องสา", nickname: "สา", role: "member", title: "ฝ่ายบัญชี", department: "revenue" },
      ],
    },
    // Production Team
    {
      id: "production-lead",
      name: "พี่เอ็ม",
      nickname: "เอ็ม",
      role: "lead",
      title: "หัวหน้าทีม Production",
      department: "production",
      children: [
        { id: "ping", name: "พี่ผิง", nickname: "ผิง", role: "member", title: "รองหัวหน้าทีม", department: "production" },
        { id: "art-prod", name: "อาร์ต", nickname: "อาร์ต", role: "member", title: "Video Editor", department: "production" },
        { id: "ness", name: "เนส", nickname: "เนส", role: "member", title: "Video Editor", department: "production" },
        { id: "june", name: "จูน", nickname: "จูน", role: "member", title: "Cameraman", department: "production" },
      ],
    },
    // Creative Team
    {
      id: "creative-lead",
      name: "พี่ฟู",
      nickname: "ฟู",
      role: "lead",
      title: "Creative Director",
      department: "creative",
    },
    // Dev Team
    {
      id: "dev-lead",
      name: "พี่ยิม",
      nickname: "ยิม",
      role: "lead",
      title: "Lead Developer",
      department: "dev",
      children: [
        { id: "chart", name: "พี่ชาติ", nickname: "ชาติ", role: "member", title: "Developer", department: "dev" },
      ],
    },
  ],
};

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
            {departmentNames[person.department]}
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
  const config = departmentConfig[person.department] || departmentConfig.dev;
  
  return (
    <div className="flex flex-col items-center">
      <PersonCard person={person} isRoot={isRoot} />
      
      {hasChildren && (
        <>
          {/* Animated vertical line */}
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
            {person.children!.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical connector to child */}
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
  return (
    <div className="w-full overflow-x-auto">
      {/* Background pattern */}
      <div className="relative min-w-max">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Chart */}
        <div className="relative flex flex-col items-center py-12 px-8">
          <OrgNode person={orgData} isRoot />
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-dashed">
        {Object.entries(departmentNames).map(([id, name]) => {
          const config = departmentConfig[id];
          return (
            <div 
              key={id} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={cn(
                "w-3 h-3 rounded-full bg-gradient-to-r shadow-sm",
                config.gradient
              )} />
              <span className="text-xs font-medium text-muted-foreground">{name}</span>
            </div>
          );
        })}
      </div>
      
      {/* Stats */}
      <div className="flex justify-center gap-8 mt-6 text-center">
        <div>
          <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            6
          </p>
          <p className="text-xs text-muted-foreground">ทีม</p>
        </div>
        <div>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            17
          </p>
          <p className="text-xs text-muted-foreground">คน</p>
        </div>
      </div>
    </div>
  );
}

export { orgData };
