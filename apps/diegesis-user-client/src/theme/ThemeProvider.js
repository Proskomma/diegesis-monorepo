import React from "react";
import { MuiMaterial, ThemeProvider as UIKitThemeProvider } from '@eten-lab/ui-kit';
const { GlobalStyles } = MuiMaterial;

const DiegesisThemeProvider = ({ children }) => {
    return (
        <UIKitThemeProvider>
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
        </UIKitThemeProvider>
    )
}

export default DiegesisThemeProvider;
