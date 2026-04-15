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

export interface ConsultationSession {
  id: string;
  title: string;                  // e.g. "Antenatal checkup – Dr. Amara"
  date: string;                   // ISO datetime
  durationSeconds: number;
  audioUri?: string;              // local file URI (cloud URL later)
  status: ConsultationStatus;
  permissionGranted: boolean;
  transcript?: string;
  summary?: string;
  extractedData?: ConsultationExtractedData;
  actionItems: ConsultationActionItem[];
}
