import { NextRequest, NextResponse } from "next/server";

// Discord Channel IDs
const CHANNELS = {
  "content-team": "1467136896391188560",
  "imoddrive": "1467136835208609827",
};

// AI Agent mapping
const AI_AGENTS = {
  "marcus": { name: "Marcus", id: "1470708790902132806" },
  "lucus": { name: "Lucus #001", id: "1465655490343211009" },
};

// AI Models
const AI_MODELS: Record<string, string> = {
  "qwen-local": "Qwen 3 8B (Local)",
  "qwen-fast": "Qwen 3 4B (Fast)",
  "claude-sonnet": "Claude Sonnet 4.5",
};

// Writing styles
const WRITING_STYLES: Record<string, string> = {
  "attapon": "สไตล์พี่ต้อม (SEO เขียว, Tags 5+, Internal Links)",
  "standard": "มาตรฐาน",
  "thitirath": "สไตล์พี่เต็นท์ (Checklist 14 ข้อ)",
  "sakura": "สไตล์พี่ซา",
  "pr": "PR News",
  "fun": "สนุกสนาน",
  "friendly": "แบบเพื่อน",
  "formal": "ทางการ",
  "quick": "สรุปสั้น",
};

// POST /api/draft/dispatch - Returns command for manual sending or internal use
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      sourceUrl, 
      site, 
      author,
      style,
      model,
      agent = "marcus",
      summary,
    } = body;

    if (!title || !sourceUrl) {
      return NextResponse.json(
        { success: false, error: "title and sourceUrl are required" },
        { status: 400 }
      );
    }

    // Determine target channel based on site
    const targetChannel = site === "imoddrive" ? "imoddrive" : "content-team";
    const channelId = CHANNELS[targetChannel];
    const siteName = site === "imoddrive" ? "iMoD Drive" : "iMoD";
    const wpSite = site === "imoddrive" ? "ev.iphonemod.net" : "iphonemod.net";
    
    // Get agent info
    const agentInfo = AI_AGENTS[agent as keyof typeof AI_AGENTS] || AI_AGENTS.marcus;
    const modelName = AI_MODELS[model] || model || "Claude Sonnet 4.5";
    const styleName = WRITING_STYLES[style] || style || "มาตรฐาน";

    // Build the command message - mention agent at the start for trigger
    const message = `<@${agentInfo.id}> 📝 **คำสั่ง Draft ใหม่**

**${title}**

🔗 เว็บไซต์ต้นทาง: ${sourceUrl}
🌐 เขียนไปที่: **${siteName}** (${wpSite})
✍️ ผู้เขียน: ${author || "ไม่ระบุ"}
🎨 สไตล์: ${styleName}
💡 AI Model: ${modelName}

${summary ? `📋 สรุป: ${summary}\n` : ""}
---
**งาน:** เขียนบทความจากแหล่งข่าวด้านบน แล้วโพสต์เป็น Draft บน WordPress โดยใช้สไตล์ที่ระบุ`;

    // Return the command info - Lucus will send it via message tool
    return NextResponse.json({
      success: true,
      command: {
        message,
        channelId,
        channelName: targetChannel === "imoddrive" ? "#imoddrive" : "#content-team",
        agentId: agentInfo.id,
        agentName: agentInfo.name,
      },
      // Also return formatted for copy
      copyText: message,
    });
  } catch (error) {
    console.error("Error preparing draft command:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
