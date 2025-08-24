
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AssetCreation } from "./AssetCreation";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Building, 
  Car, 
  Laptop,
  MoreHorizontal
} from "lucide-react";

const assetTypes = [];

interface Asset {
  assetid: string;
  name: string;
  type: string;
  tenantid?: string | null;
  propertyownerid?: string | null;
  activecontractid?: string | null;
}

export const AssetManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const loadAssets = async () => {
      const { data, error } = await supabase
        .from("asset")
        .select("assetid, name, type, tenantid, propertyownerid, activecontractid")
        .order("name", { ascending: true });
      
      if (error) {
        toast.error("Failed to load assets");
        console.error("Error loading assets:", error);
      } else {
        setAssets(data || []);
      }
    };

    loadAssets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all your assets in one place.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4" />
          {showCreateForm ? "Cancel" : "Add Asset"}
        </Button>
      </div>

      {/* Asset Creation Form */}
      {showCreateForm && <AssetCreation />}

      {/* Asset Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            {assetTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger key={type.id} value={type.id} className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                  <Badge variant="secondary" className="ml-1 hidden md:inline">
                    {type.count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {assetTypes.map((type) => (
          <TabsContent key={type.id} value={type.id} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {assets
                .filter(asset => type.id === "all" || asset.type.toLowerCase().includes(type.id.replace("-", " ")))
                .filter(asset => asset.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((asset) => (
                <Card key={asset.assetid} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {asset.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{asset.type}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className={asset.activecontractid ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                      {asset.activecontractid ? "Active Contract" : "Available"}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Asset ID</p>
                        <p className="font-semibold text-gray-900 truncate">{asset.assetid.substring(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{asset.type}</p>
                      </div>
                    </div>

                    {asset.tenantid && (
                      <div className="border-t pt-4">
                        <div className="text-sm">
                          <p className="text-gray-500">Tenant ID</p>
                          <p className="font-medium text-gray-900 truncate">{asset.tenantid.substring(0, 8)}...</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Create Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {assets.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No assets found. Create your first asset to get started.
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
