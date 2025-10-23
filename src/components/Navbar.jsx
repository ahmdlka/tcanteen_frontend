// src/components/Navbar.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  Fade,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CartPopup from "./Cart";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import api from "../../services/api";
import logo from "../assets/logoTCanteen.png";

export default function Navbar({
  searchQuery,
  setSearchQuery,
  cartCount,
  setCartCount,
  openCart,
  setOpenCart,
  handleAuthNav,
  onSearch,
}) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const { user, setUser } = useContext(UserContext);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    } else {
      setUser({ name: "Guest", email: "Not logged in" });
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({ name: "Guest", email: "Not logged in" });
    setIsLoggedIn(false);
    setShowProfileCard(false);
    setProfileAnchorEl(null);
    setMobileMenuOpen(false);
    navigate("/");
    location.reload()
  };

  const toggleProfileCard = (event) => {
    if (isMobile) {
      setProfileAnchorEl(event.currentTarget);
    } else {
      setShowProfileCard((prev) => !prev);
    }
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setProfileAnchorEl(null);
  };

  const handleAuthClick = (type) => {
    handleAuthNav(type);
    setMobileMenuOpen(false);
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        backgroundColor: "#ffffff",
        color: "black",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      <Toolbar sx={{ 
        py: isMobile ? 0.5 : 1,
        minHeight: { xs: '56px', sm: '64px' } 
      }}>
        {/* Logo */}
        <Box
          component="img"
          src={logo}
          alt="TCanteen Logo"
          sx={{
            height: isSmallMobile ? 20 : 25,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        />

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop Search - Hidden on Mobile */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
            <TextField
              placeholder="Search menu..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#f5f5f5",
                  borderRadius: "12px 0 0 12px",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: "#ccc" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "grey.600" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearchClick}
              sx={{
                height: "40px",
                minWidth: "60px",
                borderRadius: "0 12px 12px 0",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Search
            </Button>
          </Box>
        )}

        {/* CART */}
        <IconButton 
          onClick={() => setOpenCart(true)} 
          sx={{ 
            mr: isMobile ? 1 : 2,
            color: "inherit"
          }}
        >
          <Badge 
            badgeContent={cartCount} 
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: isSmallMobile ? '0.6rem' : '0.75rem',
                height: isSmallMobile ? 16 : 20,
                minWidth: isSmallMobile ? 16 : 20,
              }
            }}
          >
            <ShoppingCartIcon fontSize={isSmallMobile ? "small" : "medium"} />
          </Badge>
        </IconButton>
        <CartPopup open={openCart} onClose={() => setOpenCart(false)} cartCount={cartCount} setCartCount={setCartCount} />

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuToggle}
            sx={{ ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Desktop Auth Section */}
        {!isMobile && !isLoggedIn ? (
          <>
            <Button
              variant="outlined"
              sx={{
                mr: 1.5,
                borderRadius: "10px",
                "&:hover": {
                  borderColor: "#30468b",
                  color: "#30468b",
                },
              }}
              onClick={() => handleAuthNav("login")}
            >
              Login
            </Button>
            <Button
              variant="contained"
              sx={{ borderRadius: "10px" }}
              onClick={() => handleAuthNav("register")}
            >
              Register
            </Button>
          </>
        ) : !isMobile && isLoggedIn ? (
          <Box sx={{ position: "relative" }}>
            <IconButton onClick={toggleProfileCard}>
              <Avatar 
                sx={{ 
                  bgcolor: "primary.main",
                  width: 32,
                  height: 32
                }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
            </IconButton>

            {/* Desktop Profile Card */}
            <Fade in={showProfileCard}>
              <Card
                sx={{
                  position: "absolute",
                  top: "45px",
                  right: 0,
                  width: 250,
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 2.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 56,
                      height: 56,
                      mx: "auto",
                      mb: 1.5,
                    }}
                  >
                    <PersonIcon fontSize="large" />
                  </Avatar>
                  <Typography fontWeight="bold">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {user.email}
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/order")}
                    sx={{
                      mb: 1,
                      borderRadius: "10px",
                      textTransform: "none",
                    }}
                  >
                    View Order
                  </Button>

                  <Divider sx={{ my: 1 }} />

                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        ) : null}

        {/* Mobile Profile Menu */}
        {isMobile && isLoggedIn && (
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                width: 200,
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }
            }}
          >
            <MenuItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleNavigation("/order")}>
              <ListItemIcon>
                <ShoppingCartIcon fontSize="small" />
              </ListItemIcon>
              View Order
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        )}
      </Toolbar>

      {/* Mobile Search Bar - Below Toolbar */}
      {isMobile && (
        <Box sx={{ 
          px: 2, 
          pb: 1,
          display: mobileMenuOpen ? 'none' : 'block'
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              placeholder="Search menu..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#f5f5f5",
                  borderRadius: "8px 0 0 8px",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: "#ccc" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "grey.600" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearchClick}
              sx={{
                height: "40px",
                minWidth: "60px",
                borderRadius: "0 8px 8px 0",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Search
            </Button>
          </Box>
        </Box>
      )}

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: isSmallMobile ? 280 : 320,
            borderRadius: '16px 0 0 16px',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* User Info Section */}
          {isLoggedIn ? (
            <Box sx={{ textAlign: "center", mb: 2, p: 2 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>
              <Typography fontWeight="bold" variant="h6">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
              Welcome Guest
            </Typography>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Navigation Menu */}
          <List>
            {!isLoggedIn ? (
              <>
                <ListItem 
                  button 
                  onClick={() => handleAuthClick("login")}
                  sx={{ borderRadius: '8px', mb: 1 }}
                >
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => handleAuthClick("register")}
                  sx={{ borderRadius: '8px' }}
                >
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem 
                  button 
                  onClick={() => handleNavigation("/order")}
                  sx={{ borderRadius: '8px', mb: 1 }}
                >
                  <ListItemIcon>
                    <ShoppingCartIcon />
                  </ListItemIcon>
                  <ListItemText primary="View Order" />
                </ListItem>
                <ListItem 
                  button 
                  onClick={handleLogout}
                  sx={{ borderRadius: '8px' }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}