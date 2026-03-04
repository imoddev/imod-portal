"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Loader2,
  CalendarDays,
  Briefcase,
  Plane,
  Heart,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  FileText,
} from "lucide-react";

// Types
interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface OTRequest {
  id: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  otType: string;
  reason: string;
  status: string;
}

interface AllowanceRequest {
  id: string;
  employeeName: string;
  allowanceType: string;
  date: string;
  amount: number;
  description: string;
  status: string;
}

interface LeaveBalance {
  sickLeaveQuota: number;
  personalLeaveQuota: number;
  annualLeaveQuota: number;
  sickLeaveUsed: number;
  personalLeaveUsed: number;
  annualLeaveUsed: number;
  sickLeaveRemaining: number;
  personalLeaveRemaining: number;
  annualLeaveRemaining: number;
}

const leaveTypes = [
  { id: "sick", name: "ลาป่วย", icon: Heart, color: "text-red-500" },
  { id: "personal", name: "ลากิจ", icon: Briefcase, color: "text-blue-500" },
  { id: "annual", name: "ลาพักร้อน", icon: Plane, color: "text-green-500" },
  { id: "maternity", name: "ลาคลอด", icon: Heart, color: "text-pink-500" },
  { id: "ordination", name: "ลาบวช", icon: Calendar, color: "text-yellow-500" },
  { id: "other", name: "อื่นๆ", icon: FileText, color: "text-gray-500" },
];

const otTypes = [
  { id: "normal", name: "OT ปกติ (1.5x)", multiplier: 1.5 },
  { id: "holiday", name: "OT วันหยุด (2x)", multiplier: 2.0 },
  { id: "special", name: "OT พิเศษ (3x)", multiplier: 3.0 },
];

const allowanceTypes = [
  { id: "daily", name: "เบี้ยเลี้ยงทั่วไป", requireReceipt: false },
  { id: "travel", name: "ค่าเดินทาง", requireReceipt: true },
  { id: "meal", name: "ค่าอาหาร", requireReceipt: true },
  { id: "accommodation", name: "ค่าที่พัก", requireReceipt: true },
  { id: "fuel", name: "ค่าน้ำมัน", requireReceipt: true },
  { id: "phone", name: "ค่าโทรศัพท์", requireReceipt: true },
  { id: "other", name: "อื่นๆ", requireReceipt: true },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
  cancelled: "bg-gray-500/20 text-gray-500",
};

const statusLabels: Record<string, string> = {
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ",
  cancelled: "ยกเลิก",
};

