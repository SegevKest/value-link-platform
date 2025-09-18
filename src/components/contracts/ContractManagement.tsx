import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Trash2, RotateCcw, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Asset { assetid: string; name: string }
interface Owner { propertyownerid: string; name: string }
interface Tenant { tenantid: string; name: string; email?: string | null; phone?: string | null }
interface ContractRow {
  contractid: string;
  assetid: string;
  tenantid: string;
  propertyownerid: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
  created_at: string;
  deleted_at: string | null;
}

interface ContractTerms {
  id: string;
  contract_id: string;
  start_date: string;
  end_date: string;
  follow_index: number;
  date_to_charge: string;
  base_rent: number;
}

export const ContractManagement = () => {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [deletedContracts, setDeletedContracts] = useState<ContractRow[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contractTerms, setContractTerms] = useState<ContractTerms[]>([]);
  
  const [editingContract, setEditingContract] = useState<ContractRow | null>(null);
  const [editForm, setEditForm] = useState({
    start_date: "",
    end_date: "",
    base_rent: "",
    date_to_charge: "",
    follow_index: 1
  });

  const loadData = async () => {
    const [aRes, oRes, tRes, cRes, dcRes, ctRes] = await Promise.all([
      supabase.from("asset").select("assetid,name").order("name", { ascending: true }),
      supabase.from("propertyowner").select("propertyownerid,name").order("name", { ascending: true }),
      supabase.from("tenant").select("tenantid,name,email,phone").order("name", { ascending: true }),
      supabase
        .from("contract")
        .select("contractid,assetid,tenantid,propertyownerid,start_date,end_date,is_active,created_at,deleted_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("contract")
        .select("contractid,assetid,tenantid,propertyownerid,start_date,end_date,is_active,created_at,deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false }),
      supabase
        .from("contract_terms")
        .select("id,contract_id,start_date,end_date,follow_index,date_to_charge,base_rent")
    ]);
    
    setAssets(aRes.data || []);
    setOwners(oRes.data || []);
    setTenants(tRes.data || []);
    setContracts((cRes.data as ContractRow[]) || []);
    setDeletedContracts((dcRes.data as ContractRow[]) || []);
    setContractTerms((ctRes.data as ContractTerms[]) || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (contract: ContractRow) => {
    setEditingContract(contract);
    const terms = contractTerms.find(ct => ct.contract_id === contract.contractid);
    setEditForm({
      start_date: contract.start_date || "",
      end_date: contract.end_date || "",
      base_rent: terms?.base_rent?.toString() || "0",
      date_to_charge: terms?.date_to_charge || "",
      follow_index: terms?.follow_index || 1
    });
  };

  const handleUpdate = async () => {
    if (!editingContract) return;

    try {
      toast.loading("Updating contract...", { id: "update-contract" });

      // Update contract
      const { error: contractErr } = await supabase
        .from("contract")
        .update({
          start_date: editForm.start_date,
          end_date: editForm.end_date,
        })
        .eq("contractid", editingContract.contractid);

      if (contractErr) throw new Error(`Contract update failed: ${contractErr.message}`);

      // Update contract terms
      const existingTerms = contractTerms.find(ct => ct.contract_id === editingContract.contractid);
      if (existingTerms) {
        const { error: termsErr } = await supabase
          .from("contract_terms")
          .update({
            start_date: editForm.start_date,
            end_date: editForm.end_date,
            date_to_charge: editForm.date_to_charge,
            base_rent: Number(editForm.base_rent),
            follow_index: editForm.follow_index
          })
          .eq("id", existingTerms.id);

        if (termsErr) throw new Error(`Contract terms update failed: ${termsErr.message}`);
      }

      toast.success("Contract updated successfully", { id: "update-contract" });
      setEditingContract(null);
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to update contract", { id: "update-contract" });
    }
  };

  const handleSoftDelete = async (contractId: string) => {
    try {
      toast.loading("Moving contract to trash...", { id: "delete-contract" });

      // Soft delete the contract
      const { error: deleteErr } = await supabase
        .from("contract")
        .update({ 
          deleted_at: new Date().toISOString(),
          is_active: false 
        })
        .eq("contractid", contractId);

      if (deleteErr) throw new Error(`Failed to delete contract: ${deleteErr.message}`);

      // Clear the asset's active contract
      const contract = contracts.find(c => c.contractid === contractId);
      if (contract) {
        const { error: assetErr } = await supabase
          .from("asset")
          .update({ activecontractid: null })
          .eq("assetid", contract.assetid);

        if (assetErr) throw new Error(`Failed to update asset status: ${assetErr.message}`);
      }

      toast.success("Contract moved to trash", { id: "delete-contract" });
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete contract", { id: "delete-contract" });
    }
  };

  const handleRestore = async (contractId: string) => {
    try {
      toast.loading("Restoring contract...", { id: "restore-contract" });

      const { error: restoreErr } = await supabase
        .from("contract")
        .update({ 
          deleted_at: null,
          is_active: true 
        })
        .eq("contractid", contractId);

      if (restoreErr) throw new Error(`Failed to restore contract: ${restoreErr.message}`);

      // Restore the asset's active contract
      const contract = deletedContracts.find(c => c.contractid === contractId);
      if (contract) {
        const { error: assetErr } = await supabase
          .from("asset")
          .update({ activecontractid: contractId })
          .eq("assetid", contract.assetid);

        if (assetErr) throw new Error(`Failed to update asset status: ${assetErr.message}`);
      }

      toast.success("Contract restored successfully", { id: "restore-contract" });
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to restore contract", { id: "restore-contract" });
    }
  };

  const handlePermanentDelete = async (contractId: string) => {
    try {
      toast.loading("Permanently deleting contract...", { id: "permanent-delete" });

      // Delete contract terms first
      const { error: termsErr } = await supabase
        .from("contract_terms")
        .delete()
        .eq("contract_id", contractId);

      if (termsErr) throw new Error(`Failed to delete contract terms: ${termsErr.message}`);

      // Delete the contract
      const { error: contractErr } = await supabase
        .from("contract")
        .delete()
        .eq("contractid", contractId);

      if (contractErr) throw new Error(`Failed to delete contract: ${contractErr.message}`);

      toast.success("Contract permanently deleted", { id: "permanent-delete" });
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to permanently delete contract", { id: "permanent-delete" });
    }
  };

  const handleCleanupOldDeleted = async () => {
    try {
      toast.loading("Cleaning up old deleted contracts...", { id: "cleanup" });

      const { data, error } = await supabase.rpc('cleanup_deleted_contracts');

      if (error) throw new Error(`Cleanup failed: ${error.message}`);

      toast.success(`Cleaned up ${data || 0} old contracts`, { id: "cleanup" });
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to cleanup contracts", { id: "cleanup" });
    }
  };

  const getAssetName = (assetId: string) => assets.find(a => a.assetid === assetId)?.name || "—";
  const getOwnerName = (ownerId: string) => owners.find(o => o.propertyownerid === ownerId)?.name || "—";
  const getTenantName = (tenantId: string) => tenants.find(t => t.tenantid === tenantId)?.name || "—";

  const getContractTerms = (contractId: string) => contractTerms.find(ct => ct.contract_id === contractId);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  };

  const getDaysUntilDeletion = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const deleteDate = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = Math.ceil((deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Contract Management</h1>
        <p className="text-sm text-muted-foreground">Manage all contracts, update details, and handle deletions</p>
      </header>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Contracts ({contracts.length})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({deletedContracts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active contracts found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => {
                      const terms = getContractTerms(contract.contractid);
                      return (
                        <TableRow key={contract.contractid}>
                          <TableCell className="font-medium">{getAssetName(contract.assetid)}</TableCell>
                          <TableCell>{getOwnerName(contract.propertyownerid)}</TableCell>
                          <TableCell>{getTenantName(contract.tenantid)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(contract.start_date)} →</div>
                              <div>{formatDate(contract.end_date)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {terms ? `$${terms.base_rent}` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={contract.is_active ? "default" : "secondary"}>
                              {contract.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEdit(contract)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Contract</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid gap-2">
                                      <Label>Asset: {getAssetName(contract.assetid)}</Label>
                                      <Label>Owner: {getOwnerName(contract.propertyownerid)}</Label>
                                      <Label>Tenant: {getTenantName(contract.tenantid)}</Label>
                                    </div>
                                    
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      <div>
                                        <Label htmlFor="edit-start">Start Date</Label>
                                        <Input
                                          id="edit-start"
                                          type="date"
                                          value={editForm.start_date}
                                          onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-end">End Date</Label>
                                        <Input
                                          id="edit-end"
                                          type="date"
                                          value={editForm.end_date}
                                          onChange={(e) => setEditForm(prev => ({ ...prev, end_date: e.target.value }))}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-3">
                                      <div>
                                        <Label htmlFor="edit-rent">Base Rent</Label>
                                        <Input
                                          id="edit-rent"
                                          type="number"
                                          step="0.01"
                                          value={editForm.base_rent}
                                          onChange={(e) => setEditForm(prev => ({ ...prev, base_rent: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-charge">Date to Charge</Label>
                                        <Input
                                          id="edit-charge"
                                          type="date"
                                          value={editForm.date_to_charge}
                                          onChange={(e) => setEditForm(prev => ({ ...prev, date_to_charge: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-follow">Follow Index</Label>
                                        <Input
                                          id="edit-follow"
                                          type="number"
                                          min="0"
                                          value={editForm.follow_index}
                                          onChange={(e) => setEditForm(prev => ({ ...prev, follow_index: parseInt(e.target.value) || 0 }))}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => setEditingContract(null)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleUpdate}>
                                        Update Contract
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Contract</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will move the contract to trash. It will be permanently deleted after 30 days.
                                      The associated asset will become available again.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleSoftDelete(contract.contractid)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Move to Trash
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trash" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Deleted Contracts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Contracts will be permanently deleted after 30 days
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleCleanupOldDeleted}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Cleanup Old
              </Button>
            </CardHeader>
            <CardContent>
              {deletedContracts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deleted contracts found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Deleted</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletedContracts.map((contract) => {
                      const daysLeft = getDaysUntilDeletion(contract.deleted_at!);
                      return (
                        <TableRow key={contract.contractid}>
                          <TableCell className="font-medium">{getAssetName(contract.assetid)}</TableCell>
                          <TableCell>{getOwnerName(contract.propertyownerid)}</TableCell>
                          <TableCell>{getTenantName(contract.tenantid)}</TableCell>
                          <TableCell>{formatDate(contract.deleted_at)}</TableCell>
                          <TableCell>
                            <Badge variant={daysLeft < 7 ? "destructive" : "secondary"}>
                              {daysLeft} days
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRestore(contract.contractid)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Permanently Delete Contract</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. The contract and all its terms will be permanently deleted.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handlePermanentDelete(contract.contractid)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete Forever
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};