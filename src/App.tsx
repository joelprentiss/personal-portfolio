import { ArrowDown, ArrowUpRight, Download, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ContactForm } from './components/ContactForm'
import { experience, links, projects, services } from './data/siteData'
import { usePortfolioMotion } from './hooks/usePortfolioMotion'

const navItems = [
  { label: 'Work', href: '#projects' },
  { label: 'Capabilities', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'GI Joel', href: '#creator' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) setOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 900px)')
    const onResize = () => { if (desktop.matches) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onOutside)
    desktop.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onOutside)
      desktop.removeEventListener('change', onResize)
    }
  }, [open])

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to content</a>
      <nav className="nav wrap" ref={navRef} aria-label="Main navigation" onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}>
        <a className="brand" href="#home" onClick={() => setOpen(false)}>
          <img src="/brand/monogram.png" alt="" width="48" height="48" />
          <span>Joel Prentiss<span className="brand-caption">Operator. Builder. Creator.</span></span>
          <span className="sr-only">Back to home</span>
        </a>
        <button className="menu-toggle" ref={toggleRef} type="button" aria-expanded={open} aria-controls="main-links" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'} {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={'nav-links' + (open ? ' is-open' : '')} id="main-links">
          {navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
          <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={17} /></a>
        </div>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="home" tabIndex={-1} aria-labelledby="hero-title">
      <div className="hero-grid wrap">
        <div className="hero-copy">
          <p className="eyebrow"><span className="small-rule" /> A practical mind. A creative streak.</p>
          <h1 id="hero-title"><span>Operator.</span><span>Builder.</span><span className="hero-accent">Storyteller.</span></h1>
          <p className="hero-intro">I’m Joel Prentiss. I bring an operator’s discipline and a creator’s curiosity to <strong>applied AI, useful apps, and stories that matter.</strong></p>
          <div className="hero-actions">
            <a className="button button-red" href="#projects">Explore my work <ArrowDown size={18} /></a>
            <a className="text-link light-link" href="#contact">Get in touch <ArrowUpRight size={18} /></a>
          </div>
        </div>
        <figure className="hero-visual">
          <div className="portrait-backing" aria-hidden="true" />
          <div className="portrait-window">
            <img className="portrait" data-parallax src="/images/joel-portrait-900.webp" srcSet="/images/joel-portrait-600.webp 600w, /images/joel-portrait-900.webp 900w" sizes="(max-width: 699px) calc(100vw - 64px), (max-width: 1100px) 42vw, 480px" width="900" height="1125" alt="Joel Prentiss smiling, with the Austin skyline behind him" fetchPriority="high" />
          </div>
          <span className="portrait-side-note" aria-hidden="true">Curiosity, put into practice.</span>
          <figcaption><span>Joel Prentiss</span><span>Many interests. One approach.</span></figcaption>
        </figure>
      </div>
      <div className="hero-foot wrap"><span>From the production floor to the next idea.</span><a href="#projects">Take a closer look <ArrowDown size={15} /></a></div>
    </section>
  )
}

function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return <p className="eyebrow section-label"><span>{number} /</span> {children}</p>
}

function Project({ project, index }: { project: (typeof projects)[number]; index: number }) {
  return (
    <article className={'project project-' + project.id} data-reveal>
      <a className="project-visual" href={project.actions[0].url} target="_blank" rel="noreferrer" aria-label={project.title + ' — ' + project.actions[0].label + ' (opens in a new tab)'}>
        <img src={project.previewImage} width={project.imageWidth} height={project.imageHeight} alt={project.imageAlt} loading="lazy" decoding="async" />
        <span className="image-link-icon" aria-hidden="true"><ArrowUpRight size={24} /></span>
      </a>
      <div className="project-copy">
        <div className="project-meta"><span>{String(index + 1).padStart(2, '0')} / {project.category}</span><span className={'status status-' + project.statusType}><span aria-hidden="true" />{project.status}</span></div>
        <h3>{project.title}</h3>
        <p className="project-headline">{project.headline}</p>
        <p className="project-description">{project.description}</p>
        <p className="project-contribution"><span>My focus</span> {project.contribution}</p>
        <p className="project-note">{project.note}</p>
        <div className="project-actions">{project.actions.map((action) => <a className="text-link" key={action.label} href={action.url} target="_blank" rel="noreferrer">{action.label} <ArrowUpRight size={17} /><span className="sr-only"> (opens in a new tab)</span></a>)}</div>
      </div>
    </article>
  )
}

function Projects() {
  return (
    <section className="work-section section-pad" id="projects" tabIndex={-1} aria-labelledby="work-title">
      <div className="wrap">
        <div className="section-heading" data-reveal>
          <div><SectionLabel number="01">Selected work</SectionLabel><h2 id="work-title">Ideas, put<br /><em>into practice.</em></h2></div>
          <p>A few things I’m building.<br />Different problems. The same drive to make something useful.</p>
        </div>
        <div className="projects-grid">{projects.map((project, index) => <Project key={project.id} project={project} index={index} />)}</div>
      </div>
    </section>
  )
}

