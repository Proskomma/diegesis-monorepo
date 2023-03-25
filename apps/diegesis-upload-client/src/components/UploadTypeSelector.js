import {Grid, InputLabel, MenuItem, Select} from "@mui/material";
import {useContext} from "react";
import AppLangContext from "../contexts/AppLangContext";
import i18n from "../i18n";
import {useNavigate} from 'react-router-dom';
import {directionText, fontFamily} from "../i18n/languageDirection";

export default function UploadTypeSelector({currentType}) {
    const appLang = useContext(AppLangContext);
    const navigate = useNavigate();
    return (
        <Grid dir={directionText(appLang)}>
            <InputLabel id="uploadTypeLabel" htmlFor="uploadType" style={{fontFamily: fontFamily(appLang)}}>
                {i18n(appLang, "UPLOAD_TYPE")}
            </InputLabel>
            <Select
                labelId="uploadTypeLabel"
                value={currentType}
                onChange={e => navigate(`/uploads/add-${e.target.value}`)}
                defaultValue={"pleaseChoose"}
            >
                <MenuItem key={-1} value={"pleaseChoose"} dir={directionText(appLang)}>
                    {i18n(appLang, "SELECT_UPLOAD_TYPE")}
                </MenuItem>
                <MenuItem key={0} value="scripture-usfm" dir={directionText(appLang)}>
                    {i18n(appLang, "SELECT_SCRIPTURE_USFM_UPLOAD_TYPE")}
                </MenuItem>
                <MenuItem key={1} value="uw-notes" dir={directionText(appLang)}>
                    {i18n(appLang, "SELECT_UW_NOTES_UPLOAD_TYPE")}
                </MenuItem>
                <MenuItem key={2} value="tyndale-study-notes" dir={directionText(appLang)}>
                    {i18n(appLang, "SELECT_TYNDALE_STUDY_NOTES_UPLOAD_TYPE")}
                </MenuItem>
            </Select>
        </Grid>
    );
}
