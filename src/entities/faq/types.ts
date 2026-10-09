import type { StructuredTextBlock } from "@/entities/shared";

export interface Faq {
  id: number;
  question: string;
  answer: StructuredTextBlock[];
  has_audio: boolean;
  audio_url: string | null;
  audio_duration_seconds: number | null;
}
