type SidebarProps = {
  active: "admin" | "hospital" | "auth" | "home";
};

const links = [
  { id: "admin", href: "/admin", label: "Admin nacional" },
  { id: "hospital", href: "/hospital", label: "Hospital" },
  { id: "home", href: "/mobile", label: "Mobile dador" },
  { id: "auth", href: "/auth", label: "Acesso seguro" }
] as const;

export function Sidebar({ active }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="brand-mark">DS</div>
        <div>
          <strong>Doe Sangue</strong>
          <div className="muted">Angola</div>
        </div>
      </div>

      <nav className="grid" style={{ marginTop: 34 }}>
        {links.map((link) => (
          <a
            className={`nav-link ${active === link.id ? "active" : ""}`}
            href={link.href}
            key={link.id}
          >
            <span>{link.label}</span>
            <span>›</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
