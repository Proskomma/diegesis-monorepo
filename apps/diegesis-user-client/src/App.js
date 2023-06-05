import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { CssBaseline } from "@mui/material";
import { DiegesisUI } from '@eten-lab/ui-kit';
import "./App.css";
import AppContextProvider from "./contexts/AppContext";
import AppRoutes from "./routes/AppRoutes";
import DiegesisThemeProvider from "./theme/ThemeProvider";
const { UIConfigContextProvider } = DiegesisUI.FlexibleDesign;


function App() {

    const client = new ApolloClient({
        uri: "/graphql",
        cache: new InMemoryCache(),
    });

    return (
        <ApolloProvider client={client}>
            <DiegesisThemeProvider>
                <UIConfigContextProvider>
                    <AppContextProvider>
                        <CssBaseline />
                        <AppRoutes />
                    </AppContextProvider>
                </UIConfigContextProvider>
            </DiegesisThemeProvider>
        </ApolloProvider>
    );
}

export default App;