import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserPortal from "./pages/UserPortal";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderStatus from "./pages/OrderStatus";
import RequestItem from "./pages/RequestItem";
import VendorDashboard from "./pages/VendorDashboard";
import AddItem from "./pages/AddItem";
import AdminDashboard from "./pages/AdminDashboard";

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <Login />
            ) : user.role === "admin" ? (
              <Navigate to="/admin" />
            ) : user.role === "vendor" ? (
              <Navigate to="/vendor" />
            ) : (
              <Navigate to="/portal" />
            )
          }
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "admin" ? (
              <Navigate to="/admin" />
            ) : user.role === "vendor" ? (
              <Navigate to="/vendor" />
            ) : (
              <Navigate to="/portal" />
            )
          }
        />
        <Route
          path="/portal"
          element={
            <PrivateRoute roles={["user"]}>
              <UserPortal />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute roles={["user"]}>
              <Products />
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute roles={["user"]}>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute roles={["user"]}>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <PrivateRoute roles={["user"]}>
              <OrderSuccess />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute roles={["user"]}>
              <OrderStatus />
            </PrivateRoute>
          }
        />
        <Route
          path="/request-item"
          element={
            <PrivateRoute roles={["user"]}>
              <RequestItem />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor"
          element={
            <PrivateRoute roles={["vendor"]}>
              <VendorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/add-item"
          element={
            <PrivateRoute roles={["vendor"]}>
              <AddItem />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
