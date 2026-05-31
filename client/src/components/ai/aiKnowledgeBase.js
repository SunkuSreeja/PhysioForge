/**
 * aiKnowledgeBase.js
 * Offline-first rule-based knowledge for PhysioForge AI Assistant.
 * All responses are trilingual: English, Hindi, Telugu.
 */

// ── Symptom → Lifestyle Cause Analysis ─────────────────────────────────────
export const SYMPTOM_CAUSES = [
  {
    id: 'neck_screen',
    triggers: ['neck','गर्दन','మెడ','neck pain','cervical'],
    context: ['study','laptop','phone','screen','computer','mobile','work','desk','typing','पढ़','లాప్టాప్','చదువు','కంప్యూటర్'],
    causes: {
      en: [
        "📱 Forward head posture from looking down at screen — every inch your head tilts forward adds ~10 lbs of stress on your neck.",
        "💺 Unsupported lower back causes your whole spine to compensate, straining the neck.",
        "👁️ Screen too low forces you to bend neck downward repeatedly.",
        "⏰ Sitting continuously for 45+ minutes without movement stiffens neck muscles.",
      ],
      hi: [
        "📱 फ़ोन/स्क्रीन देखते वक्त सिर आगे झुकने से गर्दन पर 10 पाउंड अतिरिक्त भार पड़ता है।",
        "💺 कमर को सहारा न होने से पूरी रीढ़ पर असर पड़ता है जो गर्दन तक पहुंचता है।",
        "👁️ स्क्रीन नीची होने से बार-बार गर्दन झुकानी पड़ती है।",
        "⏰ 45 मिनट से ज़्यादा बैठने से गर्दन की मांसपेशियां अकड़ जाती हैं।",
      ],
      te: [
        "📱 స్క్రీన్ కిందకు చూడడం వలన మెడపై అదనపు భారం పడుతుంది.",
        "💺 వీపుకు మద్దతు లేకపోవడం వలన మొత్తం వెన్నెముకపై ఒత్తిడి కలుగుతుంది.",
        "👁️ స్క్రీన్ తక్కువ ఎత్తులో ఉంటే మెడ పదే పదే వంగుతుంది.",
        "⏰ 45 నిమిషాలకు మించి కూర్చుంటే మెడ కండరాలు బిగుసుకుంటాయి.",
      ],
    },
    quickActions: [
      { label: { en: 'Check My Posture', hi: 'पोस्चर जांचें', te: 'పోస్చర్ తనిఖీ' }, route: '/patient/posture', icon: '🎯' },
      { label: { en: 'Neck Remedies', hi: 'गर्दन के उपाय', te: 'మెడ చిట్కాలు' }, route: '/patient/remedies', icon: '🌿' },
      { label: { en: 'Neck Exercises', hi: 'गर्दन व्यायाम', te: 'మెడ వ్యాయామాలు' }, route: '/patient/exercises', icon: '🏋️' },
    ],
    followUp: {
      en: "How long have you been feeling this? Has it been improving or getting worse over the past few days?",
      hi: "यह दर्द कितने दिनों से है? पिछले कुछ दिनों में सुधर रहा है या बढ़ रहा है?",
      te: "ఈ నొప్పి ఎంత కాలంగా ఉంది? గత కొన్ని రోజుల్లో మెరుగవుతోందా లేదా పెరుగుతోందా?",
    },
  },
  {
    id: 'shoulder_desk',
    triggers: ['shoulder','कंधा','భుజం','shoulder pain','scapula'],
    context: ['laptop','typing','desk','mouse','work','office','driving','computer','కంప్యూటర్','లాప్టాప్','ఆఫీస్'],
    causes: {
      en: [
        "🖥️ Reaching forward to keyboard while sitting back creates constant shoulder tension.",
        "🖱️ Mouse use with a raised elbow strains the rotator cuff over hours.",
        "😤 Stress causes unconscious shoulder elevation — shoulders creep up near your ears.",
        "🪑 Armrests at wrong height force shoulders either shrugged up or reaching down.",
      ],
      hi: [
        "🖥️ कीबोर्ड की तरफ आगे झुककर काम करने से कंधे पर लगातार खिंचाव।",
        "🖱️ उठी हुई कोहनी से माउस चलाने पर घंटों में रोटेटर कफ़ पर दबाव।",
        "😤 तनाव से कंधे अनजाने में ऊपर उठे रहते हैं।",
        "🪑 आर्मरेस्ट सही ऊंचाई पर न होने से कंधे पर जोर।",
      ],
      te: [
        "🖥️ కీబోర్డ్ వైపు ముందుకు వంగి పని చేయడం వలన భుజంపై నిరంతర ఒత్తిడి.",
        "🖱️ మోచేయి పైకి ఎత్తి మౌస్ వాడటం వలన రోటేటర్ కఫ్ పై గంటల తరబడి భారం.",
        "😤 ఒత్తిడి వలన భుజాలు అప్రయత్నంగా పైకి లేస్తాయి.",
        "🪑 ఆర్మ్‌రెస్ట్ సరైన ఎత్తులో లేకపోవడం వలన భుజంపై జోర్.",
      ],
    },
    quickActions: [
      { label: { en: 'Posture Scan', hi: 'पोस्चर स्कैन', te: 'పోస్చర్ స్కాన్' }, route: '/patient/posture', icon: '🎯' },
      { label: { en: 'Shoulder Remedies', hi: 'कंधे के उपाय', te: 'భుజం చిట్కాలు' }, route: '/patient/remedies', icon: '🌿' },
      { label: { en: 'Shoulder Exercises', hi: 'कंधा व्यायाम', te: 'భుజం వ్యాయామాలు' }, route: '/patient/exercises', icon: '🏋️' },
    ],
    followUp: {
      en: "Does the pain stay in one spot or radiate down your arm? Any numbness or tingling?",
      hi: "दर्द एक जगह है या बांह में भी जाता है? सुन्नपन या झनझनाहट है?",
      te: "నొప్పి ఒక చోటే ఉంటుందా లేదా చేయి కిందకు వ్యాపిస్తుందా? తిమ్మిరి ఉందా?",
    },
  },
  {
    id: 'back_driving',
    triggers: ['back','पीठ','వీపు','lower back','kamar','कमर','backbone'],
    context: ['driv','car','ride','seat','commut','sit','vehicle','కారు','డ్రైవింగ్','వాహనం'],
    causes: {
      en: [
        "🚗 Driving seat often tilts pelvis backward, flattening the natural lumbar curve.",
        "😬 Vibration from road adds micro-stress to spinal discs over long drives.",
        "🔄 Fixed posture for 30+ min causes spinal muscle fatigue — they stop supporting properly.",
        "👣 Clutch/brake foot can create hip imbalance that travels up to the lower back.",
      ],
      hi: [
        "🚗 ड्राइविंग सीट में कूल्हे पीछे झुकने से कमर की प्राकृतिक वक्रता खत्म होती है।",
        "😬 सड़क के कंपन से रीढ़ की डिस्क पर लगातार दबाव।",
        "🔄 30+ मिनट एक ही पोज़िशन में रहने से रीढ़ की मांसपेशियां थक जाती हैं।",
        "👣 क्लच/ब्रेक से एक पैर पर जोर से कूल्हों में असंतुलन।",
      ],
      te: [
        "🚗 కారు సీట్లో కూర్చున్నప్పుడు పెల్విస్ వెనుకకు వంగి నడుం యొక్క సహజ వంపు తగ్గుతుంది.",
        "😬 రహదారి కంపనాల వలన వెన్నుపూస డిస్క్‌లపై మైక్రో-ఒత్తిడి.",
        "🔄 30+ నిమిషాలు ఒకే భంగిమలో ఉంటే వెన్నుపూస కండరాలు అలసిపోతాయి.",
        "👣 క్లచ్/బ్రేక్ పాదంపై భారం వలన తుంటి అసమతుల్యత నడుముకు వ్యాపిస్తుంది.",
      ],
    },
    quickActions: [
      { label: { en: 'Back Remedies', hi: 'पीठ के उपाय', te: 'వీపు చిట్కాలు' }, route: '/patient/remedies', icon: '🌿' },
      { label: { en: 'Back Exercises', hi: 'पीठ व्यायाम', te: 'వీపు వ్యాయామాలు' }, route: '/patient/exercises', icon: '🏋️' },
      { label: { en: 'Track Recovery', hi: 'रिकवरी ट्रैक', te: 'రికవరీ ట్రాక్' }, route: '/patient/analytics', icon: '📊' },
    ],
    followUp: {
      en: "Is the pain more in the morning or evening? Does it improve after walking around?",
      hi: "दर्द सुबह ज़्यादा है या शाम को? चलने-फिरने के बाद कम होता है?",
      te: "నొప్పి ఉదయం ఎక్కువగా ఉంటుందా లేదా సాయంత్రం? నడిచిన తర్వాత తగ్గుతుందా?",
    },
  },
  {
    id: 'knee_activity',
    triggers: ['knee','घुटना','घुटने','మోకాలి','मोकाली'],
    context: ['walk','run','stairs','climb','sport','exercise','stand','gym','నడక','మెట్లు','వ్యాయామ'],
    causes: {
      en: [
        "🦵 Weak quadriceps (front thigh) means the knee absorbs more impact than it should.",
        "👟 Inappropriate footwear affects alignment from feet all the way up to the knee.",
        "⬇️ Descending stairs is 3–4x more stress on the knee than walking flat.",
        "🏃 Sudden increase in physical activity without gradual buildup strains tendons.",
      ],
      hi: [
        "🦵 कमज़ोर क्वाड्रिसेप्स (जांघ की अगली मांसपेशी) से घुटने पर ज़्यादा झटका।",
        "👟 गलत जूते पहनने से पैर से घुटने तक का अलाइनमेंट बिगड़ता है।",
        "⬇️ सीढ़ियां उतरना सपाट ज़मीन से 3-4 गुना ज़्यादा घुटने पर दबाव।",
        "🏃 बिना तैयारी अचानक ज़्यादा व्यायाम से नसें खिंचती हैं।",
      ],
      te: [
        "🦵 బలహీనమైన క్వాడ్రిసెప్స్ (తొడ ముందు కండరం) వలన మోకాలిపై అదనపు భారం.",
        "👟 తప్పుడు జూతాలు పాదం నుండి మోకాలి వరకు అలైన్‌మెంట్ దెబ్బతీస్తాయి.",
        "⬇️ మెట్లు దిగడం సమతల నడకకంటే 3-4 రెట్లు మోకాలిపై ఒత్తిడి.",
        "🏃 క్రమంగా సిద్ధం కాకుండా అకస్మాత్తుగా ఎక్కువ వ్యాయామం చేయడం వలన కండరాలు లాగడం.",
      ],
    },
    quickActions: [
      { label: { en: 'Knee Remedies', hi: 'घुटने के उपाय', te: 'మోకాలి చిట్కాలు' }, route: '/patient/remedies', icon: '🌿' },
      { label: { en: 'Knee Exercises', hi: 'घुटने का व्यायाम', te: 'మోకాలి వ్యాయామాలు' }, route: '/patient/exercises', icon: '🏋️' },
      { label: { en: 'Book Physio', hi: 'फिजियो बुक करें', te: 'ఫిజియో బుక్ చేయండి' }, route: '/patient/teleconsult', icon: '📹' },
    ],
    followUp: {
      en: "Does the knee feel stiff after sitting and then getting up? Any swelling noticed?",
      hi: "बैठने के बाद उठने पर घुटना अकड़ा लगता है? कोई सूजन दिखती है?",
      te: "కూర్చున్న తర్వాత లేవడంలో మోకాలి బిగుసుకుంటుందా? వాపు కనిపిస్తుందా?",
    },
  },
  {
    id: 'general_pain',
    triggers: ['pain','hurts','ache','sore','dard','दर्द','నొప్పి','joint','muscle','జాయింట్','కండర'],
    context: [],
    causes: {
      en: [
        "🛋️ Prolonged static postures reduce blood flow to muscles and joints.",
        "💧 Mild dehydration causes muscles to cramp and joints to feel stiffer.",
        "😴 Poor sleep quality reduces the body's overnight repair processes.",
        "🧘 Muscle imbalances (one side stronger) create uneven load on joints.",
      ],
      hi: [
        "🛋️ लंबे समय एक ही पोज़ में बैठने से मांसपेशियों और जोड़ों में रक्त प्रवाह कम होता है।",
        "💧 हल्की प्यास से भी मांसपेशियों में ऐंठन और जोड़ों में अकड़न।",
        "😴 नींद खराब होने से रात में शरीर की मरम्मत कम होती है।",
        "🧘 एक तरफ ज़्यादा ताकत होने से जोड़ों पर असमान दबाव।",
      ],
      te: [
        "🛋️ చాలాసేపు ఒకే భంగిమలో ఉంటే కండరాలు మరియు కీళ్ళకు రక్త ప్రసరణ తగ్గుతుంది.",
        "💧 తేలికపాటి నిర్జలీభవనం వలన కండరాలు పిడికినట్లు అవుతాయి.",
        "😴 నిద్ర సరిగా లేకపోతే రాత్రి సమయంలో శరీర మరమ్మత్తు తగ్గుతుంది.",
        "🧘 ఒక వైపు కండరాలు బలంగా ఉంటే కీళ్ళపై అసమాన భారం పడుతుంది.",
      ],
    },
    quickActions: [
      { label: { en: 'All Remedies', hi: 'सभी उपाय', te: 'అన్ని చిట్కాలు' }, route: '/patient/remedies', icon: '🌿' },
      { label: { en: 'My Exercises', hi: 'मेरे व्यायाम', te: 'నా వ్యాయామాలు' }, route: '/patient/exercises', icon: '🏋️' },
      { label: { en: 'Posture Check', hi: 'पोस्चर जांच', te: 'పోస్చర్ తనిఖీ' }, route: '/patient/posture', icon: '🎯' },
    ],
    followUp: {
      en: "Can you tell me exactly where it hurts and when it started?",
      hi: "क्या आप बता सकते हैं दर्द ठीक कहाँ है और कब से है?",
      te: "సరిగ్గా ఎక్కడ నొప్పిగా ఉందో మరియు ఎప్పటి నుండి ఉందో చెప్పగలరా?",
    },
  },
]

