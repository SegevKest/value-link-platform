
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const assetTypes = [
  { id: "all", label: "All Assets", icon: Package, count: 1247 },
  { id: "real-estate", label: "Real Estate", icon: Building, count: 45 },
  { id: "vehicles", label: "Vehicles", icon: Car, count: 123 },
  { id: "equipment", label: "Equipment", icon: Laptop, count: 1079 },
];

const sampleAssets = [
  {
    id: 1,
    name: "Downtown Office Complex",
    type: "Real Estate",
    value: "$2,500,000",
    status: "Active",
    location: "New York, NY",
    lastUpdated: "2024-01-15",
    contact: "John Smith",
    nextPayment: "$15,000",
    paymentDue: "2024-02-01"
  },
  {
    id: 2,
    name: "Fleet Vehicle #247",
    type: "Vehicle",
    value: "$45,000",
    status: "Maintenance",
    location: "Los Angeles, CA",
    lastUpdated: "2024-01-14",
    contact: "Sarah Johnson",
    nextPayment: "$850",
    paymentDue: "2024-01-28"
  },
  {
    id: 3,
    name: "Server Infrastructure",
    type: "Equipment",
    value: "$125,000",
    status: "Active",
    location: "Data Center A",
    lastUpdated: "2024-01-13",
    contact: "Mike Wilson",
    nextPayment: "$5,200",
    paymentDue: "2024-02-15"
  },
];

export const AssetManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

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
              {sampleAssets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
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
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Asset Value</p>
                        <p className="font-semibold text-gray-900">{asset.value}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{asset.location}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-500">Contact</p>
                          <p className="font-medium text-gray-900">{asset.contact}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">Next Payment</p>
                          <p className="font-semibold text-blue-600">{asset.nextPayment}</p>
                          <p className="text-xs text-gray-500">Due: {asset.paymentDue}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Edit Asset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
