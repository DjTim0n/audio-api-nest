FROM node:22.13.1

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/main"]

