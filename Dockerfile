# base node image
FROM node:20-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update
RUN apt-get install -y openssl

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /achievers_app

ADD package.json package-lock.json .npmrc ./
RUN npm install --production=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /achievers_app

COPY --from=deps /achievers_app/node_modules /achievers_app/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --production

# Build the app
FROM base as build

WORKDIR /achievers_app

COPY --from=deps /achievers_app/node_modules /achievers_app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /achievers_app

COPY --from=production-deps /achievers_app/node_modules /achievers_app/node_modules
COPY --from=build /achievers_app/node_modules/.prisma /achievers_app/node_modules/.prisma

COPY --from=build /achievers_app/build /achievers_app/build
COPY --from=build /achievers_app/public /achievers_app/public
COPY --from=build /achievers_app/server.mjs /achievers_app/server.mjs
COPY --from=build /achievers_app/package.json /achievers_app/package.json
COPY --from=build /achievers_app/prisma /achievers_app/prisma
COPY --from=build /achievers_app/background-jobs /achievers_app/background-jobs

CMD ["npm", "start"]