// ── Pharmacy / Self-medication Prevention ───────────────────────────────────
export const PHARMACY_TRIGGERS = [
  'tablet','painkiller','medicine','drug','pharmacy','ibuprofen','paracetamol','aspirin',
  'dolo','combiflam','diclofenac','nimesulide','tablets','pill','गोली','दवाई','दवा',
  'medicine','మాత్ర','మందు','ఔషధం','pain relief tablet','pain tablet','buy medicine',
]

export const PHARMACY_RESPONSES = {
  en: {
    headline: "⚕️ A quick note before reaching for tablets",
    scenarios: [
      {
        title: "Real case: Regular ibuprofen without cause",
        body: "A 32-year-old took ibuprofen daily for 3 weeks for lower back pain. Result: stomach ulcer and kidney stress markers elevated. The back pain was purely postural — fixable with 2 simple exercises.",
      },
      {
        title: "Real case: Mixing painkillers unknowingly",
        body: "A working professional took a cold tablet in the morning and a painkiller in the evening — both contained paracetamol. Over 2 weeks, liver enzyme levels were affected.",
      },
    ],
    safer: [
      "🌿 Warm compress or ice pack (15–20 min) relieves 70–80% of musculoskeletal pain",
      "🧘 Targeted stretching addresses the actual cause, not just the sensation",
      "💆 Oil massage improves local circulation without any side effects",
      "📊 Track your pain pattern in Analytics — often reveals a trigger you can fix",
    ],
    when_doctor: "If pain is severe (7+/10), has lasted more than 7 days, or came after an injury — please see a doctor before taking anything.",
    encouragement: "You're already on PhysioForge — that's the smarter path. Let's fix the root cause together.",
  },
  hi: {
    headline: "⚕️ गोली लेने से पहले एक ज़रूरी बात",
    scenarios: [
      {
        title: "वास्तविक उदाहरण: रोज़ इबुप्रोफेन लेना",
        body: "एक 32 साल के व्यक्ति ने 3 हफ्ते रोज़ इबुप्रोफेन ली पीठ दर्द के लिए। नतीजा: पेट में अल्सर और किडनी पर असर। दर्द सिर्फ पोस्चर का था — 2 व्यायाम से ठीक हो सकता था।",
      },
      {
        title: "वास्तविक उदाहरण: अनजाने में दवाएं मिलाना",
        body: "एक कामकाजी व्यक्ति ने सुबह सर्दी की गोली और शाम को दर्द-निवारक ली — दोनों में पैरासिटामोल था। 2 हफ्ते में लीवर एंज़ाइम प्रभावित हुए।",
      },
    ],
    safer: [
      "🌿 गर्म या ठंडी सेंक (15-20 मिनट) से 70-80% दर्द ठीक होता है",
      "🧘 सही स्ट्रेचिंग से असली कारण दूर होता है",
      "💆 तेल मालिश से बिना दुष्प्रभाव के रक्त प्रवाह बेहतर होता है",
      "📊 एनालिटिक्स में दर्द का पैटर्न देखें — अक्सर ट्रिगर का पता चलता है",
    ],
    when_doctor: "अगर दर्द 7+/10 है, 7 दिन से ज़्यादा है, या चोट के बाद है — कुछ लेने से पहले डॉक्टर को दिखाएं।",
    encouragement: "आप PhysioForge पर हैं — यह सही रास्ता है। मिलकर असली कारण ठीक करते हैं।",
  },
  te: {
    headline: "⚕️ మాత్రలు తీసుకునే ముందు ఒక ముఖ్యమైన విషయం",
    scenarios: [
      {
        title: "నిజమైన ఉదాహరణ: రోజూ ఇబుప్రోఫెన్ తీసుకోవడం",
        body: "32 సంవత్సరాల వ్యక్తి వీపు నొప్పికి 3 వారాలు రోజూ ఇబుప్రోఫెన్ తీసుకున్నారు. ఫలితం: కడుపు పుండు మరియు మూత్రపిండాలపై ఒత్తిడి. నొప్పి కేవలం భంగిమ వలన — 2 వ్యాయామాలతో నయమయ్యేది.",
      },
      {
        title: "నిజమైన ఉదాహరణ: తెలియకుండా మందులు కలపడం",
        body: "ఒక వ్యక్తి ఉదయం జలుబు మాత్ర, సాయంత్రం నొప్పి మాత్ర తీసుకున్నారు — రెండింటిలో పారాసెటమాల్ ఉంది. 2 వారాల్లో కాలేయ ఎంజైమ్‌లు ప్రభావితమయ్యాయి.",
      },
    ],
    safer: [
      "🌿 వేడి లేదా చల్లని గుడ్డ (15-20 నిమిషాలు) 70-80% నొప్పిని తగ్గిస్తుంది",
      "🧘 సరైన స్ట్రెచింగ్ అసలు కారణాన్ని పరిష్కరిస్తుంది",
      "💆 నూనె మర్దన దుష్ప్రభావాలు లేకుండా రక్త ప్రసరణ మెరుగుపరుస్తుంది",
      "📊 అనలిటిక్స్‌లో నొప్పి నమూనా చూడండి — తరచూ కారణం కనుగొనవచ్చు",
    ],
    when_doctor: "నొప్పి 7+/10 అయినా, 7 రోజులకు మించినా, లేదా గాయం తర్వాత వచ్చినా — ఏదైనా తీసుకునే ముందు డాక్టర్‌ను సంప్రదించండి.",
    encouragement: "మీరు PhysioForge లో ఉన్నారు — ఇది సరైన మార్గం. కలిసి అసలు కారణాన్ని పరిష్కరిద్దాం.",
  },
}

