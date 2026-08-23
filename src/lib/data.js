// Seed content for Bright Academy — Islamic lessons only (Quran, Arabic, Islamic Studies)
export const BRAND = {
  name: 'Bright Academy',
  tagline: 'Live Quran, Arabic & Islamic Studies classes for kids & teens',
  email: 'hello@brightacademy.example',
  phone: '+1 (555) 010-2030',
  address: 'Online · Serving families worldwide',
  social: { facebook: '#', instagram: '#', telegram: '#', youtube: '#' },
}

export const TEACHERS = [
  {
    id: 't1', slug: 'aisha-rahman', name: 'Ustadha Aisha Rahman', short: 'Aisha R.', title: 'Ustadha', gender: 'f',
    photo: 'teachers/aisha-rahman.jpg', portrait: 'teachers/aisha-rahman-portrait.jpg',
    subjects: ['Noorani Qaida', 'Quran for Kids'], languages: ['English', 'Malay', 'Arabic (Quranic)'], years: 7, rating: 5.0, reviews: 38, students: 120, country: 'Malaysia',
    headline: 'Noorani Qaida & Quran foundations for young learners',
    bio: "Assalamu alaikum! I'm Ustadha Aisha, an Ijazah-certified Quran teacher with 7 years of experience teaching children aged 4–12. I specialise in Noorani Qaida and the very first steps of Quran reading — letters, harakat, joining and the basic Tajweed that makes recitation beautiful from day one. My classes are gentle, playful and structured: every lesson has a warm-up, a new skill, guided practice and a small win to celebrate. I also teach daily duas and the adab of the Quran so children fall in love with the Book of Allah, not just learn to decode it.",
    experience: 'Quran teacher at Darul Huda Learning Centre (5 yrs), online Quran tutor for families in the UK, US and Malaysia (3 yrs).',
    education: [{ degree: 'B.A. Islamic Studies', school: 'International Islamic University Malaysia', year: 2017 }],
    certifications: [{ name: 'Ijazah in Hafs ‘an ‘Asim', org: 'Sheikh Mahmoud Khalil (chain to the Prophet ﷺ)', year: 2019 }, { name: 'Teaching Quran to Children Certificate', org: 'Al-Huda Institute', year: 2018 }],
    awards: [{ name: 'Top-rated Teacher (Parents’ Choice)', org: 'Bright Academy', year: 2025 }],
    sampleLessons: ['Letters with Fatha — Noorani Qaida Lesson 3', 'Joining letters: from sounds to words'],
  },
  {
    id: 't2', slug: 'maryam-yusuf', name: 'Ustadha Maryam Yusuf', short: 'Maryam Y.', title: 'Ustadha', gender: 'f',
    photo: 'teachers/maryam-yusuf.jpg', portrait: 'teachers/maryam-yusuf-portrait.jpg',
    subjects: ['Arabic Language', 'Arabic Grammar'], languages: ['English', 'Arabic', 'Malay'], years: 6, rating: 4.9, reviews: 27, students: 95, country: 'Malaysia',
    headline: 'Arabic for kids and teens — speaking, reading and grammar',
    bio: "Hello! I'm Ustadha Maryam, an Arabic language teacher with a degree in Arabic Linguistics and 6 years of classroom and online experience. I teach Arabic the way children actually acquire language: lots of listening, speaking games, stories and songs — then reading and writing once the sounds feel natural. For teens I run structured Nahw (grammar) and Sarf (morphology) courses that unlock the Quran and classical texts. Parents love that every term ends with a small presentation their child gives in Arabic!",
    experience: 'Arabic teacher at Sekolah Rendah Islam Al-Amin (4 yrs), curriculum designer for online Arabic programs (2 yrs).',
    education: [{ degree: 'B.A. Arabic Language & Linguistics', school: 'Al-Azhar University', year: 2018 }],
    certifications: [{ name: 'Teaching Arabic to Non-Native Speakers (TAFL)', org: 'Qasid Institute', year: 2019 }],
    awards: [],
    sampleLessons: ['My family — ‘Ā’ilatī (vocabulary + dialogue)', 'Ism, Fi‘l, Harf: the three words of Arabic'],
  },
  {
    id: 't3', slug: 'abdullah-hakim', name: 'Sheikh Abdullah Hakim', short: 'Abdullah H.', title: 'Sheikh', gender: 'm',
    photo: 'teachers/abdullah-hakim.jpg', portrait: 'teachers/abdullah-hakim-portrait.jpg',
    subjects: ['Quran Recitation', 'Tajweed'], languages: ['English', 'Arabic', 'Indonesian'], years: 12, rating: 5.0, reviews: 64, students: 210, country: 'Indonesia',
    headline: 'Tajweed-perfect recitation, from first words to fluency',
    bio: "Assalamu alaikum wa rahmatullah. I am Sheikh Abdullah Hakim, a Hafiz and Ijazah holder with over 12 years of teaching Quran to students of all ages. My approach is simple: listen, repeat, correct, repeat again — with patience. I focus on Makharij (articulation points) and Sifaat (characteristics) of letters before moving to the rules of Noon Sakinah, Meem Sakinah, Madd and Qalqalah. Students leave my classes reciting with confidence and a connection to the meaning of what they read. I also train teens preparing for Ijazah.",
    experience: 'Imam and Quran instructor at Masjid Al-Falah (8 yrs), Head of Quran Department at an international Islamic school (4 yrs).',
    education: [{ degree: 'B.A. Quranic Sciences', school: 'Islamic University of Madinah', year: 2013 }],
    certifications: [{ name: 'Ijazah in Hafs ‘an ‘Asim', org: 'Sheikh Ayman Suwaid', year: 2015 }, { name: 'Hifz of the complete Quran', org: 'Ma’had Tahfidh Al-Quran', year: 2009 }],
    awards: [{ name: 'Best Quran Teacher Award', org: 'National Quran Teachers Council', year: 2022 }],
    sampleLessons: ['Makharij: where each letter is born', 'Noon Sakinah & Tanween — the four rules'],
  },
  {
    id: 't4', slug: 'omar-farooq', name: 'Ustadh Omar Farooq', short: 'Omar F.', title: 'Ustadh', gender: 'm',
    photo: 'teachers/omar-farooq.jpg', portrait: 'teachers/omar-farooq-portrait.jpg',
    subjects: ['Islamic Studies', 'Fiqh & Aqeedah'], languages: ['English', 'Arabic', 'Urdu'], years: 8, rating: 4.9, reviews: 31, students: 140, country: 'Saudi Arabia',
    headline: 'Islamic Studies that turn knowledge into daily practice',
    bio: "I'm Ustadh Omar, an Islamic Studies teacher with 8 years of experience in schools and online. I teach Aqeedah (beliefs), Fiqh (worship: wudu, salah, fasting, zakah) and Akhlaq (character) in a way children can actually apply — we practise wudu step by step, pray together, and talk about real-life situations at school and home. My lessons mix stories, short quizzes and a weekly ‘Amal challenge’ so learning shows up in your child's daily habits, in sha Allah.",
    experience: 'Islamic Studies teacher at Al-Noor International School (6 yrs), online tutor (2 yrs).',
    education: [{ degree: 'B.A. Shariah', school: 'Umm Al-Qura University', year: 2016 }],
    certifications: [{ name: 'Diploma in Islamic Education', org: 'Islamic Online University', year: 2018 }],
    awards: [],
    sampleLessons: ['Wudu step by step — with a checklist for home', 'The six pillars of Iman'],
  },
  {
    id: 't5', slug: 'yusuf-al-amin', name: 'Sheikh Yusuf Al-Amin', short: 'Yusuf A.', title: 'Sheikh', gender: 'm',
    photo: 'teachers/yusuf-al-amin.jpg', portrait: 'teachers/yusuf-al-amin-portrait.jpg',
    subjects: ['Hifz (Memorization)', 'Tajweed & Ijazah'], languages: ['English', 'Arabic', 'Malay'], years: 10, rating: 5.0, reviews: 45, students: 160, country: 'Malaysia',
    headline: 'Hifz programs with a proven revision system',
    bio: "Assalamu alaikum. I'm Sheikh Yusuf Al-Amin, a Hafiz with Ijazah in Hafs and 10 years of experience guiding students through memorisation — from Juz Amma to the complete Quran. Memorisation is 20% new lessons and 80% revision, so my program is built around a daily Sabaq / Sabqi / Manzil system that parents can follow at home. I teach teens preparing for Ijazah with strict Tajweed correction and recitation etiquette. Every student gets a personal Hifz tracker and monthly recitation test.",
    experience: 'Hifz teacher at Ma’had Tahfiz Darul Quran (7 yrs), private Ijazah mentor (3 yrs).',
    education: [{ degree: 'B.A. Quran & Hadith', school: 'University of Jordan', year: 2015 }],
    certifications: [{ name: 'Ijazah in Hafs ‘an ‘Asim (Shatibiyyah)', org: 'Sheikh Dr. Yahya Al-Ghawthani', year: 2016 }],
    awards: [{ name: 'International Quran Competition — 2nd place', org: 'Dubai International Holy Quran Award', year: 2014 }],
    sampleLessons: ['How to memorise a new page in 20 minutes', 'Revision cycles: Sabaq, Sabqi, Manzil'],
  },
  {
    id: 't6', slug: 'bilal-ahmed', name: 'Ustadh Bilal Ahmed', short: 'Bilal A.', title: 'Ustadh', gender: 'm',
    photo: 'teachers/bilal-ahmed.jpg', portrait: 'teachers/bilal-ahmed-portrait.jpg',
    subjects: ['Quranic Arabic', 'Arabic for Beginners'], languages: ['English', 'Arabic', 'Urdu'], years: 5, rating: 4.9, reviews: 22, students: 80, country: 'United Kingdom',
    headline: 'Understand the Quran in Arabic — word by word',
    bio: "Hi, I'm Ustadh Bilal. I studied Arabic in Cairo and Amman and have taught Quranic Arabic online for 5 years to students aged 10 and up. My courses focus on the 300 most frequent words of the Quran (which cover ~70% of the text!) plus the essential grammar needed to understand ayat and duas directly. Lessons are interactive with flashcards, live quizzes and short translation challenges. I love seeing students' faces when Surah Al-Fatihah suddenly ‘makes sense’ in salah.",
    experience: 'Quranic Arabic instructor at Bayyinah-style community programs (3 yrs), online tutor (5 yrs).',
    education: [{ degree: 'B.A. Arabic & Islamic Studies', school: 'University of Leeds', year: 2019 }, { degree: 'Arabic Intensive Diploma', school: 'Qasid Institute, Amman', year: 2020 }],
    certifications: [{ name: 'Certified Online Teacher', org: 'Bright Academy Teacher Training', year: 2024 }],
    awards: [],
    sampleLessons: ['The 50 most frequent Quranic words', 'Pronouns in the Quran: huwa, hiya, hum'],
  },
  {
    id: 't7', slug: 'hamza-idris', name: 'Ustadh Hamza Idris', short: 'Hamza I.', title: 'Ustadh', gender: 'm',
    photo: 'teachers/hamza-idris.jpg', portrait: 'teachers/hamza-idris-portrait.jpg',
    subjects: ['Seerah & Prophets', 'Hadith'], languages: ['English', 'Arabic'], years: 6, rating: 4.8, reviews: 19, students: 70, country: 'United States',
    headline: 'Seerah, Stories of the Prophets and Hadith for young Muslims',
    bio: "Assalamu alaikum! I'm Ustadh Hamza, a youth educator and storyteller. I've spent 6 years teaching Seerah (the life of the Prophet ﷺ), Stories of the Prophets and Hadith to kids and teens at weekend schools and youth programs. My classes are discussion-based: we travel through the timeline of the Seerah, draw maps, act out events and extract practical lessons for school, friendships and family life. Teens study the 40 Hadith of Imam Nawawi with memorisation and real-life application.",
    experience: 'Youth director at a community masjid (4 yrs), weekend school teacher (6 yrs).',
    education: [{ degree: 'B.A. Islamic Studies', school: 'Zaytuna College', year: 2019 }],
    certifications: [{ name: 'Youth Mentoring Certificate', org: 'MAS Youth', year: 2021 }],
    awards: [],
    sampleLessons: ['The Year of Sorrow and the journey to Ta’if', '40 Hadith #1: Actions are by intentions'],
  },
]

