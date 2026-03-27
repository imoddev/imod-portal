// Discord Webhook for NEV Enrichment Notifications

export async function sendNEVNotification({
  threadId,
  content,
}: {
  threadId: string;
  content: string;
}): Promise<boolean> {
  try {
    // Use Discord Webhook with thread_id parameter
    const WEBHOOK_URL = process.env.DISCORD_NEV_WEBHOOK || 
      "https://discord.com/api/webhooks/1487030874749931570/xHvPQ1OQDB6VncXBJgvWSgFdsHZm4GnsvNtghFDDAK7K65JH2jlB1YJt3VUtYM-dLrwI";
    
    const url = `${WEBHOOK_URL}?thread_id=${threadId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        username: 'NEV Database Bot',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Discord webhook failed: ${response.status} ${error}`);
      return false;
    }

    console.log(`✅ NEV notification sent to thread ${threadId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send NEV notification:', error.message);
    return false;
  }
}
