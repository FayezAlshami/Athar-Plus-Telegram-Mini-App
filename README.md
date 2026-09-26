# Athar Plus — Telegram Mini App (Next.js)

Customer-facing Telegram Mini App for Athar Plus. Talks to the Laravel API
(`Athar-Plus-Telegram-backend`) over `/api/v1`.

**Stack:** Next.js 16 (App Router) · React 19 · strict TypeScript · Tailwind CSS 4 ·
Motion · TanStack Query · React Hook Form + Zod · next-intl · Phosphor Icons · vaul · sonner

## Structure

```
src/
  app/                 Routes only (thin pages → feature screens); (app)/template.tsx = page transition
  components/
    ui/                Design-system primitives (Button, Card, Field, BottomSheet, SegmentedControl…)
    shared/            Cross-feature pieces (Money/Price, StructuredText, SuccessMoment, Butterfly…)
    layout/            AppShell, AuthGate, BottomNav, PageHeader, PageContainer
  features/<feature>/  Screens, feature components and TanStack Query hooks
    deposits/payment-methods/  One module per payment method + registry (no switch statements)
  entities/            API data types (mirrors backend resources)
  lib/
    api/               Single API client, endpoints, query keys, error normalization, idempotency
    telegram/          TelegramAdapter interface, Real/Mock adapters, provider, hooks, deep links
    animation/         Motion tokens (durations, easings, springs, stagger) and variants
    i18n/              Locale config, next-intl request config, ar/en messages
    formatting/        Money/date formatting
    analytics/         Event names + `track()` seam (no vendor integrated)
  providers/           Theme (animated reveal), Query, composition root
  styles/              Design tokens (light/dark) and Tailwind theme mapping
```

### Principles
- **No business logic in the client.** Prices, discounts, balances and order
  totals come from the server. The client only formats them.
- **Telegram auth:** the raw `initData` is sent to `POST /auth/telegram`;
  `initDataUnsafe` is used for display only.
- **Idempotency:** purchases and deposits send an `Idempotency-Key` generated per
  user intent, so double taps/retries never charge twice.
- **Arabic-first:** RTL by default, logical CSS properties, `dir="auto"` for
  user/admin content, word-level (never per-letter) Arabic text animation.
- **Descriptions** are rendered from server-parsed blocks (`StructuredText`),
  preserving paragraphs, line breaks and lists.
- **Theme:** tokens in `styles/tokens.css`; the switch uses a View Transitions
  circular reveal with a crossfade fallback and respects reduced motion.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

### Browser development without Telegram
Set `NEXT_PUBLIC_TELEGRAM_MOCK=true` here **and** run the backend with
`APP_ENV=local` + `TELEGRAM_DEV_AUTH_ENABLED=true`. The `MockTelegramAdapter`
signs in a fixed development user. Test deep links with `?startapp=product_1`.
Without the flag, outside Telegram the app shows an "Open in Telegram" screen.

### Deep links
`startapp=product_<id|slug>` · `category_<slug>` · `campaign_<slug>` · `membership` · `wallet`

## Quality

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment
| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Laravel base URL (without `/api/v1`) |
| `NEXT_PUBLIC_APP_URL` | Public URL of this app |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Used for "open in Telegram" and support links |
| `NEXT_PUBLIC_TELEGRAM_MOCK` | `true` only for local browser development |

## Pending specification
Cash Cash and USDT deposit workflows. Methods are listed from the API and show
a "being prepared" state until the backend marks them `available`; each has its
own module in `features/deposits/payment-methods/`.
