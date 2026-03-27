// OpenClaw Discord Notification via exec
// Since OpenClaw doesn't expose HTTP API for messaging,
// we call it via CLI instead

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface NotifyOptions {
  threadId: string;
  channelId: string;
  content: string;
}

export async function sendOpenClawNotification({
  threadId,
  channelId,
  content,
}: NotifyOptions): Promise<boolean> {
  try {
    // Escape content for shell
    const escapedContent = content.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    
    // Call OpenClaw CLI to send message
    const command = `openclaw message send --channel discord --target ${channelId} --thread ${threadId} --message "${escapedContent}"`;
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 5000, // 5 second timeout
    });
    
    if (stderr && !stderr.includes('warning')) {
      console.error('OpenClaw CLI stderr:', stderr);
    }
    
    console.log('OpenClaw notification sent:', stdout.trim());
    return true;
  } catch (error: any) {
    console.error('Failed to send OpenClaw notification:', error);
    return false;
  }
}
