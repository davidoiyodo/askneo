export type MoodLevel   = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 'low' | 'medium' | 'high';
export type SleepQuality = 'poor' | 'okay' | 'good';
export type SymptomSeverity = 'mild' | 'moderate' | 'severe';
export type BabyMood = 'settled' | 'fussy' | 'unsettled';

export interface MedEntry {
  name: string;
  taken: boolean;
}

export interface DailyLog {
  dateKey: string;      // YYYY-MM-DD — primary key, one doc per day
  lastUpdated: string;  // ISO datetime of last modification
  stage: string;

  // Wellbeing
  mood: MoodLevel | null;
  energy: EnergyLevel | null;

  // Symptoms
  symptoms: string[];
  symptomSeverity: SymptomSeverity | null;

  // Medications
  medications: MedEntry[];

  // Sleep (previous night)
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;

  // Pregnancy: fetal kick count
  kickCount: number | null;

  // Newmom: baby log
  babyFeedings: number | null;
  babyNappies: number | null;
  babySleepHours: number | null;
  babyMood: BabyMood | null;
  babySymptoms: string[];
  babySymptomSeverity: SymptomSeverity | null;

  // Free-write
  notes: string;
}
