import { UserStage } from '../hooks/useAppContext';

export interface ArticleAuthor {
  name: string;
  role: string;
  image: string;   // Unsplash portrait URI
  initials: string;
  avatarBg: string;
}

const AUTHORS: Record<string, ArticleAuthor> = {
  amara: {
    name: 'Dr. Amara Osei',
    role: 'Obstetrician & Gynaecologist',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    initials: 'AO',
    avatarBg: '#F7E6EA',
  },
  sarah: {
    name: 'Sarah Mensah',
    role: 'Senior Midwife & Lactation Consultant',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    initials: 'SM',
    avatarBg: '#D6EEFF',
  },
  funmi: {
    name: 'Dr. Funmi Adeyemi',
    role: 'Consultant Paediatrician',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    initials: 'FA',
    avatarBg: '#D8EDD8',
  },
  chioma: {
    name: 'Dr. Chioma Nwosu',
    role: 'Perinatal Mental Health Specialist',
    image: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=200&q=80',
    initials: 'CN',
    avatarBg: '#FEF0C7',
  },
  adaeze: {
    name: 'Adaeze Okafor',
    role: 'Fertility Nutritionist & Counsellor',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
    initials: 'AO',
    avatarBg: '#FFE0EA',
  },
  kwame: {
    name: 'Dr. Kwame Asante',
    role: 'Men\'s Health & Perinatal Wellbeing Specialist',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
    initials: 'KA',
    avatarBg: '#D6EEFF',
  },
};

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  tag: string;
  readMinutes: number;
  stages: UserStage[];
  author: ArticleAuthor;
  coverEmoji: string;   // shown while image loads or as fallback on error
  coverBg: string;      // tint behind emoji / excerpt callout
  coverImage: string;   // Unsplash photo URI
  minWeek?: number;
  maxWeek?: number;
  minDay?: number;   // days postpartum
  maxDay?: number;
}

