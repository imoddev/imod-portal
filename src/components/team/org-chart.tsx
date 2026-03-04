"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

// iMoD Organization Structure
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
        { id: "non", name: "นนท์", nickname: "นน", role: "member", title: "Content Writer", department: "content-ev" },
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
      children: [
        { id: "tan", name: "พี่ตาณ", nickname: "ตาณ", role: "member", title: "Graphic Designer", department: "creative" },
      ],
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

const departmentColors: Record<string, string> = {
  management: "bg-purple-500",
  "content-it": "bg-blue-500",
  "content-ev": "bg-green-500",
  revenue: "bg-yellow-500",
  production: "bg-red-500",
  creative: "bg-pink-500",
  dev: "bg-gray-600",
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
  const color = departmentColors[person.department] || "bg-gray-500";
  
  return (
    <Card className={cn(
      "p-3 w-48 hover:shadow-lg transition-shadow cursor-pointer",
      isRoot && "border-2 border-primary bg-primary/5"
    )}>
      <div className="flex flex-col items-center text-center gap-2">
        <Avatar className={cn("h-12 w-12 ring-2 ring-offset-2", `ring-${person.department}`)}>
          <AvatarImage src={person.avatar} />
          <AvatarFallback className={cn(color, "text-white font-medium")}>
            {person.nickname?.[0] || person.name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm leading-tight">
            {person.nickname || person.name}
          </p>
          <p className="text-xs text-muted-foreground">{person.title}</p>
        </div>
        {person.role !== "member" && (
          <Badge variant="outline" className="text-[10px]">
            {person.role === "admin" ? "CEO" : person.role === "lead" ? "Lead" : person.role}
          </Badge>
        )}
      </div>
    </Card>
  );
}

interface OrgNodeProps {
  person: OrgPerson;
  isRoot?: boolean;
}

function OrgNode({ person, isRoot }: OrgNodeProps) {
  const hasChildren = person.children && person.children.length > 0;
  
  return (
    <div className="flex flex-col items-center">
      <PersonCard person={person} isRoot={isRoot} />
      
      {hasChildren && (
        <>
          {/* Vertical line down */}
          <div className="w-px h-6 bg-border" />
          
          {/* Horizontal line */}
          {person.children!.length > 1 && (
            <div 
              className="h-px bg-border"
              style={{ 
                width: `calc(${(person.children!.length - 1) * 200}px)` 
              }} 
            />
          )}
          
          {/* Children */}
          <div className="flex gap-4 pt-0">
            {person.children!.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center">
                {person.children!.length > 1 && (
                  <div className="w-px h-6 bg-border" />
                )}
                <OrgNode person={child} />
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
    <div className="w-full overflow-x-auto pb-8">
      <div className="min-w-max flex flex-col items-center py-8">
        {/* CEO */}
        <OrgNode person={orgData} isRoot />
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-8 pt-4 border-t">
        {Object.entries(departmentNames).map(([id, name]) => (
          <div key={id} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", departmentColors[id])} />
            <span className="text-xs text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { orgData };
