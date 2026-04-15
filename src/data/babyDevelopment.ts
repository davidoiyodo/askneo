export interface DevelopmentInfo {
  emoji: string;
  headline: string;
  detail: string;
  babySection: string;
  motherSection: string;
  tip?: string;
}

export const PREGNANCY_MILESTONES: Record<number, DevelopmentInfo> = {
  4: {
    emoji: "🌱",
    headline: "Tiny as a poppy seed",
    detail: "The neural tube — future brain and spine — is forming.",
    babySection:
      "Your embryo has just implanted into the uterine wall. The amniotic sac and yolk sac are forming to nourish and protect this tiny life. The neural tube — which will become the brain and spinal cord — is beginning to close. At just 2mm, baby is smaller than a poppy seed, but every system that will ever exist in their body is being laid down right now.",
    motherSection:
      "You may not feel any different yet, but your body is working overtime. Rising hCG levels are signalling your ovaries to stop releasing eggs. A missed period is often the first clue. Some women notice light implantation spotting around this time. Now is a great time to start prenatal vitamins if you haven't already, and to schedule your first antenatal appointment.",
    tip: "Folic acid is most critical in these early weeks to protect the neural tube. If you haven't started, speak to your doctor today.",
  },
  5: {
    emoji: "💓",
    headline: "Heart has started beating",
    detail: "A tiny, fluttering heartbeat begins.",
    babySection:
      "Baby's heart has started beating — a tiny flutter of about 80–85 beats per minute. The neural tube is closing at both ends. Tiny arm and leg buds are beginning to appear. The embryo is still just 4–5mm long, but the foundations of every major organ — heart, brain, lungs, kidneys — are all laying down simultaneously this week.",
    motherSection:
      "Morning sickness can hit hard this week as hCG surges to its peak. Nausea, fatigue, and sore, swollen breasts are all very common. Frequent urination may also begin as blood flow to the kidneys increases. If nausea is severe, try small, frequent meals and speak to your provider about safe remedies.",
    tip: "Many women feel the most sick between weeks 6–10. Ginger tea, dry crackers, and eating before getting out of bed can help.",
  },
  6: {
    emoji: "🧠",
    headline: "Brain forming rapidly",
    detail: "Brain and spinal cord development is accelerating fast.",
    babySection:
      "The brain is dividing into its five distinct regions and the spinal cord is taking shape. Tiny facial features — the beginnings of eyes, a nose, and a mouth — are becoming visible. The heart now has four chambers and is beating between 100–160 beats per minute. Baby's size has doubled since last week — now around 6mm.",
    motherSection:
      "Your uterus is now roughly the size of a plum and pressing on your bladder. Mood swings are completely normal as progesterone and oestrogen fluctuate. Many women feel their first wave of food aversions this week — smells that were once pleasant can suddenly feel unbearable. Rest as much as you need to.",
  },
  7: {
    emoji: "🫁",
    headline: "Arm & leg buds appear",
    detail: "Tiny limb buds are sprouting this week.",
    babySection:
      "Distinct hand and foot plates have formed where fingers and toes will eventually separate. The eyes are now covered by developing eyelids. The digestive system is forming, with the intestines beginning to lengthen. Baby is now about 10mm — roughly the size of a blueberry — and moving, though you won't feel it yet.",
    motherSection:
      "Your uterus has nearly doubled in size. Fatigue may feel extreme — your body is building a placenta from scratch, which is enormous work. Saliva production often increases, which can worsen nausea. Be patient with yourself; this phase is temporary and things typically ease in the second trimester.",
    tip: "It's normal to feel exhausted in the first trimester. Your body is doing the equivalent of running a marathon while you rest.",
  },
  8: {
    emoji: "🐣",
    headline: "All organs are forming",
    detail: "Major organs are all taking shape simultaneously.",
    babySection:
      "Every single organ your baby will ever have is now forming. Baby has moved from an embryo to a fetus this week. Fingers and toes are webbed but present. The facial features are becoming more distinct — tiny nostrils, a forming upper lip. Baby is about 16mm — the size of a raspberry — and already making small, jerky movements.",
    motherSection:
      "Your waistline is beginning to thicken, even if your bump isn't showing yet. Food aversions and strong smell sensitivities are very common. Heartburn may also begin as pregnancy hormones relax the valve between the stomach and oesophagus. Some women begin to show at this stage, especially if this isn't their first pregnancy.",
  },
  9: {
    emoji: "👃",
    headline: "Facial features taking shape",
    detail: "Nose, mouth, and eyelids are becoming distinct.",
    babySection:
      "Baby's face is becoming unmistakably human. Eyelids are forming and will remain fused shut until around week 26. The nose, upper lip, and ears are all taking their final shape. Cartilage and bone are beginning to form throughout the skeleton. Baby is now around 23mm — the size of a grape.",
    motherSection:
      "Bloating and constipation are very common as progesterone slows your digestive system. You may also be experiencing headaches, dizziness, or mood swings. If you haven't had your first ultrasound yet, it's often scheduled around weeks 8–12. Seeing your baby's heartbeat on screen can make everything feel very real.",
    tip: "Staying hydrated and adding fibre-rich foods like fruits and vegetables can help with first trimester constipation.",
  },
  10: {
    emoji: "🦷",
    headline: "Tooth buds forming",
    detail: "Baby's 20 primary teeth are already in the gums.",
    babySection:
      "All 20 primary (baby) teeth are now forming beneath the gum line. Fingernails are beginning to grow. The vital organs — heart, kidneys, intestines, brain — are all formed and beginning to function. Baby can now spontaneously open and close their hands. At around 31mm, baby is the size of a strawberry.",
    motherSection:
      "The risk of miscarriage drops significantly after week 10, as the most critical period of development is complete. Round ligament pain — a sharp or dull ache in your lower abdomen — may start as your uterus expands. Your breasts are likely a full cup size larger than before pregnancy. Many couples share their news around this time.",
  },
  11: {
    emoji: "🤌",
    headline: "Fingers separating",
    detail: "Tiny fingers and toes are losing their webbing.",
    babySection:
      "Baby's fingers and toes are fully separate now. The hands can open and close into fists. Taste buds are forming on the tongue. The diaphragm — the muscle used for breathing — is taking shape. Baby's head is still very large relative to the body, making up nearly half the total length. At around 41mm, baby is the size of a lime.",
    motherSection:
      "Nausea and fatigue may begin to ease for some women this week, though for others symptoms continue into the second trimester. Your uterus has risen out of the pelvis and can be felt just above the pubic bone. Your midwife or doctor may be able to hear baby's heartbeat on a Doppler at this visit.",
    tip: "Week 11–13 is typically when the nuchal translucency (NT) scan and first trimester screening are done to assess chromosomal risk.",
  },
  12: {
    emoji: "🧠",
    headline: "Reflexes developing",
    detail: "Baby can now curl fingers, open and close mouth.",
    babySection:
      "Baby's reflexes are kicking in — fingers curl, toes curl, eyes squint. The kidneys are producing urine, which passes into the amniotic fluid. The brain is sending signals and the digestive system is practising contractions. Baby is now around 53mm — the size of a plum. The most critical structural development is complete.",
    motherSection:
      "Many women feel a shift this week — nausea begins to lift and energy starts to return. This is also the week many couples choose to announce their pregnancy after the risk of miscarriage significantly drops. Your belly may begin to pop, especially in the evenings. Maternity clothes may soon be more comfortable.",
  },
  13: {
    emoji: "🫀",
    headline: "Heartbeat on Doppler",
    detail: "You can now hear it clearly at your appointment.",
    babySection:
      "Baby's vocal cords are forming. Fingerprints are becoming unique to your baby alone. The intestines, which had protruded into the umbilical cord, are moving into the abdomen as there's now space for them. Baby is around 73mm — the size of a peach — and starting to look like a miniature person.",
    motherSection:
      "Welcome to the second trimester — often called the golden trimester. For many women, energy returns and nausea fades. Your blood volume has increased significantly, which can cause some women to feel warmer than usual. Skin changes like a pregnancy glow (or breakouts!) are common as blood circulation increases.",
    tip: "The second trimester is a great time to start gentle pregnancy-safe exercise if you haven't already — it supports mood, sleep, and labour preparation.",
  },
  14: {
    emoji: "👁️",
    headline: "Eyes moving into place",
    detail: "Eyes shift from the sides to the front of baby's face.",
    babySection:
      "Baby's eyes have moved from the sides of the head to the front, giving baby a much more recognisable face. The roof of the mouth is closing. Baby's body is now growing faster than the head, so proportions are becoming more balanced. Lanugo — a fine, downy hair — is beginning to cover the body to help regulate temperature. Baby is around 85mm.",
    motherSection:
      "Your appetite has very likely returned — and then some. This is a good time to focus on nutrient-dense foods including calcium, iron, and protein. Some women notice their libido returning as energy improves. Round ligament pain may continue as the uterus grows. Enjoy this trimester — many women feel their best during weeks 13–27.",
  },
  15: {
    emoji: "🦴",
    headline: "Bones hardening",
    detail: "Cartilage is slowly turning into real bone.",
    babySection:
      "Baby's skeleton, which was entirely cartilage, is now slowly calcifying into bone. You can see individual bones forming on ultrasound. Baby's hair pattern on the scalp is established. Baby can sense light through the closed eyelids — if you shine a torch at your belly, baby may respond. At around 100mm, baby is the size of an apple.",
    motherSection:
      "Your uterus continues to grow upward and may be visible below your belly button. Some women experience back pain as their centre of gravity shifts. Nosebleeds and congestion are common due to increased blood flow and hormone changes. This is often a good week to have conversations about birth preferences with your midwife.",
    tip: "This is a good time to start sleeping on your left side if you haven't already, as it optimises blood flow to the placenta.",
  },
  16: {
    emoji: "👂",
    headline: "Baby can hear you",
    detail: "Sound waves reach the womb — your voice is familiar.",
    babySection:
      "Baby's ears are now in their final position and the auditory system is working. Sound waves can travel through the amniotic fluid, meaning your voice, heartbeat, and digestive sounds are baby's world. Baby is also beginning to make facial expressions — frowning, squinting, and grimacing. At around 115mm, baby is the size of an avocado.",
    motherSection:
      "Your bump is now visible to most people. Backaches are becoming more common — supportive footwear and gentle stretching can help. Many women begin to feel baby's movements (quickening) between weeks 16–22, often described as flutters, bubbles, or a fish swimming. If this is your second pregnancy, you may already be feeling them.",
  },
  17: {
    emoji: "💤",
    headline: "REM sleep forming",
    detail: "Baby may already be dreaming inside the womb.",
    babySection:
      "Fat deposits are beginning to form beneath the skin, helping with temperature regulation and energy storage. Baby's swallowing and sucking reflexes are practising. The umbilical cord is growing thicker and stronger. REM sleep patterns have been detected in babies at this stage — it's possible baby is already dreaming. Baby is around 13cm — the size of a pear.",
    motherSection:
      "Backache and round ligament pain may be more noticeable this week. Some women experience a phenomenon called pregnancy brain — forgetfulness and difficulty concentrating, which is a real hormonal effect. Your nails and hair may be growing faster due to pregnancy hormones. Make sure your diet includes enough iron to support your increased blood volume.",
  },
  18: {
    emoji: "🤸",
    headline: "Those first kicks",
    detail: "You may start feeling flutters and gentle movements.",
    babySection:
      "Baby is moving constantly — stretching, rolling, yawning, and hiccupping. Their hearing is well developed and they may respond to loud sounds with a kick. The nervous system is maturing rapidly, with millions of motor neurons forming. Baby's unique fingerprints are fully formed this week. At around 14.2cm, baby is the size of a sweet potato.",
    motherSection:
      "This is often the week first-time mothers begin to feel those first flutters — a sensation some describe as popcorn popping or gentle tapping. Your anatomy scan (often called the 20-week scan) may be scheduled around this time. You may also notice your feet growing slightly as relaxin loosens joints throughout your body.",
    tip: "The anatomy scan checks all major organs and body structures, and many parents find out baby's sex at this appointment if they choose.",
  },
  19: {
    emoji: "🌙",
    headline: "Sleep cycles forming",
    detail: "Baby has regular wake and sleep patterns now.",
    babySection:
      "Vernix caseosa — a white, waxy protective coating — is now covering baby's skin, shielding it from the amniotic fluid. Baby has established regular sleep and wake cycles, and you may start to notice patterns in their movements. The senses of touch, taste, smell, and hearing are all developing. Baby is around 15.3cm — the size of a mango.",
    motherSection:
      "Skin changes are very common now — you may notice a darkening of the skin around the nipples, and the linea nigra — a dark vertical line down the abdomen — may appear. Stretch marks may begin to show on the belly, breasts, or thighs. Keeping skin moisturised won't prevent stretch marks, but it can reduce itching as skin stretches.",
  },
  20: {
    emoji: "🎉",
    headline: "Halfway there!",
    detail: "Baby is about 10 inches long — you're at the midpoint.",
    babySection:
      "You've reached the halfway mark! Baby is now around 16.4cm from head to toe and weighing in at about 300g. The digestive system is practising by swallowing amniotic fluid, which passes through the kidneys and back into the fluid as urine. Baby's taste buds can detect flavours in the amniotic fluid — whatever you eat, they taste too.",
    motherSection:
      "Your anatomy scan is typically performed around this week, giving a detailed look at all of baby's organs and structures. Your uterus is now level with your belly button. Aches, pressure, and Braxton Hicks practice contractions may begin. Swelling in your feet and ankles may also start — elevating your feet when sitting can help.",
    tip: "Research shows babies can develop flavour preferences based on what their mother eats during pregnancy. A varied diet now may help with feeding later.",
  },
  21: {
    emoji: "🦵",
    headline: "Kicks getting stronger",
    detail: "Movement is growing more coordinated and powerful.",
    babySection:
      "Baby's movements are becoming stronger and more coordinated — you should be feeling them regularly now. Eyebrows and eyelids are now fully formed. The lips are fully defined and baby is practising sucking. Baby can also hear music, and some research suggests babies can remember sounds heard in the womb after birth. Baby is around 26.7cm and weighing about 360g.",
    motherSection:
      "If you haven't already, now is a great time to start thinking about a birth plan and prenatal classes. Leg cramps, particularly at night, are very common in the second half of pregnancy — staying hydrated and doing gentle calf stretches before bed can help. You may also notice Braxton Hicks contractions — irregular, painless tightenings that are simply your uterus preparing.",
  },
  22: {
    emoji: "🧬",
    headline: "Senses sharpening",
    detail: "Touch, taste, sight, and hearing are all developing.",
    babySection:
      "All five of baby's senses are now developing. The inner ear is fully formed, meaning baby can sense movement and balance. Melanin — the pigment that determines skin and hair colour — is being produced. Baby is growing eyebrows and a little hair on the scalp. At around 27.8cm and 430g, baby looks like a miniature newborn.",
    motherSection:
      "Stretch marks may become more visible this week. Your back and hips may ache more as the pregnancy hormone relaxin continues to loosen your joints. Haemorrhoids — swollen veins in the rectum — are a common pregnancy complaint; increasing fibre and staying hydrated can help. Your belly button may begin to pop outward.",
    tip: "Now is a great time to read or sing to your baby — they can hear you clearly and research shows familiarity with your voice has calming effects after birth.",
  },
  23: {
    emoji: "🩸",
    headline: "Lungs building vessels",
    detail: "Blood vessels in the lungs are growing for future breathing.",
    babySection:
      "Blood vessels are forming in the lungs in preparation for breathing after birth. Baby is beginning to look more like a newborn, with skin that is still translucent but rapidly developing. Baby's lips, mouth, and nostrils are all clearly defined. At around 28.9cm and about 500g, baby has crossed the half-kilogram milestone.",
    motherSection:
      "You may feel noticeably more short of breath this week as your expanding uterus pushes up against your diaphragm. Ankle and foot swelling is common — remove jewellery and opt for comfortable footwear. Sleeping may be getting more difficult; a pregnancy pillow can help support your growing bump.",
  },
  24: {
    emoji: "💨",
    headline: "Lungs preparing for air",
    detail: "Surfactant production begins — key for breathing at birth.",
    babySection:
      "Baby's lungs are producing surfactant — a substance that prevents the tiny air sacs from collapsing when baby takes their first breath. This is a major developmental milestone. The inner ear is fully functional, and baby may startle at sudden loud sounds. Baby is now considered viable at 30cm and around 600g.",
    motherSection:
      "Gestational diabetes screening is typically done around weeks 24–28. This involves a glucose challenge test to check how your body is processing sugar. Heartburn and indigestion are very common — small, frequent meals and avoiding lying down after eating can help. Your feet may have grown a half size or more due to relaxin.",
    tip: "Week 24 is often referred to as the viability milestone — a deeply reassuring point for many parents.",
  },
  25: {
    emoji: "🧴",
    headline: "Skin smoothing out",
    detail: "Fat deposits are plumping up and smoothing the skin.",
    babySection:
      "Fat is accumulating beneath baby's skin, smoothing out the previously wrinkled appearance and helping to regulate temperature after birth. Baby's skin is turning from translucent to opaque and pinkish. The nostrils, which were plugged, have now opened. Baby is around 34.6cm and weighing about 660g — and kicks are very strong now.",
    motherSection:
      "Braxton Hicks contractions may be more frequent and noticeable. Pelvic girdle pain is common at this stage — a physiotherapist referral can be very helpful. Your appetite may be very large; focus on nutrient-dense foods rather than empty calories. You may also notice increased vaginal discharge, which is normal as long as it has no unusual colour, smell, or itching.",
  },
  26: {
    emoji: "👀",
    headline: "Eyes can open",
    detail: "Baby's eyelids can now open and close.",
    babySection:
      "Baby's eyelids have finally opened, and baby can now blink. Eyes are fully formed, though iris pigmentation won't fully develop until a few months after birth — most babies are born with blue or grey eyes that may change. Baby is also practising breathing movements using amniotic fluid. At around 35.6cm and 760g, baby's movements are powerful and frequent.",
    motherSection:
      "You're now entering the third trimester in just a couple of weeks. Many women feel a resurgence of fatigue as carrying a growing baby becomes more physically demanding. Sleep can be difficult — try lying on your left side with a pillow between your knees. Your belly may be itchy as the skin stretches; moisture-rich lotions can help.",
    tip: "This is a good time to start researching and purchasing essential baby gear and setting up the nursery, as the weeks ahead will go quickly.",
  },
  27: {
    emoji: "🛡️",
    headline: "Immune system building",
    detail: "Baby is receiving antibodies from you through the placenta.",
    babySection:
      "Your antibodies are being transferred to baby through the placenta, helping to build their immune system for life outside the womb. Baby's brain is becoming more active. Hiccupping — which you may feel as rhythmic twitches — is common as baby's diaphragm practises. Baby is around 36.6cm and weighing about 875g.",
    motherSection:
      "Welcome to the third trimester! Fatigue and discomfort often increase as baby grows. Shortness of breath, heartburn, and frequent urination are all back in full force. If you haven't already, now is the time to finalise your birth preferences and hospital bag. Your healthcare provider will also begin discussing Group B Strep testing and kick counts.",
  },
  28: {
    emoji: "🧪",
    headline: "Brain activity surging",
    detail: "Billions of neural connections are forming this trimester.",
    babySection:
      "Baby's brain is now developed enough to regulate breathing and body temperature. Billions of neurons are forming and connecting at a remarkable rate. Baby may have preferences — for your voice, certain songs, or sleep positions. At around 37.6cm and 1kg, baby has crossed the one-kilogram milestone.",
    motherSection:
      "The third trimester brings a new level of physical challenge. Back pain, leg cramps, swollen ankles, and fatigue are all common. You may also notice colostrum — the first milk — beginning to leak from your breasts. Your healthcare provider will likely want to see you more frequently now. Begin tracking baby's kick counts as recommended.",
    tip: "Monitoring fetal movement is important in the third trimester. Contact your care provider immediately if you notice a significant decrease in baby's movements.",
  },
  29: {
    emoji: "🦴",
    headline: "Skeleton complete",
    detail: "All bones are present — now hardening and strengthening.",
    babySection:
      "All of baby's bones are present and continuing to harden and strengthen. Baby is also adding more fat deposits, filling out and looking more like the baby you'll meet at birth. The muscles are growing stronger with each kick. At around 38.6cm and about 1.15kg, baby is running out of space but finding creative ways to move.",
    motherSection:
      "You may be feeling the baby pressing on your bladder again, making bathroom trips very frequent. Pelvic pressure is also common as baby settles lower. If you're working, now is a good time to plan your maternity leave handover. Practice your breathing techniques and make sure your support person is prepared for labour.",
  },
  30: {
    emoji: "🧠",
    headline: "Rapid brain growth",
    detail: "Brain volume is growing quickly with new folds forming.",
    babySection:
      "Baby's brain is growing at its fastest rate, adding new surface folds that increase its complexity and processing capacity. Baby is producing red blood cells independently in the bone marrow. The digestive system is practising but won't function fully until after birth. At around 39.9cm and 1.3kg, baby is the size of a large cabbage.",
    motherSection:
      "The nesting instinct — an urge to clean, organise, and prepare — often kicks in strongly around this stage. Embrace it, but don't overdo it physically. Heartburn, indigestion, and shortness of breath are common as the uterus pushes up against your organs. Make sure your hospital bag is packed and your birth support team is briefed.",
  },
  31: {
    emoji: "💪",
    headline: "Baby gaining muscle",
    detail: "Muscles are strengthening with daily kicks and stretches.",
    babySection:
      "Baby is gaining weight rapidly — around 220g per week — and the muscles are growing stronger with every movement. The lungs are nearly fully developed. Most of the lanugo fine body hair is beginning to shed. At around 41.1cm and about 1.5kg, baby is the size of a pineapple and their kicks can be felt from the outside of your belly.",
    motherSection:
      "Colostrum may be leaking from your breasts as your body prepares to feed your newborn. Braxton Hicks may feel more intense and frequent. You may be experiencing vivid, unusual pregnancy dreams — this is very common and linked to hormonal changes and heightened emotional awareness. Continue monitoring fetal movements.",
    tip: "You can begin practising perineal massage from around week 34 to help prepare the tissues for birth — ask your midwife for guidance.",
  },
  32: {
    emoji: "👶",
    headline: "Practice breathing",
    detail: "Baby rehearses breathing movements with amniotic fluid.",
    babySection:
      "Baby is rehearsing breathing by inhaling and exhaling amniotic fluid, strengthening the lungs for the real thing. Toenails are now fully grown. If baby is not already head-down, there's still time to turn. Baby's immune system is continuing to strengthen thanks to antibodies from you. At around 42.4cm and 1.7kg, baby is the size of a squash.",
    motherSection:
      "Antenatal appointments are now likely every two weeks. The discomfort of carrying a growing baby is very real — aches in the lower back, pelvis, and hips are common. Make sure you're getting enough rest. This is a wonderful time to write a letter to your baby, capture photos of your bump, and enjoy the final weeks of pregnancy.",
  },
  33: {
    emoji: "🌟",
    headline: "Nearly ready",
    detail: "Brain and lungs are maturing rapidly this week.",
    babySection:
      "Baby's brain and lungs are maturing rapidly. The skull bones remain soft and slightly separate — called fontanelles — which is intentional, allowing the head to compress slightly during birth then round out in the first days after. Baby is coordinating sucking, swallowing, and breathing — all essential newborn skills. At around 43.7cm and about 1.9kg.",
    motherSection:
      "Sleep may be increasingly difficult. Finding a comfortable position with a pregnancy pillow, and getting up slowly to avoid dizziness, can help. Your provider will discuss your birth plan in more detail at upcoming visits. If you're planning on breastfeeding, attending a breastfeeding class or speaking to a lactation consultant now can be invaluable.",
  },
  34: {
    emoji: "🛌",
    headline: "Settling head-down",
    detail: "Baby may be moving into birth position now.",
    babySection:
      "Most babies have moved into a head-down position by now in preparation for birth. Baby's fingernails have grown to the fingertips. The central nervous system is maturing. Fat layers are making baby's skin smooth and plump. At around 45cm and about 2.1kg, the vast majority of development is now complete — the remaining weeks are largely about growing and gaining weight.",
    motherSection:
      "As baby drops lower into the pelvis — called lightening or engagement — you may feel less pressure under your ribs and breathe more easily, but feel more pressure on your pelvis and bladder. Pelvic pain and waddling are very normal at this stage. Begin preparing your home for baby's arrival.",
    tip: "Perineal massage, done from week 34 onwards, has been shown to reduce the likelihood of tearing during birth. Ask your midwife to show you how.",
  },
  35: {
    emoji: "🏁",
    headline: "Almost full-term",
    detail: "Lungs and brain are nearly complete.",
    babySection:
      "Baby's lungs are nearly fully mature and the brain is developing rapidly. Kidneys are fully developed. Baby may be head-down and beginning to engage in the pelvis. The vernix waxy coating is thickening to protect the skin. At around 46.2cm and about 2.4kg, baby is almost done with the major developmental work.",
    motherSection:
      "Braxton Hicks may be strong enough to take your breath away momentarily. You may notice a surge of energy — the nesting instinct — or complete exhaustion — both are normal. Know the signs of labour: regular contractions, your waters breaking, a bloody show. Don't hesitate to contact your provider if anything concerns you.",
  },
  36: {
    emoji: "🎯",
    headline: "Getting into position",
    detail: "Baby is very likely head-down in preparation for birth.",
    babySection:
      "Baby is likely head-down and engaged in your pelvis. Most of the lanugo has shed. Baby is swallowing amniotic fluid and having regular hiccups. The digestive system is ready, though it won't process real food until after birth. At around 47.4cm and about 2.6kg, baby is considered late preterm — born now, they'd have an excellent chance.",
    motherSection:
      "Your cervix may begin to efface and dilate in preparation for birth. You may notice increased vaginal discharge, losing your mucus plug, or the bloody show — all signs labour is approaching. Antenatal appointments are now weekly. Pack your hospital bag if you haven't already.",
  },
  37: {
    emoji: "✅",
    headline: "Early full-term!",
    detail: "Baby is considered early full-term and fully developed.",
    babySection:
      "Baby is now considered early full-term at 37–38 weeks. All organs are fully functional. Baby is practising sucking and swallowing in preparation for feeding. Fingernails may be long enough to scratch. At around 48.6cm and about 2.9kg, baby is ready to be born — but every extra day in the womb helps brain and lung maturity.",
    motherSection:
      "Many women feel a sudden burst of energy — the nesting surge — in these final weeks. Use it wisely and rest too. Your body may be showing signs of pre-labour: softening of the cervix, irregular contractions, or a backache that comes and goes. Stay close to home and keep your phone charged.",
    tip: "Full-term is considered 39–40 weeks. Going to 39 weeks gives baby's brain and lungs the most beneficial time to fully mature.",
  },
  38: {
    emoji: "🍉",
    headline: "Final fat stores",
    detail: "Baby is adding the last layer of fat for warmth after birth.",
    babySection:
      "Baby is adding the final layer of fat beneath the skin for warmth and energy reserves. The brain and nervous system are still maturing right up to birth. Baby may have a full head of hair, or very little — both are completely normal. At around 49.8cm and about 3.1kg, baby is considered full-term.",
    motherSection:
      "Pelvic pressure, waddling, and frequent bathroom trips are very much part of daily life now. You may notice your belly has dropped lower. Some women experience diarrhoea in the days before labour as the body clears itself out. Know when to call your midwife: regular contractions 5 minutes apart lasting 1 minute, your water breaking, or reduced fetal movement.",
  },
  39: {
    emoji: "⏰",
    headline: "Any day now",
    detail: "Baby is fully developed and ready to meet you.",
    babySection:
      "Baby is fully formed and ready for life outside the womb. The placenta continues to transfer antibodies to strengthen baby's immune system right up until birth. Baby is shedding most of the vernix and lanugo. At around 50.7cm and about 3.3kg, baby is taking up every inch of space — which is why movements may feel different now.",
    motherSection:
      "Every day is an exercise in patience and trust in your body. Labour signs to watch for include regular contractions, your waters breaking, or the bloody show. Some women feel an intuitive sense that labour is close. Make sure your birth support team knows to be on standby. You are ready for this.",
    tip: "Research shows that babies born at 39+ weeks have better outcomes for breathing, feeding, and brain development than those born even a week earlier.",
  },
  40: {
    emoji: "🌸",
    headline: "It's due date week!",
    detail: "Your baby is ready — you've done an amazing job.",
    babySection:
      "Your baby is fully ready to be born. Their lungs are mature, brain is active, and every system is prepared for life outside the womb. Baby is aware of your voice, your heartbeat, and the world around them. At an average of 51.2cm and about 3.4kg, this tiny person has been the most extraordinary work your body has ever done.",
    motherSection:
      "Only 5% of babies are born on their due date — so try not to fixate on it. Your body and baby will begin labour when the time is right. If you go past 40 weeks, your provider will monitor you closely. Rest, stay hydrated, and spend time doing things that bring you calm and joy. You have grown a human being — and you are about to meet them.",
    tip: "Trust the process. Labour may start slowly, and that's completely normal. Having continuous support — a partner, doula, or trusted person — has been shown to improve birth outcomes.",
  },
};

