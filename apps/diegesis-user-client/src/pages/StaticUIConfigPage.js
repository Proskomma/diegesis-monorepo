import React, { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client';
import { useAppContext } from '../contexts/AppContext';
import { Container, Tabs, Tab, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

//#region 
const CustomTabs = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleChangeTab = (_, index) => {
        setActiveTab(index);
    };

    const handleCloseTab = (event, index) => {
        event.stopPropagation();
        setActiveTab((prev) => (prev === index ? prev - 1 : prev));
    };

    return (
        <Tabs value={activeTab} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
            {tabs.map((tab, index) => (
                <Tab
                    key={index}
                    label={tab.title}
                    {...(tab.closable && {
                        iconPosition: 'end',
                        icon: (
                            <IconButton onClick={(event) => handleCloseTab(event, index)}>
                                <Close />
                            </IconButton>
                        ),
                    })}
                />
            ))}
        </Tabs>
    );
};
//#endregion

export default function StaticUIConfigPage() {

    const [tabOptions, setTabOptions] = useState([]);
    const { appLang, mutateState: mutateAppState, clientStructure } = useAppContext();

    const gqlClient = useApolloClient();

    useEffect(() => {
        if (Array.isArray(clientStructure.urlData)) {
            const options = clientStructure.urlData.map(to => ({ title: to.menuText, closable: true }));
            setTabOptions(options)
        }
    }, [clientStructure]);

    return (
        <Container>
            <CustomTabs tabs={tabOptions} />
        </Container>
    )
}


