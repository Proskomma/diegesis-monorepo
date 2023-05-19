import React, { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { DiegesisUI } from '@eten-lab/ui-kit';
import { gql, useApolloClient } from '@apollo/client';
const { useUIConfigContext } = DiegesisUI.FlexibleDesign;

const AppContext = React.createContext({ authed: true });

const AppContextProvider = ({ children }) => {
    const [appState, setAppState] = useState({ authed: true });
    const { setRootUIConfig } = useUIConfigContext();
    const gqlClient = useApolloClient();

    useEffect(() => {
        const sessionCode = Cookies.get('diegesis-auth');
        if (!sessionCode) {
            mutateState({ authed: false });
        } else {
            fetch('/session-auth', {
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
                    if (!data.authenticated || !data.roles.includes('admin')) {
                        mutateState({ authed: false });
                    } else {
                        getFlexibleUIConfig();
                    }
                })
                .catch((err) => {
                    mutateState({ authed: false });
                    console.log(err.message);
                });
        };
    }, []);

    const getFlexibleUIConfig = useCallback(async () => {
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
    }, [gqlClient, setRootUIConfig]);


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
