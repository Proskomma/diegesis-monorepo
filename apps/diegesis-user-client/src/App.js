import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { CssBaseline } from "@mui/material";
import { ThemeProvider as UIKitThemeProvider, DiegesisUI } from '@eten-lab/ui-kit';
import "./App.css";
import Cookies from 'js-cookie';
import AppContextProvider from "./contexts/AppContext";
import AppRoutes from "./routes/AppRoutes";
const { UIConfigContextProvider } = DiegesisUI.FlexibleDesign;


function App() {

    const params = new URLSearchParams(window.location.search);
    let lang = params.get('lang') ?? '';
    let cookieLang = Cookies.get('lang');
    if(lang === '' && cookieLang) {
        window.location.href = window.location.href + '?lang=' + cookieLang;
    } else if(lang && !cookieLang) {
        Cookies.set('lang', lang);
    } else if(lang === '' && !cookieLang) {
        Cookies.set('lang', 'en');
        window.location.href = window.location.href + '?lang=' + 'en';
    } else if (lang && cookieLang) {
        if(lang !== cookieLang) {
            Cookies.set('lang', lang);
        }
    }

    const client = new ApolloClient({
        uri: "/graphql",
        cache: new InMemoryCache(),
    });

    return (
        <ApolloProvider client={client}>
            <UIKitThemeProvider>
                <UIConfigContextProvider>
                    <AppContextProvider language={lang}>
                        <CssBaseline />
                        <AppRoutes />
                    </AppContextProvider>
                </UIConfigContextProvider>
            </UIKitThemeProvider>
        </ApolloProvider>
    );
}

export default App;