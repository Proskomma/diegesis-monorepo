import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { CssBaseline } from "@mui/material";
import { ThemeProvider as UIKitThemeProvider, DiegesisUI } from '@eten-lab/ui-kit';
import "./App.css";
import AppContextProvider from "./contexts/AppContext";
import AppRoutes from "./routes/AppRoutes";
const { UIConfigContextProvider } = DiegesisUI.FlexibleDesign;


function App() {

    const client = new ApolloClient({
        uri: "/graphql",
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