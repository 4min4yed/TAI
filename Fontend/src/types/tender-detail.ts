// Document Upload & Management Types
export interface TenderDocument {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "zip" | "other";
  size: number; // bytes
  uploaded_at: string;
  uploaded_by: string;
  url: string;
  thumbnail_url?: string;
  status: "uploading" | "processing" | "ready" | "error";
  page_count?: number;
  error_message?: string;
}

// Extracted Metadata Types
export interface ExtractedMetadata {
  buyer_name: string;
  buyer_contact?: string;
  deadline: string;
  submission_method?: "online" | "physical" | "both";
  reference_number: string;
  publication_date?: string;
  contract_duration?: string;
  lots: Lot[];
  evaluation_criteria: EvaluationCriterion[];
  required_documents: RequiredDocument[];
  budget_indicators: BudgetIndicator[];
}

export interface Lot {
  id: string;
  number: string;
  title: string;
  description: string;
  estimated_value?: number;
  currency?: string;
  category?: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number; // percentage
  description?: string;
  sub_criteria?: {
    name: string;
    weight: number;
  }[];
}

export interface RequiredDocument {
  id: string;
  name: string;
  mandatory: boolean;
  status: "missing" | "uploaded" | "validated" | "rejected";
  type?: "technical" | "legal" | "financial" | "administrative" | "other";
  uploaded_file_id?: string;
  uploaded_at?: string;
  rejection_reason?: string;
}

export interface BudgetIndicator {
  id: string;
  type: "estimated_budget" | "max_budget" | "quantity" | "unit_price";
  value: string;
  currency?: string;
  unit?: string;
  notes?: string;
}

// Section & Team Types
export type TeamType = "technical" | "legal" | "pricing" | "management";

export interface TenderSection {
  id: string;
  name: string;
  description: string;
  assigned_team: TeamType;
  progress: number; // 0-100
  validation_status:
    | "not_started"
    | "in_progress"
    | "ready_for_review"
    | "validated"
    | "rejected";
  assigned_users: string[];
  deadline?: string;
  comments_count: number;
  last_updated: string;
  subsections?: TenderSubsection[];
  attachments?: string[];
}

export interface TenderSubsection {
  id: string;
  name: string;
  completed: boolean;
  required: boolean;
  assigned_to?: string;
  notes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamType;
  avatar_url?: string;
}

// Complete Tender Detail Data
export interface TenderDetailData {
  id: string;
  title: string;
  buyer: string;
  status:
    | "new"
    | "in_progress"
    | "in_review"
    | "ready_to_submit"
    | "submitted"
    | "won"
    | "lost"
    | "cancelled";
  deadline: string;
  created_at: string;
  documents: TenderDocument[];
  metadata: ExtractedMetadata;
  sections: TenderSection[];
  team_members: TeamMember[];
  overall_progress?: number;
  compliance_score?: number;
}
