"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  Mail,
  Globe,
  Users,
  Save,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { authConfig } from "@/lib/auth/config";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
}

export default function SettingsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeEmployees = employees.filter(e => e.email);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            ตั้งค่าระบบ
          </p>
        </div>
      </div>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            จัดการการเข้าถึงระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Allowed Domains */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Allowed Domains
            </Label>
            <p className="text-sm text-muted-foreground">
              ผู้ใช้ที่มีอีเมลจาก domain เหล่านี้สามารถ login ได้
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {authConfig.allowedDomains.map((domain) => (
                <Badge key={domain} variant="secondary">
                  @{domain}
                </Badge>
              ))}
            </div>
          </div>

          {/* Allowed Employees */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Allowed Employees ({activeEmployees.length})
              </Label>
              <Button variant="ghost" size="sm" onClick={fetchEmployees}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              พนักงานที่มีอีเมลในระบบ Team สามารถ login ได้ (ไปเพิ่มที่หน้า Team)
            </p>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeEmployees.map((emp) => (
                  <Badge key={emp.id} variant="outline">
                    <Mail className="h-3 w-3 mr-1" />
                    {emp.email}
                  </Badge>
                ))}
                {activeEmployees.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    ยังไม่มีพนักงานในระบบ — ไปเพิ่มที่หน้า Team
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            How Login Works
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert">
          <ol>
            <li>ผู้ใช้ที่มี email <code>@modmedia.asia</code> สามารถ login ได้เลย</li>
            <li>ผู้ใช้ที่มี email ตรงกับพนักงานในระบบ Team สามารถ login ได้</li>
            <li>ผู้ใช้อื่นๆ จะไม่สามารถ login ได้</li>
          </ol>
          <p className="mt-4">
            <strong>เพิ่มผู้ใช้ใหม่:</strong> ไปที่หน้า <a href="/team" className="text-primary underline">Team</a> แล้วเพิ่มพนักงาน พร้อมใส่ email
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
