export interface TimelinePrompt {
  id: string;
  title: string;
  body: string;
  week?: number;          // gestational week (pregnancy)
  dayPostpartum?: number; // days after birth (baby)
  category: 'pregnancy' | 'baby' | 'ttc' | 'partner';
  urgent?: boolean;
}

export const pregnancyPrompts: TimelinePrompt[] = [
  {
    id: 'p-08',
    week: 8,
    category: 'pregnancy',
    title: 'Book your first antenatal visit',
    body: 'Your first antenatal appointment (booking visit) should happen between weeks 8–12. This is where your care plan begins — blood tests, blood pressure, and your first scan will be scheduled.',
  },
  {
    id: 'p-12',
    week: 12,
    category: 'pregnancy',
    title: 'First trimester screening',
    body: 'Around week 12, your dating scan will confirm your due date and screen for chromosomal conditions. This is also when many people share their pregnancy news — you\'ve made it to 12 weeks!',
  },
  {
    id: 'p-16',
    week: 16,
    category: 'pregnancy',
    title: 'Fetal movements start soon',
    body: 'Between weeks 16–25, you\'ll start feeling your baby move — first as gentle flutters, then clearer kicks. First-time mums often feel this closer to week 20. This is one of the most magical moments.',
  },
  {
    id: 'p-20',
    week: 20,
    category: 'pregnancy',
    title: 'Anatomy scan this week',
    body: 'Your mid-pregnancy scan around week 20 checks your baby\'s development in detail — organs, limbs, placenta position. This is also when many parents find out the sex of their baby (if they want to).',
  },
  {
    id: 'p-24',
    week: 24,
    category: 'pregnancy',
    title: 'Glucose tolerance test',
    body: 'Between weeks 24–28, you\'ll be offered a glucose tolerance test to screen for gestational diabetes. It involves a blood test before and after drinking a glucose drink. Worth attending — early detection makes management much easier.',
  },
  {
    id: 'p-28',
    week: 28,
    category: 'pregnancy',
    title: 'Track your baby\'s kicks',
    body: 'From 28 weeks, your baby should be moving regularly. A simple habit: notice 10 movements in a 2-hour window each day. If your baby feels quieter than usual, don\'t wait — contact your midwife or maternity unit.',
    urgent: false,
  },
  {
    id: 'p-32',
    week: 32,
    category: 'pregnancy',
    title: 'Pack your hospital bag',
    body: 'Start assembling your hospital bag this week — you have about 8 weeks, but babies have their own schedule. Include: your insurance/health card, a newborn outfit, your medications list, a phone charger, and snacks for labour.',
  },
  {
    id: 'p-36',
    week: 36,
    category: 'pregnancy',
    title: 'Baby could arrive any time from now',
    body: 'Full term begins at 37 weeks. From this point, your baby could arrive at any time. Learn the signs of labour: regular contractions (5 minutes apart), waters breaking, or a bloody show. When in doubt, go to the hospital — they will never mind checking.',
  },
  {
    id: 'p-38',
    week: 38,
    category: 'pregnancy',
    title: 'Birth plan ready?',
    body: 'If you have preferences for your birth experience — pain relief, who\'s in the room, cord cutting, skin-to-skin — this is a good time to write them down and share with your care team. A birth plan doesn\'t lock you in, but helps your team support you better.',
  },
];

export const babyPrompts: TimelinePrompt[] = [
  {
    id: 'b-d1',
    dayPostpartum: 1,
    category: 'baby',
    title: 'Baby\'s first poop is coming',
    body: 'Your baby\'s first stool — called meconium — will be dark, tarry, and greenish-black. This is completely normal. It should pass within the first 24–48 hours. A sign their gut is working.',
  },
  {
    id: 'b-d3',
    dayPostpartum: 3,
    category: 'baby',
    title: 'Weight loss is normal right now',
    body: 'Your baby may have lost 5–10% of their birth weight by day 3–4. Don\'t panic — this is expected and almost always recovers by 10–14 days with consistent feeding. Keep feeding on demand.',
  },
  {
    id: 'b-d5',
    dayPostpartum: 5,
    category: 'baby',
    title: 'Mild jaundice peaks around now',
    body: 'Physiological jaundice — yellowing of the skin — commonly peaks at days 3–5 and fades by week 2. Watch for yellowing that starts in the first 24 hours or spreads to the belly and legs — those patterns need immediate evaluation.',
  },
  {
    id: 'b-w1',
    dayPostpartum: 7,
    category: 'baby',
    title: 'Newborn check-up due',
    body: 'Your baby\'s first check-up is usually around days 5–10. Your paediatrician will check weight, feeding, jaundice, and the cord stump. It\'s a great time to ask all the questions that have been building up.',
  },
  {
    id: 'b-w2',
    dayPostpartum: 14,
    category: 'baby',
    title: 'Back to birth weight — milestone',
    body: 'By 2 weeks, your baby should have regained their birth weight. If not, contact your doctor. From here, they should gain roughly 150–200g per week for the first 3 months.',
  },
  {
    id: 'b-w6',
    dayPostpartum: 42,
    category: 'baby',
    title: '6-week check for you and baby',
    body: 'The 6-week postnatal check is a key milestone — for baby (growth, development, hearing) and for you (physical recovery, mental health, contraception). Don\'t skip yours. PPD symptoms can surface around now.',
  },
  {
    id: 'b-m2',
    dayPostpartum: 60,
    category: 'baby',
    title: 'First vaccinations due',
    body: 'Your baby\'s first round of vaccinations is due around 6–8 weeks. In Nigeria and Ghana, this includes the pentavalent vaccine, PCV, rotavirus, and oral polio vaccine. Vaccinations protect your baby — even minor side effects (mild fever, fussiness) are temporary and expected.',
  },
  {
    id: 'b-m4',
    dayPostpartum: 120,
    category: 'baby',
    title: 'Watch for developmental milestones',
    body: 'By 3–4 months, most babies smile responsively, follow objects with their eyes, and begin to babble. Every baby develops at their own pace — but if there are no social smiles by 3 months, mention it to your doctor at the next visit.',
  },
  {
    id: 'b-m6',
    dayPostpartum: 180,
    category: 'baby',
    title: 'Weaning conversations begin',
    body: 'Around 6 months, babies can start complementary foods alongside breast milk or formula. Look for signs of readiness: sitting with support, showing interest in food, loss of tongue-thrust reflex. The WHO recommends exclusive breastfeeding until 6 months.',
  },
];

