import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, LogOut, Sprout, Users, ScrollText } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fields',    icon: Map,             label: 'Fields' },
  { to: '/logs',      icon: ScrollText,      label: 'Activity Log' },
];

const adminItems = [
  { to: '/agents', icon: Users, label: 'Agents' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <aside className="w-64 bg-white border-r border-stone-100 flex flex-col fixed h-full z-10">
        <div className="px-6 py-6 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-leaf-600 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display text-stone-800 font-medium text-base leading-none">Smart Season</p>
              <p className="text-xs text-stone-400 mt-0.5">Field Monitor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-leaf-50 text-leaf-700'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-leaf-50 text-leaf-700'
                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="px-3 pb-4 border-t border-stone-100 pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-50">
            <div className="w-8 h-8 rounded-lg bg-leaf-100 flex items-center justify-center text-leaf-700 font-semibold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{user?.name}</p>
              <p className="text-xs text-stone-400">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-stone-200 transition-colors" title="Log out">
              <LogOut className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}