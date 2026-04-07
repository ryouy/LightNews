# Newslight

A minimal web app for **Yahoo! News** and **Weathernews**—built for clarity on slow or costly links. No hero shots, no custom illustration stack: just type, spacing, and the facts you asked for.

---

## Why it feels light

- **Prefetch off where it hurts** — primary nav links skip background RSC fetches so bandwidth stays on the screen you chose.
- **System fonts only** — no webfont downloads; predictable layout and smaller payloads.
- **Signal over chrome** — flat UI, no gradients or heavy shadows. Weather icons are the provider’s own URLs, only where they carry meaning.
- **Server-side scraping** — lists, article bodies, and weather HTML are parsed with Cheerio on the server; the client doesn’t receive bloated JSON trees.

Pages are **rendered dynamically**, so each open hits the network. You always get fresh context; on thin pipes, first paint may take longer.

---

## What you get

| Mode | Details |
|------|---------|
| **News** | World, domestic, IT, and top stories (order as in-app). Yahoo! News keyword search. Articles use **canonical Yahoo URLs only**, full body text in-card, **no thumbnails**. |
| **Weather** | Spots: Aizu-Wakamatsu, Kikugawa, Niitsu, Azumino. Current conditions, today & tomorrow (with dates), ~3-hour steps from the hourly feed, and a **one-week** outlook. |

---

## Stack

- [Next.js](https://nextjs.org/) (App Router) · React · [Tailwind CSS](https://tailwindcss.com/)
- Fetch & parse: [axios](https://axios-http.com/) + [cheerio](https://cheerio.js.org/) — **server-side only**

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy on Vercel

Connect the repo and deploy; **no environment variables** required.

- **Root Directory**: leave default unless this app lives in a monorepo subfolder.

---

## Heads-up

Markup from **Yahoo! News** and **Weathernews** can change without notice; parsers may need updates.

Review each provider’s terms and crawler policy before you run this in production.

---

## License

Follow whatever license ships with the repository. News and weather content remain with their respective publishers.
