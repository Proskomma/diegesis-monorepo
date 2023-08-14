import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';


const HeaderNavPages = ({ pages = [] }) => {
  if (!pages.length) return <></>
  return (
    <AppBar position="static">
      <Toolbar>
        {
          pages.map((p) => (
            <Button key={p.url} href={`/${p.url}`} color="inherit">
              {p.menuText}
            </Button>)
          )
        }
      </Toolbar>
    </AppBar>
  );
};

export default HeaderNavPages;
