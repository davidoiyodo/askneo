import { GoalId, SubGoalId, UserStage, BirthIntention, FeedingIntention } from '../hooks/useAppContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompletionType = 'checkbox' | 'count' | 'duration';
export type Frequency = 'daily' | 'weekly' | 'trimester-once';

export interface RoutineItem {
  id: string;
  title: string;
  description: string;    // how to do it
  why: string;            // why this matters — the evidence
  goalIds: GoalId[];
  subGoalIds?: SubGoalId[];
  stage: UserStage[];
  weekRange?: { min?: number; max?: number }; // gestational/postnatal week window
  frequency: Frequency;
  completionType: CompletionType;
  requiresBirthIntention?: BirthIntention;    // only show if user has this birth intent
  requiresFeedingIntention?: FeedingIntention; // only show if user has this feeding intent
  durationMinutes?: number;                   // for 'duration' completionType
  note?: string;                              // a short clinical caveat / "ask your doctor"
  navigateTo?: string;                        // if set, tapping navigates to this screen instead of toggling
  universalItem?: boolean;                    // shown regardless of goal selection
}

// ─── Routine Items Library ────────────────────────────────────────────────────

export const ROUTINE_ITEMS: RoutineItem[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // PREGNANCY — SAFE DELIVERY
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'kick-count',
    title: 'Count baby\'s kicks',
    description: 'After a meal, lie on your side and count movements. Aim for 10 kicks within 2 hours.',
    why: 'A change in movement pattern is one of the earliest signs of fetal distress. Daily awareness lets you act quickly if something changes.',
    goalIds: ['safe-delivery'],
    stage: ['pregnancy'],
    weekRange: { min: 28 },
    frequency: 'daily',
    completionType: 'count',
    navigateTo: 'SymptomLog',
    note: 'If you don\'t reach 10 movements in 2 hours, call your midwife or doctor immediately — do not wait.',
  },
  {
    id: 'prenatal-vitamins',
    title: 'Take your prenatal vitamins',
    description: 'Take your prescribed prenatal supplement with food to reduce nausea.',
    why: 'Prenatal vitamins fill nutritional gaps that food alone may not cover — especially iron, iodine, and folic acid — all critical for your baby\'s development.',
    goalIds: ['safe-delivery', 'baby-development'],
    subGoalIds: ['brain-development', 'heart-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'SymptomLog',
  },
  {
    id: 'danger-signs-awareness',
    title: 'Review your danger signs',
    description: 'Know these by heart: heavy vaginal bleeding, severe headache, blurred vision, sudden swelling of face/hands, reduced fetal movement, signs of labour before 37 weeks.',
    why: 'Recognising and acting on danger signs is the single most important thing you can do to protect yourself and your baby.',
    goalIds: ['safe-delivery'],
    stage: ['pregnancy'],
    frequency: 'trimester-once',
    completionType: 'checkbox',
    note: 'If you experience any of these, go to your nearest maternity unit immediately.',
  },
  {
    id: 'bp-awareness',
    title: 'Check in on blood pressure signs',
    description: 'Be aware of persistent headaches, visual disturbance, or swelling — classic signs of high blood pressure. If you have a BP cuff at home, log your reading.',
    why: 'Pre-eclampsia affects up to 8% of pregnancies and can develop rapidly. Early detection through BP monitoring is life-saving.',
    goalIds: ['safe-delivery'],
    stage: ['pregnancy'],
    weekRange: { min: 20 },
    frequency: 'weekly',
    completionType: 'checkbox',
    note: 'Discuss home BP monitoring with your doctor, especially if you\'re over 35 or have a family history of hypertension.',
  },
  {
    id: 'antenatal-attendance',
    title: 'Confirm your next antenatal visit',
    description: 'Check that your next appointment is booked and note anything you want to discuss. Don\'t skip visits — each one has specific checks for your current stage.',
    why: 'Missing antenatal visits means missed scans, tests, and checks that are timed to specific weeks of pregnancy for good reason.',
    goalIds: ['safe-delivery'],
    stage: ['pregnancy'],
    frequency: 'weekly',
    completionType: 'checkbox',
    navigateTo: 'ANCVisits',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PREGNANCY — NATURAL BIRTH
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'kegel-exercises',
    title: 'Pelvic floor exercises (Kegels)',
    description: 'Squeeze the muscles you\'d use to stop urination. Hold for 5 seconds, release, repeat 10 times. Do 3 sets.',
    why: 'A strong, flexible pelvic floor reduces tearing during delivery, speeds up recovery, and helps control pushing. It also prevents incontinence after birth.',
    goalIds: ['natural-birth', 'staying-active'],
    stage: ['pregnancy'],
    weekRange: { min: 12 },
    frequency: 'daily',
    completionType: 'checkbox',
    requiresBirthIntention: 'natural',
    durationMinutes: 10,
  },
  {
    id: 'perineal-massage',
    title: 'Perineal massage',
    description: 'Using clean hands and a natural oil (coconut or almond), massage the lower part of your vagina for 5–10 minutes. This gently stretches the tissue.',
    why: 'Clinical evidence shows perineal massage from week 34 onwards reduces the risk of severe tearing and episiotomy during delivery by up to 16%.',
    goalIds: ['natural-birth'],
    stage: ['pregnancy'],
    weekRange: { min: 34 },
    frequency: 'daily',
    completionType: 'checkbox',
    requiresBirthIntention: 'natural',
    durationMinutes: 10,
    note: 'Ask your midwife to show you the correct technique at your 34-week visit.',
  },
  {
    id: 'daily-walk',
    title: '20-minute walk',
    description: 'Walk at a comfortable pace for 20–30 minutes. Stay upright and let gravity do its work.',
    why: 'Walking keeps your baby in an optimal position for birth, strengthens your cardiovascular system, and reduces the risk of gestational diabetes. An upright posture also encourages baby into the best position for labour.',
    goalIds: ['natural-birth', 'staying-active', 'safe-delivery'],
    subGoalIds: ['bone-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 20,
  },
  {
    id: 'breathing-practice',
    title: 'Labour breathing practice',
    description: 'Practise slow, deep breathing: inhale for 4 counts, hold for 2, exhale for 6. Then practise short panting breaths for the pushing phase.',
    why: 'Controlled breathing during labour reduces the perception of pain, helps you conserve energy, and keeps oxygen flowing to your baby during contractions.',
    goalIds: ['natural-birth'],
    stage: ['pregnancy'],
    weekRange: { min: 28 },
    frequency: 'daily',
    completionType: 'checkbox',
    requiresBirthIntention: 'natural',
    durationMinutes: 10,
  },
  {
    id: 'labour-positions',
    title: 'Practise labour positions',
    description: 'Practise positions like all-fours, deep squat, side-lying, and leaning forward on a support. Try one new position each week.',
    why: 'Knowing and practising positions before labour means you\'ll instinctively use them when contractions hit. Upright and forward-leaning positions shorten labour and reduce back pain.',
    goalIds: ['natural-birth'],
    stage: ['pregnancy'],
    weekRange: { min: 32 },
    frequency: 'weekly',
    completionType: 'checkbox',
    requiresBirthIntention: 'natural',
  },
  {
    id: 'birth-plan',
    title: 'Work on your birth plan',
    description: 'Write down your preferences: environment (lighting, music), pain management choices, who you want in the room, positions you\'d like to try, and your preferences if things change.',
    why: 'A birth plan reduces anxiety, ensures your team knows your wishes, and starts important conversations with your doctor before labour.',
    goalIds: ['natural-birth'],
    stage: ['pregnancy'],
    weekRange: { min: 32, max: 38 },
    frequency: 'trimester-once',
    completionType: 'checkbox',
    requiresBirthIntention: 'natural',
  },
  {
    id: 'upright-posture',
    title: 'Spend time in upright postures',
    description: 'Spend at least 30 minutes today sitting on a birthing ball or chair with your knees lower than your hips, or spend time on all-fours. Avoid reclining for long periods.',
    why: 'Upright posture uses gravity to encourage your baby into the optimal position (head down, spine forward) for a smoother, shorter labour.',
    goalIds: ['natural-birth'],
    stage: ['pregnancy'],
    weekRange: { min: 30 },
    frequency: 'daily',
    completionType: 'checkbox',
    requiresBirthIntention: 'natural',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PREGNANCY — BABY DEVELOPMENT (shared nutrition items)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'dha-intake',
    title: 'DHA / omega-3 today',
    description: 'Eat oily fish (salmon, sardines, mackerel) or take a DHA supplement. Aim for 200–300mg DHA per day.',
    why: 'DHA is the primary building block of your baby\'s brain and retina. The third trimester is the peak demand period — deficiency at this stage has measurable effects on cognitive development.',
    goalIds: ['baby-development'],
    subGoalIds: ['brain-development', 'vision-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    note: 'Avoid high-mercury fish like shark, swordfish, and tilefish. Sardines and salmon are safe.',
  },
  {
    id: 'choline-intake',
    title: 'Include choline in your meals',
    description: 'Eat eggs, lean chicken, beef liver, soybeans, or quinoa. One egg provides about 150mg of choline.',
    why: 'Choline is essential for fetal brain architecture, memory, and neural tube development. Most pregnant women don\'t get enough from food alone.',
    goalIds: ['baby-development'],
    subGoalIds: ['brain-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'iron-rich-diet',
    title: 'Iron-rich meal today',
    description: 'Include iron-rich foods: red meat, dark leafy greens (ugwu, spinach), beans, fortified cereals. Pair with vitamin C to boost absorption.',
    why: 'Iron carries oxygen to your baby. Anaemia in pregnancy is linked to preterm birth and low birth weight — common in Nigerian pregnancies.',
    goalIds: ['baby-development', 'safe-delivery'],
    subGoalIds: ['heart-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'calcium-intake',
    title: 'Calcium-rich foods today',
    description: 'Eat dairy products, fortified plant milk, sardines with bones, dark green vegetables, or sesame seeds. Aim for 1000mg daily.',
    why: 'Your baby will extract calcium from your bones if your diet is insufficient. Adequate calcium also reduces the risk of pre-eclampsia.',
    goalIds: ['baby-development'],
    subGoalIds: ['bone-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'folic-acid',
    title: 'Folic acid today',
    description: 'Take your folic acid supplement (400mcg or as prescribed) or a prenatal vitamin that includes it.',
    why: 'Folic acid prevents neural tube defects. Its role continues through the pregnancy — not just the first trimester — supporting ongoing cell division and cardiovascular development.',
    goalIds: ['baby-development'],
    subGoalIds: ['brain-development', 'heart-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'vitamin-d',
    title: 'Vitamin D today',
    description: 'Get 15–20 minutes of safe sun exposure (morning or late afternoon), or take a vitamin D3 supplement (400–2000 IU as prescribed).',
    why: 'Vitamin D works with calcium to build your baby\'s bones and teeth. Deficiency is extremely common and linked to low birth weight and weakened immunity.',
    goalIds: ['baby-development'],
    subGoalIds: ['bone-development', 'immune-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'lutein-intake',
    title: 'Lutein & zeaxanthin today',
    description: 'Eat leafy greens (spinach, kale), egg yolks, corn, or orange peppers. These are your richest sources.',
    why: 'Lutein and zeaxanthin concentrate in the developing retina and are the primary antioxidants protecting fetal eye tissue from oxidative damage.',
    goalIds: ['baby-development'],
    subGoalIds: ['vision-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'vitamin-a',
    title: 'Vitamin A from food today',
    description: 'Eat orange and yellow vegetables (sweet potato, carrots, pumpkin) or leafy greens. Get vitamin A from food, not high-dose supplements.',
    why: 'Vitamin A supports fetal eye and immune development. However, excess supplemental vitamin A (retinol form) is harmful — food sources are safe and ideal.',
    goalIds: ['baby-development'],
    subGoalIds: ['vision-development', 'immune-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    note: 'Do not take high-dose vitamin A (retinol) supplements during pregnancy. Beta-carotene from food is safe.',
  },
  {
    id: 'probiotics',
    title: 'Probiotic food or supplement',
    description: 'Eat yoghurt with live cultures, kefir, or take a pregnancy-safe probiotic supplement.',
    why: 'A healthy maternal gut microbiome is passed to the baby during birth and through breastfeeding, seeding the baby\'s immune system for life.',
    goalIds: ['baby-development'],
    subGoalIds: ['immune-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'left-side-sleep',
    title: 'Sleep on your left side',
    description: 'Use a pregnancy pillow between your knees to stay comfortable on your left side. If you wake on your back, simply roll back over.',
    why: 'Left-side sleeping improves blood flow to the placenta and kidneys. After 28 weeks, sleeping on your back compresses major blood vessels and reduces oxygen delivery to your baby.',
    goalIds: ['baby-development', 'safe-delivery'],
    stage: ['pregnancy'],
    weekRange: { min: 28 },
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'stress-reduction',
    title: 'Stress reduction practice',
    description: 'Choose one today: 10 minutes of deep breathing, a short walk, journalling, prayer, or talking to someone you trust.',
    why: 'Chronic elevated cortisol crosses the placenta. Sustained maternal stress is associated with preterm birth, lower birth weight, and long-term effects on your baby\'s stress response system.',
    goalIds: ['baby-development', 'safe-delivery'],
    subGoalIds: ['brain-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 10,
  },
  {
    id: 'talk-to-baby',
    title: 'Talk or sing to your baby',
    description: 'Spend a few minutes talking, reading, or singing to your baby. Your baby can hear you from around 18–20 weeks.',
    why: 'Babies who hear their mother\'s voice in the womb show measurable recognition at birth. Early vocal stimulation supports auditory development and early bonding.',
    goalIds: ['baby-development'],
    subGoalIds: ['brain-development'],
    stage: ['pregnancy'],
    weekRange: { min: 18 },
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 5,
  },
  {
    id: 'hydration',
    title: 'Stay well hydrated',
    description: 'Drink 8–10 glasses of water today. Keep a bottle nearby and sip regularly throughout the day.',
    why: 'Adequate hydration supports amniotic fluid levels, nutrient transport to the placenta, and helps prevent preterm contractions and UTIs.',
    goalIds: ['baby-development', 'safe-delivery'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'SymptomLog',
  },
  {
    id: 'magnesium-intake',
    title: 'Magnesium-rich foods today',
    description: 'Eat nuts (especially almonds and cashews), seeds, dark chocolate, leafy greens, or bananas.',
    why: 'Magnesium works with calcium to build bone density. It also reduces leg cramps, supports sleep, and plays a role in preventing pre-eclampsia.',
    goalIds: ['baby-development'],
    subGoalIds: ['bone-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'avoid-alcohol-smoking',
    title: 'No alcohol or smoking today',
    description: 'Check in and confirm — no alcohol, no smoking, no secondhand smoke exposure today.',
    why: 'There is no safe level of alcohol in pregnancy. Smoking and secondhand smoke reduce oxygen to the baby and are directly linked to miscarriage, stillbirth, and developmental problems.',
    goalIds: ['baby-development', 'safe-delivery'],
    subGoalIds: ['brain-development', 'vision-development', 'heart-development'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'flu-vaccination',
    title: 'Check your flu vaccination status',
    description: 'Confirm you\'ve had your flu vaccination this season. If not, book it — it\'s safe and recommended in all trimesters.',
    why: 'Flu in pregnancy can be severe. Vaccination protects you and passes antibodies to your baby, who will be too young to vaccinate at birth.',
    goalIds: ['safe-delivery'],
    subGoalIds: ['immune-development'],
    stage: ['pregnancy'],
    frequency: 'trimester-once',
    completionType: 'checkbox',
    note: 'The flu vaccine is safe at any point in pregnancy — discuss timing with your doctor.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PREGNANCY — BREASTFEEDING READINESS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'colostrum-education',
    title: 'Learn about colostrum',
    description: 'Read or watch one resource about colostrum — your first milk. Understand what it looks like, why it matters, and how to initiate feeding in the first hour.',
    why: 'Colostrum is packed with antibodies and is the most important feed your baby will receive. Mothers who understand it are more confident initiating feeding and less likely to supplement with formula unnecessarily.',
    goalIds: ['breastfeeding-readiness'],
    stage: ['pregnancy'],
    weekRange: { min: 28 },
    frequency: 'trimester-once',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
  },
  {
    id: 'nipple-preparation',
    title: 'Nipple preparation',
    description: 'Gently roll your nipple between finger and thumb for 1–2 minutes each side. This helps prepare for feeding without causing irritation.',
    why: 'Gentle preparation from week 36 can increase nipple suppleness and reduce early soreness during the first days of breastfeeding.',
    goalIds: ['breastfeeding-readiness'],
    stage: ['pregnancy'],
    weekRange: { min: 36 },
    frequency: 'daily',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
    note: 'Stop if you experience contractions — nipple stimulation can trigger uterine activity. Discuss with your midwife first if you have any risk factors.',
  },
  {
    id: 'skin-to-skin-plan',
    title: 'Plan for skin-to-skin at birth',
    description: 'Include skin-to-skin contact in your birth plan. Discuss it with your midwife so the team knows this is a priority for you.',
    why: 'Skin-to-skin in the first hour after birth (the "golden hour") triggers feeding instincts, stabilises baby\'s temperature and blood sugar, and dramatically improves breastfeeding success.',
    goalIds: ['breastfeeding-readiness'],
    stage: ['pregnancy'],
    weekRange: { min: 32 },
    frequency: 'trimester-once',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
  },
  {
    id: 'latch-education',
    title: 'Study latch and positioning',
    description: 'Watch a video or read about the deep latch technique and at least two feeding positions (cradle, cross-cradle, rugby ball hold).',
    why: 'Most breastfeeding problems — pain, poor supply, nipple damage — stem from a shallow latch. Understanding this before birth means you\'re not learning from scratch while exhausted and in pain.',
    goalIds: ['breastfeeding-readiness'],
    stage: ['pregnancy'],
    weekRange: { min: 30 },
    frequency: 'weekly',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
  },
  {
    id: 'lactation-support-plan',
    title: 'Identify your breastfeeding support',
    description: 'Find out: Is there a lactation consultant at your hospital? Does your partner know how to support early feeds? Is there a local breastfeeding group?',
    why: 'Mothers with a support network are significantly more likely to continue breastfeeding past 6 weeks — the most common abandonment period.',
    goalIds: ['breastfeeding-readiness'],
    stage: ['pregnancy'],
    weekRange: { min: 34 },
    frequency: 'trimester-once',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PREGNANCY — STAYING ACTIVE
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'prenatal-yoga',
    title: 'Prenatal yoga or stretching',
    description: 'Follow a guided prenatal yoga session (15–30 min) or do gentle full-body stretching, focusing on hips, lower back, and shoulders.',
    why: 'Prenatal yoga reduces back pain and anxiety, improves sleep quality, and prepares your body for the physical demands of labour.',
    goalIds: ['staying-active', 'natural-birth'],
    stage: ['pregnancy'],
    frequency: 'weekly',
    completionType: 'checkbox',
    durationMinutes: 30,
    note: 'Avoid deep twists, lying flat on your back after 20 weeks, and any pose that causes discomfort.',
  },
  {
    id: 'pelvic-tilts',
    title: 'Pelvic tilts',
    description: 'On all-fours, alternate between arching your back (cat) and flattening it (cow). Do 10–15 slow repetitions.',
    why: 'Pelvic tilts relieve lower back pain, strengthen the core safely, and help your baby position well for birth.',
    goalIds: ['staying-active', 'natural-birth'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 5,
  },
  {
    id: 'daily-stretch',
    title: 'Morning body stretch',
    description: 'Spend 5–10 minutes stretching before getting out of bed or after waking: ankles, calves, hips, and gentle side stretches.',
    why: 'Regular stretching reduces swelling, prevents leg cramps, and maintains flexibility that supports an easier labour.',
    goalIds: ['staying-active'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 10,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEWMOM — FEEDING SUCCESS (breastfeeding)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'feed-on-demand',
    title: 'Feed on demand',
    description: 'Offer the breast whenever baby shows feeding cues: rooting, sucking fists, turning head. Don\'t wait for crying — that\'s a late hunger cue.',
    why: 'Frequent feeding in the early weeks builds your milk supply. Supply works on demand — the more baby feeds, the more milk you produce.',
    goalIds: ['feeding-success'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
  },
  {
    id: 'check-latch',
    title: 'Check baby\'s latch at each feed',
    description: 'Ensure baby\'s mouth covers a large portion of the areola, not just the nipple. Chin should touch the breast, lips flanged outward. If it hurts, break suction gently and re-latch.',
    why: 'A correct latch is the single most important factor in pain-free feeding and adequate milk transfer. Pain = poor latch in almost all cases.',
    goalIds: ['feeding-success'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
  },
  {
    id: 'nursing-hydration',
    title: 'Stay well hydrated while nursing',
    description: 'Drink a glass of water before or during each feed. Aim for 12–13 glasses per day — significantly more than usual.',
    why: 'Breastmilk is 88% water. Dehydration reduces milk supply and leaves you fatigued.',
    goalIds: ['feeding-success'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
    navigateTo: 'SymptomLog',
  },
  {
    id: 'nursing-nutrition',
    title: 'Extra nutrition for nursing',
    description: 'Add an extra 400–500 calories today from nutrient-dense foods: eggs, nuts, legumes, oats, lean protein, and plenty of vegetables.',
    why: 'Breastfeeding burns significant energy. Insufficient caloric intake reduces milk supply and depletes your own nutritional stores during an already demanding time.',
    goalIds: ['feeding-success', 'mom-recovery'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
  },
  {
    id: 'mastitis-awareness',
    title: 'Check for mastitis signs',
    description: 'Look and feel for: one breast that is red, hot, hard, or painful; flu-like symptoms; fever. If you notice these, continue feeding from that side and contact your doctor.',
    why: 'Mastitis affects up to 20% of breastfeeding mothers. Caught early, it resolves with continued feeding and treatment. Left untreated, it can progress to abscess.',
    goalIds: ['feeding-success'],
    stage: ['newmom'],
    weekRange: { max: 12 },
    frequency: 'daily',
    completionType: 'checkbox',
    requiresFeedingIntention: 'breast',
    note: 'Do NOT stop feeding from the affected breast — this worsens mastitis. Seek antibiotic treatment promptly if symptoms appear.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEWMOM — FEEDING SUCCESS (formula)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'sterilise-bottles',
    title: 'Sterilise feeding equipment',
    description: 'Sterilise all bottles, teats, and caps before every use: steam steriliser, microwave steriliser, or cold water sterilising solution.',
    why: 'Newborns have immature immune systems. Improperly sterilised equipment is a common cause of gastrointestinal illness in the first months.',
    goalIds: ['feeding-success'],
    stage: ['newmom'],
    weekRange: { max: 12 },
    frequency: 'daily',
    completionType: 'checkbox',
    requiresFeedingIntention: 'formula',
  },
  {
    id: 'safe-formula-prep',
    title: 'Prepare formula safely',
    description: 'Always use boiled water cooled to 70°C (not cold water). Measure scoops level, not heaped. Never microwave formula. Use within 2 hours.',
    why: 'Incorrectly prepared formula can be nutritionally inadequate or contaminated. Using water below 70°C doesn\'t kill harmful bacteria that may be in the powder.',
    goalIds: ['feeding-success'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    requiresFeedingIntention: 'formula',
    note: 'Pre-made liquid formula is a safer option for the first weeks if bottle prep is difficult.',
  },
  {
    id: 'burp-baby',
    title: 'Burp baby after every feed',
    description: 'Hold baby upright against your shoulder or sitting up, and gently pat or rub the back for 5–10 minutes after feeds.',
    why: 'Burping releases trapped air that causes colic-like pain, spitting up, and unsettled behaviour. Essential for bottle-fed babies who swallow more air.',
    goalIds: ['feeding-success', 'baby-growth'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEWMOM — BABY GROWTH
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'tummy-time',
    title: 'Tummy time',
    description: 'Place baby on their tummy on a firm surface while awake and supervised. Start with 2–3 minutes and build up. Use a rolled towel under the chest to help.',
    why: 'Tummy time builds the neck, shoulder, and core strength baby needs to roll, sit, and crawl. It also prevents positional flat head (plagiocephaly).',
    goalIds: ['baby-growth'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 10,
    note: 'Only when baby is awake and supervised. Never for sleep.',
  },
  {
    id: 'jaundice-check',
    title: 'Check for jaundice signs',
    description: 'In good light, press gently on baby\'s forehead or chest. If the skin looks yellow when you release, check with your doctor. Also check whites of eyes.',
    why: 'Neonatal jaundice is common but can become serious if undetected. Most cases resolve naturally but severe jaundice requires treatment.',
    goalIds: ['baby-growth', 'safe-delivery'],
    stage: ['newmom'],
    weekRange: { max: 3 },
    frequency: 'daily',
    completionType: 'checkbox',
    note: 'If jaundice appears to be spreading or baby is very sleepy and feeding poorly, seek medical attention same day.',
  },
  {
    id: 'newborn-stimulation',
    title: 'Talk, sing, and make eye contact',
    description: 'During awake periods, get face-to-face with your baby. Talk, narrate what you\'re doing, sing, or make sounds. Respond to their sounds.',
    why: 'Every interaction builds neural connections. Newborns\' brains are most plastic in the first months — responsive caregiving literally shapes brain structure.',
    goalIds: ['baby-growth'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 15,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEWMOM — SLEEP PATTERNS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'safe-sleep-setup',
    title: 'Safe sleep environment check',
    description: 'Every sleep: baby on their back, on a firm flat surface, in their own sleep space. No pillows, loose bedding, bumpers, or soft toys in the sleep area.',
    why: 'Safe sleep practices are the most effective intervention to prevent Sudden Infant Death Syndrome (SIDS). The risk is highest in the first 6 months.',
    goalIds: ['sleep-patterns'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    note: 'Room-sharing (not bed-sharing) for at least 6 months is recommended by WHO and AAP.',
  },
  {
    id: 'wake-windows',
    title: 'Watch wake windows today',
    description: 'At 0–6 weeks, baby can only handle 45–60 min of awake time. Watch for yawning, eye rubbing, or zoning out — and start settling when you see them.',
    why: 'Overtired babies are harder to settle and sleep poorly. Matching sleep timing to natural wake windows prevents the overtired cycle that exhausts parents.',
    goalIds: ['sleep-patterns'],
    stage: ['newmom'],
    weekRange: { max: 16 },
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'day-night-cues',
    title: 'Reinforce day/night differences',
    description: 'Daytime: feeds in bright light, noise, interaction. Night feeds: low light, minimal stimulation, no eye contact, straight back to sleep.',
    why: 'Newborns have no circadian rhythm at birth. Consistent environmental cues help them develop it faster, shifting longer stretches of sleep to night.',
    goalIds: ['sleep-patterns'],
    stage: ['newmom'],
    weekRange: { max: 12 },
    frequency: 'daily',
    completionType: 'checkbox',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEWMOM — MOM RECOVERY
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'postnatal-kegels',
    title: 'Postnatal pelvic floor exercises',
    description: 'Start with gentle Kegels from day 1 if you had a vaginal birth (or once catheter is removed after C-section). Squeeze gently, hold 3 seconds, release. 10 reps, 3 times a day.',
    why: 'The pelvic floor is significantly weakened by birth. Early, gentle rehabilitation prevents long-term incontinence and prolapse — the most common but underreported problems after childbirth.',
    goalIds: ['mom-recovery'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    note: 'If you feel pain or heaviness, stop and consult a pelvic physiotherapist.',
  },
  {
    id: 'postnatal-iron',
    title: 'Iron-rich foods today',
    description: 'Eat red meat, dark leafy greens, beans, or fortified foods. Take iron supplements if prescribed.',
    why: 'Blood loss during birth depletes iron stores. Low iron causes fatigue, low mood, and reduced milk supply — all common postpartum complaints with a dietary fix.',
    goalIds: ['mom-recovery'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'SymptomLog',
  },
  {
    id: 'wound-care',
    title: 'Check and care for your wound',
    description: 'For C-section: keep the wound clean and dry, watch for redness, discharge, or gap opening. For perineal tears: warm sitz baths, keep clean, pat dry.',
    why: 'Wound infections are a leading cause of postpartum hospital readmission. Daily checking catches problems before they escalate.',
    goalIds: ['mom-recovery'],
    stage: ['newmom'],
    weekRange: { max: 6 },
    frequency: 'daily',
    completionType: 'checkbox',
    note: 'Increasing pain, redness spreading, fever, or any opening of the wound — go to the hospital same day.',
  },
  {
    id: 'ppd-awareness',
    title: 'Check in on your emotional health',
    description: 'Ask yourself honestly: Am I feeling persistently sad or empty? Anxious beyond what feels normal? Disconnected from my baby? If yes, tell someone today.',
    why: 'Postpartum depression affects 1 in 5 mothers and is significantly undertreated in Nigeria. Asking the question daily normalises emotional check-ins and enables early help-seeking.',
    goalIds: ['mom-recovery'],
    stage: ['newmom'],
    weekRange: { max: 26 },
    frequency: 'daily',
    completionType: 'checkbox',
    note: 'PPD is not a sign of weakness or bad mothering. It\'s a treatable medical condition — speak to your doctor.',
  },
  {
    id: 'postnatal-walk',
    title: 'Short gentle walk',
    description: 'Start with just 5–10 minutes outside. Increase gradually over weeks. Stop if you feel pain, heaviness, or bleeding increases.',
    why: 'Gentle movement after birth improves circulation, reduces risk of blood clots, lifts mood, and begins rebuilding strength. The key word is gentle — this is not exercise, it\'s recovery movement.',
    goalIds: ['mom-recovery'],
    stage: ['newmom'],
    weekRange: { min: 2 },
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 10,
    note: 'Do not start exercise (including running or gym) until 6-week check for vaginal birth, 8–12 weeks for C-section, and only with clearance from your doctor.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TTC — CYCLE AWARENESS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'bbt-tracking',
    title: 'Log your basal body temperature',
    description: 'Take your temperature with a BBT thermometer immediately on waking, before getting up. Record it. A rise of 0.2°C or more sustained for 3 days confirms ovulation has occurred.',
    why: 'BBT charting is the most reliable free method to confirm ovulation. It shows you your fertile window retrospectively and over time reveals your pattern.',
    goalIds: ['cycle-awareness'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'CycleTracker',
    note: 'BBT must be taken at the same time each morning after at least 3 hours of uninterrupted sleep to be accurate.',
  },
  {
    id: 'cm-observation',
    title: 'Observe cervical mucus',
    description: 'Note the consistency of discharge today: dry/none, sticky, creamy, watery, or egg-white (most fertile). Record it alongside your BBT.',
    why: 'Egg-white cervical mucus is the most reliable real-time indicator of peak fertility. Learning to read it accurately can identify your 2–4 peak days each cycle.',
    goalIds: ['cycle-awareness'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'CycleTracker',
  },
  {
    id: 'ovulation-tracking',
    title: 'Review your fertility window',
    description: 'Based on your cycle length, identify your expected fertile window (roughly 5 days before and the day of ovulation). LH test strips or a fertility monitor can confirm.',
    why: 'Timing intercourse within the fertile window — and specifically within 24–36 hours of the LH surge — significantly increases the chance of conception per cycle.',
    goalIds: ['cycle-awareness'],
    stage: ['ttc'],
    frequency: 'weekly',
    completionType: 'checkbox',
    navigateTo: 'CycleTracker',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TTC — CONCEPTION OPTIMISATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ttc-folic-acid',
    title: 'Folic acid today',
    description: 'Take 400mcg of folic acid (or a preconception supplement containing it) daily — starting now, before you conceive.',
    why: 'Neural tube defects form in the first 28 days of pregnancy — before most women know they\'re pregnant. Folic acid must already be in your system at conception.',
    goalIds: ['conception-optimisation'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'ttc-vitamins',
    title: 'Preconception vitamins today',
    description: 'Take a preconception supplement containing folic acid, iron, vitamin D, and iodine. Avoid megadose vitamin A.',
    why: 'Nutritional status at conception shapes early pregnancy development. Building reserves now reduces the risk of deficiency during the critical first trimester.',
    goalIds: ['conception-optimisation'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'ttc-iron',
    title: 'Iron-rich diet today',
    description: 'Include iron-rich foods in at least one meal: red meat, dark leafy greens, beans, lentils. Pair with vitamin C for better absorption.',
    why: 'Iron deficiency anaemia is common and affects fertility and early pregnancy outcomes. Building iron stores before conception reduces risk.',
    goalIds: ['conception-optimisation'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
  {
    id: 'ttc-stress',
    title: 'Stress reduction practice',
    description: 'Choose one: journalling, prayer, gentle exercise, breathing exercises, or time with people who energise you. Even 10 minutes counts.',
    why: 'Chronic stress disrupts the hypothalamic-pituitary-ovarian axis, causing irregular cycles and delayed ovulation. Managing stress is a direct fertility intervention.',
    goalIds: ['conception-optimisation', 'emotional-wellbeing'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 10,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TTC — EMOTIONAL WELLBEING
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ttc-journal',
    title: 'Journal your feelings',
    description: 'Write freely for 5–10 minutes about how you\'re feeling today — about TTC, your body, your relationship, or anything else on your mind.',
    why: 'Expressive writing reduces anxiety and helps process difficult emotions. The TTC journey can be isolating — regular reflection builds resilience.',
    goalIds: ['emotional-wellbeing'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
    durationMinutes: 10,
  },
  {
    id: 'ttc-partner-comms',
    title: 'Connect with your partner',
    description: 'Have a non-TTC conversation today. Do something enjoyable together. Check in on each other\'s emotional state — not just the cycle.',
    why: 'TTC stress strains relationships. Couples who maintain connection and intimacy outside of the fertility goal report lower anxiety and better outcomes.',
    goalIds: ['emotional-wellbeing'],
    stage: ['ttc'],
    frequency: 'weekly',
    completionType: 'checkbox',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PARTNER
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'attend-antenatal',
    title: 'Attend (or plan for) the next antenatal visit',
    description: 'Book the next appointment in your calendar. If you can\'t attend, review the notes with your partner afterwards and ask about what was discussed.',
    why: 'Partner involvement at antenatal visits is associated with lower maternal anxiety, better compliance with medical advice, and stronger paternal bonding.',
    goalIds: ['supporting-partner', 'birth-preparation'],
    stage: ['partner'],
    frequency: 'weekly',
    completionType: 'checkbox',
    navigateTo: 'ANCVisits',
  },
  {
    id: 'partner-danger-signs',
    title: 'Learn the pregnancy danger signs',
    description: 'Know these by heart: heavy vaginal bleeding, severe headache, blurred vision, sudden swelling, reduced fetal movement, signs of early labour. Know where your nearest maternity unit is.',
    why: 'In an emergency, the partner is often the one who has to act. Knowing the danger signs and knowing where to go can save two lives.',
    goalIds: ['supporting-partner', 'birth-preparation'],
    stage: ['partner'],
    frequency: 'trimester-once',
    completionType: 'checkbox',
  },
  {
    id: 'birth-partner-prep',
    title: 'Birth partner preparation',
    description: 'Read or watch one resource about the stages of labour, how to help during contractions (massage, encouragement, breathing), and what happens at the hospital.',
    why: 'An informed, calm birth partner reduces the mother\'s pain experience and decreases the likelihood of interventions.',
    goalIds: ['birth-preparation'],
    stage: ['partner'],
    weekRange: { min: 32 },
    frequency: 'weekly',
    completionType: 'checkbox',
  },
  {
    id: 'hospital-bag',
    title: 'Pack the hospital bag together',
    description: 'Prepare the bag with everything needed for both mother and baby. Know where it is. Know the route to the hospital.',
    why: 'Being practically ready reduces the chaos and panic of early labour. Having everything prepared means the focus can be entirely on supporting her.',
    goalIds: ['birth-preparation'],
    stage: ['partner'],
    weekRange: { min: 35, max: 40 },
    frequency: 'trimester-once',
    completionType: 'checkbox',
  },
  {
    id: 'newborn-care-basics',
    title: 'Learn a newborn care skill',
    description: 'This week, learn one skill: safe bathing, swaddling, nappy changing, winding, or reading baby\'s hunger cues. Find a video, ask a nurse, or practise on a doll.',
    why: 'Partners who are capable and confident with newborn care take on more responsibility, reducing maternal burnout in the fourth trimester.',
    goalIds: ['newborn-readiness'],
    stage: ['partner'],
    weekRange: { min: 34 },
    frequency: 'weekly',
    completionType: 'checkbox',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // UNIVERSAL — ALL STAGES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'daily-checkin',
    title: 'Write your wellness diary entry',
    description: 'Log your mood, energy, symptoms, hydration, and sleep to track how you\'re doing.',
    why: 'Consistent self-tracking helps you spot patterns and gives your care team better context.',
    goalIds: [],
    stage: ['pregnancy', 'newmom', 'ttc', 'partner'],
    frequency: 'daily',
    completionType: 'checkbox',
    universalItem: true,
    navigateTo: 'SymptomLog',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PREGNANCY — STAYING ACTIVE & WELLBEING
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'pregnancy-walk',
    title: 'Take a short walk',
    description: 'Even 10 minutes outside helps — aim for a gentle stroll at your own pace.',
    why: 'Regular light movement improves circulation, reduces swelling, and lifts mood during pregnancy.',
    goalIds: ['staying-active'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  {
    id: 'pregnancy-breathe',
    title: 'Take a breathing moment',
    description: 'Slow breath in for 4 counts, hold for 4, out for 4. Repeat 5 times.',
    why: 'Controlled breathing activates the parasympathetic nervous system, reducing cortisol and promoting calm.',
    goalIds: ['staying-active', 'natural-birth'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  {
    id: 'pregnancy-water',
    title: 'Stay hydrated today',
    description: 'Aim for a glass of water every couple of hours — set a reminder if you forget.',
    why: 'Adequate hydration supports amniotic fluid levels, energy, and reduces risk of preterm contractions.',
    goalIds: ['staying-active', 'safe-delivery'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'SymptomLog',
  },

  {
    id: 'pregnancy-rest',
    title: 'Put your feet up for 30 minutes',
    description: 'Lie down or elevate your feet — even a short rest counts.',
    why: 'Resting reduces blood pressure, decreases swelling, and supports healthy placental blood flow.',
    goalIds: ['safe-delivery', 'staying-active'],
    stage: ['pregnancy'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEWMOM — FEEDING, SLEEP & RECOVERY
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'log-feed',
    title: 'Log a feeding session',
    description: 'Record when baby feeds — breast or bottle — to track patterns.',
    why: 'Tracking feeding frequency helps identify supply issues, growth spurts, and ensures baby is getting enough.',
    goalIds: ['feeding-success'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'count',
    navigateTo: 'SymptomLog',
  },

  {
    id: 'log-nappy',
    title: 'Log a nappy change',
    description: 'Note the type and any concerns in your daily check-in.',
    why: 'Nappy output is a key indicator of baby\'s hydration and feeding adequacy — especially in the early weeks.',
    goalIds: ['baby-growth'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'count',
    navigateTo: 'SymptomLog',
  },

  {
    id: 'log-baby-sleep',
    title: 'Log baby\'s sleep',
    description: 'Record sleep duration in your daily check-in to identify patterns.',
    why: 'Sleep tracking helps anticipate patterns, identify sleep regressions, and plan your own rest.',
    goalIds: ['sleep-patterns'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'SymptomLog',
  },

  {
    id: 'newmom-rest',
    title: 'Rest when baby sleeps',
    description: 'Even 20 minutes of rest matters. Resist the urge to do chores.',
    why: 'Maternal sleep deprivation affects recovery, mood, and milk supply. Rest is a medical priority.',
    goalIds: ['sleep-patterns', 'mom-recovery'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  {
    id: 'newmom-water',
    title: 'Stay hydrated today',
    description: 'Aim for a glass every couple of hours — keep a bottle within reach at all times.',
    why: 'Breastfeeding and postpartum recovery both significantly increase fluid needs.',
    goalIds: ['mom-recovery', 'feeding-success'],
    stage: ['newmom'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'SymptomLog',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TTC — CYCLE & WELLBEING
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ttc-cycle-log',
    title: 'Log today in your cycle',
    description: 'Track symptoms, mood, and cervical mucus changes in your check-in.',
    why: 'Detailed cycle tracking identifies fertile windows and patterns that improve conception chances.',
    goalIds: ['cycle-awareness'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'CycleTracker',
  },

  {
    id: 'ttc-temp',
    title: 'Log your morning temperature (BBT)',
    description: 'Take your temperature first thing before getting up for the most accurate reading.',
    why: 'Basal body temperature rises 0.2–0.5°C after ovulation — daily tracking confirms if and when you\'ve ovulated.',
    goalIds: ['cycle-awareness'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'CycleTracker',
  },

  {
    id: 'ttc-water',
    title: 'Stay hydrated today',
    description: 'Aim for at least 8 glasses of water throughout the day.',
    why: 'Adequate hydration supports cervical mucus production, a key indicator of fertility.',
    goalIds: ['emotional-wellbeing', 'conception-optimisation'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
    navigateTo: 'SymptomLog',
  },

  {
    id: 'ttc-rest',
    title: 'Take a moment for yourself',
    description: 'A short break, walk, or breathing exercise — whatever feels restorative.',
    why: 'Chronic stress elevates cortisol, which can disrupt ovulation and reduce fertility.',
    goalIds: ['emotional-wellbeing'],
    stage: ['ttc'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PARTNER — SUPPORT ACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'partner-checkin',
    title: 'Check in on how she\'s really doing',
    description: '"How are you really feeling?" — and actually listen. Don\'t try to fix, just be present.',
    why: 'Partners who check in regularly report higher relationship satisfaction and better postpartum outcomes for both parents.',
    goalIds: ['supporting-partner'],
    stage: ['partner'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  {
    id: 'partner-feed-help',
    title: 'Offer to take a feed or nappy change',
    description: 'Volunteer proactively — don\'t wait to be asked.',
    why: 'Shared infant care is one of the strongest predictors of maternal mental health outcomes.',
    goalIds: ['supporting-partner', 'newborn-readiness'],
    stage: ['partner'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  {
    id: 'partner-water',
    title: 'Refill her water bottle',
    description: 'Keep it close to wherever she feeds or rests.',
    why: 'Breastfeeding mothers need significantly more fluids — active partner support increases milk supply duration.',
    goalIds: ['supporting-partner'],
    stage: ['partner'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  {
    id: 'partner-sleep-shift',
    title: 'Take a night shift for her',
    description: 'One uninterrupted 4–6 hour sleep block makes a real difference.',
    why: 'Even a single uninterrupted sleep significantly reduces postpartum depression risk.',
    goalIds: ['supporting-partner'],
    stage: ['partner'],
    frequency: 'daily',
    completionType: 'checkbox',
  },

  {
    id: 'partner-errand',
    title: 'Ask if she needs anything done',
    description: 'Better yet: look around and just do it — laundry, groceries, dishes.',
    why: 'Practical support reduces cognitive load and allows mothers to focus on recovery and bonding.',
    goalIds: ['supporting-partner'],
    stage: ['partner'],
    frequency: 'daily',
    completionType: 'checkbox',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getItemById(id: string): RoutineItem | undefined {
  return ROUTINE_ITEMS.find(r => r.id === id);
}

export function getItemsForGoal(goalId: GoalId): RoutineItem[] {
  return ROUTINE_ITEMS.filter(r => r.goalIds.includes(goalId));
}

export function getItemsForSubGoal(subGoalId: SubGoalId): RoutineItem[] {
  return ROUTINE_ITEMS.filter(r => r.subGoalIds?.includes(subGoalId));
}
