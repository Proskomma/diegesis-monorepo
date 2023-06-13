<template>
  <main>
    <h1>Demo page</h1>
    <p>{{ bibleText }}</p>
  </main>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import gql from 'graphql-tag'

let bibleText = ref('Loading text…')

let pk = inject('ProskommaCore')
let apolloClient = inject('DefaultApolloClient')

onMounted(async () => {
  try {
    const apolloResult = await apolloClient.query({
      query: gql`{
        localEntry(source: "eBible", id:"fra_fob", revision: "2023-04-22")  {
          canonResource(type: "succinct") {
            content
          }
        }
      }`
    })

    pk.loadSuccinctDocSet(JSON.parse(apolloResult.data.localEntry.canonResource.content));
    let pkResult = pk.gqlQuerySync(`{ docSet (id:"eBible_fra_fob_2023-04-22") {id document(bookCode:"PHM"){mainSequence {blocksText}}}}`);
    bibleText.value = pkResult.data.docSet.document.mainSequence.blocksText.join("\n")

  } catch (error) {
    console.error(error)
  }
})

</script>
