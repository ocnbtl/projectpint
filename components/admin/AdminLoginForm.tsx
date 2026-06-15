"use client";

import { useState } from "react";

interface AdminLoginFormProps {
  errorMessage?: string;
  noticeMessage?: string;
}

export function AdminLoginForm({ errorMessage, noticeMessage }: AdminLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="admin-login-stack">
      <div className="admin-login-brandlock">
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
      </div>

      {errorMessage ? <p className="admin-login-alert admin-login-alert-error">{errorMessage}</p> : null}
      {noticeMessage ? <p className="admin-login-alert admin-login-alert-success">{noticeMessage}</p> : null}

      <div className="admin-login-card">
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
                placeholder="Enter password"
              />
              <button
                type="button"
                className="admin-login-visibility"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {showPassword ? (
                    <>
                      <path d="m2 2 20 20" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.5 4.4A10.4 10.4 0 0 1 12 4c5 0 8.5 4.2 10 8-0.5 1.3-1.4 2.7-2.6 3.9" />
                      <path d="M6.1 6.1C4.1 7.5 2.7 9.7 2 12c1.5 3.8 5 8 10 8 1.4 0 2.7-0.3 3.8-0.9" />
                    </>
                  ) : (
                    <>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </span>
          </label>

          <button type="submit" className="admin-login-submit">
            Sign In
          </button>
        </form>
      </div>

      <p className="admin-login-protection">Protected admin access. Authorized personnel only.</p>
    </div>
  );
}
