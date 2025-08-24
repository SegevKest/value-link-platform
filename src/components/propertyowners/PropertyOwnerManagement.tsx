import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Building,
  MoreHorizontal,
  Users,
  Trash2,
  Edit
} from "lucide-react";

interface PropertyOwner {
  propertyownerid: string;
  name: string;
}

interface PropertyOwnerWithStats extends PropertyOwner {
  assetCount: number;
  activeContracts: number;
}

export const PropertyOwnerManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [owners, setOwners] = useState<PropertyOwnerWithStats[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPropertyOwners = async () => {
    try {
      const { data: ownersData, error: ownersError } = await supabase
        .from("propertyowner")
        .select("propertyownerid, name")
        .order("name", { ascending: true });

      if (ownersError) throw ownersError;

      // For now, set default counts to 0 since we don't have proper relations
      const ownersWithStats = (ownersData || []).map((owner) => ({
        ...owner,
        assetCount: 0,
        activeContracts: 0,
      }));

      setOwners(ownersWithStats);
    } catch (error) {
      toast.error("Failed to load property owners");
      console.error("Error loading property owners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyOwners();
  }, []);

  const handleCreateOwner = async () => {
    if (!newOwnerName.trim()) {
      toast.error("Please enter a property owner name");
      return;
    }

    try {
      const { error } = await supabase
        .from("propertyowner")
        .insert({ 
          propertyownerid: crypto.randomUUID(),
          name: newOwnerName.trim() 
        });

      if (error) throw error;

      toast.success("Property owner created successfully");
      setNewOwnerName("");
      setShowCreateForm(false);
      loadPropertyOwners();
    } catch (error) {
      toast.error("Failed to create property owner");
      console.error("Error creating property owner:", error);
    }
  };

  const handleDeleteOwner = async (ownerId: string, ownerName: string) => {
    if (!confirm(`Are you sure you want to delete "${ownerName}"?`)) return;

    try {
      const { error } = await supabase
        .from("propertyowner")
        .delete()
        .eq("propertyownerid", ownerId);

      if (error) throw error;

      toast.success("Property owner deleted successfully");
      loadPropertyOwners();
    } catch (error) {
      toast.error("Failed to delete property owner");
      console.error("Error deleting property owner:", error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading property owners...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Owner Management</h1>
          <p className="text-gray-600 mt-1">Manage property owners and their portfolios.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4" />
          {showCreateForm ? "Cancel" : "Add Property Owner"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Property Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Property owner name"
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateOwner()}
              />
              <Button onClick={handleCreateOwner}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search property owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{owners.length} Total Property Owners</span>
          </div>
        </div>
      </div>

      {/* Property Owners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOwners.map((owner) => (
          <Card key={owner.propertyownerid} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={owner.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {getInitials(owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {owner.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">Property Owner</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Real Estate Portfolio</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Active
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Portfolio Statistics */}
              <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{owner.assetCount}</p>
                  <p className="text-xs text-gray-500">Assets Owned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{owner.activeContracts}</p>
                  <p className="text-xs text-gray-500">Active Contracts</p>
                </div>
              </div>

              {/* Owner ID */}
              <div className="text-xs text-gray-500">
                ID: {owner.propertyownerid.substring(0, 8)}...
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Assets
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteOwner(owner.propertyownerid, owner.name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredOwners.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm ? "No property owners found matching your search." : "No property owners found. Create your first property owner to get started."}
          </div>
        )}
      </div>
    </div>
  );
};