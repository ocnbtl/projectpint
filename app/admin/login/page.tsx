export default function AdminLoginPage() {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 460 }}>
        <h1>Admin Login</h1>
        <form action="/api/admin/login" method="post">
          <label>
            Access code
            <input name="password" type="password" required style={{ width: "100%", padding: 8, marginTop: 6 }} />
          </label>
          <button style={{ marginTop: 10 }}>Login</button>
        </form>
      </div>
    </main>
  );
}
