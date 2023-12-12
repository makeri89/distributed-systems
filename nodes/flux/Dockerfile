FROM oven/bun:latest AS base

WORKDIR /usr/src/app

COPY . .

RUN bun install

USER bun

ENTRYPOINT [ "bun", "run", "index.ts" ]