import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export interface MemberKPI {
  name: string;
  nickname: string;
  total: number;
  done: number;
  doneRate: number;
  website: number;
  shorts: number;
  youtube: number;
  picPosts: number;
  clientWork: number;
  ideaWork: number;
  categories: Record<string, number>;
  monthly: Record<string, number>;
  isActive: boolean;
}

export interface KPIData {
  total: number;
  members: MemberKPI[];
  contentTypes: { name: string; value: number; percentage: number }[];
  categories: { name: string; value: number; percentage: number }[];
  monthlyTrend: { month: string; [key: string]: number | string }[];
  lastUpdated: string;
}

const NAME_MAP: Record<string, string> = {
  "Saktaphat": "อาร์ต",
  "Nattida": "กิ๊ฟ",
  "Thitirath": "เต็นท์",
  "Sasithakan": "กานต์",
  "Krongkwun": "KK",
  "Sakura": "พี่ซา",
  "Nuttanon": "นน",
};

const ACTIVE_MEMBERS = ["Saktaphat", "Nattida", "Thitirath", "Sasithakan", "Krongkwun", "Sakura"];

function parseExcel(): KPIData {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require("xlsx");
    const filePath = path.join(process.cwd(), "public", "data", "lark-content-team.xlsx");
    
    if (!fs.existsSync(filePath)) {
      throw new Error("Excel file not found");
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: Record<string, string | number | Date>[] = XLSX.utils.sheet_to_json(sheet);

    const memberMap: Record<string, MemberKPI> = {};
    const contentTypeCount: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};
    const monthlyData: Record<string, Record<string, number>> = {};

    for (const row of rows) {
      const ownerFull = String(row["Owner"] || "").trim();
      if (!ownerFull || ownerFull.includes(",")) continue;
      
      const firstName = ownerFull.split(" ")[0];
      const nickname = NAME_MAP[firstName] || firstName;
      const isActive = ACTIVE_MEMBERS.includes(firstName);

      if (!memberMap[firstName]) {
        memberMap[firstName] = {
          name: ownerFull,
          nickname,
          total: 0,
          done: 0,
          doneRate: 0,
          website: 0,
          shorts: 0,
          youtube: 0,
          picPosts: 0,
          clientWork: 0,
          ideaWork: 0,
          categories: {},
          monthly: {},
          isActive,
        };
      }

      const member = memberMap[firstName];
      member.total++;

      const status = String(row["Status"] || "");
      if (status === "Done") member.done++;

      const ctype = String(row["Content Type"] || "");
      if (ctype.includes("Website")) member.website++;
      if (ctype.includes("Shorts")) member.shorts++;
      if (ctype.includes("YouTube")) member.youtube++;
      if (ctype.includes("Pic Posts")) member.picPosts++;

      const wtype = String(row["Work Type"] || "");
      if (wtype.includes("งานลูกค้า")) member.clientWork++;
      if (wtype.includes("เสนอไอเดีย")) member.ideaWork++;

      // Category
      const cat = String(row["Content Category"] || "Unknown");
      const primaryCat = cat.split(",")[0].trim();
      member.categories[primaryCat] = (member.categories[primaryCat] || 0) + 1;
      categoryCount[primaryCat] = (categoryCount[primaryCat] || 0) + 1;

      // Content type global
      const primaryType = ctype.split(",")[0].trim() || "Unknown";
      contentTypeCount[primaryType] = (contentTypeCount[primaryType] || 0) + 1;

      // Monthly
      const createdRaw = row["Created on"];
      let monthKey = "";
      if (createdRaw) {
        let d: Date;
        if (typeof createdRaw === "number") {
          d = new Date((createdRaw - 25569) * 86400 * 1000);
        } else {
          d = new Date(String(createdRaw));
        }
        if (!isNaN(d.getTime())) {
          monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          member.monthly[monthKey] = (member.monthly[monthKey] || 0) + 1;
          if (!monthlyData[monthKey]) monthlyData[monthKey] = {};
          monthlyData[monthKey][nickname] = (monthlyData[monthKey][nickname] || 0) + 1;
        }
      }
    }

    // Calculate done rates
    Object.values(memberMap).forEach((m) => {
      m.doneRate = m.total > 0 ? Math.round((m.done / m.total) * 100) : 0;
    });

    const totalRecords = Object.values(memberMap).reduce((s, m) => s + m.total, 0);

    // Sort members by total
    const members = Object.values(memberMap).sort((a, b) => b.total - a.total);

    // Content types (top 6)
    const contentTypes = Object.entries(contentTypeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalRecords) * 100),
      }));

    // Categories (top 8)
    const categories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalRecords) * 100),
      }));

    // Monthly trend (last 4 months)
    const months = Object.keys(monthlyData).sort().slice(-4);
    const monthlyTrend = months.map((month) => {
      const [year, m] = month.split("-");
      const thaiMonths = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      return {
        month: `${thaiMonths[parseInt(m)]} ${year}`,
        ...monthlyData[month],
      };
    });

    return {
      total: totalRecords,
      members,
      contentTypes,
      categories,
      monthlyTrend,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error("KPI parse error:", err);
    // Fallback hardcoded data
    return getFallbackData();
  }
}