export const PHARMACY_QUICK_ACTIONS = [
  { label: { en: 'Try Home Remedies', hi: 'घरेलू उपाय', te: 'ఇంటి చిట్కాలు' }, route: '/patient/remedies', icon: '🌿' },
  { label: { en: 'Do Exercises First', hi: 'पहले व्यायाम करें', te: 'ముందు వ్యాయామం' }, route: '/patient/exercises', icon: '🏋️' },
  { label: { en: 'Ask a Doctor', hi: 'डॉक्टर से पूछें', te: 'డాక్టర్‌ను అడగండి' }, route: '/patient/teleconsult', icon: '📹' },
]

// ── Recovery Check-in ────────────────────────────────────────────────────────
export const CHECKIN_PROMPTS = {
  en: [
    "Good to see you! On a scale of 1–10, how is your pain today compared to yesterday?",
    "Daily check-in: How are you feeling today? Any new areas of discomfort?",
    "How did your exercises go today? Did you notice any difference in pain level?",
    "Quick check: pain score today (1 = minimal, 10 = severe)?",
  ],
  hi: [
    "आज आपका दर्द कैसा है? कल की तुलना में 1-10 में बताएं।",
    "दैनिक जांच: आज कैसा महसूस हो रहा है? कोई नई तकलीफ?",
    "आज के व्यायाम कैसे रहे? दर्द में कोई फ़र्क दिखा?",
    "आज का दर्द स्कोर बताएं (1=कम, 10=बहुत ज़्यादा)?",
  ],
  te: [
    "నేడు మీ నొప్పి ఎలా ఉంది? నిన్నతో పోలిస్తే 1-10 స్కేల్‌లో చెప్పండి.",
    "రోజువారీ తనిఖీ: ఈరోజు ఎలా అనిపిస్తోంది? కొత్త అసౌకర్యం ఏదైనా?",
    "ఈరోజు వ్యాయామాలు ఎలా జరిగాయి? నొప్పిలో తేడా కనిపించిందా?",
    "ఈరోజు నొప్పి స్కోర్ చెప్పండి (1=తక్కువ, 10=తీవ్రం)?",
  ],
}

