import { Suspense } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router";
import {
  IconLayoutDashboard,
  IconBuildingSkyscraper,
  IconPencilPlus,
  IconBookmark,
  IconFileText,
  IconShieldCheck,
  IconSun,
  IconMoon,
  IconLogout,
  IconLogin,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useUser, useLogout } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Loading } from "../ui/States";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="none" stroke="var(--mint)" strokeWidth="3.2" />
        <circle cx="19.5" cy="12.5" r="3.4" fill="var(--amber)" />
      </svg>
      <span className="text-lg">InternLens</span>
    </Link>
  );
}

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? "bg-mint/12 text-mint" : "text-muted hover:bg-raised hover:text-text"
  }`;

export default function AppShell() {
  const { user } = useUser();
  const logout = useLogout();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Overview", icon: IconLayoutDashboard, end: true },
    { to: "/companies", label: "Companies", icon: IconBuildingSkyscraper },
    { to: "/share", label: "Share experience", icon: IconPencilPlus },
    ...(user
      ? [
          { to: "/saved", label: "Saved", icon: IconBookmark },
          { to: "/my-posts", label: "My posts", icon: IconFileText },
        ]
      : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Review queue", icon: IconShieldCheck }] : []),
  ];

  async function handleLogout() {
    await logout.mutateAsync();
    toast.success("Logged out");
    navigate("/");
  }

  const ThemeIcon = theme === "dark" ? IconSun : IconMoon;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar: desktop */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-panel px-4 py-5 lg:flex">
        <Logo />
        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={20} stroke={1.75} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <button onClick={toggle} className={linkClass({ isActive: false }) + " w-full"}>
            <ThemeIcon size={20} stroke={1.75} aria-hidden="true" />
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          {user ? (
            <div className="flex items-center gap-3 rounded-xl border border-line p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-sm font-semibold">
                {user.name[0].toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.college || user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-muted hover:bg-raised hover:text-coral"
                aria-label="Log out"
                title="Log out"
              >
                <IconLogout size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary w-full">
              <IconLogin size={18} aria-hidden="true" />
              Log in
            </Link>
          )}
        </div>
      </aside>

      {/* Top bar: mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-panel/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <button onClick={toggle} className="rounded-lg p-2 text-muted hover:bg-raised" aria-label="Switch theme">
            <ThemeIcon size={20} />
          </button>
          {user ? (
            <button onClick={handleLogout} className="rounded-lg p-2 text-muted hover:bg-raised" aria-label="Log out">
              <IconLogout size={20} />
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary px-3 py-1.5 text-sm">
              Log in
            </Link>
          )}
        </div>
      </header>

      <main className="min-w-0 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
        <div className="mx-auto max-w-6xl">
          {/* pages are lazy loaded: the sidebar stays while the page code downloads */}
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Bottom tabs: mobile */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 grid border-t border-line bg-panel/95 backdrop-blur lg:hidden"
        style={{ gridTemplateColumns: `repeat(${Math.min(links.length, 5)}, 1fr)` }}
      >
        {links.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? "text-mint" : "text-muted"}`
            }
          >
            <Icon size={22} stroke={1.75} aria-hidden="true" />
            {label.split(" ")[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
