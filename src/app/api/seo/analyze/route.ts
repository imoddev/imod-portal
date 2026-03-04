import { NextRequest, NextResponse } from "next/server";

// POST /api/seo/analyze - Analyze content for SEO
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, keyphrase, metaDescription, slug } = body;

    const checks: { name: string; status: "pass" | "warning" | "fail"; message: string }[] = [];
    let score = 0;
    const maxScore = 100;

    // 1. Title checks
    if (title) {
      const titleLength = title.length;
      if (titleLength >= 40 && titleLength <= 60) {
        checks.push({ name: "Title Length", status: "pass", message: `✓ ความยาว ${titleLength} ตัวอักษร (40-60 เหมาะสม)` });
        score += 10;
      } else if (titleLength > 60) {
        checks.push({ name: "Title Length", status: "warning", message: `! Title ยาวเกินไป (${titleLength}/60)` });
        score += 5;
      } else {
        checks.push({ name: "Title Length", status: "fail", message: `✗ Title สั้นเกินไป (${titleLength}/40)` });
      }

      if (keyphrase && title.toLowerCase().includes(keyphrase.toLowerCase())) {
        checks.push({ name: "Keyphrase in Title", status: "pass", message: "✓ มี Keyphrase อยู่ใน Title" });
        score += 10;
      } else if (keyphrase) {
        checks.push({ name: "Keyphrase in Title", status: "fail", message: "✗ ไม่พบ Keyphrase ใน Title" });
      }
    } else {
      checks.push({ name: "Title", status: "fail", message: "✗ ไม่มี Title" });
    }

    // 2. Meta Description checks
    if (metaDescription) {
      const metaLength = metaDescription.length;
      if (metaLength >= 120 && metaLength <= 160) {
        checks.push({ name: "Meta Description Length", status: "pass", message: `✓ ความยาว ${metaLength} ตัวอักษร (120-160 เหมาะสม)` });
        score += 10;
      } else if (metaLength > 160) {
        checks.push({ name: "Meta Description Length", status: "warning", message: `! Meta Description ยาวเกินไป (${metaLength}/160)` });
        score += 5;
      } else {
        checks.push({ name: "Meta Description Length", status: "fail", message: `✗ Meta Description สั้นเกินไป (${metaLength}/120)` });
      }

      if (keyphrase && metaDescription.toLowerCase().includes(keyphrase.toLowerCase())) {
        checks.push({ name: "Keyphrase in Meta", status: "pass", message: "✓ มี Keyphrase อยู่ใน Meta Description" });
        score += 10;
      } else if (keyphrase) {
        checks.push({ name: "Keyphrase in Meta", status: "warning", message: "! ควรใส่ Keyphrase ใน Meta Description" });
        score += 5;
      }
    } else {
      checks.push({ name: "Meta Description", status: "fail", message: "✗ ไม่มี Meta Description" });
    }

    // 3. Content checks
    if (content) {
      const wordCount = content.split(/\s+/).length;
      if (wordCount >= 300) {
        checks.push({ name: "Content Length", status: "pass", message: `✓ เนื้อหา ${wordCount} คำ (≥300 เหมาะสม)` });
        score += 15;
      } else {
        checks.push({ name: "Content Length", status: "warning", message: `! เนื้อหาสั้น (${wordCount}/300 คำ)` });
        score += 5;
      }

      // Check keyphrase density
      if (keyphrase) {
        const regex = new RegExp(keyphrase, "gi");
        const matches = content.match(regex) || [];
        const density = (matches.length / wordCount) * 100;

        if (density >= 1 && density <= 3) {
          checks.push({ name: "Keyphrase Density", status: "pass", message: `✓ ความถี่ Keyphrase ${density.toFixed(1)}% (1-3% เหมาะสม)` });
          score += 15;
        } else if (density > 3) {
          checks.push({ name: "Keyphrase Density", status: "warning", message: `! ใช้ Keyphrase มากเกินไป (${density.toFixed(1)}%)` });
          score += 5;
        } else {
          checks.push({ name: "Keyphrase Density", status: "fail", message: `✗ ใช้ Keyphrase น้อยเกินไป (${density.toFixed(1)}%)` });
        }

        // Check keyphrase in first paragraph
        const firstPara = content.split("\n")[0] || "";
        if (firstPara.toLowerCase().includes(keyphrase.toLowerCase())) {
          checks.push({ name: "Keyphrase in Intro", status: "pass", message: "✓ มี Keyphrase อยู่ในย่อหน้าแรก" });
          score += 10;
        } else {
          checks.push({ name: "Keyphrase in Intro", status: "warning", message: "! ควรใส่ Keyphrase ในย่อหน้าแรก" });
          score += 3;
        }
      }

      // Check for H2 headings
      const h2Matches = content.match(/##\s+/g) || [];
      if (h2Matches.length >= 2) {
        checks.push({ name: "Headings", status: "pass", message: `✓ มี H2 headings ${h2Matches.length} อัน` });
        score += 10;
      } else if (h2Matches.length === 1) {
        checks.push({ name: "Headings", status: "warning", message: "! ควรมี H2 มากกว่า 1 อัน" });
        score += 5;
      } else {
        checks.push({ name: "Headings", status: "fail", message: "✗ ไม่มี H2 headings" });
      }

      // Check for internal/external links
      const linkMatches = content.match(/\[.*?\]\(.*?\)/g) || [];
      if (linkMatches.length >= 2) {
        checks.push({ name: "Links", status: "pass", message: `✓ มี ${linkMatches.length} ลิงก์` });
        score += 10;
      } else if (linkMatches.length === 1) {
        checks.push({ name: "Links", status: "warning", message: "! ควรมีลิงก์มากกว่า 1 อัน" });
        score += 5;
      } else {
        checks.push({ name: "Links", status: "fail", message: "✗ ไม่มีลิงก์ในเนื้อหา" });
      }
    } else {
      checks.push({ name: "Content", status: "fail", message: "✗ ไม่มีเนื้อหา" });
    }

    // 4. Slug check
    if (slug) {
      if (keyphrase && slug.toLowerCase().includes(keyphrase.toLowerCase().replace(/\s+/g, "-"))) {
        checks.push({ name: "Keyphrase in URL", status: "pass", message: "✓ มี Keyphrase อยู่ใน URL" });
        score += 10;
      } else if (keyphrase) {
        checks.push({ name: "Keyphrase in URL", status: "warning", message: "! ควรใส่ Keyphrase ใน URL" });
        score += 5;
      }
    }

    // Determine overall status
    let status: "good" | "ok" | "poor";
    if (score >= 70) status = "good";
    else if (score >= 40) status = "ok";
    else status = "poor";

    // AI Suggestions
    const suggestions: string[] = [];
    
    for (const check of checks) {
      if (check.status === "fail" || check.status === "warning") {
        if (check.name.includes("Title") && !title) {
          suggestions.push("เพิ่ม Title ที่มี Keyphrase และยาว 40-60 ตัวอักษร");
        }
        if (check.name.includes("Meta") && !metaDescription) {
          suggestions.push("เพิ่ม Meta Description ที่มี Keyphrase และยาว 120-160 ตัวอักษร");
        }
        if (check.name.includes("Links")) {
          suggestions.push("เพิ่มลิงก์ภายใน (internal links) ไปยังบทความอื่นในเว็บ");
        }
        if (check.name.includes("Headings")) {
          suggestions.push("เพิ่ม H2 headings เพื่อแบ่งหัวข้อในเนื้อหา");
        }
      }
    }

    return NextResponse.json({
      success: true,
      score,
      maxScore,
      status,
      checks,
      suggestions: [...new Set(suggestions)].slice(0, 5), // Remove duplicates
    });
  } catch (error) {
    console.error("SEO analyze error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
