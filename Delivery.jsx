import { useNavigate } from "react-router-dom";
import { formatPrice, useCheckout } from "../context/CheckoutContext.jsx";

const flowSteps = ["1. Menu", "2. Delivery", "3. Payment", "4. Success"];
const deliveryFields = [
  ["fullName", "Customer full name", "Customer name"],
  ["mobile", "Mobile number", "10 digit mobile number", "tel", "numeric"],
  ["alternateMobile", "Alternate mobile number", "Optional alternate number", "tel", "numeric"],
  ["addressLine", "Address line", "House number, street, apartment", "text", undefined, true],
  ["area", "Area / Locality", "Area or landmark"],
  ["city", "City", "City"],
  ["pincode", "Pincode", "6 digit pincode", "text", "numeric"],
  ["instructions", "Delivery instructions", "Optional note for rider", "text", undefined, true],
];

export default function Delivery() {
  const { cart, customerDetails, customerValidationMessage, deliveryAddressSummary, deliveryDistanceKm, deliveryAvailable, deliveryAvailabilityMessage, orderMessage, itemCount, subtotal, deliveryFee, taxes, total, updateCustomerDetail, setOrderMessage } = useCheckout();
  const navigate = useNavigate();
  const summaryRows = [
    ["Payment", "Choose after delivery details"],
    ["Customer mobile", customerDetails.mobile || "Not added yet"],
    ["Delivery city", customerDetails.city || "Not added yet"],
    ["Delivery address", deliveryAddressSummary],
    ["Delivery distance", deliveryDistanceKm === null ? "Location needed" : `${deliveryDistanceKm} km`],
  ];
  const billRows = [
    ["Subtotal", subtotal],
    ["Delivery", deliveryFee],
    ["Taxes", taxes],
    ["Grand Total", total],
  ];
  const handleContinueToPayment = () => {
    if (cart.length === 0) return setOrderMessage("Add items to the cart before choosing payment.");
    if (customerValidationMessage) return setOrderMessage(customerValidationMessage);
    if (!deliveryAvailable) return setOrderMessage(deliveryAvailabilityMessage);
    navigate("/payment");
  };

  return (
    <main className="home-page">
      <header className="home-topbar">
        <div>
          <p className="brand-mark">SFC Family Restaurant</p>
          <h1 className="page-title">Customer details for delivery.</h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="secondary-button" onClick={() => navigate("/home")}>Back to Menu</button>
        </div>
      </header>

      <div className="flow-steps">
        {flowSteps.map((step, index) => <div key={step} className={index === 1 ? "flow-step flow-step-active" : "flow-step"}>{step}</div>)}
      </div>

      <section className="flow-layout">
        <article className="utility-card">
          <div className="flow-card-header">
            <div>
              <p className="section-kicker">Customer Profile</p>
              <h2>Full customer details for delivery calling</h2>
              <p className="section-copy">Fill customer profile and complete address details so delivery partners can contact and deliver without confusion.</p>
            </div>
            <span className="status-chip">Profile form</span>
          </div>

          {orderMessage ? <p className="info-banner">{orderMessage}</p> : null}
          {cart.length === 0 ? (
            <div className="empty-state cart-empty">
              <h3>No items are waiting for delivery</h3>
              <p>Go back to the menu and add items to start a new order.</p>
            </div>
          ) : (
            <div className="customer-form-grid">
              {deliveryFields.map(([field, label, placeholder, type = "text", inputMode, wide]) => (
                <label key={field} className={wide ? "field-stack customer-form-span" : "field-stack"}>
                  <span>{label}</span>
                  <input type={type} inputMode={inputMode} placeholder={placeholder} value={customerDetails[field]} onChange={(event) => updateCustomerDetail(field, event.target.value)} />
                </label>
              ))}
            </div>
          )}
          {customerValidationMessage ? <p className="payment-hint">{customerValidationMessage}</p> : !deliveryAvailable ? <p className="payment-hint">{deliveryAvailabilityMessage}</p> : <p className="payment-hint payment-hint-success">{deliveryAvailabilityMessage}</p>}
        </article>

        <aside className="cart-panel cart-panel-bottom">
          <div className="cart-header">
            <div>
              <p className="section-kicker">Delivery Review</p>
              <h2>{itemCount} item{itemCount === 1 ? "" : "s"} ready</h2>
            </div>
            <p className="cart-total">{formatPrice(total)}</p>
          </div>

          <div className="summary-stack">
            {summaryRows.map(([label, value]) => (
              <div className="summary-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="bill-breakdown">
            {billRows.map(([label, value]) => (
              <div key={label} className={label === "Grand Total" ? "bill-total" : undefined}>
                <span>{label}</span>
                <strong>{formatPrice(value)}</strong>
              </div>
            ))}
          </div>

          <div className="cart-actions">
            <button type="button" onClick={handleContinueToPayment} disabled={cart.length === 0}>Continue to Payment</button>
            <button type="button" className="secondary-button" onClick={() => navigate("/home")}>Edit Cart</button>
          </div>
        </aside>
      </section>
    </main>
  );
}
