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
// import { Plus, Pencil, Trash2, Search } from 'lucide-react';

// interface Recipe {
//   id: number;
//   name: string;
//   recipe_type_id: number | null;
//   ingredient_id: number;
//   quantity_base: number;
//   unit: string;
//   ingredient_name?: string;
//   recipe_type_name?: string;
// }

// interface Ingredient {
//   id: number;
//   name: string;
// }

// interface RecipeType {
//   id: number;
//   name: string;
// }

// export default function Recipes() {
//   const [recipes, setRecipes] = useState<Recipe[]>([]);
//   const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
//   const [ingredients, setIngredients] = useState<Ingredient[]>([]);
//   const [recipeTypes, setRecipeTypes] = useState<RecipeType[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     recipe_type_id: '',
//     ingredient_id: '',
//     quantity_base: '',
//     unit: '',
//   });
//   const { toast } = useToast();

//   useEffect(() => {
//     Promise.all([fetchRecipes(), fetchIngredients(), fetchRecipeTypes()]);
//   }, []);

//   useEffect(() => {
//     const filtered = recipes.filter((recipe) =>
//       recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       recipe.ingredient_name?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredRecipes(filtered);
//   }, [searchTerm, recipes]);

//   const fetchRecipes = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('recipes')
//         .select(`
//           *,
//           ingredients (name),
//           recipe_types (name)
//         `)
//         .order('name');

//       if (error) throw error;
      
//       const mappedData = (data || []).map(item => ({
//         ...item,
//         ingredient_name: (item.ingredients as any)?.name,
//         recipe_type_name: (item.recipe_types as any)?.name,
//       }));
      
//       setRecipes(mappedData);
//       setFilteredRecipes(mappedData);
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

//   const fetchIngredients = async () => {
//     const { data } = await supabase.from('ingredients').select('*').order('name');
//     setIngredients(data || []);
//   };

//   const fetchRecipeTypes = async () => {
//     const { data } = await supabase.from('recipe_types').select('*').order('name');
//     setRecipeTypes(data || []);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const payload = {
//         name: formData.name,
//         recipe_type_id: formData.recipe_type_id ? Number(formData.recipe_type_id) : null,
//         ingredient_id: Number(formData.ingredient_id),
//         quantity_base: Number(formData.quantity_base),
//         unit: formData.unit,
//       };

//       if (editingRecipe) {
//         const { error } = await supabase
//           .from('recipes')
//           .update(payload)
//           .eq('id', editingRecipe.id);

//         if (error) throw error;
//         toast({ title: 'Success', description: 'Recipe line updated successfully.' });
//       } else {
//         const { error } = await supabase.from('recipes').insert([payload]);

//         if (error) throw error;
//         toast({ title: 'Success', description: 'Recipe line created successfully.' });
//       }

//       setDialogOpen(false);
//       resetForm();
//       fetchRecipes();
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this recipe line?')) return;

//     try {
//       const { error } = await supabase.from('recipes').delete().eq('id', id);

//       if (error) throw error;
//       toast({ title: 'Success', description: 'Recipe line deleted successfully.' });
//       fetchRecipes();
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
//       name: '',
//       recipe_type_id: '',
//       ingredient_id: '',
//       quantity_base: '',
//       unit: '',
//     });
//     setEditingRecipe(null);
//   };

