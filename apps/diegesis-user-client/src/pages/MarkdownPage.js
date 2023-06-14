import React from 'react';
import { gql, useQuery } from "@apollo/client";
import ReactMarkdown from 'react-markdown';
import { MuiMaterial } from '@eten-lab/ui-kit';

import { directionText } from "../i18n/languageDirection";
import Spinner from "../components/Spinner";
import GqlError from "../components/GqlError";
import PageLayout from '../components/PageLayout';
import { useAppContext } from '../contexts/AppContext';
const { Container } = MuiMaterial;

export default function MarkdownPage({ url }) {
    const { appLang } = useAppContext();
    const queryString = `{
                  clientStructure {
                    page(language:"%lang%" url: "%url%") {
                      body
                    }
                  }
                  }`
        .replace(/%lang%/g, appLang)
        .replace(/%url%/g, url);

    const { loading, error, data } = useQuery(
        gql`
      ${queryString}
    `
    );

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <GqlError error={error} />;
    }

    return (
        <PageLayout>
            <Container dir={directionText(appLang)} style={{ marginTop: "50px", marginBottom: "50px" }}>
                <ReactMarkdown>{(data?.clientStructure?.page?.body) || "???"}</ReactMarkdown>
            </Container>
        </PageLayout>
    );
}