export const articles: Article[] = [

  // ── PREGNANCY ──────────────────────────────────────────────

  {
    id: 'pg-morning-sickness',
    stages: ['pregnancy'],
    minWeek: 5,
    maxWeek: 16,
    tag: 'Nutrition',
    readMinutes: 4,
    author: AUTHORS.sarah,
    coverEmoji: '🍋',
    coverBg: '#FFE8D6',
    coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    title: 'Morning sickness: what actually helps',
    excerpt: 'Up to 80% of pregnant women experience nausea. Here\'s what the evidence says — and what actually makes a difference.',
    body: `Nausea and vomiting in pregnancy (NVP) affects around 70–80% of pregnant women, and despite the name, it isn't limited to mornings. For most, it starts around week 6 and eases by week 12–14 — though for some, it lingers into the second trimester.

The cause isn't fully understood, but rising hCG levels and oestrogen are likely drivers. What we do know is that it is real, it is exhausting, and it can make the early weeks feel very long.

**What genuinely helps:**
Eating small, frequent meals prevents the stomach from becoming empty — an empty stomach tends to make nausea worse. Bland, carbohydrate-rich foods (crackers, toast, plain rice) are usually better tolerated. Cold foods often have less smell, which helps if odours are triggering you.

Ginger has good evidence behind it. A small amount of ginger tea, ginger biscuits, or ginger capsules (up to 1,000mg daily) has been shown to reduce nausea. Vitamin B6 (pyridoxine) is also effective and is often the first-line recommendation from doctors — ask your midwife if you'd like to try this.

Staying hydrated matters more than eating. If you can't keep food down, focus on small, regular sips of cold water or diluted juice. If you're vomiting more than three times a day and can't keep fluids down, contact your GP — you may have hyperemesis gravidarum (HG), a more severe condition that needs medical support and is nothing to push through alone.

Rest when you can. Fatigue makes nausea worse. Don't push yourself to eat 'properly' right now — if plain crackers are all you can manage, that is enough for this phase.`,
  },

  {
    id: 'pg-booking-appt',
    stages: ['pregnancy'],
    minWeek: 7,
    maxWeek: 13,
    tag: 'Antenatal Care',
    readMinutes: 3,
    author: AUTHORS.sarah,
    coverEmoji: '📋',
    coverBg: '#D6EEFF',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    title: 'Your booking appointment: what to expect',
    excerpt: 'Your first midwife appointment covers a lot of ground. Here\'s what happens and what to prepare.',
    body: `The booking appointment is your first formal antenatal visit, usually between weeks 8 and 12. It's often the longest appointment of your pregnancy — set aside 1–2 hours. It may feel overwhelming, but it's mostly information gathering.

**What will happen:**
Your midwife will take a detailed medical and family history, record your blood pressure and weight, and arrange a range of blood tests. These typically include your blood group and rhesus factor, iron levels, full blood count, syphilis and HIV screening, hepatitis B, and rubella immunity. Urine will also be tested for protein and infection.

You'll discuss your options for antenatal screening (the combined test for chromosomal conditions like Down's syndrome, usually done at the 12-week scan), and your midwife will confirm your due date. They'll also ask about your mental health — don't feel you need to minimise how you're feeling.

**What to bring:**
Your NHS or maternity card if you have one, details of any medications you're on, your GP's details, and a list of questions. It also helps to know your last menstrual period date if you're unsure of your dates.

**Questions worth asking:**
When will my scan be scheduled? Which hospital or birth centre will I be booked with? What support is available for sickness or pelvic pain? Who do I call if I have concerns before my next appointment?

The booking visit is the start of your care relationship — feel free to ask anything. Your midwife has heard it all before.`,
  },

  {
    id: 'pg-anatomy-scan',
    stages: ['pregnancy'],
    minWeek: 17,
    maxWeek: 23,
    tag: 'Your Baby',
    readMinutes: 3,
    author: AUTHORS.amara,
    coverEmoji: '👶',
    coverBg: '#FEF0C7',
    coverImage: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
    title: 'Your 20-week scan: what they\'re looking for',
    excerpt: 'The anatomy scan is one of the most detailed checks of your baby\'s health. Here\'s what the sonographer examines and why.',
    body: `The mid-pregnancy anomaly scan — commonly called the 20-week scan — is one of the most comprehensive checks of your baby's development. It typically happens between 18 and 22 weeks and takes 20–40 minutes.

**What the scan examines:**
The sonographer checks your baby's brain, spine, heart (all four chambers), kidneys, abdominal wall, lips, limbs, and facial features. They also assess the position and appearance of the placenta, the amniotic fluid volume, and will measure your baby's growth.

**About the heart:**
The fetal heart is examined in detail because structural heart differences are the most common congenital condition. Finding anything unexpected doesn't mean the worst — many findings require only monitoring, and earlier detection always gives more options.

**Finding out the sex:**
If you'd like to know your baby's sex, you can ask the sonographer. Not all trusts offer this routinely, so it's worth requesting specifically. Some parents choose to keep this private — either approach is completely valid.

**If something is found:**
Occasionally a scan identifies something that needs a second look — an unusual position, a measurement that's slightly outside the range, or something that needs specialist review. This is more common than many people realise and often resolves or requires no action. You will not be left alone with that information — a next step will always be offered.

Bring water and arrive with a reasonably full bladder (particularly before 18 weeks). Wear loose clothing for easy access. And take a moment after to process — it's a lot to absorb.`,
  },

  {
    id: 'pg-fetal-movement',
    stages: ['pregnancy'],
    minWeek: 16,
    maxWeek: 36,
    tag: 'Your Baby',
    readMinutes: 3,
    author: AUTHORS.sarah,
    coverEmoji: '🤰',
    coverBg: '#FFE0EA',
    coverImage: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80',
    title: 'Feeling your baby move: what\'s normal',
    excerpt: 'Fetal movement is one of the most reassuring signs of your baby\'s wellbeing. Here\'s how to understand what you\'re feeling.',
    body: `First-time parents often feel fetal movement between 18 and 22 weeks — sometimes described as bubbles, flutters, or a light tapping. If you've been pregnant before, you may notice it earlier, from around week 16. Every pregnancy is different.

As your pregnancy progresses, movements become more defined. By 28 weeks, your baby will have an established pattern of activity — periods of movement and periods of rest. There is no universal "right" number of kicks; what matters is that you know your baby's normal pattern.

**The 10-movement count:**
From 28 weeks, a useful daily habit is to notice when your baby reaches 10 movements (kicks, rolls, swishes, hiccups) in a two-hour window. Most babies will reach this comfortably. Do this at a time when your baby is usually active — often after a meal or in the evening.

**When to contact your midwife:**
If your baby is moving less than usual, or if the pattern feels different to you — contact your maternity unit. Don't wait until the next day. Do not use at-home dopplers to reassure yourself; they can give false reassurance and should not replace professional assessment.

It's important to know: a baby slowing down before labour is not expected. Reduced movement is always worth reporting, regardless of your stage of pregnancy.

Feeling a quiet day? Have a cold drink, lie on your left side, and focus. If you don't feel your normal pattern within two hours — call.`,
  },

  {
    id: 'pg-gest-diabetes',
    stages: ['pregnancy'],
    minWeek: 23,
    maxWeek: 35,
    tag: 'Health',
    readMinutes: 4,
    author: AUTHORS.amara,
    coverEmoji: '🩺',
    coverBg: '#D8EDD8',
    coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    title: 'Gestational diabetes: what it means for you',
    excerpt: 'A diagnosis can feel alarming. Understanding what\'s happening — and how manageable it is — makes all the difference.',
    body: `Gestational diabetes (GDM) is a form of diabetes that develops during pregnancy, usually in the second or third trimester, and almost always resolves after birth. It affects around 1 in 14 pregnancies and is more common in women over 35, those with a family history of type 2 diabetes, women who are South Asian, Middle Eastern, or Black African, and those who have had GDM before.

**Why it happens:**
During pregnancy, hormones from the placenta make your cells more resistant to insulin. For most women, the pancreas compensates by producing more insulin. In gestational diabetes, it can't keep up — and blood sugar rises.

**What it means practically:**
You'll be offered a glucose tolerance test (GTT) between 24–28 weeks if you have risk factors — or earlier if your risk is higher. If diagnosed, you'll be monitored more closely, offered appointments with a diabetes specialist midwife or dietitian, and asked to monitor your blood glucose at home.

For most women, diet and lifestyle adjustments are enough to manage blood sugar well. This means reducing refined carbohydrates, balancing carbs with protein and fat, and spreading meals throughout the day. Some women need insulin or medication — this doesn't mean you've done anything wrong.

**Why management matters:**
Poorly controlled GDM can increase the risk of your baby growing larger than average (macrosomia), which affects birth planning. It also increases the risk of preeclampsia, early birth, and neonatal blood sugar problems. Well-managed GDM significantly reduces all of these risks.

After birth, you'll have a blood test at 6–13 weeks to confirm blood sugar has returned to normal. You'll also be offered a test annually going forward, as GDM slightly increases long-term risk of type 2 diabetes — which is very preventable with the right habits.`,
  },

  {
    id: 'pg-birth-plan',
    stages: ['pregnancy'],
    minWeek: 29,
    maxWeek: 41,
    tag: 'Labour & Birth',
    readMinutes: 4,
    author: AUTHORS.sarah,
    coverEmoji: '📝',
    coverBg: '#FEF0C7',
    coverImage: 'https://images.unsplash.com/photo-1485841034924-d4bf42d7f739?auto=format&fit=crop&w=800&q=80',
    title: 'Writing a birth plan that actually works',
    excerpt: 'A birth plan isn\'t about predicting your labour — it\'s about communicating your values to your care team.',
    body: `A birth plan is not a contract. Labour is unpredictable by nature, and the goal isn't to stick to a script — it's to communicate what matters most to you so your team can support you in the way you want, even when plans change.

**What to include:**

*Pain relief preferences:* List what you'd like to try (water, movement, gas and air, epidural) and in what order. Include what you want to avoid if possible, and why, without making it an absolute refusal — things change.

*Your birth environment:* Do you prefer low lighting? Music? Do you want minimal interruptions during active labour? Preferences about who's in the room?

*During birth:* Do you want to be free to move and choose your own positions? Delayed cord clamping (keeping the cord intact for 1–3 minutes after birth)? Skin-to-skin immediately after? Who cuts the cord?

*Feeding:* Do you intend to breastfeed or formula-feed? Do you want a breastfeeding specialist present?

*If things change:* What are your priorities if intervention is needed? Do you want to be informed at each step, or would you prefer the team to make decisions quickly and explain after?

**Keep it readable:**
One page, bullet points, clear and direct. Bring several printed copies — one for your notes, one for the midwife looking after you, one for your birth partner.

**Talk through it beforehand:**
Discuss your plan with your midwife at your next appointment. They can flag anything that isn't standard at your unit, suggest alternatives you may not have considered, and note your preferences in your file.

A birth plan built around your values — flexibility included — is far more useful than a rigid list of demands. Your team wants to support you. Help them do that.`,
  },

  {
    id: 'pg-signs-of-labour',
    stages: ['pregnancy'],
    minWeek: 35,
    maxWeek: 42,
    tag: 'Labour & Birth',
    readMinutes: 3,
    author: AUTHORS.amara,
    coverEmoji: '🏥',
    coverBg: '#FFE0EA',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    title: 'Signs of labour: when to go in',
    excerpt: 'Knowing the difference between pre-labour and the real thing — and knowing when to call — is one of the most practical things you can prepare.',
    body: `The weeks before labour can bring a lot of changes that feel significant but aren't labour yet — and then actual labour can start quietly. Here's how to tell the difference.

**Pre-labour signs (not yet time to go in):**
Braxton Hicks contractions — irregular tightenings that don't follow a pattern and ease with movement or position change. A 'show' — a mucus plug that may be clear, pink, or slightly blood-streaked — can happen days before labour starts. Lower back ache, pelvic pressure, and nesting urges are all common in the final weeks.

**Signs that labour has begun:**
Regular contractions that increase in frequency, length, and intensity — typically 5 minutes apart, lasting 45–60 seconds, for at least an hour — is a reliable signal. Your waters breaking (a gush or a slow trickle of clear or pale fluid) is another. These may happen together or separately.

**Call your unit immediately if:**
Your waters break and the fluid is green, brown, or foul-smelling — this could indicate meconium and needs immediate assessment. You notice heavy bright red bleeding. Your baby has significantly reduced movement. You have a severe headache, visual disturbance, or sudden swelling in your face or hands — these are signs of preeclampsia.

**The 5-1-1 rule:**
Contractions every 5 minutes, lasting 1 minute, for at least 1 hour. This is a widely used starting point for when to head to hospital for a first baby. Your unit may have its own guidance — check your notes or call ahead.

When in doubt, always call your maternity unit. They would rather you call and be sent home than wait too long.`,
  },

  {
    id: 'pg-fourth-trimester-prep',
    stages: ['pregnancy'],
    minWeek: 30,
    maxWeek: 42,
    tag: 'Preparation',
    readMinutes: 3,
    author: AUTHORS.sarah,
    coverEmoji: '🏠',
    coverBg: '#FFE8D6',
    coverImage: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80',
    title: 'Preparing for the fourth trimester',
    excerpt: 'The weeks after birth — the "fourth trimester" — are often the hardest. Thinking about them now makes a real difference.',
    body: `Most pregnancy preparation focuses on labour. But the weeks immediately after birth — sometimes called the fourth trimester — are where many parents feel most caught off guard. Thinking ahead matters.

**For you physically:**
Your body will be recovering from birth whether you delivered vaginally or by caesarean. Stock up on practical supplies: maternity pads (you will need more than you think), comfortable high-waisted underwear, nipple cream if you plan to breastfeed, stool softeners, ice packs. A peri bottle (a squeezy bottle for rinsing while using the toilet) is one of the most underrated purchases.

**For feeding:**
Decide in advance what support you want — a lactation consultant's contact, your local breastfeeding group, or formula options ready at home. Feed decisions are yours to make without pressure, and knowing your support routes reduces panic in the early days.

**For your mental health:**
The baby blues — tearfulness, mood swings — typically peak around days 3–5 and resolve within two weeks. This is hormonal and normal. Postnatal depression is different: persistent low mood, anxiety, detachment, or intrusive thoughts that don't lift. Know the difference, and have someone you trust who can notice if you're not okay.

**Practical home preparation:**
Prepare and freeze meals. Identify who will help with the house in weeks one and two. Lower your expectations — of yourself, of your home, of everything except your baby's needs and your own recovery.

The fourth trimester is a survival phase. It is temporary, and it gets better faster than you might imagine.`,
  },

  // ── BABY / POSTPARTUM ─────────────────────────────────────

  {
    id: 'bb-body-after-birth',
    stages: ['newmom'],
    minDay: 0,
    maxDay: 21,
    tag: 'Recovery',
    readMinutes: 4,
    author: AUTHORS.sarah,
    coverEmoji: '🌸',
    coverBg: '#FFE0EA',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    title: 'Your body after birth: what to expect',
    excerpt: 'Birth is a significant physical event. Here\'s what\'s normal in the first weeks — and what to watch for.',
    body: `No matter how your baby arrived, your body has just done something extraordinary. The first two weeks involve a lot of physical change, and knowing what to expect helps you separate normal recovery from signs you need support.

**Bleeding (lochia):**
Vaginal bleeding after birth is normal and can last 4–6 weeks. In the first days it is bright red and heavy; it gradually becomes lighter and more pink, then yellow or white. Passing clots smaller than a 50p coin is normal. If you soak through a pad in under an hour, pass large clots, or the bleeding suddenly becomes heavier after lightening — contact your midwife.

**Perineal recovery:**
If you had stitches or tearing, the area will be sore for 1–2 weeks. Keep it clean with warm water, let air circulate when possible, use a ring cushion when sitting, and take regular pain relief. Most stitches dissolve on their own. If you notice increasing redness, swelling, or discharge with an odour, contact your team — these can indicate infection.

**Caesarean recovery:**
C-section recovery typically takes longer than vaginal birth recovery. Avoid lifting anything heavier than your baby for the first 6 weeks. Keep the wound clean and dry. Watch for signs of infection: redness, warmth, discharge, or a wound that starts to open.

**Afterpains:**
Uterine contractions as the womb returns to its pre-pregnancy size (called afterpains) can be surprisingly painful, especially during breastfeeding. They are strongest in the first 72 hours and fade within a week. Ibuprofen (if no contraindications) is usually more effective than paracetamol for these.

**The 6-week check:**
This is for you as much as your baby. Raise anything that hasn't healed, anything that doesn't feel right, and anything about your mental health — even if it feels minor. This is your appointment.`,
  },

  {
    id: 'bb-breastfeeding-early',
    stages: ['newmom'],
    minDay: 0,
    maxDay: 28,
    tag: 'Feeding',
    readMinutes: 4,
    author: AUTHORS.sarah,
    coverEmoji: '🍼',
    coverBg: '#FFE8D6',
    coverImage: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=800&q=80',
    title: 'Breastfeeding in the first two weeks',
    excerpt: 'The early weeks of breastfeeding are often the hardest. What\'s happening, what helps, and when to ask for support.',
    body: `Breastfeeding is natural — but that doesn't mean it's instinctive or easy at first. Most difficulties in the early weeks come from latch problems, supply concerns, or sheer exhaustion. Almost all of them are solvable with the right support.

**What happens first:**
In the first 2–3 days, your breasts produce colostrum — a thick, concentrated, yellowish milk that's exactly what your newborn needs. It's produced in small amounts (measured in millilitres, not ounces) but is high in antibodies and nutrients. Your baby's stomach is tiny; this is enough.

Around days 3–5, your milk 'comes in' and your breasts become fuller and heavier. This can feel sudden and uncomfortable. Feed frequently to establish supply and prevent engorgement.

**Latch:**
A deep latch matters. Your baby should take in a large portion of areola (not just the nipple), their lips should flare outward, and you should hear or see swallowing after the first few sucks. Pain beyond the initial 30 seconds of latching usually indicates the latch needs adjusting. Pain that doesn't ease is not something to push through — it leads to damage and gives up.

**How often:**
Feed on demand, which in the early weeks often means every 1.5–3 hours. Frequent feeding establishes your supply. Sleepy babies may need to be gently woken for feeds in the first 2 weeks.

**Signs feeding is going well:**
6+ wet nappies per day after day 5, steady weight gain after the initial loss, a baby who seems satisfied after feeds.

**When to get help:**
If feeding is consistently painful, if your baby isn't gaining weight, if you develop a hard red patch on your breast (possible mastitis), or if you're considering stopping — contact a lactation consultant or breastfeeding counsellor. This is exactly what they're for.`,
  },

  {
    id: 'bb-newborn-sleep',
    stages: ['newmom'],
    minDay: 0,
    maxDay: 120,
    tag: 'Sleep',
    readMinutes: 4,
    author: AUTHORS.funmi,
    coverEmoji: '🌙',
    coverBg: '#D6EEFF',
    coverImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    title: 'Understanding newborn sleep',
    excerpt: 'Newborn sleep is fundamentally different from adult sleep. Understanding why makes the exhaustion more bearable — and the choices clearer.',
    body: `Newborns sleep 14–17 hours a day — but in short, unpredictable stretches, rarely more than 2–4 hours at a time. This is biologically normal and serves important purposes: frequent waking supports feeding, brain development, and (in breastfed babies) milk supply.

**Why newborns sleep the way they do:**
Newborns spend a much higher proportion of their sleep in REM (active sleep) than adults — this is associated with rapid brain development. They also have a much smaller circadian rhythm; they don't distinguish night from day until around 6–8 weeks, when melatonin production begins to develop.

**Safe sleep:**
Every sleep: baby on their back, on a firm flat surface, with no loose bedding, pillows, or bumpers. Room sharing (not bed-sharing) with parents for at least the first 6 months significantly reduces SIDS risk. This guidance applies to every sleep, including naps.

**Settling:**
Newborns are often most settled when held — skin-to-skin contact regulates their temperature, heart rate, and stress hormones. You cannot spoil a newborn with contact. Swaddling (up to the point baby shows signs of rolling), white noise, rocking, and feeding to sleep are all valid tools.

**Night and day:**
Help your baby begin to distinguish night from day by keeping daytime bright and stimulating, and night feeds calm, quiet, and dimly lit. This doesn't produce results immediately, but it does help over weeks.

**Managing the exhaustion:**
Sleep when the baby sleeps is frustrating advice, but the principle is sound: protect sleep where you can, ask for help, and recognise that this is a phase with an end. Significant waking reduces meaningfully around 3–6 months for most babies — though 'sleeping through' is often defined more optimistically than it should be.`,
  },

  {
    id: 'bb-postnatal-depression',
    stages: ['newmom'],
    minDay: 10,
    maxDay: 180,
    tag: 'Mental Health',
    readMinutes: 4,
    author: AUTHORS.chioma,
    coverEmoji: '💙',
    coverBg: '#D6EEFF',
    coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    title: 'Postnatal depression: you are not alone',
    excerpt: 'PND affects 1 in 10 new mothers. Knowing the signs — and knowing it\'s treatable — is the most important thing.',
    body: `Postnatal depression (PND) is not the same as the baby blues. The baby blues — tearfulness, emotional swings, feeling overwhelmed — are common in the first week and typically resolve within two weeks. PND is different: it persists, it deepens, and it doesn't lift on its own without support.

**It affects 1 in 10 new mothers.** It can also affect fathers and partners. It's not a sign of failure, poor mothering, or not loving your baby enough. It is a medical condition with well-established treatments, and most women recover fully.

**Signs of PND:**
Persistent low mood or sadness that doesn't lift. Loss of interest in things you normally enjoy. Feeling disconnected from your baby or unable to bond. Anxiety that feels overwhelming or out of proportion. Difficulty sleeping even when the baby sleeps. Intrusive thoughts (thoughts of harm, extreme catastrophising). Feeling like you're not coping, or like everyone else would do this better.

**Postnatal anxiety** is equally common and often underdiagnosed — it can present as constant worry, physical tension, heart palpitations, or difficulty leaving the house.

**What helps:**
Talking therapy (CBT, counselling) is effective. Antidepressants are safe with breastfeeding and can make a significant difference. Peer support — talking to others who have been through this — reduces isolation. Practical help at home reduces the load.

**The first step:**
Tell someone. Your GP, your health visitor, your midwife. You don't need to be in crisis to ask for help — feeling like you're not okay is enough. If you're not taken seriously at first, come back or ask to see someone else.

You deserve support. This is not your fault. It gets better.`,
  },

  {
    id: 'bb-milestones-3m',
    stages: ['newmom'],
    minDay: 42,
    maxDay: 150,
    tag: 'Development',
    readMinutes: 3,
    author: AUTHORS.funmi,
    coverEmoji: '🌟',
    coverBg: '#FEF0C7',
    coverImage: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80',
    title: 'Your baby\'s first milestones: what to watch for',
    excerpt: 'The first three months bring some of the most memorable developments. Here\'s a guide to what\'s typical — and when to mention things to your doctor.',
    body: `Development in the first months is not a checklist to anxiously track — but it is a story unfolding in real time. Knowing what's typical helps you celebrate what you're seeing and catch anything that deserves attention.

**1 month:**
Your baby should respond to sound (startling, quieting, turning toward voices). They may briefly track a face moving slowly in front of them. Most of their time is spent in feeding, sleeping, and processing — this is entirely appropriate.

**2 months:**
The social smile — a real, responsive smile in answer to yours — typically appears around 6–8 weeks and is one of the most significant early milestones. Your baby may begin to coo and make short vowel sounds. They are starting to distinguish your face from others.

**3 months:**
By 3 months, most babies will follow objects with their eyes, lift their head and chest during tummy time, bring their hands to their mouth, and begin to babble. They are much more alert and interactive.

**Tummy time:**
Essential for developing the neck and shoulder strength your baby needs to roll, sit, and eventually crawl. Start with 1–2 minutes a few times a day from birth (when awake and supervised) and build up gradually.

**When to mention something to your doctor:**
No social smile by 8 weeks. No response to sound by 1 month. Consistently very stiff or very floppy limbs. No eye contact by 3 months. Missing multiple milestones in a single category.

Milestones are ranges, not deadlines. One slow area does not mean developmental delay. Your instinct as a parent matters — if something feels off, raise it.`,
  },

  {
    id: 'bb-starting-solids',
    stages: ['newmom'],
    minDay: 150,
    maxDay: 300,
    tag: 'Feeding',
    readMinutes: 3,
    author: AUTHORS.funmi,
    coverEmoji: '🥣',
    coverBg: '#D8EDD8',
    coverImage: 'https://images.unsplash.com/photo-1490818387583-1d2813f7e525?auto=format&fit=crop&w=800&q=80',
    title: 'Starting solids: what you need to know',
    excerpt: 'Introducing solid foods is a milestone — and a messy one. Here\'s the evidence-based guide to doing it well.',
    body: `The WHO recommends exclusive breastfeeding or formula feeding until 6 months, followed by the gradual introduction of complementary foods alongside milk. Most babies are ready to start between 5.5–6.5 months.

**Signs of readiness:**
Your baby can sit upright with support and hold their head steady. They have lost the tongue-thrust reflex (where they automatically push food out of their mouth). They show interest in food — watching you eat, reaching toward your plate. These signs together indicate readiness. Age alone is not enough.

**First foods:**
You can start with smooth purées or soft foods suitable for baby-led weaning — or a combination of both. Good first foods include soft-cooked vegetables (sweet potato, carrot, courgette), banana, avocado, smooth nut butters mixed into purée, and well-cooked lentils. Milk remains the primary nutrition source until 12 months.

**Allergens:**
Current guidance recommends introducing the nine common allergens early and regularly, rather than delaying. These include peanuts, eggs, milk, wheat, tree nuts, sesame, fish, shellfish, and soya. Introduce one at a time and wait 2–3 days before the next new allergen.

**What to avoid:**
Honey (risk of botulism under 12 months). Salt and sugar — babies' kidneys aren't ready for added salt. Whole nuts and other choking hazards. Unpasteurised foods.

**Gagging vs. choking:**
Gagging is normal and is the body's natural safety mechanism — it's loud, baby is in control, and it passes. Choking is silent and requires immediate action. Learn the difference before you start.

Weaning is messy, slow, and not a linear process. Follow your baby's lead and keep it positive.`,
  },

  // ── PARTNER ───────────────────────────────────────────────

  {
    id: 'pt-support-pregnancy',
    stages: ['partner'],
    tag: 'Supporting Her',
    readMinutes: 4,
    author: AUTHORS.kwame,
    coverEmoji: '🤝',
    coverBg: '#D6EEFF',
    coverImage: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=800&q=80',
    title: 'How to support your partner through pregnancy',
    excerpt: 'Being present isn\'t complicated — but it is intentional. Here\'s what actually helps, trimester by trimester.',
    body: `Supporting a pregnant partner isn't about doing everything right. It's about showing up consistently, paying attention, and being willing to adapt. Pregnancy changes week by week — what your partner needs in the first trimester is different from what she needs at 36 weeks.

**First trimester (weeks 1–12):**
This is often the hardest trimester to support through — partly because it's invisible. She may look completely fine while feeling exhausted and nauseous in ways she can't fully explain. Take her at her word. Cover household tasks without being asked. Don't push her to socialise or explain herself to people. If she's not ready to share the news yet, follow her lead.

**Second trimester (weeks 13–26):**
This is often when energy returns and the pregnancy becomes more real — for both of you. Go to appointments when you can. Learn about what's happening developmentally. Read the birth plan together. This is also a good time to have honest conversations about how you'll share parenting responsibilities — those conversations are easier before the baby arrives.

**Third trimester (weeks 27–40+):**
Preparation mode. Pack the bag together. Know the route to the hospital. Make sure the car seat is fitted. Keep her comfortable — she's carrying a lot of weight in every sense. Be patient with discomfort, mood changes, and anxiety about labour. The closer to birth, the more your calm, reliable presence matters.

**What to avoid:**
Comparing her to others. Telling her to relax when she's anxious. Disappearing into work or screens during a difficult period. Giving unsolicited opinions on her body, food choices, or decisions.

You don't need to understand everything she's going through. You just need to be present for it.`,
  },

  {
    id: 'pt-birth-partner',
    stages: ['partner'],
    tag: 'Labour & Birth',
    readMinutes: 4,
    author: AUTHORS.kwame,
    coverEmoji: '🏥',
    coverBg: '#FFE8D6',
    coverImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    title: 'Being a birth partner: what to expect',
    excerpt: 'Labour is intense, unpredictable, and often long. Knowing what you\'re walking into makes you a far more useful presence in the room.',
    body: `Birth is one of the most intense experiences you will witness. Nothing fully prepares you for it — but going in with knowledge is better than going in blind.

**Before labour begins:**
Know the signs of labour and when to go to hospital. Keep the hospital bag somewhere both of you can access it quickly. Have her care team's number saved. Know the route and a backup route. Have her notes, ID, and insurance details ready.

**During early labour:**
Early labour can last hours or days. Help her stay comfortable at home as long as possible — warm baths, movement, food and fluids (labour is physical work), and distraction. Don't rush to the hospital too early unless she or the care team advises otherwise.

**What your role looks like in active labour:**
Your job is not to fix her pain — it's to help her through it. Offer physical support: counter-pressure on her lower back during contractions, helping her move positions, holding her hand or her gaze. Keep the environment calm. Be her advocate with the care team — if she's said she wants delayed cord clamping or skin-to-skin, remind them if it's not happening.

**Practical things you can do:**
Keep her hydrated. Remind her to breathe. Tell her she's doing well — and mean it. Keep your phone on and calls to a minimum. Eat something when you can — you need to sustain yourself too.

**If things don't go to plan:**
Interventions, a change in birth plan, or a caesarean can happen quickly. Your role is to stay calm. Ask questions if you're unsure. Squeeze her hand. The most important thing is that she feels safe, supported, and not alone — whatever form the birth takes.

Labour is not a performance. It doesn't have to look a certain way to go well.`,
  },

  {
    id: 'pt-fourth-trimester',
    stages: ['partner'],
    tag: 'After Birth',
    readMinutes: 4,
    author: AUTHORS.kwame,
    coverEmoji: '🌙',
    coverBg: '#D8EDD8',
    coverImage: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=800&q=80',
    title: 'The fourth trimester: your role after birth',
    excerpt: 'The weeks after birth are often the hardest of the whole journey. Here\'s what a good partner actually does — and why it matters so much.',
    body: `The fourth trimester — roughly the first 12 weeks after birth — is a period of enormous transition. Your partner is physically recovering from birth while also establishing feeding, adapting to massive hormonal shifts, and learning to care for a new human. This period sets the tone for how you both experience early parenthood.

**What she needs most:**
Rest. Genuine, uninterrupted rest. Protecting her sleep is one of the most meaningful things you can do. In the first two weeks especially, take a night feed when you can, even if she's breastfeeding — expressed milk or a formula top-up lets her sleep a full stretch.

**The home:**
She should not be worrying about the state of the house. Manage food, cleaning, laundry, visitors, and admin. This is not helping — this is your half of the partnership. Do it without being asked and without expecting thanks.

**Visitors:**
You are the gatekeeper. Well-meaning relatives and friends can be exhausting in the early weeks. Limit visits, set time boundaries, and don't be afraid to say "we're not ready for visitors yet." Your job is to protect the bubble.

**Feeding:**
If she's breastfeeding: bring water and a snack to every feed, sit with her at night feeds, and don't minimise how hard it is. If she's formula-feeding: take equal ownership of feeds. Don't make her ask.

**Emotional support:**
The baby blues peak around days 3–5 — increased tearfulness, mood swings, a feeling of being overwhelmed. This is hormonal and normal. Listen without trying to fix it. If low mood persists beyond two weeks or deepens significantly, encourage her to speak to her GP. Know the signs of postnatal depression.

**You are also adjusting:**
New parenthood is a significant identity shift for you too. It's okay to find it hard. It's okay to feel disconnected at first. Talk to someone — a friend, your GP, a community of other parents. Your wellbeing matters too.`,
  },

  {
    id: 'pt-recognising-pnd',
    stages: ['partner'],
    tag: 'Mental Health',
    readMinutes: 4,
    author: AUTHORS.chioma,
    coverEmoji: '💙',
    coverBg: '#D6EEFF',
    coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    title: 'Recognising postnatal depression — in her, and in yourself',
    excerpt: 'PND affects 1 in 10 new mothers — and up to 1 in 10 fathers. Knowing what to look for could make all the difference.',
    body: `Postnatal depression (PND) is one of the most common complications of childbirth and one of the most underdiagnosed. As a partner, you are often better placed to notice changes in your partner than she is to recognise them in herself.

**The difference between baby blues and PND:**
Baby blues — tearfulness, mood swings, feeling overwhelmed — are common in the first week and usually resolve by day 10–14. They are hormonal and temporary. PND is different: it persists beyond two weeks, deepens over time, and affects a woman's ability to function and feel connected.

**Signs of PND to watch for:**
Persistent low mood that doesn't lift — not just bad days. Withdrawal from the baby or difficulty bonding. Loss of interest in things she used to enjoy. Constant anxiety or panic, often about the baby's safety. Difficulty sleeping even when the baby sleeps. Feelings of worthlessness, hopelessness, or that the baby would be better off without her. Intrusive thoughts.

**What to do:**
Don't minimise or tell her it will pass. Don't compare her to other mothers. Tell her what you're noticing — calmly and without judgment. Offer to come with her to the GP. If she's resistant, contact her health visitor yourself. In a crisis — if she expresses thoughts of harming herself or the baby — go to A&E.

**Paternal postnatal depression:**
Up to 10% of fathers experience PND. It often presents differently — not as tearfulness but as irritability, withdrawal, increased alcohol use, working excessively, or feeling detached from the family. If you've felt this way for more than two weeks, speak to your GP. This is not weakness. This is a medical condition with effective treatments.

**Getting help early matters:**
The sooner PND is identified and supported — with therapy, medication, or both — the faster recovery tends to be. You don't have to be in crisis to ask for help.`,
  },

  {
    id: 'pt-bonding',
    stages: ['partner'],
    tag: 'Your Baby',
    readMinutes: 3,
    author: AUTHORS.kwame,
    coverEmoji: '👶',
    coverBg: '#FEF0C7',
    coverImage: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=800&q=80',
    title: 'Bonding with your newborn: it\'s not always instant',
    excerpt: 'The rush of love you\'re "supposed to feel" doesn\'t always arrive on schedule. Here\'s what bonding actually looks like for partners.',
    body: `Films and social media suggest that the moment a father holds their newborn, an overwhelming rush of love arrives immediately. For many partners, this is not the experience. Bonding often develops more gradually — and that is completely normal.

**Why bonding takes time:**
Biologically, the birthing parent has a nine-month head start. She has felt the baby move, experienced the hormonal cascade of birth, and often has breastfeeding as a regular point of physical connection. Partners often describe feeling like a spectator in the early weeks — there to support but less certain of their own role.

**What actually builds the bond:**
Skin-to-skin contact. Holding your baby on your bare chest — not just occasionally but regularly — releases oxytocin for both of you. It regulates your baby's temperature, heartbeat, and stress hormones, and it creates a real sense of connection over time.

Taking on feeds. Whether by bottle, expressed milk, or formula, feeding is a sustained period of close physical contact, eye contact, and response. It builds familiarity rapidly.

Nappy changes. Not glamorous, but they are direct, repeated contact with your baby's body. Your voice and smell become familiar to your baby through these daily interactions.

Talking and singing. Your baby has been hearing your voice since the second trimester. Talking to them — even when it feels odd — is a form of bonding that works faster than you'd expect.

**If you feel nothing at first:**
This is more common than it's talked about. It doesn't mean you're a bad parent or that something is wrong with you. Keep showing up, keep engaging physically, and give it time. If after several weeks you still feel nothing and it's affecting your wellbeing, speak to your GP — it may be an early sign of paternal postnatal depression.

Bonding is a process, not a moment. It grows with presence.`,
  },

  {
    id: 'pt-your-mental-health',
    stages: ['partner'],
    tag: 'Mental Health',
    readMinutes: 3,
    author: AUTHORS.chioma,
    coverEmoji: '🧘',
    coverBg: '#FFE8D6',
    coverImage: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80',
    title: 'Your mental health as a new parent matters too',
    excerpt: 'Partners are often so focused on supporting others that their own wellbeing goes unexamined. This is your reminder that it counts.',
    body: `New parenthood is talked about as a joyful transformation — and it often is. But it also involves significant loss: sleep, identity, freedom, the relationship you had before. Partners frequently absorb their own adjustment while focusing entirely on supporting the birthing parent. This approach is unsustainable, and it often quietly breaks people.

**What you might be feeling:**
Exhaustion that goes beyond tired. A sense of disconnection from your partner, your baby, or your previous self. Anxiety about providing, protecting, or "doing it right." Irritability that you don't recognise in yourself. A low-grade sadness you're not sure how to name. All of these are common. None of them make you a bad partner or parent.

**Why partners often don't seek help:**
The cultural narrative around partners — particularly fathers — emphasises stoicism and support. There is often no script for saying "I'm not okay" when your role is to be the stable one. This leads to suffering that stays invisible, and then erupts in ways that affect the whole family.

**What helps:**
Connection with other parents who are going through the same thing. Even a brief conversation with someone who gets it reduces isolation significantly. Regular physical activity — even a 20-minute walk — has measurable effects on mood. Time that is genuinely yours, not "I'll sneak out for an hour when no one notices." Your need for rest and recovery is not optional.

**When to seek professional support:**
If you've felt persistently low, anxious, irritable, or disconnected for more than two weeks — speak to your GP. This applies to you even if your partner is the one who just gave birth. You are a patient too. Paternal postnatal depression is well recognised and very treatable.

Looking after yourself is not a luxury. It's what makes sustained, present parenting possible.`,
  },

  // ── TTC ───────────────────────────────────────────────────

  {
    id: 'ttc-fertile-window',
    stages: ['ttc'],
    tag: 'Fertility',
    readMinutes: 3,
    author: AUTHORS.adaeze,
    coverEmoji: '🌱',
    coverBg: '#D8EDD8',
    coverImage: 'https://images.unsplash.com/photo-1535982360835-9621759040a9?auto=format&fit=crop&w=800&q=80',
    title: 'Understanding your fertile window',
    excerpt: 'You can only conceive on a few days each cycle. Knowing when those days are is the most practical thing you can do.',
    body: `The fertile window is the period each cycle when conception is possible. Sperm can survive in the reproductive tract for up to 5 days, and the egg is viable for 12–24 hours after ovulation. This gives a window of roughly 6 days per cycle — the 5 days before ovulation and ovulation day itself.

**When do you ovulate?**
In a textbook 28-day cycle, ovulation happens around day 14. But cycles vary widely, and even within the same person, ovulation doesn't always happen at the same time. If your cycle is consistently longer or shorter than 28 days, your ovulation date shifts accordingly.

**How to identify your ovulation:**
Basal body temperature (BBT) rises by 0.2–0.5°C after ovulation. Tracking this daily (before you get out of bed, with a precise thermometer) reveals your pattern over 2–3 months. Ovulation predictor kits (OPKs) detect the LH surge that happens 24–36 hours before ovulation — these are more useful for timing intercourse than BBT, which confirms ovulation has already happened. Cervical mucus changes are another reliable sign: in the days leading up to ovulation, it becomes clearer, more slippery, and stretchy — similar in consistency to raw egg white.

**The practical recommendation:**
Regular sex every 2–3 days throughout your cycle means you'll never miss your window, regardless of cycle variation. If you prefer to time more precisely, focus on the 3 days before and including your predicted ovulation day.

**A note on stress:**
Obsessing over timing can add stress to a process that already carries a lot of emotional weight. A sustainable approach — one that doesn't make sex feel like a medical procedure — is better for you and often just as effective.`,
  },

  {
    id: 'ttc-nutrition',
    stages: ['ttc'],
    tag: 'Nutrition',
    readMinutes: 4,
    author: AUTHORS.adaeze,
    coverEmoji: '🥗',
    coverBg: '#D8EDD8',
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    title: 'Nutrition and fertility: what the evidence says',
    excerpt: 'You don\'t need a special "fertility diet" — but some evidence-backed adjustments can support your body\'s readiness for pregnancy.',
    body: `The internet is full of "fertility superfoods" and restrictive plans. Most aren't supported by evidence. What is supported: a varied, balanced diet with a few specific additions makes a meaningful difference.

**Folic acid is non-negotiable:**
400mcg daily of folic acid should be started at least 3 months before trying to conceive. It dramatically reduces the risk of neural tube defects (like spina bifida) in early pregnancy. This is the single most evidence-backed nutritional intervention in the preconception period. Start today if you haven't already.

**What a fertility-supportive diet looks like:**
It looks like a Mediterranean-style diet: plenty of vegetables, legumes, whole grains, nuts, seeds, olive oil, and moderate amounts of oily fish, eggs, and poultry. Lower amounts of ultra-processed foods, refined carbohydrates, and sugary drinks are associated with better fertility outcomes in both women and men.

**Iron:**
Iron deficiency is common and can affect ovulation. Good sources include lentils, beans, dark leafy greens, fortified cereals, and lean red meat. Pair plant-based iron sources with vitamin C for better absorption.

**Iodine:**
Important for thyroid function and early fetal development. Found in dairy, eggs, fish, and seafood. Many prenatal supplements include iodine — check your label.

**Alcohol:**
Current guidance is to avoid alcohol when trying to conceive. The evidence for moderate drinking is mixed but uncertain enough that abstinence is the safest approach.

**Caffeine:**
Up to 200mg/day (roughly one strong coffee) is considered safe. Evidence for impact below this level is limited.

**Weight:**
Both underweight and overweight can affect ovulation and cycle regularity. If your BMI is below 18.5 or above 30, discussing this with your GP before conception is worthwhile — it's not about aesthetics, it's about supporting your body's hormonal function.`,
  },

  {
    id: 'ttc-mental-health',
    stages: ['ttc'],
    tag: 'Mental Health',
    readMinutes: 3,
    author: AUTHORS.chioma,
    coverEmoji: '🧘',
    coverBg: '#FFE0EA',
    coverImage: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80',
    title: 'The emotional weight of trying to conceive',
    excerpt: 'TTC can be one of the most emotionally complex experiences of your life. Here\'s how to take care of yourself through it.',
    body: `Trying to conceive often starts with optimism and becomes, month by month, one of the most emotionally demanding experiences a person can go through. If you're finding it harder than you expected — that is not weakness. It's an appropriate response to something genuinely hard.

**The two-week wait:**
The period between ovulation and when you can test is often described as the most difficult part of the cycle. Anxiety, hyper-awareness of body sensations, hope, and bracing for disappointment can all coexist in the same two weeks. There's no trick to making it easy — but having something to direct your attention toward helps.

**Managing the emotional load:**
Track only what's useful, not everything that can be tracked. Obsessive monitoring can amplify anxiety without improving your outcomes. Set yourself one or two data points to follow rather than measuring every possible variable.

Limit Google deep-dives. The internet will always return a worst-case scenario, and it's very hard to stop once you start. Choose reliable sources (your GP, reputable medical sites) and close the tab.

Protect your relationship. Fertility challenges put significant strain on couples. Keep space in your conversations for things that aren't TTC-related. Intimacy that only happens on ovulation days stops feeling like intimacy.

**When to seek support:**
If you've been trying for 12 months without success (or 6 months if you're over 35), speak to your GP — they can arrange initial investigations. But also: if this is affecting your mental health significantly, seek support for that independently of the physical investigation. These are separate needs.

**Community:**
Other people who are going through the same thing can be a powerful source of normalisation. TTC communities — in person or online — often offer more realistic insight than any medical article.`,
  },

  {
    id: 'ttc-when-to-seek-help',
    stages: ['ttc'],
    tag: 'Fertility',
    readMinutes: 3,
    author: AUTHORS.amara,
    coverEmoji: '🩺',
    coverBg: '#D6EEFF',
    coverImage: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=800&q=80',
    title: 'When to see a doctor about fertility',
    excerpt: 'Most couples conceive within a year. But there are clear signs that earlier investigation makes sense — for both partners.',
    body: `About 84% of couples conceive within a year of trying regularly (every 2–3 days). By two years, this rises to over 90%. The decision about when to seek medical advice isn't about giving up — it's about using available information to support you.

**Standard guidance:**
See your GP if you've been trying for 12 months without conceiving. If you're 35 or older, that window shortens to 6 months. These aren't absolute rules — they're starting points for a conversation.

**Seek earlier investigation if:**
You have irregular periods or periods that are very long, very short, or absent. You've been diagnosed with endometriosis, PCOS, thyroid conditions, or had a previous ectopic pregnancy or pelvic inflammatory disease. You've had previous surgery on your reproductive organs. Your partner has had fertility testing before or has known concerns.

**What initial tests involve:**
For women: blood tests to check ovulation (day 2–5 FSH/LH/oestradiol, day 21 progesterone), thyroid function, rubella immunity, and a referral for a pelvic ultrasound. For men: a semen analysis. Both partners are assessed — male factor is involved in around 40% of fertility challenges.

**What to ask for:**
Be direct with your GP. Ask specifically for a fertility referral if you meet the criteria. Many people find they need to advocate for themselves at this stage — bring notes, be clear about how long you've been trying, and don't minimise.

The earlier issues are identified, the more options there are. Seeking help is not giving up — it's information-gathering.`,
  },
];

/**
 * Returns articles relevant to the user's current stage and timeline position.
 * Prioritises articles whose week/day range best matches the current position.
 */
export function getArticlesForUser(
  stage: UserStage,
  currentWeek: number = 0,
  currentDay: number = 0,
): Article[] {
  const stageArticles = articles.filter(a => a.stages.includes(stage));

  const scored = stageArticles.map(a => {
    let score = 0;
    if (stage === 'pregnancy') {
      const inRange = (a.minWeek == null || currentWeek >= a.minWeek) &&
                      (a.maxWeek == null || currentWeek <= a.maxWeek);
      score = inRange ? 2 : 1;
    } else if (stage === 'newmom') {
      const inRange = (a.minDay == null || currentDay >= a.minDay) &&
                      (a.maxDay == null || currentDay <= a.maxDay);
      score = inRange ? 2 : 1;
    } else {
      score = 1;
    }
    return { article: a, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(s => s.article);
}
