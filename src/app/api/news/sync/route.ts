import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SHEET_ID = "1dCXcUhZljL6065RjonJEoTk9hA31gXIrFiIYwts_FCk";

// Convert Excel serial date to YYYY-MM-DD
function excelDateToString(serial: number): string {
  if (!serial || serial < 1) return "";
  const epoch = new Date(1899, 11, 30);
  const date = new Date(epoch.getTime() + serial * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
}

// Convert Excel serial time to HH:MM
function excelTimeToString(serial: number): string {
  if (!serial && serial !== 0) return "";
  const totalMinutes = Math.round(serial * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// Map status from sheet to portal status
function mapStatus(sheetStatus: string): string {
  const status = (sheetStatus || "").toLowerCase().trim();
  if (status === "posted" || status === "published") return "published";
  if (status === "drafting" || status === "writing") return "drafting";
  if (status === "claimed" || status === "selected") return "claimed";
  return "available";
}

async function fetchFromGoogleSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Google Sheets error: ${response.status}`);
  }

  const text = await response.text();
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
  if (!jsonMatch) {
    throw new Error("Invalid response format");
  }
  
  const data = JSON.parse(jsonMatch[1]);
  const rows = data.table?.rows || [];
  
  return rows.map((row: any, index: number) => {
    const cells = row.c || [];
    
    const getValue = (idx: number) => cells[idx]?.v ?? "";
    const getFormatted = (idx: number) => cells[idx]?.f ?? getValue(idx);
    
    // Parse date
    let dateStr = "";
    const dateVal = getValue(0);
    if (typeof dateVal === "number") {
      dateStr = excelDateToString(dateVal);
    } else if (typeof dateVal === "string") {
      dateStr = dateVal;
    } else if (getFormatted(0)) {
      dateStr = String(getFormatted(0));
    }
    
    // Parse time
    let timeStr = "";
    const timeVal = getValue(1);
    if (typeof timeVal === "number") {
      timeStr = excelTimeToString(timeVal);
    } else if (typeof timeVal === "string") {
      timeStr = timeVal;
    } else if (getFormatted(1)) {
      timeStr = String(getFormatted(1));
    }
    
    return {
      sheetRowId: index,
      date: dateStr,
      time: timeStr,
      source: String(getValue(2) || ""),
      category: String(getValue(3) || ""),
      title: String(getValue(4) || ""),
      sourceUrl: String(getValue(5) || ""),
      summary: String(getValue(6) || ""),
      selectedBy: String(getValue(7) || ""),
      team: String(getValue(8) || "").toLowerCase(),
      status: mapStatus(String(getValue(9) || "")),
      notes: String(getValue(11) || ""),
    };
  }).filter((item: any) => item.title && item.sourceUrl); // Only items with title and URL
}

// POST /api/news/sync - Sync news from Google Sheet to database
export async function POST() {
  try {
    const sheetData = await fetchFromGoogleSheet();
    
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of sheetData) {
      // Check if exists by sheetRowId
      const existing = await prisma.newsItem.findUnique({
        where: { sheetRowId: item.sheetRowId },
      });

      if (existing) {
        // Update only if not claimed/drafting in portal
        if (existing.status === "available") {
          await prisma.newsItem.update({
            where: { id: existing.id },
            data: {
              date: item.date,
              time: item.time,
              source: item.source,
              category: item.category,
              title: item.title,
              sourceUrl: item.sourceUrl,
              summary: item.summary,
              selectedBy: item.selectedBy,
              team: item.team,
              notes: item.notes,
              // Don't overwrite status if already claimed in portal
            },
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Create new
        await prisma.newsItem.create({
          data: item,
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${sheetData.length} items from Google Sheet`,
      stats: {
        total: sheetData.length,
        created,
        updated,
        skipped,
      },
    });
  } catch (error) {
    console.error("Error syncing news:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/news/sync - Get sync status
export async function GET() {
  try {
    const count = await prisma.newsItem.count();
    const lastItem = await prisma.newsItem.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      totalInDb: count,
      lastUpdated: lastItem?.updatedAt || null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
