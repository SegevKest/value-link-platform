import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Minimal types based on DB schema summary
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
}

export const ContractCreation = () => {
  // Selections and toggles
  const [assets, setAssets] = useState<Asset[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [assetId, setAssetId] = useState("");

  const [createNewOwner, setCreateNewOwner] = useState(false);
  const [ownerId, setOwnerId] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const [createNewTenant, setCreateNewTenant] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [followIndex, setFollowIndex] = useState<number>(1);
  const [dateToCharge, setDateToCharge] = useState("");
  const [baseRent, setBaseRent] = useState("0");

// Contracts list state
const [contracts, setContracts] = useState<ContractRow[]>([]);

const isFormValid = useMemo(() => {
  if (!assetId) return false;
  if (createNewOwner) {
    if (!ownerName.trim()) return false;
  } else if (!ownerId) return false;

  if (createNewTenant) {
    if (!tenantName.trim()) return false;
  } else if (!tenantId) return false;

  return !!startDate && !!endDate && !!dateToCharge && !!baseRent;
}, [assetId, createNewOwner, ownerId, ownerName, createNewTenant, tenantId, tenantName, startDate, endDate, dateToCharge, baseRent]);

  useEffect(() => {
const load = async () => {
  const [aRes, oRes, tRes, cRes] = await Promise.all([
    supabase.from("asset").select("assetid,name").order("name", { ascending: true }),
    supabase.from("propertyowner").select("propertyownerid,name").order("name", { ascending: true }),
    supabase.from("tenant").select("tenantid,name,email,phone").order("name", { ascending: true }),
    supabase
      .from("contract")
      .select("contractid,assetid,tenantid,propertyownerid,start_date,end_date,is_active,created_at")
      .order("created_at", { ascending: false }),
  ]);
  setAssets(aRes.data || []);
  setOwners(oRes.data || []);
  setTenants(tRes.data || []);
  setContracts((cRes.data as ContractRow[]) || []);
};
load();
  }, []);

  const handleCreateWorkflow = async () => {
    if (!isFormValid) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      toast.loading("Creating contract...", { id: "create-contract" });

      // Ensure Owner
      let ensuredOwnerId = ownerId;
      if (createNewOwner) {
        ensuredOwnerId = crypto.randomUUID();
        const { error: ownerErr } = await supabase
          .from("propertyowner")
          .insert({ propertyownerid: ensuredOwnerId, name: ownerName.trim() });
        if (ownerErr) throw new Error(`Owner creation failed: ${ownerErr.message}`);
      }

      // Ensure Tenant (+ Contact linked to Asset)
      let ensuredTenantId = tenantId;
      if (createNewTenant) {
        ensuredTenantId = crypto.randomUUID();
        const { error: tenantErr } = await supabase
          .from("tenant")
          .insert({ tenantid: ensuredTenantId, name: tenantName.trim(), email: tenantEmail || null, phone: tenantPhone || null });
        if (tenantErr) throw new Error(`Tenant creation failed: ${tenantErr.message}`);

        const { error: contactErr } = await supabase
          .from("contact")
          .insert({
            assetid: assetId,
            name: tenantName.trim(),
            email: tenantEmail || null,
            phone: tenantPhone || null,
            contact_type: "tenant",
          });
        if (contactErr) throw new Error(`Contact creation failed: ${contactErr.message}`);
      }

      // Create Contract
      const { data: contractRow, error: contractErr } = await supabase
        .from("contract")
        .insert({
          assetid: assetId,
          tenantid: ensuredTenantId,
          propertyownerid: ensuredOwnerId,
          start_date: startDate,
          end_date: endDate,
          is_active: true,
        })
        .select("contractid")
        .maybeSingle();

      if (contractErr) throw new Error(`Contract creation failed: ${contractErr.message}`);
      if (!contractRow) throw new Error("Contract was not created");

      // Create Contract Terms
      const { error: termsErr } = await supabase
        .from("contract_terms")
        .insert({
          contract_id: contractRow.contractid,
          start_date: startDate,
          end_date: endDate,
          follow_index: followIndex,
          date_to_charge: dateToCharge,
          base_rent: Number(baseRent),
        });
      if (termsErr) throw new Error(`Contract terms creation failed: ${termsErr.message}`);

// Refresh contracts list
const { data: latestContracts } = await supabase
  .from("contract")
  .select("contractid,assetid,tenantid,propertyownerid,start_date,end_date,is_active,created_at")
  .order("created_at", { ascending: false });
setContracts((latestContracts as ContractRow[]) || []);

      toast.success("Contract created successfully", { id: "create-contract" });

      // Reset minimal fields
      setOwnerName("");
      setTenantName("");
      setTenantEmail("");
      setTenantPhone("");
      setStartDate("");
      setEndDate("");
      setDateToCharge("");
      setBaseRent("0");
      setFollowIndex(1);

    } catch (e: any) {
      toast.error(e.message || "Failed to create contract", { id: "create-contract" });
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Create Contract</h1>
        <p className="text-sm text-muted-foreground">Link a Property Owner and Tenant, add terms, and update the asset.</p>
      </header>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Asset */}
            <div className="grid gap-2">
              <Label htmlFor="asset">Asset</Label>
              <select id="asset" className="border rounded-md p-2" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
                <option value="">Select asset</option>
                {assets.map((a) => (
                  <option key={a.assetid} value={a.assetid}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Owner */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Property Owner</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createNewOwner} onChange={(e) => setCreateNewOwner(e.target.checked)} />
                  Create new
                </label>
              </div>
              {createNewOwner ? (
                <Input placeholder="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              ) : (
                <select className="border rounded-md p-2" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                  <option value="">Select owner</option>
                  {owners.map((o) => (
                    <option key={o.propertyownerid} value={o.propertyownerid}>{o.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Tenant */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Tenant</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createNewTenant} onChange={(e) => setCreateNewTenant(e.target.checked)} />
                  Create new
                </label>
              </div>
              {createNewTenant ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input placeholder="Name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
                  <Input placeholder="Email" type="email" value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} />
                  <Input placeholder="Phone" value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} />
                </div>
              ) : (
                <select className="border rounded-md p-2" value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
                  <option value="">Select tenant</option>
                  {tenants.map((t) => (
                    <option key={t.tenantid} value={t.tenantid}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Terms */}
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="start">Start date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End date</Label>
                <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="charge">Date to charge</Label>
                <Input id="charge" type="date" value={dateToCharge} onChange={(e) => setDateToCharge(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="followIndex">Follow index</Label>
                <Input id="followIndex" type="number" min={0} value={followIndex} onChange={(e) => setFollowIndex(parseInt(e.target.value || "0", 10))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseRent">Base rent</Label>
                <Input id="baseRent" type="number" step="0.01" value={baseRent} onChange={(e) => setBaseRent(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreateWorkflow} disabled={!isFormValid}>Create Contract</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            {contracts.filter((c) => c.is_active).length === 0 ? (
              <p className="text-sm text-muted-foreground">No active contracts yet.</p>
            ) : (
              <div className="space-y-3">
                {contracts
                  .filter((c) => c.is_active)
                  .map((c) => {
                    const assetName = assets.find((a) => a.assetid === c.assetid)?.name || "—";
                    const ownerName = owners.find((o) => o.propertyownerid === c.propertyownerid)?.name || "—";
                    const tenantName = tenants.find((t) => t.tenantid === c.tenantid)?.name || "—";
                    return (
                      <div key={c.contractid} className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <p className="font-medium">{assetName}</p>
                          <p className="text-xs text-muted-foreground">Owner: {ownerName} • Tenant: {tenantName}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(c.start_date as string) || "—"} → {(c.end_date as string) || "—"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
