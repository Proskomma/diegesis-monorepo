import {gql} from "@apollo/client";

async function fetchEntry(client, org, transId, contentType) {
    const mutationString = `mutation Fetch {
                fetch%contentType%(
                  org: """%org%""",
                  entryId: """%transId%"""
                )
        }`.replace('%org%', org)
        .replace('%transId%', transId)
        .replace('%contentType%', contentType === "USFM" ? 'Usfm' : 'Usx');
    client.mutate({mutation: gql`${mutationString}`});
}

async function deleteEntry(client, org, transId, revision) {
    const mutationString = `mutation DeleteLocalEntry {
    deleteLocalEntry(
      org: """%org%""",
      id: """%transId%"""
      revision: """%revision%"""
    )
}`.replace('%org%', org)
        .replace('%transId%', transId)
        .replace('%revision%', revision);
    client.mutate({mutation: gql`${mutationString}`});
}

export {fetchEntry, deleteEntry};
