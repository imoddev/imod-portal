// User & Auth Types
export type Department = 
  | 'management'
  | 'content-it'
  | 'content-ev'
  | 'revenue'
  | 'production'
  | 'creative'
  | 'dev';

export type Role = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  department: Department;
  role: Role;
  managerId?: string;
  jobDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Types
export type ActivityType = 
  | 'article'
  | 'video'
  | 'shooting'
  | 'editing'
  | 'sales'
  | 'meeting'
  | 'other';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  date: Date;
  createdAt: Date;
}

// Content Types
export interface Article {
  id: number;
  title: string;
  url: string;
  author: string;
  publishedAt: Date;
  views?: number;
  site: 'iphonemod' | 'evmod';
}

export interface NewsItem {
  id: string;
  title: string;
  sourceUrl: string;
  source: string;
  category: string;
  status: 'available' | 'claimed' | 'drafting' | 'published';
  claimedBy?: string;
  createdAt: Date;
}

// Revenue Types
export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  status: LeadStatus;
  value?: number;
  notes?: string;
  nextFollowUp?: Date;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

// Production Types
export type ProjectStatus = 
  | 'backlog'
  | 'in-progress'
  | 'review'
  | 'done';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  assignedTo?: string[];
  dueDate?: Date;
  driveLink?: string;
  createdAt: Date;
  updatedAt: Date;
}
