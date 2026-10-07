# Glorious Moraa — Healthcare Portfolio

A modern, immersive personal portfolio website for **Glorious Moraa**, a Certified Nursing Assistant (CNA) and Physiotherapy Professional.

The website combines a clean healthcare aesthetic with subtle glassmorphism, interactive motion, and lightweight 3D elements to create a professional digital identity centered around:

**Care · Movement · Recovery**

---

## ✨ Features

* Modern healthcare-focused visual design
* Glassmorphism interface
* Responsive design for desktop, tablet, and mobile
* Interactive 3D and parallax effects
* Smooth scroll-based animations
* Professional hero section
* CNA & Physiotherapy profile
* Professional journey timeline
* Expertise section
* Downloadable CV in PDF format
* Click-to-call phone action
* Click-to-email action
* Contact form
* Accessible navigation
* Reduced-motion support
* Optimized image loading
* Lightweight 3D fallback for unsupported devices
* SEO-ready structure
* Fast-loading architecture

---

## 👩‍⚕️ About

**Glorious Moraa** is a healthcare professional with a background as a **Certified Nursing Assistant (CNA)** and a professional focus in **Physiotherapy**.

The portfolio presents her journey through patient care, movement, rehabilitation, and professional development.

---

## 🎯 Design Philosophy

The visual identity is built around the relationship between:

```text
              HUMAN CARE
                  │
                  ▼
             PATIENT CARE
                  │
                  ▼
               MOBILITY
                  │
                  ▼
              MOVEMENT
                  │
                  ▼
             REHABILITATION
                  │
                  ▼
              WELLBEING
```

The interface intentionally avoids the typical AI-generated portfolio aesthetic.

Instead, it uses restrained motion, medical-inspired geometry, glass surfaces, typography, whitespace, and subtle depth to create a professional healthcare experience.

---

## 🚀 Technology

Built with modern web technologies:

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion / Motion
* Three.js / React Three Fiber
* Modern CSS
* Responsive image optimization

The project is designed to remain lightweight and performant despite its interactive visual elements.

---

## 📁 Project Structure

```text
public/
├── images/
│   └── glorious-moraa.jpg
│
├── cv/
│   └── glorious-moraa-cv.pdf
│
└── favicon.svg

src/
├── components/
├── data/
├── App.tsx
├── main.tsx
└── index.css
```

---

## 📄 CV Management

The CV is intentionally separated from the application code.

The current CV is stored at:

```text
public/cv/glorious-moraa-cv.pdf
```

### Updating the CV

When Glorious receives an updated CV:

1. Prepare the new PDF.
2. Rename it:

```text
glorious-moraa-cv.pdf
```

3. Replace the existing file in:

```text
public/cv/
```

4. Commit the change.
5. Push to GitHub.
6. Redeploy if the hosting provider requires deployment.

No application-code changes are required.

The website continues using the same stable path:

```text
/cv/glorious-moraa-cv.pdf
```

---

## 📞 Contact

**Glorious Moraa**

Phone:

```text
0792268166
```

Email:

```text
Moraaglorious14@gmail.com
```

Phone:

```text
tel:0792268166
```

Email:

```text
mailto:Moraaglorious14@gmail.com
```

---

## ⚡ Performance

Performance is treated as a core design requirement.

The application prioritizes:

* Fast first paint
* Optimized images
* Lazy loading
* Minimal dependencies
* Code splitting
* Deferred non-critical effects
* Lightweight animations
* Responsive assets
* 3D fallback behavior

3D effects should never prevent the main website content from rendering.

---

## ♿ Accessibility

The project supports:

* Semantic HTML
* Keyboard navigation
* Accessible focus states
* Screen-reader-friendly labels
* Image alternative text
* Responsive typography
* Accessible color contrast
* Reduced-motion preferences

Users who enable:

```text
prefers-reduced-motion
```

receive a simplified motion experience.

---

## 📱 Responsive Design

The portfolio is designed for:

* Mobile phones
* Tablets
* Laptops
* Desktop monitors
* High-resolution displays

The mobile experience is intentionally designed rather than simply being a scaled-down desktop layout.

---

## 🔐 Privacy

The website should not collect unnecessary personal information.

No fake analytics, tracking systems, testimonials, reviews, or professional claims should be introduced without explicit approval.

---

## 🛠️ Local Development

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/glorious-moraa-portfolio.git
```

Enter the project:

```bash
cd glorious-moraa-portfolio
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🌐 Deployment

This project can be deployed using platforms such as:

* GitHub Pages
* Vercel
* Netlify
* Cloudflare Pages

For the best experience with a React/Vite application, configure the selected hosting provider for SPA routing where required.

---

## 📌 Content Integrity

Professional information should only be added when verified.

Do not add:

* Fake qualifications
* Fake employers
* Fake patient outcomes
* Fake testimonials
* Fake statistics
* Fake certifications
* Fake clinical specialties
* Invented professional experience

The portfolio should represent Glorious accurately and professionally.

---

## 📜 License

This portfolio is a personal professional website for Glorious Moraa.

All personal photographs, CV content, branding, and professional information remain the property of their respective owner.

Source-code licensing should be determined by the repository owner.