export const CHECKIN_RESPONSES = {
  improving: {
    en: (score, prev) => `Great news! Your pain dropped from ${prev} → ${score}. That's real progress. Keep up with your exercises — consistency is what gets you to zero.`,
    hi: (score, prev) => `शानदार! दर्द ${prev} से ${score} पर आया। असली सुधार है। व्यायाम जारी रखें।`,
    te: (score, prev) => `చాలా అదృష్టం! నొప్పి ${prev} నుండి ${score}కి తగ్గింది. నిజమైన పురోగతి. వ్యాయామాలు కొనసాగించండి.`,
  },
  same: {
    en: (score) => `Score holding at ${score}. Plateaus happen — the key is not to stop. Try adding the posture correction exercises today.`,
    hi: (score) => `स्कोर ${score} पर स्थिर है। रुकावट आती है — रुकें नहीं। आज पोस्चर व्यायाम जोड़ें।`,
    te: (score) => `స్కోర్ ${score} వద్ద స్థిరంగా ఉంది. పురోగతి ఆగడం సహజం — ఆగకండి. ఈరోజు పోస్చర్ వ్యాయామాలు జోడించండి.`,
  },
  worsening: {
    en: (score, prev) => `Pain went from ${prev} → ${score}. That's worth noting. Did you overdo activity today? Rest, apply warm compress, and if it stays above 7 for 2 days, book a teleconsult.`,
    hi: (score, prev) => `दर्द ${prev} से ${score} हो गया। ध्यान दें। क्या ज़्यादा काम किया? आराम करें, गर्म सेंक लगाएं। 2 दिन 7+ रहे तो टेलीकंसल्ट करें।`,
    te: (score, prev) => `నొప్పి ${prev} నుండి ${score}కి పెరిగింది. శ్రద్ధ పెట్టండి. ఈరోజు చాలా కష్టపడారా? విశ్రాంతి తీసుకోండి. 2 రోజులు 7+ ఉంటే టెలీకన్సల్ట్ చేయండి.`,
  },
  first: {
    en: (score) => `Thanks for sharing. Pain score ${score}/10 recorded. Keep checking in daily — I'll track your trend and show you how you're progressing over the week.`,
    hi: (score) => `दर्द स्कोर ${score}/10 रिकॉर्ड। रोज़ चेक-इन करते रहें — मैं आपकी प्रगति ट्रैक करूंगा।`,
    te: (score) => `నొప్పి స్కోర్ ${score}/10 నమోదు అయింది. రోజూ చెక్-ఇన్ చేయండి — మీ పురోగతి ట్రాక్ చేస్తాను.`,
  },
}

