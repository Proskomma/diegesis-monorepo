# diegesis-server
An Apollo-based server that caches Scripture from remote sources and serves them via a unified GraphQL interface.

## Installation
### Locally
```
npm install
node src/index.js // OR
node src/index.js example_config.json
```

### Using Docker
#### Building
```
docker build -t proskomma/diegesis-server .
```
*Don't forget the final dot*

#### Running
```
docker run --rm -d -p 3060:2468 --name=diegesis-server proskomma/diegesis-server
```

* `--rm` removes container after use
* `-d` runs as daemon
* `-p 2468:2468` exposes container port 2468 on local port 3060

#### Stopping
```
docker stop diegesis-server
```

#### Monitoring
Overview
```
docker ps
```

Resource usage
```
docker stats
```

## Some GraphQL to try
```
{orgs { name } }

{org(name:"eBible") { nTranslations } }

{
  org(name: "eBible") {
    name
    nTranslations
    translation(id:"fraLSG") {
      id
      languageCode
      languageName
      title
      description
      copyright
      nUsfmBooks
      hasUsfm
      usfmForBookCode(code:"MAT")
     }
  }
}

# translations(withUsfm: true)
# translations(withUsx: true)
# translations(withLanguageCode: "fra" withUsfm: false)
# translations(withId: ["aak", "fraLSG"])
# translations(withLanguageCode: ["fra", "deu"])
# translations(withMatchingMetadata: "King")
# translations(sortedBy: "id")
# translations(sortedBy: "languageCode" reverse: true)

mutation Mutation {
  fetchUsfm(org: "eBible", translationId: "fraLSG") # or fetchUsx for DBL
}

# Then try org query again to see USFM

```

## Configuration
- See `example_config.json`

## Writing a new org handler
New org handlers go in `orgHandlers`

Look at the `eBible` example. Your org handler directory should include
- JSON called `org.json` containing a unique `name` and `translationDir`.
- a module called `translations.js` that returns `getTranslationsCatalog` and `fetchUsfm`

The catalog representation produced by `getTranslationsCatalog` is currently very simple, to make adoption by multiple organizations as painless as posssible. The required fields are
- id
- languageCode
- languageName
- title
- description
- copyright
