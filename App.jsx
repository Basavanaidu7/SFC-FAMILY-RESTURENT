import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Admin from "./pages/Admin.jsx";
import Cart from "./pages/Cart.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Menu from "./pages/Menu.jsx";
import Reservation from "./pages/Reservation.jsx";
import { Contact, Offers, Profile } from "./pages/SimplePages.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Cart />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin", "manager", "staff"]}><Admin /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Layout>
  );
}
