import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Rating,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import OrderDetailDialog from "./MenuDetails";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function MenuCard({ searchQuery, searchTrigger, setCartCount }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [errorNotif, setErrorNotif] = useState({
    open: false,
    message: "",
  });
  const [openPopup, setOpenPopup] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get("/menus", {
          params: {
            name: searchQuery || undefined, // kirim param name hanya jika ada
          },
        });
        setMenuItems(response.data.data || response.data);
        console.log(`Fetching menus with query: ${searchQuery}`);
      } catch (err) {
        console.error("Error fetching menus:", err);
      }
    };

    fetchMenus();

    const interval = setInterval(fetchMenus, 5000);
    return () => clearInterval(interval);
  }, [searchTrigger, searchQuery]);

  const categories = ["All Menu", "Snack", "Main Course", "Beverage"];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const token = localStorage.getItem("token");

  const handleAddToCart = async (item_id) => {
    try {
      let currentQuantity = cartItems[item_id] || 0;
      let newQuantity = currentQuantity + 1;

      setCartItems((prev) => ({
        ...prev,
        [item_id]: newQuantity,
      }));

      await api.patch(
        `/carts`,
        {
          menu_id: item_id,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );

      if (setCartCount) {
        setCartCount((prev) => prev + 1);
      }
    } catch (err) {
      setErrorNotif({
        open: true,
        message: `${err.response?.data?.message || err.message}`,
      });
      console.error("Error adding to cart:", err.response?.data || err);
    }
  };

  const handleToggleFavorite = (itemId, event) => {
    event.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedTab === 0 || item.type === categories[selectedTab];
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  return (
    <>
      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: isMobile ? 6 : 8, 
          mb: isMobile ? 6 : 8,
          px: isSmallMobile ? 2 : 3 
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: isMobile ? 2 : 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            centered={!isMobile}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: isSmallMobile ? "0.8rem" : isMobile ? "1rem" : "1.2rem",
                fontWeight: 500,
                minWidth: isSmallMobile ? 80 : isMobile ? 100 : 150,
                color: "text.secondary",
                px: isSmallMobile ? 1 : 2,
              },
              "& .Mui-selected": {
                color: "primary.main",
                fontWeight: 600,
              },
            }}
          >
            {categories.map((label, index) => (
              <Tab
                key={index}
                label={label}
                disableRipple
                sx={{
                  mx: isSmallMobile ? 0.5 : 1,
                  "&:focus": { outline: "none" },
                  "&:active": { outline: "none" },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Grid
          container
          spacing={isSmallMobile ? 2 : isMobile ? 3 : 4}
          justifyContent="center"
          alignItems="stretch"
          sx={{
            overflowX: "hidden",
            flexWrap: "wrap",
            pt: isMobile ? 2 : 3,
            pb: 1,
          }}
        >
          {filteredItems.map((item) => {
            const isOutOfStock = item.stock === 0;

            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={item.id}
                sx={{
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <Card
                  onClick={() => {
                    if (isOutOfStock) return;
                    setOpen(true);
                    setSelectedItem(item);
                  }}
                  elevation={isSmallMobile ? 1 : 3}
                  sx={{
                    height: isSmallMobile ? 130 : "100%",
                    display: "flex",
                    flexDirection: isSmallMobile ? "row" : "column",
                    width: isSmallMobile ? "400px" : isMobile ? "clamp(280px, 90%, 320px)" : "clamp(310px, 23vw, 325px)",
                    maxWidth: isSmallMobile ? "400px" : "400px",
                    borderRadius: isSmallMobile ? 1 : 1,
                    transition: "all 0.3s ease",
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    filter: isOutOfStock ? "grayscale(100%)" : "none",
                    opacity: isOutOfStock ? 0.6 : 1,
                    overflow: "hidden",
                    "&:hover": {
                      transform: isOutOfStock ? "none" : isSmallMobile ? "none" : "translateY(-8px)",
                      boxShadow: isOutOfStock ? 1 : isSmallMobile ? 2 : 6,
                    },
                  }}
                >
                  <Box sx={{ 
                    position: "relative", 
                    flexShrink: 0, 
                    width: isSmallMobile ? "110px" : "100%",
                    height: isSmallMobile ? "130px" : "auto",
                  }}>
                    <CardMedia
                      component="img"
                      image={item.image_url}
                      alt={item.name}
                      sx={{
                        height: isSmallMobile ? "130px" : isMobile ? 180 : 200,
                        width: isSmallMobile ? "110px" : "100%",
                        objectFit: "cover",
                      }}
                    />
                    {isOutOfStock && (
                      <Chip
                        label="Out of Stock"
                        color="default"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 4,
                          left: 4,
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.65rem",
                          height: isSmallMobile ? "20px" : "auto",
                        }}
                      />
                    )}

                    {!isSmallMobile && (
                      <>
                        <IconButton
                          onClick={(e) => handleToggleFavorite(item.id, e)}
                          size={isSmallMobile ? "small" : "medium"}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 1)",
                            },
                          }}
                        >
                          {favorites[item.id] ? (
                            <FavoriteIcon 
                              sx={{ 
                                color: "red",
                                fontSize: isSmallMobile ? "1.2rem" : "1.5rem" 
                              }} 
                            />
                          ) : (
                            <FavoriteBorderIcon 
                              sx={{ 
                                fontSize: isSmallMobile ? "1.2rem" : "1.5rem" 
                              }} 
                            />
                          )}
                        </IconButton>

                        <Chip
                          icon={<LocalOfferIcon sx={{ fontSize: isSmallMobile ? "1rem" : "1.2rem" }} />}
                          label={item.type}
                          size={isSmallMobile ? "small" : "medium"}
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            left: 8,
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            fontWeight: 600,
                            fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
                          }}
                        />
                      </>
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      p: isSmallMobile ? 1.5 : 2.5,
                      width: isSmallMobile ? "calc(100% - 110px)" : "100%",
                      height: isSmallMobile ? "130px" : "auto",
                      "&:last-child": {
                        pb: isSmallMobile ? 1.5 : 2.5,
                      }
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: isSmallMobile ? "row" : "row",
                          justifyContent: "space-between",
                          alignItems: isSmallMobile ? "flex-start" : "flex-start",
                          mb: isSmallMobile ? 0.5 : 1,
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant={isSmallMobile ? "subtitle1" : "h6"}
                          sx={{
                            fontWeight: 600,
                            fontSize: isSmallMobile ? "0.875rem" : isMobile ? "1rem" : "1.2rem",
                            color: "text.primary",
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: isSmallMobile ? 2 : 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flex: 1,
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant={isSmallMobile ? "subtitle2" : "h6"}
                          sx={{
                            fontWeight: 700,
                            fontSize: isSmallMobile ? "0.875rem" : isMobile ? "1rem" : "1.2rem",
                            color: "primary.main",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            ml: 1,
                          }}
                        >
                          {formatPrice(item.price)}
                        </Typography>
                      </Box>

                      {isSmallMobile && (
                        <Chip
                          label={item.type}
                          size="small"
                          sx={{
                            width: "fit-content",
                            height: "18px",
                            fontSize: "0.625rem",
                            fontWeight: 500,
                            mb: 0.5,
                            "& .MuiChip-label": {
                              px: 1,
                            }
                          }}
                        />
                      )}

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: isSmallMobile ? 0.5 : 2,
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: isSmallMobile ? 1 : 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: isSmallMobile ? "0.7rem" : "0.875rem",
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Rating
                          value={item.rating || 4.5}
                          precision={0.5}
                          readOnly
                          size="small"
                          sx={{
                            fontSize: isSmallMobile ? "0.85rem" : "1.2rem",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ 
                            ml: 0.5, 
                            color: "text.secondary",
                            fontSize: isSmallMobile ? "0.65rem" : "0.875rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.rating || 4.5}
                        </Typography>
                      </Box>
                      
                      {isSmallMobile && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon sx={{ fontSize: "0.9rem" }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item.id);
                          }}
                          size="small"
                          disabled={isOutOfStock}
                          sx={{
                            background: "#30468b",
                            borderRadius: 1.5,
                            fontSize: "0.7rem",
                            px: 1.5,
                            py: 0.5,
                            minWidth: "fit-content",
                            height: "28px",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:disabled": {
                              background: "#ccc",
                            }
                          }}
                        >
                          Add
                        </Button>
                      )}
                    </Box>

                    {!isSmallMobile && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 1,
                          width: "100%",
                          flexDirection: isSmallMobile ? "column" : "row",
                        }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(true);
                            setSelectedItem(item);
                          }}
                          size={isSmallMobile ? "small" : "medium"}
                          sx={{
                            mt: "auto",
                            background: "#ffffffff",
                            color: "black",
                            border: 1,
                            borderRadius: 1,
                            fontSize: isSmallMobile ? "0.7rem" : "0.875rem",
                            "&:hover": {
                              borderColor: "#30468b",
                              color: "#30468b",
                            },
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item.id);
                          }}
                          size={isSmallMobile ? "small" : "medium"}
                          sx={{
                            mt: "auto",
                            background: "#30468b",
                            borderRadius: 1,
                            fontSize: isSmallMobile ? "0.7rem" : "0.875rem",
                          }}
                        >
                          Add To Cart
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {selectedItem && (
          <OrderDetailDialog
            open={open}
            onClose={() => setOpen(false)}
            item={selectedItem}
            setCartCount={setCartCount}
            cartItems={cartItems}
            setCartItems={setCartItems}
          />
        )}

        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: "center", py: isMobile ? 4 : 8 }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              color="text.secondary"
              sx={{ fontSize: isSmallMobile ? "0.9rem" : "inherit" }}
            >
              Tidak ada item yang sesuai dengan pencarian Anda.
            </Typography>
          </Box>
        )}
      </Container>
      <Snackbar
        open={errorNotif.open}
        autoHideDuration={3000}
        onClose={() => setErrorNotif({ ...errorNotif, open: false })}
        anchorOrigin={{ 
          vertical: isMobile ? "bottom" : "top", 
          horizontal: "center" 
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setErrorNotif({ ...errorNotif, open: false })}
          sx={{ 
            width: "100%",
            fontSize: isSmallMobile ? "0.8rem" : "0.875rem"
          }}
        >
          {errorNotif.message}
        </Alert>
      </Snackbar>
    </>
  );
}