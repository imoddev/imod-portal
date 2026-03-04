"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Plus,
  TrendingUp,
  Users,
  Calendar,
  Phone,
  Mail,
  Building2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

type LeadStatus = "new" | "contacted" | "proposal" | "negotiation" | "won" | "lost";

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  status: LeadStatus;
  value: number;
  nextFollowUp?: string;
  assignee: string;
  createdAt: string;
}

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: "New", color: "text-blue-700", bgColor: "bg-blue-100" },
  contacted: { label: "Contacted", color: "text-purple-700", bgColor: "bg-purple-100" },
  proposal: { label: "Proposal", color: "text-orange-700", bgColor: "bg-orange-100" },
  negotiation: { label: "Negotiation", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  won: { label: "Won", color: "text-green-700", bgColor: "bg-green-100" },
  lost: { label: "Lost", color: "text-red-700", bgColor: "bg-red-100" },
};

// Mock data - will be replaced with real data
const mockLeads: Lead[] = [
  {
    id: "1",
    companyName: "OMODA Thailand",
    contactName: "คุณสมชาย",
    contactEmail: "somchai@omoda.co.th",
    contactPhone: "081-xxx-xxxx",
    status: "negotiation",
    value: 500000,
    nextFollowUp: "2026-03-05",
    assignee: "พี่มิว",
    createdAt: "2026-02-15",
  },
  {
    id: "2",
    companyName: "Honda Thailand",
    contactName: "คุณสมหญิง",
    contactEmail: "somying@honda.co.th",
    status: "proposal",
    value: 350000,
    nextFollowUp: "2026-03-04",
    assignee: "พี่อาย",
    createdAt: "2026-02-20",
  },
  {
    id: "3",
    companyName: "BYD Thailand",
    contactName: "คุณวิชัย",
    contactPhone: "089-xxx-xxxx",
    status: "contacted",
    value: 800000,
    assignee: "พี่มิว",
    createdAt: "2026-03-01",
  },
  {
    id: "4",
    companyName: "True Corporation",
    contactName: "คุณพิมพ์",
    status: "new",
    value: 200000,
    assignee: "น้องสา",
    createdAt: "2026-03-03",
  },
  {
    id: "5",
    companyName: "AIS",
    contactName: "คุณประยุทธ์",
    status: "won",
    value: 450000,
    assignee: "พี่มิว",
    createdAt: "2026-02-01",
  },
];

export default function RevenuePage() {
  const [leads] = useState(mockLeads);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");

  const filteredLeads = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  
  // Calculate stats
  const pipelineValue = leads
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((sum, l) => sum + l.value, 0);
  
  const wonValue = leads
    .filter((l) => l.status === "won")
    .reduce((sum, l) => sum + l.value, 0);

  const activeLeads = leads.filter((l) => !["won", "lost"].includes(l.status)).length;
  
  const followUpsToday = leads.filter((l) => {
    if (!l.nextFollowUp) return false;
    const today = new Date().toISOString().split("T")[0];
    return l.nextFollowUp === today;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground">
            ติดตามยอดขายและ Leads
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่ม Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">฿{(pipelineValue / 1000000).toFixed(2)}M</p>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">฿{(wonValue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">Won This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{activeLeads}</p>
                <p className="text-sm text-muted-foreground">Active Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{followUpsToday}</p>
                <p className="text-sm text-muted-foreground">Follow-ups Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
          <CardDescription>สถานะ Leads ทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(["new", "contacted", "proposal", "negotiation", "won"] as LeadStatus[]).map((status, index) => {
              const count = leads.filter((l) => l.status === status).length;
              const value = leads.filter((l) => l.status === status).reduce((sum, l) => sum + l.value, 0);
              const config = statusConfig[status];
              
              return (
                <div key={status} className="flex items-center">
                  <div 
                    className={`p-4 rounded-lg ${config.bgColor} min-w-[140px] cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => setFilter(filter === status ? "all" : status)}
                  >
                    <p className={`font-semibold ${config.color}`}>{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">฿{(value / 1000).toFixed(0)}K</p>
                  </div>
                  {index < 4 && <ArrowRight className="h-5 w-5 mx-2 text-muted-foreground shrink-0" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Leads</span>
            {filter !== "all" && (
              <Button variant="ghost" size="sm" onClick={() => setFilter("all")}>
                Clear filter
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLeads.map((lead) => {
              const config = statusConfig[lead.status];
              
              return (
                <div
                  key={lead.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold">{lead.companyName}</p>
                      <Badge className={`${config.bgColor} ${config.color} border-0`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{lead.contactName}</span>
                      {lead.contactEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.contactEmail}
                        </span>
                      )}
                      {lead.contactPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.contactPhone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">฿{lead.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{lead.assignee}</p>
                  </div>
                  {lead.nextFollowUp && (
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      {new Date(lead.nextFollowUp).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