export const partnerPrompts: TimelinePrompt[] = [
  {
    id: 'pt-01',
    category: 'partner',
    title: 'Your presence matters more than you know',
    body: 'Being present — emotionally and physically — has a measurable impact on birth outcomes and postpartum recovery. You don\'t need to have all the answers. Showing up consistently, listening without judgment, and asking "what do you need right now?" is one of the most powerful things you can do.',
  },
  {
    id: 'pt-02',
    category: 'partner',
    title: 'Attend the next antenatal appointment',
    body: 'Partners who attend antenatal appointments gain a real understanding of what\'s happening medically and emotionally. It also signals to your partner — and her care team — that you\'re invested and present. Ask about the birth plan and what your role will be during labour.',
  },
  {
    id: 'pt-03',
    category: 'partner',
    title: 'Learn the signs of labour — before it starts',
    body: 'Labour can begin at any time from 37 weeks. Know the signs: regular contractions 5 minutes apart, waters breaking, a bloody show. Have the hospital bag ready and the route planned. Have her care team\'s number saved. Preparation reduces panic and lets you be a calm, reliable presence.',
  },
  {
    id: 'pt-04',
    category: 'partner',
    title: 'The first two weeks: what your role actually looks like',
    body: 'The first two weeks after birth are often called the "fourth trimester." Your partner\'s body is recovering from a major physical event while also establishing feeding and adjusting to huge hormonal shifts. Your role: protect her rest, manage visitors, handle the home, and make sure she\'s eating. She needs to be taken care of while she takes care of the baby.',
  },
  {
    id: 'pt-05',
    category: 'partner',
    title: 'Paternal postnatal depression is real — know the signs',
    body: 'Paternal postnatal depression affects up to 10% of new fathers. Symptoms include persistent irritability, withdrawal from family, difficulty bonding, fatigue beyond tiredness, and feeling like you\'re going through the motions. If this sounds familiar and it\'s been more than two weeks, speak to a doctor. Staying healthy isn\'t optional — your baby needs two well parents.',
  },
  {
    id: 'pt-06',
    category: 'partner',
    title: 'How to support breastfeeding when you can\'t feed',
    body: 'You can\'t breastfeed — but you can make breastfeeding possible. Bring water and a snack to every feed. Sit with her at 2am; you don\'t need to do anything, just be there. Manage the household so she doesn\'t have to think about it. Protect her from well-meaning but unhelpful comments. And celebrate every milestone — breastfeeding is harder than it looks from the outside.',
  },
];

export const ttcPrompts: TimelinePrompt[] = [
  {
    id: 'ttc-01',
    category: 'ttc',
    title: 'Start folic acid now',
    body: 'Folic acid (400mcg daily) should ideally be started 3 months before trying to conceive. It significantly reduces the risk of neural tube defects. If you\'re already trying, start today — it\'s not too late.',
  },
  {
    id: 'ttc-02',
    category: 'ttc',
    title: 'Track your cycle for 2–3 months',
    body: 'Understanding your cycle length is the foundation of timing conception. Track the first day of each period. Most apps can estimate your ovulation, but your own data is the most accurate.',
  },
  {
    id: 'ttc-03',
    category: 'ttc',
    title: 'Know your fertile window',
    body: 'Your 6 most fertile days are the 5 days before ovulation and ovulation day itself. For a 28-day cycle, that\'s roughly days 10–16. Regular sex every 2–3 days throughout your cycle means you never miss the window.',
  },
];