export const POSTNATAL_MILESTONES: Record<number, DevelopmentInfo> = {
  0: {
    emoji: "🌟",
    headline: "Hello world!",
    detail: "Everything is brand new — light, sound, and your voice.",
    babySection:
      "Your newborn has spent nine months in a warm, dark, enclosed world — and now everything is overwhelming and extraordinary. Baby can see about 20–30cm clearly — exactly the distance to your face during feeding. They recognise your voice and heartbeat from the womb. Their world is still very small, and you are the centre of it.",
    motherSection:
      "The first hours and days after birth are intense. Your body has just done something extraordinary. Whether you delivered vaginally or by caesarean, recovery takes time. Colostrum — your first milk — is packed with antibodies and is exactly what your baby needs right now. Accept every offer of help, eat nourishing food, and rest whenever your baby rests.",
    tip: "Skin-to-skin contact in the first hours and days regulates baby's temperature, heartbeat, and blood sugar, and powerfully supports bonding and breastfeeding.",
  },
  1: {
    emoji: "👁️",
    headline: "Discovering faces",
    detail: "Baby can see 8–12 inches — your face is perfect to focus on.",
    babySection:
      "At one week, baby is still adjusting to the outside world. They sleep most of the time — up to 16–17 hours a day — but their alert windows are growing. Baby can focus on high-contrast shapes and faces at close range. They are already learning to distinguish your face from others. Their cries are their only form of communication — and they're very effective.",
    motherSection:
      "Postpartum bleeding continues — this is normal for up to six weeks. Engorgement, as your milk comes in around days 3–5, can be uncomfortable; feeding frequently helps. The baby blues — tearfulness, mood swings, and emotional sensitivity — affect up to 80% of women in the first week and usually pass on their own within two weeks.",
    tip: "If you're breastfeeding, aim for 8–12 feeds per 24 hours in the early weeks. Feeding frequently establishes supply and helps prevent engorgement.",
  },
  2: {
    emoji: "👂",
    headline: "Tuning into voices",
    detail: "Baby recognises your voice and turns toward familiar sounds.",
    babySection:
      "Baby is spending slightly more time awake and alert. They are beginning to recognise familiar voices and may turn toward the sound of your voice. Startle reflexes are very prominent — any sudden sound or movement may cause baby to fling their arms out. Eyes are still unfocused, but they love looking at faces.",
    motherSection:
      "Week two is often the hardest emotionally for many new parents — the adrenaline of birth has faded, sleep deprivation is building, and the weight of responsibility can feel enormous. If baby blues persist beyond two weeks or become overwhelming, speak to your healthcare provider — postpartum depression is common and very treatable.",
    tip: "Swaddling can help settle newborns by mimicking the contained feeling of the womb — ask your midwife or nurse to show you a safe swaddling technique.",
  },
  3: {
    emoji: "🤝",
    headline: "First smiles coming",
    detail: "Those twitchy early grins will become real social smiles soon.",
    babySection:
      "Baby's early reflexive smiles — often appearing during sleep — are giving way to something more intentional. Social smiling is just around the corner. Baby is becoming more alert and may have slightly longer awake periods. Feeding patterns are becoming more predictable for some families, though cluster feeding is still very normal.",
    motherSection:
      "Your body is healing whether or not you feel it. If you had a caesarean, avoid lifting anything heavier than your baby. If you had a vaginal birth, perineal soreness should be slowly easing. It's normal to feel overwhelmed. Communicate honestly with your partner and support network about how you're feeling.",
  },
  4: {
    emoji: "😊",
    headline: "Social smiling begins",
    detail: "Real, responsive smiles are starting to appear.",
    babySection:
      "Around week four, most babies produce their first true social smile — a response to your face and voice. It is one of the most rewarding moments of early parenthood. Baby's visual focus is improving and they can track a slow-moving object. Colic — prolonged, inconsolable crying — can peak around this time and typically resolves by 3–4 months.",
    motherSection:
      "Your six-week postpartum check is approaching. This appointment will assess your physical and emotional recovery, discuss contraception, and check your blood pressure and healing. If you're struggling emotionally, this is a safe space to share that. Your wellbeing matters as much as your baby's.",
    tip: "Baby's first smile is a developmental milestone and a sign their nervous system and social awareness are developing beautifully. Smile back — a lot.",
  },
  5: {
    emoji: "💪",
    headline: "Tummy time gains",
    detail: "Baby is building neck and shoulder strength.",
    babySection:
      "Tummy time is essential now — aim for a few short sessions each day, building up as baby's tolerance grows. It strengthens the neck, shoulder, and core muscles needed for rolling, crawling, and eventually walking. Baby may be able to briefly lift their head off the surface. Always supervise tummy time and never leave baby face-down unsupervised.",
    motherSection:
      "Many women start to feel slightly more human around week five as they find a rhythm. Some postpartum hair loss may begin — this is a normal hormonal shift and will resolve. If you're breastfeeding, your supply is well established now. Eat and drink enough — breastfeeding requires an additional 300–500 calories per day.",
  },
  6: {
    emoji: "🗣️",
    headline: "First coos",
    detail: "Baby starts making soft vowel sounds to communicate.",
    babySection:
      "Baby is discovering their voice — soft cooing sounds and vowel-like sounds are their first attempts at communication. They are watching your mouth move when you talk and trying to imitate. Respond enthusiastically to every sound — this back-and-forth is the foundation of language development. Tummy time is getting longer and head control is improving.",
    motherSection:
      "Your six-week check is this week. It's also often when doctors clear women for gentle exercise — start slowly and listen to your body. If you had a caesarean, recovery may require more time. Many women return to intimacy around this time, though there's no set rule — communicate with your partner and prioritise your comfort.",
    tip: "Talk to your baby constantly — narrate what you're doing, describe what you see, respond to their sounds. This is the single most powerful thing you can do for language development.",
  },
  7: {
    emoji: "👐",
    headline: "Fascinated by hands",
    detail: "Baby is discovering and staring at their own hands.",
    babySection:
      "Baby has discovered their hands — and is fascinated. They'll stare at them, wave them, and occasionally bat at objects. Hand-eye coordination is developing. Baby is also becoming more responsive to your facial expressions, mirroring when you stick out your tongue or open your mouth wide. Vision is improving — baby can see further and in more detail.",
    motherSection:
      "The exhaustion of new parenthood is real and relentless. Sleep deprivation affects mood, decision-making, and physical health. If a trusted person offers to help — take it, sleep, and don't feel guilty. Many couples navigate relationship challenges in the early months; honest communication and patience are essential.",
  },
  8: {
    emoji: "🙆",
    headline: "Head control improving",
    detail: "Neck muscles are getting stronger — less head wobble.",
    babySection:
      "Baby's neck muscles are considerably stronger now. When held in a sitting position, head wobble is noticeably reduced. Baby can track moving objects with their eyes more smoothly. Social smiles are frequent and joyful. Baby may also begin laughing — a gurgling, joyful sound that will light up your world.",
    motherSection:
      "Two months in — you're not a new parent anymore, you're an experienced one. Trust your instincts. Postnatal check-ups may include baby's first vaccinations, which can be stressful. Baby may be unsettled for 24–48 hours after vaccinations; this is normal and manageable with comfort and infant paracetamol if advised by your provider.",
  },
  9: {
    emoji: "🎵",
    headline: "Responding to sounds",
    detail: "Baby reacts differently to music, voices, and noise.",
    babySection:
      "Baby is increasingly attuned to the auditory world. They react differently to familiar vs unfamiliar voices, to calm music vs loud noise, to your singing vs a stranger's. This is the beginning of auditory processing and emotional response. Baby may coo or squeal with delight in response to gentle, high-pitched voices.",
    motherSection:
      "Many parents find the 8–12 week period particularly challenging due to cumulative sleep deprivation. Some babies do begin sleeping longer stretches around now — but many don't, and that is normal. If you're feeling persistently low, anxious, or struggling to bond, please speak to your doctor or midwife — help is available and you deserve it.",
  },
  10: {
    emoji: "🤗",
    headline: "Recognising you",
    detail: "Baby lights up and shows excitement at familiar faces.",
    babySection:
      "Baby clearly recognises you now — and shows it. When they see your face, their whole body may wiggle with excitement. Baby is also beginning to understand cause and effect at the simplest level: cry means someone comes, which means comfort arrives. This is the foundation of trust and secure attachment.",
    motherSection:
      "You may start to feel more like yourself again around this time. If you're returning to work soon, it's worth spending some time planning the transition — for both you and your baby. If you have ongoing pain, mood concerns, or physical issues from birth, don't accept them as normal — speak to your healthcare provider.",
    tip: "Your baby's brain grows more in the first year than at any other point in life. Responsive, loving caregiving — talking, singing, playing — is the most powerful brain-building tool available.",
  },
  11: {
    emoji: "🦵",
    headline: "Stronger kicks",
    detail: "Leg movements are becoming more purposeful.",
    babySection:
      "Baby's leg movements are becoming more intentional and powerful. When held upright with feet touching a firm surface, baby may instinctively push down — an early stepping reflex. Baby is increasingly interactive, babbling and cooing in response to you. They may show early signs of object tracking with consistent eye movement.",
    motherSection:
      "The mental load of parenting — tracking feeding, sleeping, development, appointments, baby-proofing — can be exhausting. Sharing this load with your partner or support network is important. Acknowledging that some days are harder than others is not weakness — it's honesty.",
  },
  12: {
    emoji: "🌀",
    headline: "Rolling attempts",
    detail: "Baby may start trying to roll from back to side.",
    babySection:
      "Baby may start rocking side to side and attempting to roll from their back to their side — the precursor to rolling. Head control is now quite strong. Baby is showing clear preferences — for certain toys, positions, people. Babbling is becoming more varied and intentional. At three months, baby is remarkably more developed than the newborn who arrived just weeks ago.",
    motherSection:
      "Three months in. If you haven't yet, now is a good time to do a mental health check-in with your provider. Some women don't experience postnatal depression until weeks or months after birth. Your physical recovery should be well underway — if anything concerns you, raise it. You've come so far.",
    tip: "Rolling typically happens between 3–6 months. Once baby can roll, move them off elevated surfaces and ensure the sleep space is clear of anything that could cause them to become trapped.",
  },
  16: {
    emoji: "😂",
    headline: "Laughing out loud",
    detail: "First belly laughs can appear around this time.",
    babySection:
      "Four months is often when the first real belly laughs emerge — a full-bodied, joyful sound in response to your face, tickles, or silly sounds. Baby is now rolling, reaching, and grasping objects intentionally. They bring everything to their mouth — a normal part of sensory exploration. Baby is interested in everything around them and may become bored more easily.",
    motherSection:
      "Many parents find four months a turning point — baby is becoming genuinely fun and interactive. Sleep, however, can go through a difficult phase known as the 4-month sleep regression — a real neurological shift in sleep cycles. It's temporary, but exhausting. Consistency with bedtime routines can help.",
    tip: "The 4-month sleep regression is developmentally normal — not a sign you've done anything wrong. Ride it out with patience and consistency.",
  },
  20: {
    emoji: "🤲",
    headline: "Reaching & grabbing",
    detail: "Baby is learning to grasp objects intentionally.",
    babySection:
      "At five months, baby is reaching for and deliberately grasping objects, often transferring them from hand to hand. Everything goes straight to the mouth — this is how babies explore the world. Baby may be sitting with support and bearing weight on legs when held standing. They are babbling with more consonant sounds. Social interaction is rich and rewarding.",
    motherSection:
      "Five months in, many mothers are navigating decisions around returning to work, choosing childcare, or adjusting feeding. If you're still breastfeeding, congratulations — every drop counts. If you've moved to formula or mixed feeding, that's equally valid. What matters most is that both you and baby are well and cared for.",
  },
  24: {
    emoji: "🍼",
    headline: "Exploring first foods",
    detail: "Baby may be ready to start solids — ask your doctor.",
    babySection:
      "Six months is typically when solid foods are introduced alongside breast or formula milk. Signs of readiness include sitting with minimal support, good head control, showing interest in food, and the loss of the tongue-thrust reflex. First foods can be puréed vegetables, soft fruits, or baby-led weaning finger foods.",
    motherSection:
      "Starting solids is an exciting but sometimes messy and overwhelming milestone. There is no single right approach — what matters is variety, responsiveness to baby, and enjoying the process. If you're concerned about allergies, speak to your provider. This is also a common time to reassess your own nutrition and wellbeing.",
    tip: "Introduce common allergens (peanuts, eggs, dairy, wheat) early and one at a time, as current evidence shows this may help prevent allergies rather than cause them.",
  },
  28: {
    emoji: "🛋️",
    headline: "Sitting up",
    detail: "Baby is learning to sit with support and some without.",
    babySection:
      "Seven months brings increasing independence. Many babies can sit unsupported for several seconds or minutes. They are babbling more deliberately and showing clear preferences for certain people, toys, and activities. Stranger anxiety may emerge — baby becoming clingy with familiar caregivers and wary of new faces — which is a healthy sign of secure attachment.",
    motherSection:
      "Separation anxiety in baby can be emotionally demanding. Being the person baby always wants is exhausting and deeply flattering. Make sure you're getting time for yourself — even small windows of restoration matter enormously for your wellbeing and patience.",
  },
  32: {
    emoji: "🚶",
    headline: "Getting mobile",
    detail: "Crawling curiosity is kicking in — time to baby-proof.",
    babySection:
      "Baby is on the move — or very close to it. Crawling styles vary enormously (army crawl, traditional crawl, bottom shuffle) — all are normal. Mobility brings a new kind of curiosity and a new level of risk. Baby is pulling to standing positions using furniture. Language comprehension is developing rapidly — they understand far more than they can say.",
    motherSection:
      "Baby-proofing the home is urgent now — secure heavy furniture, cover electrical outlets, put locks on cupboards, and remove hazards from floor level. This is also the stage when many mothers start to feel the emotional weight of the second shift — managing baby, home, and possibly work simultaneously. Be kind to yourself.",
    tip: "You don't need expensive baby-proofing gadgets — a thorough crawl around at baby's level will reveal the most important hazards to address.",
  },
  36: {
    emoji: "👋",
    headline: "Waving hello",
    detail: "Social gestures like waving and clapping are emerging.",
    babySection:
      "Baby is developing object permanence — understanding that things exist even when out of sight. Peekaboo is suddenly hilarious. Waving, clapping, and pointing are emerging social gestures. Baby may be saying mama and dada intentionally. Walking may be very close — some babies take their first steps around now, others not until 14–15 months.",
    motherSection:
      "Nine months in — as long as pregnancy itself. Your baby has transformed from a helpless newborn into an expressive, mobile, curious little person. Reflect on how far you've both come. If you're preparing for the first birthday, don't feel pressured to go overboard — baby will be thrilled by wrapping paper and your attention.",
  },
  40: {
    emoji: "🧱",
    headline: "Building skills",
    detail: "Baby loves to stack, drop, bang, and repeat.",
    babySection:
      "Baby is deeply engaged in cause-and-effect exploration — stacking things to knock them down, dropping objects to watch them fall, banging surfaces to hear the sound. This is serious scientific inquiry at its most joyful. Language is developing fast — first words may appear between 10–14 months. Baby may walk confidently by now or still be cruising along furniture.",
    motherSection:
      "Sleep regressions are common around this age, often triggered by new developmental leaps, teething, or changes in routine. Try to maintain consistency in bedtime routines while being responsive to baby's needs. Your patience and presence are the most powerful tools you have.",
  },
  44: {
    emoji: "🥳",
    headline: "First steps coming",
    detail: "Baby may be pulling up to stand and cruising along furniture.",
    babySection:
      "Baby is likely pulling to stand confidently and cruising along furniture. First steps — wobbling, arms outstretched, expression of complete concentration — may happen any day. Language is blossoming; baby may have 2–5 words. They understand simple instructions and love interactive games. Their personality is increasingly apparent.",
    motherSection:
      "The first birthday is approaching and with it comes all sorts of reflection. You've done something remarkable this year. Whatever the journey looked like — easy moments, hard days, joy, fear, exhaustion, and overwhelming love — you showed up every single day. That's what baby needed most.",
  },
  48: {
    emoji: "🎂",
    headline: "First birthday soon!",
    detail: "One whole year of remarkable growth and bonding.",
    babySection:
      "Baby has gone from a completely helpless newborn to a walking, talking, laughing, curious little person in just twelve months. The brain has doubled in size. The personality is fully emerging. Baby understands so much of what you say and is working hard to communicate back. Every day brings new discoveries.",
    motherSection:
      "As baby's first birthday approaches, take a moment to honour yourself. You navigated the most intense year of change a person can experience. However you fed your baby, whatever your birth experience, whatever your path — you loved and cared for a new human being. That is enough. That is everything.",
    tip: "Cow's milk can replace formula or breast milk as the main drink after 12 months. Introduce it gradually and continue offering a varied, nutritious diet.",
  },
  52: {
    emoji: "🎉",
    headline: "One year old!",
    detail: "Baby's first birthday — a huge milestone for you both.",
    babySection:
      "Happy first birthday! Baby has tripled their birth weight, grown 25cm in length, and developed from a reflexive newborn into a purposeful, curious toddler. Language is beginning to explode — first words are here or coming very soon. Walking is established or very close. Play is imaginative and social.",
    motherSection:
      "One full year of parenting. The exhaustion, the joy, the fear, the pride — all of it has been worth it. As baby transitions fully into toddlerhood, a new chapter begins. Be patient with yourself as you continue to find your footing. You know your child better than anyone. Trust that.",
  },
  65: {
    emoji: "🗨️",
    headline: "Words are coming",
    detail: "Vocabulary is growing — expect 5–20 words by 18 months.",
    babySection:
      "Around 15–18 months, toddlers typically have between 5 and 20 words — though the range of normal is very wide. Understanding far outstrips speaking at this stage. Toddlers learn through imitation, repetition, and play. Tantrums are beginning — they're the result of having big emotions without the language or brain development to manage them.",
    motherSection:
      "The toddler years bring new joys and new challenges. Boundary-setting with warmth and consistency is the foundation of positive behaviour guidance. Toddlers need to feel safe, seen, and heard — even when their behaviour is challenging. Your own emotional regulation sets the template for theirs.",
    tip: "If baby has fewer than 5 words at 18 months or has stopped using words they previously had, speak to your doctor — early speech therapy can make a significant difference.",
  },
  78: {
    emoji: "🏃",
    headline: "Running & climbing",
    detail: "Toddler energy is at full throttle — enjoy every moment.",
    babySection:
      "Two years old brings extraordinary physical capability — running, jumping, climbing, throwing — paired with rapidly developing language and social skills. Toddlers at this age are testing boundaries as a healthy part of developing independence. Imaginative play, pretend games, and parallel play with other children are all blossoming.",
    motherSection:
      "Two years in, you've found your footing as a parent. The child in front of you is a full, complex little person with preferences, humour, strong opinions, and a deep attachment to you. The toddler years are often described as exhausting and magical in equal measure — both are true. Enjoy the chaos.",
    tip: "Screen time should be limited and intentional at this age — interactive activities, outdoor play, and reading together have the greatest developmental impact.",
  },
};

export function getPregnancyDevelopment(week: number): DevelopmentInfo {
  const keys = Object.keys(PREGNANCY_MILESTONES).map(Number).sort((a, b) => a - b);
  const match = keys.filter(k => k <= week).pop() ?? keys[0];
  return PREGNANCY_MILESTONES[match];
}

export function getPostnatalDevelopment(ageInWeeks: number): DevelopmentInfo {
  const keys = Object.keys(POSTNATAL_MILESTONES).map(Number).sort((a, b) => a - b);
  const match = keys.filter(k => k <= ageInWeeks).pop() ?? keys[0];
  return POSTNATAL_MILESTONES[match];
}

export function getPostnatalAgeLabel(ageInWeeks: number): string {
  if (ageInWeeks < 5) return `Week ${ageInWeeks}`;
  if (ageInWeeks < 52) return `${Math.round(ageInWeeks / 4.33)} months`;
  if (ageInWeeks < 104) return "1 year";
  return `${Math.floor(ageInWeeks / 52)} years`;
}
