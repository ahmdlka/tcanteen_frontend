import React, { useState } from "react";
import { createTheme, Box, IconButton, useTheme, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  const theme = createTheme({
    typography: {
      fontFamily: '"Inter", sans-serif',
    },
    palette: {
      mode: "light",
      primary: {
        main: "#30468b",
        light: "#041f6aff",
        dark: "#040c66ff",
      },
      background: {
        default: "#ecf0f7ff",
        paper: "#ffffff",
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
    },
  });
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openSidebar, setOpenSidebar] = useState(false);

  const handleSidebarToggle = () => {
    setOpenSidebar(!openSidebar);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden"}}>
      {/* Sidebar */}
      <Sidebar
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        variant={isMobile ? "temporary" : "permanent"}
      />

      {/* Konten utama */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f9f9f9",
          minHeight: "100vh",
          p: { xs: 2, sm: 3, md: 4 },
          position: "relative",
        }}
      >
        {/* Tombol buka sidebar (muncul hanya di mobile) */}
        {isMobile && (
          <IconButton
            onClick={handleSidebarToggle}
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 1300,
              backgroundColor: "white",
              boxShadow: 2,
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {children}
      </Box>
    </Box>
  );
}
