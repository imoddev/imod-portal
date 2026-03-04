"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileBarChart,
  Clock,
  DollarSign,
  Users,
  Loader2,
  TrendingUp,
  CreditCard,
  Calendar,
  Briefcase,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Summary {
  month: string;
  totals: {
    otHours: number;
    otAmount: number;
    allowanceTotal: number;
    workDays: number;
    workHours: number;
  };
  allowanceByType: Record<string, number>;
  byEmployee: {
    overtime: Record<string, { name: string; hours: number; amount: number }>;
    allowance: Record<string, { name: string; total: number; byType: Record<string, number> }>;
    attendance: Record<string, { name: string; days: number; hours: number; otHours: number }>;
  };
}

const allowanceTypeNames: Record<string, string> = {
  daily: "เบี้ยเลี้ยงทั่วไป",
  travel: "ค่าเดินทาง",
  meal: "ค่าอาหาร",
  accommodation: "ค่าที่พัก",
  fuel: "ค่าน้ำมัน",
  phone: "ค่าโทรศัพท์",
  other: "อื่นๆ",
};

const COLORS = ["#ED2887", "#612BAE", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function ReportPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth]);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hr/summary?month=${selectedMonth}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const allowanceChartData = summary
    ? Object.entries(summary.allowanceByType).map(([type, amount]) => ({
        name: allowanceTypeNames[type] || type,
        value: amount,
      }))
    : [];

  const employeeOTData = summary
    ? Object.values(summary.byEmployee.overtime).map((emp) => ({
        name: emp.name,
        hours: emp.hours,
        amount: emp.amount,
      }))
    : [];

  const monthDisplay = selectedMonth
    ? new Date(selectedMonth + "-01").toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-primary" />
            Reports & Payroll Preview
          </h1>
          <p className="text-muted-foreground">
            สรุปค่าใช้จ่ายและเงินเดือนประจำเดือน
          </p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border rounded-md [color-scheme:dark]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !summary ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileBarChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>ไม่มีข้อมูล</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">OT รวม</p>
                    <p className="text-2xl font-bold text-primary">
                      {summary.totals.otHours.toFixed(1)} ชม.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ≈ ฿{summary.totals.otAmount.toLocaleString()}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">เบี้ยเลี้ยงรวม</p>
                    <p className="text-2xl font-bold text-green-500">
                      ฿{summary.totals.allowanceTotal.toLocaleString()}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">วันทำงาน</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {summary.totals.workDays} วัน
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {summary.totals.workHours.toFixed(1)} ชม.
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ค่าใช้จ่ายทั้งหมด</p>
                    <p className="text-2xl font-bold text-purple-500">
                      ฿{(summary.totals.otAmount + summary.totals.allowanceTotal).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="expense">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="expense">ค่าใช้จ่าย</TabsTrigger>
              <TabsTrigger value="overtime">OT</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
            </TabsList>

            {/* Expense Tab */}
            <TabsContent value="expense" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>เบี้ยเลี้ยงตามประเภท</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {allowanceChartData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        ไม่มีข้อมูล
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={allowanceChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {allowanceChartData.map((entry, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* By Employee */}
                <Card>
                  <CardHeader>
                    <CardTitle>เบี้ยเลี้ยงรายบุคคล</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.values(summary.byEmployee.allowance).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          ไม่มีข้อมูล
                        </div>
                      ) : (
                        Object.values(summary.byEmployee.allowance)
                          .sort((a, b) => b.total - a.total)
                          .map((emp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                              <div>
                                <p className="font-medium">{emp.name}</p>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                  {Object.entries(emp.byType).map(([type, amount]) => (
                                    <Badge key={type} variant="secondary" className="text-xs">
                                      {allowanceTypeNames[type]}: ฿{amount.toLocaleString()}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <p className="font-bold text-green-500">฿{emp.total.toLocaleString()}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* OT Tab */}
            <TabsContent value="overtime" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>OT รายบุคคล</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {employeeOTData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        ไม่มีข้อมูล OT
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={employeeOTData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="hours" fill="#ED2887" name="ชั่วโมง OT" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* OT List */}
                <Card>
                  <CardHeader>
                    <CardTitle>รายละเอียด OT</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.values(summary.byEmployee.overtime).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          ไม่มีข้อมูล OT
                        </div>
                      ) : (
                        Object.values(summary.byEmployee.overtime)
                          .sort((a, b) => b.hours - a.hours)
                          .map((emp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                              <div>
                                <p className="font-medium">{emp.name}</p>
                                <p className="text-sm text-muted-foreground">{emp.hours.toFixed(1)} ชม.</p>
                              </div>
                              <p className="font-bold text-primary">฿{emp.amount.toLocaleString()}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payroll Tab */}
            <TabsContent value="payroll" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Payroll Preview - {monthDisplay}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">พนักงาน</th>
                          <th className="text-center py-3 px-2">วันทำงาน</th>
                          <th className="text-center py-3 px-2">ชม. ทำงาน</th>
                          <th className="text-center py-3 px-2">OT (ชม.)</th>
                          <th className="text-right py-3 px-2">OT (฿)</th>
                          <th className="text-right py-3 px-2">เบี้ยเลี้ยง</th>
                          <th className="text-right py-3 px-2 font-bold">รวม</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(summary.byEmployee.attendance).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                              ไม่มีข้อมูล
                            </td>
                          </tr>
                        ) : (
                          Object.entries(summary.byEmployee.attendance).map(([empId, att]) => {
                            const ot = summary.byEmployee.overtime[empId];
                            const allowance = summary.byEmployee.allowance[empId];
                            const otAmount = ot?.amount || 0;
                            const allowanceAmount = allowance?.total || 0;
                            const total = otAmount + allowanceAmount;

                            return (
                              <tr key={empId} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-2 font-medium">{att.name}</td>
                                <td className="text-center py-3 px-2">{att.days}</td>
                                <td className="text-center py-3 px-2">{att.hours.toFixed(1)}</td>
                                <td className="text-center py-3 px-2">
                                  {ot ? ot.hours.toFixed(1) : "-"}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {otAmount > 0 ? `฿${otAmount.toLocaleString()}` : "-"}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {allowanceAmount > 0 ? `฿${allowanceAmount.toLocaleString()}` : "-"}
                                </td>
                                <td className="text-right py-3 px-2 font-bold text-primary">
                                  ฿{total.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/50 font-bold">
                          <td className="py-3 px-2">รวมทั้งหมด</td>
                          <td className="text-center py-3 px-2">{summary.totals.workDays}</td>
                          <td className="text-center py-3 px-2">{summary.totals.workHours.toFixed(1)}</td>
                          <td className="text-center py-3 px-2">{summary.totals.otHours.toFixed(1)}</td>
                          <td className="text-right py-3 px-2">฿{summary.totals.otAmount.toLocaleString()}</td>
                          <td className="text-right py-3 px-2">฿{summary.totals.allowanceTotal.toLocaleString()}</td>
                          <td className="text-right py-3 px-2 text-primary">
                            ฿{(summary.totals.otAmount + summary.totals.allowanceTotal).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
