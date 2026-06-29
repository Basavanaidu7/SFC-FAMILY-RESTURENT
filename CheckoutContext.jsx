/* eslint-disable react-refresh/only-export-components */ import { createContext, useContext, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase.js";
import { recordPaymentIssue } from "../lib/paymentIssues.js";
import { getDeliveryQuote, parseLocationLabel, storeLocation } from "../lib/deliveryPricing.js";
import { readLastOrder, readUserProfile, saveLastOrder, saveUserProfile } from "../lib/userProfile.js";
export const paymentOptions = [
  { id: "cod", label: "COD", title: "Cash on delivery", description: "Let customers pay when the rider hands over the order at the door." },
];
const CheckoutContext = createContext(null);
function getInitialCustomerDetails() {
  const profile = readUserProfile();
  return {
    fullName: profile.fullName,
    mobile: profile.mobile,
    alternateMobile: profile.alternateMobile,
    addressLine: profile.addressLine,
    area: profile.area,
    city: profile.city,
    pincode: profile.pincode,
    instructions: "",
  };
}
function getPaymentMethodLabel(method) {
  switch (method) {
    case "cod":
      return "Cash on Delivery";
    default:
      return "Cash on Delivery";
  }
}
function normalizeDigits(value) {
  return value.replace(/\D/g, "");
}
function getPaymentValidationMessage() {
  return null;
}
function getCustomerValidationMessage(customer) {
  if (!customer.fullName.trim()) {
    return "Enter customer full name.";
  }
  if (normalizeDigits(customer.mobile).length !== 10) {
    return "Enter a valid 10-digit customer mobile number.";
  }
  if (!customer.addressLine.trim()) {
    return "Enter delivery address.";
  }
  if (!customer.area.trim()) {
    return "Enter area/locality.";
  }
  if (!customer.city.trim()) {
    return "Enter city.";
  }
  if (normalizeDigits(customer.pincode).length !== 6) {
    return "Enter a valid 6-digit pincode.";
  }
  return null;
}
function getPaymentDetailSummary(method) {
  switch (method) {
    case "cod":
      return "Cash on delivery";
    default:
      return "Cash on delivery";
  }
}
function buildDeliveryAddress(customer) {
  return `${customer.addressLine.trim()}, ${customer.area.trim()}, ${customer.city.trim()} - ${normalizeDigits(customer.pincode)}`;
}
function getSavedCustomerLocation() {
  const profile = readUserProfile();
  if (Number.isFinite(profile.locationLatitude) && Number.isFinite(profile.locationLongitude)) {
    return { latitude: profile.locationLatitude, longitude: profile.locationLongitude };
  }
  return parseLocationLabel(profile.locationLabel);
}
async function authorizePayment() {
  return { status: "cash_on_delivery", reference: "COD" };
}
export function formatPrice(value) {
  return `Rs ${value}`;
}
export function CheckoutProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customerDetails, setCustomerDetails] = useState(getInitialCustomerDetails);
  const [orderMessage, setOrderMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [lastOrder, setLastOrder] = useState(readLastOrder);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const customerLocation = getSavedCustomerLocation();
  const deliveryQuote = itemCount > 0 ? getDeliveryQuote(customerLocation) : { available: true, distanceKm: null, fee: 0, message: "Add items to check delivery." };
  const deliveryFee = itemCount > 0 && deliveryQuote.available ? deliveryQuote.fee : 0;
  const taxes = itemCount > 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + deliveryFee + taxes;
  const paymentValidationMessage = getPaymentValidationMessage();
  const customerValidationMessage = getCustomerValidationMessage(customerDetails);
  const paymentDetailSummary = getPaymentDetailSummary(paymentMethod);
  const deliveryAddressSummary = customerValidationMessage === null ? buildDeliveryAddress(customerDetails) : "Customer address pending";
  const updateCustomerDetail = (field, value) => {
    setCustomerDetails((prev) => {
      let nextCustomer;
      if (field === "mobile" || field === "alternateMobile") {
        nextCustomer = { ...prev, [field]: normalizeDigits(value).slice(0, 10) };
      } else if (field === "pincode") {
        nextCustomer = { ...prev, pincode: normalizeDigits(value).slice(0, 6) };
      } else {
        nextCustomer = { ...prev, [field]: value };
      }
      if (field !== "instructions") {
        saveUserProfile({ [field]: nextCustomer[field] });
      }
      return nextCustomer;
    });
  };
  const addToCart = async (item) => {
    setCart((prev) => {
      const existingItem = prev.find((entry) => entry.id === item.id);
      if (existingItem) {
        return prev.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setOrderMessage(`${item.name} added to your cart.`);
    try {
      await addDoc(collection(db, "cart"), {
        userId: auth.currentUser?.uid ?? null,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        createdAt: serverTimestamp(),
      });
    } catch {
      setOrderMessage(`${item.name} was added locally. Firebase cart sync is not available right now.`);
    }
  };
  const changeQuantity = (itemId, delta) => {
    setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + delta } : item)).filter((item) => item.quantity > 0));
  };
  const handleSetPaymentMethod = (method) => {
    setPaymentMethod(method === "cod" ? "cod" : "cod");
  };
  const placeOrder = async () => {
    if (cart.length === 0) {
      setOrderMessage("Pick a few dishes before placing your order.");
      return false;
    }
    if (paymentValidationMessage) {
      setOrderMessage(paymentValidationMessage);
      return false;
    }
    if (customerValidationMessage) {
      setOrderMessage(customerValidationMessage);
      return false;
    }
    if (!deliveryQuote.available) {
      setOrderMessage(deliveryQuote.message);
      return false;
    }
    setIsPlacingOrder(true);
    try {
      const payment = await authorizePayment();
      const paymentLabel = getPaymentMethodLabel(paymentMethod);
      const deliveryAddress = buildDeliveryAddress(customerDetails);
      const orderDoc = await addDoc(collection(db, "orders"), {
        userId: auth.currentUser?.uid ?? null,
        items: cart.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
        subtotal,
        deliveryFee,
        taxes,
        total,
        status: "placed",
        deliveryStatus: "placed",
        payment: {
          amount: total,
          method: paymentMethod,
          label: paymentLabel,
          status: payment.status,
          reference: payment.reference,
          details: { collectionMode: "doorstep" },
        },
        customer: {
          fullName: customerDetails.fullName.trim(),
          mobile: customerDetails.mobile,
          alternateMobile: customerDetails.alternateMobile || null,
          addressLine: customerDetails.addressLine.trim(),
          area: customerDetails.area.trim(),
          city: customerDetails.city.trim(),
          pincode: customerDetails.pincode,
          instructions: customerDetails.instructions.trim() || null,
        },
        delivery: {
          address: deliveryAddress,
          source: "customer_details_form",
          distanceKm: deliveryQuote.distanceKm,
          fee: deliveryFee,
          customerLocation,
          storeLocation,
          pricing: { amountPerSegment: 50, segmentKm: 7, maxDistanceKm: 100 },
        },
        createdAt: serverTimestamp(),
      });
      const completedOrder = {
        orderId: orderDoc.id,
        itemCount,
        total,
        paymentLabel,
        paymentDetail: paymentDetailSummary,
        customerName: customerDetails.fullName.trim(),
        customerPhone: customerDetails.mobile,
        deliveryAddress,
        deliveryDistanceKm: deliveryQuote.distanceKm,
        deliveryFee,
      };
      setLastOrder(completedOrder);
      saveLastOrder(completedOrder);
      setCart([]);
      setOrderMessage("Cash on delivery selected. Order placed successfully.");
      return true;
    } catch (error) {
      await recordPaymentIssue({
        type: "order_save_failed",
        message: error instanceof Error ? error.message : "Firebase could not save the order online.",
        paymentMethod,
        paymentLabel: getPaymentMethodLabel(paymentMethod),
        amount: total,
        customerName: customerDetails.fullName.trim(),
        customerMobile: customerDetails.mobile,
        itemCount,
        items: cart.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      });
      setOrderMessage(`The ${getPaymentMethodLabel(paymentMethod)} checkout flow ran, but Firebase could not save the order online. Admin issue logged.`);
      return false;
    } finally {
      setIsPlacingOrder(false);
    }
  };
  return (
    <CheckoutContext.Provider
      value={{
        cart,
        paymentMethod,
        customerDetails,
        orderMessage,
        isPlacingOrder,
        itemCount,
        subtotal,
        deliveryFee,
        deliveryDistanceKm: deliveryQuote.distanceKm,
        deliveryAvailable: deliveryQuote.available,
        deliveryAvailabilityMessage: deliveryQuote.message,
        taxes,
        total,
        paymentValidationMessage,
        customerValidationMessage,
        paymentDetailSummary,
        deliveryAddressSummary,
        lastOrder,
        setPaymentMethod: handleSetPaymentMethod,
        updateCustomerDetail,
        setOrderMessage,
        addToCart,
        changeQuantity,
        placeOrder,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}
export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider.");
  }
  return context;
}
export function getPaymentLabel(method) {
  return getPaymentMethodLabel(method);
}
