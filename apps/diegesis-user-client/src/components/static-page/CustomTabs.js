import { Close } from "@mui/icons-material";
import { Box, Tab, Tabs } from "@mui/material";

const TabTitle = ({ title, deletable, handleCloseTab, index }) => {
    return (
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            {title}
            {
                deletable &&
                <Close color='error' sx={{ marginLeft: '0.8rem' }} onClick={(event) => handleCloseTab(event, index)} />
            }
        </Box>
    )
}

const CustomTabs = ({ tabs, activeTab, deleteTab, changeTab }) => {
    return (
        <Tabs value={activeTab} onChange={changeTab} variant="scrollable" scrollButtons="auto" sx={{
            '.Mui-selected': {
                backgroundColor: 'aliceblue'
            }
        }}>
            {tabs.map((tab, index) => (
                <Tab
                    key={index}
                    sx={{ cursor: 'pointer' }}
                    label={
                        typeof tab.title === 'string'
                            ? <TabTitle {...tab} index={index} handleCloseTab={deleteTab} />
                            : tab.title
                    }
                />
            ))}
        </Tabs>
    );
};

export default CustomTabs;