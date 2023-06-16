import React, { useState } from 'react'
import { useApolloClient } from '@apollo/client';
import { useAppContext } from '../contexts/AppContext';
import { Container, Tabs, Tab } from '@mui/material';
import { Close } from '@mui/icons-material';

//#region 
const CustomTab = ({ title, onClose }) => (
    <Tab
        label={title}
        iconPosition={'end'}
        {...(onClose && {
            icon: (
                <span onClick={onClose}>
                    <Close color={'disabled'} />
                </span>
            ),
        })}
    />
);

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
                <CustomTab key={index} title={tab.title} onClose={(event) => handleCloseTab(event, index)} />
            ))}
        </Tabs>
    );
};
//#endregion

export default function StaticUIConfigPage() {
    const [tabOptions, setTabOptions] = useState([{ title: 'Home' }, { title: 'List' }]);

    const gqlClient = useApolloClient();
    const { appLang, mutateState: mutateAppState, clientStructure } = useAppContext();

    return (
        <Container>
            <CustomTabs tabs={tabOptions} />
        </Container>
    )
}


