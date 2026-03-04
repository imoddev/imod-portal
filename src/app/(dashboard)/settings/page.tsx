"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Palette, 
  Moon, 
  Sun, 
  Monitor,
  User,
  Bell,
  Shield,
  Link,
  Check,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSession } from "next-auth/react";

const themes = [
  { id: "dark", name: "Dark", icon: Moon, description: "Cosmic dark theme (Default)" },
  { id: "light", name: "Light", icon: Sun, description: "Clean light theme" },
  { id: "system", name: "System", icon: Monitor, description: "Follow system preference" },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          ตั้งค่าระบบและความชอบส่วนตัว
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Theme
            </CardTitle>
            <CardDescription>
              เลือกธีมสีสำหรับ Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {themes.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isActive 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                      <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${isActive ? "text-primary" : ""}`}>
                        {t.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.description}
                      </p>
                    </div>
                    {isActive && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Color Preview */}
            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground">iMoD Brand Colors</Label>
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ED2887]" />
                  <span className="text-sm font-mono">#ED2887</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#612BAE]" />
                  <span className="text-sm font-mono">#612BAE</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Account
            </CardTitle>
            <CardDescription>
              ข้อมูลบัญชีผู้ใช้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {session?.user ? (
              <>
                <div className="flex items-center gap-4">
                  {session.user.image && (
                    <img 
                      src={session.user.image} 
                      alt="" 
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-lg">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <Badge variant="secondary">Team Member</Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>ยังไม่ได้เข้าสู่ระบบ</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              ตั้งค่าการแจ้งเตือน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Integrations
            </CardTitle>
            <CardDescription>
              เชื่อมต่อกับบริการภายนอก
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#5865F2] flex items-center justify-center text-white text-sm font-bold">
                  D
                </div>
                <div>
                  <p className="font-medium">Discord</p>
                  <p className="text-xs text-muted-foreground">Webhooks connected</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-500">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#21759B] flex items-center justify-center text-white text-sm font-bold">
                  W
                </div>
                <div>
                  <p className="font-medium">WordPress</p>
                  <p className="text-xs text-muted-foreground">2 sites connected</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-500">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#FF0000] flex items-center justify-center text-white text-sm font-bold">
                  Y
                </div>
                <div>
                  <p className="font-medium">YouTube</p>
                  <p className="text-xs text-muted-foreground">API key required</p>
                </div>
              </div>
              <Badge variant="secondary">Not configured</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
