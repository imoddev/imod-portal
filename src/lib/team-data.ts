// Team Data - iMoD Team Members

export type Department =
  | "management"
  | "content-it"
  | "content-ev"
  | "revenue"
  | "production"
  | "creative"
  | "dev";

export type Role = "admin" | "manager" | "member";

export interface TeamMember {
  name: string;
  nickname: string;
  email?: string;
  discordId?: string;
  department: Department;
  role: Role;
  wpAuthorId?: number;
  wpUsername?: string;
}

// Team Members Data
export const teamMembers: TeamMember[] = [
  // Management
  {
    name: "Attapon Thaphaengphan",
    nickname: "พี่ต้อม",
    discordId: "1465635163466633308",
    department: "management",
    role: "admin",
    wpAuthorId: 1,
    wpUsername: "attapon",
  },
  
  // Content - IT
  {
    name: "Thitirath Kinaret",
    nickname: "พี่เต็นท์",
    discordId: "1006485307434209373",
    department: "content-it",
    role: "manager",
    wpAuthorId: 12,
    wpUsername: "itenz",
  },
  {
    name: "Nattida Suriyodara",
    nickname: "พี่กิ๊ฟ",
    discordId: "1467722118388256884",
    department: "content-it",
    role: "member",
    wpAuthorId: 52,
    wpUsername: "giffnattida",
  },
  {
    name: "Sasithakan Sritonthip",
    nickname: "Kan",
    discordId: "470479651475685387",
    department: "content-it",
    role: "member",
    wpAuthorId: 53,
    wpUsername: "Sasithakan",
  },
  {
    name: "Saktaphat Kordjan",
    nickname: "อาร์ต",
    discordId: "1415292248546873406",
    department: "content-it",
    role: "member",
    wpAuthorId: 49,
    wpUsername: "Art220743",
  },
  {
    name: "Krongkwun Rithiwong",
    nickname: "บัยคุน",
    discordId: "756874861682491443",
    department: "content-it",
    role: "member",
    wpAuthorId: 55,
    wpUsername: "krongkwun.r",
  },
  
  // Content - EV
  {
    name: "Zakura Kim",
    nickname: "พี่ซา",
    discordId: "1465626357437435969",
    department: "content-ev",
    role: "manager",
    wpAuthorId: 20,
    wpUsername: "sakura",
  },
  
  // Revenue
  {
    name: "พี่มิว",
    nickname: "พี่มิว",
    discordId: "1467402735438532628",
    department: "revenue",
    role: "manager",
  },
  {
    name: "พี่อาย",
    nickname: "พี่อาย",
    discordId: "1467373841432182936",
    department: "revenue",
    role: "member",
  },
  {
    name: "น้องสา",
    nickname: "น้องสา",
    department: "revenue",
    role: "member",
  },
  
  // Production
  {
    name: "Art",
    nickname: "Art",
    department: "production",
    role: "member",
  },
  {
    name: "KK",
    nickname: "KK",
    department: "production",
    role: "member",
  },
  {
    name: "ผิง",
    nickname: "ผิง",
    department: "production",
    role: "member",
  },
  {
    name: "จูน",
    nickname: "จูน",
    department: "production",
    role: "member",
  },
  {
    name: "M",
    nickname: "M",
    department: "production",
    role: "member",
  },
  
  // Dev
  {
    name: "พี่ยิม",
    nickname: "พี่ยิม",
    discordId: "718095804287549471",
    department: "dev",
    role: "member",
  },
  {
    name: "พี่ชาติ",
    nickname: "พี่ชาติ",
    discordId: "839873553826578443",
    department: "dev",
    role: "member",
  },
];

// Department labels
export const departmentLabels: Record<Department, string> = {
  management: "Management",
  "content-it": "Content - IT",
  "content-ev": "Content - EV",
  revenue: "Revenue",
  production: "Production",
  creative: "Creative",
  dev: "Development",
};

// Get team member by Discord ID
export function getTeamMemberByDiscordId(discordId: string): TeamMember | undefined {
  return teamMembers.find((m) => m.discordId === discordId);
}

// Get team member by WP Author ID
export function getTeamMemberByWpAuthorId(authorId: number): TeamMember | undefined {
  return teamMembers.find((m) => m.wpAuthorId === authorId);
}

// Get team members by department
export function getTeamMembersByDepartment(department: Department): TeamMember[] {
  return teamMembers.filter((m) => m.department === department);
}
