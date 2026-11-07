export const links = {
  github: 'https://github.com/joelprentiss',
  linkedin: 'https://www.linkedin.com/in/joel-prentiss/',
  instagram: 'https://www.instagram.com/thegijoel/',
  tiktok: 'https://tiktok.com/@thegijoel',
  youtube: 'https://www.youtube.com/c/TheGIJoel',
  mediaKit: '/GI-Joel-Media-Kit-2026-10-17.pdf',
}

export const services = [
  {
    name: 'Applied AI',
    title: 'Put the tools to work.',
    description: 'Connect AI to a real need. Build a useful workflow, test the output, and keep human judgment in the loop.',
    details: ['Workflow design', 'Prompt development', 'Knowledge & process documentation', 'Human review & quality checks'],
  },
  {
    name: 'App building',
    title: 'Give an idea a working form.',
    description: 'Use AI-assisted development to move from a problem to a prototype, with attention to how people actually use it.',
    details: ['App concepts & prototypes', 'AI assistant experiences', 'Workflow tools', 'Testing & iteration'],
  },
  {
    name: 'Content & storytelling',
    title: 'Find the story worth telling.',
    description: 'Bring research, audience understanding, and a distinct voice to short-form and long-form content.',
    details: ['Research & ideation', 'Hooks & scriptwriting', 'Brand voice', 'Cross-platform content'],
  },
  {
    name: 'Operations',
    title: 'Make execution clearer.',
    description: 'Draw on manufacturing leadership to understand the process, work through the root cause, and strengthen the handoff.',
    details: ['Workflow mapping & SOPs', 'Root cause analysis', 'Process improvement', 'Team training & handoffs'],
  },
]

// Release labels reflect the public sites inspected on November 7, 2026.
// They describe availability, not customer traction or commercial results.
export const projects = [
  {
    id: 'trial-born',
    title: 'Trial Born',
    category: 'Personal growth app',
    status: 'Live web app',
    statusType: 'live',
    previewImage: '/images/trial-born.webp',
    imageAlt: 'Trial Born artwork: a lone traveler facing a dragon, with the words A journal for the journey within',
    imageWidth: 1024,
    imageHeight: 500,
    headline: 'Turn reflection into a daily practice.',
    description: 'An app exploring character archetypes, guided reflection, daily prompts, and journaling. A way to connect the stories we relate to with the patterns in our own lives.',
    contribution: 'App building, guided reflection, and AI-assisted development.',
    note: 'Available in the browser. iPhone and Android apps are coming.',
    actions: [{ label: 'Explore Trial Born', url: 'https://trialborn.app/' }],
  },
  {
    id: 'rephra',
    title: 'Rephra',
    category: 'AI-assisted communication',
    status: 'In testing · Waitlist',
    statusType: 'development',
    previewImage: '/images/rephra.webp',
    imageAlt: 'Rephra website showing an example of turning a difficult thought into a clear written message',
    imageWidth: 1180,
    imageHeight: 757,
    headline: 'For the messages that are hard to send.',
    description: 'Turn what’s on your mind into a clearer message. Review the suggestion, edit it, and keep the final say over your words.',
    contribution: 'App development and AI-assisted writing workflows.',
    note: 'Currently in testing; the site offers a waitlist for updates.',
    actions: [{ label: 'Visit Rephra', url: 'https://rephra.app/' }],
  },
  {
    id: 'fairhaven',
    title: 'Fairhaven Design',
    category: 'Websites & automation',
    status: 'Live site',
    statusType: 'live',
    previewImage: '/images/fairhaven-design.webp',
    imageAlt: 'Fairhaven website introducing websites for Texas estate sale and appraisal firms',
    imageWidth: 1165,
    imageHeight: 747,
    headline: 'A considered home for a local business.',
    description: 'Websites and practical automation for Texas estate sale and personal-property appraisal firms, connecting clear site structure with lead capture, booking, and follow-up.',
    contribution: 'Web design, AI-ready site structure, and automation.',
    note: 'The public site includes three demonstration designs.',
    actions: [{ label: 'Visit Fairhaven', url: 'https://fairhavendesign.com/' }],
  },
  {
    id: 'ai-assistant',
    title: 'AI Business Assistant',
    category: 'Applied AI / Ironclad AI',
    status: 'Interactive demo',
    statusType: 'demo',
    previewImage: '/images/ai-business-assistant.webp',
    imageAlt: 'Ironclad AI demo with a missed-call and follow-up check for small businesses',
    imageWidth: 1440,
    imageHeight: 1000,
    headline: 'From a messy process to a practical next step.',
    description: 'A demo exploring how AI can turn a business’s missed-call and follow-up process into suggested actions and reusable message templates.',
    contribution: 'AI workflow design and app development with Next.js, the OpenAI API, TypeScript, and Tailwind.',
    note: 'An exploratory demo, not a client case study.',
    actions: [
      { label: 'Open the demo', url: 'https://ironclad-ops-ai.joel-prentiss89.workers.dev/' },
      { label: 'View source', url: 'https://github.com/joelprentiss/ironclad-ops-ai' },
    ],
  },
]

export const experience = [
  {
    label: 'Leadership',
    title: 'Operations at Tesla',
    description: 'Front-line manufacturing leadership supporting production teams, quality standards, training, escalations, and day-to-day problem-solving.',
  },
  {
    label: 'Service',
    title: 'U.S. Navy veteran',
    description: 'A foundation in discipline, technical problem-solving, teamwork, and performing under pressure.',
  },
  {
    label: 'Education',
    title: 'Business & operations',
    description: 'MBA in Operations and Supply Chain Management. BBA in Project Management.',
  },
  {
    label: 'Continuous improvement',
    title: 'Six Sigma Green Belt',
    description: 'A process improvement certification supporting a practical focus on quality and operational efficiency.',
  },
]
