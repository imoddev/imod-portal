"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Search,
  Loader2,
  FileText,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetTitle: string | null;
  details: string | null;
  createdAt: string;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  create: { label: "สร้าง", color: "bg-green-500/20 text-green-500" },
  update: { label: "แก้ไข", color: "bg-blue-500/20 text-blue-500" },
  delete: { label: "ลบ", color: "bg-red-500/20 text-red-500" },
  claim: { label: "รับงาน", color: "bg-yellow-500/20 text-yellow-500" },
  publish: { label: "เผยแพร่", color: "bg-purple-500/20 text-purple-500" },
  approve: { label: "อนุมัติ", color: "bg-green-500/20 text-green-500" },
  reject: { label: "ปฏิเสธ", color: "bg-red-500/20 text-red-500" },
  login: { label: "เข้าสู่ระบบ", color: "bg-gray-500/20 text-gray-500" },
};

const targetTypeLabels: Record<string, string> = {
  news: "ข่าว",
  draft: "Draft",
  article: "บทความ",
  leave: "คำขอลา",
  overtime: "OT",
  allowance: "เบี้ยเลี้ยง",
  asset: "อุปกรณ์",
  employee: "พนักงาน",
  template: "Template",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filterAction, setFilterAction] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchUser, setSearchUser] = useState("");
  
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [offset, filterAction, filterType]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let url = `/api/audit?limit=${limit}&offset=${offset}`;
      if (filterAction !== "all") url += `&action=${filterAction}`;
      if (filterType !== "all") url += `&targetType=${filterType}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = searchUser
    ? logs.filter(log => log.userName.toLowerCase().includes(searchUser.toLowerCase()))
    : logs;

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Audit Log
        </h1>
        <p className="text-muted-foreground">
          ประวัติการใช้งานระบบ ({total} รายการ)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="ค้นหาผู้ใช้..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>
            <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); setOffset(0); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุก Action</SelectItem>
                {Object.entries(actionLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setOffset(0); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                {Object.entries(targetTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>ไม่มีประวัติ</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">เวลา</th>
                      <th className="text-left py-3 px-2">ผู้ใช้</th>
                      <th className="text-center py-3 px-2">Action</th>
                      <th className="text-left py-3 px-2">ประเภท</th>
                      <th className="text-left py-3 px-2">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const actionConfig = actionLabels[log.action] || { label: log.action, color: "bg-gray-500/20 text-gray-500" };
                      return (
                        <tr key={log.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(log.createdAt).toLocaleString("th-TH")}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {log.userName}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge className={actionConfig.color}>
                              {actionConfig.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            {targetTypeLabels[log.targetType] || log.targetType}
                          </td>
                          <td className="py-3 px-2 max-w-xs truncate">
                            {log.targetTitle || log.targetId || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  หน้า {currentPage} จาก {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={offset + limit >= total}
                    onClick={() => setOffset(offset + limit)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
