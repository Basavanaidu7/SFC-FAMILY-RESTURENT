import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice, paymentOptions, useCheckout } from "../context/CheckoutContext.jsx";

export default function Payment() {
  const {
    cart,
    paymentMethod,
    customerDetails,
    customerValidationMessage,
    deliveryAddressSummary,
    deliveryDistanceKm,
    deliveryAvailable,
    deliveryAvailabilityMessage,
    orderMessage,
    isPlacingOrder,
    itemCount,
    subtotal,
    deliveryFee,
    taxes,
    total,
    paymentValidationMessage,
    setPaymentMethod,
    setOrderMessage,
    placeOrder,
  } = useCheckout();
  const navigate = useNavigate();
  const selectedPaymentOption = paymentOptions.find((option) => option.id === paymentMethod) ?? paymentOptions[0];

  useEffect(() => {
    if (paymentMethod !== "cod") {
      setPaymentMethod("cod");
    }
  }, [paymentMethod, setPaymentMethod]);

  const handlePlaceOrder = async () => {
    if (customerValidationMessage) {
      setOrderMessage(customerValidationMessage);
      return;
    }
    if (!deliveryAvailable) {
      setOrderMessage(deliveryAvailabilityMessage);
      return;
    }
    if (paymentValidationMessage) {
      setOrderMessage(paymentValidationMessage);
      return;
    }
    const success = await placeOrder();
    if (success) {
      navigate("/success");
    }
  };

  return (
    <main className="home-page">
      <header className="home-topbar">
        <div>
          <p className="brand-mark">SFC Family Restaurant</p>
          <h1 className="page-title">Confirm cash on delivery.</h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="secondary-button" onClick={() => navigate("/delivery")}>
            Back to Delivery
          </button>
        </div>
      </header>
      <div className="flow-steps">
        <div className="flow-step">1. Menu</div>
        <div className="flow-step">2. Delivery</div>
        <div className="flow-step flow-step-active">3. Payment</div>
        <div className="flow-step">4. Success</div>
      </div>
      <section className="flow-layout">
        <article className="flow-card">
          <div className="flow-card-header">
            <div>
              <p className="section-kicker">Payment Screen</p>
              <h2>{selectedPaymentOption.title}</h2>
              <p className="section-copy">Online payment and card details are removed. The rider will collect the bill amount at delivery.</p>
            </div>
            <span className="status-chip">{selectedPaymentOption.label} ready</span>
          </div>
          {orderMessage ? <p className="info-banner">{orderMessage}</p> : null}
          {cart.length === 0 ? (
            <div className="empty-state">
              <h3>Your cart is empty</h3>
              <p>Add dishes from the menu before placing an order.</p>
            </div>
          ) : (
            <>
              <div className="payment-grid">
                {paymentOptions.map((option) => (
                  <button key={option.id} type="button" className="payment-option payment-option-active" onClick={() => setPaymentMethod(option.id)}>
                    <span className="payment-pill">{option.label}</span>
                    <strong>{option.title}</strong>
                    <p>{option.description}</p>
                  </button>
                ))}
              </div>
              <div className="highlight-panel">
                <p className="section-kicker">Cash on Delivery</p>
                <h3>Payment will be collected at the doorstep.</h3>
                <p>No online payment details are needed for this order.</p>
              </div>
              {customerValidationMessage ? (
                <p className="payment-hint">Complete delivery details before placing the order.</p>
              ) : !deliveryAvailable ? (
                <p className="payment-hint">{deliveryAvailabilityMessage}</p>
              ) : (
                <p className="payment-hint payment-hint-success">Cash on delivery is ready. Place the order to finish checkout.</p>
              )}
            </>
          )}
        </article>
        <aside className="cart-panel">
          <div className="cart-header">
            <div>
              <p className="section-kicker">Order Snapshot</p>
              <h2>
                {itemCount} item{itemCount === 1 ? "" : "s"} in cart
              </h2>
            </div>
            <p className="cart-total">{formatPrice(total)}</p>
          </div>
          {cart.length === 0 ? (
            <div className="empty-state cart-empty">
              <h3>Nothing to pay yet</h3>
              <p>Return to the menu page and add items before payment.</p>
            </div>
          ) : (
            <>
              <div className="summary-stack">
                {cart.map((item) => (
                  <div key={item.id} className="summary-row">
                    <span>
                      {item.quantity} x {item.name}
                    </span>
                    <strong>{formatPrice(item.quantity * item.price)}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-stack">
                <div className="summary-row">
                  <span>Customer</span>
                  <strong>{customerDetails.fullName || "Not added yet"}</strong>
                </div>
                <div className="summary-row">
                  <span>Mobile</span>
                  <strong>{customerDetails.mobile || "Not added yet"}</strong>
                </div>
                <div className="summary-row">
                  <span>Delivery address</span>
                  <strong>{deliveryAddressSummary}</strong>
                </div>
                <div className="summary-row">
                  <span>Delivery distance</span>
                  <strong>{deliveryDistanceKm === null ? "Location needed" : `${deliveryDistanceKm} km`}</strong>
                </div>
              </div>
            </>
          )}
          <div className="bill-breakdown">
            <div>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{formatPrice(deliveryFee)}</strong>
            </div>
            <div>
              <span>Taxes</span>
              <strong>{formatPrice(taxes)}</strong>
            </div>
            <div className="bill-total">
              <span>Grand Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>
          <div className="cart-actions">
            <button type="button" onClick={handlePlaceOrder} disabled={cart.length === 0 || isPlacingOrder}>
              {isPlacingOrder ? "Placing Order..." : "Place COD Order"}
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate("/delivery")}>
              Edit Delivery Details
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
