"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) setError(result.error || "Login failed");
    } catch {
      setError("We couldn’t reach FoodBridge. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <main className="auth-shell">
      <div className="container">
        <div className="row justify-content-center align-items-stretch g-4">
          <div className="col-lg-5 d-none d-lg-block">
            <aside className="auth-intro">
              <p className="section-kicker">Welcome back</p>
              <h1>Good to see you. Let’s keep food moving.</h1>
              <p>
                Sign in to find a nearby pickup, manage a donation, or keep your
                organisation’s handoffs on track.
              </p>
              <span className="auth-intro__note">
                <HeartHandshake size={16} /> Local action, shared impact
              </span>
            </aside>
          </div>

          <div className="col-lg-6 col-xl-5">
            <section className="auth-card">
              <div>
                <h2>Log in</h2>
                <p className="auth-card__subtitle">Use your FoodBridge account to continue.</p>
              </div>

              <div className="auth-demo" aria-label="Fill a seeded demo account">
                <Button variant="ghost" className="text-xs py-1 px-3" onClick={() => fillDemo("freshbakes@example.com")}>
                  Demo donor
                </Button>
                <Button variant="ghost" className="text-xs py-1 px-3" onClick={() => fillDemo("feedingindia@example.com")}>
                  Demo NGO
                </Button>
                <Button variant="ghost" className="text-xs py-1 px-3" onClick={() => fillDemo("admin@foodbridge.com")}>
                  Demo admin
                </Button>
              </div>

              {error && <div className="auth-error" role="alert">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="auth-field">
                  <label htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                  {loading ? "Logging in…" : <>Continue <ArrowRight size={16} /></>}
                </Button>
              </form>

              <p className="auth-card__footer">
                Don’t have an account? <Link href="/register">Create one</Link>
              </p>
              <p className="auth-card__footer flex items-center gap-2" style={{ marginTop: 12 }}>
                <ShieldCheck size={14} aria-hidden="true" /> Your account is used only to manage FoodBridge pickups.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
