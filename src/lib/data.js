// Bright Academy — general online academy content
export const BRAND = {
  name: 'Bright Academy',
  email: 'hello@brightacademy.example',
  phone: '+1 (555) 010-2030',
}

// Subject colours — full literal class strings so Tailwind keeps them in the build
export const SUBJECT_COLORS = {
  sky: { color: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  emerald: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  violet: { color: 'bg-violet-100 text-violet-800 border-violet-200', dot: 'bg-violet-500' },
  slate: { color: 'bg-slate-200 text-slate-800 border-slate-300', dot: 'bg-slate-600' },
  teal: { color: 'bg-teal-100 text-teal-800 border-teal-200', dot: 'bg-teal-600' },
  amber: { color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  rose: { color: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
  orange: { color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  lime: { color: 'bg-lime-100 text-lime-800 border-lime-200', dot: 'bg-lime-600' },
  indigo: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
  pink: { color: 'bg-pink-100 text-pink-800 border-pink-200', dot: 'bg-pink-500' },
  cyan: { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', dot: 'bg-cyan-600' },
  stone: { color: 'bg-stone-200 text-stone-800 border-stone-300', dot: 'bg-stone-600' },
}
// Icon names (lucide) the admin can choose from — mapped to components in components/app/common.jsx
export const SUBJECT_ICONS = ['BookOpen', 'Calculator', 'FlaskConical', 'Atom', 'Languages', 'Code2', 'Type', 'Landmark', 'ChessKnight', 'Music', 'Palette', 'Globe', 'PenTool', 'Brain', 'Microscope', 'Sigma', 'Leaf', 'History', 'Lightbulb', 'Rocket', 'Trophy', 'Mic', 'Camera', 'GraduationCap']

// Built-in subjects. The admin can edit or hide these and add new ones (stored in the `subjects` collection).
export const DEFAULT_SUBJECTS = [
  { id: 'math', name: 'Math', icon: 'Calculator', colorKey: 'sky', desc: 'From counting and fractions to algebra and geometry — confidence first.' },
  { id: 'science', name: 'Science', icon: 'FlaskConical', colorKey: 'emerald', desc: 'Biology, chemistry and physics explained with real-life examples.' },
  { id: 'esl', name: 'English (ESL)', icon: 'Languages', colorKey: 'violet', desc: 'Speaking, reading and writing English with patient native-level tutors.' },
  { id: 'programming', name: 'Computer Programming', icon: 'Code2', colorKey: 'slate', desc: 'Scratch for beginners, then Python and web — building real projects.' },
  { id: 'chess', name: 'Chess', icon: 'ChessKnight', colorKey: 'stone', desc: 'Rules, tactics and strategy — sharper thinking one move at a time.' },
  { id: 'quran', name: "Qur'an", icon: 'BookOpen', colorKey: 'teal', desc: 'Reading, Tajweed and memorisation with qualified teachers.' },
  { id: 'arabic', name: 'Arabic', icon: 'Type', colorKey: 'amber', desc: 'Conversational and classical Arabic for kids and teens.' },
  { id: 'islamic', name: 'Islamic Studies', icon: 'Landmark', colorKey: 'rose', desc: 'Beliefs, worship, history and good character.' },
]

const withColor = (s) => ({ ...s, ...(SUBJECT_COLORS[s.colorKey] || SUBJECT_COLORS.slate) })
// Defaults overridden by admin records (same id), then admin-added subjects. Includes hidden ones.
export function mergeSubjects(records = []) {
  const byId = new Map(records.map((r) => [r.id, r]))
  const merged = DEFAULT_SUBJECTS.map((d) => ({ ...d, builtIn: true, ...byId.get(d.id) }))
  const extra = records.filter((r) => !DEFAULT_SUBJECTS.some((d) => d.id === r.id)).sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')))
  return [...merged, ...extra].map(withColor)
}

// Module-level registry so plain lookups (subjectById) see admin changes; kept in sync by the store.
let REGISTRY = mergeSubjects()
export const setSubjectRecords = (records) => { REGISTRY = mergeSubjects(records) }
export const subjectById = (id) => REGISTRY.find((s) => s.id === id) || { id, name: id || 'Class', icon: 'BookOpen', ...SUBJECT_COLORS.slate, color: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-400' }

// Homepage teacher strip (static marketing content)
export const TEACHERS = [
  {
    id: 't1', slug: 'nurlaila-i', name: 'Ustoza Nurlaila I.', short: 'Nurlaila I.', title: 'Ustoza', gender: 'f',
    photo: 'teachers/nurlaila-i.jpg', portrait: 'teachers/nurlaila-i-portrait.jpg',
    subjects: ['Noorani Qaida', 'Quran for Kids'], languages: ['English', 'Malay', 'Arabic (Quranic)'], years: 7, rating: 5.0, reviews: 38, students: 120, country: 'Malaysia',
    headline: 'Noorani Qaida & Quran foundations for young learners',
    bio: "Assalamu alaikum! I'm Ustoza Nurlaila, an Ijazah-certified Quran teacher with 7 years of experience teaching children aged 4–12. I specialise in Noorani Qaida and the very first steps of Quran reading — letters, harakat, joining and the basic Tajweed that makes recitation beautiful from day one. My classes are gentle, playful and structured: every lesson has a warm-up, a new skill, guided practice and a small win to celebrate. I also teach daily duas and the adab of the Quran so children fall in love with the Book of Allah, not just learn to decode it.",
    experience: 'Quran teacher at Darul Huda Learning Centre (5 yrs), online Quran tutor for families in the UK, US and Malaysia (3 yrs).',
    education: [{ degree: 'B.A. Islamic Studies', school: 'International Islamic University Malaysia', year: 2017 }],
    certifications: [{ name: 'Ijazah in Hafs ‘an ‘Asim', org: 'Certified sanad (unbroken chain of transmission)', year: 2019 }, { name: 'Teaching Quran to Children Certificate', org: 'Al-Huda Institute', year: 2018 }],
    awards: [{ name: 'Top-rated Teacher (Parents’ Choice)', org: 'Bright Academy', year: 2025 }],
    sampleLessons: ['Letters with Fatha — Noorani Qaida Lesson 3', 'Joining letters: from sounds to words'],
  },
  {
    id: 't2', slug: 'farwiza-a', name: 'Ustoza Farwiza A.', short: 'Farwiza A.', title: 'Ustoza', gender: 'f',
    photo: 'teachers/farwiza-a.jpg', portrait: 'teachers/farwiza-a-portrait.jpg',
    subjects: ['Arabic Language', 'Arabic Grammar'], languages: ['English', 'Arabic', 'Malay'], years: 6, rating: 4.9, reviews: 27, students: 95, country: 'Malaysia',
    headline: 'Arabic for kids and teens — speaking, reading and grammar',
    bio: "Hello! I'm Ustoza Farwiza, an Arabic language teacher with a degree in Arabic Linguistics and 6 years of classroom and online experience. I teach Arabic the way children actually acquire language: lots of listening, speaking games, stories and songs — then reading and writing once the sounds feel natural. For teens I run structured Nahw (grammar) and Sarf (morphology) courses that unlock the Quran and classical texts. Parents love that every term ends with a small presentation their child gives in Arabic!",
    experience: 'Arabic teacher at Sekolah Rendah Islam Al-Amin (4 yrs), curriculum designer for online Arabic programs (2 yrs).',
    education: [{ degree: 'B.A. Arabic Language & Linguistics', school: 'Al-Azhar University', year: 2018 }],
    certifications: [{ name: 'Teaching Arabic to Non-Native Speakers (TAFL)', org: 'Qasid Institute', year: 2019 }],
    awards: [],
    sampleLessons: ['My family — ‘Ā’ilatī (vocabulary + dialogue)', 'Ism, Fi‘l, Harf: the three words of Arabic'],
  },
  {
    id: 't3', slug: 'rayyannoor-d', name: 'Shaykh Rayyannoor D.', short: 'Rayyannoor D.', title: 'Shaykh', gender: 'm',
    photo: 'teachers/rayyannoor-d.jpg', portrait: 'teachers/rayyannoor-d-portrait.jpg',
    subjects: ['Quran Recitation', 'Tajweed'], languages: ['English', 'Arabic', 'Indonesian'], years: 12, rating: 5.0, reviews: 64, students: 210, country: 'Indonesia',
    headline: 'Tajweed-perfect recitation, from first words to fluency',
    bio: "Assalamu alaikum wa rahmatullah. I am Shaykh Rayyannoor, a Hafiz and Ijazah holder with over 12 years of teaching Quran to students of all ages. My approach is simple: listen, repeat, correct, repeat again — with patience. I focus on Makharij (articulation points) and Sifaat (characteristics) of letters before moving to the rules of Noon Sakinah, Meem Sakinah, Madd and Qalqalah. Students leave my classes reciting with confidence and a connection to the meaning of what they read. I also train teens preparing for Ijazah.",
    experience: 'Imam and Quran instructor at Masjid Al-Falah (8 yrs), Head of Quran Department at an international Islamic school (4 yrs).',
    education: [{ degree: 'B.A. Quranic Sciences', school: 'Islamic University of Madinah', year: 2013 }],
    certifications: [{ name: 'Ijazah in Hafs ‘an ‘Asim', org: 'Certified sanad in recitation', year: 2015 }, { name: 'Hifz of the complete Quran', org: 'Ma’had Tahfidh Al-Quran', year: 2009 }],
    awards: [{ name: 'Best Quran Teacher Award', org: 'National Quran Teachers Council', year: 2022 }],
    sampleLessons: ['Makharij: where each letter is born', 'Noon Sakinah & Tanween — the four rules'],
  },
  {
    id: 't4', slug: 'abdul-azyz-s', name: 'Shaykh Abdul-azyz S.', short: 'Abdul-azyz S.', title: 'Shaykh', gender: 'm',
    photo: 'teachers/abdul-azyz-s.jpg', portrait: 'teachers/abdul-azyz-s-portrait.jpg',
    subjects: ['Islamic Studies', 'Fiqh & Aqeedah'], languages: ['English', 'Arabic', 'Urdu'], years: 8, rating: 4.9, reviews: 31, students: 140, country: 'Saudi Arabia',
    headline: 'Islamic Studies that turn knowledge into daily practice',
    bio: "I'm Shaykh Abdul-azyz, an Islamic Studies teacher with 8 years of experience in schools and online. I teach Aqeedah (beliefs), Fiqh (worship: wudu, salah, fasting, zakah) and Akhlaq (character) in a way children can actually apply — we practise wudu step by step, pray together, and talk about real-life situations at school and home. My lessons mix stories, short quizzes and a weekly ‘Amal challenge’ so learning shows up in your child's daily habits, in sha Allah.",
    experience: 'Islamic Studies teacher at Al-Noor International School (6 yrs), online tutor (2 yrs).',
    education: [{ degree: 'B.A. Shariah', school: 'Taif University, Saudi Arabia', year: 2016 }],
    certifications: [{ name: 'Diploma in Islamic Education', org: 'Islamic Online University', year: 2018 }],
    awards: [],
    sampleLessons: ['Wudu step by step — with a checklist for home', 'The six pillars of Iman'],
  },
  {
    id: 't5', slug: 'jamie-al-haqq-j', name: 'Shaykh Jamie Al-haqq J.', short: 'Jamie A.', title: 'Shaykh', gender: 'm',
    photo: 'teachers/jamie-al-haqq-j.jpg', portrait: 'teachers/jamie-al-haqq-j-portrait.jpg',
    subjects: ['Hifz (Memorization)', 'Tajweed & Ijazah'], languages: ['English', 'Arabic', 'Malay'], years: 10, rating: 5.0, reviews: 45, students: 160, country: 'Malaysia',
    headline: 'Hifz programs with a proven revision system',
    bio: "Assalamu alaikum. I'm Shaykh Jamie Al-haqq, a Hafiz with Ijazah in Hafs and 10 years of experience guiding students through memorisation — from Juz Amma to the complete Quran. Memorisation is 20% new lessons and 80% revision, so my program is built around a daily Sabaq / Sabqi / Manzil system that parents can follow at home. I teach teens preparing for Ijazah with strict Tajweed correction and recitation etiquette. Every student gets a personal Hifz tracker and monthly recitation test.",
    experience: 'Hifz teacher at Ma’had Tahfiz Darul Quran (7 yrs), private Ijazah mentor (3 yrs).',
    education: [{ degree: 'B.A. Quran & Hadith', school: 'Taif University, Saudi Arabia', year: 2015 }],
    certifications: [{ name: 'Ijazah in Hafs ‘an ‘Asim (Shatibiyyah)', org: 'Certified sanad (Shatibiyyah route)', year: 2016 }],
    awards: [{ name: 'International Quran Competition — 2nd place', org: 'Dubai International Holy Quran Award', year: 2014 }],
    sampleLessons: ['How to memorise a new page in 20 minutes', 'Revision cycles: Sabaq, Sabqi, Manzil'],
  },
  {
    id: 't6', slug: 'shuaib-i', name: 'Shaykh Shuaib I.', short: 'Shuaib I.', title: 'Shaykh', gender: 'm',
    photo: 'teachers/shuaib-i.jpg', portrait: 'teachers/shuaib-i-portrait.jpg',
    subjects: ['Quranic Arabic', 'Arabic for Beginners'], languages: ['English', 'Arabic', 'Urdu'], years: 5, rating: 4.9, reviews: 22, students: 80, country: 'United Kingdom',
    headline: 'Understand the Quran in Arabic — word by word',
    bio: "Hi, I'm Shaykh Shuaib. I studied Arabic in Madinah and have taught Quranic Arabic online for 5 years to students aged 10 and up. My courses focus on the 300 most frequent words of the Quran (which cover ~70% of the text!) plus the essential grammar needed to understand ayat and duas directly. Lessons are interactive with flashcards, live quizzes and short translation challenges. I love seeing students' faces when Surah Al-Fatihah suddenly ‘makes sense’ in salah.",
    experience: 'Quranic Arabic instructor at Bayyinah-style community programs (3 yrs), online tutor (5 yrs).',
    education: [{ degree: 'B.A. Arabic & Islamic Studies', school: 'Islamic University of Madinah, Saudi Arabia', year: 2019 }, { degree: 'Arabic Intensive Diploma', school: 'Qasid Institute, Amman', year: 2020 }],
    certifications: [{ name: 'Certified Online Teacher', org: 'Bright Academy Teacher Training', year: 2024 }],
    awards: [],
    sampleLessons: ['The 50 most frequent Quranic words', 'Pronouns in the Quran: huwa, hiya, hum'],
  },
  {
    id: 't7', slug: 'wanhar-i', name: 'Shaykh Wanhar I.', short: 'Wanhar I.', title: 'Shaykh', gender: 'm',
    photo: 'teachers/wanhar-i.jpg', portrait: 'teachers/wanhar-i-portrait.jpg',
    subjects: ['Seerah & Prophets', 'Hadith'], languages: ['English', 'Arabic'], years: 6, rating: 4.8, reviews: 19, students: 70, country: 'United States',
    headline: 'Seerah, Stories of the Prophets and Hadith for young Muslims',
    bio: "Assalamu alaikum! I'm Shaykh Wanhar, a youth educator and storyteller. I've spent 6 years teaching Seerah (the life of the Prophet ﷺ), Stories of the Prophets and Hadith to kids and teens at weekend schools and youth programs. My classes are discussion-based: we travel through the timeline of the Seerah, draw maps, act out events and extract practical lessons for school, friendships and family life. Teens study the 40 Hadith of Imam Nawawi with memorisation and real-life application.",
    experience: 'Youth director at a community masjid (4 yrs), weekend school teacher (6 yrs).',
    education: [{ degree: 'B.A. Islamic Studies', school: 'Islamic University of Madinah, Saudi Arabia', year: 2019 }],
    certifications: [{ name: 'Youth Mentoring Certificate', org: 'MAS Youth', year: 2021 }],
    awards: [],
    sampleLessons: ['The Year of Sorrow and the journey to Ta’if', '40 Hadith #1: Actions are by intentions'],
  },
]


export const FAQS = [
  { q: 'Who are the classes for?', a: 'Children, teens and adults. Every class is live online with a real teacher — one-on-one or in a small group.' },
  { q: 'How do I start?', a: 'Send the free-trial form below. We will contact you, book a free first lesson and then set up your student account and weekly schedule.' },
  { q: 'How do lessons work?', a: 'Log in, open “Today”, and press Join when your class starts. Video, chat and a shared whiteboard all run in the browser — nothing to install.' },
  { q: 'Can I change my class time?', a: 'Yes. Message the academy and the admin will move the class — your schedule updates automatically.' },
  { q: 'What do I need?', a: 'A laptop, tablet or phone with a camera, microphone and a stable internet connection.' },
]
