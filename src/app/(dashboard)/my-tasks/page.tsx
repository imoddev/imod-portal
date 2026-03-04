"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  ExternalLink,
  FileEdit,
  Clock,
  CheckCircle2,
  Loader2,
  Newspaper,
  AlertCircle,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  source: string;
  category: string;
  sourceUrl: string;
  status: string;
  claimedAt: string;
  draftUrl?: string;
  team: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  claimed: { label: "รอเขียน", color: "bg-yellow-500/20 text-yellow-500", icon: Clock },
  drafting: { label: "กำลังเขียน", color: "bg-blue-500/20 text-blue-500", icon: FileEdit },
  review: { label: "รอ Review", color: "bg-purple-500/20 text-purple-500", icon: AlertCircle },
  published: { label: "เผยแพร่แล้ว", color: "bg-green-500/20 text-green-500", icon: CheckCircle2 },
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Mock current user (ในอนาคตดึงจาก session)
  const currentUser = {
    id: "1465635163466633308",
    name: "พี่ต้อม",
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch news claimed by current user
      const res = await fetch(`/api/news?claimedBy=${encodeURIComponent(currentUser.name)}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.items || []);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/news/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error("Error:", e);
    }
  };

  // Filter tasks
  const filteredTasks = filter === "all" 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  // Group by status
  const tasksByStatus = {
    claimed: tasks.filter(t => t.status === "claimed"),
    drafting: tasks.filter(t => t.status === "drafting"),
    review: tasks.filter(t => t.status === "review"),
    published: tasks.filter(t => t.status === "published"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          My Tasks
        </h1>
        <p className="text-muted-foreground">
          งานที่ได้รับมอบหมาย ({tasks.length} ชิ้น)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(tasksByStatus).map(([status, items]) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <Card 
              key={status}
              className={`cursor-pointer transition-colors hover:border-primary/50 ${filter === status ? "border-primary" : ""}`}
              onClick={() => setFilter(filter === status ? "all" : status)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{items.length}</p>
                  </div>
                  <Icon className="h-8 w-8 opacity-30" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>รายการงาน</CardTitle>
            {filter !== "all" && (
              <Button variant="ghost" size="sm" onClick={() => setFilter("all")}>
                แสดงทั้งหมด
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>ไม่มีงานที่ได้รับมอบหมาย</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const config = statusConfig[task.status] || statusConfig.claimed;
                const Icon = config.icon;

                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50"
                  >
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{task.source}</Badge>
                        <Badge variant="secondary">{task.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {task.claimedAt && new Date(task.claimedAt).toLocaleDateString("th-TH")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={task.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      {task.status === "claimed" && (
                        <Button size="sm" onClick={() => updateStatus(task.id, "drafting")}>
                          เริ่มเขียน
                        </Button>
                      )}
                      {task.status === "drafting" && (
                        <Button size="sm" onClick={() => updateStatus(task.id, "review")}>
                          ส่ง Review
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
