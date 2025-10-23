import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Collapse,
  Fade,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Stack,
  Avatar,
  Paper,
  alpha,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ExpandMore,
  MoreVert,
  Schedule,
  LocalShipping,
  CheckCircle,
  Person,
  CalendarToday,
  AccessTime,
  ShoppingBag,
  HighlightOff,
} from "@mui/icons-material";
import api from "../../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function DashboardOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [tabValue, setTabValue] = useState("Pending");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [errorNotif, setErrorNotif] = useState({
    open: false,
    message: "",
  });
  const [prevStatuses, setPrevStatuses] = useState({});
  const [notif, setNotif] = useState({
    open: false,
    message: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [openChart, setOpenChart] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const costumeTheme = createTheme({
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
    borderRadius: 3,
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

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && JSON.parse(user).name === "admin") {
      navigate("/dashboard/menu");
    }
  });

  const handleAuthNav = (type) => {
    if (type === "login") {
      navigate("/login");
    } else if (type === "register") {
      navigate("/register");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders", {
        headers: {
          Authorization: `bearer ${token}`,
        },
      });

      if (Array.isArray(res.data.data)) {
        const newOrders = res.data.data;

        // Deteksi perubahan status
        newOrders.forEach((order) => {
          const oldStatus = prevStatuses[order.id];
          if (oldStatus && oldStatus !== order.status) {
            setNotif({
              open: true,
              message: `Order Status for ORD-${order.id} change to: ${order.status}`,
            });
          }
        });

        // Update state orders & prevStatuses
        setOrders(newOrders);

        const updatedStatusMap = {};
        newOrders.forEach((o) => (updatedStatusMap[o.id] = o.status));
        setPrevStatuses(updatedStatusMap);
      }
    } catch (err) {
      console.error("Gagal fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [prevStatuses]);

  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleStatusMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;

    try {
      await api.patch(
        `/orders/${selectedOrder.id}`,
        {},
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: newStatus } : o
        )
      );

      handleStatusMenuClose();
    } catch (error) {
      console.log(error);
      setErrorNotif({
        open: true,
        message: "Cannot Cancel Order!",
      });
    }
  };

  const filteredOrders = orders.filter(
    (order) => order.status.toLowerCase() === tabValue.toLowerCase()
  );

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        color: "#ff9800",
        bgcolor: alpha("#ff9800", 0.1),
        icon: Schedule,
      },
      processing: {
        label: "Processing",
        color: "#2196f3",
        bgcolor: alpha("#2196f3", 0.1),
        icon: LocalShipping,
      },
      completed: {
        label: "Completed",
        color: "#4caf50",
        bgcolor: alpha("#4caf50", 0.1),
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        color: "#ff0000ff",
        bgcolor: alpha("#cb0808ff", 0.1),
        icon: HighlightOff,
      },
    };
    return configs[status.toLowerCase()] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <ThemeProvider theme={costumeTheme}>
      <Box
        sx={{
          p: isSmallMobile ? 1 : isMobile ? 2 : 3,
          width: "100vw",
          bgcolor: "#f8f9fa",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartCount}
          setCartCount={setCartCount}
          openCart={openChart}
          setOpenCart={setOpenChart}
          handleAuthNav={handleAuthNav}
        />
        
        {/* Header */}
        <Box sx={{ mb: isMobile ? 3 : 4, mt: isSmallMobile ? 8 : 10 }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: 700,
              mb: 1,
              fontFamily: "Inter, sans-serif",
              background: "#30468b",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: isSmallMobile ? "1.5rem" : "inherit",
            }}
          >
            Dashboard Orders
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              fontFamily: "Inter, sans-serif",
              fontSize: isSmallMobile ? "0.8rem" : "inherit"
            }}
          >
            Kelola dan pantau semua pesanan
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: isMobile ? 2 : 3,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: alpha("#000", 0.08),
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            textColor="primary"
            indicatorColor="primary"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: isSmallMobile ? "0.8rem" : "15px",
                minHeight: isSmallMobile ? 48 : 56,
                transition: "all 0.3s ease",
                px: isSmallMobile ? 1 : 2,
                "&:hover": {
                  bgcolor: alpha("#30468b", 0.04),
                },
              },
              "& .Mui-selected": {
                color: "#30468b",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 3,
              },
            }}
          >
            <Tab
              icon={<Schedule sx={{ fontSize: isSmallMobile ? 16 : 20, mb: 0.5 }} />}
              iconPosition="start"
              label={isSmallMobile ? "Pending" : "Pending"}
              value="Pending"
            />
            <Tab
              icon={<LocalShipping sx={{ fontSize: isSmallMobile ? 16 : 20, mb: 0.5 }} />}
              iconPosition="start"
              label={isSmallMobile ? "Process" : "Processing"}
              value="Processing"
            />
            <Tab
              icon={<CheckCircle sx={{ fontSize: isSmallMobile ? 16 : 20, mb: 0.5 }} />}
              iconPosition="start"
              label={isSmallMobile ? "Done" : "Completed"}
              value="Completed"
            />
            <Tab
              icon={<HighlightOff sx={{ fontSize: isSmallMobile ? 16 : 20, mb: 0.5 }} />}
              iconPosition="start"
              label={isSmallMobile ? "Cancel" : "Cancelled"}
              value="Cancelled"
            />
          </Tabs>
        </Paper>

        {/* Order List */}
        <Fade in timeout={400}>
          <Box>
            {filteredOrders.length === 0 ? (
              <Paper
                sx={{
                  p: isMobile ? 4 : 6,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: alpha("#000", 0.12),
                }}
              >
                <ShoppingBag
                  sx={{ 
                    fontSize: isMobile ? 48 : 64, 
                    color: "text.disabled", 
                    mb: 2 
                  }}
                />
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  color="text.secondary"
                  sx={{ fontFamily: "Inter, sans-serif" }}
                >
                  Tidak ada order {tabValue.toLowerCase()}
                </Typography>
              </Paper>
            ) : (
              filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={order.id}
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: alpha("#000", 0.08),
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      "&:hover": {
                        boxShadow: isMobile ? "0 4px 12px rgba(0,0,0,0.1)" : "0 8px 24px rgba(0,0,0,0.12)",
                        transform: isMobile ? "none" : "translateY(-2px)",
                        borderColor: alpha(statusConfig.color, 0.3),
                      },
                    }}
                  >
                    <CardContent sx={{ 
                      p: isSmallMobile ? 2 : isMobile ? 2.5 : 3 
                    }}>
                      {/* Header Preview */}
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleExpand(order.id)}
                      >
                        <Box
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: isSmallMobile ? 1 : 2,
                            flex: 1
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: statusConfig.bgcolor,
                              width: isSmallMobile ? 40 : 48,
                              height: isSmallMobile ? 40 : 48,
                            }}
                          >
                            <StatusIcon sx={{ 
                              color: statusConfig.color,
                              fontSize: isSmallMobile ? 18 : 24
                            }} />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant={isSmallMobile ? "subtitle1" : "h6"}
                              sx={{
                                fontWeight: 700,
                                fontFamily: "Inter, sans-serif",
                                mb: 0.5,
                                fontSize: isSmallMobile ? "0.9rem" : "inherit",
                              }}
                            >
                              Order #{order.id}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: isSmallMobile ? "column" : "row",
                                alignItems: isSmallMobile ? "flex-start" : "center",
                                gap: isSmallMobile ? 0.5 : 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Person
                                  sx={{ 
                                    fontSize: isSmallMobile ? 12 : 16, 
                                    color: "text.secondary" 
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ 
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: isSmallMobile ? "0.7rem" : "inherit"
                                  }}
                                >
                                  {user?.name || "Tanpa Nama"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <CalendarToday
                                  sx={{ 
                                    fontSize: isSmallMobile ? 10 : 14, 
                                    color: "text.secondary" 
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ 
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: isSmallMobile ? "0.7rem" : "inherit"
                                  }}
                                >
                                  {formatDate(order.created_at)}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <AccessTime
                                  sx={{ 
                                    fontSize: isSmallMobile ? 10 : 14, 
                                    color: "text.secondary" 
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ 
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: isSmallMobile ? "0.7rem" : "inherit"
                                  }}
                                >
                                  {formatTime(order.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        <Stack
                          direction="column"
                          spacing={1}
                          alignItems="flex-end"
                          sx={{ ml: 1 }}
                        >
                          <Box sx={{ textAlign: "right" }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ 
                                fontFamily: "Inter, sans-serif",
                                fontSize: isSmallMobile ? "0.6rem" : "inherit"
                              }}
                            >
                              Total
                            </Typography>
                            <Typography
                              variant={isSmallMobile ? "body2" : "h6"}
                              sx={{
                                fontWeight: 700,
                                color: statusConfig.color,
                                fontFamily: "Inter, sans-serif",
                                fontSize: isSmallMobile ? "0.8rem" : "inherit"
                              }}
                            >
                              Rp {order.total_price.toLocaleString("id-ID")}
                            </Typography>
                          </Box>

                          <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 1 
                          }}>
                            <Chip
                              icon={<StatusIcon sx={{ 
                                fontSize: isSmallMobile ? 14 : 18 
                              }} />}
                              label={isSmallMobile ? statusConfig.label.substring(0, 4) : statusConfig.label}
                              size={isSmallMobile ? "small" : "medium"}
                              sx={{
                                bgcolor: statusConfig.bgcolor,
                                color: statusConfig.color,
                                fontWeight: 600,
                                fontFamily: "Inter, sans-serif",
                                border: `1px solid ${alpha(
                                  statusConfig.color,
                                  0.3
                                )}`,
                                fontSize: isSmallMobile ? "0.7rem" : "inherit",
                                height: isSmallMobile ? 24 : 32,
                                "& .MuiChip-icon": {
                                  color: statusConfig.color,
                                },
                              }}
                            />

                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusMenuOpen(e, order);
                              }}
                              sx={{
                                bgcolor: alpha("#000", 0.04),
                                "&:hover": { bgcolor: alpha("#000", 0.08) },
                              }}
                            >
                              <MoreVert fontSize={isSmallMobile ? "small" : "medium"} />
                            </IconButton>

                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: alpha("#000", 0.04),
                                transition: "all 0.3s ease",
                                "&:hover": { bgcolor: alpha("#000", 0.08) },
                              }}
                            >
                              <ExpandMore
                                sx={{
                                  transform:
                                    expanded === order.id
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                  fontSize: isSmallMobile ? "1rem" : "1.5rem"
                                }}
                              />
                            </IconButton>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Expand Section */}
                      <Collapse in={expanded === order.id} timeout="auto">
                        <Divider sx={{ my: 2 }} />

                        <Box
                          sx={{
                            bgcolor: alpha("#000", 0.02),
                            borderRadius: 3,
                            p: isSmallMobile ? 1.5 : 2,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              fontFamily: "Inter, sans-serif",
                              color: "text.secondary",
                              fontSize: isSmallMobile ? "0.8rem" : "inherit"
                            }}
                          >
                            Items Pesanan ({order.menus?.length || 0})
                          </Typography>

                          <Stack spacing={1.5}>
                            {order.menus?.map((menu, i) => (
                              <Box
                                key={i}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: isSmallMobile ? 1 : 2,
                                  p: isSmallMobile ? 1 : 1.5,
                                  bgcolor: "white",
                                  borderRadius: 3,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                  },
                                }}
                              >
                                <Avatar
                                  src={menu.image_url}
                                  alt={menu.name}
                                  variant="rounded"
                                  sx={{
                                    width: isSmallMobile ? 50 : 60,
                                    height: isSmallMobile ? 50 : 60,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Inter, sans-serif",
                                      mb: 0.5,
                                      fontSize: isSmallMobile ? "0.8rem" : "inherit",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {menu.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ 
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: isSmallMobile ? "0.7rem" : "inherit"
                                    }}
                                  >
                                    {menu.pivot?.quantity}x @ Rp{" "}
                                    {menu.pivot?.unit_price.toLocaleString(
                                      "id-ID"
                                    )}
                                  </Typography>
                                </Box>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontFamily: "Inter, sans-serif",
                                    color: statusConfig.color,
                                    fontSize: isSmallMobile ? "0.8rem" : "inherit",
                                    textAlign: "right",
                                    minWidth: isSmallMobile ? "80px" : "auto",
                                  }}
                                >
                                  Rp{" "}
                                  {menu.pivot?.subtotal_price.toLocaleString(
                                    "id-ID"
                                  )}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        </Fade>

        {/* Status Change Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleStatusMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              mt: 1,
              minWidth: 180,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <MenuItem
            onClick={() => handleStatusChange("cancelled")}
            sx={{
              fontFamily: "Inter, sans-serif",
              "&:hover": { bgcolor: alpha("#990404ff", 0.08) },
            }}
          >
            <Schedule sx={{ mr: 1.5, fontSize: 20, color: "#b00710ff" }} />
            Cancel Order
          </MenuItem>
        </Menu>

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
            sx={{ width: "100%" }}
          >
            {errorNotif.message}
          </Alert>
        </Snackbar>

        <Snackbar
          open={notif.open}
          autoHideDuration={4000}
          onClose={() => setNotif({ ...notif, open: false })}
          anchorOrigin={{ 
            vertical: isMobile ? "bottom" : "top", 
            horizontal: "center" 
          }}
        >
          <Alert
            onClose={() => setNotif({ ...notif, open: false })}
            severity="info"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notif.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}