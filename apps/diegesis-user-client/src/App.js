import React, {useState, useEffect} from "react";
import {
    createBrowserRouter,
    RouterProvider,
    useRouteError,
} from "react-router-dom";
import {ApolloProvider, ApolloClient, InMemoryCache, gql} from "@apollo/client";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import "./App.css";
import HomePage from "./pages/HomePage";
import WhoPage from "./pages/WhoPage";
import HowPage from "./pages/HowPage";
import ListPage from "./pages/ListPage";
import EntryDetailsPage from "./pages/EntryDetailsPage";
import EntryBrowsePage from "./pages/EntryBrowsePage";
import EntrySearchPage from "./pages/EntrySearchPage";
import EntryDownloadPage from "./pages/EntryDownloadPage";
import {AppLangProvider} from "./contexts/AppLangContext";
import {AppLangResourcesProvider} from "./contexts/AppLangResourcesContext";

function App() {
    const theme = createTheme({});

    const client = new ApolloClient({
        uri: "/graphql",
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
    footer(language:"%lang%") {
      body
    }
  }
  }`.replace('%lang%', appLanguage);
                const result = await client.query({query: gql`${queryString}`});
                const clientStructure = result.data.clientStructure;
                // console.log(clientStructure);
                setAppLanguageResources(clientStructure);
            };
            doQuery();
        },
        [appLanguage]
    );

    const router = createBrowserRouter([
        {
            path: "/",
            element: <HomePage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/who",
            element: <WhoPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/how",
            element: <HowPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/list",
            element: <ListPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/entry/details/:source/:entryId/:revision",
            element: <EntryDetailsPage setAppLanguage={setAppLanguage}/>,
            errorElement: <ErrorBoundary/>
        },
        {
            path: "/entry/browse/:source/:entryId/:revision",
            element: <EntryBrowsePage setAppLanguage={setAppLanguage}/>,
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
        }
    ]);
    return (
        <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
                <AppLangResourcesProvider value={appLanguageResources}>
                    <AppLangProvider value={appLanguage}>
                        <CssBaseline/>
                        <RouterProvider router={router}/>
                    </AppLangProvider>
                </AppLangResourcesProvider>
            </ThemeProvider>
        </ApolloProvider>
    );
}

export default App;
