# SFC Family Restaurant

Project structure:

- `frontend/` - React + Vite customer app.
- `frontend/src/pages/` - route screens like Login, Home, Payment, Delivery, and Success.
- `frontend/src/context/` - shared checkout/cart state.
- `frontend/src/lib/` - Firebase and browser storage helpers.
- `frontend/src/styles/` - app-wide CSS.
- `backend/` - Node backend, payment routes, Firebase/Firestore config, and schema files.

Common commands:

```bash
npm run dev
npm run build
npm run backend:dev
```

Netlify deploy:

- If deploying from this repository root, use the included `netlify.toml`.
- Netlify build command: `npm --prefix frontend ci && npm --prefix frontend run build`
- Netlify publish directory: `frontend/dist`
- If the Netlify base directory is set to `frontend`, use build command `npm run build` and publish directory `dist`.
- The app is a React Router SPA, so `_redirects` sends all page refreshes back to `index.html`.

Netlify environment variables:

```bash
VITE_RAZORPAY_KEY_ID=your_razorpay_public_key
VITE_API_BASE_URL=https://your-backend-url
VITE_ADMIN_EMAILS=admin@gmail.com
VITE_DELIVERY_AGENT_EMAILS=agent@gmail.com
VITE_STORE_LATITUDE=17.385
VITE_STORE_LONGITUDE=78.4867
```

`VITE_API_BASE_URL` cannot stay as `http://localhost:5000` after publishing. Deploy the backend separately, or move the payment API into Netlify Functions before enabling Razorpay online payments.

Admin and delivery access:

- Admin users sign in at `/admin-login`.
- Admins add delivery agents from the Admin dashboard's Delivery Agents tab.
- Delivery agents sign in at `/delivery-agent-login`.
- A Firebase user account alone is not enough for delivery access; the agent must also be active in the `deliveryAgents` Firestore collection.
- `VITE_DELIVERY_AGENT_EMAILS` is only a fallback allowlist if Firestore is unavailable.
- Delivery agents should allow browser location permission after claiming an order. Their live coordinates are saved on the order so the customer success screen can show online delivery tracking.
- Agent earnings are calculated from each delivered order's delivery fee and shown as today/month totals in the delivery dashboard.
- User, admin, and delivery logins are role-separated. Admin emails must be listed in `VITE_ADMIN_EMAILS`; delivery agents must be added from the Admin dashboard.
- Delivery is available only within 100 km of the store coordinates. Delivery charge is Rs 50 per 7 km.

Razorpay keys:

- `backend/.env` contains `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- `frontend/.env` contains only `VITE_RAZORPAY_KEY_ID` and `VITE_API_BASE_URL`.
- Use `rzp_test_...` keys for testing and `rzp_live_...` keys only when the Razorpay account is ready for real payments.

Run Firebase commands from `backend/`, or use:

```bash
npm run firebase:deploy
```
