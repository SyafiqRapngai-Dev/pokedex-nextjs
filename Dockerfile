# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# TODO: Copy only the files needed to install dependencies
# Hint: you don't need to copy ALL files yet — just what npm needs
COPY package*.json ./

# TODO: Install dependencies
# Hint: look at your package.json scripts — what command installs packages?
RUN npm ci

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# TODO: Copy the installed node_modules from the 'deps' stage
# Hint: use COPY --from=deps
COPY --from=deps /app/node_modules ./node_modules

# TODO: Copy the rest of your source code
COPY . .

# TODO: Run the Next.js build command
RUN npm run build

# ---- Stage 3: Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# TODO: Copy only what's needed to RUN the app from the 'builder' stage
# Hint: Next.js builds output to .next/ — you'll need that, plus public/, package.json
COPY --from=builder /app/.next/ ./.next/
COPY --from=builder /app/public/ ./public/
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules/

# TODO: Expose the port Next.js runs on (default: 3000)
EXPOSE 3000

# TODO: Set the command to start the app
CMD ["npm", "start"]