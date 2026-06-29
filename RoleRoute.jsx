import { Navigate } from "react-router-dom";
import { readAdminSession } from "../lib/adminSession.js";
import { readAgentSession } from "../lib/agentSession.js";
import { readActiveRole } from "../lib/roleSession.js";
import { readUserSession } from "../lib/userSession.js";

const fallbackRoutes = {
  user: "/user-login",
  admin: "/admin-login",
  delivery: "/delivery-agent-login",
};

function hasRoleSession(role) {
  if (role === "admin") {
    return Boolean(readAdminSession());
  }
  if (role === "delivery") {
    return Boolean(readAgentSession());
  }
  return Boolean(readUserSession());
}

export default function RoleRoute({ role, children }) {
  if (readActiveRole() !== role || !hasRoleSession(role)) {
    return <Navigate to={fallbackRoutes[role] ?? "/"} replace />;
  }
  return children;
}
