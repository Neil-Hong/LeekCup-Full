"use client";

import { FormEvent, useState } from "react";

type LoginFormProps = {
  nextPath?: string;
};

export default function LoginForm({ nextPath = "/" }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError("\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef / Invalid username or password");
        return;
      }

      window.location.href = nextPath;
    } catch {
      setError("\u767b\u5f55\u5931\u8d25 / Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-auth-page">
      <form className="site-auth-panel" onSubmit={handleSubmit}>
        <div className="site-auth-header">
          <div className="site-auth-badge">84452 LEEK CUP</div>
          <div className="site-auth-title">
            <h1>{"\u767b\u5f55"}</h1>
            <span>Login</span>
          </div>
        </div>

        <label className="site-auth-field">
          <span className="site-auth-label">
            <strong>{"\u8d26\u53f7"}</strong>
            <em>Username</em>
          </span>
          <input
            autoComplete="username"
            placeholder="Enter username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>

        <label className="site-auth-field">
          <span className="site-auth-label">
            <strong>{"\u5bc6\u7801"}</strong>
            <em>Password</em>
          </span>
          <input
            autoComplete="current-password"
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? <p className="site-auth-error">{error}</p> : null}

        <button className="site-auth-button" type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "\u767b\u5f55\u4e2d" : "\u8fdb\u5165\u7f51\u7ad9"}</span>
          <span>{isSubmitting ? "Signing In" : "Enter Site"}</span>
        </button>
      </form>
    </main>
  );
}
