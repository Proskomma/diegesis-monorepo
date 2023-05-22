import React, { useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { DiegesisUI } from '@eten-lab/ui-kit';
import { gql, useApolloClient } from '@apollo/client';
const { useUIConfigContext } = DiegesisUI.FlexibleDesign;

const AUTH_STORAGE_KEY = 'diegesis-auth'
const initialState = {
    appLang: 'en',
    authed: false,
    authLoaded: false,
    user: {},
    doLogout: () => { },
    mutateState: (newState) => { }
}
const AppContext = React.createContext(initialState);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be within AppContext');
    }
    return context;
}

const doLogout = () => {
    Cookies.remove(AUTH_STORAGE_KEY);
    window.location.href = '/';
}

const AppContextProvider = ({ children }) => {


    const [appState, setAppState] = useState(initialState);
    const { setRootUIConfig } = useUIConfigContext();
    const gqlClient = useApolloClient();

    useEffect(() => {
        const sessionCode = Cookies.get(AUTH_STORAGE_KEY);
        if (!sessionCode) {
            mutateState({ authLoaded: true });
        } else {
            const getFlexibleUIConfig = async () => {
                const getQuery = `
                query GetFlexibleUIConfig($compId: String!) {
                    getFlexibleUIConfig(id: $compId) {
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
                const result = await gqlClient.query({ query: gql`${getQuery}`, variables: { compId: 'root' } });
                const config = result.data?.getFlexibleUIConfig;
                setRootUIConfig(JSON.parse(JSON.stringify(config)));
            };
            fetch('http://localhost:1234/session-auth', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    session: sessionCode,
                })
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.authenticated) {
                        mutateState({ authed: true, authLoaded: true, user: { roles: data.roles } });
                        getFlexibleUIConfig();
                    } else {
                        mutateState({ authLoaded: true });
                    }
                })
                .catch((err) => {
                    mutateState({ authLoaded: true });
                    console.error(err.message);
                });
        };
    }, [gqlClient, setRootUIConfig]);

    const mutateState = (newState) => {
        setAppState((prevState) => {
            return ({ ...prevState, ...newState })
        })
    }

    const providerState = {
        ...appState,
        doLogout,
        mutateState
    }

    return (
        <AppContext.Provider value={providerState}>
            {children}
        </AppContext.Provider>
    )
}
export default AppContextProvider;