// ── Feature navigation intents ───────────────────────────────────────────────
export const NAVIGATION_INTENTS = [
  {
    triggers: ['exercise','workout','व्यायाम','వ్యాయామ','training','stretch','today','plan'],
    route: '/patient/exercises',
    response: {
      en: "Let me take you to your exercise plan. Your prescribed exercises are waiting — consistency is the key to faster recovery.",
      hi: "व्यायाम योजना पर जाते हैं। आपके प्रिस्क्राइब्ड व्यायाम तैयार हैं।",
      te: "వ్యాయామ ప్లాన్‌కు వెళదాం. మీ నిర్దేశించిన వ్యాయామాలు సిద్ధంగా ఉన్నాయి.",
    },
    icon: '🏋️',
  },
  {
    triggers: ['posture','pose','పోస్చర్','पोस्चर','scan','detect','camera','body check'],
    route: '/patient/posture',
    response: {
      en: "Opening AI Posture Detection. Make sure you're well-lit and the camera can see your full body.",
      hi: "AI पोस्चर डिटेक्शन खोल रहे हैं। अच्छी रोशनी में खड़े हों।",
      te: "AI పోస్చర్ డిటెక్షన్ తెరుస్తున్నాను. మంచి వెలుతురులో నిలబడండి.",
    },
    icon: '🎯',
  },
  {
    triggers: ['remedy','remedies','home','उपाय','చిట్కా','natural','herb','turmeric','neem','ginger'],
    route: '/patient/remedies',
    response: {
      en: "Taking you to Relief Remedies — safe home treatments, Ayurvedic methods, and hot/cold therapy for your specific pain.",
      hi: "घरेलू उपाय पर जाते हैं — सुरक्षित इलाज, आयुर्वेदिक और थेरेपी।",
      te: "ఇంటి చిట్కాలకు తీసుకుపోతున్నాను — సురక్షిత ఇంటి చికిత్సలు, ఆయుర్వేద పద్ధతులు.",
    },
    icon: '🌿',
  },
  {
    triggers: ['progress','analytics','score','chart','graph','trend','రికవరీ','रिकवरी','improvement'],
    route: '/patient/analytics',
    response: {
      en: "Opening your Recovery Analytics. You can see pain trends, exercise completion rate, and recovery milestones.",
      hi: "रिकवरी एनालिटिक्स खोल रहे हैं। दर्द ट्रेंड और व्यायाम रिपोर्ट देखें।",
      te: "రికవరీ అనలిటిక్స్ తెరుస్తున్నాను. నొప్పి ట్రెండ్, వ్యాయామ నివేదిక చూడండి.",
    },
    icon: '📊',
  },
  {
    triggers: ['doctor','डॉक्टर','డాక్టర్','consult','teleconsult','video','call','appointment','book'],
    route: '/patient/teleconsult',
    response: {
      en: "Taking you to Teleconsultation. Your assigned physiotherapist is available for video sessions.",
      hi: "टेलीकंसल्टेशन पर जाते हैं। आपके फिजियो वीडियो सेशन के लिए उपलब्ध हैं।",
      te: "టెలీకన్సల్టేషన్‌కు వెళ్తున్నాను. మీ ఫిజియోథెరపిస్ట్ వీడియో సెషన్‌కు అందుబాటులో ఉన్నారు.",
    },
    icon: '📹',
  },
  {
    triggers: ['emergency','आपातकाल','అత్యవసర','urgent','serious','fall','fell','injured','injury','hospital'],
    route: '/patient/emergency',
    response: {
      en: "⚠️ Going to Emergency contacts now. If this is life-threatening, please call 112 immediately.",
      hi: "⚠️ आपातकालीन संपर्क खोल रहे हैं। जान का खतरा हो तो 112 कॉल करें।",
      te: "⚠️ అత్యవసర సంప్రదింపులు తెరుస్తున్నాను. జీవితానికి ముప్పు అయితే వెంటనే 112 కాల్ చేయండి.",
    },
    icon: '🆘',
  },
]

