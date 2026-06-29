import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../services/api.js";

export default function Reservation() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "", mobile: user?.mobile || "", partySize: 2, reservationDate: "", timeSlot: "19:00", specialRequest: "" });
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!user) return navigate("/login");
    await endpoints.reserve(form);
    setMessage("Reservation requested. Our team will confirm soon.");
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-5xl">Table Reservation</h1>
      <form className="mt-8 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2" onSubmit={submit}>
        {["name", "mobile", "reservationDate", "timeSlot"].map((field) => <input key={field} className="rounded-xl border border-black/10 px-4 py-3" type={field === "reservationDate" ? "date" : field === "timeSlot" ? "time" : "text"} placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required />)}
        <input className="rounded-xl border border-black/10 px-4 py-3" type="number" min="1" max="30" value={form.partySize} onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })} />
        <textarea className="rounded-xl border border-black/10 px-4 py-3 md:col-span-2" placeholder="Special request" value={form.specialRequest} onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} />
        <button className="rounded-xl bg-crimson px-5 py-3 font-black text-white md:col-span-2">Reserve Table</button>
        {message ? <p className="font-bold text-crimson md:col-span-2">{message}</p> : null}
      </form>
    </section>
  );
}
