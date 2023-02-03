# diegesis-monorepo
Monorepo containing Diegesis server and clients.

## Overview

Diegesis server is a node express-based web server that can pull content from a number of open-access Bible archives,
and which makes them available in various formats via a GraphQL interface.

It can also serve static content, including multiple static websites. The monorepo includes several such clients, but others
may be added at any URL via the config file. It is also possible to set up client-side routing redirection for one-page app frameworks
such as React.

## Quick start

This assumes a fairly standard setup including the monorepo's public and admin React clients.

### Compile the clients

```
cd apps/diegesis-user-client
npm install
npm run build
cd ../diegesis-admin-client
npm install
npm run build
```

### Move to the server directory

```
cd ../diegesis-server
npm install
```
### Make your own config file

Start by copying `config/debug_config.json`. You may want to create a `local` directory for this. (That directory is gitignore'd.)
```
mkdir local
copy config/debug_config.json local/
```
#### Choose a server name
This is the identifier used for peer to peer transactions. Pick something short and meaningful in upper-case letters and digits.

#### Add a superuser

There is a command-line utility to do this. Note that it will currently store your plain text password in the bash log.
The password hash is portable so, for production, one solution is to make the hash locally and
then copy it into the production config file.
```
cd utils
node add_admin_user.js ../local/debug_config.json auser aGreatPassword admin archivist
```
You should then see a superuser record in your config file.

#### Add some clients

Diegesis will run with no clients, and/or with third party clients, but the standard setup requires the following in the config file:
```
  "staticPaths": [
    {
      "path": "../diegesis-admin-client/build",
      "url": "/admin"
    },
    {
      "path": "../diegesis-user-client/build",
      "url": "/",
      "redirectTarget": "../diegesis-user-client/build/index.html",
      "redirects": [
        "/who",
        "/how",
        "/list",
        "/blend",
        "/entry/*"
      ]
    }
  ],
```
This declares two clients, one at root and one at /admin, with React-style redirection for the client at root.

### Run the server
```
node src/index.js local/debug_config.json
```

If all goes well you should see the startup process in the console. If there's an issue (most likely with the config file) you should get
a meaningful error.

### Get some content

- Go to `/admin`, follow the login trail
- You can download content from four archives, which you select from the (slightly obscure) menu top left.
- Click on an entry, wait for the download icon to go grey, rinse and repeat

Note that a server cron will attempt to process new downloads using worker threads. You can configure the
number of cores to give to this.

### Visit the main site
Go to `/` and enjoy!
