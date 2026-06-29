import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../store/authSlice.js";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  async function submit(event) {
    event.preventDefault();
    const result = await dispatch(loginUser(form));
    if (!result.error) navigate("/");
  }

  return (
    <section className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-10">
      <form className="w-full rounded-3xl bg-white p-8 shadow-xl" onSubmit={submit}>
        <h1 className="font-display text-4xl">Login</h1>
        <input className="mt-6 w-full rounded-xl border px-4 py-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mt-3 w-full rounded-xl border px-4 py-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <p className="mt-3 text-sm font-bold text-crimson">{error}</p> : null}
        <button className="mt-5 w-full rounded-xl bg-crimson py-3 font-black text-white">{status === "loading" ? "Signing in..." : "Sign In"}</button>
      </form>
    </section>
  );
}
