import { createApp, h } from 'vue'
import App from './App.vue'
import router from './router'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { createApolloProvider } from '@vue/apollo-option'
import gql from 'graphql-tag'
import { Proskomma } from 'proskomma-core'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:1234/graphql',
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

const pk = new Proskomma([
  {
    name: "source",
    type: "string",
    regex: "^[^\\s]+$",
  },
  {
    name: "project",
    type: "string",
    regex: "^[^\\s]+$",
  },
  {
    name: "revision",
    type: "string",
    regex: "^[^\\s]+$",
  },
]);

let pkResult = undefined

const apolloResult = apolloClient.query({
  query: gql`{
      localEntry(source: "eBible", id:"fra_fob", revision: "2023-04-22")  {
          canonResource(type: "succinct") {
              content
          }
      }
  }`
})

apolloResult
  .then(({data}) => {
    pk.loadSuccinctDocSet(JSON.parse(data.localEntry.canonResource.content));
    pkResult = pk.gqlQuerySync(`{ docSet (id:"eBible_fra_fob_2023-04-22") {id document(bookCode:"TIT"){mainSequence {blocksText}}}}`);
    console.log(pkResult)
  })
  .catch(error => {
    console.error(error)
  })

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
})

const app = createApp({
  render: () => h(App),
})

app.use(apolloProvider)
app.use(router)

app.mount('#app')
