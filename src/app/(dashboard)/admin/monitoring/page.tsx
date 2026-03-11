"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, Cpu, DollarSign, Zap, RefreshCw } from "lucide-react";

interface DailyUsage {
  date: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: number;
}

interface AgentUsage {
  agent: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: number;
}

interface ModelUsage {
  model: string;
  provider: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: number;
}

interface ProviderUsage {
  provider: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: number;
}

interface UsageData {
  success: boolean;
  days: number;
  totals: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    totalTokens: number;
    cost: number;
  };
  byDate: DailyUsage[];
  byAgent: AgentUsage[];
  byModel: ModelUsage[];
  byProvider: ProviderUsage[];
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
];

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatCost(cost: number): string {
  return "$" + cost.toFixed(4);
}

export default function MonitoringPage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ days: days.toString() });
      if (selectedAgent) {
        params.set("agent", selectedAgent);
      }
      
      // Use external API (Mac Studio) for token usage data
      const res = await fetch(`https://shorts-api.iphonemod.net/usage-stats?${params}`, {
        mode: "cors",
      });
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch data");
      }
      
      // Map response to expected format
      setData({
        success: true,
        days: json.days,
        totals: json.totals,
        byDate: json.byDate,
        byAgent: json.byAgent,
        byModel: json.byModel || [],
        byProvider: json.byProvider || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days, selectedAgent]);

  // Format date for chart
  const chartData = data?.byDate.map(d => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
    }),
  })) || [];

  // Pie chart data for token types
  const tokenTypeData = data ? [
    { name: "Output", value: data.totals.output, color: "#3b82f6" },
    { name: "Input", value: data.totals.input, color: "#10b981" },
    { name: "Cache Read", value: data.totals.cacheRead, color: "#f59e0b" },
    { name: "Cache Write", value: data.totals.cacheWrite, color: "#8b5cf6" },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🤖 Token Monitoring</h1>
          <p className="text-muted-foreground">
            OpenClaw usage across all agents
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Agent Filter */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background"
          >
            <option value="">All Agents</option>
            {data?.byAgent.map((a) => (
              <option key={a.agent} value={a.agent}>
                {a.agent}
              </option>
            ))}
          </select>
          
          {/* Days Filter */}
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 rounded-md border bg-background"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Stats Cards */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Total Tokens</span>
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(data.totals.totalTokens)}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Output Tokens</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {formatNumber(data.totals.output)}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Cpu className="h-4 w-4" />
                <span className="text-sm">Input Tokens</span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {formatNumber(data.totals.input)}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Estimated Cost</span>
              </div>
              <div className="text-2xl font-bold text-amber-500">
                {formatCost(data.totals.cost)}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Usage Chart */}
            <div className="lg:col-span-2 p-4 rounded-lg border bg-card">
              <h2 className="text-lg font-semibold mb-4">📊 Daily Token Usage</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="dateLabel" className="text-xs" />
                    <YAxis tickFormatter={formatNumber} className="text-xs" />
                    <Tooltip
                      formatter={(value) => formatNumber(value as number)}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="output" name="Output" fill="#3b82f6" stackId="tokens" />
                    <Bar dataKey="input" name="Input" fill="#10b981" stackId="tokens" />
                    <Bar dataKey="cacheRead" name="Cache Read" fill="#f59e0b" stackId="tokens" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Token Types Pie */}
            <div className="p-4 rounded-lg border bg-card">
              <h2 className="text-lg font-semibold mb-4">🍩 Tokens by Type</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tokenTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {tokenTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Provider Summary */}
          {data.byProvider && data.byProvider.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.byProvider.map((p, i) => (
                <div key={p.provider} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground capitalize">
                      {p.provider}
                    </span>
                    {p.cost === 0 && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">
                        LOCAL
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-bold">
                    {formatNumber(p.totalTokens)}
                  </div>
                  <div className="text-sm text-amber-500">
                    {p.cost === 0 ? "Free" : formatCost(p.cost)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agent & Model Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Agent */}
            <div className="p-4 rounded-lg border bg-card">
              <h2 className="text-lg font-semibold mb-4">🤖 Usage by Agent</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Agent</th>
                      <th className="text-right py-2">Tokens</th>
                      <th className="text-right py-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byAgent.map((agent, i) => (
                      <tr key={agent.agent} className="border-b border-muted">
                        <td className="py-2 flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          {agent.agent}
                        </td>
                        <td className="text-right py-2">
                          {formatNumber(agent.totalTokens)}
                        </td>
                        <td className="text-right py-2 text-amber-500">
                          {formatCost(agent.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Model */}
            <div className="p-4 rounded-lg border bg-card">
              <h2 className="text-lg font-semibold mb-4">🧠 Usage by Model</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Model</th>
                      <th className="text-right py-2">Tokens</th>
                      <th className="text-right py-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byModel.map((model, i) => (
                      <tr key={`${model.provider}/${model.model}`} className="border-b border-muted">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                {model.model}
                                {(model.provider === 'ollama' || model.cost === 0) && (
                                  <span className="text-xs bg-green-500/20 text-green-500 px-1 py-0.5 rounded">LOCAL</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {model.provider}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-2">
                          {formatNumber(model.totalTokens)}
                        </td>
                        <td className="text-right py-2 text-amber-500">
                          {formatCost(model.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
