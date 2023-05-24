import React, { useContext, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { DiegesisUI } from '@eten-lab/ui-kit';
import { gql, useApolloClient } from '@apollo/client';
const { useUIConfigContext } = DiegesisUI.FlexibleDesign;

const StorageKeys = Object.freeze({
    AUTH: 'diegesis-auth',
    CONFIG: 'app-config',
});

const initialState = {
    appLang: 'en',
    authed: false,
    authLoaded: false,
    user: {},
    doLogout: () => { },
    mutateState: (newState) => { },
    setStoreConfig: (config) => { },
    getStoredConfig: () => { }
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
    Cookies.remove(StorageKeys.AUTH);
    window.location.href = '/';
}

const getStoredConfig = () => {
    const storedJsonString = localStorage.getItem(StorageKeys.CONFIG)
    let appConfig;
    if (storedJsonString) appConfig = JSON.parse(storedJsonString);
    return appConfig;
}
const setStoreConfig = (config) => {
    const newConfig = getStoredConfig() || {};
    Object.assign(newConfig, config);
    localStorage.setItem(StorageKeys.CONFIG, JSON.stringify(newConfig));
}

const AppContextProvider = ({ children }) => {


    const [appState, setAppState] = useState(initialState);
    const { setRootUIConfig } = useUIConfigContext();
    const gqlClient = useApolloClient();

    useEffect(() => {
        let config = getStoredConfig();
        if (!config) {
            setStoreConfig({ langCode: 'en' })
            config = getStoredConfig();
        };
        mutateState({ appLang: config.langCode });
        const sessionCode = Cookies.get(StorageKeys.AUTH);
        if (!sessionCode) {
            mutateState({ authLoaded: true });
        } else {
            const getFlexibleUIConfig = async () => {
                const getQuery = `
                query GetFlexibleUIConfig($compId: String!, $langCode: String!) {
                    getFlexibleUIConfig(id: $compId, langCode: $langCode) {
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
                const result = await gqlClient.query({ query: gql`${getQuery}`, variables: { compId: 'root', langCode: config.langCode } });
                const uiConfig = result.data?.getFlexibleUIConfig;
                setRootUIConfig(JSON.parse(JSON.stringify(uiConfig)));
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mutateState = (newState) => {
        setAppState((prevState) => {
            return ({ ...prevState, ...newState })
        })
    }

    const providerState = useMemo(() => {
        return {
            ...appState,
            doLogout,
            mutateState,
            setStoreConfig,
            getStoredConfig
        }
    }, [appState])

    return (
        <AppContext.Provider value={providerState}>
            {children}
        </AppContext.Provider>
    )
}
export default AppContextProvider;