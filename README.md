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

### Ensure Node Version

If you are MacOS or Linux and have NVM, in the repository root run:
```bash
nvm install 18
nvm use 18
```
It will get the node version from the repository `.nvmrc` file.

If you are Windows, get the node version from the `.nvmrc` file, e.g.:
```bash
nvm install 18.14.2
nvm use 18.14.2
```

If you don't use NVM, then ensure you have the node version in the `.nvmrc` file.

### MongoDB Pre-requisites

If you are using the MongoDB data layer (default is FS - file system), then install [MongoDB v5](https://www.mongodb.com/docs/v5.0/administration/install-community/) as a service.

We use **MongoDB v5** because that is what is available on Windows and MacOS GitHub build agents, see [Preinstalled software](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#preinstalled-software).

### Use the script

go into the folder `scripts` and launch `cleanInstall.sh`!
```bash
cd scripts/
./cleanInstall.sh
```

After that you can skip the "Compile the clients" part and go directly to the "Make your own config file" section.

### Compile the clients

First install the packages
```bash
cd diegesis-monorepo
npm install
```

then compile
```bash
cd apps/diegesis-user-client
npm run build
cd ../diegesis-admin-client
npm run build
cd ../diegesis-upload-client
npm run build
```

### Make your own config file

Start by copying `config/debug_config.json`. You may want to create a `local` directory for this. (That directory is gitignore'd.)
```bash
cd apps/diegesis-server
mkdir local
cp config/debug_config.json local/
```

#### Choose a server name
This is the identifier used for peer to peer transactions. Pick something short and meaningful in upper-case letters and digits.

#### Add a superuser

There is a command-line utility to do this. Note that it will currently store your plain text password in the bash log.
The password hash is portable so, for production, one solution is to make the hash locally and
then copy it into the production config file.
```bash
cd utils
node add_admin_user.js ../local/debug_config.json auser aGreatPassword admin archivist
```
You should then see a superuser record in your config file.

### Run the server
```bash
# In diegesis-server directory
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
