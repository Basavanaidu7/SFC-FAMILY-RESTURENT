import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice.js";

export default function FoodCard({ item }) {
  const dispatch = useDispatch();
  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <img className="h-52 w-full object-cover" src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"} alt={item.name} />
      <div className="grid gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-crimson/10 px-3 py-1 text-xs font-black uppercase text-crimson">{item.category?.name || "Menu"}</span>
            <h3 className="mt-3 font-display text-2xl">{item.name}</h3>
          </div>
          <strong className="rounded-full bg-ink px-3 py-1 text-white">₹{item.price}</strong>
        </div>
        <p className="text-sm leading-6 text-black/65">{item.description}</p>
        <button className="rounded-xl bg-crimson px-4 py-3 font-black text-white" onClick={() => dispatch(addToCart(item))}>Add to Cart</button>
      </div>
    </article>
  );
}
