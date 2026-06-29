import { useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase.js";
import { isAllowedAdminEmail, saveAdminSession } from "../lib/adminSession.js";
import { clearAgentSession } from "../lib/agentSession.js";
import { clearUserSession } from "../lib/userSession.js";

function getAdminAuthErrorMessage(error) {
  const firebaseError = error;
  switch (firebaseError?.code) {
    case "auth/invalid-credential":
      return "Admin email or password is incorrect.";
    case "auth/invalid-email":
      return "Enter a valid admin Gmail address.";
    case "auth/missing-password":
      return "Enter the admin password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a little and try again.";
    default:
      return "Admin login could not continue. Check Firebase Authentication setup.";
  }
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginAsAdmin = async () => {
    if (!email.trim() || !password) {
      setError("Enter admin Gmail and password.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = credential.user;
      if (!isAllowedAdminEmail(user.email || email.trim())) {
        setError("This Gmail is not allowed for admin login.");
        return;
      }
      clearUserSession();
      clearAgentSession();
      saveAdminSession(user.email || email.trim());
      navigate("/admin");
    } catch (error) {
      setError(getAdminAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  const sendResetLink = async () => {
    if (!email.trim()) {
      setError("Enter the admin Gmail address first.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage("Password reset email sent for the admin account.");
    } catch (error) {
      setError(getAdminAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page admin-login-page">
      <section className="login-card admin-login-card">
        <div>
          <p className="brand-mark">SFC Admin</p>
          <h1>Admin login</h1>
          <p className="login-note">Use this page only for shop management.</p>
        </div>
        <div className="auth-panel">
          <label className="field-stack">
            <span>Admin Gmail</span>
            <input type="email" placeholder="admin@gmail.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Password</span>
            <input type="password" placeholder="Admin password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button type="button" onClick={loginAsAdmin} disabled={isSubmitting}>
            {isSubmitting ? "Checking admin..." : "Login to Admin"}
          </button>
          <div className="admin-login-links">
            <button type="button" className="text-button" onClick={sendResetLink} disabled={isSubmitting}>Forgot Password?</button>
            <button type="button" className="text-button" onClick={() => navigate("/user-login")}>User Login</button>
            <button type="button" className="text-button" onClick={() => navigate("/delivery-agent-login")}>Delivery Login</button>
          </div>
        </div>
        {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
        {successMessage ? <p className="login-success">{successMessage}</p> : null}
      </section>
    </main>
  );
}
