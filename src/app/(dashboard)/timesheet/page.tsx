"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Home,
  Building2,
  MapPin,
  Loader2,
  CheckCircle2,
  Timer,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workType: string;
  location: string | null;
  totalHours: number | null;
  otHours: number | null;
}

interface Summary {
  totalDays: number;
  officeDays: number;
  wfhDays: number;
  fieldDays: number;
  totalHours: number;
  totalOT: number;
}

const workTypes = [
  { id: "office", name: "Office", icon: Building2 },
  { id: "wfh", name: "Work from Home", icon: Home },
  { id: "field", name: "Field Work", icon: MapPin },
];

export default function TimesheetPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  
  const [workType, setWorkType] = useState("office");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Mock current employee
  const currentEmployee = {
    id: "1465635163466633308",
    name: "พี่ต้อม",
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch month records
      const res = await fetch(`/api/timesheet?employeeId=${currentEmployee.id}&month=${selectedMonth}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setSummary(data.summary || null);
      }

      // Check today's record
      const today = new Date().toISOString().split("T")[0];
      const todayRes = await fetch(`/api/timesheet?employeeId=${currentEmployee.id}&date=${today}`);
      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayRecord(data.records?.[0] || null);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          action: "checkin",
          workType,
          location: workType === "field" ? location : null,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchData();
        setNotes("");
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          action: "checkout",
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchData();
        setNotes("");
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const canCheckIn = !todayRecord;
  const canCheckOut = todayRecord && !todayRecord.checkOut;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Timesheet
        </h1>
        <p className="text-muted-foreground">
          บันทึกเวลาเข้า-ออกงาน
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Check In/Out Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ลงเวลาวันนี้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Status */}
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">สถานะวันนี้</p>
              {todayRecord ? (
                <>
                  <p className="text-lg font-bold text-green-500 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {todayRecord.checkOut ? "ลงเวลาออกแล้ว" : "กำลังทำงาน"}
                  </p>
                  <p className="text-sm mt-2">
                    เข้า: {formatTime(todayRecord.checkIn)}
                    {todayRecord.checkOut && ` • ออก: ${formatTime(todayRecord.checkOut)}`}
                  </p>
                  {todayRecord.totalHours && (
                    <p className="text-sm text-muted-foreground">
                      รวม {todayRecord.totalHours.toFixed(1)} ชม.
                      {todayRecord.otHours && todayRecord.otHours > 0 && ` (OT ${todayRecord.otHours.toFixed(1)} ชม.)`}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-lg font-bold text-yellow-500">ยังไม่ลงเวลา</p>
              )}
            </div>

            {/* Work Type Selection */}
            {canCheckIn && (
              <div className="space-y-2">
                <label className="text-sm font-medium">รูปแบบการทำงาน</label>
                <div className="grid grid-cols-3 gap-2">
                  {workTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={workType === type.id ? "default" : "outline"}
                        size="sm"
                        className="flex-col h-auto py-3"
                        onClick={() => setWorkType(type.id)}
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        <span className="text-xs">{type.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">หมายเหตุ</label>
              <Textarea
                placeholder="หมายเหตุ (ถ้ามี)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={!canCheckIn || isProcessing}
                onClick={handleCheckIn}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    เข้างาน
                  </>
                )}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={!canCheckOut || isProcessing}
                onClick={handleCheckOut}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกงาน
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>สรุปประจำเดือน</CardTitle>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm [color-scheme:dark]"
              />
            </div>
          </CardHeader>
          <CardContent>
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                  <p className="text-2xl font-bold text-blue-500">{summary.totalDays}</p>
                  <p className="text-sm text-muted-foreground">วันทำงาน</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 text-center">
                  <p className="text-2xl font-bold text-green-500">{summary.totalHours.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">ชม. ทั้งหมด</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 text-center">
                  <p className="text-2xl font-bold text-orange-500">{summary.totalOT.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">ชม. OT</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                  <p className="text-2xl font-bold text-purple-500">{summary.wfhDays}</p>
                  <p className="text-sm text-muted-foreground">วัน WFH</p>
                </div>
              </div>
            )}

            {/* Records Table */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>ไม่มีข้อมูลเดือนนี้</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">วันที่</th>
                      <th className="text-center py-2 px-2">เข้า</th>
                      <th className="text-center py-2 px-2">ออก</th>
                      <th className="text-center py-2 px-2">ชั่วโมง</th>
                      <th className="text-center py-2 px-2">OT</th>
                      <th className="text-center py-2 px-2">รูปแบบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">
                          {new Date(record.date).toLocaleDateString("th-TH", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="text-center py-2 px-2 text-green-500">
                          {formatTime(record.checkIn)}
                        </td>
                        <td className="text-center py-2 px-2 text-red-500">
                          {formatTime(record.checkOut)}
                        </td>
                        <td className="text-center py-2 px-2">
                          {record.totalHours?.toFixed(1) || "-"}
                        </td>
                        <td className="text-center py-2 px-2">
                          {record.otHours && record.otHours > 0 ? (
                            <Badge variant="outline" className="text-orange-500">
                              {record.otHours.toFixed(1)}
                            </Badge>
                          ) : "-"}
                        </td>
                        <td className="text-center py-2 px-2">
                          <Badge variant="secondary">
                            {record.workType === "office" ? "Office" :
                             record.workType === "wfh" ? "WFH" : "Field"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
