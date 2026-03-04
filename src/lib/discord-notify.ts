// Discord Webhook Notifications

interface WebhookMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
  thumbnail?: { url: string };
  author?: { name: string; url?: string; icon_url?: string };
}

// Webhook URLs from TOOLS.md
const WEBHOOKS = {
  contentTeam: "https://discord.com/api/webhooks/1471703144198307841/TrpESGf38wqruk_IvICsouBGpW9lqjdRJ-bPce7S59BMNtdaBtPh2hsU6bpI983C2cRz",
  imoddrive: "https://discord.com/api/webhooks/1471703309399097344/UMakRdNbMytiTlRBZDwcbWVWie9E8oWZzGADCiPHacBzpNPTMOK5I7bmJVPiv7y4dLWB",
};

// Colors
const COLORS = {
  success: 0x22c55e,  // green
  info: 0x3b82f6,     // blue
  warning: 0xf59e0b,  // amber
  error: 0xef4444,    // red
  purple: 0x8b5cf6,   // purple
  pink: 0xec4899,     // pink
};

async function sendWebhook(webhookUrl: string, message: WebhookMessage): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    return response.ok;
  } catch (error) {
    console.error("Discord webhook error:", error);
    return false;
  }
}

// Notify when a new draft is created
export async function notifyNewDraft(data: {
  title: string;
  site: "imod" | "imoddrive";
  author: string;
  editUrl?: string;
  sourceUrl?: string;
}): Promise<boolean> {
  const webhook = data.site === "imod" ? WEBHOOKS.contentTeam : WEBHOOKS.imoddrive;
  const siteName = data.site === "imod" ? "iMoD" : "iMoD Drive";
  
  const embed: DiscordEmbed = {
    title: "📝 Draft ใหม่",
    description: data.title,
    color: COLORS.info,
    fields: [
      { name: "เว็บไซต์", value: siteName, inline: true },
      { name: "ผู้เขียน", value: data.author, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "iMoD Portal" },
  };

  if (data.editUrl) {
    embed.fields?.push({ name: "แก้ไข", value: `[เปิด WordPress](${data.editUrl})`, inline: true });
  }

  if (data.sourceUrl) {
    embed.fields?.push({ name: "แหล่งที่มา", value: `[ดูต้นฉบับ](${data.sourceUrl})`, inline: true });
  }

  return sendWebhook(webhook, {
    embeds: [embed],
    username: "iMoD Portal",
  });
}

// Notify when news is claimed
export async function notifyNewsClaimed(data: {
  title: string;
  claimedBy: string;
  team: "content" | "ev";
  url?: string;
}): Promise<boolean> {
  const webhook = data.team === "content" ? WEBHOOKS.contentTeam : WEBHOOKS.imoddrive;
  
  const embed: DiscordEmbed = {
    title: "🎯 ข่าวถูก Claim",
    description: data.title,
    color: COLORS.warning,
    fields: [
      { name: "Claimed โดย", value: data.claimedBy, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "iMoD Portal" },
  };

  if (data.url) {
    embed.url = data.url;
  }

  return sendWebhook(webhook, {
    embeds: [embed],
    username: "iMoD Portal",
  });
}

// Notify when article is published
export async function notifyPublished(data: {
  title: string;
  site: "imod" | "imoddrive";
  author: string;
  url: string;
  thumbnail?: string;
}): Promise<boolean> {
  const webhook = data.site === "imod" ? WEBHOOKS.contentTeam : WEBHOOKS.imoddrive;
  const siteName = data.site === "imod" ? "iMoD" : "iMoD Drive";
  
  const embed: DiscordEmbed = {
    title: "🎉 บทความเผยแพร่แล้ว!",
    description: data.title,
    url: data.url,
    color: COLORS.success,
    fields: [
      { name: "เว็บไซต์", value: siteName, inline: true },
      { name: "ผู้เขียน", value: data.author, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "iMoD Portal" },
  };

  if (data.thumbnail) {
    embed.thumbnail = { url: data.thumbnail };
  }

  return sendWebhook(webhook, {
    embeds: [embed],
    username: "iMoD Portal",
  });
}

// Notify new lead
export async function notifyNewLead(data: {
  companyName: string;
  contactName: string;
  value?: number;
  assignedTo: string;
}): Promise<boolean> {
  // Revenue team webhook (need to add to TOOLS.md)
  const revenueWebhook = process.env.DISCORD_REVENUE_WEBHOOK;
  
  if (!revenueWebhook) {
    console.warn("No revenue webhook configured");
    return false;
  }

  const embed: DiscordEmbed = {
    title: "💰 Lead ใหม่!",
    color: COLORS.purple,
    fields: [
      { name: "บริษัท", value: data.companyName, inline: true },
      { name: "ผู้ติดต่อ", value: data.contactName, inline: true },
      { name: "มอบหมายให้", value: data.assignedTo, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "iMoD Portal" },
  };

  if (data.value) {
    embed.fields?.push({ 
      name: "มูลค่า", 
      value: `฿${data.value.toLocaleString()}`, 
      inline: true 
    });
  }

  return sendWebhook(revenueWebhook, {
    embeds: [embed],
    username: "iMoD Portal",
  });
}

// Daily summary
export async function notifyDailySummary(data: {
  date: string;
  articles: { imod: number; drive: number };
  leads: { new: number; won: number };
  tasks: { completed: number; pending: number };
}): Promise<boolean> {
  const embed: DiscordEmbed = {
    title: `📊 สรุปประจำวัน - ${data.date}`,
    color: COLORS.info,
    fields: [
      { 
        name: "📰 บทความ", 
        value: `iMoD: ${data.articles.imod} | Drive: ${data.articles.drive}`, 
        inline: false 
      },
      { 
        name: "💰 Leads", 
        value: `ใหม่: ${data.leads.new} | Won: ${data.leads.won}`, 
        inline: false 
      },
      { 
        name: "✅ Tasks", 
        value: `เสร็จ: ${data.tasks.completed} | รอ: ${data.tasks.pending}`, 
        inline: false 
      },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "iMoD Portal - Daily Report" },
  };

  // Send to both channels
  const results = await Promise.all([
    sendWebhook(WEBHOOKS.contentTeam, { embeds: [embed], username: "iMoD Portal" }),
    sendWebhook(WEBHOOKS.imoddrive, { embeds: [embed], username: "iMoD Portal" }),
  ]);

  return results.every(Boolean);
}

// Generic notification
export async function notify(
  channel: "content" | "ev" | "all",
  message: string,
  type: "success" | "info" | "warning" | "error" = "info"
): Promise<boolean> {
  const embed: DiscordEmbed = {
    description: message,
    color: COLORS[type],
    timestamp: new Date().toISOString(),
  };

  const webhooksToSend = channel === "all" 
    ? [WEBHOOKS.contentTeam, WEBHOOKS.imoddrive]
    : [channel === "content" ? WEBHOOKS.contentTeam : WEBHOOKS.imoddrive];

  const results = await Promise.all(
    webhooksToSend.map((webhook) => 
      sendWebhook(webhook, { embeds: [embed], username: "iMoD Portal" })
    )
  );

  return results.every(Boolean);
}
