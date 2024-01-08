FROM node:20-alpine3.19 as builder

WORKDIR /front
COPY ./front /front
RUN npm install
RUN npm run build

WORKDIR /backend
COPY ./backend /backend
RUN npm install
RUN npm run build

FROM node:20-alpine3.19 as runner
ENV NODE_ENV=production

COPY --from=builder /front/dist /front/dist
COPY --from=builder /backend /backend

WORKDIR /backend/dist
RUN npm install


EXPOSE 3000
CMD ["entry.js"]