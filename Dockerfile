FROM node:22-bookworm-slim
# gcc is needed for the online C compiler.
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server.js unbuf.h tc_compat.h ./
COPY public ./public
COPY data ./data
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
