"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Home,
  Building2,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Wifi,
  Navigation,
  MapPinOff,
} from "lucide-react";
import { IMOD_OFFICE, formatDistance } from "@/lib/geo-utils";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  distance?: number;
  isWithinOffice?: boolean;
}

interface AttendanceRecord {
  id: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workType: string;
  location: string | null;
  totalHours: number | null;
  otHours: number | null;
  checkInLat?: number;
  checkInLng?: number;
  checkInIp?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  checkOutIp?: string;
  locationStatus?: string;
}

interface Summary {
  totalDays: number;
  officeDays: number;
  wfhDays: number;
  fieldDays: number;
  totalHours: number;
  totalOT: number;
}

const workTypes = [
  { id: "office", name: "Office", icon: Building2, requiresLocation: true },
  { id: "wfh", name: "Work from Home", icon: Home, requiresLocation: false },
  { id: "field", name: "Field Work", icon: MapPin, requiresLocation: true },
];

export default function TimesheetPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  
  const [workType, setWorkType] = useState("office");
  const [fieldLocation, setFieldLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Location state
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<"checkin" | "checkout" | null>(null);

  // Get current employee from session
  const { data: session } = useSession();
  const [currentEmployee, setCurrentEmployee] = useState<{ id: string; name: string } | null>(null);

  // Fetch employee data on mount
  useEffect(() => {
    if (session?.user?.email) {
      fetchEmployeeData();
    }
  }, [session]);

  const fetchEmployeeData = async () => {
    try {
      const res = await fetch(`/api/team?email=${encodeURIComponent(session?.user?.email || "")}`);
      if (res.ok) {
        const data = await res.json();
        const emp = data.employees?.[0];
        if (emp) {
          setCurrentEmployee({
            id: emp.discordId || emp.id,
            name: emp.nickname || emp.name,
          });
        } else {
          setCurrentEmployee({
            id: session?.user?.email || "unknown",
            name: session?.user?.name || "Unknown User",
          });
        }
      }
    } catch (e) {
      console.error("Error fetching employee:", e);
    }
  };

  useEffect(() => {
    if (currentEmployee) {
      fetchData();
    }
  }, [selectedMonth, currentEmployee]);

  // Get location when component mounts
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Browser ไม่รองรับ Geolocation");
      setIsGettingLocation(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      // Calculate distance from office
      const R = 6371;
      const dLat = (IMOD_OFFICE.lat - lat) * Math.PI / 180;
      const dLon = (IMOD_OFFICE.lng - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(IMOD_OFFICE.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      setLocationData({
        latitude: lat,
        longitude: lng,
        accuracy,
        distance,
        isWithinOffice: distance <= IMOD_OFFICE.radiusKm,
      });
    } catch (error: any) {
      if (error.code === 1) {
        setLocationError("ไม่อนุญาตให้เข้าถึงตำแหน่ง กรุณาเปิด Location Permission");
      } else if (error.code === 2) {
        setLocationError("ไม่สามารถระบุตำแหน่งได้");
      } else if (error.code === 3) {
        setLocationError("หมดเวลาในการระบุตำแหน่ง");
      } else {
        setLocationError("เกิดข้อผิดพลาดในการระบุตำแหน่ง");
      }
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  const fetchData = async () => {
    if (!currentEmployee) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/timesheet?employeeId=${currentEmployee.id}&month=${selectedMonth}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setSummary(data.summary || null);
      }

      const today = new Date().toISOString().split("T")[0];
      const todayRes = await fetch(`/api/timesheet?employeeId=${currentEmployee.id}&date=${today}`);
      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayRecord(data.records?.[0] || null);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (force = false) => {
    if (!currentEmployee) return;

    // Check if location is required and valid
    if (workType === "office" && !force) {
      if (!locationData) {
        setLocationError("กรุณาเปิด Location เพื่อยืนยันตำแหน่ง");
        return;
      }
      if (!locationData.isWithinOffice) {
        setPendingAction("checkin");
        setShowLocationWarning(true);
        return;
      }
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          action: "checkin",
          workType,
          location: workType === "field" ? fieldLocation : null,
          notes,
          latitude: locationData?.latitude,
          longitude: locationData?.longitude,
          accuracy: locationData?.accuracy,
          distance: locationData?.distance,
          isWithinOffice: locationData?.isWithinOffice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchData();
        setNotes("");
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentEmployee) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          action: "checkout",
          notes,
          latitude: locationData?.latitude,
          longitude: locationData?.longitude,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchData();
        setNotes("");
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCheckIn = () => {
    setShowLocationWarning(false);
    if (pendingAction === "checkin") {
      handleCheckIn(true);
    }
    setPendingAction(null);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const canCheckIn = !todayRecord;
  const canCheckOut = todayRecord && !todayRecord.checkOut;

  const getLocationStatusBadge = (record: AttendanceRecord) => {
    if (record.locationStatus === "verified") {
      return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
    }
    if (record.locationStatus === "suspicious") {
      return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" />Suspicious</Badge>;
    }
    if (record.locationStatus === "remote") {
      return <Badge className="bg-blue-100 text-blue-700"><Home className="h-3 w-3 mr-1" />Remote</Badge>;
    }
    return <Badge variant="outline"><MapPinOff className="h-3 w-3 mr-1" />N/A</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Location Warning Dialog */}
      <AlertDialog open={showLocationWarning} onOpenChange={setShowLocationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              ตำแหน่งไม่ตรงกับ Office
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                คุณเลือก <strong>Office</strong> แต่ตำแหน่งปัจจุบันอยู่ห่างจาก iMoD Office{" "}
                <strong className="text-red-600">
                  {locationData?.distance ? formatDistance(locationData.distance) : "ไม่ทราบ"}
                </strong>
              </p>
              <p className="text-sm text-muted-foreground">
                ระยะที่อนุญาต: ไม่เกิน {IMOD_OFFICE.radiusKm} km
              </p>
              <p className="text-sm">
                หากต้องการบันทึก Work from Home กรุณาเปลี่ยนรูปแบบการทำงาน
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCheckIn}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              ยืนยันลงเวลา (จะถูกบันทึกเป็น Suspicious)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Timesheet
        </h1>
        <p className="text-muted-foreground">
          บันทึกเวลาเข้า-ออกงาน
        </p>
      </div>

      {/* Location Status Banner */}
      <Card className={`${
        locationData?.isWithinOffice ? "border-green-500 bg-green-50" :
        locationData && !locationData.isWithinOffice ? "border-yellow-500 bg-yellow-50" :
        "border-gray-300"
      }`}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isGettingLocation ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : locationData?.isWithinOffice ? (
                <Shield className="h-5 w-5 text-green-600" />
              ) : locationData ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ) : (
                <MapPinOff className="h-5 w-5 text-gray-500" />
              )}
              
              <div>
                {isGettingLocation ? (
                  <p className="font-medium">กำลังระบุตำแหน่ง...</p>
                ) : locationError ? (
                  <p className="font-medium text-red-600">{locationError}</p>
                ) : locationData ? (
                  <>
                    <p className="font-medium">
                      {locationData.isWithinOffice ? (
                        <span className="text-green-700">✓ อยู่ในรัศมี Office</span>
                      ) : (
                        <span className="text-yellow-700">⚠ อยู่นอกรัศมี Office</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ระยะห่าง: {formatDistance(locationData.distance || 0)} จาก iMoD Office
                      {locationData.accuracy && ` (ความแม่นยำ ±${Math.round(locationData.accuracy)}m)`}
                    </p>
                  </>
                ) : (
                  <p className="font-medium text-gray-600">ไม่ได้ระบุตำแหน่ง</p>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={getLocation} disabled={isGettingLocation}>
              <Navigation className="h-4 w-4 mr-1" />
              รีเฟรช
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Check In/Out Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ลงเวลาวันนี้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Status */}
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">สถานะวันนี้</p>
              {todayRecord ? (
                <>
                  <p className="text-lg font-bold text-green-500 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {todayRecord.checkOut ? "ลงเวลาออกแล้ว" : "กำลังทำงาน"}
                  </p>
                  <p className="text-sm mt-2">
                    เข้า: {formatTime(todayRecord.checkIn)}
                    {todayRecord.checkOut && ` • ออก: ${formatTime(todayRecord.checkOut)}`}
                  </p>
                  {todayRecord.totalHours && (
                    <p className="text-sm text-muted-foreground">
                      รวม {todayRecord.totalHours.toFixed(1)} ชม.
                      {todayRecord.otHours && todayRecord.otHours > 0 && ` (OT ${todayRecord.otHours.toFixed(1)} ชม.)`}
                    </p>
                  )}
                  {todayRecord.locationStatus && (
                    <div className="mt-2">
                      {getLocationStatusBadge(todayRecord)}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-lg font-bold text-yellow-500">ยังไม่ลงเวลา</p>
              )}
            </div>

            {/* Work Type Selection */}
            {canCheckIn && (
              <div className="space-y-2">
                <label className="text-sm font-medium">รูปแบบการทำงาน</label>
                <div className="grid grid-cols-3 gap-2">
                  {workTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = workType === type.id;
                    const showWarning = type.id === "office" && locationData && !locationData.isWithinOffice;
                    
                    return (
                      <Button
                        key={type.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`flex-col h-auto py-3 relative ${showWarning && isSelected ? "border-yellow-500" : ""}`}
                        onClick={() => setWorkType(type.id)}
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        <span className="text-xs">{type.name}</span>
                        {showWarning && (
                          <AlertTriangle className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                        )}
                      </Button>
                    );
                  })}
                </div>
                {workType === "office" && locationData && !locationData.isWithinOffice && (
                  <p className="text-xs text-yellow-600">
                    ⚠️ ตำแหน่งปัจจุบันอยู่นอกรัศมี Office ({formatDistance(locationData.distance || 0)})
                  </p>
                )}
              </div>
            )}

            {/* Field Location Input */}
            {canCheckIn && workType === "field" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">สถานที่ทำงาน</label>
                <input
                  type="text"
                  placeholder="ระบุสถานที่..."
                  value={fieldLocation}
                  onChange={(e) => setFieldLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">หมายเหตุ</label>
              <Textarea
                placeholder="หมายเหตุ (ถ้ามี)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={!canCheckIn || isProcessing || isGettingLocation}
                onClick={() => handleCheckIn()}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    เข้างาน
                  </>
                )}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={!canCheckOut || isProcessing}
                onClick={handleCheckOut}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกงาน
                  </>
                )}
              </Button>
            </div>

            {/* Security Info */}
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-1">
              <div className="flex items-center gap-1 font-medium">
                <Shield className="h-3 w-3" />
                ระบบป้องกันการ Fake Timesheet
              </div>
              <ul className="space-y-0.5 ml-4">
                <li>• ตรวจสอบ GPS Location</li>
                <li>• บันทึก IP Address</li>
                <li>• รัศมี Office: {IMOD_OFFICE.radiusKm} km</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>สรุปประจำเดือน</CardTitle>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm [color-scheme:dark]"
              />
            </div>
          </CardHeader>
          <CardContent>
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                  <p className="text-2xl font-bold text-blue-500">{summary.totalDays}</p>
                  <p className="text-sm text-muted-foreground">วันทำงาน</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 text-center">
                  <p className="text-2xl font-bold text-green-500">{summary.totalHours.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">ชม. ทั้งหมด</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 text-center">
                  <p className="text-2xl font-bold text-orange-500">{summary.totalOT.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">ชม. OT</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                  <p className="text-2xl font-bold text-purple-500">{summary.wfhDays}</p>
                  <p className="text-sm text-muted-foreground">วัน WFH</p>
                </div>
              </div>
            )}

            {/* Records Table */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>ไม่มีข้อมูลเดือนนี้</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">วันที่</th>
                      <th className="text-center py-2 px-2">เข้า</th>
                      <th className="text-center py-2 px-2">ออก</th>
                      <th className="text-center py-2 px-2">ชั่วโมง</th>
                      <th className="text-center py-2 px-2">รูปแบบ</th>
                      <th className="text-center py-2 px-2">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">
                          {new Date(record.date).toLocaleDateString("th-TH", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="text-center py-2 px-2 text-green-500">
                          {formatTime(record.checkIn)}
                        </td>
                        <td className="text-center py-2 px-2 text-red-500">
                          {formatTime(record.checkOut)}
                        </td>
                        <td className="text-center py-2 px-2">
                          {record.totalHours?.toFixed(1) || "-"}
                          {record.otHours && record.otHours > 0 && (
                            <span className="text-orange-500 text-xs ml-1">
                              (+{record.otHours.toFixed(1)})
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2 px-2">
                          <Badge variant="secondary">
                            {record.workType === "office" ? "Office" :
                             record.workType === "wfh" ? "WFH" : "Field"}
                          </Badge>
                        </td>
                        <td className="text-center py-2 px-2">
                          {getLocationStatusBadge(record)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
