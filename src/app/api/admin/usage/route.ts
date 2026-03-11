import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import readline from "readline";
import { createReadStream } from "fs";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(process.env.HOME || "", ".openclaw");

interface UsageEntry {
  date: string;
  agent: string;
  model: string;
  provider: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: number;
}

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
  totalTokens: number;
  cost: number;
}

// Parse a single session JSONL file
async function parseSessionFile(filePath: string, agentId: string): Promise<UsageEntry[]> {
  const entries: UsageEntry[] = [];
  
  try {
    const fileStream = createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      try {
        const data = JSON.parse(line);
        
        // Only process assistant messages with usage data
        if (data.type === "message" && data.message?.role === "assistant" && data.message?.usage) {
          const usage = data.message.usage;
          const timestamp = data.timestamp || data.message?.timestamp;
          
          if (timestamp && usage.totalTokens > 0) {
            const date = new Date(timestamp).toISOString().split("T")[0];
            
            entries.push({
              date,
              agent: agentId,
              model: data.message.model || "unknown",
              provider: data.message.provider || "unknown",
              input: usage.input || 0,
              output: usage.output || 0,
              cacheRead: usage.cacheRead || 0,
              cacheWrite: usage.cacheWrite || 0,
              totalTokens: usage.totalTokens || 0,
              cost: usage.cost?.total || 0,
            });
          }
        }
      } catch {
        // Skip invalid JSON lines
      }
    }
  } catch {
    // File doesn't exist or can't be read
  }
  
  return entries;
}

// Get all usage data from OpenClaw session logs
async function getAllUsage(days: number = 7): Promise<UsageEntry[]> {
  const allEntries: UsageEntry[] = [];
  const agentsDir = path.join(OPENCLAW_DIR, "agents");
  
  try {
    const agents = await fs.readdir(agentsDir);
    
    for (const agentId of agents) {
      const sessionsDir = path.join(agentsDir, agentId, "sessions");
      
      try {
        const files = await fs.readdir(sessionsDir);
        const jsonlFiles = files.filter(f => f.endsWith(".jsonl"));
        
        for (const file of jsonlFiles) {
          const filePath = path.join(sessionsDir, file);
          const entries = await parseSessionFile(filePath, agentId);
          allEntries.push(...entries);
        }
      } catch {
        // Sessions dir doesn't exist for this agent
      }
    }
  } catch {
    // Agents dir doesn't exist
  }
  
  // Filter by date range
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];
  
  return allEntries.filter(e => e.date >= cutoffStr);
}

// Aggregate by date
function aggregateByDate(entries: UsageEntry[]): DailyUsage[] {
  const byDate = new Map<string, DailyUsage>();
  
  for (const entry of entries) {
    const existing = byDate.get(entry.date) || {
      date: entry.date,
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      totalTokens: 0,
      cost: 0,
    };
    
    existing.input += entry.input;
    existing.output += entry.output;
    existing.cacheRead += entry.cacheRead;
    existing.cacheWrite += entry.cacheWrite;
    existing.totalTokens += entry.totalTokens;
    existing.cost += entry.cost;
    
    byDate.set(entry.date, existing);
  }
  
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Aggregate by agent
function aggregateByAgent(entries: UsageEntry[]): AgentUsage[] {
  const byAgent = new Map<string, AgentUsage>();
  
  for (const entry of entries) {
    const existing = byAgent.get(entry.agent) || {
      agent: entry.agent,
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      totalTokens: 0,
      cost: 0,
    };
    
    existing.input += entry.input;
    existing.output += entry.output;
    existing.cacheRead += entry.cacheRead;
    existing.cacheWrite += entry.cacheWrite;
    existing.totalTokens += entry.totalTokens;
    existing.cost += entry.cost;
    
    byAgent.set(entry.agent, existing);
  }
  
  return Array.from(byAgent.values()).sort((a, b) => b.totalTokens - a.totalTokens);
}

// Aggregate by model
function aggregateByModel(entries: UsageEntry[]): ModelUsage[] {
  const byModel = new Map<string, ModelUsage>();
  
  for (const entry of entries) {
    const key = `${entry.provider}/${entry.model}`;
    const existing = byModel.get(key) || {
      model: entry.model,
      provider: entry.provider,
      input: 0,
      output: 0,
      totalTokens: 0,
      cost: 0,
    };
    
    existing.input += entry.input;
    existing.output += entry.output;
    existing.totalTokens += entry.totalTokens;
    existing.cost += entry.cost;
    
    byModel.set(key, existing);
  }
  
  return Array.from(byModel.values()).sort((a, b) => b.totalTokens - a.totalTokens);
}

export async function GET(request: NextRequest) {
  try {
    // Auth check - admin only
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // TODO: Check if user is admin
    // For now, allow all authenticated users
    
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7");
    const agent = searchParams.get("agent");
    
    // Get all usage data from local API (via Cloudflare Tunnel)
    const SHORTS_API = process.env.SHORTS_API_URL || 'https://shorts-api.iphonemod.net';
    let entries: UsageEntry[] = [];
    let usageData: { totals: AgentUsage; byAgent: AgentUsage[]; byDate: DailyUsage[]; byModel: ModelUsage[]; byProvider: { provider: string; totalTokens: number; cost: number; input: number; output: number; cacheRead: number; cacheWrite: number }[] } | null = null;

    try {
      const resp = await fetch(`${SHORTS_API}/usage-stats?days=${days}`, { next: { revalidate: 60 } });
      if (resp.ok) {
        usageData = await resp.json();
      }
    } catch (e) {
      console.error('[usage-stats] Failed to fetch from shorts-api:', e);
    }

    if (usageData) {
      // Use pre-aggregated data from local API
      const totals = usageData.totals || { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: 0 };
      const byAgent = agent
        ? usageData.byAgent.filter((a: AgentUsage) => a.agent === agent)
        : usageData.byAgent;
      return NextResponse.json({
        totals: agent ? byAgent.reduce((acc: AgentUsage, a: AgentUsage) => ({
          ...acc, input: acc.input + a.input, output: acc.output + a.output,
          cacheRead: acc.cacheRead + a.cacheRead, cacheWrite: acc.cacheWrite + a.cacheWrite,
          totalTokens: acc.totalTokens + a.totalTokens, cost: acc.cost + a.cost,
        } as AgentUsage), { agent: 'total', input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: 0 } as AgentUsage) : totals,
        byAgent,
        byDate: usageData.byDate,
        byModel: usageData.byModel || [],
        byProvider: usageData.byProvider || [],
        days,
      });
    }

    // Fallback: read local files (works only on local PM2)
    let entries2 = await getAllUsage(days);
    
    entries = entries2;
    // Filter by agent if specified
    if (agent) {
      entries = entries.filter(e => e.agent === agent);
    }
    
    // Calculate totals
    const totals = {
      input: entries.reduce((sum, e) => sum + e.input, 0),
      output: entries.reduce((sum, e) => sum + e.output, 0),
      cacheRead: entries.reduce((sum, e) => sum + e.cacheRead, 0),
      cacheWrite: entries.reduce((sum, e) => sum + e.cacheWrite, 0),
      totalTokens: entries.reduce((sum, e) => sum + e.totalTokens, 0),
      cost: entries.reduce((sum, e) => sum + e.cost, 0),
    };
    
    return NextResponse.json({
      success: true,
      days,
      totals,
      byDate: aggregateByDate(entries),
      byAgent: aggregateByAgent(entries),
      byModel: aggregateByModel(entries),
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
