# Testing MongoDB

To run all integration tests, , in the `apps/diegesis-server` folder run:
```bash
npm run integration
```

To test an individual file, in the `apps/diegesis-server` folder run:
```bash
npx jest src/lib/dataLayers/mongo.integration.js --testPathIgnorePatterns=/node_modules/ --testMatch **/*.integration.js
```
