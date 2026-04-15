export type TriageLevel = 'monitor' | 'watch' | 'urgent' | 'emergency';
export type ChatTab = 'baby' | 'pregnancy' | 'ttc';

export interface TriageResult {
  level: TriageLevel;
  label: string;
  summary: string;
  action: string;
}

export interface NeoResponse {
  text: string;
  triage?: TriageResult;
  tab?: ChatTab;
  highlight?: string;
  metric?: { label: string; value: string };
  reminder?: string;
}

// ─── Triage level labels ───────────────────────────────────────────────────
export const TriageLabels: Record<TriageLevel, string> = {
  monitor:   'Monitor at Home',
  watch:     'Watch Closely',
  urgent:    'Seek Care Soon',
  emergency: 'Go Now — Emergency',
};

// ─── Response library ──────────────────────────────────────────────────────
// Matched by keyword patterns in the chat engine

export const responses: Array<{
  keywords: string[];
  tab: ChatTab;
  response: NeoResponse;
}> = [
  // ── BABY CARE ──────────────────────────────────────────────────────────
  {
    keywords: ['poop', 'stool', 'meconium', 'first poop', 'not poop', "hasn't poop", 'no poop'],
    tab: 'baby',
    response: {
      text: "Your baby's first poop, called meconium, should arrive within 24–48 hours after birth. It looks dark greenish-black and tarry — that's completely normal. If your baby hasn't passed stool by 48 hours after birth, that's something worth flagging to your doctor today.",
      triage: {
        level: 'watch',
        label: 'Watch Closely',
        summary: 'No stool after 48 hours may indicate a feeding issue or, rarely, a bowel condition.',
        action: 'Note the time of last stool and contact your paediatrician or midwife.',
      },
      highlight: 'First stool expected within 48 hours of birth',
    },
  },
  {
    keywords: ['yellow', 'jaundice', 'yellowish', 'skin yellow', 'eyes yellow'],
    tab: 'baby',
    response: {
      text: "Yellowish skin or eyes in a newborn — especially within the first 24 hours or after day 5 — is a sign of jaundice that needs prompt medical evaluation. Mild jaundice peaking between days 2–4 is common, but the timing and severity matter a great deal. Based on what you've shared, please seek care today.",
      triage: {
        level: 'urgent',
        label: 'Seek Care Soon',
        summary: 'Jaundice can progress rapidly in newborns. Early phototherapy prevents serious complications.',
        action: 'Visit a hospital with a NICU or paediatric ward today. Do not wait to see if it improves on its own.',
      },
      highlight: 'Possible jaundice — medical evaluation needed today',
    },
  },
  {
    keywords: ['breathing', 'not breathing', 'breath', 'gasping', 'blue lips', 'blue skin', 'turning blue'],
    tab: 'baby',
    response: {
      text: "If your baby is having difficulty breathing, gasping, or showing bluish colour around the lips or fingertips, this is an emergency. Please act immediately.",
      triage: {
        level: 'emergency',
        label: 'Go Now — Emergency',
        summary: 'Respiratory distress in a newborn can escalate within minutes.',
        action: 'Call emergency services or go to the nearest hospital immediately. Do not drive alone — call for help now.',
      },
    },
  },
  {
    keywords: ['fever', 'temperature', 'hot', 'warm', '38', '39', '40'],
    tab: 'baby',
    response: {
      text: "Any fever in a baby under 3 months old (38°C / 100.4°F or higher) requires immediate medical attention — their immune system is not yet mature enough to handle infections the way older children can. Don't give paracetamol to babies under 2 months without doctor instruction.",
      triage: {
        level: 'urgent',
        label: 'Seek Care Soon',
        summary: 'Fever in a newborn under 3 months old is a medical emergency until proven otherwise.',
        action: 'Take your baby to the hospital right away. Bring a record of when the fever started and what temperature you measured.',
      },
      highlight: 'Fever under 3 months — urgent care needed',
      reminder: 'hydration',
    },
  },
  {
    keywords: ['not feeding', "won't feed", 'refusing breast', 'refusing milk', 'not eating', 'not drinking'],
    tab: 'baby',
    response: {
      text: "Newborns feeding 8–12 times in 24 hours is normal. If your baby is refusing feeds consistently for more than 4–6 hours, seems very lethargic, or isn't producing wet nappies, that's a signal to act. One or two skipped feeds with an otherwise alert, wet-nappied baby is usually less urgent.",
      triage: {
        level: 'watch',
        label: 'Watch Closely',
        summary: 'Feeding refusal combined with low wet nappies or lethargy needs prompt assessment.',
        action: 'Count wet nappies (at least 6 in 24 hours is a good sign). If fewer, or baby seems unresponsive, call your doctor or go to the clinic.',
      },
    },
  },
  {
    keywords: ['crying', 'won\'t stop crying', 'crying a lot', 'inconsolable', 'non-stop cry'],
    tab: 'baby',
    response: {
      text: "Babies communicate through crying — hunger, discomfort, gas, overstimulation, or just needing closeness are the most common causes. If your baby has been crying inconsolably for more than 3 hours with no relief, or the cry sounds unusually high-pitched or weak, that warrants a closer look.",
      triage: {
        level: 'watch',
        label: 'Watch Closely',
        summary: 'Prolonged inconsolable crying can signal pain, colic, or in rare cases a more serious condition.',
        action: 'Check for signs of discomfort (pulling legs, arching back). If crying persists over 3 hours or the cry sounds abnormal, contact your doctor.',
      },
    },
  },
  {
    keywords: ['weight loss', 'losing weight', 'not gaining weight', 'weight drop'],
    tab: 'baby',
    response: {
      text: "A small weight loss of up to 10% of birth weight in the first week is completely normal. Babies typically regain this by 10–14 days. What matters is the trend — your baby should be steadily gaining about 150–200g per week after that initial drop.",
      triage: {
        level: 'monitor',
        label: 'Monitor at Home',
        summary: 'Normal newborn weight loss is up to 10% in week 1, with recovery by days 10–14.',
        action: 'Keep your scheduled paediatric visits and weigh-ins. If baby has lost more than 10% or hasn\'t regained by 2 weeks, see your doctor.',
      },
      highlight: 'Normal: up to 10% weight loss in week 1',
    },
  },
  {
    keywords: ['rash', 'skin', 'bumps', 'red spots', 'pimples', 'acne'],
    tab: 'baby',
    response: {
      text: "Many newborn skin conditions are completely normal — baby acne, milia (tiny white bumps), and erythema toxicum (red blotchy rash) usually clear on their own within weeks. Rashes that spread rapidly, appear blistered, or come with a fever are the ones to watch.",
      triage: {
        level: 'monitor',
        label: 'Monitor at Home',
        summary: 'Most newborn skin rashes are benign and self-resolving.',
        action: 'Do not apply lotions or oils without your doctor\'s advice. If the rash is spreading fast or baby has a fever, see your doctor today.',
      },
    },
  },
  {
    keywords: ['umbilical', 'cord', 'belly button', 'navel', 'cord stump'],
    tab: 'baby',
    response: {
      text: "The umbilical cord stump typically dries and falls off within 1–3 weeks. Keep it clean and dry — avoid submerging your baby in water until it falls off. It's normal for it to look a little crusty or darkened. See a doctor if you notice redness spreading to the surrounding skin, swelling, or a foul smell.",
      triage: {
        level: 'monitor',
        label: 'Monitor at Home',
        summary: 'Normal cord care: keep dry, do not pull, let it fall off naturally.',
        action: 'Signs of infection (redness, smell, swelling) warrant same-day medical review.',
      },
      highlight: 'Cord stump falls off within 1–3 weeks — keep dry',
    },
  },
  {
    keywords: ['seizure', 'convulsion', 'shaking', 'twitching', 'stiff'],
    tab: 'baby',
    response: {
      text: "Seizures or convulsions in a newborn are always a medical emergency. If your baby is having uncontrolled shaking, stiffening of limbs, or eye deviation, call for help immediately.",
      triage: {
        level: 'emergency',
        label: 'Go Now — Emergency',
        summary: 'Neonatal seizures require immediate investigation and treatment.',
        action: 'Do not leave your baby. Call emergency services or have someone drive you to the nearest hospital now. Note how long the episode lasts.',
      },
    },
  },

  // ── PREGNANCY ──────────────────────────────────────────────────────────
  {
    keywords: ['braxton hicks', 'contractions', 'tightening', 'stomach tightening', 'cramps'],
    tab: 'pregnancy',
    response: {
      text: "Braxton Hicks contractions are your uterus practising for labour — they're usually irregular, don't intensify, and ease when you change position or drink water. Real labour contractions come at regular intervals, get longer, stronger, and closer together regardless of what you do. At 2am, if the pattern is irregular and short, this is most likely Braxton Hicks.",
      triage: {
        level: 'monitor',
        label: 'Monitor at Home',
        summary: 'Braxton Hicks: irregular, weak, ease with movement. Labour: regular, intensifying, 5 minutes apart.',
        action: 'Time your contractions for 1 hour. If they become 5 minutes apart, lasting 60 seconds, for 1 hour — go to the hospital.',
      },
      highlight: '5-1-1 rule: contractions 5 min apart, 1 min long, for 1 hour = go to hospital',
    },
  },
  {
    keywords: ['baby movement', 'fetal movement', 'baby kicking', 'not moving', 'kick count', 'reduced movement'],
    tab: 'pregnancy',
    response: {
      text: "You should feel your baby move regularly from around 18–25 weeks. After 28 weeks, you should feel at least 10 movements in 2 hours during an active period. Reduced fetal movement is one of the most important warning signs in pregnancy and should never be ignored or waited out.",
      triage: {
        level: 'urgent',
        label: 'Seek Care Soon',
        summary: 'Reduced fetal movement after 28 weeks needs same-day assessment.',
        action: 'Lie on your left side and focus on movements for 2 hours. If you feel fewer than 10 movements, go to your hospital or maternity unit today — do not wait until tomorrow.',
      },
      highlight: 'After 28 weeks: at least 10 movements in 2 hours',
      reminder: 'kick-count',
    },
  },
  {
    keywords: ['bleeding', 'spotting', 'blood', 'vaginal bleeding'],
    tab: 'pregnancy',
    response: {
      text: "Any vaginal bleeding during pregnancy needs prompt evaluation — even light spotting. Light spotting in early pregnancy can sometimes be normal (implantation), but heavier bleeding, bleeding with pain, or any bleeding after 20 weeks requires urgent assessment.",
      triage: {
        level: 'urgent',
        label: 'Seek Care Soon',
        summary: 'Pregnancy bleeding has multiple causes — some benign, some serious. Only a clinical assessment can determine which.',
        action: 'Go to your nearest maternity unit or hospital today. Note the colour, amount, and whether you have pain alongside it.',
      },
    },
  },
  {
    keywords: ['water break', 'water broke', 'leaking water', 'amniotic fluid', 'gush of water'],
    tab: 'pregnancy',
    response: {
      text: "If your waters have broken — whether a sudden gush or a slow trickle — you need to go to the hospital. Even if contractions haven't started, once the membranes rupture, the risk of infection increases and your baby needs to be monitored.",
      triage: {
        level: 'urgent',
        label: 'Seek Care Soon',
        summary: 'Ruptured membranes increase infection risk. Labour typically follows within 24 hours.',
        action: 'Go to your maternity unit now. Bring your hospital bag. Do not insert anything into the vagina and avoid baths.',
      },
    },
  },
  {
    keywords: ['swelling', 'swollen feet', 'swollen hands', 'swollen face', 'headache', 'vision', 'blurry vision', 'preeclampsia'],
    tab: 'pregnancy',
    response: {
      text: "Sudden swelling of the face, hands, or feet — especially with headache, visual changes, or upper abdominal pain — are warning signs of pre-eclampsia, a serious pregnancy complication. Some ankle swelling is normal late in pregnancy, but sudden or severe swelling is different.",
      triage: {
        level: 'urgent',
        label: 'Seek Care Soon',
        summary: 'Pre-eclampsia can progress to eclampsia (seizures) rapidly. Early detection saves lives.',
        action: 'Go to your hospital for blood pressure checks and urine tests today. Do not delay — pre-eclampsia can escalate quickly.',
      },
      highlight: 'Pre-eclampsia signs: sudden swelling + headache + visual changes',
    },
  },
  {
    keywords: ['due date', 'delivery date', 'edd', 'when is my baby due', 'when will i deliver'],
    tab: 'pregnancy',
    response: {
      text: "I can help you calculate your estimated due date. Your EDD is calculated as 280 days (40 weeks) from the first day of your last menstrual period. To give you a specific date, I need the first day of your last period. What was that date?",
      metric: { label: 'Estimated Due Date', value: 'Tell me your LMP date to calculate' },
    },
  },
  {
    keywords: ['gestational diabetes', 'blood sugar', 'glucose test', 'gtt'],
    tab: 'pregnancy',
    response: {
      text: "Gestational diabetes develops during pregnancy when your body can't produce enough insulin. It's usually detected through a glucose tolerance test between weeks 24–28. The good news: it's manageable with diet, exercise, and if needed, medication. It's important to attend all monitoring appointments.",
      triage: {
        level: 'monitor',
        label: 'Monitor at Home',
        summary: 'Gestational diabetes is manageable but requires consistent blood sugar monitoring and dietary adjustments.',
        action: 'Follow your doctor\'s dietary advice, monitor blood sugar as instructed, and attend all scheduled appointments.',
      },
      highlight: 'Glucose test recommended at weeks 24–28',
      reminder: 'prenatal-vitamins',
    },
  },

  // ── TTC ────────────────────────────────────────────────────────────────
  {
    keywords: ['ovulation', 'fertile window', 'fertile days', 'when to try', 'best time to conceive'],
    tab: 'ttc',
    response: {
      text: "Your fertile window is typically the 5 days before ovulation plus the day of ovulation itself — that's 6 days total. Ovulation usually happens 14 days before your next period. For a 28-day cycle, that's around day 14. For longer or shorter cycles, it shifts accordingly. Signs of ovulation include clear stretchy discharge and sometimes mild one-sided pelvic pain.",
      metric: { label: 'Fertile Window', value: 'Days 10–16 of a 28-day cycle (peak: Day 14)' },
      highlight: 'Fertile window: 5 days before ovulation + ovulation day',
      reminder: 'ttc-cycle',
    },
  },
  {
    keywords: ['cycle length', 'cycle', 'period', 'irregular period', 'irregular cycle'],
    tab: 'ttc',
    response: {
      text: "A normal menstrual cycle ranges from 21 to 35 days. Irregular cycles — where length varies by more than 7 days — can sometimes affect fertility. Tracking your cycle for 2–3 months gives a clearer picture. Apps and basal body temperature charts can help identify patterns.",
      triage: {
        level: 'monitor',
        label: 'Monitor at Home',
        summary: 'Irregular cycles are common and often manageable. Persistent irregularity (over 3 months) is worth discussing with a doctor.',
        action: 'Track your cycle dates for 2–3 months. If consistently irregular or absent, see a gynaecologist.',
      },
    },
  },
  {
    keywords: ['pregnant', 'positive test', 'pregnancy test', 'two lines', 'confirmed pregnant'],
    tab: 'pregnancy',
    response: {
      text: "Congratulations! A positive pregnancy test is such exciting news. Your next step is to book an appointment with an obstetrician or midwife as soon as possible — ideally within the first 8–10 weeks. They'll confirm the pregnancy, check for ectopic pregnancy risk, and begin your antenatal care schedule. Start taking folic acid (400mcg daily) if you haven't already.",
      triage: {
        level: 'monitor',
        label: 'Monitor at Home',
        summary: 'Early booking for antenatal care improves outcomes significantly.',
        action: 'Book your first antenatal appointment. Start folic acid. Avoid alcohol, smoking, and high-mercury fish.',
      },
      highlight: 'Book antenatal care by week 8–10',
    },
  },
  {
    keywords: ['trying to conceive', 'trying for a baby', 'want to get pregnant', 'ttc', 'how to get pregnant'],
    tab: 'ttc',
    response: {
      text: "When you're trying to conceive, a few things make a meaningful difference: knowing your fertile window, having regular unprotected sex (every 2–3 days throughout your cycle covers your bases), taking folic acid (400mcg daily, ideally starting 3 months before), and reducing alcohol and smoking. Most healthy couples conceive within a year of trying.",
      triage: {
        level: 'monitor',
        label: 'Monitor at Home',
        summary: 'Most couples conceive within 12 months. If under 35, see a doctor after 12 months of trying. If over 35, after 6 months.',
        action: 'Start tracking your cycle, take folic acid daily, and aim for regular intimacy throughout your cycle.',
      },
      highlight: 'Start folic acid 400mcg daily 3 months before conception',
      reminder: 'folic-acid',
    },
  },

  // ── GENERAL / REASSURANCE ──────────────────────────────────────────────
  {
    keywords: ['normal', 'am i overreacting', 'should i worry', 'is this normal', 'worried'],
    tab: 'baby',
    response: {
      text: "Being concerned about your baby or your pregnancy is completely natural — it's a sign of how much you care. I'm here to help you tell the difference between what's expected and what needs attention. Tell me more about what you're noticing. The more detail you share, the better I can guide you.",
    },
  },
  {
    keywords: ['help', 'what do i do', 'i don\'t know', 'confused', 'scared'],
    tab: 'baby',
    response: {
      text: "Take a breath — you've done the right thing by reaching out. Tell me what's happening with your baby or yourself, and I'll help you understand the situation and what to do next. I'm here with you.",
    },
  },
];

// ── Default fallback response ──────────────────────────────────────────────
export const fallbackResponse: NeoResponse = {
  text: "I hear you. Could you tell me a little more about what you're experiencing? The more detail you share — like your baby's age, the symptoms you've noticed, and when they started — the better I can help you figure out what's going on and what to do next.",
};

// ── Welcome messages by tab ────────────────────────────────────────────────
export const welcomeMessages: Record<ChatTab, string> = {
  baby: "Hi there. I'm Neo — I'm here to help you understand what's happening with your baby and decide what to do next. What's on your mind?",
  pregnancy: "Hello. I'm Neo, your pregnancy companion. Whether you have a question, something feels off, or you just need reassurance — I'm here. What would you like to talk about?",
  ttc: "Hi! I'm Neo. Whether you're just starting your conception journey or have been trying for a while, I'm here to help with information and support. What's on your mind?",
};
