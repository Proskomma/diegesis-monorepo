import {
  FormGroup,
  FormLabel,
  Grid,
  MenuItem,
  Select,
} from "@mui/material";
import { useContext } from "react";
import AppLangContext from "../contexts/AppLangContext";
import { setFontFamily } from "../i18n/languageDirection";

export default function ColumnsSelector({ formLabelTitle, listItems,formatData ,setFormatData}) {
  const appLang = useContext(AppLangContext);
  const setFormatValue = (field, value) => {
    const newData = { ...formatData };
    newData[field] = value;
    setFormatData(newData);
  };
  return (
    <>
      <Grid item>
        <FormGroup>
          <FormLabel
            id="page-size-group-label"
            style={{ fontFamily: setFontFamily(appLang) }}
          >
            {formLabelTitle}
          </FormLabel>
          <Select
            aria-labelledby="page-size-group-label"
            name="page-size-buttons-group"
            defaultValue="1"
            size="small"
            color="primary"
            sx={{ marginRight: "1em", backgroundColor: "#FFF"}}
            onChange={(e) => setFormatValue("nColumns", e.target.value)}
          >
            {listItems.map((nc, n) => (
              <MenuItem key={n} value={nc} style={{ fontFamily: setFontFamily(appLang) }}>
                {`${nc}`}
              </MenuItem>
            ))}
          </Select>
        </FormGroup>
      </Grid>
    </>
  );
}
