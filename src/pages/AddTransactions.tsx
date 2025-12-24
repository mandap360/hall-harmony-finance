import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarDays, ShoppingCart, CreditCard, ArrowLeftRight, Receipt, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccounts";
import { useVendors } from "@/hooks/useVendors";
import { useCategories } from "@/hooks/useCategories";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type VoucherType = 'purchase' | 'payment' | 'fund-transfer' | 'sales' | 'receipt';

interface VoucherOption {
  id: VoucherType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const VOUCHER_TYPES: VoucherOption[] = [
  {
    id: 'purchase',
    label: 'Purchase Voucher',
    description: 'Record purchase of goods/services',
    icon: <ShoppingCart className="h-6 w-6" />,
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  },
  {
    id: 'payment',
    label: 'Payment Voucher',
    description: 'Pay vendors/suppliers',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'bg-red-500/10 text-red-600 border-red-500/20'
  },
  {
    id: 'fund-transfer',
    label: 'Fund Transfer',
    description: 'Transfer between accounts',
    icon: <ArrowLeftRight className="h-6 w-6" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  {
    id: 'sales',
    label: 'Sales Voucher',
    description: 'Record sales transactions',
    icon: <Receipt className="h-6 w-6" />,
    color: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  {
    id: 'receipt',
    label: 'Receipt Voucher',
    description: 'Receive payments',
    icon: <Wallet className="h-6 w-6" />,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
  }
];

export default function AddTransactions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { accounts } = useAccounts();
  const { vendors } = useVendors();
  const { getExpenseCategories } = useCategories();
  const { categories: incomeCategories } = useIncomeCategories();
  const expenseCategories = getExpenseCategories();

  const [selectedVoucher, setSelectedVoucher] = useState<VoucherType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Common fields
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  
  // Purchase/Payment specific
  const [vendorId, setVendorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [billNumber, setBillNumber] = useState("");
  
  // Fund transfer specific
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  
  // Sales/Receipt specific
  const [accountId, setAccountId] = useState("");
  const [incomeCategoryId, setIncomeCategoryId] = useState("");

  const resetForm = () => {
    setDate(new Date());
    setAmount("");
    setDescription("");
    setVendorId("");
    setCategoryId("");
    setBillNumber("");
    setFromAccountId("");
    setToAccountId("");
    setAccountId("");
    setIncomeCategoryId("");
  };

  const handleVoucherSelect = (type: VoucherType) => {
    setSelectedVoucher(type);
    resetForm();
  };

  const handleBack = () => {
    if (selectedVoucher) {
      setSelectedVoucher(null);
      resetForm();
    } else {
      navigate('/transactions');
    }
  };

  const handleSubmit = async () => {
    if (!selectedVoucher || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedAmount = parseFloat(amount);

      switch (selectedVoucher) {
        case 'purchase': {
          if (!vendorId || !categoryId) {
            toast({ title: "Error", description: "Please select vendor and category", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          const vendor = vendors.find(v => v.id === vendorId);
          await supabase.from('expenses').insert({
            vendor_name: vendor?.businessName || '',
            bill_number: billNumber || `PUR-${Date.now()}`,
            expense_date: format(date, 'yyyy-MM-dd'),
            category_id: categoryId,
            amount: parsedAmount,
            total_amount: parsedAmount,
            organization_id: profile?.organization_id,
            is_paid: false
          });
          break;
        }
        
        case 'payment': {
          if (!vendorId || !accountId) {
            toast({ title: "Error", description: "Please select vendor and account", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          const vendor = vendors.find(v => v.id === vendorId);
          const defaultCategory = expenseCategories.find(c => !c.parent_id);
          
          await supabase.from('expenses').insert({
            vendor_name: vendor?.businessName || '',
            bill_number: billNumber || `PAY-${Date.now()}`,
            expense_date: format(date, 'yyyy-MM-dd'),
            category_id: categoryId || defaultCategory?.id,
            amount: parsedAmount,
            total_amount: parsedAmount,
            organization_id: profile?.organization_id,
            is_paid: true,
            account_id: accountId,
            payment_date: format(date, 'yyyy-MM-dd')
          });

          await supabase.from('transactions').insert({
            account_id: accountId,
            amount: parsedAmount,
            transaction_type: 'expense',
            transaction_date: format(date, 'yyyy-MM-dd'),
            description: `Payment to ${vendor?.businessName || 'vendor'}`
          });
          break;
        }
        
        case 'fund-transfer': {
          if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) {
            toast({ title: "Error", description: "Please select different accounts for transfer", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          
          // Debit from source
          await supabase.from('transactions').insert({
            account_id: fromAccountId,
            amount: parsedAmount,
            transaction_type: 'transfer_out',
            transaction_date: format(date, 'yyyy-MM-dd'),
            description: description || 'Fund Transfer',
            reference_type: 'transfer'
          });

          // Credit to destination
          await supabase.from('transactions').insert({
            account_id: toAccountId,
            amount: parsedAmount,
            transaction_type: 'transfer_in',
            transaction_date: format(date, 'yyyy-MM-dd'),
            description: description || 'Fund Transfer',
            reference_type: 'transfer'
          });
          break;
        }
        
        case 'sales': {
          if (!incomeCategoryId) {
            toast({ title: "Error", description: "Please select a category", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          
          await supabase.from('secondary_income').insert({
            amount: parsedAmount,
            category_id: incomeCategoryId,
            organization_id: profile?.organization_id
          });

          if (accountId) {
            await supabase.from('transactions').insert({
              account_id: accountId,
              amount: parsedAmount,
              transaction_type: 'income',
              transaction_date: format(date, 'yyyy-MM-dd'),
              description: description || 'Sales'
            });
          }
          break;
        }
        
        case 'receipt': {
          if (!accountId) {
            toast({ title: "Error", description: "Please select an account", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          
          await supabase.from('transactions').insert({
            account_id: accountId,
            amount: parsedAmount,
            transaction_type: 'income',
            transaction_date: format(date, 'yyyy-MM-dd'),
            description: description || 'Receipt'
          });

          if (incomeCategoryId) {
            await supabase.from('secondary_income').insert({
              amount: parsedAmount,
              category_id: incomeCategoryId,
              organization_id: profile?.organization_id
            });
          }
          break;
        }
      }

      toast({
        title: "Success",
        description: `${VOUCHER_TYPES.find(v => v.id === selectedVoucher)?.label} created successfully`
      });
      
      navigate('/transactions');
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: "Error",
        description: "Failed to create voucher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVoucherSelection = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Select Voucher Type</h2>
      <div className="grid gap-3">
        {VOUCHER_TYPES.map((voucher) => (
          <Card 
            key={voucher.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border-2",
              voucher.color
            )}
            onClick={() => handleVoucherSelect(voucher.id)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn("p-3 rounded-full", voucher.color)}>
                {voucher.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{voucher.label}</h3>
                <p className="text-sm text-muted-foreground">{voucher.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCommonFields = () => (
    <>
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarDays className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Amount *</Label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Enter description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </>
  );

  const renderPurchaseForm = () => (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Vendor *</Label>
        <Select value={vendorId} onValueChange={setVendorId}>
          <SelectTrigger>
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors.map(vendor => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.businessName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bill Number</Label>
        <Input
          placeholder="Enter bill number"
          value={billNumber}
          onChange={(e) => setBillNumber(e.target.value)}
        />
      </div>

      {renderCommonFields()}

      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.filter(c => !c.parent_id).map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Vendor *</Label>
        <Select value={vendorId} onValueChange={setVendorId}>
          <SelectTrigger>
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors.map(vendor => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.businessName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderCommonFields()}

      <div className="space-y-2">
        <Label>Pay From Account *</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.filter(c => !c.parent_id).map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderFundTransferForm = () => (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>From Account *</Label>
        <Select value={fromAccountId} onValueChange={setFromAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select source account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>To Account *</Label>
        <Select value={toAccountId} onValueChange={setToAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select destination account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.filter(a => a.id !== fromAccountId).map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderCommonFields()}
    </div>
  );

  const renderSalesForm = () => (
    <div className="p-4 space-y-4">
      {renderCommonFields()}

      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={incomeCategoryId} onValueChange={setIncomeCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {incomeCategories.filter(c => !c.parent_id).map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Receive In Account</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select account (optional)" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderReceiptForm = () => (
    <div className="p-4 space-y-4">
      {renderCommonFields()}

      <div className="space-y-2">
        <Label>Receive In Account *</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={incomeCategoryId} onValueChange={setIncomeCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {incomeCategories.filter(c => !c.parent_id).map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderVoucherForm = () => {
    switch (selectedVoucher) {
      case 'purchase':
        return renderPurchaseForm();
      case 'payment':
        return renderPaymentForm();
      case 'fund-transfer':
        return renderFundTransferForm();
      case 'sales':
        return renderSalesForm();
      case 'receipt':
        return renderReceiptForm();
      default:
        return null;
    }
  };

  const selectedVoucherInfo = VOUCHER_TYPES.find(v => v.id === selectedVoucher);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {selectedVoucher ? selectedVoucherInfo?.label : 'Add Transaction'}
          </h1>
          {selectedVoucher && (
            <p className="text-sm text-muted-foreground">{selectedVoucherInfo?.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      {!selectedVoucher ? renderVoucherSelection() : (
        <>
          {renderVoucherForm()}
          
          {/* Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : `Create ${selectedVoucherInfo?.label}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
