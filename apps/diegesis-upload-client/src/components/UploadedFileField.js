import {
  Card,
  CardActions,
  CardContent,
  Grid,
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
    <Grid container dir={directionText(appLang)}>
        {files.map((uploadedFile) => {
          return (
            <Grid item xs={12} md={6} lg={4}>
              <Card style={{ marginTop: "5%"}}>
                <CardContent dir={directionText(appLang)}>
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
              </Card>
            </Grid>
          );
        })}
    </Grid>
  );
}
