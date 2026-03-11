import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

// JSON file storage (will migrate to DB later)
const DATA_FILE = path.join(process.cwd(), "data", "calendar-events.json");

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  type: "meeting" | "shooting" | "deadline" | "event" | "leave";
  location?: string;
  attendees?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    require("fs").mkdirSync(dataDir, { recursive: true });
  }
}

function loadEvents(): CalendarEvent[] {
  ensureDataDir();
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveEvents(events: CalendarEvent[]) {
  ensureDataDir();
  writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
}

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET - List all events
export async function GET(request: NextRequest) {
  try {
    const events = loadEvents();
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, date, endDate, time, type, location, attendees, description } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }

    const events = loadEvents();
    const now = new Date().toISOString();
    
    const newEvent: CalendarEvent = {
      id: generateId(),
      title,
      date,
      endDate,
      time,
      type: type || "event",
      location,
      attendees: attendees || [],
      description,
      createdAt: now,
      updatedAt: now,
    };

    events.push(newEvent);
    saveEvents(events);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
