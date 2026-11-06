"use client";

import { useEffect, useRef, useState } from "react";
import type { DayPoint } from "@/lib/admin-data";

type Props = {
  days: DayPoint[];
  field: "leads" | "revenue";
  label: string;
  format: (n: number) => string;
};

const LIME = "#C8FF2E";
const BONE = "#F4F1EA";
const INK4 = "#2a2a2a";

/** 3-point moving average, edges padded. */
function smooth(v: number[]) {
  return v.map((_, i) => {
    const a = v[Math.max(0, i - 1)];
    const b = v[i];
    const c = v[Math.min(v.length - 1, i + 1)];
    return (a + b + c) / 3;
  });
}

/**
 * Canvas chart drawn at true device pixels via ResizeObserver.
 * Bars = daily values. Line = smoothed trend with a lime gradient under it.
 * Crosshair tooltip on hover and touch. Curve control points clamped to the baseline.
 */
export function Chart({ days, field, label, format }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;

    const draw = () => {
      const rect = el.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      const W = Math.round(rect.width);
      const H = Math.round(rect.height);
      if (W === 0 || H === 0) return;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const pad = { l: 8, r: 8, t: 14, b: 22 };
      const iw = W - pad.l - pad.r;
      const ih = H - pad.t - pad.b;
      const base = pad.t + ih;
      const vals = days.map((d) => d[field]);
      const sm = smooth(vals);
      const max = Math.max(1, ...vals, ...sm);
      const n = vals.length;
      if (n === 0) return;
      const slot = iw / n;
      const bw = Math.max(2, Math.min(18, slot * 0.55));
      const x = (i: number) => pad.l + slot * i + slot / 2;
      const y = (v: number) => base - (v / max) * ih;

      // baseline
      ctx.strokeStyle = INK4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, base + 0.5);
      ctx.lineTo(W - pad.r, base + 0.5);
      ctx.stroke();

      // bars
      for (let i = 0; i < n; i++) {
        const h = Math.max(0, base - y(vals[i]));
        ctx.fillStyle = hover === i ? BONE : "rgba(244,241,234,0.22)";
        const r = Math.min(3, bw / 2);
        const bx = x(i) - bw / 2;
        const by = base - h;
        ctx.beginPath();
        ctx.moveTo(bx, base);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, base);
        ctx.closePath();
        ctx.fill();
      }

      // smoothed line: Catmull-Rom -> bezier, control points clamped to baseline
      if (n >= 2) {
        const pts = sm.map((v, i) => ({ x: x(i), y: y(v) }));
        const path = new Path2D();
        path.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < n - 1; i++) {
          const p0 = pts[Math.max(0, i - 1)];
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const p3 = pts[Math.min(n - 1, i + 2)];
          const c1x = p1.x + (p2.x - p0.x) / 6;
          const c1y = Math.min(base, p1.y + (p2.y - p0.y) / 6);
          const c2x = p2.x - (p3.x - p1.x) / 6;
          const c2y = Math.min(base, p2.y - (p3.y - p1.y) / 6);
          path.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
        }
        // gradient fill under the line
        const fill = new Path2D(path);
        fill.lineTo(pts[n - 1].x, base);
        fill.lineTo(pts[0].x, base);
        fill.closePath();
        const g = ctx.createLinearGradient(0, pad.t, 0, base);
        g.addColorStop(0, "rgba(200,255,46,0.28)");
        g.addColorStop(1, "rgba(200,255,46,0)");
        ctx.fillStyle = g;
        ctx.fill(fill);
        ctx.strokeStyle = LIME;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.stroke(path);
      }

      // x labels: first, middle, last
      ctx.fillStyle = "rgba(244,241,234,0.5)";
      ctx.font = "11px Inter, system-ui, sans-serif";
      ctx.textBaseline = "top";
      const lab = (i: number) => days[i].day.slice(5).replace("-", "/");
      ctx.textAlign = "left";
      ctx.fillText(lab(0), pad.l, base + 6);
      ctx.textAlign = "center";
      ctx.fillText(lab(Math.floor((n - 1) / 2)), x(Math.floor((n - 1) / 2)), base + 6);
      ctx.textAlign = "right";
      ctx.fillText(lab(n - 1), W - pad.r, base + 6);

      // crosshair + tooltip
      if (hover !== null && days[hover]) {
        const hx = x(hover);
        ctx.strokeStyle = "rgba(244,241,234,0.35)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(hx + 0.5, pad.t);
        ctx.lineTo(hx + 0.5, base);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = LIME;
        ctx.beginPath();
        ctx.arc(hx, y(sm[hover]), 3.5, 0, Math.PI * 2);
        ctx.fill();

        const text = `${days[hover].day.slice(5)} · ${format(vals[hover])}`;
        ctx.font = "600 12px Inter, system-ui, sans-serif";
        const tw = ctx.measureText(text).width + 16;
        const th = 24;
        let tx = hx - tw / 2;
        tx = Math.max(pad.l, Math.min(W - pad.r - tw, tx));
        const ty = pad.t;
        ctx.fillStyle = BONE;
        ctx.beginPath();
        ctx.roundRect(tx, ty, tw, th, 6);
        ctx.fill();
        ctx.fillStyle = "#0a0a0a";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, tx + 8, ty + th / 2);
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [days, field, hover, format]);

  const pick = (clientX: number) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 8;
    const slot = (r.width - pad * 2) / days.length;
    const i = Math.floor((clientX - r.left - pad) / slot);
    setHover(i >= 0 && i < days.length ? i : null);
  };

  return (
    <div className="rounded-card border border-ink-4 bg-ink-2 p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">{label}</p>
      <div
        ref={wrap}
        className="mt-2 h-40 w-full touch-pan-y select-none"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onTouchStart={(e) => pick(e.touches[0].clientX)}
        onTouchMove={(e) => pick(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        <canvas ref={canvas} className="block" aria-label={label} role="img" />
      </div>
    </div>
  );
}
