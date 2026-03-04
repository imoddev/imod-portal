"use client";

import { useState } from "react";
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
  Database,
  Bell,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { authConfig } from "@/lib/auth/config";

export default function SettingsPage() {
  const [allowPublicSignup, setAllowPublicSignup] = useState(authConfig.allowPublicSignup);
  const [allowedEmails, setAllowedEmails] = useState<string[]>(authConfig.allowedEmails);
  const [newEmail, setNewEmail] = useState("");
  const [saved, setSaved] = useState(false);

  const addEmail = () => {
    if (!newEmail.trim() || allowedEmails.includes(newEmail.toLowerCase())) return;
    setAllowedEmails([...allowedEmails, newEmail.toLowerCase()]);
    setNewEmail("");
  };

  const removeEmail = (email: string) => {
    setAllowedEmails(allowedEmails.filter((e) => e !== email));
  };

  const handleSave = () => {
    // In production, this would update the config via API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
        <Button onClick={handleSave}>
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              บันทึกแล้ว
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              บันทึก
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Auth Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication
            </CardTitle>
            <CardDescription>ตั้งค่าการเข้าสู่ระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Public Signup Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">เปิดรับสมัครสมาชิก</p>
                <p className="text-sm text-muted-foreground">
                  อนุญาตให้ทุกคนสมัครเข้าใช้งานได้
                </p>
              </div>
              <Button
                variant={allowPublicSignup ? "default" : "outline"}
                onClick={() => setAllowPublicSignup(!allowPublicSignup)}
              >
                {allowPublicSignup ? "เปิด" : "ปิด"}
              </Button>
            </div>

            {/* Allowed Domains */}
            <div className="space-y-2">
              <Label>Domain ที่อนุญาต</Label>
              <div className="flex flex-wrap gap-2">
                {authConfig.allowedDomains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="gap-1">
                    <Globe className="h-3 w-3" />
                    @{domain}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                ผู้ใช้จาก domain เหล่านี้สามารถเข้าใช้งานได้ทันที
              </p>
            </div>

            {/* Allowed Emails */}
            <div className="space-y-2">
              <Label>Email ที่อนุญาต (เพิ่มเติม)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEmail()}
                />
                <Button onClick={addEmail}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {allowedEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {allowedEmails.map((email) => (
                    <Badge key={email} variant="outline" className="gap-1">
                      <Mail className="h-3 w-3" />
                      {email}
                      <button onClick={() => removeEmail(email)} className="ml-1 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>เชื่อมต่อบริการภายนอก</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">WordPress (iPhoneMod)</p>
                  <p className="text-sm text-muted-foreground">ดึงบทความอัตโนมัติ</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Connected</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">WordPress (EVMoD)</p>
                  <p className="text-sm text-muted-foreground">ดึงบทความอัตโนมัติ</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Connected</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Database className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Google Sheets (News DB)</p>
                  <p className="text-sm text-muted-foreground">ดึงข่าวจาก Sheet</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>ตั้งค่าการแจ้งเตือน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Discord Webhook</p>
                <p className="text-sm text-muted-foreground">แจ้งเตือนไปยัง Discord</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">แจ้งเตือนทางอีเมล</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
