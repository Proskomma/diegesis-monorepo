# Stage 1: Build it all
FROM node:current-alpine

# Working inside build
WORKDIR /build

# Copy in separate app code
#   Server
ARG app=apps/diegesis-server
COPY $app/src/ $app/src/
COPY $app/utils/ $app/utils/
COPY $app/package.json $app/package.json

#   Upload client
ARG app=apps/diegesis-upload-client
COPY $app/public/ $app/public/
COPY $app/src/ $app/src/
COPY $app/package.json $app/package.json
COPY $app/yarn.lock $app/yarn.lock

#   User client
ARG app=apps/diegesis-user-client
COPY $app/public/ $app/public/
COPY $app/src/ $app/src/
COPY $app/package.json $app/package.json
COPY $app/config-overrides.js $app/config-overrides.js

# Copy in generic code
COPY libs/ libs/
COPY nx.json .
COPY package.json .
COPY package-lock.json .

# Install
RUN npm install

# Build upload client
WORKDIR /build/apps/diegesis-upload-client
RUN npm run build

# Build user client
WORKDIR /build/apps/diegesis-user-client
RUN npm run build

#Stage 2: actual server
FROM node:current-alpine

# Working from /app
WORKDIR /app

# Copy the just built client-code straight into the static folder
COPY --from=0 /build/apps/diegesis-user-client/build/ static_user/
COPY --from=0 /build/apps/diegesis-upload-client/build/ static_upload/
# Generic modules
COPY --from=0 /build/node_modules/ node_modules/

# Server part
WORKDIR /app/apps/diegesis-server
ARG server_loc=./apps/diegesis-server

COPY --from=0 /build/apps/diegesis-server/node_modules/ node_modules/
COPY $server_loc/src/ src/
COPY $server_loc/LICENSE .
COPY $server_loc/package.json .
COPY $server_loc/config/docker_config.json /app/config/config.json

# Create data dir
RUN mkdir /app/data && chown 2590:2590 /app/data

EXPOSE 2468

# Run as user diegesis
RUN addgroup -g 2590 -S diegesis && adduser -u 2590 -S -G diegesis diegesis
USER diegesis

CMD [ "node", "src/index.js", "/app/config/config.json" ]