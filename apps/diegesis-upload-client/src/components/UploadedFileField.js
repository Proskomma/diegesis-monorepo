import {
  CardActions,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { DeleteForeverRounded } from "@mui/icons-material";
import AppLangContext from "../contexts/AppLangContext";
import { useContext } from "react";
import i18n from "../i18n";
import { directionText } from "../i18n/languageDirection";

export default function UploadedFileField({ files }) {
  const appLang = useContext(AppLangContext);
  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap"
      }}
    >
      <>
        {files.map((uploadedFile, idx) => {
          return (
            <>
              <Paper style={{ marginTop: "5%" }}>
                <CardContent dir={directionText(appLang)}>
                  <Typography variant="h5" component="div">
                    {i18n(appLang, "DOCUMENT")} {idx + 1} :
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {i18n(appLang, "NAME")} : {uploadedFile.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {i18n(appLang, "BOOK")}: {uploadedFile.type}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {i18n(appLang, "CONTENT_LENGTH")} : {uploadedFile.content.length}
                  </Typography>
                </CardContent>
                <CardActions dir={directionText(appLang)}>
                  <DeleteForeverRounded
                    color="error"
                    style={{ justifyContent: "right" }}
                  ></DeleteForeverRounded>
                </CardActions>
              </Paper>
            </>
          );
        })}
      </>
    </Grid>
  );
}
