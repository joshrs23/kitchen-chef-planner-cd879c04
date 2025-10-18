import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChefHat, Package, BookOpen, Utensils, ShoppingCart, PieChart, Users, LogOut } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { userRole, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: PieChart },
    { path: '/ingredients', label: 'Ingredients', icon: Package },
    { path: '/recipe-types', label: 'Recipe Types', icon: Utensils },
    { path: '/recipes', label: 'Recipes', icon: BookOpen },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/summary', label: 'Summary', icon: PieChart },
  ];

  if (userRole === 'admin') {
    navItems.push({ path: '/permissions', label: 'Permissions', icon: Users });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Kitchen Manager</span>
            </Link>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
