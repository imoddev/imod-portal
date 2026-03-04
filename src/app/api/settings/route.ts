import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

interface Settings {
  youtube?: {
    apiKey?: string;
    channelId?: string;
  };
  googleSheets?: {
    newsDbSheetId?: string;
    contentReportSheetId?: string;
  };
  notifications?: {
    discordWebhook?: string;
  };
}

async function getSettings(): Promise<Settings> {
  try {
    const data = await readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveSettings(settings: Settings): Promise<void> {
  const dir = path.dirname(SETTINGS_FILE);
  await mkdir(dir, { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// GET /api/settings - Get current settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getSettings();
    
    // Mask sensitive data
    const masked: Settings = {
      youtube: {
        apiKey: settings.youtube?.apiKey ? "••••••••" + settings.youtube.apiKey.slice(-4) : undefined,
        channelId: settings.youtube?.channelId,
      },
      googleSheets: settings.googleSheets,
      notifications: {
        discordWebhook: settings.notifications?.discordWebhook 
          ? "••••••••" + settings.notifications.discordWebhook.slice(-8) 
          : undefined,
      },
    };

    return NextResponse.json(masked);
  } catch (error) {
    console.error("Error getting settings:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Update settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    
    const body = await request.json();
    const currentSettings = await getSettings();
    
    const newSettings: Settings = {
      ...currentSettings,
      ...body,
    };

    // Deep merge
    if (body.youtube) {
      newSettings.youtube = { ...currentSettings.youtube, ...body.youtube };
    }
    if (body.googleSheets) {
      newSettings.googleSheets = { ...currentSettings.googleSheets, ...body.googleSheets };
    }
    if (body.notifications) {
      newSettings.notifications = { ...currentSettings.notifications, ...body.notifications };
    }

    await saveSettings(newSettings);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