function getFallbackData(): KPIData {
  return {
    total: 1897,
    members: [
      { name: "Saktaphat Kordjan", nickname: "อาร์ต", total: 511, done: 510, doneRate: 100, website: 388, shorts: 73, youtube: 59, picPosts: 68, clientWork: 19, ideaWork: 12, categories: { Android: 311, Tech: 61, Apple: 49 }, monthly: { "2026-01": 58, "2026-02": 37 }, isActive: true },
      { name: "Nattida Suriyodara", nickname: "กิ๊ฟ", total: 419, done: 418, doneRate: 100, website: 183, shorts: 73, youtube: 58, picPosts: 38, clientWork: 12, ideaWork: 18, categories: { Apple: 178, AI: 163, ทั่วไป: 34 }, monthly: { "2026-01": 21, "2026-02": 53, "2026-03": 5 }, isActive: true },
      { name: "Thitirath Kinaret", nickname: "เต็นท์", total: 405, done: 404, doneRate: 100, website: 240, shorts: 5, youtube: 25, picPosts: 261, clientWork: 39, ideaWork: 15, categories: { Apple: 257, Tech: 43, Android: 31 }, monthly: { "2026-02": 115, "2026-03": 30 }, isActive: true },
      { name: "Sasithakan Sritonthip", nickname: "กานต์", total: 302, done: 302, doneRate: 100, website: 252, shorts: 36, youtube: 0, picPosts: 2, clientWork: 17, ideaWork: 10, categories: { Apple: 161, Tech: 50, Android: 21 }, monthly: { "2026-01": 45, "2026-02": 29 }, isActive: true },
      { name: "Krongkwun Rithiwong", nickname: "KK", total: 133, done: 132, doneRate: 99, website: 26, shorts: 85, youtube: 0, picPosts: 4, clientWork: 0, ideaWork: 5, categories: { Apple: 56, Tech: 42 }, monthly: { "2026-01": 23, "2026-02": 28 }, isActive: true },
      { name: "Sakura Kim", nickname: "พี่ซา", total: 64, done: 64, doneRate: 100, website: 53, shorts: 1, youtube: 0, picPosts: 36, clientWork: 2, ideaWork: 0, categories: { EV: 45, Apple: 17 }, monthly: {}, isActive: true },
    ],
    contentTypes: [
      { name: "Website", value: 855, percentage: 45 },
      { name: "Shorts", value: 401, percentage: 21 },
      { name: "YouTube", value: 154, percentage: 8 },
      { name: "Pic Posts / Album", value: 137, percentage: 7 },
    ],
    categories: [
      { name: "Apple", value: 720, percentage: 38 },
      { name: "Android", value: 373, percentage: 20 },
      { name: "AI", value: 212, percentage: 11 },
      { name: "Tech", value: 200, percentage: 11 },
      { name: "EV", value: 95, percentage: 5 },
      { name: "ทั่วไป", value: 85, percentage: 5 },
    ],
    monthlyTrend: [
      { month: "ม.ค. 2026", อาร์ต: 58, กิ๊ฟ: 21, เต็นท์: 0, กานต์: 45, KK: 23 },
      { month: "ก.พ. 2026", อาร์ต: 37, กิ๊ฟ: 53, เต็นท์: 115, กานต์: 29, KK: 28 },
      { month: "มี.ค. 2026", อาร์ต: 0, กิ๊ฟ: 5, เต็นท์: 30, กานต์: 0, KK: 0 },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  const data = parseExcel();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
