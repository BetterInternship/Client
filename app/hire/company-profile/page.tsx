"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  BarChart3,
  FileText,
  Building2,
  MapPin,
  Mail,
  Phone,
  Plus,
  X,
  UserPlus,
  LogOut,
  FileEdit,
} from "lucide-react";
import Link from "next/link";
import ContentLayout from "@/components/features/hire/content-layout";

export default function CompanyProfile() {
  const router = useRouter();

  const [companyData, setCompanyData] = useState({
    name: "Google",
    description:
      "Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, a search engine, cloud computing, software, and hardware.",
    locations: ["Legazpi Village, Makati", "BGC, Taguig", "Ortigas, Pasig"],
    hrEmail: "hr@google.com",
    phone: "+63 2 8888 9999",
  });

  const [newLocation, setNewLocation] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      setCompanyData((prev) => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()],
      }));
      setNewLocation("");
    }
  };

  const handleRemoveLocation = (index: number) => {
    setCompanyData((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    // Here you would typically save all data to a backend
    console.log("Saving company data:", companyData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data or fetch from backend
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Clear any stored authentication data (if you add localStorage/sessionStorage later)
    // localStorage.removeItem('authToken') // Future implementation

    // Redirect to login page
    router.push("/login");
  };

  return (
    <ContentLayout>
        <div className="h-screen bg-white flex">

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Company Profile</h1>
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem className="cursor-pointer">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    <span>Edit Company Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link href="/add-users">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        <span>Add Users</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Company Profile Section */}
                        <div
                            className="bg-white border-2 border-gray-200 rounded-lg p-8"
                            data-tour="company-details"
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-6">
                                Company Information
                            </h2>

                            {/* Company Name */}
                            <div className="mb-6">
                                <Label
                                    htmlFor="company-name"
                                    className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                >
                                    <Building2 className="h-4 w-4" />
                                    Company Name
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="company-name"
                                        value={companyData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="mt-2"
                                        placeholder="Enter company name"
                                    />
                                ) : (
                                    <p className="text-gray-900 text-lg font-medium mt-2">
                                        {companyData.name}
                                    </p>
                                )}
                            </div>

                            {/* Company Description */}
                            <div className="mb-6" data-tour="branding-section">
                                <Label
                                    htmlFor="company-description"
                                    className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Company Description
                                </Label>
                                {isEditing ? (
                                    <Textarea
                                        id="company-description"
                                        value={companyData.description}
                                        onChange={(e) =>
                                            handleInputChange("description", e.target.value)
                                        }
                                        className="mt-2 min-h-[120px]"
                                        placeholder="Enter company description"
                                    />
                                ) : (
                                    <p className="text-gray-700 mt-2 leading-relaxed">
                                        {companyData.description}
                                    </p>
                                )}
                            </div>

                            {/* Company Locations */}
                            <div className="mb-6">
                                <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Company Location(s)
                                </Label>
                                <div className="mt-2 space-y-2">
                                    {companyData.locations.map((location, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            {isEditing ? (
                                                <>
                                                    <Input
                                                        value={location}
                                                        onChange={(e) => {
                                                            const newLocations = [...companyData.locations];
                                                            newLocations[index] = e.target.value;
                                                            setCompanyData((prev) => ({
                                                                ...prev,
                                                                locations: newLocations,
                                                            }));
                                                        }}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleRemoveLocation(index)}
                                                        className="h-9 w-9"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <p className="text-gray-700">{location}</p>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <div className="flex items-center gap-2 mt-3">
                                            <Input
                                                value={newLocation}
                                                onChange={(e) => setNewLocation(e.target.value)}
                                                placeholder="Add new location"
                                                onKeyPress={(e) =>
                                                    e.key === "Enter" && handleAddLocation()
                                                }
                                                className="flex-1"
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleAddLocation}
                                                className="h-9 w-9"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* HR Email */}
                            <div className="mb-6" data-tour="signatory-info">
                                <Label
                                    htmlFor="hr-email"
                                    className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    HR Email
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="hr-email"
                                        type="email"
                                        value={companyData.hrEmail}
                                        onChange={(e) =>
                                            handleInputChange("hrEmail", e.target.value)
                                        }
                                        className="mt-2"
                                        placeholder="hr@company.com"
                                    />
                                ) : (
                                    <p className="text-gray-700 mt-2">{companyData.hrEmail}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="mb-8">
                                <Label
                                    htmlFor="phone"
                                    className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                >
                                    <Phone className="h-4 w-4" />
                                    Contact Number
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={companyData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className="mt-2"
                                        placeholder="+63 2 1234 5678"
                                    />
                                ) : (
                                    <p className="text-gray-700 mt-2">{companyData.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6">
                            {isEditing ? (
                                <>
                                    <Button variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Save All Changes
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ContentLayout>
  );
}
