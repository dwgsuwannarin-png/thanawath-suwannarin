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