export const CATEGORIES = [
  { id: 'quran', slug: 'quran', name: 'Quran', emoji: '📖', tagline: 'Reading, Tajweed & Hifz', desc: 'From Noorani Qaida to fluent recitation and memorisation with Ijazah-certified teachers.', color: 'bg-brand-50 text-brand-700' },
  { id: 'arabic', slug: 'arabic', name: 'Arabic Language', emoji: '🔤', tagline: 'Speak, read & understand', desc: 'Conversational Arabic for kids, Quranic Arabic and classical grammar for teens.', color: 'bg-sun-400/15 text-sun-600' },
  { id: 'islamic-studies', slug: 'islamic-studies', name: 'Islamic Studies', emoji: '🕌', tagline: 'Aqeedah, Fiqh, Seerah & Hadith', desc: 'Beliefs, worship and character — taught as daily practice, not just facts.', color: 'bg-emerald-50 text-emerald-700' },
  { id: 'little-muslims', slug: 'little-muslims', name: 'Little Muslims (4–8)', emoji: '🌙', tagline: 'Gentle first steps', desc: 'Qaida, daily duas, salah and stories for the youngest learners.', color: 'bg-coral-500/10 text-coral-600' },
]

export const SUBJECTS = ['Noorani Qaida', 'Quran Recitation', 'Tajweed', 'Hifz (Memorization)', 'Arabic Language', 'Quranic Arabic', 'Arabic Grammar', 'Islamic Studies', 'Fiqh & Aqeedah', 'Seerah & Prophets', 'Hadith', 'Duas & Salah']

