"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  Video,
  Camera,
  Scissors,
  DollarSign,
  Users,
  MoreHorizontal,
  Plus,
  Clock,
  CheckCircle2,
} from "lucide-react";

const activityTypes = [
  { id: "article", label: "เขียนบทความ", icon: Newspaper, color: "bg-blue-100 text-blue-700" },
  { id: "video", label: "อัปโหลดวิดีโอ", icon: Video, color: "bg-red-100 text-red-700" },
  { id: "shooting", label: "ถ่ายทำ", icon: Camera, color: "bg-green-100 text-green-700" },
  { id: "editing", label: "ตัดต่อ", icon: Scissors, color: "bg-purple-100 text-purple-700" },
  { id: "sales", label: "งานขาย", icon: DollarSign, color: "bg-yellow-100 text-yellow-700" },
  { id: "meeting", label: "ประชุม", icon: Users, color: "bg-orange-100 text-orange-700" },
  { id: "other", label: "อื่นๆ", icon: MoreHorizontal, color: "bg-gray-100 text-gray-700" },
];

// Mock data - will be replaced with real data from API
const todayActivities = [
  {
    id: "1",
    type: "article",
    title: "เขียนข่าว iPhone 17 Pro Max ราคาไทย",
    time: "10:30",
    status: "done",
  },
  {
    id: "2",
    type: "editing",
    title: "ตัดคลิป BYD Sealion 7 Review",
    time: "14:00",
    status: "done",
  },
  {
    id: "3",
    type: "meeting",
    title: "ประชุมทีม Content",
    time: "15:30",
    status: "done",
  },
];

export default function ActivityPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [activities, setActivities] = useState(todayActivities);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title.trim()) return;

    const newActivity = {
      id: Date.now().toString(),
      type: selectedType,
      title: title.trim(),
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      status: "done",
    };

    setActivities([newActivity, ...activities]);
    setTitle("");
    setSelectedType(null);
  };

  const getActivityIcon = (typeId: string) => {
    const type = activityTypes.find((t) => t.id === typeId);
    return type ? type.icon : MoreHorizontal;
  };

  const getActivityColor = (typeId: string) => {
    const type = activityTypes.find((t) => t.id === typeId);
    return type ? type.color : "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          บันทึกการทำงานประจำวัน
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Activity Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              เพิ่มกิจกรรม
            </CardTitle>
            <CardDescription>บันทึกสิ่งที่ทำวันนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Activity Type Selection */}
              <div className="space-y-2">
                <Label>ประเภทงาน</Label>
                <div className="grid grid-cols-2 gap-2">
                  {activityTypes.map((type) => (
                    <Button
                      key={type.id}
                      type="button"
                      variant={selectedType === type.id ? "default" : "outline"}
                      className="justify-start h-auto py-2"
                      onClick={() => setSelectedType(type.id)}
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">รายละเอียด</Label>
                <Input
                  id="title"
                  placeholder="เช่น เขียนข่าว iPhone 17..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={!selectedType || !title.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              กิจกรรมวันนี้
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("th-TH", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>ยังไม่มีกิจกรรมวันนี้</p>
                <p className="text-sm">เริ่มบันทึกการทำงานของคุณ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        เสร็จ
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
