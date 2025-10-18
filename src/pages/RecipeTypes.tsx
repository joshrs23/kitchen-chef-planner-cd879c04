import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface RecipeType {
  id: number;
  name: string;
  created_at: string;
}

export default function RecipeTypes() {
  const [recipeTypes, setRecipeTypes] = useState<RecipeType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<RecipeType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<RecipeType | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchRecipeTypes();
  }, []);

  useEffect(() => {
    const filtered = recipeTypes.filter((type) =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTypes(filtered);
  }, [searchTerm, recipeTypes]);

  const fetchRecipeTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setRecipeTypes(data || []);
      setFilteredTypes(data || []);
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
      if (editingType) {
        const { error } = await supabase
          .from('recipe_types')
          .update({ name: formData.name })
          .eq('id', editingType.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Recipe type updated successfully.' });
      } else {
        const { error } = await supabase
          .from('recipe_types')
          .insert([{ name: formData.name }]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Recipe type created successfully.' });
      }

      setDialogOpen(false);
      setFormData({ name: '' });
      setEditingType(null);
      fetchRecipeTypes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recipe type?')) return;

    try {
      const { error } = await supabase
        .from('recipe_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Recipe type deleted successfully.' });
      fetchRecipeTypes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openDialog = (type?: RecipeType) => {
    if (type) {
      setEditingType(type);
      setFormData({ name: type.name });
    } else {
      setEditingType(null);
      setFormData({ name: '' });
    }
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recipe Types</h1>
          <p className="text-muted-foreground">Categorize your recipes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Recipe Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingType ? 'Edit' : 'Add'} Recipe Type</DialogTitle>
                <DialogDescription>
                  {editingType ? 'Update' : 'Create a new'} recipe type category.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Type Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="e.g., Sauce, Dressing"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingType ? 'Update' : 'Create'}</Button>
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
                placeholder="Search recipe types..."
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
                {filteredTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No recipe types found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-mono text-sm">{type.id}</TableCell>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(type)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(type.id)}
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
