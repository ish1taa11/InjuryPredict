import { type AnalysisResult } from './App';

interface ReportData {
  athleteName: string;
  athleteAge?: number;
  athleteSport: string;
  coachName?: string;
  screening: {
    date: string;
    sport: string;
    overallScore: number;
    riskIndicators: { region: string; level: string }[];
    findings: { observation: string; severity: string; area: string }[];
    exercises: {
      name: string;
      description: string;
      difficulty: string;
      sets: string;
      targetArea: string;
    }[];
    kneeAsymmetry: number;
    shoulderAsymmetry: number;
    hipAsymmetry: number;
    skeletonImageUrl?: string | null;
  };
}

function riskColor(level: string): string {
  if (level === 'High')     return '#dc2626';
  if (level === 'Moderate') return '#ca8a04';
  return '#16a34a';
}

function riskBg(level: string): string {
  if (level === 'High')     return '#fef2f2';
  if (level === 'Moderate') return '#fefce8';
  return '#f0fdf4';
}

export async function generatePDFReport(data: ReportData): Promise<void> {
  const score      = data.screening.overallScore;
  const scoreColor = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>InjuryPredict Report — ${data.athleteName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; background: white; }

    .header {
      background: linear-gradient(135deg, #2563eb, #0d9488);
      color: white;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header-sub { font-size: 11px; opacity: 0.7; margin-top: 4px; }
    .header-date { font-size: 11px; opacity: 0.7; text-align: right; }

    .content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }

    .athlete-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .athlete-name { font-size: 20px; font-weight: 800; }
    .athlete-meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    .score-badge {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: ${scoreColor};
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .score-num { font-size: 24px; font-weight: 900; line-height: 1; }
    .score-label { font-size: 9px; opacity: 0.8; margin-top: 2px; }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding-bottom: 8px;
      border-bottom: 2px solid #2563eb;
      margin-bottom: 12px;
    }

    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }
    .metric-value { font-size: 22px; font-weight: 900; color: #0f172a; }
    .metric-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
    .metric-threshold { font-size: 10px; color: #94a3b8; margin-top: 4px; }

    .risk-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 6px;
    }
    .risk-region { font-size: 13px; font-weight: 600; }
    .risk-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      color: white;
    }

    .finding-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .finding-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }
    .finding-text { font-size: 12px; color: #475569; line-height: 1.5; }

    .exercise-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 10px;
    }
    .exercise-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .exercise-name { font-size: 13px; font-weight: 700; }
    .exercise-tag {
      font-size: 10px;
      font-weight: 600;
      color: #2563eb;
      background: #eff6ff;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }
    .exercise-meta { font-size: 10px; color: #94a3b8; text-align: right; }
    .exercise-desc { font-size: 11px; color: #64748b; line-height: 1.6; }

    .skeleton-img {
      width: 100%;
      max-height: 280px;
      object-fit: contain;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .disclaimer {
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.6;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .footer {
      background: #f1f5f9;
      padding: 12px 32px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="header-title">InjuryPredict</div>
      <div class="header-sub">AI-Powered Athlete Injury Prevention Platform</div>
    </div>
    <div class="header-date">
      Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
      For screening purposes only
    </div>
  </div>

  <div class="content">

    <!-- Athlete Card -->
    <div class="athlete-card">
      <div>
        <div class="athlete-name">${data.athleteName}</div>
        <div class="athlete-meta">
          ${[
            data.athleteAge ? `Age ${data.athleteAge}` : null,
            data.athleteSport,
            data.coachName ? `Coach: ${data.coachName}` : null,
            `Scan: ${data.screening.date}`,
          ].filter(Boolean).join('  ·  ')}
        </div>
      </div>
      <div class="score-badge">
        <div class="score-num">${score}</div>
        <div class="score-label">/ 100</div>
      </div>
    </div>

    ${data.screening.skeletonImageUrl ? `
    <!-- Skeleton Image -->
    <div>
      <div class="section-title">Pose Analysis</div>
      <img src="${data.screening.skeletonImageUrl}" class="skeleton-img" alt="Pose analysis" />
      <p style="font-size:10px;color:#94a3b8;text-align:center;margin-top:6px;">
        Green dots = detected joints · Blue lines = bone connections
      </p>
    </div>
    ` : ''}

    <!-- Biomechanical Measurements -->
    <div>
      <div class="section-title">Biomechanical Measurements</div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${data.screening.kneeAsymmetry.toFixed(1)}°</div>
          <div class="metric-label">Knee Asymmetry</div>
          <div class="metric-threshold">Normal &lt; 10°</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.screening.shoulderAsymmetry.toFixed(1)}%</div>
          <div class="metric-label">Shoulder Asymmetry</div>
          <div class="metric-threshold">Normal &lt; 4%</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.screening.hipAsymmetry.toFixed(1)}%</div>
          <div class="metric-label">Hip Asymmetry</div>
          <div class="metric-threshold">Normal &lt; 3%</div>
        </div>
      </div>
    </div>

    <!-- Joint Risk -->
    <div>
      <div class="section-title">Joint Risk Assessment</div>
      ${data.screening.riskIndicators.map(ri => `
        <div class="risk-row" style="background:${riskBg(ri.level)};">
          <span class="risk-region">${ri.region}</span>
          <span class="risk-badge" style="background:${riskColor(ri.level)};">${ri.level} Risk</span>
        </div>
      `).join('')}
    </div>

    <!-- Findings -->
    <div>
      <div class="section-title">Biomechanical Findings</div>
      ${data.screening.findings.map(f => `
        <div class="finding-row">
          <div class="finding-dot" style="background:${riskColor(f.severity)};"></div>
          <div class="finding-text">${f.observation}</div>
        </div>
      `).join('')}
    </div>

    <!-- Exercises -->
    <div>
      <div class="section-title">Prescribed Prevention Exercises</div>
      ${data.screening.exercises.map((ex, i) => `
        <div class="exercise-card">
          <div class="exercise-header">
            <div>
              <span class="exercise-tag">${ex.targetArea}</span>
              <div class="exercise-name">${i + 1}. ${ex.name}</div>
            </div>
            <div class="exercise-meta">
              ${ex.sets}<br/>
              <span style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">${ex.difficulty}</span>
            </div>
          </div>
          <div class="exercise-desc">${ex.description}</div>
        </div>
      `).join('')}
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer">
      This screening report is for informational purposes only and does not constitute medical advice.
      Consult a qualified sports medicine professional for clinical diagnosis and treatment.
      InjuryPredict uses AI-based pose estimation to flag movement asymmetries — results should be
      interpreted alongside professional assessment.
    </div>

  </div>

  <div class="footer">
    <span>InjuryPredict · AI Injury Prevention Platform</span>
    <span>${data.athleteName} · ${data.screening.date}</span>
  </div>

</body>
</html>`;

  // Open in new tab and trigger print dialog
 // Create a blob URL and download directly — no popup needed
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `InjuryPredict_${data.athleteName.replace(/\s+/g, '_')}_${data.screening.date}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}