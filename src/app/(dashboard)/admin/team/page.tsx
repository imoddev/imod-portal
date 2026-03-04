"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  Search,
  Mail,
  Shield,
  UserCog,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { teamMembers, departmentLabels, type TeamMember, type Department } from "@/lib/team-data";

const roleColors = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  member: "bg-gray-100 text-gray-700",
};

const departmentColors: Record<Department, string> = {
  management: "bg-purple-100 text-purple-700",
  "content-it": "bg-blue-100 text-blue-700",
  "content-ev": "bg-green-100 text-green-700",
  revenue: "bg-yellow-100 text-yellow-700",
  production: "bg-orange-100 text-orange-700",
  creative: "bg-pink-100 text-pink-700",
  dev: "bg-cyan-100 text-cyan-700",
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | "all">("all");

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Group by department
  const departments = Object.keys(departmentLabels) as Department[];
  
  // Stats
  const totalMembers = teamMembers.length;
  const adminCount = teamMembers.filter((m) => m.role === "admin").length;
  const managerCount = teamMembers.filter((m) => m.role === "manager").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            จัดการสมาชิกในทีม
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มสมาชิก
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalMembers}</p>
                <p className="text-sm text-muted-foreground">สมาชิกทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{adminCount}</p>
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{managerCount}</p>
                <p className="text-sm text-muted-foreground">Manager</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-sm text-muted-foreground">แผนก</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาสมาชิก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedDepartment === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDepartment("all")}
          >
            ทั้งหมด
          </Button>
          {departments.map((dept) => (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
            >
              {departmentLabels[dept]}
            </Button>
          ))}
        </div>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>สมาชิก ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {member.nickname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{member.nickname}</p>
                    <Badge className={roleColors[member.role]}>
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={departmentColors[member.department]}>
                      {departmentLabels[member.department]}
                    </Badge>
                    {member.email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