// ── Recovery Summary Generator ───────────────────────────────────────────────
export function generateRecoverySummary(logs, lang = 'en') {
  if (!logs || logs.length === 0) return null
  const avg = logs.reduce((s, l) => s + l.score, 0) / logs.length
  const trend = logs.length >= 2
    ? logs[logs.length - 1].score - logs[0].score
    : 0
  const best = Math.min(...logs.map(l => l.score))
  const worst = Math.max(...logs.map(l => l.score))

  const summaries = {
    en: `📊 Your ${logs.length}-day summary: Average pain ${avg.toFixed(1)}/10 · Best day ${best}/10 · Trend: ${trend < 0 ? `↓ Improving by ${Math.abs(trend)} points` : trend > 0 ? `↑ Increased by ${trend} (check your activity)` : '→ Stable'}.`,
    hi: `📊 ${logs.length} दिन का सारांश: औसत दर्द ${avg.toFixed(1)}/10 · सबसे अच्छा दिन ${best}/10 · ट्रेंड: ${trend < 0 ? `↓ ${Math.abs(trend)} पॉइंट सुधार` : trend > 0 ? `↑ ${trend} बढ़ा (गतिविधि जांचें)` : '→ स्थिर'}.`,
    te: `📊 ${logs.length} రోజుల సారాంశం: సగటు నొప్పి ${avg.toFixed(1)}/10 · అత్యుత్తమ రోజు ${best}/10 · ట్రెండ్: ${trend < 0 ? `↓ ${Math.abs(trend)} పాయింట్లు మెరుగు` : trend > 0 ? `↑ ${trend} పెరిగింది (కార్యకలాపం తనిఖీ చేయండి)` : '→ స్థిరంగా'}.`,
  }
  return summaries[lang] || summaries.en
}

