import { ANCVisit } from '../hooks/useANCVisits';
import { apiFetch } from './api';

function toServerPayload(visit: ANCVisit) {
  const str = (v: number | null) => (v != null ? String(v) : null);
  return {
    visit_date:            visit.date,
    gestational_week:      str(visit.gestationalWeek),
    weight:                str(visit.weight),
    blood_pressure_sys:    str(visit.bloodPressureSys),
    blood_pressure_dia:    str(visit.bloodPressureDia),
    fundal_height:         str(visit.fundalHeight),
    baby_heart_rate:       str(visit.babyHeartRate),
    urine_protein:         visit.urineProtein         ?? null,
    urine_glucose:         visit.urineGlucose         ?? null,
    pcv:                   str(visit.pcv),
    malaria_test:          visit.malariaTest          ?? null,
    blood_group:           visit.bloodGroup           ?? null,
    hiv_status:            visit.hivStatus            ?? null,
    hbs_ag:                visit.hbsAg                ?? null,
    vdrl:                  visit.vdrl                 ?? null,
    genotype:              visit.genotype             ?? null,
    class_topics:          visit.classTopics,
    prescriptions:         visit.prescriptions,
    concern_flagged:       visit.concernFlagged,
    referred_to_doctor:    visit.referredToDoctor,
    next_appointment_date: visit.nextAppointmentDate  ?? null,
    notes:                 visit.notes,
    added_at:              visit.addedAt.slice(0, 10),
  };
}

export async function saveANCVisit(visit: ANCVisit): Promise<void> {
  await apiFetch('/user/anc-visits', {
    method: 'POST',
    body: JSON.stringify(toServerPayload(visit)),
  });
}
