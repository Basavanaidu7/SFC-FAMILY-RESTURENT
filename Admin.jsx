import { useEffect, useState } from "react";
import { endpoints } from "../services/api.js";

export default function Admin() {
  const [data, setData] = useState({ revenue: 0, orderCount: 0, customers: 0, ordersByStatus: [], reservationsByStatus: [] });
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foodForm, setFoodForm] = useState({ name: "", category: "", description: "", price: "", foodType: "veg", imageUrl: "" });
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    Promise.all([endpoints.analytics(), endpoints.orders(), endpoints.reservations(), endpoints.customers(), endpoints.categories()]).then(([analytics, orderRes, reservationRes, customerRes, categoryRes]) => {
      setData(analytics.data.data);
      setOrders(orderRes.data.data);
      setReservations(reservationRes.data.data);
      setCustomers(customerRes.data.data);
      setCategories(categoryRes.data.data);
    }).catch(() => {});
  }, []);

  async function addCategory(event) {
    event.preventDefault();
    const { data: result } = await endpoints.createCategory({ name: categoryName });
    setCategories((items) => [...items, result.data]);
    setCategoryName("");
  }

  async function addFood(event) {
    event.preventDefault();
    await endpoints.createFood({ ...foodForm, price: Number(foodForm.price), tags: ["SFC"] });
    setFoodForm({ name: "", category: "", description: "", price: "", foodType: "veg", imageUrl: "" });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <p className="font-bold uppercase tracking-[0.25em] text-crimson">Restaurant Management System</p>
      <h1 className="font-display text-5xl">Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="Revenue" value={`₹${data.revenue}`} />
        <Metric label="Orders" value={data.orderCount} />
        <Metric label="Customers" value={data.customers} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Order Management" rows={orders.map((o) => `${o.orderNumber} - ${o.status} - ₹${o.grandTotal}`)} />
        <Panel title="Table Reservations" rows={reservations.map((r) => `${r.name} - ${r.timeSlot} - ${r.status}`)} />
        <Panel title="Customer Management" rows={customers.map((c) => `${c.name} - ${c.mobile} - ${c.email}`)} />
        <Panel title="Analytics & Revenue Reporting" rows={data.ordersByStatus.map((row) => `${row._id}: ${row.count}`)} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form className="rounded-2xl bg-white p-6 shadow-sm" onSubmit={addCategory}>
          <h2 className="font-display text-3xl">Category Management</h2>
          <input className="mt-4 w-full rounded-xl border px-4 py-3" placeholder="Category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
          <button className="mt-4 rounded-xl bg-crimson px-5 py-3 font-black text-white">Add Category</button>
        </form>
        <form className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm" onSubmit={addFood}>
          <h2 className="font-display text-3xl">Menu Management</h2>
          <input className="rounded-xl border px-4 py-3" placeholder="Food name" value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} required />
          <select className="rounded-xl border px-4 py-3" value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })} required>
            <option value="">Select category</option>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          <input className="rounded-xl border px-4 py-3" placeholder="Price" type="number" value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} required />
          <select className="rounded-xl border px-4 py-3" value={foodForm.foodType} onChange={(e) => setFoodForm({ ...foodForm, foodType: e.target.value })}>
            <option value="veg">Veg</option><option value="non-veg">Non-Veg</option><option value="egg">Egg</option>
          </select>
          <input className="rounded-xl border px-4 py-3" placeholder="Image URL" value={foodForm.imageUrl} onChange={(e) => setFoodForm({ ...foodForm, imageUrl: e.target.value })} />
          <textarea className="rounded-xl border px-4 py-3" placeholder="Description" value={foodForm.description} onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })} required />
          <button className="rounded-xl bg-crimson px-5 py-3 font-black text-white">Add Food Item</button>
        </form>
      </div>
    </section>
  );
}
function Metric({ label, value }) {
  return <article className="rounded-2xl bg-white p-6 shadow-sm"><span className="text-sm font-black uppercase text-black/50">{label}</span><strong className="mt-2 block text-3xl">{value}</strong></article>;
}
function Panel({ title, rows }) {
  return <article className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="font-display text-3xl">{title}</h2><div className="mt-4 grid gap-2">{rows.length ? rows.map((row, i) => <p key={i} className="rounded-xl bg-cream p-3 text-sm font-semibold">{row}</p>) : <p className="text-black/60">No records yet.</p>}</div></article>;
}