// ── General conversational responses ────────────────────────────────────────
export const GENERAL_RESPONSES = {
  greet: {
    triggers: ['hello','hi','hey','namaste','नमस्ते','నమస్కారం','good morning','good evening','hii'],
    response: {
      en: (name) => `Hello${name ? ` ${name}` : ''}! 👋 I'm your PhysioForge AI assistant. Tell me how you're feeling today — describe any pain, ask about exercises, or check your recovery progress.`,
      hi: (name) => `नमस्ते${name ? ` ${name}` : ''}! 👋 मैं आपका PhysioForge AI सहायक हूं। आज कैसा महसूस हो रहा है — दर्द बताएं, व्यायाम पूछें, या रिकवरी चेक करें।`,
      te: (name) => `నమస్కారం${name ? ` ${name}` : ''}! 👋 నేను మీ PhysioForge AI సహాయకుడిని. ఈరోజు ఎలా అనిపిస్తోందో చెప్పండి — నొప్పి వివరించండి, వ్యాయామాలు అడగండి, లేదా రికవరీ తనిఖీ చేయండి.`,
    },
  },
  thanks: {
    triggers: ['thank','thanks','dhanyavaad','ధన్యవాదాలు','धन्यवाद','shukriya','okay','ok','good','nice'],
    response: {
      en: () => `You're welcome! 😊 Remember — consistency with small daily steps beats occasional intense sessions. I'm here whenever you need guidance.`,
      hi: () => `आपका स्वागत है! 😊 याद रखें — छोटे रोज़ के कदम बड़े नतीजे देते हैं। जब भी ज़रूरत हो, यहां हूं।`,
      te: () => `సంతోషం! 😊 గుర్తుంచుకోండి — రోజువారీ చిన్న అడుగులు పెద్ద ఫలితాలు ఇస్తాయి. ఎప్పుడైనా అవసరమైతే ఇక్కడ ఉన్నాను.`,
    },
  },
  rural_mode: {
    triggers: ['simple','easy','simple language','সহজ','easy words','rural','village','basic'],
    response: {
      en: () => `Sure! I'll keep everything simple and clear. Just tell me: WHERE does it hurt? I'll guide you step by step in plain words.`,
      hi: () => `बिल्कुल! मैं सब कुछ आसान भाषा में बताऊंगा। बस बताएं: दर्द कहाँ है?`,
      te: () => `తప్పకుండా! అన్నీ సులభంగా చెప్తాను. చెప్పండి: ఎక్కడ నొప్పిగా ఉంది?`,
    },
  },
}

