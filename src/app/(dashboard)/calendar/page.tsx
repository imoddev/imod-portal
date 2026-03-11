"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  Camera,
  Presentation,
  Plane,
  Heart,
  Briefcase,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  type: "meeting" | "shooting" | "deadline" | "event" | "leave";
  location?: string;
  attendees?: string[];
  leaveType?: string;
}

const eventTypeConfig: Record<string, { label: string; color: string; icon: any }> = {
  meeting: { label: "ประชุม", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Presentation },
  shooting: { label: "ถ่ายทำ", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Camera },
  deadline: { label: "Deadline", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: Clock },
  event: { label: "Event", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: CalendarIcon },
  leave: { label: "ลา", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: Plane },
};

const leaveTypeIcons: Record<string, any> = {
  sick: Heart,
  personal: Briefcase,
  annual: Plane,
};

// Mock events
// API URL for calendar events
const CALENDAR_API = "https://shorts-api.iphonemod.net";

const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const monthNames = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const eventTypes = [
  { id: "all", label: "ทั้งหมด" },
  { id: "meeting", label: "ประชุม" },
  { id: "shooting", label: "ถ่ายทำ" },
  { id: "deadline", label: "Deadline" },
  { id: "event", label: "Event" },
  { id: "leave", label: "วันลา" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [leaveEvents, setLeaveEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
  const router = useRouter();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    endDate: "",
    startTime: "",
    endTime: "",
    type: "event" as Event["type"],
    location: "",
    attendees: [] as string[],
  });
  
  // Team members for autocomplete
  const [teamMembers, setTeamMembers] = useState<{id: string; name: string; role: string}[]>([]);
  const [showAttendeeList, setShowAttendeeList] = useState(false);
  
  // API base URL
  const API_URL = "https://shorts-api.iphonemod.net";

  // Load team members
  useEffect(() => {
    fetch(`${API_URL}/team-members`)
      .then(res => res.json())
      .then(data => setTeamMembers(data))
      .catch(() => {});
  }, []);

  // Load calendar events from API
  useEffect(() => {
    fetch(`${API_URL}/calendar-events`)
      .then(res => res.json())
      .then(data => {
        const events: Event[] = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          endDate: e.endDate,
          time: e.startTime || e.time,
          type: e.type || "event",
          location: e.location,
          attendees: e.attendees || [],
        }));
        setCalendarEvents(events);
      })
      .catch(() => {});
  }, []);

  // Merge calendar events and leave events
  useEffect(() => {
    setAllEvents([...calendarEvents, ...leaveEvents]);
  }, [calendarEvents, leaveEvents]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      date: selectedDate || new Date().toISOString().split("T")[0],
      endDate: "",
      startTime: "",
      endTime: "",
      type: "event",
      location: "",
      attendees: [],
    });
    setEditingEvent(null);
  };

  // Open dialog for new event
  const handleAddEvent = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open dialog for editing
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      endDate: event.endDate || "",
      startTime: event.time || "",
      endTime: "",
      type: event.type,
      location: event.location || "",
      attendees: event.attendees || [],
    });
    setDialogOpen(true);
  };

  // Save event (create or update)
  const handleSaveEvent = async () => {
    if (!formData.title || !formData.date) {
      alert("กรุณากรอกชื่อและวันที่");
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        ...formData,
        time: formData.startTime, // For backward compatibility
      };

      if (editingEvent) {
        // Update existing event
        const res = await fetch(`${API_URL}/calendar-events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
        if (!res.ok) throw new Error("Failed to update event");
        const updated = await res.json();
        setCalendarEvents((prev) =>
          prev.map((e) => (e.id === editingEvent.id ? { ...e, ...updated } : e))
        );
        alert("แก้ไขกิจกรรมสำเร็จ ✅");
      } else {
        // Create new event
        const res = await fetch(`${API_URL}/calendar-events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
        if (!res.ok) throw new Error("Failed to create event");
        const newEvent = await res.json();
        // Map to Event format
        const eventToAdd: Event = {
          id: newEvent.id,
          title: newEvent.title,
          date: newEvent.date,
          endDate: newEvent.endDate,
          time: newEvent.startTime || newEvent.time,
          type: newEvent.type || "event",
          location: newEvent.location,
          attendees: newEvent.attendees || [],
        };
        setCalendarEvents((prev) => [...prev, eventToAdd]);
        alert("เพิ่มกิจกรรมสำเร็จ ✅ แจ้งเตือนไป Townhall แล้ว");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("ต้องการลบกิจกรรมนี้หรือไม่?")) return;

    try {
      const res = await fetch(`${API_URL}/calendar-events/${eventId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
      alert("ลบกิจกรรมสำเร็จ ✅");
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };
  
  // Toggle attendee selection
  const toggleAttendee = (name: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(name)
        ? prev.attendees.filter(a => a !== name)
        : [...prev.attendees, name]
    }));
  };

  // Long press for mobile
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const handleTouchStart = (event: Event) => {
    if (event.type === "leave") return;
    longPressTimer.current = setTimeout(() => {
      handleEditEvent(event);
    }, 500); // 500ms long press
  };
  
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Fetch approved leaves
  // Fetch approved leaves
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await fetch("/api/hr/leave?status=approved");
        if (res.ok) {
          const data = await res.json();
          const leaves: Event[] = (data.requests || []).map((leave: any) => ({
            id: `leave-${leave.id}`,
            title: `🏖️ ${leave.employeeName} ลา`,
            date: leave.startDate.split("T")[0],
            endDate: leave.endDate.split("T")[0],
            type: "leave" as const,
            leaveType: leave.leaveType,
            attendees: [leave.employeeName],
          }));
          setLeaveEvents(leaves);
        }
      } catch (e) {
        console.error("Error fetching leaves:", e);
      }
    };
    fetchLeaves();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const toggleFilter = (filterId: string) => {
    if (filterId === "all") {
      setActiveFilters(["all"]);
    } else {
      const newFilters = activeFilters.filter(f => f !== "all");
      if (newFilters.includes(filterId)) {
        const updated = newFilters.filter(f => f !== filterId);
        setActiveFilters(updated.length === 0 ? ["all"] : updated);
      } else {
        setActiveFilters([...newFilters, filterId]);
      }
    }
  };

  // Filter events based on active filters
  const filteredEvents = allEvents.filter(e => 
    activeFilters.includes("all") || activeFilters.includes(e.type)
  );

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const checkDate = new Date(dateStr);
    
    return filteredEvents.filter((e) => {
      const startDate = new Date(e.date);
      const endDate = e.endDate ? new Date(e.endDate) : startDate;
      
      // Check if checkDate is within range
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedEvents = selectedDate 
    ? filteredEvents.filter((e) => {
        const checkDate = new Date(selectedDate);
        const startDate = new Date(e.date);
        const endDate = e.endDate ? new Date(e.endDate) : startDate;
        return checkDate >= startDate && checkDate <= endDate;
      })
    : filteredEvents.filter((e) => {
        const checkDate = new Date(todayStr);
        const startDate = new Date(e.date);
        const endDate = e.endDate ? new Date(e.endDate) : startDate;
        return checkDate >= startDate && checkDate <= endDate;
      });

  // Upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = filteredEvents
    .filter((e) => {
      const eventDate = new Date(e.date);
      const endDate = e.endDate ? new Date(e.endDate) : eventDate;
      return endDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            ปฏิทินงานและกิจกรรม
          </p>
        </div>
        <Button onClick={handleAddEvent}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มกิจกรรม
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {eventTypes.map((type) => {
          const isActive = activeFilters.includes(type.id);
          const config = type.id !== "all" ? eventTypeConfig[type.id] : null;
          return (
            <Button
              key={type.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(type.id)}
              className={isActive && config ? config.color : ""}
            >
              {type.label}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{monthNames[month]} {year + 543}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
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
                  return <div key={`empty-${index}`} className="h-24" />;
                }
                
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const events = getEventsForDate(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                
                return (
                  <div
                    key={day}
                    className={`h-24 p-1 border rounded-lg cursor-pointer transition-colors ${
                      isToday ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700" : ""
                    } ${isSelected ? "ring-2 ring-primary" : ""} hover:bg-accent/50`}
                    onClick={() => setSelectedDate(dateStr)}
                    onDoubleClick={() => router.push(`/calendar/${dateStr}`)}
                  >
                    <div className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {events.slice(0, 2).map((event) => {
                        const config = eventTypeConfig[event.type];
                        return (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${config.color}`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {events.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {selectedDate 
                    ? new Date(selectedDate).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })
                    : "วันนี้"
                  }
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push(`/calendar/${selectedDate || todayStr}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  ดูรายละเอียด
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ไม่มีกิจกรรม
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((event) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;
                    
                    // Don't show edit/delete for leave events
                    const isLeaveEvent = event.type === "leave";
                    
                    return (
                      <div 
                        key={event.id} 
                        className="p-3 rounded-lg border group hover:border-primary/50 transition-colors cursor-pointer select-none"
                        onDoubleClick={() => !isLeaveEvent && handleEditEvent(event)}
                        onTouchStart={() => handleTouchStart(event)}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 rounded ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.title}</p>
                            {event.time && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {event.time}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                            {event.attendees && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.attendees.join(", ")}
                              </p>
                            )}
                          </div>
                          {!isLeaveEvent && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">กิจกรรม 7 วันข้างหน้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingEvents.map((event) => {
                  const config = eventTypeConfig[event.type];
                  
                  return (
                    <div key={event.id} className="flex items-center gap-2 text-sm">
                      <Badge className={`${config.color} shrink-0`}>
                        {new Date(event.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                      </Badge>
                      <span className="truncate">{event.title}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
            </DialogTitle>
            <DialogDescription>
              กรอกรายละเอียดกิจกรรม
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">ชื่อกิจกรรม *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="เช่น ประชุมทีม Content"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">วันที่เริ่ม *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">เวลาเริ่ม</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">เวลาจบ</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">ประเภท</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as Event["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">ประชุม</SelectItem>
                    <SelectItem value="shooting">ถ่ายทำ</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">สถานที่</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="เช่น ห้องประชุม A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ผู้เข้าร่วม</Label>
              <div 
                className="border rounded-md p-2 min-h-[40px] cursor-pointer flex flex-wrap gap-1"
                onClick={() => setShowAttendeeList(!showAttendeeList)}
              >
                {formData.attendees.length === 0 ? (
                  <span className="text-muted-foreground text-sm">คลิกเพื่อเลือกผู้เข้าร่วม...</span>
                ) : (
                  formData.attendees.map(name => (
                    <Badge key={name} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))
                )}
              </div>
              {showAttendeeList && (
                <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                  {teamMembers.map(member => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(member.name)}
                        onChange={() => toggleAttendee(member.name)}
                        className="rounded"
                      />
                      <span className="text-sm">{member.name}</span>
                      <span className="text-xs text-muted-foreground">({member.role})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEvent} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingEvent ? "บันทึก" : "เพิ่มกิจกรรม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