const plans = (base) => [
  { id: 'starter', name: 'Starter Plan', tag: '', perWeek: 1, price: base, desc: 'Steady progress over time with focused weekly sessions', features: ['Basic course material', 'Weekly assignments', 'Feedback on progress'] },
  { id: 'growth', name: 'Growth Plan', tag: 'Most Popular', perWeek: 2, price: base * 2, desc: 'Noticeable improvement in 4–6 weeks with consistent practice', features: ['All Starter features', 'Monthly progress reports', 'Live Q&A sessions', 'Course certificate'] },
  { id: 'accelerated', name: 'Accelerated Plan', tag: 'Best Results', perWeek: 3, price: base * 3, desc: 'Fast-track to top performance with intensive coaching', features: ['All Growth features', 'One-on-one mentoring', 'Priority support', 'Advanced materials'] },
]

export const COURSES = [
  {
    id: 'c1', slug: 'noorani-qaida-first-steps-to-reading-quran', title: 'Noorani Qaida: First Steps to Reading Quran', subject: 'Noorani Qaida', category: 'quran', emoji: '🔠',
    teacherId: 't1', type: 'individual', level: 'Beginner', ages: [4, 9], weeks: 12, price: 80, rating: 5.0, reviews: 19, slots: 30, featured: true,
    summary: 'A gentle, structured program that takes complete beginners from Arabic letters to reading Quranic words and short surahs independently.',
    outcome: 'Read Quranic words and short surahs independently with correct letter sounds within 90 days.',
    skills: ['Arabic letters & sounds', 'Harakat (fatha, kasra, damma)', 'Joining letters', 'Sukoon, Tanween & Madd basics'],
    achieve: ['Recognise and pronounce all 29 Arabic letters from their correct Makhraj', 'Read words with short and long vowels fluently', 'Read Surah Al-Fatihah and the last 5 surahs from the Mushaf', 'Build a daily 10-minute Quran reading habit'],
    description: 'Our Noorani Qaida program is designed for children (and adults!) who cannot yet read Arabic script. Across 12 weeks we move lesson by lesson through the Qaida: individual letters, letters joined in words, harakat, tanween, sukoon, shaddah and the long vowels — always with the correct Makhraj from the very first day. Each live 1-on-1 lesson includes listening, repetition, reading practice and a short homework sheet. Parents receive a weekly note on what to practise at home.',
    curriculum: ['Letters & Makharij (weeks 1–3)', 'Joining letters & reading words (weeks 4–5)', 'Harakat, Tanween & Sukoon (weeks 6–8)', 'Shaddah, Madd & Leen letters (weeks 9–10)', 'Reading from the Mushaf: Al-Fatihah & short surahs (weeks 11–12)'],
  },
  {
    id: 'c2', slug: 'quran-recitation-with-tajweed', title: 'Quran Recitation with Tajweed (Nazirah)', subject: 'Quran Recitation', category: 'quran', emoji: '📖',
    teacherId: 't3', type: 'individual', level: 'Beginner', ages: [7, 16], weeks: 12, price: 80, rating: 5.0, reviews: 24, slots: 22, featured: true,
    summary: 'Recite the Quran fluently and beautifully. Live 1-on-1 correction of Makharij and the core rules of Tajweed, page by page.',
    outcome: 'Recite any page of the Quran fluently with correct Makharij and the core Tajweed rules within 12 weeks.',
    skills: ['Makharij & Sifaat', 'Noon Sakinah & Tanween rules', 'Meem Sakinah rules', 'Madd & Qalqalah'],
    achieve: ['Recite with correct articulation of every letter', 'Apply Izhar, Idgham, Iqlab and Ikhfa automatically', 'Recite one full Juz with a Tajweed accuracy of 90%+', 'Understand the etiquette (adab) of reciting the Quran'],
    description: 'This is our flagship recitation course for students who can already read Arabic but want to recite with confidence and beauty. Sheikh Abdullah listens to every ayah, corrects in real time and explains the rule behind each correction. We start with Makharij and Sifaat, move into the rules of Noon and Meem Sakinah, then Madd, Qalqalah, Laam and Raa. Students recite from the Mushaf every lesson and get a personalised Tajweed scorecard every month.',
    curriculum: ['Makharij & Sifaat of letters', 'Noon Sakinah & Tanween (4 rules)', 'Meem Sakinah (3 rules)', 'Types of Madd', 'Qalqalah, Laam & Raa rules', 'Waqf (stopping) and recitation etiquette'],
  },
  {
    id: 'c3', slug: 'juz-amma-hifz-program', title: 'Juz Amma Hifz Program (Memorization)', subject: 'Hifz (Memorization)', category: 'quran', emoji: '🧠',
    teacherId: 't5', type: 'individual', level: 'Beginner', ages: [6, 16], weeks: 24, price: 80, rating: 5.0, reviews: 17, slots: 14, featured: true,
    summary: 'Memorise the 37 surahs of Juz Amma with Tajweed using a proven Sabaq–Sabqi–Manzil revision system and a personal Hifz tracker.',
    outcome: 'Memorise all of Juz Amma (37 surahs) with Tajweed and a strong revision routine in 6 months.',
    skills: ['Memorisation technique', 'Daily revision system', 'Tajweed application', 'Recitation tests'],
    achieve: ['Memorise Juz Amma with correct Tajweed', 'Build a 15–20 minute daily Hifz routine', 'Pass monthly recitation tests with 95%+ accuracy', 'Lead the family in salah with newly memorised surahs'],
    description: 'Memorisation is a journey — we make it structured and joyful. Each lesson has three parts: Sabaq (new lines), Sabqi (recent revision) and Manzil (old revision). Sheikh Yusuf sets a realistic weekly target based on your child’s pace, records a model recitation for home practice, and tests each surah before moving on. Parents get a Hifz tracker and a WhatsApp-style weekly summary inside the app.',
    curriculum: ['An-Naas to Al-Feel', 'Al-Humazah to Ad-Duha', 'Al-Layl to Al-Fajr', 'Al-Ghashiyah to At-Tariq', 'Al-Buruj to At-Takwir', 'Abasa to An-Naba + full-Juz test'],
  },
  {
    id: 'c4', slug: 'arabic-for-kids-level-1', title: 'Arabic for Kids: Speak, Read & Write (Level 1)', subject: 'Arabic Language', category: 'arabic', emoji: '🗣️',
    teacherId: 't2', type: 'group', level: 'Beginner', ages: [6, 12], weeks: 12, price: 60, rating: 4.9, reviews: 21, slots: 8, featured: true, groupSize: 6,
    summary: 'A fun, interactive group course where children learn 300+ Arabic words, simple sentences and everyday conversation through games, songs and stories.',
    outcome: 'Hold a simple Arabic conversation, read and write short sentences and know 300+ words by the end of the term.',
    skills: ['Alphabet & phonics', 'Everyday vocabulary', 'Simple sentences', 'Speaking confidence'],
    achieve: ['Introduce themselves and their family in Arabic', 'Read and write 300+ words and simple sentences', 'Use greetings, numbers, colours, food and school vocabulary', 'Present a short Arabic talk at the end-of-term showcase'],
    description: 'Level 1 of our Arabic for Kids pathway. Small groups (max 6) keep every child speaking in every lesson. Ustadha Maryam uses total-physical-response games, songs, flashcards and picture stories so Arabic sounds become natural before children read and write them. Homework is short and playful (record yourself saying 5 words!). Two further levels take children to confident reading and conversation.',
    curriculum: ['Greetings & introductions', 'My family & home', 'Numbers, colours & shapes', 'Food & drink', 'School & daily routine', 'Showcase: my Arabic presentation'],
  },
  {
    id: 'c5', slug: 'quranic-arabic-understand-what-you-recite', title: 'Quranic Arabic: Understand What You Recite', subject: 'Quranic Arabic', category: 'arabic', emoji: '🔤',
    teacherId: 't6', type: 'group', level: 'Intermediate', ages: [10, 18], weeks: 12, price: 60, rating: 4.9, reviews: 14, slots: 6, featured: true, groupSize: 8,
    summary: 'Learn the 300 most frequent words of the Quran and the grammar you need to understand ayat and duas directly — no translation needed.',
    outcome: 'Understand ~70% of Quranic vocabulary and translate simple ayat and the daily duas word-by-word.',
    skills: ['High-frequency Quranic words', 'Ism, Fi‘l, Harf', 'Pronouns & prepositions', 'Word-by-word translation'],
    achieve: ['Recognise the 300 most frequent Quranic words', 'Translate Surah Al-Fatihah and the last 10 surahs word by word', 'Understand what you say in salah', 'Read simple Arabic texts with basic grammar'],
    description: 'Designed for students who can read Arabic and want the Quran to “make sense”. We start with the most frequent words (the top 300 cover ~70% of the Quran), then layer in essential grammar: the three word types, pronouns, prepositions, verb patterns and idafa. Every lesson ends with a live translation challenge from the Mushaf. Flashcard decks and quizzes are included in the app.',
    curriculum: ['Top 50 words & Al-Fatihah', 'Ism, Fi‘l, Harf', 'Pronouns & possession (idafa)', 'Past & present verbs', 'Prepositions & word order', 'Translating the last 10 surahs'],
  },
  {
    id: 'c6', slug: 'islamic-studies-foundations', title: 'Islamic Studies Foundations: Aqeedah, Fiqh & Akhlaq', subject: 'Islamic Studies', category: 'islamic-studies', emoji: '🕌',
    teacherId: 't4', type: 'individual', level: 'Beginner', ages: [6, 14], weeks: 12, price: 80, rating: 4.9, reviews: 16, slots: 18, featured: true,
    summary: 'A comprehensive Islamic education program covering beliefs, worship and character — with a weekly ‘Amal challenge so learning becomes daily practice.',
    outcome: 'Know the pillars of Iman and Islam, perform wudu and salah independently, and apply Islamic manners at home and school.',
    skills: ['Six pillars of Iman', 'Wudu & Salah step by step', 'Daily duas & dhikr', 'Akhlaq & adab'],
    achieve: ['Explain the pillars of Islam and Iman in their own words', 'Perform wudu and the five daily prayers correctly and independently', 'Memorise 20 daily duas with meanings', 'Practise honesty, kindness and respect through weekly ‘Amal challenges'],
    description: 'This program gives children an authentic, age-appropriate understanding of Islam that they can live. Ustadh Omar teaches Aqeedah with stories and questions children actually ask, Fiqh with hands-on practice (we do wudu together on camera!), and Akhlaq through the Seerah and real scenarios. Every week has a practical challenge and a short quiz; every month parents receive a report on knowledge and practice.',
    curriculum: ['Who is Allah? Tawheed for kids', 'The six pillars of Iman', 'Purification & wudu', 'Salah: steps, timings & mistakes', 'Fasting, Zakah & Hajj basics', 'Akhlaq: manners of the Prophet ﷺ'],
  },
  {
    id: 'c7', slug: 'seerah-and-stories-of-the-prophets', title: 'Seerah & Stories of the Prophets', subject: 'Seerah & Prophets', category: 'islamic-studies', emoji: '🕋',
    teacherId: 't7', type: 'group', level: 'Beginner', ages: [7, 14], weeks: 12, price: 60, rating: 4.8, reviews: 12, slots: 9, groupSize: 8,
    summary: 'Travel through the life of the Prophet ﷺ and the stories of 25 prophets in a lively, discussion-based group class with maps, timelines and lessons for today.',
    outcome: 'Narrate the key events of the Seerah in order and draw practical lessons from the lives of the Prophets.',
    skills: ['Seerah timeline', '25 Prophets', 'Lessons & values', 'Discussion & presentation'],
    achieve: ['Recall the major events of the Seerah from birth to Hijrah to Madinah', 'Know the stories of 25 Prophets and their key lessons', 'Connect prophetic character to situations at school and home', 'Create a personal illustrated Seerah timeline'],
    description: 'Ustadh Hamza brings the Seerah alive with storytelling, maps and role-play. Students build their own illustrated timeline across the term, discuss “what would the Prophet ﷺ do?” scenarios and present a story of a Prophet to the group at the end of the course.',
    curriculum: ['Makkah before Islam & the birth of the Prophet ﷺ', 'Revelation & the early Muslims', 'Boycott, Ta’if & Isra wal Mi’raj', 'Hijrah & the first years in Madinah', 'Stories of Adam, Nuh, Ibrahim & Musa', 'Stories of Yusuf, Isa and the final years'],
  },
  {
    id: 'c8', slug: '40-hadith-for-young-muslims', title: 'Hadith for Young Muslims: 40 Hadith of Imam Nawawi', subject: 'Hadith', category: 'islamic-studies', emoji: '📜',
    teacherId: 't7', type: 'group', level: 'Intermediate', ages: [10, 17], weeks: 12, price: 60, rating: 4.9, reviews: 8, slots: 7, groupSize: 8,
    summary: 'Memorise, understand and live the 40 Hadith of Imam Nawawi — the classic foundation text — in a teen-friendly weekly circle.',
    outcome: 'Memorise 20 hadith in Arabic with meanings and explain the lessons of all 40.',
    skills: ['Hadith memorisation', 'Meaning & context', 'Applying hadith', 'Hadith terminology basics'],
    achieve: ['Memorise 20 hadith in Arabic with translation', 'Explain the core lesson of each of the 40 hadith', 'Understand basic hadith terminology (sahih, hasan, isnad)', 'Apply one hadith per week as a personal challenge'],
    description: 'A weekly circle for teens built around Imam Nawawi’s 40 Hadith. Each session covers 3–4 hadith with context, vocabulary and practical application, followed by discussion. Students keep a hadith journal and lead a short reflection once per term.',
    curriculum: ['Intentions, Islam–Iman–Ihsan', 'Halal, haram & the heart', 'Sincerity & brotherhood', 'Avoiding harm & good character', 'Dua, repentance & hope', 'Review & memorisation test'],
  },
  {
    id: 'c9', slug: 'tajweed-mastery-and-ijazah-preparation', title: 'Tajweed Mastery & Ijazah Preparation', subject: 'Tajweed', category: 'quran', emoji: '🎓',
    teacherId: 't5', type: 'individual', level: 'Advanced', ages: [12, 18], weeks: 24, price: 120, rating: 5.0, reviews: 9, slots: 4,
    summary: 'Advanced Tajweed theory (Tuhfat al-Atfal & Al-Jazariyyah) with rigorous recitation practice for students aiming for Ijazah in Hafs ‘an ‘Asim.',
    outcome: 'Recite the complete Quran with precise Tajweed and pass the Ijazah recitation assessment.',
    skills: ['Tuhfat al-Atfal', 'Al-Jazariyyah basics', 'Precise Makharij & Sifaat', 'Full-Quran recitation'],
    achieve: ['Explain Tajweed rules with their evidences from the classical texts', 'Recite with precision under examination conditions', 'Complete a full Quran recitation (khatmah) to the Sheikh', 'Receive a recommendation for Ijazah assessment'],
    description: 'For serious students. We study the classical Tajweed poems, correct subtle errors in Makharij and Sifaat, and progress through the Mushaf juz by juz until a full khatmah is recited to the Sheikh. Progress is recorded in a detailed recitation log.',
    curriculum: ['Tuhfat al-Atfal (full)', 'Makharij & Sifaat in depth', 'Madd in detail & rare rules', 'Al-Jazariyyah selections', 'Khatmah recitation (juz 1–15)', 'Khatmah recitation (juz 16–30) & assessment'],
  },
  {
    id: 'c10', slug: 'daily-duas-and-salah-for-little-muslims', title: 'Daily Duas & Salah for Little Muslims', subject: 'Duas & Salah', category: 'little-muslims', emoji: '🌙',
    teacherId: 't1', type: 'group', level: 'Beginner', ages: [4, 8], weeks: 8, price: 50, rating: 5.0, reviews: 11, slots: 10, groupSize: 6,
    summary: 'Songs, stories and gentle repetition help little ones memorise 15 daily duas, learn wudu and the movements of salah.',
    outcome: 'Memorise 15 daily duas and perform wudu and a two-rak‘ah salah with help.',
    skills: ['15 daily duas', 'Wudu steps', 'Salah movements', 'Surah Al-Fatihah'],
    achieve: ['Recite morning, eating, sleeping and masjid duas from memory', 'Perform wudu with a parent’s supervision', 'Know the positions and words of salah', 'Love and look forward to their Islam lessons!'],
    description: 'A joyful 8-week group class for ages 4–8. Each 30-minute lesson uses songs, puppets, stories and movement breaks. Parents join the last 5 minutes to learn what to practise at home.',
    curriculum: ['Bismillah & our first duas', 'Duas for eating & sleeping', 'Wudu song & practice', 'Salah: standing, bowing, prostrating', 'Surah Al-Fatihah', 'Our first full salah together'],
  },
  {
    id: 'c11', slug: 'arabic-grammar-nahw-and-sarf-intensive', title: 'Arabic Grammar (Nahw) & Morphology (Sarf) Intensive', subject: 'Arabic Grammar', category: 'arabic', emoji: '📚',
    teacherId: 't2', type: 'individual', level: 'Intermediate', ages: [13, 18], weeks: 16, price: 80, rating: 4.9, reviews: 6, slots: 8,
    summary: 'Classical Arabic grammar and morphology for teens who want to read the Quran, Hadith and Islamic texts in the original.',
    outcome: 'Parse (i‘rab) simple Quranic sentences and read vowelled classical texts with understanding.',
    skills: ['Nahw: sentence structure', 'Sarf: verb patterns', 'I‘rab (parsing)', 'Reading classical texts'],
    achieve: ['Identify subject, predicate, object and their cases', 'Conjugate regular verbs in past, present and imperative', 'Parse ayat from Juz Amma', 'Read a page of Riyad as-Salihin with understanding'],
    description: 'Based on Al-Ajurrumiyyah and a modern Sarf workbook, this 1-on-1 intensive gives teens a real foundation in classical Arabic. Every lesson applies the grammar to the Quran and Hadith immediately.',
    curriculum: ['Kalimah & the nominal sentence', 'Cases & signs of i‘rab', 'The verbal sentence', 'Sarf: the three-letter verb', 'Derived forms & nouns', 'Reading & parsing practice'],
  },
  {
    id: 'c12', slug: '90-day-quran-reading-bootcamp', title: '90-Day Quran Reading Bootcamp (Group)', subject: 'Quran Recitation', category: 'quran', emoji: '🚀',
    teacherId: 't3', type: 'group', level: 'Beginner', ages: [8, 16], weeks: 12, price: 60, rating: 5.0, reviews: 7, slots: 5, groupSize: 6,
    summary: 'A comprehensive group Quran program designed to help students build fluent reading and basic Tajweed in 90 days with daily accountability.',
    outcome: 'Go from slow, hesitant reading to fluent recitation of any page with basic Tajweed in 90 days.',
    skills: ['Fluency drills', 'Basic Tajweed', 'Daily reading habit', 'Group recitation'],
    achieve: ['Read any page of the Mushaf without stopping', 'Apply basic Tajweed (Madd, Ghunnah, Qalqalah)', 'Complete 2 Juz of reading during the bootcamp', 'Keep a 90-day reading streak'],
    description: 'Small groups (max 6) meet live with Sheikh Abdullah, with daily reading check-ins in the app. Friendly competition, streaks and weekly fluency tests keep everyone motivated.',
    curriculum: ['Diagnostic & fluency baseline', 'Long vowels & Madd', 'Ghunnah & Qalqalah', 'Stopping & starting correctly', 'Fluency drills: Juz 29–30', 'Final fluency test & celebration'],
  },
]
COURSES.forEach((c) => { c.plans = plans(c.price) })

