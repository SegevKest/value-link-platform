
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
  Mail, 
  Phone, 
  Building,
  MoreHorizontal,
  Users,
  Trash2,
  Edit
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Contact {
  contactid: string;
  assetid: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  contact_type?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Sample contact for visual reference
const sampleContact = {
  contactid: "sample-1",
  assetid: "sample-asset",
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "+1 (555) 123-4567",
  contact_type: "Property Manager",
  notes: "Primary contact for downtown properties",
  created_at: "2024-01-15T00:00:00Z",
  updated_at: "2024-01-15T00:00:00Z"
};

export const ContactManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("contact")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      // If no contacts exist, show sample contact for visual reference
      setContacts(data && data.length > 0 ? data : [sampleContact]);
    } catch (error) {
      toast.error("Failed to load contacts");
      console.error("Error loading contacts:", error);
      // Show sample contact on error for visual reference
      setContacts([sampleContact]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from("asset")
        .select("assetid, name")
        .order("name", { ascending: true });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error("Error loading assets:", error);
      setAssets([]);
    }
  };

  useEffect(() => {
    loadContacts();
    loadAssets();
  }, []);

  const handleCreateContact = async () => {
    if (!newContactName.trim()) {
      toast.error("Please enter a contact name");
      return;
    }

    if (!selectedAssetId) {
      toast.error("Please select an asset");
      return;
    }

    try {
      const { error } = await supabase
        .from("contact")
        .insert({
          assetid: selectedAssetId,
          name: newContactName.trim(),
          email: newContactEmail.trim() || null,
          phone: newContactPhone.trim() || null,
          contact_type: "General"
        });

      if (error) throw error;

      toast.success("Contact created successfully");
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setSelectedAssetId("");
      setShowCreateForm(false);
      loadContacts();
    } catch (error) {
      toast.error("Failed to create contact");
      console.error("Error creating contact:", error);
    }
  };

  const handleDeleteContact = async (contactId: string, contactName: string) => {
    if (contactId === "sample-1") {
      toast.error("Cannot delete sample contact");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${contactName}"?`)) return;

    try {
      const { error } = await supabase
        .from("contact")
        .delete()
        .eq("contactid", contactId);

      if (error) throw error;

      toast.success("Contact deleted successfully");
      loadContacts();
    } catch (error) {
      toast.error("Failed to delete contact");
      console.error("Error deleting contact:", error);
    }
  };

  const getStatusColor = (contactType: string | null) => {
    switch (contactType?.toLowerCase()) {
      case "tenant":
        return "bg-green-100 text-green-700 border-green-200";
      case "property manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "contractor":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.contact_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading contacts...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600 mt-1">Manage relationships with asset contacts and stakeholders.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4" />
          {showCreateForm ? "Cancel" : "Add Contact"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                placeholder="Contact name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
              />
              <Input
                placeholder="Email (optional)"
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
              />
              <Input
                placeholder="Phone (optional)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium mb-2">Select Asset</label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.assetid} value={asset.assetid}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateContact}>Create Contact</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{contacts.length} Total Contacts</span>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.contactid} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={contact.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {contact.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{contact.contact_type || "General Contact"}</p>
                    {contact.contactid === "sample-1" && (
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">Sample Contact</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(contact.contact_type)}>
                    {contact.contact_type || "General"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{contact.phone}</span>
                  </div>
                )}
              </div>

              {/* Contact ID */}
              <div className="text-xs text-gray-500">
                Contact ID: {contact.contactid.substring(0, 8)}...
              </div>

              {/* Notes */}
              {contact.notes && (
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {contact.notes}
                </div>
              )}

              {/* Last Updated */}
              <div className="text-xs text-gray-500">
                Last updated: {new Date(contact.updated_at).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {contact.email && (
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Mail className="h-3 w-3" />
                    Email
                  </Button>
                )}
                {contact.phone && (
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteContact(contact.contactid, contact.name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredContacts.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm ? "No contacts found matching your search." : "No contacts found. Create your first contact to get started."}
          </div>
        )}
      </div>
    </div>
  );
};
