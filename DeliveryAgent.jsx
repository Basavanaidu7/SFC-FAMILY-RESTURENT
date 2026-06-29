import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../context/CheckoutContext.jsx";
import { clearAgentSession, isAllowedAgentAccount, readAgentSession } from "../lib/agentSession.js";
import { auth, db } from "../lib/firebase.js";

const availableStatuses = ["placed", "accepted"];
const activeStatuses = ["assigned", "out_for_delivery"];

function toMillis(value) {
  if (!value) {
    return 0;
  }
  if (typeof value === "string") {
    return new Date(value).getTime();
  }
  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return 0;
}

function toDateLabel(value) {
  if (!value) {
    return "Time not available";
  }
  if (typeof value === "string") {
    return new Date(value).toLocaleString();
  }
  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleString();
  }
  return "Time not available";
}

function normalizeOrder(id, data) {
  return {
    id,
    ...data,
    status: data.status ?? "placed",
    deliveryStatus: data.deliveryStatus ?? data.status ?? "placed",
    createdMs: toMillis(data.createdAt),
  };
}

function getAgentEarning(order) {
  return Number(order.deliveryFee ?? 39);
}

function isSameDay(timestamp, date) {
  const orderDate = new Date(timestamp);
  return orderDate.getFullYear() === date.getFullYear() && orderDate.getMonth() === date.getMonth() && orderDate.getDate() === date.getDate();
}

function isSameMonth(timestamp, date) {
  const orderDate = new Date(timestamp);
  return orderDate.getFullYear() === date.getFullYear() && orderDate.getMonth() === date.getMonth();
}

function getOrderAddress(order) {
  if (order.delivery?.address) {
    return order.delivery.address;
  }
  const customer = order.customer ?? {};
  return [customer.addressLine, customer.area, customer.city, customer.pincode].filter(Boolean).join(", ") || "Address not available";
}

function getOrderItems(order) {
  return order.items?.map((item) => `${item.quantity} x ${item.name}`).join(", ") || "No items";
}

function belongsToAgent(order, agentUser) {
  return Boolean(agentUser?.email && order.deliveryAgent?.email === agentUser.email);
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Location is not supported in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 });
  });
}

function buildLocationPayload(position) {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: Math.round(position.coords.accuracy),
    updatedAt: serverTimestamp(),
  };
}

function buildLocationView(position) {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: Math.round(position.coords.accuracy),
    updatedAt: new Date().toISOString(),
  };
}

function getDirectionsUrl(order) {
  const location = order.deliveryAgent?.currentLocation;
  const destination = encodeURIComponent(getOrderAddress(order));
  const origin = location?.latitude && location?.longitude ? `&origin=${location.latitude},${location.longitude}` : "";
  return `https://www.google.com/maps/dir/?api=1${origin}&destination=${destination}&travelmode=driving`;
}

export default function DeliveryAgent() {
  const navigate = useNavigate();
  const [agentUser, setAgentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [agentMessage, setAgentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setAgentMessage("");
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const nextOrders = snapshot.docs.map((orderDoc) => normalizeOrder(orderDoc.id, orderDoc.data())).sort((a, b) => b.createdMs - a.createdMs);
      setOrders(nextOrders);
      setAgentMessage("Delivery orders refreshed.");
    } catch (error) {
      setAgentMessage(error instanceof Error ? error.message : "Delivery orders could not load. Deploy Firestore rules and refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      void (async () => {
        const session = readAgentSession();
        const userEmail = user?.email || "";
        const activeAgent = user && session ? await isAllowedAgentAccount(userEmail) : null;
        if (!user || !session || !activeAgent) {
          clearAgentSession();
          setAgentUser(null);
          setAuthChecked(true);
          navigate("/delivery-agent-login", { replace: true });
          return;
        }
        setAgentUser(user);
        setAuthChecked(true);
        void loadOrders();
      })();
    });
  }, [loadOrders, navigate]);

  const availableOrders = useMemo(
    () => orders.filter((order) => availableStatuses.includes(order.status) && !order.deliveryAgent?.email),
    [orders],
  );
  const myActiveOrders = useMemo(
    () => orders.filter((order) => belongsToAgent(order, agentUser) && activeStatuses.includes(order.status)),
    [agentUser, orders],
  );
  const myCompletedOrders = useMemo(
    () => orders.filter((order) => belongsToAgent(order, agentUser) && order.status === "delivered"),
    [agentUser, orders],
  );
  const today = new Date();
  const todayEarnings = myCompletedOrders
    .filter((order) => isSameDay(toMillis(order.deliveryAgent?.deliveredAt || order.updatedAt || order.createdAt), today))
    .reduce((sum, order) => sum + getAgentEarning(order), 0);
  const monthEarnings = myCompletedOrders
    .filter((order) => isSameMonth(toMillis(order.deliveryAgent?.deliveredAt || order.updatedAt || order.createdAt), today))
    .reduce((sum, order) => sum + getAgentEarning(order), 0);
  const codToCollect = myActiveOrders
    .filter((order) => order.payment?.method === "cod" && order.payment?.status !== "cash_collected")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const visibleOrders = activeTab === "available" ? availableOrders : activeTab === "active" ? myActiveOrders : myCompletedOrders;

  const updateOrder = async (order, payload, successMessage) => {
    setUpdatingOrderId(order.id);
    setAgentMessage("");
    try {
      await updateDoc(doc(db, "orders", order.id), { ...payload, updatedAt: serverTimestamp() });
      setAgentMessage(successMessage);
      await loadOrders();
    } catch (error) {
      setAgentMessage(error instanceof Error ? error.message : "Order could not be updated.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  useEffect(() => {
    if (!agentUser || myActiveOrders.length === 0 || !("geolocation" in navigator)) {
      return undefined;
    }
    let lastLocationUpdate = 0;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(buildLocationView(position));
        const now = Date.now();
        if (now - lastLocationUpdate < 15000) {
          return;
        }
        lastLocationUpdate = now;
        const locationPayload = buildLocationPayload(position);
        myActiveOrders.forEach((order) => {
          void updateDoc(doc(db, "orders", order.id), {
            "deliveryAgent.currentLocation": locationPayload,
            "deliveryAgent.isOnline": true,
            "deliveryAgent.lastSeenAt": serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
      },
      () => {
        setAgentMessage("Allow location permission so customers can track delivery live.");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 },
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [agentUser, myActiveOrders]);

  const claimOrder = async (order) => {
    let locationPayload = null;
    try {
      const position = await getCurrentPosition();
      locationPayload = buildLocationPayload(position);
      setCurrentLocation(buildLocationView(position));
    } catch {
      setAgentMessage("Order can be claimed, but allow location permission for live tracking.");
    }
    void updateOrder(
      order,
      {
        status: "assigned",
        deliveryStatus: "assigned",
        "deliveryAgent.uid": agentUser.uid,
        "deliveryAgent.email": agentUser.email,
        "deliveryAgent.name": agentUser.displayName || agentUser.email,
        "deliveryAgent.assignedAt": serverTimestamp(),
        "deliveryAgent.currentLocation": locationPayload,
        "deliveryAgent.isOnline": Boolean(locationPayload),
        "deliveryAgent.lastSeenAt": serverTimestamp(),
        "deliveryAgent.earningAmount": getAgentEarning(order),
      },
      "Order claimed for delivery.",
    );
  };

  const markPickedUp = (order) => {
    void updateOrder(
      order,
      {
        status: "out_for_delivery",
        deliveryStatus: "out_for_delivery",
        "deliveryAgent.pickedUpAt": serverTimestamp(),
      },
      "Order marked out for delivery.",
    );
  };

  const markCodCollected = (order) => {
    void updateOrder(
      order,
      {
        "payment.status": "cash_collected",
        "payment.collectedBy": agentUser.email,
        "payment.collectedAt": serverTimestamp(),
      },
      "COD payment marked collected.",
    );
  };

  const markDelivered = (order) => {
    if (order.payment?.method === "cod" && order.payment?.status !== "cash_collected") {
      setAgentMessage("Collect COD payment before marking this order delivered.");
      return;
    }
    void updateOrder(
      order,
      {
        status: "delivered",
        deliveryStatus: "delivered",
        "deliveryAgent.deliveredAt": serverTimestamp(),
        "deliveryAgent.isOnline": false,
      },
      "Order marked delivered.",
    );
  };

  const signOutAgent = async () => {
    clearAgentSession();
    await signOut(auth);
    navigate("/delivery-agent-login", { replace: true });
  };

  if (!authChecked) {
    return (
      <main className="login-page">
        <section className="login-card">
          <p className="brand-mark">SFC Delivery</p>
          <h1>Checking delivery access</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="home-page admin-page agent-page">
      <header className="home-topbar admin-topbar">
        <div>
          <p className="brand-mark">SFC Delivery</p>
          <h1 className="page-title">Delivery agent dashboard.</h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="secondary-button" onClick={() => navigate("/")}>Login Options</button>
          <button type="button" className="secondary-button" onClick={signOutAgent}>Agent Logout</button>
          <button type="button" onClick={loadOrders} disabled={isLoading}>{isLoading ? "Refreshing..." : "Refresh Orders"}</button>
        </div>
      </header>

      {agentUser ? <p className="info-banner">Delivery agent signed in as {agentUser.email}.</p> : null}
      {agentMessage ? <p className="info-banner">{agentMessage}</p> : null}

      <section className="admin-metric-grid agent-metric-grid">
        <article>
          <span>Available orders</span>
          <strong>{availableOrders.length}</strong>
        </article>
        <article>
          <span>My active orders</span>
          <strong>{myActiveOrders.length}</strong>
        </article>
        <article>
          <span>Completed today</span>
          <strong>{myCompletedOrders.length}</strong>
        </article>
        <article>
          <span>Today earnings</span>
          <strong>{formatPrice(todayEarnings)}</strong>
        </article>
        <article>
          <span>Monthly earnings</span>
          <strong>{formatPrice(monthEarnings)}</strong>
        </article>
        <article className={codToCollect > 0 ? "admin-metric-alert" : undefined}>
          <span>COD to collect</span>
          <strong>{formatPrice(codToCollect)}</strong>
        </article>
      </section>

      {currentLocation ? (
        <p className="info-banner">Live location online: {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}. Accuracy about {currentLocation.accuracy}m.</p>
      ) : null}

      <nav className="admin-tabs agent-tabs" aria-label="Delivery sections">
        {[
          ["available", "Available Orders"],
          ["active", "My Deliveries"],
          ["completed", "Completed"],
        ].map(([tabId, label]) => (
          <button key={tabId} type="button" className={activeTab === tabId ? "admin-tab admin-tab-active" : "admin-tab"} onClick={() => setActiveTab(tabId)}>
            {label}
          </button>
        ))}
      </nav>

      <section className="admin-list-card">
        <div className="admin-card-header">
          <div>
            <p className="section-kicker">Delivery Orders</p>
            <h2>{activeTab === "available" ? "Open orders to claim" : activeTab === "active" ? "Orders assigned to you" : "Delivered orders"}</h2>
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders here</h3>
            <p>Refresh after new customer orders are placed or accepted by admin.</p>
          </div>
        ) : (
          <div className="agent-order-grid">
            {visibleOrders.map((order) => (
              <article key={order.id} className="admin-order-card agent-order-card">
                <div className="admin-card-header">
                  <div>
                    <p className="section-kicker">{order.deliveryStatus}</p>
                    <h3>{order.customer?.fullName ?? "Customer"}</h3>
                  </div>
                  <strong>{formatPrice(Number(order.total ?? 0))}</strong>
                </div>

                <div className="recent-order-grid">
                  <div>
                    <span>Mobile</span>
                    <strong>{order.customer?.mobile ?? "No mobile"}</strong>
                  </div>
                  <div>
                    <span>Payment</span>
                    <strong>{order.payment?.label ?? "Unknown"}</strong>
                  </div>
                  <div>
                    <span>Payment status</span>
                    <strong>{order.payment?.status ?? "Unknown"}</strong>
                  </div>
                  <div>
                    <span>Delivery earning</span>
                    <strong>{formatPrice(getAgentEarning(order))}</strong>
                  </div>
                  <div>
                    <span>Placed</span>
                    <strong>{toDateLabel(order.createdAt)}</strong>
                  </div>
                  <div className="recent-order-span">
                    <span>Items</span>
                    <strong>{getOrderItems(order)}</strong>
                  </div>
                  <div className="recent-order-span">
                    <span>Delivery address</span>
                    <strong>{getOrderAddress(order)}</strong>
                  </div>
                </div>

                <div className="admin-action-row">
                  {activeTab === "available" ? (
                    <button type="button" className="compact-button" onClick={() => void claimOrder(order)} disabled={updatingOrderId === order.id}>
                      {updatingOrderId === order.id ? "Claiming..." : "Claim Order"}
                    </button>
                  ) : null}
                  {activeTab !== "completed" ? (
                    <a className="success-link" href={getDirectionsUrl(order)} target="_blank" rel="noreferrer">Open Directions</a>
                  ) : null}
                  {activeTab === "active" && order.status === "assigned" ? (
                    <button type="button" className="compact-button" onClick={() => markPickedUp(order)} disabled={updatingOrderId === order.id}>
                      Picked Up
                    </button>
                  ) : null}
                  {activeTab === "active" && order.payment?.method === "cod" && order.payment?.status !== "cash_collected" ? (
                    <button type="button" className="secondary-button compact-button" onClick={() => markCodCollected(order)} disabled={updatingOrderId === order.id}>
                      COD Collected
                    </button>
                  ) : null}
                  {activeTab === "active" ? (
                    <button type="button" className="secondary-button compact-button" onClick={() => markDelivered(order)} disabled={updatingOrderId === order.id}>
                      Delivered
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
