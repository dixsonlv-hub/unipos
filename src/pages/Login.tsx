import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import uniwebLogo from "@/assets/uniweb-logo.jpg";

/* ── Perlin noise generator ── */
function buildNoise() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad2 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const dot2 = (g: number[], x: number, y: number) => g[0] * x + g[1] * y;
  return function (x: number, y: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const a = perm[X] + Y;
    const b = perm[X + 1] + Y;
    return lerp(
      lerp(dot2(grad2[perm[a] & 7], x, y), dot2(grad2[perm[b] & 7], x - 1, y), u),
      lerp(dot2(grad2[perm[a + 1] & 7], x, y - 1), dot2(grad2[perm[b + 1] & 7], x - 1, y - 1), u),
      v
    );
  };
}

/* ── Focus glow manager ── */
class FocusGlow {
  el: HTMLElement;
  wrapper: HTMLDivElement | null = null;
  cleanup: (() => void) | null = null;

  constructor(el: HTMLElement) {
    this.el = el;
  }

  mount() {
    this.destroy();
    const wrapper = document.createElement("div");
    wrapper.className = "login-focus-glow";

    const makeLayer = (extra = "") => {
      const layer = document.createElement("div");
      layer.className = `login-focus-glow-layer ${extra}`.trim();
      const blur = document.createElement("div");
      blur.className = "login-focus-glow-blur";
      const ring = document.createElement("div");
      ring.className = "login-focus-glow-ring";
      blur.appendChild(ring);
      layer.appendChild(blur);
      return layer;
    };

    wrapper.appendChild(makeLayer());
    wrapper.appendChild(makeLayer("layer-2"));
    wrapper.appendChild(makeLayer("layer-3"));
    document.body.appendChild(wrapper);
    this.wrapper = wrapper;

    const update = () => {
      if (!this.wrapper) return;
      const rect = this.el.getBoundingClientRect();
      const styles = getComputedStyle(this.el);
      const radius = parseFloat(styles.borderRadius) || 0;
      Object.assign(this.wrapper.style, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: `${radius}px`,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(this.el);
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("scroll", update, { passive: true });
    requestAnimationFrame(() => {
      if (this.wrapper) this.wrapper.style.opacity = "1";
    });

    this.cleanup = () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }

  hide() {
    if (this.wrapper) this.wrapper.style.opacity = "0";
  }

  destroy() {
    this.cleanup?.();
    this.cleanup = null;
    this.wrapper?.remove();
    this.wrapper = null;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<FocusGlow | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  // Particle state stored in refs to avoid re-renders
  const noiseRef = useRef(buildNoise());
  const particlesRef = useRef<any[]>([]);
  const tickRef = useRef(0);
  const modeRef = useRef<"idle" | "fierce">("idle");
  const surgeStartRef = useRef<number | null>(null);
  const rafRef = useRef(0);

  // Session check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/admin", { replace: true });
      setCheckingSession(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/admin", { replace: true });
      setCheckingSession(false);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Build particles
  const buildParticles = useCallback((w: number, h: number) => {
    const count = Math.min(7800, Math.max(3400, Math.floor((w * h) / 270)));
    const cols = Math.max(42, Math.floor(Math.sqrt(count * (w / Math.max(h, 1)))));
    const rows = Math.max(30, Math.floor(count / Math.max(cols, 1)));
    const gapX = w / cols;
    const gapY = h / rows;
    const ps: any[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = c * gapX + gapX * (0.28 + Math.random() * 0.44);
        const oy = r * gapY + gapY * (0.22 + Math.random() * 0.56);
        const hd = Math.random();
        ps.push({
          ox, oy, x: ox, y: oy, vx: 0, vy: 0,
          size: 0.85 + Math.random() * 2.15,
          alpha: 0.16 + Math.random() * 0.42,
          phase: Math.random() * Math.PI * 2,
          color: `rgba(${Math.round(18 + hd * 18)},${Math.round(64 + hd * 44)},${Math.round(160 + hd * 64)},0.96)`,
        });
      }
    }
    particlesRef.current = ps;
  }, []);

  const flowAngle = useCallback((x: number, y: number, t: number) => {
    const noise = noiseRef.current;
    let v = 0, amp = 1, freq = 1;
    for (let i = 0; i < 3; i++) {
      v += noise(x * 0.0018 * freq + t * 0.14, y * 0.0018 * freq + t * 0.11) * amp;
      amp *= 0.5;
      freq *= 2;
    }
    return v * Math.PI * 4;
  }, []);

  // Canvas + animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      tickRef.current++;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = tickRef.current * 0.009;
      const intense = modeRef.current === "fierce";
      if (!intense) surgeStartRef.current = null;
      if (intense && surgeStartRef.current === null) surgeStartRef.current = tickRef.current;
      const progress = intense ? Math.min((tickRef.current - (surgeStartRef.current ?? tickRef.current)) / 220, 1) : 0;
      const burstX = w * 0.5;
      const burstY = h * 0.52;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (const p of particlesRef.current) {
        const angle = flowAngle(p.ox, p.oy, t + p.phase);
        if (intense) {
          const dx = p.x - burstX;
          const dy = p.y - burstY;
          const dist = Math.hypot(dx, dy) || 1;
          const rx = dx / dist, ry = dy / dist;
          const sx = -ry, sy = rx;
          const nx = Math.cos(angle), ny = Math.sin(angle);
          const fo = Math.max(0, 1 - dist / (Math.max(w, h) * 0.88));
          const sw = 1 - (1 - progress) * (1 - progress);
          const sf = (1.8 + fo * 3.2) * (0.9 + sw * 1.1);
          const swf = (0.9 + fo * 1.9) * (0.88 + sw * 1.2);
          p.vx += (sx * 4.1 + nx * 2.4 + rx * 1.45) * sf * 0.14;
          p.vy += (sy * 4.1 + ny * 2.4 + ry * 1.45) * sf * 0.14;
          p.vx += (nx * 1.8 + rx * 2.6) * swf * 0.14;
          p.vy += (ny * 1.8 + ry * 2.6) * swf * 0.14;
          p.vx *= progress < 0.72 ? 0.953 : 0.971;
          p.vy *= progress < 0.72 ? 0.953 : 0.971;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          const idleAngle = flowAngle(p.ox * 1.15 + p.phase * 58, p.oy * 1.1 - p.phase * 36, t * 0.62 + p.phase * 0.42);
          const idleSpeed = 0.1 + p.alpha * 0.085;
          const cdx = p.x - w / 2, cdy = p.y - h / 2;
          const cd = Math.hypot(cdx, cdy) || 1;
          const swx = -cdy / cd, swy = cdx / cd;
          const reach = 12 + p.alpha * 11;
          const tx = p.ox + Math.cos(idleAngle) * reach;
          const ty = p.oy + Math.sin(idleAngle) * reach;
          p.vx *= 0.93; p.vy *= 0.93;
          p.vx += (Math.cos(idleAngle) * 0.66 + swx * 0.42) * idleSpeed;
          p.vy += (Math.sin(idleAngle) * 0.66 + swy * 0.42) * idleSpeed;
          p.vx += (tx - p.x) * 0.028; p.vy += (ty - p.y) * 0.028;
          p.vx += (p.ox - p.x) * 0.01; p.vy += (p.oy - p.y) * 0.01;
          p.x += p.vx; p.y += p.vy;
        }

        const fadePhase = intense ? Math.max(0, progress - 0.52) / 0.48 : 0;
        const activeAlpha = intense
          ? Math.max(0, Math.min(0.92, p.alpha + 0.28) * (1 - fadePhase * 1.18))
          : p.alpha;
        const surgeWave = intense ? 1 - (1 - progress) * (1 - progress) : 0;
        const drawSize = intense ? p.size * (1 + surgeWave * 1.18) : p.size;
        ctx.globalAlpha = activeAlpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [buildParticles, flowAngle]);

  // Focus glow handler
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    glowRef.current?.destroy();
    const glow = new FocusGlow(e.target);
    glow.mount();
    glowRef.current = glow;
  }, []);
  const handleBlur = useCallback(() => {
    const g = glowRef.current;
    if (g) {
      g.hide();
      glowRef.current = null;
      setTimeout(() => g.destroy(), 350);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Destroy glow before transition
    glowRef.current?.destroy();
    glowRef.current = null;

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Trigger fierce particle burst
    modeRef.current = "fierce";
    surgeStartRef.current = null;
    pageRef.current?.classList.add("login-page-entering");

    // onAuthStateChange will handle navigation
  };

  useEffect(() => {
    return () => {
      glowRef.current?.destroy();
    };
  }, []);

  if (checkingSession) return null;

  return (
    <div ref={pageRef} className="login-page">
      {/* Background */}
      <div className="login-bg-gradient" />
      <div className="login-backdrop" aria-hidden="true">
        <div className="login-blob" style={{ "--blob-color": "rgba(8,34,76,0.46)", "--blob-blur": "96px", "--blob-opacity": "1", "--blob-animation": "loginBlobA", "--blob-duration": "16s", width: 540, height: 540, top: "-12%", left: "-10%" } as React.CSSProperties} />
        <div className="login-blob" style={{ "--blob-color": "rgba(30,72,150,0.38)", "--blob-blur": "88px", "--blob-opacity": "0.96", "--blob-animation": "loginBlobB", "--blob-duration": "15s", width: 500, height: 500, top: "48%", right: "-8%" } as React.CSSProperties} />
        <div className="login-blob" style={{ "--blob-color": "rgba(164,203,255,0.24)", "--blob-blur": "118px", "--blob-opacity": "0.82", "--blob-animation": "loginBlobC", "--blob-duration": "18s", width: 620, height: 620, top: "18%", left: "30%" } as React.CSSProperties} />
        <div className="login-blob" style={{ "--blob-color": "rgba(17,53,118,0.38)", "--blob-blur": "80px", "--blob-opacity": "0.92", "--blob-animation": "loginBlobD", "--blob-duration": "17s", width: 470, height: 470, bottom: "-10%", left: "8%" } as React.CSSProperties} />
        <div className="login-blob" style={{ "--blob-color": "rgba(206,229,255,0.18)", "--blob-blur": "96px", "--blob-opacity": "0.74", "--blob-animation": "loginBlobE", "--blob-duration": "19s", width: 430, height: 430, top: "2%", right: "14%" } as React.CSSProperties} />
      </div>
      <canvas ref={canvasRef} className="login-particle-canvas" aria-hidden="true" />
      <div className="login-grain" aria-hidden="true" />

      {/* Content */}
      <div className="login-wrap">
        <div className="login-logo-mark">
          <img src={uniwebLogo} alt="Uniweb" />
          <div className="login-logo-mark-name">UniwebPay OS</div>
          <div className="login-logo-mark-tag">Merchant Portal</div>
        </div>

        <div className="login-card">
          <div className="login-title">Welcome back</div>
          <div className="login-sub">Sign in to your merchant account to continue.</div>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login-btn ${loading ? "is-loading" : ""}`}
            >
              {loading ? (
                <>
                  <Loader2 className="inline-block h-4 w-4 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div className="login-footer">
            © {new Date().getFullYear()} Uniweb Pte. Ltd.<br />
            Licensed Payment Institution · MAS Licence No. PS20200248
          </div>
        </div>

        <div className="login-mas">All connections are encrypted and secured</div>
        <div className="login-mas" style={{ marginTop: 8, color: "rgba(255,255,255,0.38)" }}>
          {new Date().getFullYear()} Uniweb Pte. Ltd. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