//   const openDialog = (recipe?: Recipe) => {
//     if (recipe) {
//       setEditingRecipe(recipe);
//       setFormData({
//         name: recipe.name,
//         recipe_type_id: recipe.recipe_type_id?.toString() || '',
//         ingredient_id: recipe.ingredient_id.toString(),
//         quantity_base: recipe.quantity_base.toString(),
//         unit: recipe.unit,
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
//           <h1 className="text-3xl font-bold text-foreground">Recipes</h1>
//           <p className="text-muted-foreground">Manage recipe ingredient lines</p>
//         </div>
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button onClick={() => openDialog()} className="gap-2">
//               <Plus className="h-4 w-4" />
//               Add Recipe Line
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl">
//             <form onSubmit={handleSubmit}>
//               <DialogHeader>
//                 <DialogTitle>{editingRecipe ? 'Edit' : 'Add'} Recipe Line</DialogTitle>
//                 <DialogDescription>
//                   Each line represents one ingredient in a recipe.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="name">Recipe Name</Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       placeholder="e.g., Caesar Dressing"
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="recipe_type_id">Recipe Type</Label>
//                     <Select
//                       value={formData.recipe_type_id}
//                       onValueChange={(value) => setFormData({ ...formData, recipe_type_id: value })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {recipeTypes.map((type) => (
//                           <SelectItem key={type.id} value={type.id.toString()}>
//                             {type.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="space-y-2 col-span-2">
//                     <Label htmlFor="ingredient_id">Ingredient</Label>
//                     <Select
//                       value={formData.ingredient_id}
//                       onValueChange={(value) => setFormData({ ...formData, ingredient_id: value })}
//                       required
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select ingredient" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {ingredients.map((ing) => (
//                           <SelectItem key={ing.id} value={ing.id.toString()}>
//                             {ing.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="unit">Unit</Label>
//                     <Input
//                       id="unit"
//                       value={formData.unit}
//                       onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
//                       placeholder="g, ml, units"
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="quantity_base">Quantity</Label>
//                   <Input
//                     id="quantity_base"
//                     type="number"
//                     step="0.001"
//                     value={formData.quantity_base}
//                     onChange={(e) => setFormData({ ...formData, quantity_base: e.target.value })}
//                     placeholder="e.g., 100"
//                     required
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button type="submit">{editingRecipe ? 'Update' : 'Create'}</Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardHeader>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search recipes or ingredients..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-9"
//             />
//           </div>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="text-center py-8 text-muted-foreground">Loading...</div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Recipe Name</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Ingredient</TableHead>
//                   <TableHead>Quantity</TableHead>
//                   <TableHead>Unit</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredRecipes.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center text-muted-foreground">
//                       No recipes found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredRecipes.map((recipe) => (
//                     <TableRow key={recipe.id}>
//                       <TableCell className="font-medium">{recipe.name}</TableCell>
//                       <TableCell>{recipe.recipe_type_name || '-'}</TableCell>
//                       <TableCell>{recipe.ingredient_name}</TableCell>
//                       <TableCell>{recipe.quantity_base}</TableCell>
//                       <TableCell>{recipe.unit}</TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => openDialog(recipe)}
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => handleDelete(recipe.id)}
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, Save, X } from 'lucide-react';

interface RecipeLine {
  id?: number;
  name: string;                 // recipe name
  recipe_type_id: number | null;
  ingredient_id: number;
  quantity_base: number;
  unit: string;
  ingredient_name?: string;     // joined
}

interface Ingredient {
  id: number;
  name: string;
}

interface RecipeType {
  id: number;
  name: string;
}

type GroupedRecipe = {
  name: string;
  recipe_type_id: number | null;
  recipe_type_name?: string;
  lines: RecipeLine[];
};

// fix: unidades disponibles para el Select
const UNITS = ['g', 'ml', 'units', 'L', 'box', 'kg', 'tbsp', 'tsp'] as const;

