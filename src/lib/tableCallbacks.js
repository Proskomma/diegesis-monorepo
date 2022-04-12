import {gql} from "@apollo/client";

async function fetchTranslation(client, org, transId, contentType) {
    const mutationString = `mutation Fetch {
                fetch%contentType%(
                  org: "%org%",
                  translationId: "%transId%"
                )
        }`.replace('%org%', org)
        .replace('%transId%', transId)
        .replace('%contentType%', contentType === "USFM" ? 'Usfm' : 'Usx');
    client.mutate({mutation: gql`${mutationString}`});
}

export { fetchTranslation };
