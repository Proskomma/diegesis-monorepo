/* eslint-disable react-hooks/exhaustive-deps */
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
    clientStructure: {},
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

const AppContextProvider = ({ children, language }) => {

    const [appState, setAppState] = useState({ ...initialState, appLang: language });
    const { setRootUIConfig } = useUIConfigContext();
    const gqlClient = useApolloClient();

    useEffect(() => {
        let config = getStoredConfig();
        if (!config) {
            setStoreConfig({ langCode: language })
            config = getStoredConfig();
        };
        mutateState({ appLang: language });
        const sessionCode = Cookies.get(StorageKeys.AUTH);
        if (!sessionCode) {
            mutateState({ authLoaded: true });
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
                    if (data.authenticated) {
                        mutateState({ authed: true, authLoaded: true, user: { roles: data.roles } });
                    } else {
                        mutateState({ authLoaded: true });
                    }
                })
                .catch((err) => {
                    mutateState({ authLoaded: true });
                    console.error(err.message);
                });
        };
    }, []);

    useEffect(() => {
        const getClientStructure = async () => {
            const gqlQuery = gql`
              query ClientStructure($language: String!, $url: String!) {
                clientStructure {
                    languages
                    urls
                    urlData(language: $language) {
                        url
                        menuText
                    }
                    page(language: $language, url: $url) {
                      body
                      menuText
                    }
                    footer(language: $language) {
                        body
                    }
                }
              }`
            const pathname = window.location.pathname.replace('/', '');
            const url = pathname === '' ? 'home' : pathname;
            const result = await gqlClient.query({
                query: gqlQuery,
                variables: {
                    language: appState.appLang,
                    url
                }
            });
            const clientStructure = result.data.clientStructure;
            if (clientStructure) mutateState({ clientStructure })
        }
        const getFlexibleUIConfig = async () => {
            const flexibleUIQuery = gql`
            query FlexibleUIConfig($compId: String!) {
                flexibleUIConfig(id: $compId) {
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
            const result = await gqlClient.query({ query: flexibleUIQuery, variables: { compId: 'root', langCode: appState.appLang } });
            const uiConfig = result.data?.flexibleUIConfig;
            if (uiConfig)
                setRootUIConfig(JSON.parse(JSON.stringify(uiConfig)));
        }
        getClientStructure()
        getFlexibleUIConfig()
    }, [appState.appLang])

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