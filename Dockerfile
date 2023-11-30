FROM node:18 AS builder
WORKDIR /usr/src/app
COPY package*.json ./

RUN apt-get update && apt-get install -y python
RUN npm install bcrypt@5.1.0

RUN npm install
RUN npm rebuild bcrypt
COPY . .
RUN npm run build

# Stage 2
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./

RUN apk add --no-cache python3 make g++
RUN npm install bcrypt@5.1.0

RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install -g npm@latest
RUN npm install
RUN npm rebuild bcrypt

COPY --from=builder /usr/src/app/dist ./dist

CMD ["npm", "run", "start"]