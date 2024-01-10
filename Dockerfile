FROM alpine:latest as builder

RUN apk add --update nodejs
RUN apk add --update npm

WORKDIR /front
COPY ./front /front
RUN npm install
RUN npm run build

WORKDIR /backend
COPY ./backend /backend
RUN npm install
RUN npm run build

# ---------------------------------- RUNNER ---------------------------------- #

FROM alpine:latest as runner
RUN apk add --update nodejs
RUN apk add --update npm

ENV NODE_ENV=production

COPY --from=builder /front/dist /front/dist

COPY --from=builder /backend/dist /backend/dist
COPY --from=builder /backend/package.json /backend/package.json
COPY --from=builder /backend/package-lock.json /backend/package-lock.json


WORKDIR /backend
RUN npm install

RUN pwd
RUN ls -l


EXPOSE 3000
CMD ["node", "dist/entry.js"]