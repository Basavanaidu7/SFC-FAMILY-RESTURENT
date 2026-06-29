import { ShoppingBag, UserRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice.js";

const nav = ["menu", "offers", "reservation", "contact"];

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const itemCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="leading-tight">
            <strong className="font-display text-2xl text-crimson">SFC Family Restaurant</strong>
            <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-black/60">Where Taste Meets Tradition</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink key={item} to={`/${item}`} className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-bold capitalize ${isActive ? "bg-crimson text-white" : "hover:bg-black/5"}`}>
                {item}
              </NavLink>
            ))}
            {user?.role !== "customer" && user ? <NavLink to="/admin" className="rounded-full px-4 py-2 text-sm font-bold hover:bg-black/5">Admin</NavLink> : null}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative rounded-full bg-ink p-3 text-white">
              <ShoppingBag size={18} />
              {itemCount ? <span className="absolute -right-1 -top-1 rounded-full bg-crimson px-1.5 text-xs font-black">{itemCount}</span> : null}
            </Link>
            {user ? (
              <button className="rounded-full border border-black/10 px-4 py-2 text-sm font-bold" onClick={() => dispatch(logout())}>Logout</button>
            ) : (
              <Link to="/login" className="rounded-full bg-crimson px-4 py-2 text-sm font-bold text-white"><UserRound className="mr-2 inline" size={16} />Login</Link>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 bg-ink px-4 py-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <div><h2 className="font-display text-3xl text-white">SFC</h2><p className="text-white/70">Premium family dining, fast delivery, and traditional taste.</p></div>
          <div><strong>Hours</strong><p className="text-white/70">11:00 AM - 11:00 PM, all days</p></div>
          <div><strong>Contact</strong><p className="text-white/70">orders@sfcfamily.example | +91 90000 00000</p></div>
        </div>
      </footer>
    </div>
  );
}
