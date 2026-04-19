import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  useAccountCategories,
  type AccountCategory,
  type AccountCategoryType,
} from '@/hooks/useAccountCategories';

const CategoryDialog = ({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  category?: AccountCategory | null;
}) => {
  const { addCategory, updateCategory } = useAccountCategories();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountCategoryType>('income');
  const [isSecondary, setIsSecondary] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name || '');
      setType(category?.type || 'income');
      setIsSecondary(category?.is_secondary_income || false);
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category) {
      await updateCategory(category.id, { name, type, is_secondary_income: isSecondary });
    } else {
      await addCategory({ name, type, is_secondary_income: isSecondary });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as AccountCategoryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'income' && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is-secondary-income"
                checked={isSecondary}
                onCheckedChange={(v) => setIsSecondary(v === true)}
              />
              <Label htmlFor="is-secondary-income" className="cursor-pointer">
                Is Secondary Income
              </Label>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{category ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const CategoriesPage = ({ onBack }: { onBack?: () => void }) => {
  const { categories, loading, deleteCategory } = useAccountCategories();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<AccountCategory | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const incomeCats = categories.filter((c) => c.type === 'income');
  const expenseCats = categories.filter((c) => c.type === 'expense');

  const renderCard = (c: AccountCategory) => (
    <Card key={c.id} className="p-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-foreground">{c.name}</span>
        {c.is_secondary_income && <Badge variant="outline">Secondary</Badge>}
        {!c.organization_id && <Badge variant="secondary">Default</Badge>}
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={!c.organization_id}
          onClick={() => setEditing(c)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={!c.organization_id}
          onClick={() => {
            if (confirm('Delete this category?')) deleteCategory(c.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        )}
        <h1 className="text-2xl font-bold text-foreground mb-6">Account Categories</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Income</h2>
            {incomeCats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No income categories</p>
            ) : (
              <div className="space-y-2">{incomeCats.map(renderCard)}</div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Expense</h2>
            {expenseCats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expense categories</p>
            ) : (
              <div className="space-y-2">{expenseCats.map(renderCard)}</div>
            )}
          </section>
        </div>
      </div>

      <Button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CategoryDialog open={showAdd} onOpenChange={setShowAdd} />
      {editing && (
        <CategoryDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} category={editing} />
      )}
    </div>
  );
};
