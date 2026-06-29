import { useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { isAllowedAgentAccount, saveAgentSession } from "../lib/agentSession.js";
import { clearAdminSession, isAllowedAdminEmail } from "../lib/adminSession.js";
import { auth } from "../lib/firebase.js";
import { clearUserSession } from "../lib/userSession.js";

function getAgentAuthErrorMessage(error) {
  const firebaseError = error;
  switch (firebaseError?.code) {
    case "auth/invalid-credential":
      return "Delivery agent email or password is incorrect.";
    case "auth/invalid-email":
      return "Enter a valid delivery agent Gmail address.";
    case "auth/missing-password":
      return "Enter the delivery agent password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a little and try again.";
    default:
      return "Delivery agent login could not continue. Check Firebase Authentication setup.";
  }
}

export default function AgentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginAsAgent = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("Enter delivery agent Gmail and password.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const agentEmail = credential.user.email || email.trim();
      if (isAllowedAdminEmail(agentEmail)) {
        await signOut(auth);
        setErrorMessage("This Gmail belongs to admin login. Use Admin Login only.");
        return;
      }
      const activeAgent = await isAllowedAgentAccount(agentEmail);
      if (!activeAgent) {
        await signOut(auth);
        setErrorMessage("Admin has not added this Gmail as an active delivery agent.");
        return;
      }
      clearUserSession();
      clearAdminSession();
      saveAgentSession(agentEmail, activeAgent);
      navigate("/delivery-agent");
    } catch (error) {
      setErrorMessage(getAgentAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendResetLink = async () => {
    if (!email.trim()) {
      setErrorMessage("Enter the delivery agent Gmail address first.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage("Password reset email sent for the delivery agent account.");
    } catch (error) {
      setErrorMessage(getAgentAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page agent-login-page">
      <section className="login-card admin-login-card">
        <div>
          <p className="brand-mark">SFC Delivery</p>
          <h1>Delivery agent login</h1>
          <p className="login-note">Use this page only for rider order handling.</p>
        </div>
        <div className="auth-panel">
          <label className="field-stack">
            <span>Agent Gmail</span>
            <input type="email" placeholder="agent@gmail.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Password</span>
            <input type="password" placeholder="Agent password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button type="button" onClick={loginAsAgent} disabled={isSubmitting}>
            {isSubmitting ? "Checking agent..." : "Login to Delivery"}
          </button>
          <div className="admin-login-links">
            <button type="button" className="text-button" onClick={sendResetLink} disabled={isSubmitting}>Forgot Password?</button>
            <button type="button" className="text-button" onClick={() => navigate("/user-login")}>User Login</button>
            <button type="button" className="text-button" onClick={() => navigate("/admin-login")}>Admin Login</button>
          </div>
        </div>
        {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
        {successMessage ? <p className="login-success">{successMessage}</p> : null}
      </section>
    </main>
  );
}
