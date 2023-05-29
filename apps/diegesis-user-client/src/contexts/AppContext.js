import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

const AppContextProvider = ({ children }) => {

    const [appState, setAppState] = useState({ ...initialState, appLang: getStoredConfig()?.langCode });
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

    useEffect(() => {
        console.log('app context', appState.appLang)
        getLangDependedData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.appLang])

    const getLangDependedData = useCallback(() => {
        const getClientStructure = async () => {
            const csQueryStr = `{
                clientStructure {
                  languages
                  urls
                  urlData(language:"%lang%") {
                     url
                     menuText
                  }
                  footer(language:"%lang%") {
                    body
                  }
                }
                }`.replace(/%lang%/g, appState.appLang);
            const result = await gqlClient.query({ query: gql`${csQueryStr}` });
            const clientStructure = result.data.clientStructure;
            if (clientStructure) mutateState({ clientStructure })
        }

        const getFlexibleUIConfig = async () => {
            const flexibleUIQuery = `
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
            const result = await gqlClient.query({ query: gql`${flexibleUIQuery}`, variables: { compId: 'root', langCode: appState.appLang } });
            const uiConfig = result.data?.flexibleUIConfig;
            if (uiConfig)
                setRootUIConfig(JSON.parse(JSON.stringify(uiConfig)));
        }

        getClientStructure()
        getFlexibleUIConfig()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.appLang]);

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