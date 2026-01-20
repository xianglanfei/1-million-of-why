export interface QuestionResponse {
  question: string;
  complexity_score: number;
  category: string;
  hook_line: string;
  wildcard_applied: WildcardType;
  generated_at: string;
  user_id?: string;
}

export interface AnswerResponse {
  answer: string;
  sources: string[];
  confidence_score: number;
  wildcard_applied: WildcardType;
  generated_at: string;
  question_id?: string;
}

export interface ImageProcessingResult {
  extracted_text?: string;
  description: string;
  confidence_score: number;
  processing_method: "text_extraction" | "image_description";
  processed_at: string;
}

export interface OfflineQuestion {
  id: string;
  question: string;
  category: string;
  complexity_score: number;
  wildcard_applied: WildcardType;
  cached_at: string;
}

export interface OfflineAnswer {
  id: string;
  question_id: string;
  answer: string;
  sources: string[];
  wildcard_applied: WildcardType;
  cached_at: string;
}

export interface WildcardType {
  name: string;
  tone: string;
  description: string;
}

export interface QuestionArchetype {
  name: string;
  prompt_template: string;
  category: string;
  complexity_range: [number, number];
}

export interface UserHistory {
  user_id: string;
  previous_questions: string[];
  preferred_wildcards: WildcardType[];
  last_updated: string;
}

export interface AIServiceConfig {
  provider: "openai" | "anthropic";
  model: string;
  max_tokens: number;
  temperature: number;
}

export interface ValidationResult {
  is_valid: boolean;
  confidence_score: number;
  issues: string[];
}
