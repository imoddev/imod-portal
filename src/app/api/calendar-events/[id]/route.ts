import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "calendar-events.json");

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  type: string;
  location?: string;
  attendees?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

function loadEvents(): CalendarEvent[] {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveEvents(events: CalendarEvent[]) {
  writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
}

// GET - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = loadEvents();
    const event = events.find((e) => e.id === id);
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Failed to get event" }, { status: 500 });
  }
}

// PUT - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const events = loadEvents();
    const index = events.findIndex((e) => e.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updatedEvent: CalendarEvent = {
      ...events[index],
      ...body,
      id, // Keep original ID
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;
    saveEvents(events);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = loadEvents();
    const index = events.findIndex((e) => e.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    events.splice(index, 1);
    saveEvents(events);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
