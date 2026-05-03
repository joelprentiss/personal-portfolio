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
        <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <div className={`nav-links ${open ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setOpen(false)}>
              {item}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <a className="text-link" href="#projects">View Projects</a>
          <a className="button button-dark" href="#contact">Request a Quote</a>
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
        <p className="eyebrow">Websites. Systems. Content. Execution.</p>
        <h1>I build websites, systems, and content for businesses that need cleaner execution.</h1>
        <p className="hero-subhead">
          I&apos;m Joel Prentiss, a Tesla operations leader, Navy veteran, MBA graduate, and digital builder
          helping small businesses improve their online presence, processes, and customer experience.
        </p>
        <div className="hero-actions">
          <a className="button button-dark" href="#projects">
            View My Work <ArrowRight size={18} />
          </a>
          <a className="button button-light" href="#contact">Request a Quote</a>
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
            <p>Operator&apos;s Lens</p>
            <div>
              <span>Offer clarity</span>
              <strong>Website + process + content</strong>
            </div>
            <div>
              <span>Execution focus</span>
              <strong>Cleaner handoffs and follow-up</strong>
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
        <SectionHeading eyebrow="About Joel" title="Built from operations, not theory." />
      </div>
      <div className="stack">
        <div className="copy-card">
          <p>
            I&apos;m a builder at the intersection of operations, leadership, content, and technology. My background
            includes front-line manufacturing leadership at Tesla, service in the U.S. Navy, a BBA in Project
            Management, and an MBA in Operations and Supply Chain Management.
          </p>
          <p>
            I bring an operator&apos;s mindset to digital work. That means I do not just build websites that look good.
            I build tools, pages, processes, and content systems that are meant to solve real business problems:
            missed leads, unclear offers, outdated websites, weak follow-up, inconsistent content, and messy workflows.
          </p>
          <p>
            Whether I&apos;m building a website, improving a process, or creating content, my focus is the same: make
            the system clearer, stronger, and easier to execute.
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
        title="Practical digital and operational support."
        subtitle="Practical digital and operational support for small businesses, creators, and service providers."
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
      <div className="project-image">
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
        title="A growing collection of builds and digital experiments."
        subtitle="Websites, apps, systems, and content projects will plug into these cards as they go live."
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
        <SectionHeading eyebrow="Creator Experience" title="Creator Experience: thegijoel" />
        <p>
          Under the creator brand thegijoel, Joel has built experience creating content around character analysis,
          psychology, storytelling, and cultural commentary. This background gives him a practical understanding of
          audience attention, hooks, scripting, short-form video, and content strategy.
        </p>
        <p>
          That creator experience now supports his work with small businesses and personal brands that need clearer
          messaging, stronger content, and a more consistent online presence.
        </p>
      </div>
      <div className="creator-panel">
        <div className="creator-skills">
          {creatorSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <div className="social-proof">
          <p>TikTok following: Add follower count</p>
          <p>YouTube: Add channel link</p>
          <p>Featured content: Add links later</p>
        </div>
      </div>
    </section>
  )
}

function Resume() {
  return (
    <section className="section resume-strip">
      <div>
        <p className="eyebrow">Professional Background</p>
        <h2>Download the traditional resume.</h2>
        <p>For a more traditional view of my work history, education, and certifications, download my resume below.</p>
      </div>
      <div className="resume-actions">
        <a className="button button-dark" href={links.resume} download>
          <Download size={18} /> Download Resume
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

  return (
    <form
      className="contact-form"
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
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
          <option>Website</option>
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
      <button className="button button-dark submit-button" type="submit">Request a Quote</button>
      <p className="backend-note">
        Built to connect later with Google Sheets, Formspree, Netlify Forms, Supabase, or Airtable.
      </p>
      {submitted ? (
        <div className="confirmation" role="status">
          Thanks - your request has been received. I&apos;ll review the details and follow up.
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
          subtitle="Have a website, content idea, process problem, or business system that needs structure? Send the details and I'll take a look."
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
        <p>Websites. Systems. Content. Execution.</p>
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
        <Experience />
        <Creator />
        <Resume />
        <Contact />
      </main>
      <Footer />
      <a className="floating-quote" href="#contact" aria-label="Start a project">
        <Play size={16} fill="currentColor" /> Start
      </a>
    </>
  )
}
