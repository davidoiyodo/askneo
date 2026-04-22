/**
 * Curated Unsplash background images for each goal's story screen.
 * All photos are free to use under the Unsplash licence.
 * Swap any URL by replacing the photo-{id} segment at unsplash.com/photos/{id}
 */

const Q = 'w=900&auto=format&fit=crop&q=85';
const U = (id: string) => `https://images.unsplash.com/photo-${id}?${Q}`;

export const GOAL_IMAGES: Record<string, string> = {
  // ── Pregnancy ────────────────────────────────────────────────────────────────
  'safe-delivery':          U('1492725764893-90b379c2b6e7'), // pregnant woman, soft light
  'natural-birth':          U('1476514525535-07fb3b4ae5f1'), // woman breathwork / calm
  'baby-development':       U('1518795945879-1d8e08dee16c'), // pregnant belly, close up
  'breastfeeding-readiness':U('1490325523436-d08a31cd1d2d'), // mother holding newborn
  'staying-active':         U('1571019613454-1cb2f99b2d8b'), // woman exercising outdoors

  // ── New mum ──────────────────────────────────────────────────────────────────
  'feeding-success':        U('1490284880083-29b0b9b77db2'), // mother & baby feeding
  'baby-growth':            U('1519689373023-dd07c7988603'), // newborn baby detail
  'sleep-patterns':         U('1455642305367-68834a1da7ab'), // cosy sleep scene
  'mom-recovery':           U('1508672019048-805c876b67e2'), // woman self-care / calm

  // ── TTC ──────────────────────────────────────────────────────────────────────
  'cycle-awareness':        U('1512621776951-a57141f2eefd'), // healthy food / nutrition
  'conception-optimisation':U('1490818387583-1baba5e638af'), // vibrant wellness / nature
  'emotional-wellbeing':    U('1506629082955-511b1aa562c8'), // meditation outdoors

  // ── Partner ──────────────────────────────────────────────────────────────────
  'supporting-partner':     U('1522529599102-193c0d76b5b6'), // couple together
  'birth-preparation':      U('1516589091380-5d8e87df6999'), // couple preparing
  'newborn-readiness':      U('1519823551278-64ac92734fb1'), // nursery / baby items
};