export const HERO_CARDS = [
  { subject: 'Quran', label: 'HIFZ · 6 MONTHS', big: 'Juz Amma', quote: '“He recites the whole of Juz Amma in salah now — with Tajweed.”', who: 'Yusuf, 9', tone: 'from-brand-50 to-white', icon: '📖' },
  { subject: 'Tajweed', label: 'RULES MASTERED · 1 TERM', big: '0 → 15', quote: '“Her recitation makes my mother cry. Alhamdulillah.”', who: 'Zaynab, 12', tone: 'from-sun-400/15 to-white', icon: '🎧' },
  { subject: 'Arabic', label: 'CEFR LEVEL · 3 MONTHS', big: 'A0 → A2', quote: '“She surprises the family with Arabic at dinner every night.”', who: 'Maryam, 10', tone: 'from-emerald-50 to-white', icon: '🔤' },
  { subject: 'Islamic Studies', label: 'SALAH · 8 WEEKS', big: 'On his own', quote: '“He now wakes us up for Fajr. I’m not even joking.”', who: 'Ibrahim, 8', tone: 'from-coral-500/10 to-white', icon: '🕌' },
]

export const STATS = [
  { value: 96, suffix: '%', label: 'of students read Quran fluently within 6 months' },
  { value: 850, suffix: '+', label: 'families trust Bright Academy every week' },
  { value: 1200, suffix: '+', label: 'live lessons delivered weekly' },
  { value: 4.9, suffix: '★', label: 'average teacher rating from parents', decimals: 1 },
]

