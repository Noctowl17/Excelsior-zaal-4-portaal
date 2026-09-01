FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Publieke Supabase-gegevens mogen in de image, want ze zijn client-side toch
# zichtbaar. Geef ze mee als build-arg zodat `next build` ze kan inbakken.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# De volledige node_modules en het scripts/-mapje erbij (overschrijft de kleinere
# standalone node_modules), zodat dezelfde image ook het iCal-syncscript kan
# draaien, bv. als TrueNAS cron-job:
#   docker run --rm -e SUPABASE_URL=... -e SUPABASE_SERVICE_ROLE_KEY=... \
#     -e ICAL_URL=... <image> node scripts/sync-ical.mjs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
