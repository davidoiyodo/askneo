import { CycleEntry } from '../hooks/useCycleLogs';
import { apiFetch } from './api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromServerEntry(data: Record<string, any>): CycleEntry {
  return {
    dateKey:        data.date_key,
    isPeriodStart:  data.is_period_start  ?? false,
    isPeriodFlow:   data.is_period_flow   ?? false,
    flowIntensity:  data.flow_intensity   ?? undefined,
    bbtTemp:        data.bbt_temp != null && data.bbt_temp !== '' ? parseFloat(data.bbt_temp) : null,
    cmType:         data.cm_type          ?? null,
    opkResult:      data.opk_result       ?? null,
    hptResult:      data.hpt_result       ?? undefined,
    hadSex:         data.had_sex          ?? undefined,
    usedProtection: data.used_protection  ?? undefined,
    mood:           data.mood || undefined,
    symptoms:       data.symptoms         ?? [],
    notes:          data.notes            ?? '',
  };
}

function toServerPayload(entry: CycleEntry) {
  return {
    date_key:        entry.dateKey,
    is_period_start: entry.isPeriodStart,
    is_period_flow:  entry.isPeriodFlow,
    flow_intensity:  entry.flowIntensity  ?? null,
    bbt_temp:        entry.bbtTemp != null ? String(entry.bbtTemp) : null,
    cm_type:         entry.cmType         ?? null,
    opk_result:      entry.opkResult      ?? null,
    hpt_result:      entry.hptResult      ?? null,
    had_sex:         entry.hadSex         ?? false,
    used_protection: entry.usedProtection ?? false,
    mood:            entry.mood           ?? '',
    symptoms:        entry.symptoms       ?? [],
    notes:           entry.notes,
  };
}

export async function saveCycleLog(entry: CycleEntry): Promise<void> {
  await apiFetch('/user/cycle-logs', {
    method: 'POST',
    body: JSON.stringify(toServerPayload(entry)),
  });
}

export async function fetchCycleLogs(
  fromDate = '2000-01-01',
  toDate   = new Date().toISOString().slice(0, 10),
): Promise<CycleEntry[]> {
  const res = await apiFetch<{ status: string; data: Record<string, unknown>[] }>(
    '/user/get-cycle-logs',
    { method: 'POST', body: JSON.stringify({ from_date: fromDate, to_date: toDate }) },
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (res.data ?? []).map((d: any) => fromServerEntry(d));
}
