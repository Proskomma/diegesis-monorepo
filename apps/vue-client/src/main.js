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
  uri: 'https://diegesis.bible/graphql',
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
      localEntry(source: "eBible", id:"engBBE", revision: "2020-04-17")  {
          canonResource(type: "succinct") {
              content
          }
      }
  }`,
  result ({data, loading}) {
    if (!loading) {
      pk.loadSuccinctDocSet(JSON.parse(data.localEntry.canonResource.content));
      pkResult = pk.gqlQuerySync(`{ docSet (id:"eBible_engBBE_2020-04-17") {id document(bookCode:"TIT"){mainSequence {blocksText}}}}`);
      console.log(pkResult)
    }
  },
  error (error) {
    console.error(error)
  },
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
