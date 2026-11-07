import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Download,
  ExternalLink,
  Menu,
  Play,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import {
  creatorSkills,
  experience,
  links,
  projects,
  services,
  whatIBring,
} from './data/siteData'

const navItems = ['Home', 'About', 'Services', 'Projects', 'Experience', 'Contact']
const contactEndpoint =
  'https://script.google.com/macros/s/AKfycbxJMo6dLZyesX1-j8Yn8gLMe6tI69Z2R61zEXqLlZTcmv27V_uJaO4NKjtLZwVaE7xPqw/exec'

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="section-heading">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="nav-shell">
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="Joel Prentiss home">
          <span>JP</span>
          <strong>Joel Prentiss</strong>
        </a>
        <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} aria-controls="primary-links">
          <Menu size={20} />
        </button>
        <div id="primary-links" className={`nav-links ${open ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setOpen(false)}>
              {item}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <a className="text-link" href="#projects">View Projects</a>
          <a className="button button-dark" href="#contact">Let’s Connect</a>
        </div>
      </nav>
    </header>
  )
}

function Hero() {
  const proof = [
    'Tesla Operations Leadership',
    'U.S. Navy Veteran',
    'MBA in Operations & Supply Chain Management',
    'Six Sigma Green Belt',
    'Creator of thegijoel',
  ]

  return (
    <section className="hero section" id="home">
      <div className="hero-copy reveal">
        <p className="eyebrow">Applied AI. Apps. Content. Operations.</p>
        <h1>I use AI to improve operations and create better content.</h1>
        <p className="hero-subhead">
          I&apos;m Joel Prentiss: operations leader, app builder, and the creator behind GI Joel.
          I combine hands-on AI knowledge with real-world experience to build useful tools, improve workflows, and tell stronger stories.
        </p>
        <div className="hero-actions">
          <a className="button button-dark" href="#projects">
            View My Work <ArrowRight size={18} />
          </a>
          <a className="button button-light" href="#contact">Let’s Connect</a>
        </div>
        <div className="credibility-row" aria-label="Credibility highlights">
          {proof.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="hero-visual reveal delay">
        <div className="portrait-card" aria-label="Professional photo of Joel Prentiss">
          <img className="profile-photo" src="/joel-profile.png" alt="Joel Prentiss smiling in a suit" />
          <div className="ops-panel">
            <p>Creator + Operator</p>
            <div>
              <span>My focus</span>
              <strong>Applied AI, apps, and content</strong>
            </div>
            <div>
              <span>Execution focus</span>
              <strong>Practical tools. Thoughtful stories.</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section split" id="about">
      <div>
        <SectionHeading eyebrow="About Joel" title="An operator’s discipline. A creator’s perspective." />
      </div>
      <div className="stack">
        <div className="copy-card">
          <p>
            I&apos;m a builder at the intersection of operations, leadership, content, and technology. My background
            includes front-line manufacturing leadership at Tesla, service in the U.S. Navy, a BBA in Project
            Management, and an MBA in Operations and Supply Chain Management.
          </p>
          <p>
            I apply that experience to AI: understanding the problem, designing a useful workflow, and reviewing
            the result. From app prototypes to content research and process documentation, I focus on making
            AI a practical part of how work gets done.
          </p>
          <p>
            As GI Joel, I create stories about character psychology, mythology, and human nature. Building apps
            and creating content give me two ways to put ideas into practice, with curiosity, judgment, and a clear purpose.
          </p>
        </div>
        <div className="bring-grid">
          {whatIBring.map((item) => (
            <div className="mini-card" key={item}>
              <Check size={17} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ service }: { service: (typeof services)[number] }) {
  return (
    <article className="service-card">
      <div className="card-topline">
        <span>{service.kicker}</span>
        <BriefcaseBusiness size={19} />
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <ul>
        {service.bullets.map((bullet) => (
          <li key={bullet}>
            <Check size={16} />
            {bullet}
          </li>
        ))}
      </ul>
      <a className="inline-cta" href="#contact">
        {service.cta} <ArrowRight size={16} />
      </a>
    </article>
  )
}

function Services() {
  return (
    <section className="section band" id="services">
      <SectionHeading
        eyebrow="Services"
        title="Three disciplines. One practical approach."
        subtitle="AI expertise, creator experience, and operational discipline—applied to tools, workflows, and content."
      />
      <div className="services-grid">
        {services.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <article className="project-card">
      <div className={`project-image ${project.category === 'Content Creation' ? 'project-image-banner' : ''}`}>
        <img src={project.previewImage} alt={`${project.title} preview`} loading="lazy" />
        <span>{project.category}</span>
      </div>
      <div className="project-body">
        <span className="tag">{project.category}</span>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="tool-row">
          {project.tools.map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </div>
        <div className="project-actions">
          {project.actions.length === 0 ? <span className="coming-soon">Links coming soon</span> : null}
          {project.actions.map((action) => (
            <a key={action.label} href={action.url} target="_blank" rel="noreferrer">
              {action.label} <ExternalLink size={15} />
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

function Projects() {
  return (
    <section className="section" id="projects">
      <SectionHeading
        eyebrow="Featured Projects"
        title="Apps I’m building. Stories I’m telling."
        subtitle="A look at my work across AI tools, personal reflection, and social content."
      />
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section className="section split" id="experience">
      <SectionHeading eyebrow="Experience" title="Experience that shapes the work." />
      <div className="experience-grid">
        {experience.map((item) => (
          <article className="experience-card" key={item.title}>
            <ShieldCheck size={20} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Creator() {
  return (
    <section className="section band creator-section">
      <div className="creator-copy">
        <SectionHeading eyebrow="Creator Experience" title="GI Joel. Stories with something to say." />
        <p>
          I create short-form and long-form content that explores why characters and stories matter.
          Through film, TV, anime, comics, and games, GI Joel connects psychology, mythology, and human experience.
        </p>
        <p>
          I use AI to support research, explore ideas, refine scripts, and adapt content for social platforms.
          My perspective and editorial judgment guide the final story.
        </p>
      </div>
      <div className="creator-panel">
        <div className="creator-skills">
          {creatorSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <div className="social-proof">
          <p>Character psychology · Story analysis · Mythic storytelling</p>
          <div className="creator-socials">
            <a href={links.youtube} target="_blank" rel="noreferrer">YouTube <ExternalLink size={14} /></a>
            <a href={links.instagram} target="_blank" rel="noreferrer">Instagram <ExternalLink size={14} /></a>
            <a href={links.tiktok} target="_blank" rel="noreferrer">TikTok <ExternalLink size={14} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

function MediaKit() {
  return (
    <section className="section media-kit-strip">
      <div>
        <p className="eyebrow">Creator Partnerships</p>
        <h2>Get to know GI Joel.</h2>
        <p>Explore the GI Joel media kit for a closer look at the brand, audience, and content. For my professional background, connect with me on LinkedIn.</p>
      </div>
      <div className="media-kit-actions">
        <a className="button button-dark" href={links.mediaKit} download="GI-Joel-Media-Kit-2026-10-17.pdf">
          <Download size={18} /> Download Media Kit
        </a>
        <a className="button button-light" href={links.linkedin}>
          <UserRound size={18} /> Connect on LinkedIn
        </a>
      </div>
    </section>
  )
}

function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  return (
    <form
      className="contact-form"
      onSubmit={async (event) => {
        event.preventDefault()
        setSubmitted(false)
        setError('')
        setIsSubmitting(true)

        const form = event.currentTarget
        const formData = new FormData(form)
        const payload = {
          name: String(formData.get('name') || ''),
          email: String(formData.get('email') || ''),
          projectName: String(formData.get('projectName') || ''),
          need: String(formData.get('need') || ''),
          details: String(formData.get('details') || ''),
          link: String(formData.get('link') || ''),
        }

        try {
          await fetch(contactEndpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
          })
          form.reset()
          setSubmitted(true)
        } catch {
          setError('Something went wrong. Please try again or reach out through LinkedIn.')
        } finally {
          setIsSubmitting(false)
        }
      }}
    >
      <div className="form-grid">
        <label>
          Name
          <input name="name" type="text" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
      </div>
      <label>
        Business or project name
        <input name="projectName" type="text" />
      </label>
      <label>
        What do you need help with?
        <select name="need" required defaultValue="">
          <option value="" disabled>Select one</option>
          <option>App Building</option>
          <option>Process Improvement</option>
          <option>Social Media Marketing</option>
          <option>Content Creation</option>
          <option>AI / Automation</option>
          <option>Other</option>
        </select>
      </label>
      <label>
        Project details
        <textarea name="details" rows={5} required />
      </label>
      <label>
        Website or social link
        <input name="link" type="url" placeholder="https://" />
      </label>
      <button className="button button-dark submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Let’s Connect'}
      </button>
      {submitted ? (
        <div className="confirmation" role="status">
          Thanks - your request has been received. I&apos;ll review the details and follow up.
        </div>
      ) : null}
      {error ? (
        <div className="form-error" role="alert">
          {error}
        </div>
      ) : null}
    </form>
  )
}

function Contact() {
  return (
    <section className="section contact-section" id="contact">
      <div>
        <SectionHeading
          eyebrow="Start a Project"
          title="Bring the messy problem. I'll help structure the next move."
          subtitle="Have an app idea, AI workflow, content collaboration, or operational challenge in mind? Let’s talk about it."
        />
      </div>
      <ContactForm />
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <h2>Joel Prentiss</h2>
        <p>Applied AI. Apps. Content. Operations.</p>
        <p>Built by Joel Prentiss.</p>
      </div>
      <div className="footer-links">
        <a href={links.github}>GitHub</a>
        <a href={links.linkedin}>LinkedIn</a>
        <a href={links.instagram}>Instagram</a>
        <a href={links.tiktok}>TikTok / thegijoel</a>
        <a href={links.youtube}>YouTube</a>
        <a href="#contact">Email</a>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <Creator />
        <Experience />
        <MediaKit />
        <Contact />
      </main>
      <Footer />
      <a className="floating-quote" href="#contact" aria-label="Start a project">
        <Play size={16} fill="currentColor" /> Start
      </a>
    </>
  )
}
