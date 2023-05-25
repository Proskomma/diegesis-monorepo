import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
    useRouteError,
} from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { CssBaseline } from "@mui/material";
import { ThemeProvider as UIKitThemeProvider, DiegesisUI } from '@eten-lab/ui-kit';
import "./App.css";
import MarkdownPage from "./pages/MarkdownPage";
import ListPage from "./pages/ListPage";
import EntryDetailsPage from "./pages/EntryDetailsPage";
import EntryBrowsePage from "./pages/EntryBrowsePage";
import EntrySearchPage from "./pages/EntrySearchPage";
import EntryDownloadPage from "./pages/EntryDownloadPage";
import UIConfigPage from "./pages/UIConfigPage";
import AppContextProvider, { useAppContext } from "./contexts/AppContext";
const { UIConfigContextProvider } = DiegesisUI.FlexibleDesign;

//#region child components
function ErrorBoundary() {
    let error = useRouteError();
    console.error(error);
    return (
        <div>
            An unexpected error has occurred: <i>{error.message}</i>
        </div>
    );
}
function AppRoutes() {
    const { clientStructure } = useAppContext();
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
                        element: <MarkdownPage url={url} />,
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
        ...markdownPageRoutes(clientStructure),
        {
            path: "/list",
            element: <ListPage />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/entry/details/:source/:entryId/:revision",
            element: <EntryDetailsPage />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/entry/browse/:source/:entryId/:revision",
            element: <EntryBrowsePage />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/entry/search/:source/:entryId/:revision",
            element: <EntrySearchPage />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/entry/download/:source/:entryId/:revision",
            element: <EntryDownloadPage />,
            errorElement: <ErrorBoundary />
        },
        {
            path: "/ui-config",
            element: <UIConfigPage />,
            errorElement: <ErrorBoundary />
        },
    ]);

    return <>
        <RouterProvider router={router} />
    </>
}
//#endregion


function App() {

    const client = new ApolloClient({
        uri: "http://localhost:1234/graphql",
        cache: new InMemoryCache(),
    });

    return (
        <ApolloProvider client={client}>
            <UIKitThemeProvider>
                <UIConfigContextProvider>
                    <AppContextProvider>
                        <CssBaseline />
                        <AppRoutes />
                    </AppContextProvider>
                </UIConfigContextProvider>
            </UIKitThemeProvider>
        </ApolloProvider>
    );
}

export default App;