export const HOW_IT_WORKS = [
  { n: '01', title: 'Tell us about your child', desc: 'Age, current level and goals — our quick quiz matches the right Quran, Arabic or Islamic Studies track in minutes.' },
  { n: '02', title: 'Meet the teacher, free', desc: 'Book a no-cost trial lesson, see the live classroom and get a short assessment report from the teacher.' },
  { n: '03', title: 'Learn live, every week', desc: 'Small structured classes with homework, recitation feedback and progress you can see in your parent dashboard.' },
]

export const HOW_IT_WORKS_LONG = [
  { n: 1, title: 'Choose a Course', desc: 'Browse our structured programs by subject, age group or goal. Each course has clear outcomes, a week-by-week curriculum and transparent pricing.' },
  { n: 2, title: 'Take a Free Trial & Assessment', desc: 'A short live session determines your child’s current level (Qaida, Nazirah, Hifz, Arabic level) so they begin exactly where they need to.' },
  { n: 3, title: 'Start Learning', desc: 'Your child is matched with an expert teacher who follows a structured lesson plan. Every session builds on the last: revision, new skill, practice and feedback.' },
  { n: 4, title: 'Track Progress', desc: 'Receive weekly reports showing what your child learned, recitation accuracy, homework scores and attendance — all in one dashboard.' },
]

