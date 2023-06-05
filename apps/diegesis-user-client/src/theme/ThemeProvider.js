import React from "react";
import { MuiMaterial } from '@eten-lab/ui-kit';
import "./App.css";
const { GlobalStyles, ThemeProvider, createTheme } = MuiMaterial;

const DiegesisThemeProvider = ({ children }) => {
    const theme = createTheme({ palette: { primary: '' } })
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles
                styles={() => ({
                    '*, *::before, *::after, html': {
                        boxSizing: 'border-box',
                    },
                    body: {
                        fontFamily: 'Inter',
                    },
                })}
            />
            {children}
        </ThemeProvider>
    )
}

export default DiegesisThemeProvider;
