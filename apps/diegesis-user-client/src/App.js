import React, { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
} from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import "./App.css";
import HomePage from "./pages/HomePage";
import WhoPage from "./pages/WhoPage";
import HowPage from "./pages/HowPage";
import ListPage from "./pages/ListPage";
import BlendPage from "./pages/BlendPage";
import EntryDetailsPage from "./pages/EntryDetailsPage";
import EntryBrowsePage from "./pages/EntryBrowsePage";
import EntrySearchPage from "./pages/EntrySearchPage";
import EntryDownloadPage from "./pages/EntryDownloadPage";
import { AppLangProvider } from "./contexts/AppLangContext";

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
            path: "/blend",
            element: <BlendPage setAppLanguage={setAppLanguage} />,
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
        <AppLangProvider value={appLanguage}>
          <CssBaseline />
          <RouterProvider router={router} />
        </AppLangProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
