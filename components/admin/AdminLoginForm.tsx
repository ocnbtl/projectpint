"use client";

import Link from "next/link";
import { useState } from "react";

interface AdminLoginFormProps {
  errorMessage?: string;
  noticeMessage?: string;
}

export function AdminLoginForm({ errorMessage, noticeMessage }: AdminLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="admin-login-card">
      <div className="admin-login-mark" aria-hidden="true">
        <span className="brand-mark">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M19.2 4.8c-6.8.4-11.5 3.1-14 8.2 2.2-.9 4.4-.9 6.7-.1-2.9 1.1-5.1 3-6.5 5.8 5.9-.2 10.3-2.1 13.1-5.8 1.5-2 1.7-4.7.7-8.1Z" />
            <path d="M5.5 18.2c2.8-4.4 6.2-7.2 10.1-8.5" />
          </svg>
        </span>
      </div>
      <div className="admin-login-title">
        <h1>Command Center</h1>
        <p>Diyesu Decor Operations</p>
      </div>

      {errorMessage ? <p className="admin-login-alert admin-login-alert-error">{errorMessage}</p> : null}
      {noticeMessage ? <p className="admin-login-alert admin-login-alert-success">{noticeMessage}</p> : null}

      <form action="/api/admin/login" method="post" className="admin-login-form">
        <label className="admin-login-field" htmlFor="admin-password">
          <span>Password</span>
          <span className="admin-login-input-shell">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Enter admin password"
            />
            <button
              type="button"
              className="admin-login-visibility"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>

        <button type="submit" className="admin-login-submit">
          Sign In
        </button>
      </form>

      <p className="admin-login-protection">Protected admin access for content, Pinterest, and revenue workflows.</p>
      <Link href="/" className="admin-login-return">
        Return to public site
      </Link>
    </div>
  );
}
