import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { MuiMaterial } from '@eten-lab/ui-kit';

import { directionText } from "../i18n/languageDirection";
import PageLayout from '../components/PageLayout';
import { useAppContext } from '../contexts/AppContext';
const { Container } = MuiMaterial;

export default function MarkdownPage({ url }) {
    const { appLang, clientStructure } = useAppContext();

    return (
        <PageLayout>
            <Container dir={directionText(appLang)} style={{ marginTop: "50px", marginBottom: "50px" }}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{(clientStructure?.page?.body) || "???"}</ReactMarkdown>
            </Container>
        </PageLayout>
    );
}