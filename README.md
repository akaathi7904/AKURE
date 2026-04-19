# AKURE — Premium Natural Products E-Commerce

> *Perfect by Nature. Created by AKURE.*

A full-stack, production-ready e-commerce website built with Node.js/Express, Supabase, and vanilla HTML/CSS/JavaScript.

---

## Live Demo

GitHub repositories show source code, not a running website. This repo now includes a GitHub Pages workflow that publishes the storefront from `public/`.

- Expected GitHub Pages URL: `https://akaathi7904.github.io/AKURE/`
- GitHub Pages version: storefront demo with static product fallback
- Full version: deploy the Express server for admin features and live API routes

---

## Project Structure

```
akure/
├── server.js                   # Express entry point
├── package.json
├── .env                        # (copy from .env.example, never commit)
├── config/
│   └── supabase.js             # Supabase client (service role)
├── middleware/
│   ├── auth.js                 # JWT auth guard
│   └── errorHandler.js         # Global error handler
├── controllers/
│   ├── productController.js
│   └── orderController.js
├── routes/
│   ├── products.js             # GET /api/products, GET /api/products/:id
│   └── orders.js               # POST /api/orders, GET /api/orders
└── public/
    ├── index.html              # Home
    ├── shop.html               # Product Listing
    ├── product.html            # Product Details
    ├── cart.html               # Cart
    ├── checkout.html           # Checkout
    ├── order-success.html      # Order Confirmed
    ├── login.html              # Login / Register
    ├── css/
    │   ├── variables.css       # Design tokens
    │   ├── global.css          # Reset + typography
    │   ├── components.css      # All reusable components
    │   ├── home.css
    │   ├── shop.css
    │   └── product.css         # Product, Cart, Checkout, Auth, Success styles
    └── js/
        ├── utils.js            # Cart (localStorage), toast, helpers
        ├── api.js              # Fetch wrapper → backend API
        ├── auth.js             # Supabase Auth client
        ├── home.js
        ├── shop.js
        ├── product.js
        ├── cart.js
        ├── checkout.js
        ├── order-success.js
        └── login.js
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Inject Frontend Config

In each HTML file, update the env config block with your **public** Supabase values:

```html
<script>
  window.__AKURE_ENV__ = {
    SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
    SUPABASE_ANON: 'your_supabase_anon_key'
  };
</script>
```

> ⚠️ Only use the **anon** (public) key here — never the service role key.

### 4. Set Up Database (Supabase)

Run the following SQL in your Supabase SQL Editor:

```sql
-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  images text[],
  category text,
  stock int default 0,
  is_limited_batch boolean default false,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  status text default 'pending',
  total numeric,
  shipping_address jsonb,
  created_at timestamptz default now()
);

-- Order Items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int,
  price numeric
);

-- RPC: decrement stock safely
create or replace function decrement_stock(p_id uuid, qty int)
returns void language plpgsql as $$
begin
  update products set stock = greatest(0, stock - qty) where id = p_id;
end;
$$;
```

**Row Level Security (RLS):**

```sql
-- Enable RLS on orders and order_items
alter table orders enable row level security;
alter table order_items enable row level security;

-- Users can only see their own orders
create policy "Users see own orders" on orders
  for select using (auth.uid() = user_id);

-- Products are public
alter table products enable row level security;
create policy "Products are public" on products
  for select using (true);
```

### 5. Seed Sample Products

```sql
insert into products (name, description, price, category, stock, is_limited_batch) values
  ('Cold-Pressed Coconut Oil', 'Pure virgin coconut oil extracted from fresh coconuts. No chemicals, no heat.', 599, 'oils', 50, false),
  ('Wild Forest Honey', 'Harvested from wild beehives in reserve forests. Raw, unfiltered, unheated.', 899, 'honey', 20, true),
  ('Moringa Leaf Powder', 'Nutrient-dense moringa powder from certified organic farms. Rich in iron and antioxidants.', 449, 'herbs', 100, false),
  ('Black Seed Oil', 'First cold-press Nigella sativa oil. Traditionally known for immune support.', 799, 'oils', 30, true),
  ('Turmeric Root Powder', 'Stone-ground turmeric root with 5% curcumin content. Soil-tested, pesticide-free.', 349, 'herbs', 80, false),
  ('Raw Beeswax Lip Balm', 'Artisan lip balm made with raw beeswax and shea butter. Zero synthetic additives.', 299, 'skincare', 60, false);
```

### 6. Run the Server

```bash
# Production
npm start

# Development (auto-restart on file change)
npm run dev
```

Visit: **http://localhost:3000**

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | None | List products. Query: `category`, `search`, `page`, `limit` |
| GET | `/api/products/:id` | None | Get single product |
| POST | `/api/orders` | ✅ Bearer JWT | Create order + order items |
| GET | `/api/orders` | ✅ Bearer JWT | Get user's order history |

---

## User Flows

```
1. Browse → /shop.html → Product grid with filters
2. View Product → /product.html?id=... → Add to cart (toast notification)
3. Cart → /cart.html → Adjust qty, remove items
4. Login → /login.html (required before checkout)
5. Checkout → /checkout.html → Fill shipping form → Place Order
6. Success → /order-success.html → Order confirmed
```

---

## Deployment

### Option A: GitHub Pages Demo

This repository includes `.github/workflows/deploy-pages.yml`, which publishes the `public/` folder to GitHub Pages on every push to `main`.

- Demo URL pattern: `https://<username>.github.io/<repository>/`
- For this repo: `https://akaathi7904.github.io/AKURE/`
- This is a static storefront demo, not the full Express backend

### Option B: Node.js on a VPS (Ubuntu + PM2)

```bash
npm install -g pm2
pm2 start server.js --name akure
pm2 save && pm2 startup
```

Add an Nginx reverse proxy to port 3000 and use Certbot for HTTPS.

### Option C: Railway / Render

1. Push to GitHub
2. Connect repo in [Railway](https://railway.app) or [Render](https://render.com)
3. Add environment variables in the platform dashboard
4. Deploy — done.

### Option D: Vercel (Static) + Separate API

Not recommended for this setup as it requires a persistent Node.js server.

---

## Design System

| Token | Value |
|-------|-------|
| Dark Green | `#1B3A2F` |
| Cream | `#F5F1E9` |
| Gold Accent | `#C8A96A` |
| Heading Font | Playfair Display (serif) |
| Body Font | Inter (sans-serif) |

---

## License

© 2026 AKURE. All rights reserved.
# AKURE  
