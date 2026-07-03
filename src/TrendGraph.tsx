import { useEffect, useRef } from 'react';

interface DataPoint {
  date: string;
  score: number;
}

export function TrendGraph({ data }: { data: DataPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 16, right: 16, bottom: 32, left: 36 };

    ctx.clearRect(0, 0, W, H);

    const scores = data.map(d => d.score);
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const maxScore = Math.min(100, Math.max(...scores) + 10);

    const toX = (i: number) =>
      PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right);
    const toY = (score: number) =>
      PAD.top + (1 - (score - minScore) / (maxScore - minScore)) * (H - PAD.top - PAD.bottom);

    // Risk zone backgrounds
    const zones = [
      { min: 0, max: 50, color: 'rgba(239,68,68,0.06)' },
      { min: 50, max: 75, color: 'rgba(234,179,8,0.06)' },
      { min: 75, max: 100, color: 'rgba(34,197,94,0.06)' },
    ];
    zones.forEach(({ min, max, color }) => {
      const y1 = toY(Math.min(max, maxScore));
      const y2 = toY(Math.max(min, minScore));
      ctx.fillStyle = color;
      ctx.fillRect(PAD.left, y1, W - PAD.left - PAD.right, y2 - y1);
    });

    // Grid lines
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    [25, 50, 75].forEach(val => {
      if (val >= minScore && val <= maxScore) {
        const y = toY(val);
        ctx.beginPath();
        ctx.moveTo(PAD.left, y);
        ctx.lineTo(W - PAD.right, y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(148,163,184,0.7)';
        ctx.font = '9px system-ui';
        ctx.fillText(String(val), 2, y + 3);
      }
    });

    // Gradient fill under line
    const gradient = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
    gradient.addColorStop(0, 'rgba(59,130,246,0.25)');
    gradient.addColorStop(1, 'rgba(59,130,246,0)');

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0].score));
    data.forEach((d, i) => {
      if (i > 0) {
        const cpX = (toX(i - 1) + toX(i)) / 2;
        ctx.bezierCurveTo(cpX, toY(data[i-1].score), cpX, toY(d.score), toX(i), toY(d.score));
      }
    });
    ctx.lineTo(toX(data.length - 1), H - PAD.bottom);
    ctx.lineTo(toX(0), H - PAD.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Main line
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.moveTo(toX(0), toY(data[0].score));
    data.forEach((d, i) => {
      if (i > 0) {
        const cpX = (toX(i - 1) + toX(i)) / 2;
        ctx.bezierCurveTo(cpX, toY(data[i-1].score), cpX, toY(d.score), toX(i), toY(d.score));
      }
    });
    ctx.stroke();

    // Dots + labels
    data.forEach((d, i) => {
      const x = toX(i);
      const y = toY(d.score);
      const color = d.score >= 75 ? '#22c55e' : d.score >= 50 ? '#eab308' : '#ef4444';

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Score label above dot
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(String(d.score), x, y - 10);

      // Date label below axis
      ctx.fillStyle = 'rgba(148,163,184,0.9)';
      ctx.font = '8px system-ui';
      const shortDate = d.date.slice(5); // MM-DD
      ctx.fillText(shortDate, x, H - PAD.bottom + 14);
    });

  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={340}
      height={160}
      className="w-full"
      style={{ display: 'block' }}
    />
  );
}