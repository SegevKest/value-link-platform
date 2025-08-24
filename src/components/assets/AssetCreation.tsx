import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssetType {
  assettypeid: number;
  name: string;
}

export const AssetCreation = () => {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [assetName, setAssetName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAssetTypes = async () => {
      const { data, error } = await supabase
        .from("assettype")
        .select("assettypeid, name")
        .order("name", { ascending: true });
      
      if (error) {
        toast.error("Failed to load asset types");
        console.error("Error loading asset types:", error);
      } else {
        setAssetTypes(data || []);
      }
    };

    loadAssetTypes();
  }, []);

  const handleCreateAsset = async () => {
    if (!assetName.trim() || !selectedType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const assetId = crypto.randomUUID();
      
      const { error } = await supabase
        .from("asset")
        .insert({
          assetid: assetId,
          name: assetName.trim(),
          type: selectedType
        });

      if (error) {
        throw error;
      }

      toast.success("Asset created successfully!");
      
      // Reset form
      setAssetName("");
      setSelectedType("");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create asset");
      console.error("Error creating asset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Create Asset</h1>
        <p className="text-sm text-muted-foreground">Create a new asset to manage in your portfolio.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="assetName">Asset Name</Label>
            <Input
              id="assetName"
              placeholder="Enter asset name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assetType">Asset Type</Label>
            <select
              id="assetType"
              className="border rounded-md p-2"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Select asset type</option>
              {assetTypes.map((type) => (
                <option key={type.assettypeid} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleCreateAsset} 
              disabled={!assetName.trim() || !selectedType || isLoading}
            >
              {isLoading ? "Creating..." : "Create Asset"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};