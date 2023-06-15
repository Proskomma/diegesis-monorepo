import {
    FormControlLabel,
    Switch,
} from "@mui/material";
import i18n from "../i18n";
import { useAppContext } from '../contexts/AppContext';

const ScriptureSwitchField =
    ({scriptureData, setScriptureData,fieldName, labelKey}) => {
        const {appLang} = useAppContext();
        const toggleScriptureToggle = field => {
            setScriptureData(true)
            const newData = {...scriptureData };
            newData[field] = !scriptureData[field];
            setScriptureData({
                ...newData,
                updatedAtts: true,
              });
        }
        return <FormControlLabel
        control={
            <Switch
                checked={scriptureData[fieldName]}
                color="secondary"
                size="small"
                onChange={() => toggleScriptureToggle(fieldName)}
                inputProps={{"aria-label": "controlled"}}
            />
        }
        label={i18n(appLang, labelKey)}
    />
}

export default ScriptureSwitchField;