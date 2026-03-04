"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plane,
  Heart,
  Briefcase,
  Camera,
  Presentation,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
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
}

interface Event {
  id: string;
  title: string;
  time?: string;
  type: string;
  location?: string;
  attendees?: string[];
}

interface Activity {
  id: string;
  employeeName: string;
  action: string;
  details: string;
  timestamp: string;
}

const leaveTypeNames: Record<string, string> = {
  sick: "ลาป่วย",
  personal: "ลากิจ",
  annual: "ลาพักร้อน",
  maternity: "ลาคลอด",
  ordination: "ลาบวช",
  other: "อื่นๆ",
};

const leaveTypeIcons: Record<string, any> = {
  sick: Heart,
  personal: Briefcase,
  annual: Plane,
};

const leaveTypeColors: Record<string, string> = {
  sick: "text-red-500 bg-red-500/10",
  personal: "text-blue-500 bg-blue-500/10",
  annual: "text-green-500 bg-green-500/10",
};

// Mock events (ในอนาคตดึงจาก API)
const mockEvents: Event[] = [
  {
    id: "1",
    title: "ประชุมทีม Content",
    time: "10:00",
    type: "meeting",
    location: "ห้องประชุม A",
    attendees: ["พี่เต็นท์", "พี่ซา", "บัยคุน"],
  },
  {
    id: "2",
    title: "ถ่าย Review BYD Sealion 7",
    time: "09:00",
    type: "shooting",
    location: "BYD Showroom",
    attendees: ["Art", "KK"],
  },
];

export default function CalendarDatePage({ params }: { params: Promise<{ date: string }> }) {
  const resolvedParams = use(params);
  const dateStr = resolvedParams.date;
  
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dateObj = new Date(dateStr);
  const thaiDate = dateObj.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch approved leaves
        const res = await fetch("/api/hr/leave?status=approved");
        if (res.ok) {
          const data = await res.json();
          // Filter leaves that include this date
          const filtered = (data.requests || []).filter((leave: LeaveRequest) => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const check = new Date(dateStr);
            return check >= start && check <= end;
          });
          setLeaves(filtered);
        }
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateStr]);

  // Get events for this date (mock)
  const events = mockEvents;

  // Stats
  const onLeaveCount = leaves.length;
  const meetingCount = events.filter(e => e.type === "meeting").length;
  const shootingCount = events.filter(e => e.type === "shooting").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/calendar">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            {thaiDate}
          </h1>
          <p className="text-muted-foreground">
            รายละเอียดกิจกรรมประจำวัน
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">พนักงานลา</p>
                <p className="text-3xl font-bold text-orange-500">{onLeaveCount}</p>
              </div>
              <Plane className="h-8 w-8 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ประชุม</p>
                <p className="text-3xl font-bold text-blue-500">{meetingCount}</p>
              </div>
              <Presentation className="h-8 w-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ถ่ายทำ</p>
                <p className="text-3xl font-bold text-green-500">{shootingCount}</p>
              </div>
              <Camera className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">กิจกรรมทั้งหมด</p>
                <p className="text-3xl font-bold text-primary">{onLeaveCount + events.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leaves Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-orange-500" />
              พนักงานลา ({onLeaveCount} คน)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>ไม่มีพนักงานลาวันนี้</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaves.map((leave) => {
                  const Icon = leaveTypeIcons[leave.leaveType] || Plane;
                  return (
                    <div
                      key={leave.id}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <div className={`p-2 rounded-full ${leaveTypeColors[leave.leaveType] || "bg-gray-100"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{leave.employeeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {leaveTypeNames[leave.leaveType] || leave.leaveType} • {leave.totalDays} วัน
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(leave.startDate).toLocaleDateString("th-TH")} - {new Date(leave.endDate).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-500">
                        {leave.department || "ไม่ระบุแผนก"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              กิจกรรม / นัดหมาย
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>ไม่มีกิจกรรมวันนี้</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const Icon = event.type === "meeting" ? Presentation : 
                               event.type === "shooting" ? Camera : CalendarIcon;
                  const color = event.type === "meeting" ? "text-blue-500 bg-blue-500/10" :
                                event.type === "shooting" ? "text-green-500 bg-green-500/10" :
                                "text-purple-500 bg-purple-500/10";
                  
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className={`p-2 rounded-full ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        {event.time && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {event.time}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </p>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3" /> {event.attendees.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline / Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            บันทึกกิจกรรม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>ยังไม่มีบันทึกกิจกรรมสำหรับวันนี้</p>
            <p className="text-xs mt-1">(ในอนาคตจะเชื่อมต่อกับระบบ Activity Log)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
