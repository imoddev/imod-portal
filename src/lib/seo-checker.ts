// SEO Checker - Analyze content for SEO score

interface SEOResult {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  checks: SEOCheck[];
  suggestions: string[];
}

interface SEOCheck {
  id: string;
  name: string;
  passed: boolean;
  score: number;
  maxScore: number;
  message: string;
}

interface ContentInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  focusKeyphrase?: string;
  metaDescription?: string;
}

export function analyzeSEO(input: ContentInput): SEOResult {
  const checks: SEOCheck[] = [];
  const suggestions: string[] = [];

  // 1. Title checks
  const titleLength = input.title.length;
  checks.push({
    id: "title-length",
    name: "ความยาว Title",
    passed: titleLength >= 30 && titleLength <= 65,
    score: titleLength >= 30 && titleLength <= 65 ? 10 : titleLength >= 20 ? 5 : 0,
    maxScore: 10,
    message: `Title มี ${titleLength} ตัวอักษร (แนะนำ 30-65)`,
  });

  if (titleLength < 30) {
    suggestions.push("Title สั้นเกินไป ควรเพิ่มรายละเอียด");
  } else if (titleLength > 65) {
    suggestions.push("Title ยาวเกินไป อาจถูกตัดใน Google");
  }

  // 2. Focus keyphrase in title
  if (input.focusKeyphrase) {
    const keyphraseInTitle = input.title.toLowerCase().includes(input.focusKeyphrase.toLowerCase());
    checks.push({
      id: "keyphrase-title",
      name: "Keyphrase ใน Title",
      passed: keyphraseInTitle,
      score: keyphraseInTitle ? 15 : 0,
      maxScore: 15,
      message: keyphraseInTitle 
        ? "Focus keyphrase อยู่ใน title แล้ว" 
        : "ควรใส่ focus keyphrase ใน title",
    });

    if (!keyphraseInTitle) {
      suggestions.push(`ใส่ "${input.focusKeyphrase}" ใน title`);
    }
  }

  // 3. Meta description
  const metaLength = input.metaDescription?.length || 0;
  checks.push({
    id: "meta-description",
    name: "Meta Description",
    passed: metaLength >= 120 && metaLength <= 160,
    score: metaLength >= 120 && metaLength <= 160 ? 10 : metaLength > 0 ? 5 : 0,
    maxScore: 10,
    message: metaLength > 0 
      ? `Meta description มี ${metaLength} ตัวอักษร (แนะนำ 120-160)`
      : "ยังไม่มี meta description",
  });

  if (!input.metaDescription) {
    suggestions.push("เพิ่ม meta description");
  } else if (metaLength < 120) {
    suggestions.push("Meta description สั้นเกินไป");
  } else if (metaLength > 160) {
    suggestions.push("Meta description ยาวเกินไป");
  }

  // 4. Focus keyphrase in meta
  if (input.focusKeyphrase && input.metaDescription) {
    const keyphraseInMeta = input.metaDescription.toLowerCase().includes(input.focusKeyphrase.toLowerCase());
    checks.push({
      id: "keyphrase-meta",
      name: "Keyphrase ใน Meta",
      passed: keyphraseInMeta,
      score: keyphraseInMeta ? 10 : 0,
      maxScore: 10,
      message: keyphraseInMeta 
        ? "Focus keyphrase อยู่ใน meta description แล้ว" 
        : "ควรใส่ focus keyphrase ใน meta description",
    });
  }

  // 5. Slug check
  const slugValid = /^[a-z0-9-]+$/.test(input.slug);
  const slugLength = input.slug.length;
  checks.push({
    id: "slug",
    name: "URL Slug",
    passed: slugValid && slugLength <= 50,
    score: slugValid && slugLength <= 50 ? 10 : slugValid ? 5 : 0,
    maxScore: 10,
    message: slugValid 
      ? `Slug ถูกต้อง (${slugLength} ตัวอักษร)`
      : "Slug ควรเป็นภาษาอังกฤษตัวเล็กและขีด - เท่านั้น",
  });

  if (!slugValid) {
    suggestions.push("แก้ slug ให้เป็น lowercase และใช้ - คั่นคำ");
  }

  // 6. Content length
  const wordCount = input.content.split(/\s+/).length;
  const contentScore = wordCount >= 300 ? 15 : wordCount >= 150 ? 10 : wordCount >= 50 ? 5 : 0;
  checks.push({
    id: "content-length",
    name: "ความยาวเนื้อหา",
    passed: wordCount >= 300,
    score: contentScore,
    maxScore: 15,
    message: `เนื้อหามี ${wordCount} คำ (แนะนำ 300+ คำ)`,
  });

  if (wordCount < 300) {
    suggestions.push("เพิ่มเนื้อหาให้มากกว่า 300 คำ");
  }

  // 7. Focus keyphrase in content
  if (input.focusKeyphrase) {
    const contentLower = input.content.toLowerCase();
    const keyphraseLower = input.focusKeyphrase.toLowerCase();
    const keyphraseCount = (contentLower.match(new RegExp(keyphraseLower, "g")) || []).length;
    const density = (keyphraseCount / wordCount) * 100;
    
    checks.push({
      id: "keyphrase-content",
      name: "Keyphrase ในเนื้อหา",
      passed: keyphraseCount >= 2 && density <= 3,
      score: keyphraseCount >= 2 ? 10 : keyphraseCount >= 1 ? 5 : 0,
      maxScore: 10,
      message: `พบ "${input.focusKeyphrase}" ${keyphraseCount} ครั้ง (density: ${density.toFixed(1)}%)`,
    });

    if (keyphraseCount < 2) {
      suggestions.push(`ใช้ "${input.focusKeyphrase}" ในเนื้อหาเพิ่มอีก`);
    } else if (density > 3) {
      suggestions.push("Keyphrase density สูงเกินไป ลดการใช้ซ้ำ");
    }
  }

  // 8. Headings check (H2)
  const h2Count = (input.content.match(/## /g) || []).length;
  checks.push({
    id: "headings",
    name: "Headings (H2)",
    passed: h2Count >= 1 && h2Count <= 5,
    score: h2Count >= 1 && h2Count <= 5 ? 10 : h2Count > 0 ? 5 : 0,
    maxScore: 10,
    message: `มี ${h2Count} headings`,
  });

  // 9. Internal links (<!--more--> tag)
  const hasMoreTag = input.content.includes("<!--more-->");
  checks.push({
    id: "more-tag",
    name: "More Tag",
    passed: hasMoreTag,
    score: hasMoreTag ? 5 : 0,
    maxScore: 5,
    message: hasMoreTag 
      ? "มี <!--more--> tag แล้ว" 
      : "ควรเพิ่ม <!--more--> หลัง paragraph แรก",
  });

  if (!hasMoreTag) {
    suggestions.push("เพิ่ม <!--more--> หลัง paragraph แรก");
  }

  // 10. Source citation
  const hasSource = /\*\*ที่มา:?\*\*|ที่มา:|Source:/i.test(input.content);
  checks.push({
    id: "source",
    name: "แหล่งที่มา",
    passed: hasSource,
    score: hasSource ? 5 : 0,
    maxScore: 5,
    message: hasSource ? "มีแหล่งที่มาแล้ว" : "ควรระบุแหล่งที่มา",
  });

  if (!hasSource) {
    suggestions.push("เพิ่มแหล่งที่มาท้ายบทความ");
  }

  // Calculate total score
  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const maxScore = checks.reduce((sum, c) => sum + c.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Determine grade
  let grade: SEOResult["grade"];
  if (percentage >= 80) grade = "A";
  else if (percentage >= 60) grade = "B";
  else if (percentage >= 40) grade = "C";
  else if (percentage >= 20) grade = "D";
  else grade = "F";

  return {
    score: percentage,
    grade,
    checks,
    suggestions,
  };
}

// Quick SEO score (just the number)
export function getQuickSEOScore(input: ContentInput): number {
  return analyzeSEO(input).score;
}
