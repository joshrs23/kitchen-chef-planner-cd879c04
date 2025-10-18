import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Ingredient {
  id: number;
  name: string;
  created_at: string;
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    const filtered = ingredients.filter((ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIngredients(filtered);
  }, [searchTerm, ingredients]);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      setIngredients(data || []);
      setFilteredIngredients(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingIngredient) {
        const { error } = await supabase
          .from('ingredients')
          .update({ name: formData.name })
          .eq('id', editingIngredient.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Ingredient updated successfully.' });
      } else {
        const { error } = await supabase
          .from('ingredients')
          .insert([{ name: formData.name }]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Ingredient created successfully.' });
      }

      setDialogOpen(false);
      setFormData({ name: '' });
      setEditingIngredient(null);
      fetchIngredients();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Ingredient deleted successfully.' });
      fetchIngredients();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({ name: ingredient.name });
    } else {
      setEditingIngredient(null);
      setFormData({ name: '' });
    }
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ingredients</h1>
          <p className="text-muted-foreground">Manage your ingredient inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingIngredient ? 'Edit' : 'Add'} Ingredient</DialogTitle>
                <DialogDescription>
                  {editingIngredient ? 'Update' : 'Create a new'} ingredient entry.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ingredient Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="e.g., Salt"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingIngredient ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No ingredients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIngredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell className="font-mono text-sm">{ingredient.id}</TableCell>
                      <TableCell className="font-medium">{ingredient.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(ingredient)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(ingredient.id)}
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
