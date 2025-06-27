
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building,
  MoreHorizontal,
  Users
} from "lucide-react";

const sampleContacts = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Smith Properties LLC",
    role: "Property Manager",
    assetCount: 5,
    totalValue: "$3.2M",
    status: "Active",
    lastContact: "2024-01-15"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@fleetmanagement.com",
    phone: "+1 (555) 234-5678",
    company: "Fleet Management Inc",
    role: "Fleet Coordinator",
    assetCount: 23,
    totalValue: "$1.1M",
    status: "Active",
    lastContact: "2024-01-14"
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "m.wilson@techsolutions.com",
    phone: "+1 (555) 345-6789",
    company: "Tech Solutions Corp",
    role: "IT Director",
    assetCount: 45,
    totalValue: "$890K",
    status: "Pending",
    lastContact: "2024-01-10"
  },
  {
    id: 4,
    name: "Emily Chen",
    email: "emily.chen@construction.com",
    phone: "+1 (555) 456-7890",
    company: "Chen Construction",
    role: "Project Manager",
    assetCount: 8,
    totalValue: "$2.1M",
    status: "Active",
    lastContact: "2024-01-12"
  }
];

export const ContactManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600 mt-1">Manage relationships with asset contacts and stakeholders.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

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
            <span>{sampleContacts.length} Total Contacts</span>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sampleContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-all duration-200">
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
                    <p className="text-sm text-gray-500">{contact.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{contact.company}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(contact.status)}>
                    {contact.status}
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
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{contact.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{contact.phone}</span>
                </div>
              </div>

              {/* Asset Information */}
              <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{contact.assetCount}</p>
                  <p className="text-xs text-gray-500">Assets Managed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{contact.totalValue}</p>
                  <p className="text-xs text-gray-500">Total Value</p>
                </div>
              </div>

              {/* Last Contact */}
              <div className="text-xs text-gray-500">
                Last contact: {contact.lastContact}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Mail className="h-3 w-3" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Phone className="h-3 w-3" />
                  Call
                </Button>
                <Button size="sm" className="flex-1">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
