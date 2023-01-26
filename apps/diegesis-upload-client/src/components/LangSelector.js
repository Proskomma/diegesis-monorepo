import { Box, FormControl,MenuItem, Select } from "@mui/material";
import languagesList from '../i18n/languagesList.json'

export default function LangSelector({langCode, setlangCode}) {

    return (
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={langCode}
            label="Language Code"
            onChange={setlangCode}
          >
            {Object.entries(languagesList).map((kv, n) => (
              <MenuItem key={n} value={kv[1]}>
                {kv[0]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }