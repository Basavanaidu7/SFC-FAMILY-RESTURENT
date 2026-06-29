import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changeQuantity, clearCart, selectCartTotals } from "../store/cartSlice.js";
import { endpoints } from "../services/api.js";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const items = useSelector((state) => state.cart.items);
  const totals = useSelector(selectCartTotals);

  async function placeOrder() {
    if (!user) return navigate("/login");
    await endpoints.createOrder({ items: items.map(({ foodItem, quantity }) => ({ foodItem, quantity })), fulfillmentType: "delivery" });
    dispatch(clearCart());
    navigate("/profile");
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-5xl">Cart & Checkout</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3">
          {items.length === 0 ? <div className="rounded-2xl bg-white p-8">Your cart is empty.</div> : items.map((item) => (
            <article key={item.foodItem} className="flex items-center justify-between rounded-2xl bg-white p-5">
              <div><strong>{item.name}</strong><p className="text-black/60">₹{item.price} x {item.quantity}</p></div>
              <div className="flex items-center gap-2">
                <button className="rounded-full bg-black px-3 py-1 text-white" onClick={() => dispatch(changeQuantity({ id: item.foodItem, delta: -1 }))}>-</button>
                <button className="rounded-full bg-crimson px-3 py-1 text-white" onClick={() => dispatch(changeQuantity({ id: item.foodItem, delta: 1 }))}>+</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="rounded-2xl bg-ink p-6 text-white">
          <h2 className="font-display text-3xl">Bill Summary</h2>
          {Object.entries(totals).map(([key, value]) => <div key={key} className="mt-4 flex justify-between capitalize"><span>{key}</span><strong>₹{value}</strong></div>)}
          <div className="mt-5 rounded-2xl bg-white/10 p-4">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Payment</span>
            <strong className="mt-1 block text-lg">Cash on Delivery Only</strong>
          </div>
          <button disabled={!items.length} className="mt-6 w-full rounded-xl bg-crimson py-3 font-black disabled:opacity-50" onClick={placeOrder}>Place COD Order</button>
        </aside>
      </div>
    </section>
  );
}
