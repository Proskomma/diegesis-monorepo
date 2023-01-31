import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
} from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import "./App.css";
import ListPage from "./pages/ListPage";
import AppLangContext, { AppLangProvider } from "./contexts/AppLangContext";
import EntryDetailsPage from "./pages/EntryDetailsPage";
import EntryBrowsePage from "./pages/EntryBrowsePage";
import EntryDownloadPage from "./pages/EntryDownloadPage";
import i18n from "./i18n";
import UploadPage from "./pages/UploadPage";
import TestFile from "./pages/TestFile";

function App() {
  const [authed, setAuthed] = useState(true);
  const appLang = useContext(AppLangContext)

  useEffect(() => {
    const sessionCode = Cookies.get("diegesis-auth");

    if (!sessionCode) {
      setAuthed(false);
    } else {
      fetch("/session-auth", {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          session: sessionCode,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.authenticated || !data.roles.includes("archivist")) {
            setAuthed(false);
          }
        })
        .catch((err) => {
          setAuthed(false);
          console.log(err.message);
        });
    }
  }, []);
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
        {i18n(appLang,"unexpected_error")}<i>{error.message}</i>
      </div>
    );
  }

  const [appLanguage, setAppLanguage] = useState("en");
  const router = createBrowserRouter([
    {
      path: "/uploads",
      element: <ListPage setAppLanguage={setAppLanguage} />,
      errorElement: <ErrorBoundary />,
    },
    {
      path: "/uploads/add",
      element: <UploadPage setAppLanguage={setAppLanguage} />,
      errorElement: <ErrorBoundary />,
    }
  ]);
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AppLangProvider value={appLanguage}>
          <CssBaseline />
          {!authed && (
            <div>
              You need to authenticate to view this page. Please click{" "}
              <a href="/login?redirect=/uploads">here</a> to log in
            </div>
          )}
          {authed && <RouterProvider router={router} />}
        </AppLangProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
