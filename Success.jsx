import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { formatPrice, useCheckout } from "../context/CheckoutContext.jsx";
import { db } from "../lib/firebase.js";

const flowSteps = ["1. Menu", "2. Delivery", "3. Payment", "4. Success"];

function toDateLabel(value) {
  if (!value) {
    return "Not updated yet";
  }
  if (typeof value === "string") {
    return new Date(value).toLocaleString();
  }
  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleString();
  }
  return "Not updated yet";
}

function getTrackingStatus(order) {
  switch (order?.status) {
    case "assigned":
      return "Delivery agent assigned";
    case "out_for_delivery":
      return "Delivery agent is on the way";
    case "delivered":
      return "Order delivered";
    case "cancelled":
      return "Order cancelled";
    default:
      return "Waiting for delivery agent";
  }
}

function getMapUrl(location) {
  if (!location?.latitude || !location?.longitude) {
    return "";
  }
  return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
}

export default function Success() {
  const { lastOrder, orderMessage } = useCheckout();
  const navigate = useNavigate();
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingMessage, setTrackingMessage] = useState("");
  useEffect(() => {
    if (!lastOrder?.orderId) {
      return undefined;
    }
    const unsubscribe = onSnapshot(
      doc(db, "orders", lastOrder.orderId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setTrackedOrder(null);
          setTrackingMessage("Live tracking is not available for this order.");
          return;
        }
        setTrackedOrder({ id: snapshot.id, ...snapshot.data() });
        setTrackingMessage("");
      },
      () => {
        setTrackingMessage("Live delivery tracking could not connect.");
      },
    );
    return unsubscribe;
  }, [lastOrder?.orderId]);
  const orderRows = lastOrder
    ? [
        ["Items ordered", lastOrder.itemCount],
        ["Paid with", lastOrder.paymentLabel],
        ["Payment detail", lastOrder.paymentDetail],
        ["Customer name", lastOrder.customerName],
        ["Customer mobile", lastOrder.customerPhone],
        ["Delivery address", lastOrder.deliveryAddress],
        ["Delivery distance", lastOrder.deliveryDistanceKm === null || lastOrder.deliveryDistanceKm === undefined ? "Not available" : `${lastOrder.deliveryDistanceKm} km`],
        ["Delivery charge", formatPrice(lastOrder.deliveryFee ?? 0)],
        ["Tracking ID", lastOrder.orderId ?? "Not available"],
        ["Total", formatPrice(lastOrder.total)],
      ]
    : [];
  const agentLocation = trackedOrder?.deliveryAgent?.currentLocation;
  const agentMapUrl = getMapUrl(agentLocation);

  return (
    <main className="home-page">
      <header className="home-topbar">
        <div>
          <p className="brand-mark">SFC Family Restaurant</p>
          <h1 className="page-title">Order complete.</h1>
        </div>
      </header>

      <div className="flow-steps">
        {flowSteps.map((step, index) => <div key={step} className={index === 3 ? "flow-step flow-step-active" : "flow-step"}>{step}</div>)}
      </div>

      <section className="success-layout">
        <article className="flow-card success-card">
          <p className="section-kicker">Success Screen</p>
          <h2>Your order has been placed.</h2>
          <p className="section-copy">The flow now ends on a dedicated confirmation page instead of dropping you back into the same screen.</p>
          {orderMessage ? <p className="info-banner">{orderMessage}</p> : null}
          {lastOrder ? (
            <div className="summary-stack">
              {orderRows.map(([label, value]) => (
                <div className="summary-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No recent order was found</h3>
              <p>Start from the menu page to create a new order flow.</p>
            </div>
          )}
          {lastOrder?.orderId ? (
            <div className="tracking-panel">
              <div>
                <p className="section-kicker">Live Tracking</p>
                <h3>{getTrackingStatus(trackedOrder)}</h3>
                {trackingMessage ? <p>{trackingMessage}</p> : null}
              </div>
              <div className="recent-order-grid">
                <div>
                  <span>Delivery agent</span>
                  <strong>{trackedOrder?.deliveryAgent?.name || "Not assigned yet"}</strong>
                </div>
                <div>
                  <span>Agent online</span>
                  <strong>{trackedOrder?.deliveryAgent?.isOnline ? "Online" : trackedOrder?.status === "delivered" ? "Completed" : "Waiting"}</strong>
                </div>
                <div>
                  <span>Delivery status</span>
                  <strong>{trackedOrder?.deliveryStatus || trackedOrder?.status || "placed"}</strong>
                </div>
                <div>
                  <span>Last location update</span>
                  <strong>{toDateLabel(agentLocation?.updatedAt || trackedOrder?.deliveryAgent?.lastSeenAt)}</strong>
                </div>
                <div className="recent-order-span">
                  <span>Agent location</span>
                  <strong>{agentLocation ? `${agentLocation.latitude.toFixed(5)}, ${agentLocation.longitude.toFixed(5)}` : "Agent location will appear after order claim."}</strong>
                </div>
              </div>
              {agentMapUrl ? <a className="success-link" href={agentMapUrl} target="_blank" rel="noreferrer">View Delivery Agent on Map</a> : null}
            </div>
          ) : null}
          <div className="success-actions">
            <button type="button" onClick={() => navigate("/home")}>Order Again</button>
          </div>
        </article>
      </section>
    </main>
  );
}
