export interface ConsultationMedication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface ConsultationActionItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ConsultationExtractedData {
  nextAppointment?: string;       // ISO date string
  medications: ConsultationMedication[];
  instructions: string[];         // follow-up instructions
  contextNotes: string[];         // general context for the AI
}

export type ConsultationStatus = 'recording' | 'processing' | 'done' | 'error';

export type SessionType = 'doctor' | 'scan' | 'midwife';

export interface ConsultationSession {
  id: string;
  title: string;                  // e.g. "Antenatal checkup – Dr. Amara"
  date: string;                   // ISO datetime
  durationSeconds: number;
  audioUri?: string;              // local file URI (cloud URL later)
  status: ConsultationStatus;
  permissionGranted: boolean;
  sessionType: SessionType;
  scanType?: string;              // e.g. "Dating", "NT", "Anatomy", "Growth"
  gestationalWeek?: number;       // e.g. 12
  imagingFacility?: string;       // e.g. "St. Thomas Hospital"
  transcript?: string;
  summary?: string;
  extractedData?: ConsultationExtractedData;
  actionItems: ConsultationActionItem[];
}
