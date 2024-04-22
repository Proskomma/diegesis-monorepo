import {gql} from "@apollo/client";

async function fetchEntry(client, org, transId, contentType, source) {
    const contentTypes = {
        USFM: "Usfm",
        USX: "Usx",
        succinct: "Succinct"
    };
    let mutationString;
    if (contentType === "succinct") {
        mutationString = `mutation Fetch {
                fetchSuccinct(
                  org: """%org%"""
                  entryOrg: """%source%"""
                  entryId: """%transId%"""
                )
        }`.replace('%org%', org)
            .replace('%transId%', transId)
            .replace('%source%', source)
            .replace('%contentType%', contentTypes[contentType]);

    }
     else {
        mutationString = `mutation Fetch {
                fetch%contentType%(
                  org: """%org%"""
                  entryId: """%transId%"""
                )
        }`.replace('%org%', org)
            .replace('%transId%', transId)
            .replace('%contentType%', contentTypes[contentType]);
    }
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
