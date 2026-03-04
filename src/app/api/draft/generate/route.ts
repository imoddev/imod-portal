import { NextRequest, NextResponse } from "next/server";

// Available AI models
const AI_MODELS = {
  "qwen-local": {
    name: "Qwen 3 8B (Local)",
    provider: "ollama",
    model: "qwen3:8b",
  },
  "qwen-fast": {
    name: "Qwen 3 4B (Fast)",
    provider: "ollama", 
    model: "qwen3:4b",
  },
  "claude-sonnet": {
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    model: "claude-sonnet-4-5-20250929",
  },
};

// Extracted content from URL
interface SourceContent {
  title: string;
  description: string;
  author: string;
  content: string;
  url: string;
}

// Fetch content from URL using multiple methods
async function fetchSourceContent(url: string): Promise<string> {
  console.log(`Fetching content from: ${url}`);
  
  // Method 1: Try Microlink API first (fast, reliable, works well)
  try {
    const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`;
    console.log("Trying Microlink...");
    
    const response = await fetch(microlinkUrl, {
      cache: "no-store",
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === "success" && data.data) {
        const { title, description, author, publisher } = data.data;
        
        if (title || description) {
          let content = `# ${title || "Article"}\n\n`;
          if (author || publisher) content += `Author: ${author || publisher}\n\n`;
          if (description) content += `${description}\n\n`;
          content += `Source: ${url}`;
          
          console.log("Microlink success, content length:", content.length);
          return content;
        }
      }
    }
    console.log("Microlink returned no usable content");
  } catch (e) {
    console.log("Microlink failed:", e);
  }

  // Method 2: Use a different free API - urlbox or similar
  // For now, construct content from what we have (title + summary from params)
  throw new Error("Could not fetch content from URL. Try using a different source or paste the content directly.");
}

// Generate with Ollama (Qwen)
async function generateWithOllama(model: string, prompt: string): Promise<string> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 4000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama error: ${error}`);
  }

  const data = await response.json();
  return data.response;
}

// Generate with Anthropic (Claude)
async function generateWithAnthropic(model: string, prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured. Please add it to .env.local");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic error: ${error.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Build the prompt
function buildPrompt(
  sourceContent: string,
  sourceUrl: string,
  title: string,
  style: string,
  site: string
): string {
  const siteName = site === "imod" ? "iMoD (iphonemod.net)" : "iMoD Drive (ev.iphonemod.net)";
  
  let styleInstructions = "";
  switch (style) {
    case "thitirath":
      styleInstructions = `
สไตล์การเขียน: สไตล์พี่เต็นท์ (Thitirath)
กฎสำคัญ:
1. ใช้ "มี.ค." แทน "เดือนมีนาคม" (ย่อชื่อเดือนทุกครั้ง)
2. H2 ใช้ได้แค่ 1 อัน เท่านั้น
3. ลด Bold ให้น้อยที่สุด (ใช้เฉพาะที่จำเป็นจริงๆ)
4. มี <!--more--> หลัง paragraph แรก
5. ระบุแหล่งที่มาท้ายบทความเสมอ`;
      break;
    case "pr":
      styleInstructions = "สไตล์: PR News - เน้นจุดเด่น สร้างความน่าสนใจ ระบุราคาและช่องทางจำหน่าย";
      break;
    case "fun":
      styleInstructions = "สไตล์: สนุกสนาน - ใช้ภาษาเป็นกันเอง มีอารมณ์ขัน ใส่ emoji ได้";
      break;
    case "friendly":
      styleInstructions = "สไตล์: แบบเพื่อน - เขียนเหมือนเพื่อนเล่าให้ฟัง ใช้ภาษาพูดได้";
      break;
    case "formal":
      styleInstructions = "สไตล์: ทางการ - ใช้ภาษาทางการ หลีกเลี่ยงคำแสลง เหมาะกับข่าวธุรกิจ";
      break;
    case "quick":
      styleInstructions = "สไตล์: สรุปสั้น - สรุปใจความสำคัญ 2-3 ย่อหน้า ใช้ bullet points";
      break;
    default:
      styleInstructions = "สไตล์: มาตรฐาน - รูปแบบข่าวทั่วไป กระชับ ตรงประเด็น";
  }

  return `คุณเป็นนักเขียนข่าวเทคโนโลยีมืออาชีพสำหรับเว็บไซต์ ${siteName}

