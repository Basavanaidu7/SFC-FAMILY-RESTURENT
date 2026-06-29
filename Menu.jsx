import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FoodCard from "../components/FoodCard.jsx";
import { fetchMenu } from "../store/menuSlice.js";

export default function Menu() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.menu);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchMenu());
  }, [dispatch]);

  const categories = useMemo(() => ["All", ...new Set(items.map((item) => item.category?.name || "Menu"))], [items]);
  const filtered = items.filter((item) => (category === "All" || item.category?.name === category) && item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="font-bold uppercase tracking-[0.25em] text-crimson">Customer Ordering Platform</p><h1 className="font-display text-5xl">Menu</h1></div>
        <input className="rounded-2xl border border-black/10 bg-white px-4 py-3" placeholder="Search pizza, chicken, momos..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => <button key={cat} className={`whitespace-nowrap rounded-full px-4 py-2 font-bold ${cat === category ? "bg-crimson text-white" : "bg-white"}`} onClick={() => setCategory(cat)}>{cat}</button>)}
      </div>
      {status === "loading" ? <p className="mt-8 rounded-2xl bg-white p-6">Loading menu...</p> : null}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((item) => <FoodCard key={item._id} item={item} />)}</div>
    </section>
  );
}
