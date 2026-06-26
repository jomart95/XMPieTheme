import React from 'react'
import './HowItWorks.scss'

/*
 * "How It Works" — universal homepage band, full-bleed dark.
 * Copy is baked once; colour follows the client skin via tokens (the step
 * circles use the primary accent, the title highlight uses the gold secondary).
 */

const STEPS = [
  {
    num: '01',
    title: 'Choose a Product',
    desc: 'Browse brand-approved products — each pre-built to your standards.'
  },
  {
    num: '02',
    title: 'Personalise',
    desc: 'Enter your location details and customise within approved brand limits.'
  },
  {
    num: '03',
    title: 'Auto to Press',
    desc: "XMPie uProduce sends your job straight to McFaddin's production floor."
  },
  {
    num: '04',
    title: 'Delivered Fast',
    desc: 'Shipped from Louisville — near the UPS World Hub — to your location.'
  }
]

const HowItWorks = () => {
  return (
    <section className="mcf-hiw">
      <div className="mcf-hiw__inner">
        <div className="mcf-hiw__eyebrow">How It Works</div>
        <h2 className="mcf-hiw__title">
          From order to <span className="mcf-hiw__gold">your door.</span>
        </h2>
        <p className="mcf-hiw__sub">
          Fully automated. Brand-locked. No emails, no proofing delays, no wrong logos.
        </p>

        <div className="mcf-hiw__steps">
          {STEPS.map((s) => (
            <div className="mcf-hiw__step" key={s.num}>
              <div className="mcf-hiw__circle">
                <span className="mcf-hiw__num">{s.num}</span>
              </div>
              <div className="mcf-hiw__step-title">{s.title}</div>
              <div className="mcf-hiw__step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
