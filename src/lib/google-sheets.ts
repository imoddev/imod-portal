// Google Sheets Integration for News DB
// Sheet ID: 1dCXcUhZljL6065RjonJEoTk9hA31gXIrFiIYwts_FCk

export interface NewsItem {
  id: string;
  date: string;
  time: string;
  source: string;
  category: string;
  title: string;
  url: string;
  summary: string;
  selectedBy: string;
  team: string;
  status: "available" | "claimed" | "drafting" | "published" | "skipped";
  postedDate: string | null;
  notes: string;
}

const SHEET_ID = "1dCXcUhZljL6065RjonJEoTk9hA31gXIrFiIYwts_FCk";
const SHEET_NAME = "Sheet1";

// Using Google Sheets API v4 (public read)
export async function fetchNewsFromSheet(): Promise<NewsItem[]> {
  // Use Google Sheets API directly (sheet must be public or have API key)
  return await fetchFromGoogleSheetsAPI();
}

// Convert Excel serial date to YYYY-MM-DD
function excelDateToString(serial: number): string {
  if (!serial || serial < 1) return "";
  // Excel epoch is 1899-12-30
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

// Use Google Visualization API (public, no auth needed)
async function fetchFromGoogleSheetsAPI(): Promise<NewsItem[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Google Sheets error: ${response.status}`);
    }

    const text = await response.text();
    
    // Parse the JSONP response
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }
    
    const data = JSON.parse(jsonMatch[1]);
    const rows = data.table?.rows || [];
    
    return rows.map((row: any, index: number) => {
      const cells = row.c || [];
      
      // Get values, handling null cells
      const getValue = (idx: number) => cells[idx]?.v ?? "";
      const getFormatted = (idx: number) => cells[idx]?.f ?? getValue(idx);
      
      // Parse date - could be serial number or formatted string
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
        id: `news-${index}`,
        date: dateStr,
        time: timeStr,
        source: String(getValue(2) || ""),
        category: String(getValue(3) || ""),
        title: String(getValue(4) || ""),
        url: String(getValue(5) || ""),
        summary: String(getValue(6) || ""),
        selectedBy: String(getValue(7) || ""),
        team: String(getValue(8) || ""),
        status: mapStatus(String(getValue(9) || "")),
        postedDate: getValue(10) ? String(getValue(10)) : null,
        notes: String(getValue(11) || ""),
      };
    });
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return [];
  }
}

function mapStatus(status: string): NewsItem["status"] {
  const normalized = (status || "").toLowerCase().trim();
  
  switch (normalized) {
    case "claimed":
      return "claimed";
    case "drafting":
    case "draft":
      return "drafting";
    case "published":
    case "posted":
      return "published";
    case "skipped":
    case "skip":
      return "skipped";
    default:
      return "available";
  }
}

// Update news status (requires write access)
export async function updateNewsStatus(
  rowIndex: number,
  status: string,
  claimedBy?: string
): Promise<boolean> {
  try {
    const sheetDbUrl = "https://sheetdb.io/api/v1/794r5r4lnv1uc";
    
    const response = await fetch(`${sheetDbUrl}/id/${rowIndex}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          status: status,
          ...(claimedBy && { selected_by: claimedBy }),
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating news status:", error);
    return false;
  }
}

// Add new news item
export async function addNewsItem(item: Partial<NewsItem>): Promise<boolean> {
  try {
    const sheetDbUrl = "https://sheetdb.io/api/v1/794r5r4lnv1uc";
    
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].slice(0, 5);

    const response = await fetch(sheetDbUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          date: item.date || date,
          time: item.time || time,
          source: item.source || "",
          category: item.category || "",
          title: item.title || "",
          url: item.url || "",
          summary: item.summary || "",
          selected_by: item.selectedBy || "",
          team: item.team || "",
          status: item.status || "available",
          posted_date: item.postedDate || "",
          notes: item.notes || "",
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error adding news item:", error);
    return false;
  }
}
