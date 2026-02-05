export type UserRole = 'admin' | 'user';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  titles?: string[];
  avatarUrl?: string;
}

export interface Research {
  _id: string;
  title: string;
  year: number;
  journal?: string;
  topic?: string;
  summary: string;
  pdfUrl?: string;
  externalLink?: string;
  keywords?: string[];
  featured?: boolean;
  status: 'draft' | 'pending_review' | 'published';
  author?: User | string;
  slug?: string;
  createdAt?: string;
}

export interface EventItem {
  _id: string;
  name: string;
  role: string;
  date: string;
  location?: string;
  description?: string;
  category: 'upcoming' | 'past';
  images?: string[];
  imageUrl?: string;
  materialsUrl?: string;
}

export interface ContentBlock {
  _id: string;
  slug: 'home' | 'about';
  heroHeadline?: string;
  heroSubtext?: string;
  heroCtas?: { label: string; href: string }[];
  intro?: string;
  bio?: string;
  profilePhoto?: string;
  roles?: string[];
  expertise?: string[];
  stats?: {
    yearsExperience?: number;
    rolesHandled?: number;
    researchCount?: number;
  };
}

export interface MessageReply {
  body: string;
  sentAt: string;
  sentBy: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  requestType: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  replies?: MessageReply[];
  createdAt: string;
}




