"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  ArrowRight,
  FileText,
  Users,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

interface PendingCounts {
  leave: number;
  overtime: number;
  allowance: number;
}

export default function HRDashboard() {
  const { data: session } = useSession();
  const [pending, setPending] = useState<PendingCounts>({ leave: 0, overtime: 0, allowance: 0 });
  const [lateSummary, setLateSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pending counts
      const [leaveRes, otRes, allowRes, lateRes] = await Promise.all([
        fetch("/api/hr/leave?pending=true"),
        fetch("/api/hr/overtime?pending=true"),
        fetch("/api/hr/allowance?pending=true"),
        fetch("/api/hr/late?summary=true"),
      ]);

      const [leaveData, otData, allowData, lateData] = await Promise.all([
        leaveRes.json(),
        otRes.json(),
        allowRes.json(),
        lateRes.json(),
      ]);

      setPending({
        leave: leaveData.requests?.length || 0,
        overtime: otData.requests?.length || 0,
        allowance: allowData.requests?.length || 0,
      });

      // Filter late summary for warnings
      const warnings = (lateData.summaries || []).filter((s: any) => s.lateCount >= 3);
      setLateSummary(warnings);
    } catch (error) {
      console.error("Error fetching HR data:", error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: "ระบบลางาน",
      description: "ขอลา, ตรวจสอบโควตา, อนุมัติคำขอ",
      icon: Calendar,
      href: "/hr/leave",
      pending: pending.leave,
      color: "bg-blue-500",
    },
    {
      title: "ระบบ OT",
      description: "ขอทำ OT, อนุมัติล่วงหน้า, บันทึกชั่วโมง",
      icon: Clock,
      href: "/hr/overtime",
      pending: pending.overtime,
      color: "bg-orange-500",
    },
    {
      title: "ระบบเบี้ยเลี้ยง",
      description: "ขอเบี้ยเลี้ยง, วันเดินทาง, OFF DAY",
      icon: DollarSign,
      href: "/hr/allowance",
      pending: pending.allowance,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">HR Module</h1>
        <p className="text-muted-foreground">
          ระบบจัดการทรัพยากรบุคคล — พัฒนาโดยพี่อาย
        </p>
      </div>

      {/* Warning Banner */}
      {lateSummary.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              แจ้งเตือน: พนักงานมาสายเกินกำหนด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lateSummary.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center text-sm">
                  <span className="text-red-800">{s.employeeName}</span>
                  <Badge variant="destructive">มาสาย {s.lateCount} ครั้ง</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pending.leave + pending.overtime + pending.allowance}</p>
                <p className="text-sm text-muted-foreground">รอการอนุมัติ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lateSummary.length}</p>
                <p className="text-sm text-muted-foreground">พนักงานมาสายเกิน 3 ครั้ง</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">สถิติเดือนนี้</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  {item.pending > 0 && (
                    <Badge variant="destructive">{item.pending} รออนุมัติ</Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  เข้าสู่ระบบ
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Box */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-700">📋 กฎระเบียบ HR</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-pink-800">
          <p>• <strong>เวลาทำงาน:</strong> 09:00 - 18:00 น. (พักกลางวัน 12:00-13:00)</p>
          <p>• <strong>มาสาย:</strong> หลังเวลา 09:15 น. (มาสาย 3 ครั้ง = แจ้งเตือน HR)</p>
          <p>• <strong>OT:</strong> ต้องขอและได้รับอนุมัติ<strong>ล่วงหน้า</strong>ก่อนเริ่มงานเท่านั้น</p>
          <p>• <strong>เบี้ยเลี้ยง:</strong> เหมาจ่ายค่าอาหาร (ไม่รวมที่พักและค่าเดินทาง)</p>
        </CardContent>
      </Card>
    </div>
  );
}
