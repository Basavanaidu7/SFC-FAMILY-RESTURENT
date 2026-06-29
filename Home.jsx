import { Link } from "react-router-dom";
import { CalendarCheck, ChefHat, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="py-10">
        <p className="font-bold uppercase tracking-[0.3em] text-crimson">Premium Family Restaurant</p>
        <h1 className="mt-4 font-display text-5xl leading-tight md:text-7xl">SFC Family Restaurant</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-black/70">Where Taste Meets Tradition. Order signature fried chicken, pizzas, wraps, momos, burgers, shakes, and family combos from one elegant platform.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/menu" className="rounded-full bg-crimson px-6 py-3 font-black text-white">Order Now</Link>
          <Link to="/reservation" className="rounded-full border border-black/15 bg-white px-6 py-3 font-black">Reserve Table</Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[["100+", "Menu Items", ChefHat], ["15-25", "Min Delivery", TrendingUp], ["Family", "Reservations", CalendarCheck]].map(([a, b, Icon]) => (
            <div key={a} className="rounded-2xl bg-white p-5 shadow-sm"><Icon className="text-crimson" /><strong className="mt-3 block text-2xl">{a}</strong><span className="text-sm text-black/60">{b}</span></div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-[2rem] bg-ink p-3 shadow-2xl">
        <img className="h-[560px] w-full rounded-[1.4rem] object-cover" src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=90" alt="SFC restaurant dining" />
      </div>
    </section>
  );
}