${styleInstructions}

## ข้อมูลต้นฉบับ
URL: ${sourceUrl}
หัวข้อ: ${title}

เนื้อหาต้นฉบับ:
${sourceContent}

## สิ่งที่ต้องทำ
แปลและเขียนบทความข่าวภาษาไทยจากข้อมูลด้านบน

## รูปแบบ Output (ตอบเป็น JSON)
{
  "title": "หัวข้อข่าวภาษาไทยที่ดึงดูด",
  "slug": "url-friendly-slug-english-lowercase",
  "excerpt": "สรุปย่อ 1-2 ประโยค",
  "focusKeyphrase": "คำค้นหาหลัก",
  "metaDescription": "คำอธิบาย SEO ไม่เกิน 160 ตัวอักษร",
  "categories": ["หมวดหมู่1", "หมวดหมู่2"],
  "tags": ["แท็ก1", "แท็ก2", "แท็ก3"],
  "content": "เนื้อหาบทความฉบับเต็ม มี <!--more--> หลัง paragraph แรก"
}

สำคัญ: ตอบเป็น JSON เท่านั้น ไม่ต้องมี markdown code block`;
}

// Parse AI response to extract JSON
function parseAIResponse(response: string): any {
  // Try to find JSON in the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
    }
  }
  
  // If no valid JSON, return error
  throw new Error("AI response was not valid JSON");
}

// POST /api/draft/generate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceUrl, title, summary, style, site, model } = body;

    if (!sourceUrl) {
      return NextResponse.json(
        { success: false, error: "sourceUrl is required" },
        { status: 400 }
      );
    }

    const selectedModel = AI_MODELS[model as keyof typeof AI_MODELS] || AI_MODELS["qwen-local"];

    // Fetch source content or use provided title/summary
    let sourceContent: string;
    try {
      sourceContent = await fetchSourceContent(sourceUrl);
    } catch (error) {
      console.log("Fetch failed, using provided title/summary as fallback");
      // Fallback: use title and summary from request if available
      if (title || summary) {
        sourceContent = `# ${title || "News Article"}\n\n${summary || ""}\n\nSource: ${sourceUrl}`;
      } else {
        return NextResponse.json(
          { success: false, error: `Failed to fetch source: ${error}` },
          { status: 400 }
        );
      }
    }

    // Build prompt
    const prompt = buildPrompt(
      sourceContent,
      sourceUrl,
      title || "News Article",
      style || "standard",
      site || "imod"
    );

    // Generate with selected model
    let aiResponse: string;
    try {
      if (selectedModel.provider === "ollama") {
        aiResponse = await generateWithOllama(selectedModel.model, prompt);
      } else if (selectedModel.provider === "anthropic") {
        aiResponse = await generateWithAnthropic(selectedModel.model, prompt);
      } else {
        throw new Error(`Unknown provider: ${selectedModel.provider}`);
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: `AI generation failed: ${error}` },
        { status: 500 }
      );
    }

    // Parse response
    let draft;
    try {
      draft = parseAIResponse(aiResponse);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response", rawResponse: aiResponse.substring(0, 500) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      model: selectedModel.name,
      draft,
    });
  } catch (error) {
    console.error("Error generating draft:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/draft/generate - List available models
export async function GET() {
  // Check which models are available
  const models = [];

  // Check Ollama
  try {
    const ollamaResponse = await fetch("http://localhost:11434/api/tags");
    if (ollamaResponse.ok) {
      const ollamaData = await ollamaResponse.json();
      const installedModels = ollamaData.models?.map((m: any) => m.name) || [];
      
      if (installedModels.some((m: string) => m.includes("qwen3:8b"))) {
        models.push({ id: "qwen-local", ...AI_MODELS["qwen-local"], available: true });
      }
      if (installedModels.some((m: string) => m.includes("qwen3:4b"))) {
        models.push({ id: "qwen-fast", ...AI_MODELS["qwen-fast"], available: true });
      }
    }
  } catch {
    // Ollama not running
  }

  // Check Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    models.push({ id: "claude-sonnet", ...AI_MODELS["claude-sonnet"], available: true });
  } else {
    models.push({ id: "claude-sonnet", ...AI_MODELS["claude-sonnet"], available: false, reason: "API key not configured" });
  }

  return NextResponse.json({
    success: true,
    models,
  });
}