export const TESTIMONIALS = [
  { name: 'Nadia A.', role: 'Parent · Noorani Qaida', text: 'My daughter went from not knowing the letters to reading Surah Al-Fatihah in 10 weeks. The live teacher makes all the difference.' },
  { name: 'Bilal K.', role: 'Parent · Hifz Program', text: 'The revision system actually works. He has finished Juz Amma and still remembers every surah. The tracker keeps us honest at home.' },
  { name: 'Fatima R.', role: 'Parent · Arabic for Kids', text: 'Small classes mean the teacher actually knows my son. He speaks Arabic with his grandmother now — she is overjoyed.' },
  { name: 'Daud S.', role: 'Parent · Tajweed', text: 'Structured, calm and serious about Tajweed. The monthly scorecard shows exactly which rules improved.' },
  { name: 'Aisha M.', role: 'Parent · Islamic Studies', text: 'The classes are gentle and consistent. My kids look forward to them every week and the ‘Amal challenges changed our home.' },
  { name: 'Sarah L.', role: 'Parent · Seerah', text: 'Reports every term, real homework, real feedback. It feels like a proper madrasah — online.' },
]

export const PRICING = [
  { id: 'group', name: 'Group Classes', from: 15, mo: 60, desc: 'Small groups of 4–8 students. Perfect for motivated learners who thrive alongside peers.', features: ['Live sessions 2× per week', 'Groups of max 8 students', 'Monthly progress report', 'Recorded lesson replays', 'Workbook & flashcards included'], cta: 'Browse group courses', href: '/courses?type=group' },
  { id: 'individual', name: '1-on-1 Tutoring', from: 20, mo: 80, desc: 'Fully personalised. The teacher adapts every lesson to your child’s pace, level and goals.', features: ['Sessions scheduled around you', '100% personalised curriculum', 'Monthly parent check-in call', 'Recitation review & feedback', 'Goal tracking dashboard', 'Free rescheduling (24h notice)'], cta: 'Browse 1-on-1 courses', href: '/courses?type=individual', popular: true },
]

