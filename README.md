# InjuryPredict

AI-powered biomechanical screening platform for early injury risk detection in grassroots sports.

🔗 **Live Demo:** https://injury-predict-taupe.vercel.app/

---

## What it does

InjuryPredict uses phone-based pose estimation to analyze athlete movement and predict injury risk across 5 body regions — no wearables, no clinical equipment, no cost.

A coach films an athlete performing a movement for 30 seconds. The AI extracts 33 skeletal keypoints per frame, measures joint asymmetries across multiple frames, and generates a color-coded injury risk report with prevention exercises.

Built for India's 60 million student athletes who currently have zero access to sports physiotherapists.

---

## Features

- **Real AI** — MediaPipe Pose running entirely in the browser (no server, no cost, works offline)
- **Movement validation** — rejects videos with no person detected or no real movement
- **Coach portal** — manage multiple athletes, run screenings, track team health
- **Athlete portal** — view personal screening history and progress
- **Longitudinal tracking** — every screening saved with trend graphs over time
- **PDF report export** — professional downloadable reports with skeleton overlay
- **Role-based auth** — separate coach and athlete registration/login flows

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Styling | TailwindCSS |
| AI / Pose Estimation | MediaPipe Pose Landmarker (WASM, browser-based) |
| Data Layer | localStorage (structured for Supabase migration) |
| Build Tool | Vite |
| Deployment | Vercel |

---


## AI Pipeline

The AI analysis follows a complete browser-side computer vision pipeline:

1. Athlete uploads a movement video
2. Video is split into multiple frames
3. MediaPipe Pose detects 33 body landmarks
4. Joint positions are analyzed across multiple frames
5. Biomechanical asymmetries are calculated
6. Injury risk is classified
7. Personalized corrective exercises are generated
8. Professional PDF report is created

Everything runs directly inside the browser using WebAssembly.

---

## AI Architecture

Video Upload
      │
      ▼
Frame Extraction
      │
      ▼
MediaPipe Pose
(33 Landmarks)
      │
      ▼
Biomechanical Analysis
 • Knee Asymmetry
 • Shoulder Alignment
 • Hip Alignment
      │
      ▼
Risk Classification
(Low / Moderate / High)
      │
      ▼
Corrective Exercise Engine
      │
      ▼
PDF Report + Dashboard Storage


## Biomechanical Thresholds

Based on published ACL prevention and sports medicine research:

| Metric | Low Risk | Moderate Risk | High Risk |
|---|---|---|---|
| Knee asymmetry | < 8° | 8–15° | > 15° |
| Shoulder asymmetry | < 4% | 4–8% | > 8% |
| Hip asymmetry | < 3% | 3–6% | > 6% |

---

## Local Development

```bash
git clone https://github.com/ish1taa11/InjuryPredict
cd injurypredict
npm install
npm run dev
```

---

## Technical Challenges

- Browser-side AI inference using MediaPipe Pose
- Multi-frame pose analysis
- Joint asymmetry calculations
- Movement validation
- Local athlete data persistence
- PDF report generation
- Coach & Athlete role management

---

## Roadmap

- [ ] Supabase backend (replace localStorage)
- [ ] Coach-created athlete profiles
- [ ] Hindi/regional language support via Bhashini API
- [ ] WhatsApp report sharing
- [ ] React Native mobile app
- [ ] ML model trained on Indian athlete dataset

---

## Disclaimer

InjuryPredict is a screening and awareness tool, not a diagnostic replacement for clinical sports medicine. Results should be interpreted alongside professional assessment.

---

*Built by [ishita] — Computer Engineering student, India*