import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, BookOpen, ShoppingCart, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState({
    ingredients: 0,
    recipes: 0,
    orders: 0,
    recipeTypes: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ingredientsRes, recipesRes, ordersRes, recipeTypesRes] = await Promise.all([
        supabase.from('ingredients').select('*', { count: 'exact', head: true }),
        supabase.from('recipes').select('name', { count: 'exact' }).limit(1),
        supabase.from('order_items').select('*', { count: 'exact', head: true }),
        supabase.from('recipe_types').select('*', { count: 'exact', head: true }),
      ]);

      const uniqueRecipes = recipesRes.data 
        ? new Set(recipesRes.data.map(r => r.name)).size
        : 0;

      setStats({
        ingredients: ingredientsRes.count || 0,
        recipes: uniqueRecipes,
        orders: ordersRes.count || 0,
        recipeTypes: recipeTypesRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { title: 'Ingredients', value: stats.ingredients, icon: Package, color: 'text-primary' },
    { title: 'Recipes', value: stats.recipes, icon: BookOpen, color: 'text-accent' },
    { title: 'Recipe Types', value: stats.recipeTypes, icon: Users, color: 'text-success' },
    { title: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email} ({userRole})
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with managing your kitchen operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • <strong>Ingredients:</strong> Manage your inventory of ingredients
          </p>
          <p className="text-sm text-muted-foreground">
            • <strong>Recipe Types:</strong> Categorize your recipes (sauces, dressings, etc.)
          </p>
          <p className="text-sm text-muted-foreground">
            • <strong>Recipes:</strong> Define recipes with ingredient quantities
          </p>
          <p className="text-sm text-muted-foreground">
            • <strong>Orders:</strong> Schedule recipes for specific days
          </p>
          <p className="text-sm text-muted-foreground">
            • <strong>Summary:</strong> View daily ingredient requirements
          </p>
          {userRole === 'admin' && (
            <p className="text-sm text-muted-foreground">
              • <strong>Permissions:</strong> Manage user roles and permissions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
