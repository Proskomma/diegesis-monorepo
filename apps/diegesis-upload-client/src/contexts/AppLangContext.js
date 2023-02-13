import React from 'react';

const AppLangContext = React.createContext("en");
export const AppLangProvider = AppLangContext.Provider;
export default AppLangContext;