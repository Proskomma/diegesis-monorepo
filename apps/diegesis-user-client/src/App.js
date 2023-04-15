import React, { useState, useEffect } from "react";
import {
    createBrowserRouter,
    RouterProvider,
    useRouteError,
} from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { createTheme, CssBaseline } from "@mui/material";
import "./App.css";
import MarkdownPage from "./pages/MarkdownPage";
import HomePage from "./pages/HomePage";
import WhoPage from "./pages/WhoPage";
import HowPage from "./pages/HowPage";
import EntryDetailPage from "./pages/EntryDetailsPage";
import EntryBrowsePage from "./pages/EntryBrowsePage";
import EntrySearchPage from "./pages/EntrySearchPage";
import EntryDownloadPage from "./pages/EntryDownloadPage";
import OldEntryBrowsePage from "./pages/old/EntryBrowsePage";
import OldEntryDetailsPage from "./pages/old/EntryDetailsPage";
import OldListPage from "./pages/old/ListPage";
import ListPage from "./pages/ListPage";
import { AppLangProvider } from "./contexts/AppLangContext";
import { AppLangResourcesProvider } from "./contexts/AppLangResourcesContext";
import { ThemeProvider as UIKitThemeProvider } from '@eten-lab/ui-kit';
import AppConfig from "./config";

function App() {
    // const theme = createTheme({});

    const client = new ApolloClient({
        uri: AppConfig.GRAPHQL_BASE_URL,
        cache: new InMemoryCache(),
    });

    function ErrorBoundary() {
        let error = useRouteError();
        console.error(error);
        return (
            <div>
                An unexpected error has occurred: <i>{error.message}</i>
            </div>
        );
    }

    const [appLanguage, setAppLanguage] = useState("en");
    const [appLanguageResources, setAppLanguageResources] = useState({});

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
        ...markdownPageRoutes(appLanguageResources),
        {
            path: "/list",
            element: <OldListPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/entry/details/:source/:entryId/:revision",
            element: <OldEntryDetailsPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/entry/browse/:source/:entryId/:revision",
            element: <OldEntryBrowsePage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/entry/search/:source/:entryId/:revision",
            element: <EntrySearchPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/entry/download/:source/:entryId/:revision",
            element: <EntryDownloadPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/v2/home",
            element: <HomePage />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/v2/list",
            element: <ListPage setAppLanguage={setAppLanguage} />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/v2/entry/details/:source/:entryId/:revision",
            element: <EntryDetailPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/v2/entry/browse/:source/:entryId/:revision",
            element: <EntryBrowsePage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
    ]);

    return (
        <ApolloProvider client={client}>
            <UIKitThemeProvider>
                <AppLangResourcesProvider value={appLanguageResources}>
                    <AppLangProvider value={appLanguage}>
                        <CssBaseline />
                        <RouterProvider router={router} />
                    </AppLangProvider>
                </AppLangResourcesProvider>
            </UIKitThemeProvider>
        </ApolloProvider>
    );
}

export default App;
