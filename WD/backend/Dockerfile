FROM oven/bun:1-alpine
WORKDIR /app
COPY package*.json bun.lockb* ./
RUN bun install --production
COPY . .
EXPOSE 3010
CMD ["bun", "run", "src/index.ts"]