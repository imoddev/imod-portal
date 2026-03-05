"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Check, X, FileText, AlertCircle } from "lucide-react";

const LEAVE_TYPES = [
  { value: "sick", label: "ลาป่วย", quota: 30, note: "เกิน 3 วัน ต้องแนบใบรับรองแพทย์" },
  { value: "personal", label: "ลากิจส่วนตัว", quota: 5, note: "มี checkbox ฉุกเฉิน" },
  { value: "annual", label: "ลาพักร้อน", quota: 6, note: "ต้องทำงานครบ 1 ปี" },
  { value: "wedding", label: "ลาแต่งงาน", quota: 3, note: "ใช้ได้ 1 ครั้งตลอดอายุงาน" },
  { value: "ordination", label: "ลาบวช", quota: 15, note: "ใช้ได้ 1 ครั้ง" },
  { value: "childSick", label: "ลาบุตรป่วย", quota: 3, note: "" },
];

export default function LeavePage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    isEmergency: false,
    attachment: "",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/hr/leave");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // Check if sick leave > 3 days requires attachment
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (formData.leaveType === "sick" && days > 3 && !formData.attachment) {
      alert("ลาป่วยเกิน 3 วัน ต้องแนบใบรับรองแพทย์");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: session?.user?.email,
          employeeName: session?.user?.name,
          ...formData,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowForm(false);
        setFormData({
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
          isEmergency: false,
          attachment: "",
        });
        fetchRequests();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string, action: "approve" | "reject") => {
    const rejectReason = action === "reject" ? prompt("เหตุผลที่ปฏิเสธ:") : undefined;
    if (action === "reject" && !rejectReason) return;

    try {
      const res = await fetch("/api/hr/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action,
          approvedBy: session?.user?.email,
          approverName: session?.user?.name,
          rejectReason,
        }),
      });
      
      const data = await res.json();
      alert(data.message);
      fetchRequests();
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">รออนุมัติ</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700">อนุมัติแล้ว</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700">ไม่อนุมัติ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    return LEAVE_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">ระบบลางาน</h1>
          <p className="text-muted-foreground">ขอลา, ตรวจสอบโควตา, อนุมัติคำขอ</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              ขอลางาน
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>ขอลางาน</DialogTitle>
              <DialogDescription>
                กรอกรายละเอียดการลา
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Leave Type */}
              <div>
                <Label>ประเภทการลา</Label>
                <Select value={formData.leaveType} onValueChange={(v) => setFormData({...formData, leaveType: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} ({type.quota} วัน/ปี)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.leaveType && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {LEAVE_TYPES.find(t => t.value === formData.leaveType)?.note}
                  </p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>วันที่เริ่ม</Label>
                  <Input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>วันที่สิ้นสุด</Label>
                  <Input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label>เหตุผล</Label>
                <Textarea 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="ระบุเหตุผลการลา..."
                />
              </div>

              {/* Emergency checkbox for personal leave */}
              {formData.leaveType === "personal" && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emergency" 
                    checked={formData.isEmergency}
                    onCheckedChange={(checked) => setFormData({...formData, isEmergency: !!checked})}
                  />
                  <Label htmlFor="emergency">ลาฉุกเฉิน</Label>
                </div>
              )}

              {/* Attachment for sick leave */}
              {formData.leaveType === "sick" && (
                <div>
                  <Label>แนบใบรับรองแพทย์ (URL)</Label>
                  <Input 
                    value={formData.attachment}
                    onChange={(e) => setFormData({...formData, attachment: e.target.value})}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    จำเป็นต้องแนบหากลาป่วยเกิน 3 วัน
                  </p>
                </div>
              )}

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? "กำลังส่ง..." : "ส่งคำขอลา"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Types Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {LEAVE_TYPES.map((type) => (
          <Card key={type.value}>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{type.label}</p>
              <p className="text-2xl font-bold">{type.quota}</p>
              <p className="text-xs text-muted-foreground">วัน/ปี</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>คำขอลาทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">กำลังโหลด...</p>
          ) : requests.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">ไม่มีคำขอลา</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{req.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {getLeaveTypeLabel(req.leaveType)} • {req.totalDays} วัน
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(req.startDate).toLocaleDateString("th-TH")} - {new Date(req.endDate).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(req.status)}
                    {req.status === "pending" && (
                      <>
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleApprove(req.id, "approve")}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleApprove(req.id, "reject")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
