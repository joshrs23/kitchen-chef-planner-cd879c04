import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface OrderItem {
  id: number;
  day_name: string;
  order_date: string;
  recipe_name: string;
  quantity: number;
  created_by: string | null;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function Orders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [recipeNames, setRecipeNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [formData, setFormData] = useState({
    day_name: 'monday',
    order_date: new Date().toISOString().split('T')[0],
    recipe_name: '',
    quantity: '1',
  });
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchOrders(), fetchRecipeNames()]);
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeNames = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('name')
        .order('name');

      if (error) throw error;
      const uniqueNames = [...new Set((data || []).map(r => r.name))];
      setRecipeNames(uniqueNames);
    } catch (error: any) {
      console.error('Error fetching recipe names:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        day_name: formData.day_name,
        order_date: formData.order_date,
        recipe_name: formData.recipe_name,
        quantity: Number(formData.quantity),
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('order_items')
          .update(payload)
          .eq('id', editingOrder.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Order updated successfully.' });
      } else {
        const { error } = await supabase.from('order_items').insert([payload]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Order created successfully.' });
      }

      setDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase.from('order_items').delete().eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Order deleted successfully.' });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      day_name: 'monday',
      order_date: new Date().toISOString().split('T')[0],
      recipe_name: '',
      quantity: '1',
    });
    setEditingOrder(null);
  };

  const openDialog = (order?: OrderItem) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        day_name: order.day_name,
        order_date: order.order_date,
        recipe_name: order.recipe_name,
        quantity: order.quantity.toString(),
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Schedule recipes for specific days</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingOrder ? 'Edit' : 'Add'} Order</DialogTitle>
                <DialogDescription>
                  Schedule a recipe for a specific day with quantity.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order_date">Date</Label>
                    <Input
                      id="order_date"
                      type="date"
                      value={formData.order_date}
                      onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="day_name">Day</Label>
                    <Select
                      value={formData.day_name}
                      onValueChange={(value) => setFormData({ ...formData, day_name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe_name">Recipe</Label>
                  <Select
                    value={formData.recipe_name}
                    onValueChange={(value) => setFormData({ ...formData, recipe_name: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipeNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Multiplier</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.001"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingOrder ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Scheduled Orders</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Recipe</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{order.day_name}</TableCell>
                      <TableCell className="font-medium">{order.recipe_name}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(order)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
