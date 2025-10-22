// import { useEffect, useState } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useToast } from '@/hooks/use-toast';
// import { Plus, Pencil, Trash2 } from 'lucide-react';

// interface OrderItem {
//   id: number;
//   day_name: string;
//   order_date: string;
//   recipe_name: string;
//   quantity: number;
//   created_by: string | null;
// }

// const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// export default function Orders() {
//   const [orders, setOrders] = useState<OrderItem[]>([]);
//   const [recipeNames, setRecipeNames] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
//   const [formData, setFormData] = useState({
//     day_name: 'monday',
//     order_date: new Date().toISOString().split('T')[0],
//     recipe_name: '',
//     quantity: '1',
//   });
//   const { toast } = useToast();

//   useEffect(() => {
//     Promise.all([fetchOrders(), fetchRecipeNames()]);
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('order_items')
//         .select('*')
//         .order('order_date', { ascending: false });

//       if (error) throw error;
//       setOrders(data || []);
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRecipeNames = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('recipes')
//         .select('name')
//         .order('name');

//       if (error) throw error;
//       const uniqueNames = [...new Set((data || []).map(r => r.name))];
//       setRecipeNames(uniqueNames);
//     } catch (error: any) {
//       console.error('Error fetching recipe names:', error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const payload = {
//         day_name: formData.day_name,
//         order_date: formData.order_date,
//         recipe_name: formData.recipe_name,
//         quantity: Number(formData.quantity),
//       };

//       if (editingOrder) {
//         const { error } = await supabase
//           .from('order_items')
//           .update(payload)
//           .eq('id', editingOrder.id);

//         if (error) throw error;
//         toast({ title: 'Success', description: 'Order updated successfully.' });
//       } else {
//         const { error } = await supabase.from('order_items').insert([payload]);

//         if (error) throw error;
//         toast({ title: 'Success', description: 'Order created successfully.' });
//       }

//       setDialogOpen(false);
//       resetForm();
//       fetchOrders();
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this order?')) return;

//     try {
//       const { error } = await supabase.from('order_items').delete().eq('id', id);

//       if (error) throw error;
//       toast({ title: 'Success', description: 'Order deleted successfully.' });
//       fetchOrders();
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       });
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       day_name: 'monday',
//       order_date: new Date().toISOString().split('T')[0],
//       recipe_name: '',
//       quantity: '1',
//     });
//     setEditingOrder(null);
//   };

//   const openDialog = (order?: OrderItem) => {
//     if (order) {
//       setEditingOrder(order);
//       setFormData({
//         day_name: order.day_name,
//         order_date: order.order_date,
//         recipe_name: order.recipe_name,
//         quantity: order.quantity.toString(),
//       });
//     } else {
//       resetForm();
//     }
//     setDialogOpen(true);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Orders</h1>
//           <p className="text-muted-foreground">Schedule recipes for specific days</p>
//         </div>
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button onClick={() => openDialog()} className="gap-2">
//               <Plus className="h-4 w-4" />
//               Add Order
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <form onSubmit={handleSubmit}>
//               <DialogHeader>
//                 <DialogTitle>{editingOrder ? 'Edit' : 'Add'} Order</DialogTitle>
//                 <DialogDescription>
//                   Schedule a recipe for a specific day with quantity.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="order_date">Date</Label>
//                     <Input
//                       id="order_date"
//                       type="date"
//                       value={formData.order_date}
//                       onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="day_name">Day</Label>
//                     <Select
//                       value={formData.day_name}
//                       onValueChange={(value) => setFormData({ ...formData, day_name: value })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {DAYS.map((day) => (
//                           <SelectItem key={day} value={day}>
//                             {day.charAt(0).toUpperCase() + day.slice(1)}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="recipe_name">Recipe</Label>
//                   <Select
//                     value={formData.recipe_name}
//                     onValueChange={(value) => setFormData({ ...formData, recipe_name: value })}
//                     required
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select recipe" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {recipeNames.map((name) => (
//                         <SelectItem key={name} value={name}>
//                           {name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="quantity">Quantity Multiplier</Label>
//                   <Input
//                     id="quantity"
//                     type="number"
//                     step="0.001"
//                     value={formData.quantity}
//                     onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
//                     placeholder="1"
//                     required
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button type="submit">{editingOrder ? 'Update' : 'Create'}</Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardHeader>
//           <h2 className="text-lg font-semibold">Scheduled Orders</h2>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="text-center py-8 text-muted-foreground">Loading...</div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Day</TableHead>
//                   <TableHead>Recipe</TableHead>
//                   <TableHead>Quantity</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {orders.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={5} className="text-center text-muted-foreground">
//                       No orders found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   orders.map((order) => (
//                     <TableRow key={order.id}>
//                       <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
//                       <TableCell className="capitalize">{order.day_name}</TableCell>
//                       <TableCell className="font-medium">{order.recipe_name}</TableCell>
//                       <TableCell>{order.quantity}</TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => openDialog(order)}
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => handleDelete(order.id)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';

