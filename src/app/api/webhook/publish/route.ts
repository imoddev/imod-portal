import { NextRequest, NextResponse } from "next/server";

// Webhook endpoint for WordPress publish notifications
// Can be triggered by WordPress webhook plugin on publish

// Short.io API
const SHORT_IO_API_KEY = "sk_21ZlwbgZsevwCUoh";
const SHORT_IO_DOMAIN = "imods.cc";

async function createShortUrl(url: string): Promise<string> {
  try {
    const res = await fetch("https://api.short.io/links", {
      method: "POST",
      headers: {
        "Authorization": SHORT_IO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: SHORT_IO_DOMAIN,
        originalURL: url,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.shortURL || url;
    }
  } catch (e) {
    console.error("Short URL error:", e);
  }
  return url;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      url,
      excerpt,
      author,
      categories,
      tags,
      featuredImage,
      site, // imod or imoddrive
    } = body;

    if (!title || !url) {
      return NextResponse.json(
        { success: false, error: "Title and URL required" },
        { status: 400 }
      );
    }

    // Create short URL
    const shortUrl = await createShortUrl(url);

    // Prepare tweet content
    const tweetText = `${title}\n\n${shortUrl}`;

    // Prepare Discord notification
    const discordMessage = `📢 **บทความใหม่ Published!**\n\n` +
      `📝 **${title}**\n` +
      (author ? `✍️ โดย: ${author}\n` : "") +
      (categories?.length ? `📂 หมวด: ${categories.join(", ")}\n` : "") +
      `\n🔗 ${shortUrl}`;

    // Send Discord notification
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:4141";
    const channelId = site === "imoddrive" ? "1467136835208609827" : "1467136896391188560";

    await fetch(`${gatewayUrl}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        channel: "discord",
        target: channelId,
        message: discordMessage,
      }),
    }).catch(() => {});

    // TODO: Auto-tweet using Bird CLI
    // For now, return tweet content for manual posting or future automation
    // Bird CLI command: bird tweet "content" --media image.jpg

    return NextResponse.json({
      success: true,
      shortUrl,
      tweet: tweetText,
      discordSent: true,
    });
  } catch (error) {
    console.error("Publish webhook error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
