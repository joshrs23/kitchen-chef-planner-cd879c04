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
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Recipe {
  id: number;
  name: string;
  recipe_type_id: number | null;
  ingredient_id: number;
  quantity_base: number;
  unit: string;
  ingredient_name?: string;
  recipe_type_name?: string;
}

interface Ingredient {
  id: number;
  name: string;
}

interface RecipeType {
  id: number;
  name: string;
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeTypes, setRecipeTypes] = useState<RecipeType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    recipe_type_id: '',
    ingredient_id: '',
    quantity_base: '',
    unit: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchRecipes(), fetchIngredients(), fetchRecipeTypes()]);
  }, []);

  useEffect(() => {
    const filtered = recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredient_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  }, [searchTerm, recipes]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients (name),
          recipe_types (name)
        `)
        .order('name');

      if (error) throw error;
      
      const mappedData = (data || []).map(item => ({
        ...item,
        ingredient_name: (item.ingredients as any)?.name,
        recipe_type_name: (item.recipe_types as any)?.name,
      }));
      
      setRecipes(mappedData);
      setFilteredRecipes(mappedData);
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

  const fetchIngredients = async () => {
    const { data } = await supabase.from('ingredients').select('*').order('name');
    setIngredients(data || []);
  };

  const fetchRecipeTypes = async () => {
    const { data } = await supabase.from('recipe_types').select('*').order('name');
    setRecipeTypes(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        recipe_type_id: formData.recipe_type_id ? Number(formData.recipe_type_id) : null,
        ingredient_id: Number(formData.ingredient_id),
        quantity_base: Number(formData.quantity_base),
        unit: formData.unit,
      };

      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update(payload)
          .eq('id', editingRecipe.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Recipe line updated successfully.' });
      } else {
        const { error } = await supabase.from('recipes').insert([payload]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Recipe line created successfully.' });
      }

      setDialogOpen(false);
      resetForm();
      fetchRecipes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recipe line?')) return;

    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Recipe line deleted successfully.' });
      fetchRecipes();
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
      name: '',
      recipe_type_id: '',
      ingredient_id: '',
      quantity_base: '',
      unit: '',
    });
    setEditingRecipe(null);
  };

  const openDialog = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setFormData({
        name: recipe.name,
        recipe_type_id: recipe.recipe_type_id?.toString() || '',
        ingredient_id: recipe.ingredient_id.toString(),
        quantity_base: recipe.quantity_base.toString(),
        unit: recipe.unit,
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
          <h1 className="text-3xl font-bold text-foreground">Recipes</h1>
          <p className="text-muted-foreground">Manage recipe ingredient lines</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Recipe Line
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingRecipe ? 'Edit' : 'Add'} Recipe Line</DialogTitle>
                <DialogDescription>
                  Each line represents one ingredient in a recipe.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Recipe Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Caesar Dressing"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipe_type_id">Recipe Type</Label>
                    <Select
                      value={formData.recipe_type_id}
                      onValueChange={(value) => setFormData({ ...formData, recipe_type_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipeTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="ingredient_id">Ingredient</Label>
                    <Select
                      value={formData.ingredient_id}
                      onValueChange={(value) => setFormData({ ...formData, ingredient_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ing) => (
                          <SelectItem key={ing.id} value={ing.id.toString()}>
                            {ing.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="g, ml, units"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity_base">Quantity</Label>
                  <Input
                    id="quantity_base"
                    type="number"
                    step="0.001"
                    value={formData.quantity_base}
                    onChange={(e) => setFormData({ ...formData, quantity_base: e.target.value })}
                    placeholder="e.g., 100"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingRecipe ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search recipes or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipe Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No recipes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell className="font-medium">{recipe.name}</TableCell>
                      <TableCell>{recipe.recipe_type_name || '-'}</TableCell>
                      <TableCell>{recipe.ingredient_name}</TableCell>
                      <TableCell>{recipe.quantity_base}</TableCell>
                      <TableCell>{recipe.unit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(recipe)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(recipe.id)}
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