function Capabilities() {
  return (
    <section className="capabilities section-pad" id="services" tabIndex={-1} aria-labelledby="capabilities-title">
      <div className="wrap">
        <div className="section-heading" data-reveal>
          <div><SectionLabel number="02">Capabilities</SectionLabel><h2 id="capabilities-title">Four disciplines.<br /><em>One practical approach.</em></h2></div>
          <p>Understand the problem.<br />Make something useful.<br />Keep improving it.</p>
        </div>
        <div className="capability-list">
          {services.map((service, index) => (
            <article className="capability" key={service.name} data-reveal>
              <div className="capability-name"><span className="item-number">0{index + 1}</span><h3>{service.name}</h3></div>
              <div className="capability-copy"><h4>{service.title}</h4><p>{service.description}</p></div>
              <ul>{service.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
            </article>
          ))}
        </div>
        <a className="text-link capabilities-cta" href="#contact">Have something in mind? Let’s talk <ArrowUpRight size={18} /></a>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="about-section section-pad" id="about" tabIndex={-1} aria-labelledby="about-title">
      <div className="wrap about-grid">
        <div className="about-copy" data-reveal>
          <SectionLabel number="03">The person behind the work</SectionLabel>
          <h2 id="about-title">Grounded in<br />experience.<br /><em>Led by curiosity.</em></h2>
          <p>I’ve spent my career where people, processes, and pressure meet. That experience shapes how I approach a new tool or a new idea: understand what’s happening, ask better questions, and make the next step clearer.</p>
          <p>Building apps and creating as GI Joel give that same curiosity a different outlet. I’m interested in how things work—and why they matter to people.</p>
          <a className="text-link" href={links.linkedin} target="_blank" rel="noreferrer">More on LinkedIn <ArrowUpRight size={18} /><span className="sr-only"> (opens in a new tab)</span></a>
        </div>
        <div className="experience-list" id="experience" role="group" tabIndex={-1} aria-label="Experience and education">
          {experience.map((item) => <article className="experience-item" key={item.title} data-reveal><p className="eyebrow">{item.label}</p><h3>{item.title}</h3><p>{item.description}</p></article>)}
        </div>
      </div>
    </section>
  )
}

function Creator() {
  return (
    <section className="creator-section section-pad" id="creator" tabIndex={-1} aria-labelledby="creator-title">
      <div className="wrap">
        <div className="creator-heading" data-reveal>
          <div><SectionLabel number="04">The creative side / GI Joel</SectionLabel><h2 id="creator-title">Good stories<br />stay with us.</h2></div>
          <div className="creator-intro"><p>As GI Joel, I explore character psychology, mythology, and human nature through film, TV, anime, comics, and games.</p><p>AI supports the research and the creative process. My perspective and editorial judgment guide the story.</p></div>
        </div>
        <a className="creator-art" href={links.youtube} target="_blank" rel="noreferrer" aria-label="Watch on YouTube — GI Joel (opens in a new tab)" data-reveal>
          <img src="/images/gi-joel-1280.webp" srcSet="/images/gi-joel-800.webp 800w, /images/gi-joel-1280.webp 1280w" sizes="(max-width: 699px) calc(100vw - 40px), calc(100vw - 96px)" width="1672" height="941" alt="GI Joel: Mythology. Stories. Meaning. Face your dragons. Channel artwork with a dragon and characters from stories." loading="lazy" decoding="async" />
          <span className="creator-watch">Watch on YouTube <ArrowUpRight size={20} /></span>
        </a>
        <div className="creator-bottom" data-reveal>
          <div><p className="eyebrow">Follow the stories</p><div className="creator-socials"><a href={links.youtube} target="_blank" rel="noreferrer">YouTube <ArrowUpRight size={16} /></a><a href={links.instagram} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={16} /></a><a href={links.tiktok} target="_blank" rel="noreferrer">TikTok <ArrowUpRight size={16} /></a></div></div>
          <div className="partnership"><div><p className="eyebrow">Creator partnerships</p><p>Get to know the brand, audience, and content.</p></div><a className="button button-cream" href={links.mediaKit} download="GI-Joel-Media-Kit-2026-10-17.pdf"><Download size={18} /> Media kit <span className="file-type">PDF</span></a></div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact-section section-pad" id="contact" tabIndex={-1} aria-labelledby="contact-title">
      <div className="wrap contact-grid">
        <div className="contact-copy" data-reveal>
          <SectionLabel number="05">Start a conversation</SectionLabel>
          <h2 id="contact-title">What are you<br /><em>working on?</em></h2>
          <p>An app idea, an AI workflow, a story, or a process that could work better. I’d like to hear about it.</p>
          <a className="text-link" href={links.linkedin} target="_blank" rel="noreferrer">Or connect on LinkedIn <ArrowUpRight size={18} /><span className="sr-only"> (opens in a new tab)</span></a>
          <span className="contact-mark" aria-hidden="true">Let’s make<br />the next move.</span>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        <a className="brand" href="#home"><img src="/brand/monogram.png" alt="" width="48" height="48" /><span>Joel Prentiss<span className="brand-caption">A practical mind. A creative streak.</span></span><span className="sr-only">Back to top</span></a>
        <div className="footer-links"><a href={links.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} /></a><a href="#contact">Get in touch <ArrowUpRight size={15} /></a></div>
      </div>
      <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Joel Prentiss</span><span>Built with curiosity. Made to be useful.</span><a href="#home">Back to top ↑</a></div>
    </footer>
  )
}

export default function App() {
  usePortfolioMotion()
  return <><Navbar /><main id="main" tabIndex={-1}><Hero /><Projects /><Capabilities /><About /><Creator /><Contact /></main><Footer /></>
}
