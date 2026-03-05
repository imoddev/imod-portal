"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarDays,
  Clock,
  DollarSign,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  RefreshCw,
} from "lucide-react";

interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
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
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  otType: string;
  multiplier: number;
  reason: string;
  projectName: string;
  status: string;
}

interface AllowanceRequest {
  id: string;
  employeeName: string;
  department: string;
  allowanceType: string;
  date: string;
  amount: number;
  description: string;
  destination: string;
  status: string;
}

const leaveTypeNames: Record<string, string> = {
  sick: "ลาป่วย",
  personal: "ลากิจ",
  annual: "ลาพักร้อน",
  maternity: "ลาคลอด",
  ordination: "ลาบวช",
  other: "อื่นๆ",
};

const allowanceTypeNames: Record<string, string> = {
  travel: "ค่าเดินทาง",
  meal: "ค่าอาหาร",
  accommodation: "ค่าที่พัก",
  fuel: "ค่าน้ำมัน",
  phone: "ค่าโทรศัพท์",
  other: "อื่นๆ",
};

export default function HRAdminPage() {
  const [activeTab, setActiveTab] = useState("leave");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [otRequests, setOTRequests] = useState<OTRequest[]>([]);
  const [allowanceRequests, setAllowanceRequests] = useState<AllowanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reject dialog
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; type: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all statuses for admin view
      const [leaveRes, otRes, allowanceRes] = await Promise.all([
        fetch("/api/hr/leave"),
        fetch("/api/hr/overtime"),
        fetch("/api/hr/allowance"),
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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, type: string) => {
    setIsProcessing(true);
    try {
      const endpoint = type === "leave" ? "leave" : type === "ot" ? "overtime" : "allowance";
      const res = await fetch(`/api/hr/${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          approvedBy: "Admin", // ในอนาคตดึงจาก session
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error approving:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      const endpoint = selectedRequest.type === "leave" ? "leave" : 
                       selectedRequest.type === "ot" ? "overtime" : "allowance";
      
      const res = await fetch(`/api/hr/${endpoint}/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          approvedBy: "Admin",
          rejectReason,
        }),
      });

      if (res.ok) {
        setShowRejectDialog(false);
        setSelectedRequest(null);
        setRejectReason("");
        fetchData();
      }
    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter data based on status
  const filterByStatus = <T extends { status: string }>(items: T[]) => {
    if (statusFilter === "all") return items;
    return items.filter(item => item.status === statusFilter);
  };

  const filteredLeave = filterByStatus(leaveRequests);
  const filteredOT = filterByStatus(otRequests);
  const filteredAllowance = filterByStatus(allowanceRequests);

  const pendingCounts = {
    leave: leaveRequests.filter(r => r.status === "pending").length,
    ot: otRequests.filter(r => r.status === "pending").length,
    allowance: allowanceRequests.filter(r => r.status === "pending").length,
  };
  
  const totalCounts = {
    leave: leaveRequests.length,
    ot: otRequests.length,
    allowance: allowanceRequests.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            HR Admin - อนุมัติคำขอ
          </h1>
          <p className="text-muted-foreground">
            จัดการคำขอลา, OT และเบี้ยเลี้ยง
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รออนุมัติ</SelectItem>
              <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
              <SelectItem value="rejected">ปฏิเสธ</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">คำขอลารออนุมัติ</p>
                <p className="text-3xl font-bold text-yellow-500">{pendingCounts.leave}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-yellow-500/40" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">คำขอ OT รออนุมัติ</p>
                <p className="text-3xl font-bold text-blue-500">{pendingCounts.ot}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500/40" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">เบี้ยเลี้ยงรออนุมัติ</p>
                <p className="text-3xl font-bold text-green-500">{pendingCounts.allowance}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="leave" className="gap-2">
            ลา {pendingCounts.leave > 0 && <Badge variant="secondary">{pendingCounts.leave}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="ot" className="gap-2">
            OT {pendingCounts.ot > 0 && <Badge variant="secondary">{pendingCounts.ot}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="allowance" className="gap-2">
            เบี้ยเลี้ยง {pendingCounts.allowance > 0 && <Badge variant="secondary">{pendingCounts.allowance}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Leave Tab */}
        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>คำขอลา ({statusFilter === "all" ? "ทั้งหมด" : statusFilter === "pending" ? "รออนุมัติ" : statusFilter === "approved" ? "อนุมัติแล้ว" : "ปฏิเสธ"})</CardTitle>
              <CardDescription>แสดง {filteredLeave.length} รายการ จากทั้งหมด {totalCounts.leave} รายการ</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredLeave.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>ไม่มีคำขอ{statusFilter === "pending" ? "รออนุมัติ" : ""}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeave.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{request.employeeName}</p>
                          <Badge variant="outline">{request.department || "ไม่ระบุแผนก"}</Badge>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">{leaveTypeNames[request.leaveType] || request.leaveType}</span>
                          {" • "}
                          {new Date(request.startDate).toLocaleDateString("th-TH")} - {new Date(request.endDate).toLocaleDateString("th-TH")}
                          {" • "}<span className="text-primary">{request.totalDays} วัน</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          💬 {request.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ส่งเมื่อ {new Date(request.createdAt).toLocaleString("th-TH")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <Badge 
                          variant={request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "secondary"}
                          className={request.status === "approved" ? "bg-green-600" : ""}
                        >
                          {request.status === "approved" ? "✓ อนุมัติ" : request.status === "rejected" ? "✗ ปฏิเสธ" : "⏳ รอ"}
                        </Badge>
                        
                        {/* Action Buttons - only show for pending */}
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => {
                                setSelectedRequest({ id: request.id, type: "leave" });
                                setShowRejectDialog(true);
                              }}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              ไม่อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(request.id, "leave")}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  อนุมัติ
                                </>
                              )}
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
        </TabsContent>

        {/* OT Tab */}
        <TabsContent value="ot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>คำขอ OT ({statusFilter === "all" ? "ทั้งหมด" : statusFilter === "pending" ? "รออนุมัติ" : statusFilter === "approved" ? "อนุมัติแล้ว" : "ปฏิเสธ"})</CardTitle>
              <CardDescription>แสดง {filteredOT.length} รายการ จากทั้งหมด {totalCounts.ot} รายการ</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredOT.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>ไม่มีคำขอ{statusFilter === "pending" ? "รออนุมัติ" : ""}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOT.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{request.employeeName}</p>
                          <Badge variant="outline">{request.department || "ไม่ระบุแผนก"}</Badge>
                        </div>
                        <p className="text-sm">
                          📅 {new Date(request.date).toLocaleDateString("th-TH")}
                          {" • "}
                          🕐 {request.startTime} - {request.endTime}
                          {" • "}
                          <span className="text-primary">{request.totalHours} ชม. ({request.multiplier}x)</span>
                        </p>
                        {request.projectName && (
                          <p className="text-sm">📁 {request.projectName}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          💬 {request.reason}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "secondary"}
                          className={request.status === "approved" ? "bg-green-600" : ""}
                        >
                          {request.status === "approved" ? "✓ อนุมัติ" : request.status === "rejected" ? "✗ ปฏิเสธ" : "⏳ รอ"}
                        </Badge>
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => {
                                setSelectedRequest({ id: request.id, type: "ot" });
                                setShowRejectDialog(true);
                              }}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              ไม่อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(request.id, "ot")}
                              disabled={isProcessing}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              อนุมัติ
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
        </TabsContent>

        {/* Allowance Tab */}
        <TabsContent value="allowance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>เบี้ยเลี้ยง ({statusFilter === "all" ? "ทั้งหมด" : statusFilter === "pending" ? "รออนุมัติ" : statusFilter === "approved" ? "อนุมัติแล้ว" : "ปฏิเสธ"})</CardTitle>
              <CardDescription>แสดง {filteredAllowance.length} รายการ จากทั้งหมด {totalCounts.allowance} รายการ</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredAllowance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>ไม่มีคำขอ{statusFilter === "pending" ? "รออนุมัติ" : ""}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAllowance.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{request.employeeName}</p>
                          <Badge variant="outline">{request.department || "ไม่ระบุแผนก"}</Badge>
                        </div>
                        <p className="text-sm">
                          📝 {allowanceTypeNames[request.allowanceType] || request.allowanceType}
                          {" • "}
                          📅 {new Date(request.date).toLocaleDateString("th-TH")}
                          {" • "}
                          <span className="text-primary font-medium">฿{request.amount.toLocaleString()}</span>
                        </p>
                        {request.destination && (
                          <p className="text-sm">📍 {request.destination}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          💬 {request.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "secondary"}
                          className={request.status === "approved" ? "bg-green-600" : ""}
                        >
                          {request.status === "approved" ? "✓ อนุมัติ" : request.status === "rejected" ? "✗ ปฏิเสธ" : "⏳ รอ"}
                        </Badge>
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => {
                                setSelectedRequest({ id: request.id, type: "allowance" });
                                setShowRejectDialog(true);
                              }}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              ไม่อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(request.id, "allowance")}
                              disabled={isProcessing}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              อนุมัติ
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
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ไม่อนุมัติคำขอ</DialogTitle>
            <DialogDescription>
              กรุณาระบุเหตุผลที่ไม่อนุมัติ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>เหตุผล</Label>
              <Textarea
                placeholder="ระบุเหตุผลที่ไม่อนุมัติ"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "ยืนยันไม่อนุมัติ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
