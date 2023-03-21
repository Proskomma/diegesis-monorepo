import {
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { DeleteForeverRounded } from "@mui/icons-material";
import AppLangContext from "../contexts/AppLangContext";
import { useContext} from "react";
import i18n from "../i18n";
import { directionText, otherDirectionText, FontFamily } from "../i18n/languageDirection";

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
          <Grid item xs={12} sm={6} md={4} lg={3} key={uploadedFile.name}>
            <Card style={{ marginTop: "5%" }}>
              <CardContent dir={directionText(appLang)}>
                <Typography sx={{ mb: 1.5 }} color="text.secondary" style={{ fontFamily : FontFamily(appLang)}}>
                  {uploadedFile.name}
                    {" ("}
                    {`${uploadedFile.content.length} ${i18n(appLang, "BYTES")}`}
                    {")"}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary"  dir={directionText(appLang)} style={{ fontFamily : FontFamily(appLang)}}>
                  {i18n(appLang, "BOOK")}: {uploadedFile.type}
                  <DeleteForeverRounded
                  color="error"
                  onClick={() => deleteFile(uploadedFile.name)}
                  sx={{float:otherDirectionText(appLang)}}
                />
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </>
  );
}
