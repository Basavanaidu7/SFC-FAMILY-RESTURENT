export function Offers() {
  return <StaticPage title="Offers" kicker="Revenue Campaigns" body="Family combos, pizza combos, weekend dine-in specials, and loyalty rewards are managed from the admin panel." />;
}
export function Contact() {
  return <StaticPage title="Contact" kicker="Customer Support" body="SFC Family Restaurant, Main Road. Call +91 90000 00000 or email orders@sfcfamily.example." />;
}
export function Profile() {
  return <StaticPage title="Profile" kicker="Customer Management" body="View recent orders, loyalty points, reservations, addresses, and saved preferences." />;
}
function StaticPage({ title, kicker, body }) {
  return <section className="mx-auto max-w-5xl px-4 py-16"><p className="font-bold uppercase tracking-[0.25em] text-crimson">{kicker}</p><h1 className="mt-3 font-display text-5xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-black/70">{body}</p></section>;
}
