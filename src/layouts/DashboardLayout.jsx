import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth/AuthContext";
import Button from "../components/ui/Button";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    { to: "transactions", label: "Transactions", roles: ["admin", "staff"] },
    { to: "customers", label: "Customers", roles: ["admin", "staff"] },
    { to: "suppliers", label: "Suppliers", roles: ["admin"] },
    { to: "analytics", label: "Analytics", roles: ["admin"] },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role ?? "staff";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 px-4 border-b border-gray-200 flex items-center">
          <div className="font-semibold">DG Admin</div>
        </div>

        <nav className="flex flex-col p-2 gap-1 mx-2">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm rounded ${isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="font-medium text-gray-800">Dashboard</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              {user?.role}
            </span>
            <div className="w-px h-6 bg-gray-300"></div>
            <Button onClick={handleLogout} variant="danger">
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">{<Outlet />}</div>
        </main>
      </div>
    </div>
  );
}
