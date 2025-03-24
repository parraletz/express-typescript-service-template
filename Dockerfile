FROM node:22-bookworm AS base

WORKDIR /app


FROM base AS development

RUN corepack enable && corepack prepare pnpm@10 --activate


COPY . .

RUN pnpm install --frozen-lockfile



FROM base AS builder
ENV CI=true

RUN corepack enable && corepack prepare pnpm@10 --activate


COPY package.json pnpm-lock.yaml tsconfig.json .swcrc ./

RUN pnpm install --frozen-lockfile

COPY . .


RUN pnpm build

FROM node:22-bookworm AS production

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"] 