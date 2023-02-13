import {
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { DeleteForeverRounded } from "@mui/icons-material";
import AppLangContext from "../contexts/AppLangContext";
import { useContext} from "react";
import i18n from "../i18n";
import { directionText, otherDirectionText } from "../i18n/languageDirection";

export default function UploadedFileField({ setFileValues, filesValues }) {
  const appLang = useContext(AppLangContext);

  const deleteFile = (name) => {
    const newFiles = filesValues.filter((idx) => idx.name !== name);
    setFileValues(newFiles);
  };

  return (
    <>
      {filesValues.map((uploadedFile) => {
        return (
          <Grid item xs={12} md={6} lg={4} key={uploadedFile.name}>
            <Card style={{ marginTop: "5%" }}>
              <CardContent dir={directionText(appLang)}>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {i18n(appLang, "NAME")} : {uploadedFile.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary"  dir={directionText(appLang)}>
                  {i18n(appLang, "BOOK")} : {`${uploadedFile.content.length} ${i18n(appLang, "BYTES")}`} : {uploadedFile.type} 
                  <DeleteForeverRounded
                  color="error"
                  onClick={() => deleteFile(uploadedFile.name)}
                  sx={{float:otherDirectionText(appLang)}}
                ></DeleteForeverRounded>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </>
  );
}