export default function Recipes() {
  const [allLines, setAllLines] = useState<RecipeLine[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeTypes, setRecipeTypes] = useState<RecipeType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // fix: modal de edición por receta (agrupada)
  const [editOpen, setEditOpen] = useState(false);
  const [originalIds, setOriginalIds] = useState<number[]>([]);
  const [editRecipeName, setEditRecipeName] = useState<string>('');
  const [editRecipeTypeId, setEditRecipeTypeId] = useState<number | null>(null);
  const [editLines, setEditLines] = useState<RecipeLine[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchLines(), fetchIngredients(), fetchRecipeTypes()]);
  }, []);

  const fetchLines = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`id, name, recipe_type_id, ingredient_id, quantity_base, unit, ingredients(name), recipe_types(name)`)
        .order('name');

      if (error) throw error;

      const mapped: RecipeLine[] = (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        recipe_type_id: r.recipe_type_id,
        ingredient_id: r.ingredient_id,
        quantity_base: r.quantity_base,
        unit: r.unit,
        ingredient_name: r.ingredients?.name,
      }));

      setAllLines(mapped);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
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

  // fix: agrupar por nombre de receta para la tabla principal
  const grouped = useMemo<GroupedRecipe[]>(() => {
    const map = new Map<string, GroupedRecipe>();
    for (const line of allLines) {
      const key = line.name;
      if (!map.has(key)) {
        map.set(key, {
          name: key,
          recipe_type_id: line.recipe_type_id,
          recipe_type_name: recipeTypes.find(t => t.id === line.recipe_type_id)?.name,
          lines: []
        });
      }
      map.get(key)!.lines.push(line);
    }
    let list = Array.from(map.values());
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [allLines, recipeTypes, searchTerm]);

  // fix: abrir modal de edición por receta
  const openEdit = (recipe: GroupedRecipe) => {
    setEditRecipeName(recipe.name);
    setEditRecipeTypeId(recipe.recipe_type_id ?? null);
    const lines = recipe.lines.map(l => ({ ...l })); // clone
    setEditLines(lines);
    setOriginalIds(lines.filter(l => l.id != null).map(l => l.id!));
    setEditOpen(true);
  };

  // fix: agregar línea en modal (unit por defecto "g")
  const addLine = () => {
    if (!ingredients.length) return;
    const firstIng = ingredients[0];
    setEditLines(prev => [
      ...prev,
      {
        name: editRecipeName,
        recipe_type_id: editRecipeTypeId,
        ingredient_id: firstIng.id,
        quantity_base: 0,
        unit: 'g', // fix: default
        ingredient_name: firstIng.name
      }
    ]);
  };

  // fix: eliminar línea (del modal solamente)
  const removeLine = (idx: number) => {
    setEditLines(prev => prev.filter((_, i) => i !== idx));
  };

  // fix: cambiar valores de línea
  const updateLine = (idx: number, patch: Partial<RecipeLine>) => {
    setEditLines(prev => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], ...patch };
      return arr;
    });
  };

  // reemplaza TODO el saveRecipe por esto
  const saveRecipe = async () => {
    try {
      // validar
      if (!editRecipeName.trim()) {
        toast({ title: 'Name required', description: 'Recipe name cannot be empty', variant: 'destructive' });
        return;
      }
      if (editLines.length === 0) {
        toast({ title: 'No lines', description: 'Add at least one ingredient line', variant: 'destructive' });
        return;
      }

      // fix: normaliza cantidad (soporta "2,5") y prepara objeto limpio
      const normalizeQty = (q: any) => {
        if (typeof q === 'string') q = q.replace(',', '.');
        const n = Number(q);
        return Number.isFinite(n) ? n : 0;
      };

      const sanitize = (l: any) => ({
        // ¡no incluir id en inserts!
        name: editRecipeName.trim(),
        recipe_type_id: editRecipeTypeId ?? null,
        ingredient_id: l.ingredient_id,
        quantity_base: normalizeQty(l.quantity_base),
        unit: (l.unit ?? '').trim()
      });

      // mapear líneas
      const prepared = editLines.map(l => ({
        id: l.id, // sólo para updates/deletes
        ...sanitize(l)
      }));

      const currentIds = prepared.filter(p => p.id != null).map(p => p.id!);
      const toDelete = originalIds.filter(id => !currentIds.includes(id));

      // DELETE los que ya no están
      if (toDelete.length) {
        const { error: delErr } = await supabase.from('recipes').delete().in('id', toDelete);
        if (delErr) throw delErr;
      }

      // UPDATE los que tienen id
      const updates = prepared.filter(p => p.id != null);
      for (const row of updates) {
        const { id, ...payload } = row; // fix: quitar id del payload
        const { error } = await supabase.from('recipes').update(payload).eq('id', id as number);
        if (error) throw error;
      }

      // INSERT los nuevos sin id
      const insertsRaw = prepared.filter(p => p.id == null);
      if (insertsRaw.length) {
        const inserts = insertsRaw.map(({ id, ...rest }) => rest); // fix: eliminar id explícitamente
        const { error: insErr } = await supabase.from('recipes').insert(inserts);
        if (insErr) throw insErr;
      }

      toast({ title: 'Saved', description: 'Recipe updated successfully.' });
      setEditOpen(false);
      await fetchLines();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // fix: eliminar receta completa (todas sus líneas)
  const deleteRecipe = async (recipe: GroupedRecipe) => {
    if (!confirm(`Delete ALL lines of recipe "${recipe.name}"?`)) return;
    try {
      const ids = recipe.lines.map(l => l.id!).filter(Boolean);
      if (ids.length) {
        const { error } = await supabase.from('recipes').delete().in('id', ids);
        if (error) throw error;
      }
      toast({ title: 'Deleted', description: 'Recipe removed.' });
      await fetchLines();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recipes</h1>
          <p className="text-muted-foreground">Manage recipes (grouped). Edit a recipe to manage its ingredient lines.</p>
        </div>

        {/* fix: crear una receta vacía rápidamente */}
        <Button
          className="gap-2"
          onClick={() => {
            setEditRecipeName('');
            setEditRecipeTypeId(null);
            setEditLines([]);
            setOriginalIds([]);
            setEditOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New Recipe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
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
                  {/* fix: solo nombre */}
                  <TableHead>Recipe Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No recipes found
                    </TableCell>
                  </TableRow>
                ) : (
                  grouped.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteRecipe(r)}>
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

      {/* fix: modal de edición de receta (header fijo, cuerpo con scroll, footer fijo) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl md:max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Edit Recipe</DialogTitle>
            <DialogDescription>Change recipe info and manage its ingredient lines.</DialogDescription>
          </DialogHeader>

          {/* cuerpo scrolleable */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipe Name</Label>
                <Input
                  value={editRecipeName}
                  onChange={(e) => {
                    setEditRecipeName(e.target.value);
                    setEditLines(prev => prev.map(l => ({ ...l, name: e.target.value })));
                  }}
                  placeholder="e.g., Caesar Dressing"
                />
              </div>
              <div className="space-y-2">
                <Label>Recipe Type</Label>
                <Select
                  value={editRecipeTypeId != null ? String(editRecipeTypeId) : ''}
                  onValueChange={(v) => {
                    const val = v ? Number(v) : null;
                    setEditRecipeTypeId(val);
                    setEditLines(prev => prev.map(l => ({ ...l, recipe_type_id: val })));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipeTypes.map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base">Ingredients</Label>
                <Button variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Ingredient</TableHead>
                    <TableHead className="w-[20%]">Quantity</TableHead>
                    <TableHead className="w-[20%]">Unit</TableHead>
                    <TableHead className="text-right w-[20%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editLines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No ingredient lines yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    editLines.map((line, idx) => (
                      <TableRow key={line.id ?? `new-${idx}`}>
                        <TableCell>
                          <Select
                            value={String(line.ingredient_id)}
                            onValueChange={(val) => {
                              const id = Number(val);
                              const ing = ingredients.find(i => i.id === id);
                              updateLine(idx, { ingredient_id: id, ingredient_name: ing?.name });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select ingredient" />
                            </SelectTrigger>
                            <SelectContent>
                              {ingredients.map(ing => (
                                <SelectItem key={ing.id} value={String(ing.id)}>{ing.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            step="0.001"
                            value={String(line.quantity_base)}
                            onChange={(e) => updateLine(idx, { quantity_base: Number(e.target.value) })}
                          />
                        </TableCell>

                        {/* fix: Unit como Select */}
                        <TableCell>
                          <Select
                            value={line.unit || ''}
                            onValueChange={(val) => updateLine(idx, { unit: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {UNITS.map(u => (
                                <SelectItem key={u} value={u}>{u}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button variant="destructive" size="sm" onClick={() => removeLine(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* footer fijo */}
          <DialogFooter className="shrink-0 bg-background pt-4 border-t">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Close
            </Button>
            <Button onClick={saveRecipe}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
