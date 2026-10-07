FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        g++ \
        openjdk-17-jdk \
        python3 \
        python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .

USER node

EXPOSE 5000

CMD ["npm", "start"]
