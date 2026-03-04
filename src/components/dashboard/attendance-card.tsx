"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Clock,
  Building2,
  Home,
  Car,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNickname: string | null;
  department: string | null;
  profileImage: string | null;
  checkIn: string;
  checkOut: string | null;
  workType: string;
  isLate: boolean;
  lateMinutes: number;
  totalHours: number | null;
}

interface Summary {
  total: number;
  office: number;
  wfh: number;
  field: number;
  late: number;
  checkedOut: number;
}

const workTypeIcons: Record<string, any> = {
  office: Building2,
  wfh: Home,
  field: Car,
};

const workTypeLabels: Record<string, string> = {
  office: "Office",
  wfh: "WFH",
  field: "ลงพื้นที่",
};

const deptColors: Record<string, string> = {
  management: "bg-purple-500",
  "content-it": "bg-blue-500",
  "content-ev": "bg-green-500",
  revenue: "bg-yellow-500",
  production: "bg-red-500",
  creative: "bg-pink-500",
  dev: "bg-gray-500",
};

export function AttendanceCard() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchAttendance();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAttendance, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/timesheet/today");
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendance || []);
        setSummary(data.summary || null);
      }
    } catch (e) {
      console.error("Error fetching attendance:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              เข้างานวันนี้
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total || 0} คน</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {summary && summary.office > 0 && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {summary.office}
                </span>
              )}
              {summary && summary.wfh > 0 && (
                <span className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {summary.wfh}
                </span>
              )}
              {summary && summary.field > 0 && (
                <span className="flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  {summary.field}
                </span>
              )}
              {summary && summary.late > 0 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertTriangle className="h-3 w-3" />
                  สาย {summary.late}
                </span>
              )}
            </div>
            {/* Preview avatars */}
            {attendance.length > 0 && (
              <div className="flex -space-x-2 mt-3">
                {attendance.slice(0, 5).map((record) => (
                  <Avatar key={record.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={record.profileImage || undefined} />
                    <AvatarFallback className={deptColors[record.department || ""] || "bg-gray-400"}>
                      {record.employeeName?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {attendance.length > 5 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                    +{attendance.length - 5}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            เข้างานวันนี้ ({summary?.total || 0} คน)
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-blue-500/10">
              <Building2 className="h-4 w-4 mx-auto text-blue-500" />
              <p className="text-lg font-bold">{summary.office}</p>
              <p className="text-xs text-muted-foreground">Office</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <Home className="h-4 w-4 mx-auto text-green-500" />
              <p className="text-lg font-bold">{summary.wfh}</p>
              <p className="text-xs text-muted-foreground">WFH</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-purple-500/10">
              <Car className="h-4 w-4 mx-auto text-purple-500" />
              <p className="text-lg font-bold">{summary.field}</p>
              <p className="text-xs text-muted-foreground">ลงพื้นที่</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 mx-auto text-yellow-500" />
              <p className="text-lg font-bold">{summary.late}</p>
              <p className="text-xs text-muted-foreground">มาสาย</p>
            </div>
          </div>
        )}

        {/* Attendance List */}
        {attendance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>ยังไม่มีใครลงเวลาเข้างาน</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attendance.map((record) => {
              const Icon = workTypeIcons[record.workType] || Building2;
              return (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={record.profileImage || undefined} />
                    <AvatarFallback className={deptColors[record.department || ""] || "bg-gray-400"}>
                      {record.employeeName?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {record.employeeName}
                      {record.employeeNickname && (
                        <span className="text-muted-foreground"> ({record.employeeNickname})</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      <span>{workTypeLabels[record.workType]}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>เข้า {formatTime(record.checkIn)}</span>
                      {record.checkOut && (
                        <>
                          <span>•</span>
                          <span>ออก {formatTime(record.checkOut)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {record.isLate ? (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        สาย {record.lateMinutes} นาที
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        ตรงเวลา
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
