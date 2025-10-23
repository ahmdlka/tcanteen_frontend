import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Paper,
  TextField,
  Button,
  CardMedia,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../services/api";

export default function OrderDetailDialog({ open, onClose, item, setCartCount, cartItems, setCartItems }) {
  console.log(item);

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => quantity > 1 && setQuantity((q) => q - 1);
  const formatPrice = (price) => `Rp ${price.toLocaleString("id-ID")}`;
  const [errorNotif, setErrorNotif] = useState({
    open: false,
    message: "",
  });

  const token = localStorage.getItem("token");
  const totalPrice = item.price * quantity;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAddToCart = async (item_id) => {
    try {
      let currentQuantity = cartItems[item_id] || 0;
      let newQuantity = currentQuantity + quantity; // Use the selected quantity instead of +1

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
        setCartCount((prev) => prev + quantity);
      }
      
      // Close dialog after successful add to cart
      onClose();
    } catch (err) {
      setErrorNotif({
        open: true,
        message: `${err.response?.data?.message || err.message}`
      });
      console.error("Error adding to cart:", err.response?.data || err);
    }
  };

  // Reset quantity when dialog opens/closes
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setNotes("");
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
      PaperProps={{
        sx: { 
          borderRadius: isMobile ? 0 : 1, 
          overflow: "hidden",
          margin: isMobile ? 0 : 2,
          maxHeight: isMobile ? "100%" : "90vh",
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            height: { xs: "auto", md: 500 },
            maxHeight: { xs: "100vh", md: 500 },
            overflow: "auto",
          }}
        >
          {/* LEFT SECTION – IMAGE */}
          <Box
            sx={{
              width: { xs: "100%", md: "45%" },
              height: { xs: isSmallMobile ? 200 : 250, md: "100%" },
              backgroundColor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <CardMedia
              component="img"
              image={item.image_url}
              alt={item.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            <IconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                width: isSmallMobile ? 32 : 40,
                height: isSmallMobile ? 32 : 40,
              }}
            >
              <CloseIcon fontSize={isSmallMobile ? "small" : "medium"} />
            </IconButton>
            <IconButton
              onClick={() => setIsFavorite(!isFavorite)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                width: isSmallMobile ? 32 : 40,
                height: isSmallMobile ? 32 : 40,
              }}
            >
              {isFavorite ? (
                <FavoriteIcon sx={{ color: "red", fontSize: isSmallMobile ? "1rem" : "1.25rem" }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: isSmallMobile ? "1rem" : "1.25rem" }} />
              )}
            </IconButton>
          </Box>

          {/* RIGHT SECTION – DETAILS */}
          <Box
            sx={{
              flex: 1,
              p: isSmallMobile ? 2 : isMobile ? 3 : 4,
              overflowY: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant={isSmallMobile ? "h6" : "h5"} 
                sx={{ 
                  fontWeight: 700,
                  fontSize: isSmallMobile ? "1.25rem" : "inherit",
                  lineHeight: 1.2,
                }}
              >
                {item.name}
              </Typography>
              <Box
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1, 
                  mt: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ 
                    color: "warning.main", 
                    fontWeight: 600,
                    fontSize: isSmallMobile ? "0.75rem" : "0.875rem",
                  }}
                >
                  ⭐ 4.5/5.0
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: isSmallMobile ? "0.75rem" : "0.875rem" }}
                >
                  ({item.reviews || 0} reviews)
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: isSmallMobile ? "0.75rem" : "0.875rem" }}
                >
                  🕐 10-15 Minutes
                </Typography>
              </Box>
              <Chip
                label={item.stock > 0 ? "Available" : "Out of Stock"}
                color={item.stock > 0 ? "success" : "error"}
                size="small"
                sx={{ 
                  mt: 1, 
                  fontWeight: 600,
                  fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
                }}
              />
            </Box>

            <Typography
              variant={isSmallMobile ? "h6" : "h5"}
              sx={{ 
                fontWeight: 700, 
                color: "primary.main", 
                mb: 2,
                fontSize: isSmallMobile ? "1.1rem" : "inherit",
              }}
            >
              {formatPrice(item.price)}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                mb: 3, 
                lineHeight: 1.6,
                fontSize: isSmallMobile ? "0.875rem" : "1rem",
              }}
            >
              {item.description}
            </Typography>

            {/* QUANTITY */}
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                fontSize: isSmallMobile ? "0.9rem" : "1rem",
              }}
            >
              Quantity
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                width: "fit-content",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <IconButton 
                onClick={handleDecrement} 
                disabled={quantity <= 1}
                size={isSmallMobile ? "small" : "medium"}
              >
                <RemoveIcon fontSize={isSmallMobile ? "small" : "medium"} />
              </IconButton>
              <Typography 
                variant="h6" 
                sx={{ 
                  px: 2,
                  fontSize: isSmallMobile ? "1rem" : "1.25rem",
                }}
              >
                {quantity}
              </Typography>
              <IconButton 
                onClick={handleIncrement}
                size={isSmallMobile ? "small" : "medium"}
              >
                <AddIcon fontSize={isSmallMobile ? "small" : "medium"} />
              </IconButton>
            </Paper>

            {/* NOTES */}
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                fontSize: isSmallMobile ? "0.9rem" : "1rem",
              }}
            >
              Special Notes (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={isSmallMobile ? 2 : 3}
              placeholder="Add any special requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "grey.50",
                  fontSize: isSmallMobile ? "0.875rem" : "1rem",
                },
              }}
            />

            {/* TOTAL */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: "auto",
                mb: 2,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: isSmallMobile ? "1rem" : "1.25rem",
                }}
              >
                Total
              </Typography>
              <Typography
                variant="h5"
                sx={{ 
                  fontWeight: 700, 
                  color: "primary.main",
                  fontSize: isSmallMobile ? "1.1rem" : "1.5rem",
                }}
              >
                {formatPrice(totalPrice)}
              </Typography>
            </Box>

            {/* BUTTON */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<ShoppingCartIcon />}
              disabled={item.stock === 0}
              sx={{ 
                py: isSmallMobile ? 1 : 1.2, 
                fontWeight: 600, 
                fontSize: isSmallMobile ? "0.9rem" : "1rem",
                mb: isMobile ? 1 : 0,
              }}
              onClick={() => {
                handleAddToCart(item.id);
              }}
            >
              {item.stock === 0 ? "Out of Stock" : `Add to Cart (${quantity})`}
            </Button>

            {item.stock === 0 && (
              <Typography 
                variant="body2" 
                color="error" 
                sx={{ 
                  textAlign: "center", 
                  mt: 1,
                  fontSize: isSmallMobile ? "0.75rem" : "0.875rem",
                }}
              >
                This item is currently out of stock
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
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
            fontSize: isSmallMobile ? "0.8rem" : "0.875rem",
          }}
        >
          {errorNotif.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}