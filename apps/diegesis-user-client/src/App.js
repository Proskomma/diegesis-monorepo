import React, { useState, useEffect } from "react";
import {
    createBrowserRouter,
    RouterProvider,
    useRouteError,
} from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { CssBaseline } from "@mui/material";
import { ThemeProvider as UIKitThemeProvider, DiegesisUI } from '@eten-lab/ui-kit';
import "./App.css";
import MarkdownPage from "./pages/MarkdownPage";
import WhoPage from "./pages/WhoPage";
import HowPage from "./pages/HowPage";
import ListPage from "./pages/ListPage";
import EntryDetailsPage from "./pages/EntryDetailsPage";
import EntryBrowsePage from "./pages/EntryBrowsePage";
import EntrySearchPage from "./pages/EntrySearchPage";
import EntryDownloadPage from "./pages/EntryDownloadPage";
import UIConfigPage from "./pages/UIConfigPage";
import AppContextProvider from "./contexts/AppContext";
import { AppLangProvider } from "./contexts/AppLangContext";
import { AppLangResourcesProvider } from "./contexts/AppLangResourcesContext";
const { UIConfigContextProvider, useUIConfigContext } = DiegesisUI.FlexibleDesign;

function ErrorBoundary() {
    let error = useRouteError();
    console.error(error);
    return (
        <div>
            An unexpected error has occurred: <i>{error.message}</i>
        </div>
    );
}

function PopulateUIConfig({ uiConfig, children }) {
    const { setRootUIConfig } = useUIConfigContext();
    useEffect(() => {
        if (uiConfig) {
            setRootUIConfig(JSON.parse(JSON.stringify(uiConfig)));
        }
    }, [uiConfig, setRootUIConfig]);
    return <>{children}</>
}

function App() {

    const client = new ApolloClient({
        uri: "http://localhost:1234/graphql",
        cache: new InMemoryCache(),
    });

    const [appLanguage, setAppLanguage] = useState("en");
    const [appLanguageResources, setAppLanguageResources] = useState({});
    const [uiConfig, setUIConfig] = useState(null);

    useEffect(() => {
        const getFlexibleUIConfig = async () => {
            const getQuery = `
            query GetFlexibleUIConfig($compId: String!, $langCode: String!) {
                getFlexibleUIConfig(id: $compId, langCode: $langCode) {
                  id
                  componentName
                  flexibles
                  contents
                  configPath
                  uiConfigs
                  markdowns
                  styles
                }
              }`
            const result = await client.query({ query: gql`${getQuery}`, variables: { compId: 'root', langCode: appLanguage } });
            const config = result.data?.getFlexibleUIConfig;
            setUIConfig(config);
        }
        getFlexibleUIConfig();
    }, []);

    useEffect(
        () => {
            const doQuery = async () => {
                const queryString = `{
                  clientStructure {
                    languages
                    urls
                    urlData(language:"%lang%") {
                       url
                       menuText
                    }
                    footer(language:"%lang%") {
                      body
                    }
                  }
                  }`.replace(/%lang%/g, appLanguage);
                const result = await client.query({ query: gql`${queryString}` });
                const clientStructure = result.data.clientStructure;
                setAppLanguageResources(clientStructure);
            };
            doQuery();
        },
        [appLanguage]
    );

    const markdownPageRoutes = (structure) => {
        let ret = [];
        if (structure.urls) {
            for (const url of structure.urls) {
                if (url === 'list') {
                    continue;
                }
                ret.push(
                    {
                        path: (url === 'home' ? '/' : `${url}`),
                        element: <MarkdownPage setAppLanguage={setAppLanguage} url={url} />,
                        errorElement: <ErrorBoundary />
                    }
                );
            }
        }
        return ret;
    }

    const router = createBrowserRouter([
        {
            path: '/',
            element: <MarkdownPage url={'home'} />,
        }, // added default route because GraphQL response can be delay.
        ...markdownPageRoutes(appLanguageResources),
        {
            path: "/list",
            element: <ListPage />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/entry/details/:source/:entryId/:revision",
            element: <EntryDetailsPage setAppLanguage={setAppLanguage} />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/entry/browse/:source/:entryId/:revision",
            element: <EntryBrowsePage setAppLanguage={setAppLanguage} />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/entry/search/:source/:entryId/:revision",
            element: <EntrySearchPage setAppLanguage={setAppLanguage} />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/entry/download/:source/:entryId/:revision",
            element: <EntryDownloadPage setAppLanguage={setAppLanguage} />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/ui-config",
            element: <UIConfigPage setAppLanguage={setAppLanguage} />,
            errorElement: <ErrorBoundary />
        },
    ]);

    return (
        <ApolloProvider client={client}>
            <UIKitThemeProvider>
                <UIConfigContextProvider>
                    <AppContextProvider>
                        <AppLangResourcesProvider value={appLanguageResources}>
                            <AppLangProvider value={appLanguage}>
                                <CssBaseline />
                                <PopulateUIConfig uiConfig={uiConfig}>
                                    <RouterProvider router={router} />
                                </PopulateUIConfig>
                            </AppLangProvider>
                        </AppLangResourcesProvider>
                    </AppContextProvider>
                </UIConfigContextProvider>
            </UIKitThemeProvider>
        </ApolloProvider>
    );
}

export default App;