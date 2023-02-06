import {
  CardActions,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { DeleteForeverRounded } from "@mui/icons-material";

export default function UploadedFileField({ files }) {
  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent : 'space-around',
        flexWrap :'wrap'
      }}
    >
      <>
        {files.map((uploadedFile, idx) => {
          return (
            <>
              <Paper style={{ marginTop: "5%" }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Document {idx + 1} :
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Name : {uploadedFile.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Type : {uploadedFile.type}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Content Length: {uploadedFile.content.length}
                  </Typography>
                </CardContent>
                <CardActions>
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
