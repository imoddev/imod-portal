"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
const mockEvents: Event[] = [
  {
    id: "1",
    title: "ประชุมทีม Content",
    date: "2026-03-03",
    time: "10:00",
    type: "meeting",
    location: "ห้องประชุม A",
    attendees: ["พี่เต็นท์", "พี่ซา", "บัยคุน"],
  },
  {
    id: "2",
    title: "ถ่าย Review BYD Sealion 7",
    date: "2026-03-05",
    time: "09:00",
    type: "shooting",
    location: "BYD Showroom",
    attendees: ["Art", "KK"],
  },
  {
    id: "3",
    title: "Deadline: บทความ iPhone 17",
    date: "2026-03-04",
    type: "deadline",
  },
  {
    id: "4",
    title: "งานเปิดตัว OMODA",
    date: "2026-03-10",
    time: "14:00",
    type: "event",
    location: "Central World",
    attendees: ["พี่มิว", "Art"],
  },
  {
    id: "5",
    title: "ประชุม Revenue Team",
    date: "2026-03-03",
    time: "14:00",
    type: "meeting",
    attendees: ["พี่มิว", "พี่อาย", "น้องสา"],
  },
];

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
  const [allEvents, setAllEvents] = useState<Event[]>(mockEvents);
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
  const router = useRouter();

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
          setAllEvents([...mockEvents, ...leaves]);
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
        <Button>
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
                    
                    return (
                      <div key={event.id} className="p-3 rounded-lg border">
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
    </div>
  );
}
