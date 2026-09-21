# FoodBridge — AI Agent Developer Guide

This document provides a comprehensive overview of the FoodBridge codebase. Any AI agent modifying this project must read this file before proceeding.

## Core Tech Stack
*   **Frontend**: Next.js (App Router), Tailwind CSS (with specific Glassmorphism `globals.css` utilities), Lucide-React (icons).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (via Mongoose), utilizing `2dsphere` indexes.

## Architectural Notes & Features

### 1. Geospatial Routing (Crucial)
The defining feature of this app is connecting Donors to Receivers based on location.
*   **MongoDB Schema**: Both `User` and `Listing` models use GeoJSON `Point` schemas.
*   `Listing.js` has `ListingSchema.index({ location: "2dsphere" });`
*   **Distance Query**: `backend/routes/listings.js` uses an advanced `$geoNear` aggregation pipeline to sort listings by distance (`distance_meters`). When modifying location queries, **never fallback to simple arithmetic distance**; always use `$geoNear` or `$nearSphere`.

### 2. Authentication & Roles
*   Auth is handled via standard JWT (Bearer tokens) generated in `backend/routes/auth.js`.
*   There are three strict roles: `donor`, `receiver`, `admin`.
*   The `requireRole` middleware (`backend/middleware/auth.js`) enforces access. Do not bypass this.
*   The Next.js frontend uses `AuthContext` to manage state.

### 3. Sustainability & ESG Metrics
*   Hitting SDG 12 & 13 is core to this app.
*   `backend/models/AuditLog.js` tracks the weight (`weight_kg`) of every claimed item.
*   `backend/routes/reports.js` aggregates this data to prove CO2 emissions avoided.
*   The formula used is: `1kg food saved = 2.5kg CO2e avoided`.

### 4. Design Aesthetics
*   The app uses a dark, "glassmorphism" aesthetic.
*   Core classes to use for containers: `glass`, `glass-card`, `animated-bg`.
*   Primary brand color is `emerald-500`.

## Quick Start
*   **Database**: `mongodb://127.0.0.1:27017/foodbridge`
*   **Seed DB**: `node backend/scripts/seed.js`
*   **Run Frontend**: `cd frontend && npm run dev`
*   **Run Backend**: `cd backend && npm run dev`
