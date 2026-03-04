"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Video,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  GripVertical,
  Calendar,
  User,
} from "lucide-react";

type ProjectStatus = "backlog" | "in-progress" | "review" | "done";

interface Project {
  id: string;
  title: string;
  assignee: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  type: "video" | "shooting" | "editing" | "graphics";
}

const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: typeof Clock }> = {
  backlog: { label: "Backlog", color: "bg-slate-100", icon: Clock },
  "in-progress": { label: "In Progress", color: "bg-blue-100", icon: Play },
  review: { label: "Review", color: "bg-yellow-100", icon: AlertCircle },
  done: { label: "Done", color: "bg-green-100", icon: CheckCircle2 },
};

// Mock data - will be replaced with real data
const initialProjects: Record<ProjectStatus, Project[]> = {
  backlog: [
    { id: "1", title: "ถ่าย Review BYD Sealion 7", assignee: "Art", priority: "high", type: "shooting" },
    { id: "2", title: "Thumbnail iPhone 17 Series", assignee: "ผิง", priority: "medium", type: "graphics" },
  ],
  "in-progress": [
    { id: "3", title: "ตัดคลิป Tesla Model Y 2026", assignee: "KK", dueDate: "2026-03-05", priority: "high", type: "editing" },
    { id: "4", title: "ตัดคลิป iMoD x KKU", assignee: "M", priority: "medium", type: "editing" },
  ],
  review: [
    { id: "5", title: "Review OMODA C5", assignee: "Art", priority: "medium", type: "video" },
  ],
  done: [
    { id: "6", title: "iPhone 17 Pro Max Preview", assignee: "KK", priority: "high", type: "video" },
    { id: "7", title: "Honda ICON e: First Look", assignee: "จูน", priority: "medium", type: "video" },
  ],
};

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export default function ProductionPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      title: newTaskTitle,
      assignee: "Unassigned",
      priority: "medium",
      type: "video",
    };

    setProjects({
      ...projects,
      backlog: [newProject, ...projects.backlog],
    });
    setNewTaskTitle("");
  };

  const totalTasks = Object.values(projects).flat().length;
  const inProgressCount = projects["in-progress"].length;
  const doneToday = projects.done.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Production Board</h1>
          <p className="text-muted-foreground">
            จัดการงาน Production Team
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="เพิ่มงานใหม่..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="w-64"
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่ม
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{doneToday}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{projects["in-progress"].filter(p => p.priority === "high").length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-4 md:grid-cols-4">
        {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          
          return (
            <Card key={status} className={config.color}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4" />
                  {config.label}
                  <Badge variant="secondary" className="ml-auto">
                    {projects[status].length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {projects[status].map((project) => (
                  <div
                    key={project.id}
                    className="p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{project.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${priorityColors[project.priority]}`}>
                            {project.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {project.assignee}
                          </span>
                          {project.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(project.dueDate).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {projects[status].length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    ไม่มีงาน
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
