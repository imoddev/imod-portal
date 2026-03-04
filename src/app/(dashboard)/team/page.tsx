"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Briefcase,
  Loader2,
  Pencil,
  Trash2,
  LayoutGrid,
  GitBranch,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgChart } from "@/components/team/org-chart";

interface Employee {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  department: string;
  jobTitle: string | null;
  role: string;
  profileImage: string | null;
  discordId: string | null;
  lineId: string | null;
}

const departments = [
  { id: "management", name: "Management", color: "bg-purple-500" },
  { id: "content-it", name: "Content IT", color: "bg-blue-500" },
  { id: "content-ev", name: "Content EV", color: "bg-green-500" },
  { id: "revenue", name: "Revenue", color: "bg-yellow-500" },
  { id: "production", name: "Production", color: "bg-red-500" },
  { id: "creative", name: "Creative", color: "bg-pink-500" },
  { id: "dev", name: "Development", color: "bg-gray-500" },
];

const roles = [
  { id: "admin", name: "Admin" },
  { id: "manager", name: "Manager" },
  { id: "lead", name: "Lead" },
  { id: "member", name: "Member" },
];

const emptyForm = {
  name: "",
  nickname: "",
  email: "",
  phone: "",
  department: "",
  jobTitle: "",
  role: "member",
  discordId: "",
  lineId: "",
};

export default function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Employee[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewMode, setViewMode] = useState<"list" | "org">("list");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
        setGrouped(data.grouped || {});
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.department) {
      alert("กรุณากรอกชื่อและแผนก");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setForm(emptyForm);
        fetchEmployees();
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingEmployee || !form.name || !form.department) {
      alert("กรุณากรอกชื่อและแผนก");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/team/${editingEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowEditDialog(false);
        setEditingEmployee(null);
        setForm(emptyForm);
        fetchEmployees();
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`ต้องการลบ "${emp.name}" ออกจากระบบ?`)) return;

    try {
      const res = await fetch(`/api/team/${emp.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchEmployees();
      }
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const openEditDialog = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      name: emp.name,
      nickname: emp.nickname || "",
      email: emp.email || "",
      phone: emp.phone || "",
      department: emp.department,
      jobTitle: emp.jobTitle || "",
      role: emp.role,
      discordId: emp.discordId || "",
      lineId: emp.lineId || "",
    });
    setShowEditDialog(true);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       emp.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = filterDept === "all" || emp.department === filterDept;
    return matchSearch && matchDept;
  });

  // Group filtered
  const filteredGrouped = filteredEmployees.reduce((acc: Record<string, Employee[]>, emp) => {
    if (!acc[emp.department]) acc[emp.department] = [];
    acc[emp.department].push(emp);
    return acc;
  }, {});

  // Form fields component (reused for Add and Edit)
  const FormFields = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>ชื่อ-สกุล *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ชื่อจริง นามสกุล"
          />
        </div>
        <div className="space-y-2">
          <Label>ชื่อเล่น</Label>
          <Input
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            placeholder="ชื่อเล่น"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>แผนก *</Label>
          <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกแผนก" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Role *</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>ตำแหน่ง</Label>
          <Input
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            placeholder="ตำแหน่งงาน เช่น Content Writer"
          />
        </div>
        <div className="space-y-2">
          <Label>Email (สำหรับ Login)</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@gmail.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>เบอร์โทร</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="08x-xxx-xxxx"
          />
        </div>
        <div className="space-y-2">
          <Label>Discord ID</Label>
          <Input
            value={form.discordId}
            onChange={(e) => setForm({ ...form, discordId: e.target.value })}
            placeholder="123456789012345678"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Team Directory
          </h1>
          <p className="text-muted-foreground">
            รายชื่อทีมงาน iMoD ({employees.length} คน)
          </p>
        </div>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setForm(emptyForm);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มพนักงาน
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
            </DialogHeader>
            <FormFields />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleAdd} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) {
          setEditingEmployee(null);
          setForm(emptyForm);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
          </DialogHeader>
          <FormFields />
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={() => editingEmployee && handleDelete(editingEmployee)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              ลบ
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleEdit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                บันทึก
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "org")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              รายชื่อ
            </TabsTrigger>
            <TabsTrigger value="org" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Org Chart
            </TabsTrigger>
          </TabsList>

          {viewMode === "list" && (
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="ค้นหาชื่อ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกแผนก</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Org Chart View */}
        <TabsContent value="org" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <OrgChart />
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
      {/* Team Grid by Department */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : Object.keys(filteredGrouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>ยังไม่มีข้อมูลพนักงาน</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มพนักงานคนแรก
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {departments.map((dept) => {
            const deptEmployees = filteredGrouped[dept.id];
            if (!deptEmployees || deptEmployees.length === 0) return null;

            return (
              <Card key={dept.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                    {dept.name}
                    <Badge variant="secondary">{deptEmployees.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {deptEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => openEditDialog(emp)}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 hover:border-primary/50 transition-colors cursor-pointer group"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={emp.profileImage || undefined} />
                          <AvatarFallback className={dept.color + " text-white"}>
                            {emp.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {emp.name}
                            {emp.nickname && <span className="text-muted-foreground"> ({emp.nickname})</span>}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {emp.jobTitle || "-"}
                          </p>
                          {emp.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {emp.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {emp.role !== "member" && (
                            <Badge variant="outline" className="text-xs">
                              {roles.find(r => r.id === emp.role)?.name}
                            </Badge>
                          )}
                          <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