export default function HRPage() {
  const [activeTab, setActiveTab] = useState("leave");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [otRequests, setOTRequests] = useState<OTRequest[]>([]);
  const [allowanceRequests, setAllowanceRequests] = useState<AllowanceRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showOTDialog, setShowOTDialog] = useState(false);
  const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  
  const [otForm, setOTForm] = useState({
    date: "",
    startTime: "18:00",
    endTime: "21:00",
    otType: "normal",
    reason: "",
    projectName: "",
  });
  
  const [allowanceForm, setAllowanceForm] = useState({
    allowanceType: "",
    date: "",
    amount: "",
    description: "",
    destination: "",
    receipt: "",
    workDescription: "", // สำหรับเบี้ยเลี้ยงทั่วไป
  });
  const [isUploading, setIsUploading] = useState(false);

  // Mock employee data (ในอนาคตดึงจาก session)
  const currentEmployee = {
    id: "1465635163466633308",
    name: "พี่ต้อม",
    department: "Management",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leaveRes, otRes, allowanceRes, balanceRes] = await Promise.all([
        fetch(`/api/hr/leave?employeeId=${currentEmployee.id}`),
        fetch(`/api/hr/overtime?employeeId=${currentEmployee.id}`),
        fetch(`/api/hr/allowance?employeeId=${currentEmployee.id}`),
        fetch(`/api/hr/balance?employeeId=${currentEmployee.id}`),
      ]);

      if (leaveRes.ok) {
        const data = await leaveRes.json();
        setLeaveRequests(data.requests || []);
      }
      if (otRes.ok) {
        const data = await otRes.json();
        setOTRequests(data.requests || []);
      }
      if (allowanceRes.ok) {
        const data = await allowanceRes.json();
        setAllowanceRequests(data.requests || []);
      }
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setLeaveBalance(data.balance || null);
      }
    } catch (error) {
      console.error("Error fetching HR data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitLeaveRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hr/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          department: currentEmployee.department,
          ...leaveForm,
        }),
      });

      if (res.ok) {
        setShowLeaveDialog(false);
        setLeaveForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOTRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hr/overtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          department: currentEmployee.department,
          ...otForm,
        }),
      });

      if (res.ok) {
        setShowOTDialog(false);
        setOTForm({ date: "", startTime: "18:00", endTime: "21:00", otType: "normal", reason: "", projectName: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error submitting OT request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAllowanceRequest = async () => {
    // Validate
    if (!allowanceForm.allowanceType) {
      alert("กรุณาเลือกประเภทเบี้ยเลี้ยง");
      return;
    }
    if (!allowanceForm.date || !allowanceForm.amount) {
      alert("กรุณากรอกวันที่และจำนวนเงิน");
      return;
    }
    
    // Check description based on type
    if (allowanceForm.allowanceType === "daily") {
      if (!allowanceForm.workDescription) {
        alert("กรุณาระบุงานที่ทำ");
        return;
      }
    } else {
      if (!allowanceForm.description) {
        alert("กรุณากรอกรายละเอียด");
        return;
      }
      // Check receipt for types that require it
      const selectedType = allowanceTypes.find(t => t.id === allowanceForm.allowanceType);
      if (selectedType?.requireReceipt && !allowanceForm.receipt) {
        alert("กรุณาแนบหลักฐาน/ใบเสร็จ");
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hr/allowance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          department: currentEmployee.department,
          ...allowanceForm,
        }),
      });

      if (res.ok) {
        setShowAllowanceDialog(false);
        setAllowanceForm({ allowanceType: "", date: "", amount: "", description: "", destination: "", receipt: "", workDescription: "" });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error submitting allowance request:", error);
      alert("เกิดข้อผิดพลาดในการส่งคำขอ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            HR System
          </h1>
          <p className="text-muted-foreground">
            ระบบลา, OT และเบี้ยเลี้ยง
          </p>
        </div>
        <a href="/hr/admin">
          <Button variant="outline">
            🛡️ Admin - อนุมัติคำขอ
          </Button>
        </a>
      </div>

      {/* Leave Balance Summary */}
      {leaveBalance && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ลาป่วย</p>
                  <p className="text-2xl font-bold text-red-500">
                    {leaveBalance.sickLeaveRemaining}/{leaveBalance.sickLeaveQuota}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ใช้ไป {leaveBalance.sickLeaveUsed} วัน
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ลากิจ</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {leaveBalance.personalLeaveRemaining}/{leaveBalance.personalLeaveQuota}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ใช้ไป {leaveBalance.personalLeaveUsed} วัน
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ลาพักร้อน</p>
                  <p className="text-2xl font-bold text-green-500">
                    {leaveBalance.annualLeaveRemaining}/{leaveBalance.annualLeaveQuota}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ใช้ไป {leaveBalance.annualLeaveUsed} วัน
                  </p>
                </div>
                <Plane className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="leave" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            ลา
          </TabsTrigger>
          <TabsTrigger value="overtime" className="gap-2">
            <Clock className="h-4 w-4" />
            OT
          </TabsTrigger>
          <TabsTrigger value="allowance" className="gap-2">
            <DollarSign className="h-4 w-4" />
            เบี้ยเลี้ยง
          </TabsTrigger>
        </TabsList>

        {/* Leave Tab */}
        <TabsContent value="leave" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">คำขอลา</h2>
            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  ขอลา
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ยื่นคำขอลา</DialogTitle>
                  <DialogDescription>
                    กรอกรายละเอียดการลา
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>ประเภทการลา</Label>
                    <Select
                      value={leaveForm.leaveType}
                      onValueChange={(v) => setLeaveForm({ ...leaveForm, leaveType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>วันที่เริ่มต้น</Label>
                      <Input
                        type="date" className="[color-scheme:dark]"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>วันที่สิ้นสุด</Label>
                      <Input
                        type="date" className="[color-scheme:dark]"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>เหตุผล</Label>
                    <Textarea
                      placeholder="ระบุเหตุผลการลา"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={submitLeaveRequest} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    ส่งคำขอ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>ไม่มีคำขอลา</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaveRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">
                            {leaveTypes.find(t => t.id === request.leaveType)?.name || request.leaveType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.startDate).toLocaleDateString("th-TH")} - {new Date(request.endDate).toLocaleDateString("th-TH")}
                            {" "}({request.totalDays} วัน)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {request.reason}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusColors[request.status]}>
                        {statusLabels[request.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OT Tab */}
        <TabsContent value="overtime" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">คำขอ OT</h2>
            <Dialog open={showOTDialog} onOpenChange={setShowOTDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  ขอ OT
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ยื่นคำขอ OT</DialogTitle>
                  <DialogDescription>
                    กรอกรายละเอียดการทำงานล่วงเวลา
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>วันที่</Label>
                    <Input
                      type="date" className="[color-scheme:dark]"
                      value={otForm.date}
                      onChange={(e) => setOTForm({ ...otForm, date: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>เวลาเริ่ม</Label>
                      <Input
                        type="time"
                        value={otForm.startTime}
                        onChange={(e) => setOTForm({ ...otForm, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>เวลาสิ้นสุด</Label>
                      <Input
                        type="time"
                        value={otForm.endTime}
                        onChange={(e) => setOTForm({ ...otForm, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ประเภท OT</Label>
                    <Select
                      value={otForm.otType}
                      onValueChange={(v) => setOTForm({ ...otForm, otType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {otTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ชื่องาน/โปรเจค</Label>
                    <Input
                      placeholder="ระบุชื่องาน"
                      value={otForm.projectName}
                      onChange={(e) => setOTForm({ ...otForm, projectName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>เหตุผล</Label>
                    <Textarea
                      placeholder="ระบุเหตุผลการขอ OT"
                      value={otForm.reason}
                      onChange={(e) => setOTForm({ ...otForm, reason: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowOTDialog(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={submitOTRequest} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    ส่งคำขอ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : otRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>ไม่มีคำขอ OT</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {otRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(request.date).toLocaleDateString("th-TH")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.startTime} - {request.endTime} ({request.totalHours} ชม.)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {otTypes.find(t => t.id === request.otType)?.name} • {request.reason}
                        </p>
                      </div>
                      <Badge className={statusColors[request.status]}>
                        {statusLabels[request.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allowance Tab */}
        <TabsContent value="allowance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">คำขอเบี้ยเลี้ยง</h2>
            <Dialog open={showAllowanceDialog} onOpenChange={setShowAllowanceDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  ขอเบี้ยเลี้ยง
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ยื่นคำขอเบี้ยเลี้ยง</DialogTitle>
                  <DialogDescription>
                    กรอกรายละเอียดค่าใช้จ่าย
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>ประเภท</Label>
                    <Select
                      value={allowanceForm.allowanceType}
                      onValueChange={(v) => setAllowanceForm({ ...allowanceForm, allowanceType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowanceTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>วันที่</Label>
                      <Input
                        type="date" className="[color-scheme:dark]"
                        value={allowanceForm.date}
                        onChange={(e) => setAllowanceForm({ ...allowanceForm, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>จำนวนเงิน (บาท)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={allowanceForm.amount}
                        onChange={(e) => setAllowanceForm({ ...allowanceForm, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  {/* แสดงตามประเภท */}
                  {allowanceForm.allowanceType === "daily" ? (
                    // เบี้ยเลี้ยงทั่วไป - ระบุงานที่ทำ
                    <div className="space-y-2">
                      <Label>งานที่ทำ *</Label>
                      <Textarea
                        placeholder="ระบุงานที่ทำในวันนั้น"
                        value={allowanceForm.workDescription}
                        onChange={(e) => setAllowanceForm({ ...allowanceForm, workDescription: e.target.value, description: e.target.value })}
                      />
                    </div>
                  ) : (
                    // ประเภทอื่น - ต้องมีใบเสร็จ
                    <>
                      <div className="space-y-2">
                        <Label>สถานที่ (กรณีเดินทาง)</Label>
                        <Input
                          placeholder="ระบุสถานที่"
                          value={allowanceForm.destination}
                          onChange={(e) => setAllowanceForm({ ...allowanceForm, destination: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>รายละเอียด</Label>
                        <Textarea
                          placeholder="ระบุรายละเอียด"
                          value={allowanceForm.description}
                          onChange={(e) => setAllowanceForm({ ...allowanceForm, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>หลักฐาน/ใบเสร็จ *</Label>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          className="[color-scheme:dark]"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setIsUploading(true);
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append("folder", "receipts");
                              
                              const res = await fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                              });
                              
                              if (res.ok) {
                                const data = await res.json();
                                setAllowanceForm({ ...allowanceForm, receipt: data.url });
                              } else {
                                const data = await res.json();
                                alert(data.error || "อัปโหลดไม่สำเร็จ");
                              }
                            } catch (err) {
                              alert("อัปโหลดไม่สำเร็จ");
                            } finally {
                              setIsUploading(false);
                            }
                          }}
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> กำลังอัปโหลด...
                          </p>
                        )}
                        {allowanceForm.receipt && (
                          <p className="text-xs text-green-500">✅ อัปโหลดสำเร็จ</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          รองรับ: JPG, PNG, PDF (ไม่เกิน 10MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAllowanceDialog(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={submitAllowanceRequest} disabled={isSubmitting || isUploading}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    ส่งคำขอ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : allowanceRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>ไม่มีคำขอเบี้ยเลี้ยง</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allowanceRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {allowanceTypes.find(t => t.id === request.allowanceType)?.name || request.allowanceType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.date).toLocaleDateString("th-TH")} • ฿{request.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.description}
                        </p>
                      </div>
                      <Badge className={statusColors[request.status]}>
                        {statusLabels[request.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
