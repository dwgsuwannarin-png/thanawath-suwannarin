export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface GenerationResult {
  imageUrl?: string;
  text?: string;
}

export type PlanType = 'FREE' | 'PRO';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  avatarUrl?: string;
  role?: 'ADMIN' | 'USER';
  status?: 'ACTIVE' | 'PENDING' | 'BANNED';
}