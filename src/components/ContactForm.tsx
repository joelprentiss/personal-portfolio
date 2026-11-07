import { ArrowUpRight, Check, CircleAlert } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { links } from '../data/siteData'

const contactEndpoint = 'https://script.google.com/macros/s/AKfycbxJMo6dLZyesX1-j8Yn8gLMe6tI69Z2R61zEXqLlZTcmv27V_uJaO4NKjtLZwVaE7xPqw/exec'
type FieldName = 'name' | 'email' | 'details' | 'link'
type FieldErrors = Partial<Record<FieldName, string>>

export function ContactForm() {
  const prefix = useId()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [errorMessage, setErrorMessage] = useState('')
  const pending = useRef(false)
  const fieldId = (name: string) => `${prefix}-${name}`

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending.current) return
    const form = event.currentTarget
    const formData = new FormData(form)
    const value = (key: string) => String(formData.get(key) || '').trim()
    const payload = { name: value('name'), email: value('email'), projectName: value('projectName'), need: value('need'), details: value('details'), link: value('link') }
    const nextErrors: FieldErrors = {}
    if (!payload.name) nextErrors.name = 'Please enter your name.'
    const emailField = form.elements.namedItem('email') as HTMLInputElement
    if (!payload.email || !emailField.validity.valid) nextErrors.email = 'Please enter a valid email address.'
    if (!payload.details) nextErrors.details = 'Please tell me a little about what you have in mind.'
    if (payload.link) {
      try {
        const url = new URL(payload.link)
        if (!['http:', 'https:'].includes(url.protocol)) nextErrors.link = 'Use a full link starting with https:// or http://.'
      } catch { nextErrors.link = 'Use a full link, for example https://example.com.' }
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setState('idle')
      const first = Object.keys(nextErrors)[0]
      const field = form.elements.namedItem(first) as HTMLElement
      if (first === 'link') form.querySelector('details')?.setAttribute('open', '')
      field?.focus({ preventScroll: true })
      field?.scrollIntoView({ block: 'center', behavior: 'instant' })
      return
    }
    pending.current = true
    setState('sending')
    setErrorMessage('')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload), signal: controller.signal,
      })
      // The existing no-cors transport cannot prove server-side delivery.
      if (response.type !== 'opaque' && !response.ok) throw new Error('Request failed')
      form.reset()
      setState('sent')
    } catch (error) {
      setState('error')
      setErrorMessage(error instanceof DOMException && error.name === 'AbortError'
        ? 'The request timed out, so delivery is uncertain. Your message is still here. You can contact me on LinkedIn before trying again.'
        : 'Your message couldn’t be sent. Your details are still here—please try again or contact me on LinkedIn.')
    } finally {
      window.clearTimeout(timeout)
      pending.current = false
    }
  }

  const clearError = (name: FieldName) => {
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
    if (state === 'sent') setState('idle')
  }
  const errorFor = (name: FieldName) => errors[name] ? <span className="field-error" id={fieldId(`${name}-error`)}>{errors[name]}</span> : null
  const fieldAria = (name: FieldName) => ({ 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? fieldId(`${name}-error`) : undefined })

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate aria-label="Contact Joel" aria-busy={state === 'sending'}>
      <p className="form-note">A little context is all it takes. <span>* Required</span></p>
      <fieldset disabled={state === 'sending'}>
        <legend className="sr-only">Your contact details and message</legend>
        <div className="form-row">
          <div className="field"><label htmlFor={fieldId('name')}>Your name <span aria-hidden="true">*</span></label><input id={fieldId('name')} name="name" autoComplete="name" required maxLength={150} {...fieldAria('name')} onInput={() => clearError('name')} />{errorFor('name')}</div>
          <div className="field"><label htmlFor={fieldId('email')}>Email address <span aria-hidden="true">*</span></label><input id={fieldId('email')} name="email" type="email" autoComplete="email" required maxLength={254} {...fieldAria('email')} onInput={() => clearError('email')} />{errorFor('email')}</div>
        </div>
        <div className="field"><label htmlFor={fieldId('need')}>What’s on your mind? <span className="optional">Optional</span></label><select id={fieldId('need')} name="need" defaultValue=""><option value="">Choose a topic</option><option>App Building</option><option>Process Improvement</option><option>Social Media Marketing</option><option>Content Creation</option><option>AI / Automation</option><option>Other</option></select></div>
        <div className="field"><label htmlFor={fieldId('details')}>Your message <span aria-hidden="true">*</span></label><textarea id={fieldId('details')} name="details" rows={5} required maxLength={10000} placeholder="The idea, the challenge, or the story…" {...fieldAria('details')} onInput={() => clearError('details')} />{errorFor('details')}</div>
        <details className="extra-fields"><summary>Add a project name or link <span>Optional</span></summary><div className="extra-fields-content"><div className="field"><label htmlFor={fieldId('projectName')}>Business or project name <span className="optional">Optional</span></label><input id={fieldId('projectName')} name="projectName" autoComplete="organization" maxLength={200} /></div><div className="field"><label htmlFor={fieldId('link')}>Website or social link <span className="optional">Optional</span></label><input id={fieldId('link')} name="link" type="url" placeholder="https://" maxLength={2000} {...fieldAria('link')} onInput={() => clearError('link')} />{errorFor('link')}</div></div></details>
        <button className="button button-red submit-button" type="submit">{state === 'sending' ? 'Sending…' : 'Send message'}<ArrowUpRight size={19} /></button>
      </fieldset>
      <div className="form-status" role="status" aria-live="polite" aria-atomic="true">{state === 'sending' && <p>Sending your message…</p>}{state === 'sent' && <div className="confirmation"><Check size={20} /><div><strong>Thanks for reaching out.</strong><p>Your message was sent for delivery. This form can’t confirm receipt; you can also <a href={links.linkedin}>connect on LinkedIn</a>.</p></div></div>}</div>
      {Object.values(errors).some(Boolean) && <p className="validation-summary" role="alert">Please check the highlighted fields.</p>}
      {state === 'error' && <div className="form-error" role="alert"><CircleAlert size={20} /><div><p>{errorMessage}</p><a href={links.linkedin} className="text-link">Connect on LinkedIn <ArrowUpRight size={16} /></a></div></div>}
    </form>
  )
}