interface OrderItem {
  id: number;
  day_name: string;
  order_date: string; // YYYY-MM-DD
  prep_date: string | null; // YYYY-MM-DD
  recipe_name: string;
  quantity: number;
  created_by: string | null;
}

// ===== Helpers TZ (Montreal)
const TZ = 'America/Toronto';

function dateStringInTZ(d: Date, tz = TZ) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

// weekday correcto (12:00 UTC para evitar rollback)
function weekdayFromDateString(dateStr: string, tz = TZ) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(dt);
  return wd.toLowerCase();
}

// mostrar fecha con TZ sin desfase
function formatDateForTZ(dateStr: string, tz = TZ) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dt);
}

// Título tipo “Saturday, October 25, 2025”
function headingForDate(dateStr: string, tz = TZ) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dt);
}
// ===================================

export default function Orders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [recipeNames, setRecipeNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [formData, setFormData] = useState({
    day_name: 'monday',
    order_date: dateStringInTZ(new Date()),
    prep_date: dateStringInTZ(new Date()),
    recipe_name: '',
    quantity: '1',
  });
  // filtro rango (default hoy→hoy)
  const [fromDate, setFromDate] = useState<string>(dateStringInTZ(new Date()));
  const [toDate, setToDate] = useState<string>(dateStringInTZ(new Date()));

  const { toast } = useToast();

  // sync day_name con prep_date
  useEffect(() => {
    const computed = weekdayFromDateString(formData.prep_date);
    if (computed !== formData.day_name) {
      setFormData((f) => ({ ...f, day_name: computed }));
    }
  }, [formData.prep_date]);

  useEffect(() => {
    Promise.all([fetchOrders(fromDate, toDate), fetchRecipeNames()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // trae pedidos por rango (usa prep_date)
  const fetchOrders = async (from?: string, to?: string) => {
    try {
      setLoading(true);
      let query = supabase.from('order_items').select('*');

      if (from) query = query.gte('prep_date', from);
      if (to) query = query.lte('prep_date', to);

      const { data, error } = await query.order('prep_date', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeNames = async () => {
    try {
      const { data, error } = await supabase.from('recipes').select('name').order('name');
      if (error) throw error;
      const uniqueNames = [...new Set((data || []).map(r => r.name))];
      setRecipeNames(uniqueNames);
    } catch {
      // silencioso
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar: Order Date <= Preparation Date
    if (formData.order_date > formData.prep_date) {
      toast({
        title: 'Validation Error',
        description: 'Order Date must be less than or equal to Preparation Date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const day = weekdayFromDateString(formData.prep_date);
      const payload = {
        day_name: day,
        order_date: formData.order_date,
        prep_date: formData.prep_date,
        recipe_name: formData.recipe_name,
        quantity: Number(formData.quantity),
      };

      if (editingOrder) {
        const { error } = await supabase.from('order_items').update(payload).eq('id', editingOrder.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Order updated successfully.' });
      } else {
        const { error } = await supabase.from('order_items').insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Order created successfully.' });
      }

      setDialogOpen(false);
      resetForm();
      fetchOrders(fromDate, toDate); // respeta filtro activo
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const { error } = await supabase.from('order_items').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Order deleted successfully.' });
      fetchOrders(fromDate, toDate);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    const today = dateStringInTZ(new Date());
    setFormData({
      day_name: weekdayFromDateString(today),
      order_date: today,
      prep_date: today,
      recipe_name: '',
      quantity: '1',
    });
    setEditingOrder(null);
  };

  const openDialog = (order?: OrderItem) => {
    if (order) {
      const keyDate = order.prep_date || order.order_date;
      const day = weekdayFromDateString(keyDate);
      setEditingOrder(order);
      setFormData({
        day_name: day,
        order_date: order.order_date,
        prep_date: order.prep_date || order.order_date,
        recipe_name: order.recipe_name,
        quantity: order.quantity.toString(),
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

  // ====== rango: ajustar automáticamente
  const handleFromChange = (v: string) => {
    setFromDate(v);
    if (toDate && v > toDate) setToDate(v);
  };
  const handleToChange = (v: string) => {
    setToDate(v);
    if (fromDate && v < fromDate) setFromDate(v);
  };

  // aplicar filtro
  const applyFilter = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setToDate(fromDate);
    }
    fetchOrders(fromDate, toDate);
  };

  // export CSV (usa prep_date)
  const exportCsv = () => {
    const rows = [
      ['Preparation Date', 'Day', 'Recipe', 'Quantity', 'Order Date'],
      ...orders.map(o => {
        const keyDate = o.prep_date || o.order_date;
        return [
          keyDate,
          weekdayFromDateString(keyDate),
          o.recipe_name,
          String(o.quantity),
          o.order_date,
        ];
      }),
    ];
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${fromDate || ''}_${toDate || ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ====== Agrupación por día (como summary.tsx) ======
  const groupedByDate = useMemo(() => {
    const acc: Record<string, OrderItem[]> = {};
    for (const o of orders) {
      const keyDate = o.prep_date || o.order_date; // siempre agrupamos por prep_date (fallback a order_date)
      if (!acc[keyDate]) acc[keyDate] = [];
      acc[keyDate].push(o);
    }
    return acc;
  }, [orders]);

  // ordenar las fechas desc (coincide con query.order desc)
  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDate).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }, [groupedByDate]);

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
                <DialogDescription>Schedule a recipe for a specific day with quantity.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order_date">Order Date</Label>
                    <Input
                      id="order_date"
                      type="date"
                      value={formData.order_date}
                      onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prep_date">Preparation Date</Label>
                    <Input
                      id="prep_date"
                      type="date"
                      value={formData.prep_date}
                      onChange={(e) => setFormData({ ...formData, prep_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Input value={cap(formData.day_name)} readOnly />
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
                        <SelectItem key={name} value={name}>{name}</SelectItem>
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

      {/* Filtro por fecha (prep_date) */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Date Range Filter</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] items-end gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={fromDate} onChange={(e) => handleFromChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={toDate} onChange={(e) => handleToChange(e.target.value)} />
            </div>
            <Button className="md:mb-0" onClick={applyFilter}>Apply Filter</Button>
            <Button variant="outline" className="gap-2" onClick={exportCsv}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listado agrupado por día (como summary.tsx) */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : sortedDates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No orders found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const items = groupedByDate[dateKey];
            return (
              <Card key={dateKey}>
                <CardHeader>
                  {/* Encabezado con fecha bonita (incluye weekday) */}
                  <h3 className="text-lg font-semibold">{headingForDate(dateKey)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Prep date: {formatDateForTZ(dateKey)} {/* muestra YYYY-MM-DD local */}
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipe</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.recipe_name}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{formatDateForTZ(order.order_date)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openDialog(order)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(order.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
