import { useNavigate } from "react-router-dom";

export default function AuthLanding() {
  const navigate = useNavigate();

  return (
    <main className="login-page role-login-page">
      <section className="login-card role-login-card">
        <div>
          <p className="brand-mark">SFC Family Restaurant</p>
          <h1>Choose your login.</h1>
          <p className="login-note">Customers, admins, and delivery agents now enter from separate pages.</p>
        </div>
        <div className="role-card-grid">
          <button type="button" className="role-card role-card-user" onClick={() => navigate("/user-login")}>
            <span>User</span>
            <strong>Order food</strong>
            <small>Menu, cart, delivery details, and payment checkout.</small>
          </button>
          <button type="button" className="role-card role-card-admin" onClick={() => navigate("/admin-login")}>
            <span>Admin</span>
            <strong>Manage shop</strong>
            <small>Rates, ratings, menu items, orders, and payment issues.</small>
          </button>
          <button type="button" className="role-card role-card-agent" onClick={() => navigate("/delivery-agent-login")}>
            <span>Delivery Agent</span>
            <strong>Deliver orders</strong>
            <small>Claim orders, call customers, collect COD, and mark deliveries complete.</small>
          </button>
        </div>
      </section>
    </main>
  );
}
