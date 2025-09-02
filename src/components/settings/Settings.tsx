
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit, 
  Trash2,
  Building,
  Car,
  Laptop,
  Package,
  CreditCard,
  Link,
  Search
} from "lucide-react";

const sb = supabase as any;

interface AssetType {
  id: string;
  name: string;
  description: string;
}

interface Asset {
  id: string;
  name: string;
  asset_type_id: string;
  asset_types: AssetType;
  value: number;
  status: string;
  location: string;
  description: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

interface BankAccount {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
}

interface AssetBankAccount {
  id: string;
  asset_id: string;
  bank_account_id: string;
  is_primary: boolean;
  bank_accounts: BankAccount;
}

export const Settings = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [assetBankAccounts, setAssetBankAccounts] = useState<AssetBankAccount[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch assets from 'asset' table and map to expected shape
      const { data: assetsData, error: assetsError } = await sb
        .from('asset')
        .select('assetid, name, type, activecontractid')
        .order('name', { ascending: true });

      if (assetsError) throw assetsError;

      const mappedAssets = (assetsData || []).map((a: any) => ({
        id: a.assetid,
        name: a.name,
        asset_types: { name: a.type } as any,
        value: null,
        status: 'active',
        location: '',
        description: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
      }));

      setAssets(mappedAssets);

      // Initialize other datasets as empty since related tables are not present in the schema
      setAssetTypes([]);
      setBankAccounts([]);
      setAssetBankAccounts([]);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAsset = async (assetData: Partial<Asset>) => {
    if (!selectedAsset) return;

    try {
      const { error } = await sb
        .from('assets')
        .update({
          name: assetData.name,
          value: assetData.value,
          status: assetData.status,
          location: assetData.location,
          description: assetData.description,
          contact_name: assetData.contact_name,
          contact_email: assetData.contact_email,
          contact_phone: assetData.contact_phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAsset.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive",
      });
    }
  };

  const handleLinkBankAccount = async (bankAccountId: string, isPrimary: boolean = false) => {
    if (!selectedAsset) return;

    try {
      const { error } = await sb
        .from('asset_bank_accounts')
        .insert({
          asset_id: selectedAsset.id,
          bank_account_id: bankAccountId,
          is_primary: isPrimary
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bank account linked successfully",
      });

      setIsBankDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error linking bank account:', error);
      toast({
        title: "Error",
        description: "Failed to link bank account",
        variant: "destructive",
      });
    }
  };

  const getAssetIcon = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'real estate':
        return <Building className="h-4 w-4" />;
      case 'vehicles':
        return <Car className="h-4 w-4" />;
      case 'equipment':
        return <Laptop className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "bg-green-100 text-green-700 border-green-200";
      case 'maintenance':
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'inactive':
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getLinkedBankAccounts = (assetId: string) => {
    return assetBankAccounts.filter(link => link.asset_id === assetId);
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_types.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-gray-600 mt-1">Manage all assets and their properties</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assets by name, type, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assets Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Bank Accounts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => {
                const linkedBanks = getLinkedBankAccounts(asset.id);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAssetIcon(asset.asset_types.name)}
                        <span className="font-medium">{asset.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{asset.asset_types.name}</TableCell>
                    <TableCell>${asset.value?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{asset.location || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{asset.contact_name || 'N/A'}</div>
                        <div className="text-gray-500">{asset.contact_email || ''}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{linkedBanks.length} linked</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setIsBankDialogOpen(true);
                          }}
                        >
                          <Link className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <EditAssetForm
              asset={selectedAsset}
              onSave={handleUpdateAsset}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bank Account Linking Dialog */}
      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Bank Accounts</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <BankAccountManager
              asset={selectedAsset}
              bankAccounts={bankAccounts}
              linkedAccounts={getLinkedBankAccounts(selectedAsset.id)}
              onLink={handleLinkBankAccount}
              onCancel={() => setIsBankDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EditAssetForm = ({ asset, onSave, onCancel }: {
  asset: Asset;
  onSave: (data: Partial<Asset>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: asset.name,
    value: asset.value || 0,
    status: asset.status,
    location: asset.location || '',
    description: asset.description || '',
    contact_name: asset.contact_name || '',
    contact_email: asset.contact_email || '',
    contact_phone: asset.contact_phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Asset Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input
            id="contact_name"
            value={formData.contact_name}
            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact_phone">Contact Phone</Label>
        <Input
          id="contact_phone"
          value={formData.contact_phone}
          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

const BankAccountManager = ({ asset, bankAccounts, linkedAccounts, onLink, onCancel }: {
  asset: Asset;
  bankAccounts: BankAccount[];
  linkedAccounts: AssetBankAccount[];
  onLink: (bankAccountId: string, isPrimary: boolean) => void;
  onCancel: () => void;
}) => {
  const [selectedBankId, setSelectedBankId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const availableBanks = bankAccounts.filter(bank => 
    !linkedAccounts.some(link => link.bank_account_id === bank.id)
  );

  const handleLink = () => {
    if (selectedBankId) {
      onLink(selectedBankId, isPrimary);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Currently Linked Bank Accounts</h3>
        {linkedAccounts.length === 0 ? (
          <p className="text-gray-500 text-sm">No bank accounts linked</p>
        ) : (
          <div className="space-y-2">
            {linkedAccounts.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">{link.bank_accounts.account_name}</div>
                  <div className="text-sm text-gray-500">{link.bank_accounts.bank_name}</div>
                </div>
                {link.is_primary && <Badge>Primary</Badge>}
              </div>
            ))}
          </div>
        )}
      </div>

      {availableBanks.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Link New Bank Account</h3>
          <div className="space-y-3">
            <div>
              <Label>Select Bank Account</Label>
              <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bank account" />
                </SelectTrigger>
                <SelectContent>
                  {availableBanks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.account_name} - {bank.bank_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="primary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
              <Label htmlFor="primary">Set as primary account</Label>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Close</Button>
        {selectedBankId && (
          <Button onClick={handleLink}>
            <CreditCard className="h-4 w-4 mr-2" />
            Link Account
          </Button>
        )}
      </div>
    </div>
  );
};