// ── Quick command chips ───────────────────────────────────────────────────────
export const QUICK_CHIPS = {
  en: [
    { text: 'My neck hurts after studying 📱', type: 'symptom' },
    { text: 'Shoulder pain from laptop work 💻', type: 'symptom' },
    { text: 'Back pain after long drive 🚗', type: 'symptom' },
    { text: "Today's check-in 📋", type: 'checkin' },
    { text: 'Show my recovery trend 📊', type: 'nav' },
    { text: 'Home remedies 🌿', type: 'nav' },
  ],
  hi: [
    { text: 'पढ़ाई के बाद गर्दन दर्द 📱', type: 'symptom' },
    { text: 'लैपटॉप से कंधे में दर्द 💻', type: 'symptom' },
    { text: 'लंबी ड्राइव के बाद पीठ दर्द 🚗', type: 'symptom' },
    { text: 'आज का चेक-इन 📋', type: 'checkin' },
    { text: 'मेरी प्रगति दिखाओ 📊', type: 'nav' },
    { text: 'घरेलू उपाय 🌿', type: 'nav' },
  ],
  te: [
    { text: 'చదువు తర్వాత మెడ నొప్పి 📱', type: 'symptom' },
    { text: 'లాప్టాప్ వలన భుజం నొప్పి 💻', type: 'symptom' },
    { text: 'డ్రైవింగ్ తర్వాత వీపు నొప్పి 🚗', type: 'symptom' },
    { text: 'నేటి చెక్-ఇన్ 📋', type: 'checkin' },
    { text: 'రికవరీ ట్రెండ్ చూపించు 📊', type: 'nav' },
    { text: 'ఇంటి చిట్కాలు 🌿', type: 'nav' },
  ],
}
