import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSharedStore, createSingleFlight } from '@/hooks/useSharedState';
import {
  showErrorToast,
  toastAddError,
  toastDeleteError,
  toastFetchError,
  toastUpdateError,
  toastAdded,
  toastDeleted,
  toastUpdated,
} from '@/utils/toastHelpers';
import { ENTITY_NAMES, VALIDATION_MESSAGES } from '@/utils/messages';

export type AccountCategoryType = 'income' | 'expense';

export interface AccountCategory {
  id: string;
  name: string;
  type: AccountCategoryType;
  is_secondary_income: boolean;
  organization_id: string | null;
  is_default: boolean;
  created_at: string;
}

interface State {
  categories: AccountCategory[];
  loading: boolean;
  orgId: string | null;
}

const store = createSharedStore<State>({ categories: [], loading: true, orgId: null });
const singleFlight = createSingleFlight<void>();

const fetchAll = async (orgId: string) => {
  const { data, error } = await supabase
    .from('AccountCategories')
    .select('*')
    .or(`organization_id.is.null,organization_id.eq.${orgId}`)
    .order('type', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  store.set({ categories: (data || []) as AccountCategory[], loading: false, orgId });
};

export const useAccountCategories = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const state = store.useStore();

  useEffect(() => {
    const orgId = profile?.organization_id;
    if (!orgId) {
      store.set({ categories: [], loading: false, orgId: null });
      return;
    }
    if (state.orgId === orgId && state.categories.length > 0) return;
    singleFlight(() => fetchAll(orgId)).catch((err) => {
      console.error('Error fetching account categories:', err);
      store.set({ categories: [], loading: false, orgId });
      toastFetchError(toast, ENTITY_NAMES.categories);
    });
  }, [profile?.organization_id, state.orgId, state.categories.length, toast]);

  const refetch = async () => {
    if (!profile?.organization_id) return;
    await fetchAll(profile.organization_id);
  };

  const addCategory = async (data: {
    name: string;
    type: AccountCategoryType;
    is_secondary_income?: boolean;
  }) => {
    if (!profile?.organization_id) return;
    try {
      const { error } = await supabase.from('AccountCategories').insert([
        {
          name: data.name,
          type: data.type,
          is_secondary_income: data.is_secondary_income || false,
          organization_id: profile.organization_id,
          is_default: false,
        },
      ]);
      if (error) throw error;
      await refetch();
      toastAdded(toast, 'Category');
    } catch (error) {
      console.error('Error adding category:', error);
      toastAddError(toast, ENTITY_NAMES.category);
    }
  };

  const updateCategory = async (
    id: string,
    data: Partial<Pick<AccountCategory, 'name' | 'type' | 'is_secondary_income'>>,
  ) => {
    const cat = state.categories.find((c) => c.id === id);
    if (cat && !cat.organization_id) {
      showErrorToast(toast, '', VALIDATION_MESSAGES.cannotEditDefaultCategory.title);
      return;
    }
    try {
      const { error } = await supabase.from('AccountCategories').update(data).eq('id', id);
      if (error) throw error;
      await refetch();
      toastUpdated(toast, 'Category');
    } catch (error) {
      console.error('Error updating category:', error);
      toastUpdateError(toast, ENTITY_NAMES.category);
    }
  };

  const deleteCategory = async (id: string) => {
    const cat = state.categories.find((c) => c.id === id);
    if (cat && !cat.organization_id) {
      showErrorToast(toast, '', VALIDATION_MESSAGES.cannotDeleteDefaultCategory.title);
      return;
    }
    try {
      const { error } = await supabase.from('AccountCategories').delete().eq('id', id);
      if (error) throw error;
      await refetch();
      toastDeleted(toast, 'Category');
    } catch (error) {
      console.error('Error deleting category:', error);
      toastDeleteError(toast, ENTITY_NAMES.category);
    }
  };

  return {
    categories: state.categories,
    incomeCategories: state.categories.filter((c) => c.type === 'income'),
    expenseCategories: state.categories.filter((c) => c.type === 'expense'),
    secondaryIncomeCategories: state.categories.filter((c) => c.is_secondary_income),
    loading: state.loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch,
  };
};
