import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  HeartHandshake,
  MapPin,
  PackageCheck,
  Route,
  Utensils,
} from "lucide-react";

const communityPhoto =
  "https://upload.wikimedia.org/wikipedia/commons/c/cf/Distribution_of_Food_Packets_Chengalpattu_%2851204468573%29.jpg";
const thaliPhoto =
  "https://images.unsplash.com/photo-1680359873864-43e89bf248ac?auto=format&fit=crop&w=900&q=80";
const ngoCommunityPhoto =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/In_this_difficult_time_of_pandemic_Voice_of_world_an_NGO_helping_disabled_persons_by_providing_free_monthly_ration_and_food_at_Kolkata_2021-1.jpg/960px-In_this_difficult_time_of_pandemic_Voice_of_world_an_NGO_helping_disabled_persons_by_providing_free_monthly_ration_and_food_at_Kolkata_2021-1.jpg";

const steps = [
  {
    number: "01",
    icon: Utensils,
    title: "A donor shares what’s ready",
    body: "Food businesses post the surplus, quantity, and a pickup window that works for their team.",
  },
  {
    number: "02",
    icon: Route,
    title: "Nearby organisations find it",
    body: "Location-aware listings help community kitchens and NGOs spot food they can collect in time.",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "The handoff gets completed",
    body: "Receivers claim a listing, collect it during the agreed window, and confirm the pickup.",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="home-hero__copy">
                <p className="home-eyebrow">
                  <span className="home-eyebrow__dot" aria-hidden="true" />
                  A local food-rescue network
                </p>
                <h1>
                  Good food deserves <em>a good next stop.</em>
                </h1>
                <p className="home-hero__lead">
                  FoodBridge helps Indian food businesses pass fresh surplus to
                  nearby NGOs and community kitchens—before the moment to use
                  it passes.
                </p>
                <div className="home-hero__actions">
                  <Link href="/register?role=receiver" className="fb-button fb-button--primary">
                    Find food near you <ArrowRight size={17} />
                  </Link>
                  <Link href="/register?role=donor" className="fb-button fb-button--light">
                    Share a surplus
                  </Link>
                </div>
                <div className="home-hero__note">
                  <MapPin size={15} aria-hidden="true" />
                  <span>Made for neighbourhood-scale food rescue across India</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="home-hero__visual">
                <div
                  className="home-hero__photo-main"
                  role="img"
                  aria-label="Food packet distribution by Ramakrishna Math and Ramakrishna Mission in Chengalpattu, India"
                  style={{ backgroundImage: `url("${communityPhoto}")` }}
                >
                  <div className="home-hero__photo-caption">
                    <span>Community food support · Chengalpattu</span>
                    <strong>A better route for food that’s still good.</strong>
                    <a
                      className="home-hero__photo-credit"
                      href="https://commons.wikimedia.org/wiki/File:Distribution_of_Food_Packets_Chengalpattu_(51204468573).jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Photo: Ramakrishna Math &amp; Mission ↗
                    </a>
                  </div>
                </div>
                <div
                  className="home-hero__photo-food"
                  aria-hidden="true"
                  style={{ backgroundImage: `url("${thaliPhoto}")` }}
                />
                <div className="home-hero__floating-note">
                  <span className="home-hero__floating-note-icon">
                    <Clock3 size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>Pickup windows, made clear</strong>
                    <small>Know when food is ready to collect</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-intro-band" aria-label="FoodBridge mission">
        <div className="container home-intro-band__inner">
          <span>From surplus to shared meals</span>
          <p>One local connection can make good food go further.</p>
        </div>
      </section>

      <section className="home-how" id="how-it-works">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <p className="section-kicker">A clear, practical handoff</p>
              <h2 className="section-heading">Three people. One better use for good food.</h2>
              <p className="section-lead">
                The platform is designed around the parts that matter on a busy
                day: what’s available, how far it is, and when it can be picked up.
              </p>
            </div>
          </div>

          <div className="row g-4 home-steps">
            {steps.map(({ number, icon: Icon, title, body }) => (
              <div className="col-md-4" key={number}>
                <article className="home-step">
                  <div className="home-step__top">
                    <span className="home-step__number">{number}</span>
                    <span className="home-step__icon">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-perspective">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <div className="home-perspective__visual">
                <div
                  className="home-perspective__image"
                  role="img"
                  aria-label="A Kolkata community volunteer handing over food support through Voice of World"
                  style={{ backgroundImage: `url("${ngoCommunityPhoto}")` }}
                />
                <div className="home-perspective__credit">
                  Voice of World · Kolkata, India · Photo: Goutam1962 / Wikimedia Commons ·{" "}
                  <a
                    href="https://commons.wikimedia.org/wiki/File:In_this_difficult_time_of_pandemic_Voice_of_world_an_NGO_helping_disabled_persons_by_providing_free_monthly_ration_and_food_at_Kolkata_2021-1.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    source
                  </a>{" "}·{" "}
                  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
                    CC BY-SA 4.0
                  </a>{" "}· cropped
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="home-perspective__copy">
                <p className="section-kicker">Built around the receiver’s day</p>
                <h2>Less searching. More time for the work you do.</h2>
                <p>
                  Community kitchens and NGOs need useful details up front—not
                  another noisy feed. Browse nearby surplus, compare collection
                  windows, and keep each claimed pickup in one place.
                </p>
                <ul className="home-feature-list">
                  <li><Check size={16} /> Nearby listings shown on a map and list</li>
                  <li><Check size={16} /> Pickup timing visible before you claim</li>
                  <li><Check size={16} /> Claims stay organised after collection</li>
                </ul>
                <Link href="/register?role=receiver" className="fb-button fb-button--primary">
                  Join as an NGO <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <div className="container">
          <HeartHandshake size={31} aria-hidden="true" />
          <h2>Let’s make the next handoff a little easier.</h2>
          <p>
            Whether you have food to share or people to serve, start with a
            local connection.
          </p>
          <Link href="/register?role=receiver" className="fb-button fb-button--primary">
            Get started with FoodBridge <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="fb-footer">
        <div className="container fb-footer__inner">
          <p>FoodBridge · Better food handoffs, stronger local communities.</p>
          <p>Built for donors, NGOs, and community kitchens across India.</p>
        </div>
      </footer>
    </main>
  );
}
