import { Paper, Typography } from "@mui/material";
import React from "react";

export default function GqlLoading() {
    return <Paper sx={{ width: '100%', overflow: 'hidden', my: 5, py: 5 }}>
        <Typography variant="h5" textAlign={'center'}>Loading</Typography>
    </Paper>;
}
