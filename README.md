# BMG CYCLES / America Motorcycle Tire E-Commerce Platform

A modern, high-performance full-stack e-commerce ecosystem built for motorcycle tires, parts, and accessories. Features a Next.js storefront, dynamic motorcycle fitment matching, SEO metadata engine, and a Laravel API backend.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 15 (React 19), TypeScript, Tailwind CSS, Lucide Icons, Custom Typography (Oswald & Inter)
* **Backend:** Laravel 11 (PHP 8.2+), MySQL Architecture, Eloquent ORM, REST API
* **Asset Optimization:** MD5 Image Hashing & WebP Auto Conversions
* **Data Processing:** Asynchronous Chunked CSV Batch Importer with Fitment Deduplication

---

## ✨ Key Features

1. **Dynamic SEO & Search Metadata Engine**
   * Custom URL Slug management (`/products/[slug]`).
   * Dynamic document title tag (`meta_title`), description, keywords, and canonical direct URLs.
   * Real-time Google Search Preview inside the Admin Dashboard.
   * Automatic injection of OpenGraph social cards into Product Detail Pages (PDP).

2. **Vehicle Fitment Specs & Compatibility**
   * Multi-vehicle motorcycle compatibility matrix (Year, Make, Model, Position).
   * Fitment deduplication algorithms preventing database duplication.
   * Customer vehicle lookup & interactive filtering on storefront.

3. **Admin Control Panel**
   * Full-page **Product Creation & Editing** (no constrained popups/modals).
   * Multi-image gallery management.
   * Compact sidebar SEO controller.
   * CSV Bulk Import system with progress feedback & error handling.

4. **Storefront & Customer Dashboard**
   * Responsive layout with brand typography (`font-heading` Oswald).
   * Verified rider account management & order tracking.
   * Dynamic product grid with faceted filters (Brand, Category, Fitment).

---

## 🚀 Setup & Local Development Guide

### Prerequisites
* **Node.js** v18+ and **npm**
* **PHP** 8.2+ with Composer
* **MySQL Database**

---

### 1. Backend Setup (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Environment setup
cp .env.example .env

# Configure your MySQL database credentials inside .env:
# DB_DATABASE=americamotorcycletire
# DB_USERNAME=root
# DB_PASSWORD=

# Generate Application Key
php artisan key:generate

# Run Database Migrations
php artisan migrate

# Start Laravel Development Server
php artisan serve
```
Backend server will run at: `http://localhost:8000` (or `http://127.0.0.1:8000`).

---

### 2. Frontend Setup (Next.js)

```bash
cd frontend

# Install Node modules
npm install

# Configure Environment Variables (.env.local if needed)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Start Next.js Development Server
npm run dev
```
Frontend server will run at: `http://localhost:3000`.

---

## 📁 Repository Structure

```
americamotorcycletire/
├── backend/                  # Laravel 11 REST API Backend
│   ├── app/
│   │   ├── Http/Controllers/ # Controllers (AdminProductController, OrderController, etc.)
│   │   ├── Models/           # Eloquent Models (Product, Fitment, Brand, Category)
│   ├── database/
│   │   ├── migrations/       # Schema migrations (SEO, Products, Fitments)
│   ├── routes/               # API Routes (`routes/api.php`)
│   └── storage/              # Uploaded media & system logs
│
├── frontend/                 # Next.js 15 Storefront & Admin App
│   ├── src/
│   │   ├── app/              # Next.js App Router ([slug], admin, account, etc.)
│   │   ├── components/       # UI Components (Header, Footer, ProductCard, Filter)
│   └── public/               # Static assets & brand logos
│
├── .gitignore                # Root Git Ignore Rules
└── README.md                 # Project Documentation
```

---

## 📄 License
Commercial License - Proprietary to **BMG CYCLES / America Motorcycle Tire**. All rights reserved.
