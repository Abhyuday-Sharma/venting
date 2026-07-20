
import type { Timestamp } from "firebase/firestore";

export interface MoodInsights {
  summary: string;
  triggers: string[];
  strengths: string[];
  gentleReframe: string;
  overallTrend: 'improving' | 'stable' | 'declining' | 'fluctuating';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  username: string | null;
  photoURL: string | null;
  role?: 'owner' | 'admin' | 'moderator' | 'user';
  settings?: {
    profileVisibility?: 'public' | 'anonymous';
    defaultPostingMode?: 'private' | 'public';
    language?: string;
  };
  usernameLastChanged?: Timestamp;
  hasSupported?: boolean;
  warningCount?: number;
  banStatus?: 'none' | 'temporary' | 'permanent';
  banExpiry?: Timestamp;
  hasCompletedOnboarding?: boolean;
  ventCount?: number;
  publicVentCount?: number;
  lastInsightGeneratedAt?: Timestamp;
  currentInsights?: MoodInsights;
}

export const ventCategories = ["Work", "Relationships", "Family", "Health", "Personal Growth", "General"] as const;
export type VentCategory = typeof ventCategories[number];

export interface Vent {
  id?: string;
  userId: string;
  text: string;
  mood: number;
  category?: VentCategory;
  timestamp: Timestamp;
  isPublic?: boolean;
  isIncognito?: boolean;
  commentsDisabled?: boolean;
  safetyFlag?: boolean;
  isHidden?: boolean;
  reportCount?: number;
  authorName?: string;
  authorPhotoURL?: string | null;
  authorRole?: string;
  hearts?: number;
  hugs?: number;
  comments?: number;
  heartedBy?: string[];
  huggedBy?: string[];
  expiresAt?: Timestamp | null;
}

export interface Comment {
    id: string;
    userId: string;
    authorName: string;
    authorPhotoURL: string | null;
    authorRole?: string;
    text: string;
    timestamp: Timestamp;
    ventId: string;
    parentId?: string | null;
    replies?: Comment[];
    replyCount?: number;
    isHidden?: boolean;
    reportCount?: number;
}

export interface Notification {
    id: string;
    type: 'new_comment' | 'new_reaction_heart' | 'new_reaction_hug';
    ventId: string;
    ventOwnerId: string;
    triggeringUserId: string;
    triggeringUserName: string;
    message: string;
    read: boolean;
    timestamp: Timestamp;
}

export const reportReasonCategories = ["self-harm", "harassment", "spam"] as const;
export type ReportReasonCategory = typeof reportReasonCategories[number];

export interface Report {
  id?: string;
  reporterId: string;
  reasonCategory: ReportReasonCategory;
  reason: string;
  timestamp: Timestamp;
  targetId: string; // The ID of the vent or comment being reported
  targetType: 'vent' | 'comment';
  ventId?: string; // Always populated in global reports collection for easy linking
  status?: 'pending' | 'resolved';
}

export interface AuditLog {
    id?: string;
    actorId: string;
    actorUsername: string | null;
    action: 'ADMIN_DELETE_VENT' | 'ADMIN_DELETE_COMMENT';
    targetId: string;
    targetOwnerId: string;
    reason: string;
    timestamp: Timestamp;
}
