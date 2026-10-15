FROM node:26.7.0-alpine

WORKDIR /app

COPY package-lock.json package.json ./

RUN npm ci --omit=dev

COPY . .

RUN export NODE_EXTRA_CA_CERTS=/app/zscaler-root-ca.crt npx prisma generate

EXPOSE 6513

USER node

CMD ["node", "index.js"]	 