FROM oven/bun:alpine
WORKDIR /app

COPY package.json /app/package.json
COPY bun.lock /app/bun.lock

RUN bun install --production

COPY . /app

ENV NODE_ENV=production

USER bun
CMD ["bun", "start"]