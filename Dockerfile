# Stage 1: Build it all
FROM node:current-alpine

ARG NODE_OPTIONS=--max_old_space_size=4096

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

# Install the server
WORKDIR /build/apps/diegesis-server
RUN npm install

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
ARG user_id=2590

COPY $server_loc/node_modules/ node_modules/
COPY $server_loc/src/ src/
COPY $server_loc/LICENSE .
COPY $server_loc/package.json .
# 'Folders that can be externally mapped'
COPY $server_loc/default_structure/ /app/default_structure/
RUN chown -R ${user_id}:${user_id} /app/default_structure
COPY $server_loc/resources/ /app/resources/
COPY $server_loc/ui_config/ /app/ui_config/
RUN chown -R ${user_id}:${user_id} /app/ui_config
COPY $server_loc/config/docker_config.json /app/config/config.json

# Create data dir
RUN mkdir /app/data && chown ${user_id}:${user_id} /app/data

EXPOSE 2468

# Run as user diegesis
RUN addgroup -g ${user_id} -S diegesis && adduser -u ${user_id} -S -G diegesis diegesis
USER diegesis

CMD [ "node", "src/index.js", "/app/config/config.json" ]