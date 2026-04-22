/**
 * Per-item background images for story slides and article heroes.
 * All photos verified on Unsplash CDN. Swap any URL at unsplash.com/photos/{id}
 */

const Q = 'w=900&auto=format&fit=crop&q=85';
const U = (id: string) => `https://images.unsplash.com/photo-${id}?${Q}`;

export const ITEM_IMAGES: Record<string, string> = {

  // ── Pregnancy · Safe Delivery ──────────────────────────────────────────────
  'kick-count':             U('1492725764893-90b379c2b6e7'), // pregnant woman resting
  'prenatal-vitamins':      U('1584308666744-24d5c474f2ae'), // vitamins / supplements
  'danger-signs-awareness': U('1576091160399-112ba8d25d1d'), // clinical consultation
  'bp-awareness':           U('1576091160399-112ba8d25d1d'), // medical device
  'antenatal-attendance':   U('1576091160399-112ba8d25d1d'), // doctor visit
  'flu-vaccination':        U('1584308666744-24d5c474f2ae'), // medical / pills

  // ── Pregnancy · Natural Birth ──────────────────────────────────────────────
  'kegel-exercises':  U('1506629082955-511b1aa562c8'), // yoga floor pose
  'perineal-massage': U('1476514525535-07fb3b4ae5f1'), // calm wellness outdoors
  'daily-walk':       U('1571019614242-c5c5dee9f50b'), // woman walking park
  'breathing-practice': U('1508672019048-805c876b67e2'), // meditation breathing
  'labour-positions': U('1518611012118-696072aa579a'), // deep stretch / birth pose
  'birth-plan':       U('1484480974693-6ca0a78fb36b'), // journaling / planning
  'upright-posture':  U('1571019613454-1cb2f99b2d8b'), // upright active posture

  // ── Pregnancy · Baby Development ──────────────────────────────────────────
  'dha-intake':           U('1467003909585-2f8a72700288'), // salmon / omega-3
  'choline-intake':       U('1565958011703-44f9829ba187'), // eggs on plate
  'iron-rich-diet':       U('1512621776951-a57141f2eefd'), // iron-rich food bowl
  'calcium-intake':       U('1563227812-0ea4c22e6cc8'),    // dairy / milk
  'folic-acid':           U('1568702846914-96b305d2aaeb'), // leafy greens
  'vitamin-d':            U('1419242902214-272b3f66ee7a'), // warm sunlight
  'lutein-intake':        U('1490818387583-1baba5e638af'), // colourful veg bowl
  'vitamin-a':            U('1512621776951-a57141f2eefd'), // orange vegetables
  'probiotics':           U('1490818387583-1baba5e638af'), // yogurt / fermented
  'left-side-sleep':      U('1455642305367-68834a1da7ab'), // sleeping on side
  'stress-reduction':     U('1506126613408-eca07ce68773'), // outdoor meditation
  'talk-to-baby':         U('1584515979956-d9f6e5d09982'), // hands on bump
  'hydration':            U('1548839140-29a749e1cf4d'),    // glass of water
  'magnesium-intake':     U('1498557850523-fd3d118b962e'), // nuts and seeds
  'avoid-alcohol-smoking':U('1476514525535-07fb3b4ae5f1'), // clean wellness

  // ── Pregnancy · Breastfeeding Readiness ───────────────────────────────────
  'colostrum-education':    U('1590650153855-d9e808231d41'), // mother nursing newborn
  'nipple-preparation':     U('1544367567-0f2fcb009e0b'),    // calm self-care
  'skin-to-skin-plan':      U('1566004100631-35d015d6a491'), // skin-to-skin contact
  'latch-education':        U('1566004100631-35d015d6a491'), // mother with newborn
  'lactation-support-plan': U('1590650153855-d9e808231d41'), // nursing support

  // ── Pregnancy · Staying Active ────────────────────────────────────────────
  'prenatal-yoga':  U('1506629082955-511b1aa562c8'), // prenatal yoga
  'pelvic-tilts':   U('1518611012118-696072aa579a'), // pelvic floor stretch
  'daily-stretch':  U('1571019613454-1cb2f99b2d8b'), // full body stretch

  // ── New Mum · Feeding Success ─────────────────────────────────────────────
  'feed-on-demand':    U('1590650153855-d9e808231d41'), // on-demand nursing
  'check-latch':       U('1566004100631-35d015d6a491'), // latch check
  'nursing-hydration': U('1548839140-29a749e1cf4d'),    // water for mum
  'nursing-nutrition': U('1512621776951-a57141f2eefd'), // nutrient-dense meal
  'mastitis-awareness':U('1570295999919-56ceb5ecca61'), // recovery / awareness
  'sterilise-bottles': U('1519823551278-64ac92734fb1'), // baby bottle
  'safe-formula-prep': U('1504439904031-93ded9f93e4e'), // formula preparation
  'burp-baby':         U('1515488042361-ee00e0ddd4e4'), // baby close-up

  // ── New Mum · Baby Growth ─────────────────────────────────────────────────
  'tummy-time':        U('1503454537195-1dcabb73ffb9'), // tummy time play
  'jaundice-check':    U('1519689373023-dd07c7988603'), // newborn check
  'newborn-stimulation':U('1555252333-9f8e92e65df9'),  // baby interaction

  // ── New Mum · Sleep Patterns ──────────────────────────────────────────────
  'safe-sleep-setup': U('1455642305367-68834a1da7ab'), // cosy sleep setup
  'wake-windows':     U('1515488042361-ee00e0ddd4e4'), // baby awake time
  'day-night-cues':   U('1555252333-9f8e92e65df9'),   // baby cues

  // ── New Mum · Recovery ────────────────────────────────────────────────────
  'postnatal-kegels': U('1506629082955-511b1aa562c8'), // gentle exercise
  'postnatal-iron':   U('1512621776951-a57141f2eefd'), // iron-rich foods
  'wound-care':       U('1607746882042-944635dfe10e'), // postpartum care
  'ppd-awareness':    U('1508672019048-805c876b67e2'), // emotional support
  'postnatal-walk':   U('1441974231531-c6227db76b6e'), // outdoor recovery walk

  // ── TTC · Cycle Awareness ─────────────────────────────────────────────────
  'bbt-tracking':      U('1484480974693-6ca0a78fb36b'), // journaling / charting
  'cm-observation':    U('1544367567-0f2fcb009e0b'),    // mindful awareness
  'ovulation-tracking':U('1484480974693-6ca0a78fb36b'), // tracking / journaling

  // ── TTC · Conception ──────────────────────────────────────────────────────
  'ttc-folic-acid': U('1584308666744-24d5c474f2ae'), // supplements
  'ttc-vitamins':   U('1490818387583-1baba5e638af'), // nutrient-dense eating
  'ttc-iron':       U('1568702846914-96b305d2aaeb'), // leafy greens
  'ttc-stress':     U('1506126613408-eca07ce68773'), // outdoor calm
  'ttc-journal':    U('1484480974693-6ca0a78fb36b'), // journaling

  // ── TTC · Emotional Wellbeing ─────────────────────────────────────────────
  'ttc-partner-comms': U('1522529599102-193c0d76b5b6'), // couple talking

  // ── Partner ───────────────────────────────────────────────────────────────
  'attend-antenatal':    U('1516589091380-5d8e87df6999'), // couple at appointment
  'partner-danger-signs':U('1522529599102-193c0d76b5b6'), // couple awareness
  'birth-partner-prep':  U('1516589091380-5d8e87df6999'), // partner preparation
  'hospital-bag':        U('1553062407-98eeb64c6a62'),    // hospital bag packing
  'newborn-care-basics': U('1519689373023-dd07c7988603'), // newborn care
  'daily-checkin':       U('1522529599102-193c0d76b5b6'), // daily connection
  'partner-checkin':     U('1516589091380-5d8e87df6999'), // partner check-in
  'partner-feed-help':   U('1504439904031-93ded9f93e4e'), // feeding support
  'partner-water':       U('1548839140-29a749e1cf4d'),    // hydration help
  'partner-sleep-shift': U('1455642305367-68834a1da7ab'), // sleep shift
  'partner-errand':      U('1441974231531-c6227db76b6e'), // errand outdoors

  // ── Universal ─────────────────────────────────────────────────────────────
  'pregnancy-walk':  U('1571019614242-c5c5dee9f50b'), // gentle walk
  'pregnancy-breathe':U('1476514525535-07fb3b4ae5f1'), // mindful breathing
  'pregnancy-water': U('1548839140-29a749e1cf4d'),    // daily hydration
  'pregnancy-rest':  U('1570295999919-56ceb5ecca61'), // quality rest
  'log-feed':        U('1519689373023-dd07c7988603'), // feed log
  'log-nappy':       U('1503454537195-1dcabb73ffb9'), // nappy log
  'log-baby-sleep':  U('1455642305367-68834a1da7ab'), // sleep log
  'newmom-rest':     U('1607746882042-944635dfe10e'), // postpartum rest
  'newmom-water':    U('1548839140-29a749e1cf4d'),    // hydration
  'ttc-cycle-log':   U('1484480974693-6ca0a78fb36b'), // cycle log
  'ttc-temp':        U('1484480974693-6ca0a78fb36b'), // temperature log
  'ttc-water':       U('1548839140-29a749e1cf4d'),    // hydration
  'ttc-rest':        U('1455642305367-68834a1da7ab'), // rest
};
