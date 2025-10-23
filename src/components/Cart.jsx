import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import api from "../../services/api";
import { CheckCircle } from "lucide-react";

export default function CartPopup({ open, onClose, cartCount, setCartCount }) {
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const token = localStorage.getItem("token");
  const [success, setSuccess] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!open) return;

    const fetchCart = async () => {
      try {
        const res = await api.get("/carts", {
          headers: {
            Authorization: `bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Cart API response:", res.data);

        const cartData = res.data.data;
        const items = Array.isArray(cartData?.menus) ? cartData.menus : [];
        setMenuItems(items);
      } catch (err) {
        console.error("Error fetching cart:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [open]);

  const handleUpdateCart = async (item_id, newQuantity) => {
    try {
      setCartItems((prev) => ({
        ...prev,
        [item_id]: newQuantity,
      }));

      console.log("Sending:", { menu_id: item_id, quantity: newQuantity });

      // Kirim ke backend
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

      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === item_id
            ? {
                ...item,
                pivot: {
                  ...item.pivot,
                  quantity: newQuantity,
                  subtotal_price: newQuantity * item.price,
                },
              }
            : item
        )
      );
      // Update badge cart count total
      if (setCartCount) {
        setCartCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
    }
  };

  const handleDeleteCart = async (item_id, newQuantity) => {
    try {
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

      setMenuItems((prev) => prev.filter((item) => item.id !== item_id));
      if (setCartCount) {
        setCartCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
    }
  };

  const createOrder = async () => {
    setLoading(true)
    try {
      const res = await api.post(
        "/orders",
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      console.log("yeyeye", res.data);
      setLoading(false)
      setSuccess(true)

      const timer = setTimeout(() => {
        setSuccess(false);
        location.reload()
      }, 3000);

    } catch (error) {
      setLoading(false)
      console.log(error.response?.data || error.message);
      console.log("yah gagal");
    }
  };

  const getTotalPrice = () => {
    return menuItems.reduce((total, item) => total + item.pivot.subtotal_price, 0);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        maxWidth={isMobile ? "xl" : "sm"}
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: isMobile ? 0 : 1.5,
            overflow: "hidden",
            margin: isMobile ? 0 : 2,
            height: isMobile ? "100%" : "auto",
            maxHeight: isMobile ? "100%" : "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#30468b",
            color: "white",
            py: isSmallMobile ? 1.5 : 2,
            px: isSmallMobile ? 2 : 3,
          }}
        >
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight={700}
            sx={{ fontSize: isSmallMobile ? "1.1rem" : "inherit" }}
          >
            Your Cart
          </Typography>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: "white",
              padding: isSmallMobile ? 0.5 : 1 
            }}
          >
            <CloseIcon fontSize={isSmallMobile ? "small" : "medium"} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: isSmallMobile ? 2 : 3,
            bgcolor: "#fafafa",
            height: isMobile ? "calc(100% - 64px)" : "auto",
            maxHeight: "70vh",
            overflowY: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Jika masih loading */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : menuItems.length === 0 ? (
            <Box sx={{ 
              textAlign: "center", 
              py: 4,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Your cart is empty
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                Add some items to get started
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1 }}>
              <Grid 
                container 
                spacing={isSmallMobile ? 1 : 2}
                sx={{
                  mt: isSmallMobile ? 0 : 1,
                  justifyContent: "center",
                  width: "100%"
                }}
              >
                {menuItems.map((item) => (
                  <Grid 
                    item xs={12} 
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%"
                    }}
                  >
                    <Card
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 1,
                        width: "100%",
                        p: isSmallMobile ? 1 : 1,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        minHeight: isSmallMobile ? 80 : 100,
                      }}
                    >
                      {item.image_url && (
                        <CardMedia
                          component="img"
                          image={item.image_url}
                          alt={item.name}
                          sx={{
                            width: isSmallMobile ? 60 : 70,
                            height: isSmallMobile ? 60 : 70,
                            borderRadius: 1,
                            objectFit: "cover",
                            mr: isSmallMobile ? 1.5 : 2,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <CardContent 
                        sx={{ 
                          flexGrow: 1, 
                          p: isSmallMobile ? "4px !important" : 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography 
                          fontWeight="bold" 
                          sx={{
                            fontSize: isSmallMobile ? "0.9rem" : "1rem",
                            lineHeight: 1.2,
                            mb: 0.5,
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="primary.main"
                          sx={{
                            fontSize: isSmallMobile ? "0.8rem" : "0.875rem",
                            fontWeight: 600,
                          }}
                        >
                          Rp {item.pivot.subtotal_price.toLocaleString()}
                        </Typography>

                        {/* Tombol +, -, dan Delete */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 0.5 
                          }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                if (item.pivot.quantity - 1 == 0) {
                                  handleDeleteCart(item.id, 0);
                                } else {
                                  handleUpdateCart(item.id, item.pivot.quantity - 1);
                                }
                              }}
                              sx={{ 
                                minWidth: 'auto',
                                width: isSmallMobile ? 28 : 32,
                                height: isSmallMobile ? 28 : 32,
                                padding: 0,
                              }}
                            >
                              <RemoveIcon sx={{ 
                                fontSize: isSmallMobile ? 14 : 15 
                              }} />
                            </Button>

                            <Typography 
                              variant="body1"
                              sx={{
                                fontSize: isSmallMobile ? "0.8rem" : "0.875rem",
                                minWidth: 20,
                                textAlign: "center",
                              }}
                            >
                              {item.pivot.quantity}
                            </Typography>

                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleUpdateCart(item.id, item.pivot.quantity + 1)
                              }
                              sx={{ 
                                minWidth: 'auto',
                                width: isSmallMobile ? 28 : 32,
                                height: isSmallMobile ? 28 : 32,
                                padding: 0,
                              }}
                            >
                              <AddIcon sx={{ 
                                fontSize: isSmallMobile ? 14 : 15 
                              }} />
                            </Button>
                          </Box>

                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteCart(item.id, 0)}
                            sx={{ 
                              ml: "auto",
                              minWidth: 'auto',
                              padding: isSmallMobile ? '4px 8px' : '6px 12px',
                            }}
                            startIcon={<DeleteIcon fontSize={isSmallMobile ? "small" : "medium"} />}
                          >
                            {isSmallMobile ? "" : "Delete"}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Total Price and Order Button */}
              <Box sx={{ 
                mt: 3, 
                pt: 2, 
                borderTop: "1px solid",
                borderColor: "divider",
                position: isMobile ? "sticky" : "static",
                bottom: 0,
                backgroundColor: "#fafafa",
              }}>
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  mb: 2 
                }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    sx={{ fontSize: isSmallMobile ? "1rem" : "1.25rem" }}
                  >
                    Total:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    color="primary.main"
                    sx={{ fontSize: isSmallMobile ? "1rem" : "1.25rem" }}
                  >
                    Rp {getTotalPrice().toLocaleString()}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size={isSmallMobile ? "medium" : "large"}
                  sx={{
                    background: "#30468b",
                    py: isSmallMobile ? 1 : 1.5,
                    fontSize: isSmallMobile ? "0.9rem" : "1rem",
                    fontWeight: 600,
                  }}
                  onClick={() => createOrder()}
                >
                  Order Now
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog
        open={loading}
        PaperProps={{
          sx: {
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            minWidth: isSmallMobile ? 250 : 300,
            mx: isSmallMobile ? 2 : 0,
          },
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={isSmallMobile ? 40 : 50} sx={{ color: "black" }} />
            <Typography
              variant="body1"
              sx={{ 
                color: "black", 
                fontWeight: 500,
                fontSize: isSmallMobile ? "0.9rem" : "1rem"
              }}
            >
              Ordering...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={success}
        PaperProps={{
          sx: {
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            minWidth: isSmallMobile ? 250 : 300,
            mx: isSmallMobile ? 2 : 0,
          },
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: isSmallMobile ? 50 : 60,
                height: isSmallMobile ? 50 : 60,
                borderRadius: "50%",
                bgcolor: "#4caf50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={isSmallMobile ? 28 : 36} color="white" />
            </Box>
            <Typography 
              variant={isSmallMobile ? "subtitle1" : "h6"} 
              sx={{ 
                color: "black", 
                fontWeight: 600, 
                fontFamily:"Inter, sans-serif",
                textAlign: "center"
              }}
            >
              Order Successful!
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}