export const FAQS = [
  { q: 'What ages do you teach?', a: 'Bright Academy offers courses for children and teens aged 4 to 18. Each course specifies its age range — you can filter by age on our courses page to find the right fit. We also welcome adult beginners in Qaida and Tajweed courses.' },
  { q: 'Are lessons live or pre-recorded?', a: 'All lessons are live, taught in real time by a qualified teacher in our virtual classroom. Sessions can be recorded so your child can rewatch any lesson they missed or want to review.' },
  { q: 'Are your teachers qualified?', a: 'Yes. Every Quran teacher holds an Ijazah or a recognised Quranic Sciences degree, and all teachers pass a recitation/subject assessment, a teaching demo and a background check before joining.' },
  { q: "What if my child doesn't connect with their teacher?", a: 'No problem at all. We offer a free teacher replacement — just let us know within the first two sessions and we will find a better match at no extra cost.' },
  { q: 'How many students are in a group class?', a: 'Group classes are capped at 6–8 students maximum. This keeps interaction high and ensures every child recites and speaks in every lesson.' },
  { q: 'Can I cancel or pause a subscription?', a: 'Yes. There are no long-term contracts. You can pause or cancel anytime from your parent dashboard. Unused sessions are carried forward, never lost.' },
  { q: 'What technology do we need?', a: 'Just a laptop, tablet or desktop with a stable internet connection. Our virtual classroom runs in the browser — no downloads required. A headset is recommended for the best audio quality during recitation.' },
  { q: 'Is there a free trial?', a: 'Yes — you can book a free trial lesson with the teacher. They will assess your child’s level, recommend the right course and plan, and you can attend the first session risk-free.' },
  { q: "How do I track my child's progress?", a: 'Every parent gets a dashboard with monthly progress reports, attendance records, homework scores, recitation accuracy and teacher notes. We also send a detailed term report every 8 weeks.' },
]

