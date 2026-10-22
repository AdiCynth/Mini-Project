"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Menu, Utensils, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const dashboardLink = {
    donor: "/donor",
    receiver: "/receiver",
    admin: "/admin",
  }[user?.role] || "/";

  const secondaryLink = {
    donor: ["Listings", "/donor/listings"],
    receiver: ["Claims", "/receiver/claims"],
    admin: ["Reports", "/admin/reports"],
  }[user?.role];

  const howItWorks = pathname === "/" ? "#how-it-works" : "/#how-it-works";
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fb-nav">
      <div className="container fb-nav__inner">
        <Link href="/" className="fb-brand" aria-label="FoodBridge home" onClick={closeMenu}>
          <span className="fb-brand__mark"><Utensils size={20} aria-hidden="true" /></span>
          <span className="fb-brand__copy">
            <span className="fb-brand__name">FoodBridge</span>
            <span className="fb-brand__tagline">Good food, shared</span>
          </span>
        </Link>

        <div className="fb-nav__desktop">
          {!user ? (
            <>
              <Link href={howItWorks} className="fb-nav__link">How it works</Link>
              <Link href="/register?role=donor" className="fb-nav__link">For food donors</Link>
              <Link href="/login" className="fb-nav__link">Log in</Link>
              <Link href="/register?role=receiver" className="fb-button fb-button--primary">
                Join as an NGO
              </Link>
            </>
          ) : (
            <>
              <Link
                href={dashboardLink}
                className={`fb-nav__link ${pathname === dashboardLink ? "is-active" : ""}`}
              >
                <LayoutDashboard size={15} aria-hidden="true" /> Dashboard
              </Link>
              {secondaryLink && (
                <Link
                  href={secondaryLink[1]}
                  className={`fb-nav__link ${pathname.startsWith(secondaryLink[1]) ? "is-active" : ""}`}
                >
                  {secondaryLink[0]}
                </Link>
              )}
              <div className="fb-nav__account">
                <span className="fb-nav__user">
                  <strong>{user.name}</strong>
                  <span>{user.role}</span>
                </span>
                <button type="button" className="fb-button fb-button--text" onClick={logout}>
                  Log out
                </button>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          className="fb-nav__menu-button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {isOpen && (
        <div className="fb-nav__mobile">
          {!user ? (
            <>
              <Link href={howItWorks} className="fb-nav__link" onClick={closeMenu}>How it works</Link>
              <Link href="/register?role=donor" className="fb-nav__link" onClick={closeMenu}>For food donors</Link>
              <Link href="/login" className="fb-nav__link" onClick={closeMenu}>Log in</Link>
              <Link href="/register?role=receiver" className="fb-button fb-button--primary" onClick={closeMenu}>
                Join as an NGO
              </Link>
            </>
          ) : (
            <>
              <Link href={dashboardLink} className="fb-nav__link" onClick={closeMenu}>Dashboard</Link>
              {secondaryLink && (
                <Link href={secondaryLink[1]} className="fb-nav__link" onClick={closeMenu}>
                  {secondaryLink[0]}
                </Link>
              )}
              <button
                type="button"
                className="fb-button fb-button--text"
                onClick={() => { logout(); closeMenu(); }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
