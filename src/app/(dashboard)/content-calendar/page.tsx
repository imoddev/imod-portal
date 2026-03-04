"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarRange,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Video,
  Newspaper,
  Star,
} from "lucide-react";

interface ContentPlan {
  id: string;
  title: string;
  site: string;
  category: string | null;
  plannedDate: string;
  assigneeName: string | null;
  type: string;
  status: string;
  priority: string;
}

const sites = [
  { id: "imod", name: "iMoD", color: "bg-blue-500" },
  { id: "imoddrive", name: "iMoD Drive", color: "bg-green-500" },
];

const contentTypes = [
  { id: "article", name: "บทความ", icon: FileText },
  { id: "video", name: "วิดีโอ", icon: Video },
  { id: "review", name: "รีวิว", icon: Star },
  { id: "news", name: "ข่าว", icon: Newspaper },
];

const statuses = [
  { id: "planned", name: "วางแผน", color: "bg-gray-500" },
  { id: "writing", name: "กำลังเขียน", color: "bg-blue-500" },
  { id: "editing", name: "กำลังแก้ไข", color: "bg-yellow-500" },
  { id: "scheduled", name: "รอเผยแพร่", color: "bg-purple-500" },
  { id: "published", name: "เผยแพร่แล้ว", color: "bg-green-500" },
];

const priorities = [
  { id: "low", name: "ต่ำ", color: "text-gray-500" },
  { id: "normal", name: "ปกติ", color: "text-blue-500" },
  { id: "high", name: "สูง", color: "text-orange-500" },
  { id: "urgent", name: "ด่วน", color: "text-red-500" },
];

const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const monthNames = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export default function ContentCalendarPage() {
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [summary, setSummary] = useState({ total: 0, planned: 0, writing: 0, editing: 0, published: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterSite, setFilterSite] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    site: "",
    category: "",
    plannedDate: "",
    assigneeName: "",
    type: "article",
    priority: "normal",
    sourceUrl: "",
    notes: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchPlans();
  }, [currentDate, filterSite]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
      let url = `/api/content-calendar?month=${monthStr}`;
      if (filterSite !== "all") url += `&site=${filterSite}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        setSummary(data.summary || { total: 0, planned: 0, writing: 0, editing: 0, published: 0 });
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlan = async () => {
    if (!form.title || !form.site || !form.plannedDate) {
      alert("กรุณากรอก Title, Site และวันที่");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setForm({ title: "", site: "", category: "", plannedDate: "", assigneeName: "", type: "article", priority: "normal", sourceUrl: "", notes: "" });
        fetchPlans();
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate calendar
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getPlansForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return plans.filter(p => p.plannedDate.startsWith(dateStr));
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            Content Calendar
          </h1>
          <p className="text-muted-foreground">
            วางแผนคอนเทนต์ล่วงหน้า
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มแผน
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มแผนคอนเทนต์</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>หัวข้อ *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="หัวข้อคอนเทนต์"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site *</Label>
                  <Select value={form.site} onValueChange={(v) => setForm({ ...form, site: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก Site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>วันที่กำหนด *</Label>
                  <Input
                    type="date"
                    className="[color-scheme:dark]"
                    value={form.plannedDate}
                    onChange={(e) => setForm({ ...form, plannedDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ประเภท</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ความสำคัญ</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>ผู้รับผิดชอบ</Label>
                <Input
                  value={form.assigneeName}
                  onChange={(e) => setForm({ ...form, assigneeName: e.target.value })}
                  placeholder="ชื่อผู้รับผิดชอบ"
                />
              </div>
              <div className="space-y-2">
                <Label>Source URL</Label>
                <Input
                  value={form.sourceUrl}
                  onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>หมายเหตุ</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="หมายเหตุเพิ่มเติม"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleAddPlan} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-sm text-muted-foreground">ทั้งหมด</p>
          </CardContent>
        </Card>
        <Card className="border-gray-500/30">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-gray-500">{summary.planned}</p>
            <p className="text-sm text-muted-foreground">วางแผน</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-blue-500">{summary.writing}</p>
            <p className="text-sm text-muted-foreground">กำลังเขียน</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-yellow-500">{summary.editing}</p>
            <p className="text-sm text-muted-foreground">แก้ไข</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-500">{summary.published}</p>
            <p className="text-sm text-muted-foreground">เผยแพร่</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>{monthNames[month]} {year + 543}</CardTitle>
              <Select value={filterSite} onValueChange={setFilterSite}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุก Site</SelectItem>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-28" />;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayPlans = getPlansForDate(day);
                  const isToday = dateStr === todayStr;

                  return (
                    <div
                      key={day}
                      className={`h-28 p-1 border rounded-lg ${
                        isToday ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300" : ""
                      }`}
                    >
                      <div className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5 mt-1 overflow-hidden">
                        {dayPlans.slice(0, 3).map((plan) => {
                          const site = sites.find(s => s.id === plan.site);
                          const status = statuses.find(s => s.id === plan.status);
                          return (
                            <div
                              key={plan.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${site?.color} text-white`}
                            >
                              {plan.title}
                            </div>
                          );
                        })}
                        {dayPlans.length > 3 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayPlans.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
