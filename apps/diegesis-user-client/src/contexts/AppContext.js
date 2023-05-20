import React, { useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { DiegesisUI } from '@eten-lab/ui-kit';
import { gql, useApolloClient } from '@apollo/client';
const { useUIConfigContext } = DiegesisUI.FlexibleDesign;

const initialState = {
    authed: false,
    authLoaded: false,
    user: {}
}
const AppContext = React.createContext(initialState);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be within AppContext');
    }
    return context;
}

const AppContextProvider = ({ children }) => {
    const [appState, setAppState] = useState(initialState);
    const { setRootUIConfig } = useUIConfigContext();
    const gqlClient = useApolloClient();

    useEffect(() => {
        const sessionCode = Cookies.get('diegesis-auth');
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
                    }
                })
                .catch((err) => {
                    mutateState({ authLoaded: true });
                    console.error(err.message);
                });
        };
    }, []);

    const mutateState = (newState) => {
        setAppState((prevState) => {
            return ({ ...prevState, ...newState })
        })
    }

    return (
        <AppContext.Provider value={appState}>
            {children}
        </AppContext.Provider>
    )
}
export default AppContextProvider;
