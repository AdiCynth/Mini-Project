"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, HeartHandshake, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "donor";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole,
    organization_name: "",
    phone: "",
    address: "",
    lat: "",
    lng: "",
  });
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await register(formData);
      if (!result.success) setError(result.error || "Registration failed");
    } catch {
      setError("We couldn’t reach FoodBridge. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const chooseRole = (role) => setFormData((current) => ({ ...current, role }));

  const useCurrentLocation = () => {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Your browser doesn’t support location lookup. Enter the coordinates manually.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((current) => ({
          ...current,
          lat: coords.latitude.toFixed(6),
          lng: coords.longitude.toFixed(6),
        }));
        setLocationMessage("Location added. You can adjust the coordinates below.");
      },
      () => setLocationMessage("Location wasn’t available. Enter the coordinates manually."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <main className="auth-shell">
      <div className="container">
        <div className="row justify-content-center align-items-stretch g-4">
          <div className="col-lg-4 d-none d-lg-block">
            <aside className="auth-intro">
              <p className="section-kicker">Start close to home</p>
              <h1>Small local connections can change a lot.</h1>
              <p>
                Create an account for your food business or community
                organisation, then coordinate pickups in one place.
              </p>
              <span className="auth-intro__note">
                <HeartHandshake size={16} /> Built for sharing, not selling
              </span>
            </aside>
          </div>

          <div className="col-lg-7 col-xl-6">
            <section className="auth-card">
              <div>
                <h2>Create an account</h2>
                <p className="auth-card__subtitle">Tell us a little about the organisation you represent.</p>
              </div>

              {error && <div className="auth-error" role="alert">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <fieldset className="border-0 p-0 m-0">
                  <legend className="auth-field mb-2">
                    <span className="block text-xs font-bold">I’m joining as a</span>
                  </legend>
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => chooseRole("receiver")}
                        className={`auth-role-button w-full ${formData.role === "receiver" ? "is-selected" : ""}`}
                      >
                        NGO / community kitchen
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => chooseRole("donor")}
                        className={`auth-role-button w-full ${formData.role === "donor" ? "is-selected" : ""}`}
                      >
                        Food donor
                      </button>
                    </div>
                  </div>
                </fieldset>

                <div className="row g-3">
                  <div className="col-md-6 auth-field">
                    <label htmlFor="register-name">Your name</label>
                    <input id="register-name" type="text" name="name" autoComplete="name" required value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 auth-field">
                    <label htmlFor="register-email">Email address</label>
                    <input id="register-email" type="email" name="email" autoComplete="email" required value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 auth-field">
                    <label htmlFor="register-password">Password</label>
                    <input id="register-password" type="password" name="password" autoComplete="new-password" required value={formData.password} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 auth-field">
                    <label htmlFor="register-phone">Phone</label>
                    <input id="register-phone" type="tel" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="col-12 auth-field">
                    <label htmlFor="register-organization">Organisation name</label>
                    <input id="register-organization" type="text" name="organization_name" autoComplete="organization" required value={formData.organization_name} onChange={handleChange} />
                  </div>
                  <div className="col-12 auth-field">
                    <label htmlFor="register-address">Pickup / organisation address</label>
                    <input id="register-address" type="text" name="address" autoComplete="street-address" required value={formData.address} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[#2D2433]">Map coordinates</span>
                      <button type="button" className="fb-button fb-button--light min-h-[38px] px-3 text-xs" onClick={useCurrentLocation}>
                        <MapPin size={14} /> Use current location
                      </button>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6 auth-field">
                        <label htmlFor="register-lat">Latitude</label>
                        <input id="register-lat" type="number" name="lat" step="any" min="-90" max="90" required value={formData.lat} onChange={handleChange} placeholder="Decimal degrees" />
                      </div>
                      <div className="col-md-6 auth-field">
                        <label htmlFor="register-lng">Longitude</label>
                        <input id="register-lng" type="number" name="lng" step="any" min="-180" max="180" required value={formData.lng} onChange={handleChange} placeholder="Decimal degrees" />
                      </div>
                    </div>
                    {locationMessage && <p className="mt-2 text-xs text-secondary" role="status">{locationMessage}</p>}
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                  {loading ? "Creating account…" : <>Create account <ArrowRight size={16} /></>}
                </Button>
              </form>

              <p className="auth-card__footer">
                Already have an account? <Link href="/login">Log in</Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="auth-shell"><div className="container"><section className="auth-card">Loading registration…</section></div></main>}>
      <RegisterForm />
    </Suspense>
  );
}
