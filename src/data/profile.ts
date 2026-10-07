/**
 * Single source of truth for all personal / editorial content.
 * Edit this file to update text, contact details, journey milestones, etc.
 *
 * ──────────────────────────────────────────────────────────────────────
 *  CV:       replace  public/cv/glorious-moraa-cv.pdf   (no code changes needed)
 *  PORTRAIT: drop the photo at  public/images/glorious-moraa.jpg
 *            (.jpeg / .png / .webp also work with the same base name)
 * ──────────────────────────────────────────────────────────────────────
 */

export const profile = {
  name: "Glorious Moraa",
  firstName: "Glorious",
  lastName: "Moraa",
  title: "CNA & Physiotherapy Professional",
  roles: ["CNA", "Physiotherapy"],
  tagline: ["Care", "Movement", "Recovery"],

  phone: "0792268166",
  phoneHref: "tel:0792268166",
  email: "Moraaglorious14@gmail.com",
  emailHref: "mailto:Moraaglorious14@gmail.com",

  cv: {
    path: "/cv/glorious-moraa-cv.pdf",
    fileName: "Glorious-Moraa-CV.pdf",
    format: "PDF",
    status: "AVAILABLE",
  },

  portrait: {
    sources: [
      "/images/glorious-moraa.jpg",
      "/images/glorious-moraa.jpeg",
      "/images/glorious-moraa.png",
      "/images/glorious-moraa.webp",
    ],
    alt: "Portrait of Glorious Moraa, CNA and physiotherapy professional",
    objectPosition: "48% 26%",
  },

  intro:
    "Compassionate patient care and a movement-focused understanding of the body — brought together in one professional.",

  bio: [
    "Glorious Moraa is a CNA and physiotherapy professional whose work begins with one conviction: care begins with the person.",
    "Her path moves from the bedside to the body in motion — from the dignity and attentiveness of patient care to a movement-focused understanding of mobility, rehabilitation and physical wellbeing.",
    "This portfolio is built as a digital movement lab: an interface that visualizes movement, while keeping the human at the centre.",
  ],

  pathway: [
    { code: "CNA", text: "Where the journey into healthcare begins." },
    { code: "PATIENT CARE", text: "Dignity, attentiveness and compassionate support." },
    { code: "HUMAN UNDERSTANDING", text: "Listening first, so every person is seen as more than a condition." },
    { code: "MOVEMENT", text: "Seeing how the body moves — and what limits it." },
    { code: "PHYSIOTHERAPY", text: "Movement-focused care for function and wellbeing." },
  ],

  care: {
    headline: "Patient care",
    text: "Glorious's CNA background represents a foundation in compassionate patient support, dignity, attentiveness, and understanding the needs of people receiving care.",
    principles: [
      { k: "DIGNITY", v: "FIRST" },
      { k: "ATTENTIVENESS", v: "ACTIVE" },
      { k: "COMPASSION", v: "ALWAYS" },
      { k: "COMMUNICATION", v: "CLEAR" },
    ],
  },

  physio: {
    headline: "Movement changes everything.",
    text: "Physiotherapy brings a movement-focused perspective to healthcare — supporting physical function, mobility, rehabilitation, and wellbeing.",
    motifs: ["Joints", "Motion paths", "Anatomical points", "Range of motion", "Rehabilitation"],
  },

  expertise: [
    {
      code: "M-01",
      title: "Patient Care",
      sub: "Human-centered support",
      text: "Compassionate support grounded in dignity and attentiveness.",
      glyph: "wave",
    },
    {
      code: "M-02",
      title: "Mobility",
      sub: "Moving with confidence",
      text: "Supporting people to move with greater ease and independence.",
      glyph: "track",
    },
    {
      code: "M-03",
      title: "Movement",
      sub: "The body in motion",
      text: "A focus on how the body moves — and how movement supports health.",
      glyph: "arc",
    },
    {
      code: "M-04",
      title: "Rehabilitation",
      sub: "Pathways to recovery",
      text: "Supporting recovery pathways and the return of physical function.",
      glyph: "steps",
    },
    {
      code: "M-05",
      title: "Physiotherapy",
      sub: "Movement-focused care",
      text: "A movement-focused approach to physical wellbeing.",
      glyph: "joint",
    },
  ],

  /**
   * Professional journey. Entries are intentionally generic placeholders until
   * verified details are supplied from the CV. Add `period` / `detail` to any
   * entry to replace the "see CV" tag with real information.
   */
  journey: [
    {
      n: "01",
      title: "Patient Care",
      text: "The starting point: attentive, dignified support for people receiving care.",
      period: "",
    },
    {
      n: "02",
      title: "CNA",
      text: "A clinical foundation in day-to-day patient support and communication.",
      period: "",
    },
    {
      n: "03",
      title: "Physiotherapy",
      text: "A movement-focused path into rehabilitation, mobility and physical wellbeing.",
      period: "",
    },
    {
      n: "04",
      title: "Professional Development",
      text: "Continuing to learn, refine and grow as a healthcare professional.",
      period: "",
    },
    {
      n: "05",
      title: "Current Journey",
      text: "Bringing compassionate care and movement knowledge together.",
      period: "",
    },
  ],

  nav: [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "care", label: "Care" },
    { id: "physiotherapy", label: "Physiotherapy" },
    { id: "movement", label: "Movement" },
    { id: "journey", label: "Journey" },
    { id: "cv", label: "CV" },
    { id: "contact", label: "Contact" },
  ],
};

export type Profile = typeof profile;