export const RESULTS = {
  stats: [{ v: '93%', l: 'Student Attendance' }, { v: '89%', l: 'Student Retention' }, { v: '4.9/5', l: 'Parent Satisfaction' }, { v: '850+', l: 'Students Served' }, { v: '95%', l: 'Course Completion Rate' }],
  transformations: [
    { subject: 'Quran Reading', before: 'Can’t read', after: 'Fluent' }, { subject: 'Tajweed Rules', before: '0', after: '15' }, { subject: 'Surahs Memorised', before: '3', after: '37' }, { subject: 'Arabic Vocabulary', before: '0', after: '500+' },
    { subject: 'Salah', before: 'With help', after: 'Independent' }, { subject: 'Daily Duas', before: '2', after: '20' }, { subject: 'Recitation Accuracy', before: '54%', after: '94%' }, { subject: 'Quranic Words Understood', before: '5%', after: '70%' },
  ],
  certificates: [
    { title: 'Juz Amma Hifz Completion Certificate', org: 'Bright Academy Quran Department' }, { title: 'Noorani Qaida Completion', org: 'Bright Academy' }, { title: 'Tajweed Level 2 — Distinction', org: 'Bright Academy Quran Department' }, { title: 'Arabic Level 1 Certificate', org: 'Bright Academy Arabic Department' },
  ],
  stories: [{ quote: 'I never thought I could memorise a whole Juz. Now I lead Maghrib at home and my dad cries every time.', who: 'Yusuf N., 9', detail: 'Completed Juz Amma in 6 months' }, { quote: 'I finally understand what I say in salah. It feels completely different now.', who: 'Hafsa B., 14', detail: 'Quranic Arabic graduate' }],
  works: [{ title: 'My Illustrated Seerah Timeline', score: 95, meta: 'Seerah · Ibrahim A., Age 9' }, { title: 'Six Pillars of Iman — Poster', score: 92, meta: 'Islamic Studies · Khadija M., Age 8' }, { title: 'Arabic Story: Yawm fi al-Madrasah', score: 90, meta: 'Arabic · Maryam N., Age 10' }],
  parents: [{ name: 'Farida', detail: 'Parent of Amina, 7', quote: 'I am very grateful I found Bright Academy. Amina reads Qaida lesson 17 already and asks for her class every day.' }, { name: 'Ahmed M.', detail: 'Dad of Hamza', quote: 'Hamza’s Tajweed improved so much that the imam at our masjid asked where he learned. Alhamdulillah.' }, { name: 'Sumaya', detail: 'Mom of Musa & Safiya', quote: 'Two kids, two teachers, one dashboard. Scheduling around school has been effortless.' }],
}

export const HELP_ARTICLES = [
  { q: 'How do I join a live class?', a: 'Go to Sessions (or your Dashboard) and click “Enter Classroom” up to 10 minutes before the start time. Allow camera and microphone access when your browser asks.' },
  { q: 'How do I reschedule a lesson?', a: 'Parents and students can request a new time from the Schedule page (24 hours notice). The teacher approves or proposes another time. Requests inside 24h are auto-approved once per month.' },
  { q: 'Where are lesson recordings?', a: 'Recordings appear under Recordings within a few minutes of the class ending (when recording was enabled by the teacher). Students and parents can watch them any time.' },
  { q: 'How do payments work?', a: 'Plans renew monthly. You can pause or cancel anytime from Payments. Unused sessions roll over to the next month.' },
  { q: 'How do I contact my teacher?', a: 'Use Messages in your portal. Teachers usually reply within one working day. Messages are monitored for child safety.' },
]

export const DEMO_STUDENT_NAMES = ['Alisher Karimov', 'Zaynab Hussain', 'Ibrahim Ali', 'Khadija Mahmood', 'Ahmad Rizwan', 'Hafsa Begum', 'Bilal Osman', 'Sumayyah Adams', 'Imran Siddiqui', 'Amina Yusupova', 'Hamza Khan', 'Ruqayyah Bello', 'Musa Abdullah', 'Safiya Rahman', 'Idris Malik', 'Zahra Qureshi', 'Tariq Aziz', 'Layla Haddad', 'Umar Farouk', 'Aminah Sulaiman', 'Dawud Osei']
