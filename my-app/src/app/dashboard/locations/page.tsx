"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Image as ImageIcon, 
  FileEdit,
  Upload,
  MapPin,
  Phone,
  Globe,
  Calendar
} from "lucide-react";
import GoogleBusinessSection from "@/components/google-business/GoogleBusinessSection";

// Define location type
interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  category: string;
  status: string;
  reviews?: number;
  rating?: number;
  description?: string;
  openingDate?: string;
  socialProfiles?: {
    instagram?: string;
    youtube?: string;
  };
  serviceAreas?: string[];
  businessHours?: {
    sunday?: string;
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
  };
  onlineHours?: {
    sunday?: string;
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
  };
  accessibility?: {
    wheelchairSeating?: boolean;
    wheelchairRestroom?: boolean;
  };
  serviceOptions?: {
    onsiteServices?: boolean;
    onlineEstimates?: boolean;
  };
  additionalCategories?: string[];
}

// Sample data for business locations
const businessLocations: BusinessLocation[] = [
  {
    id: "1",
    name: "Blue Sky Roofing",
    address: "240 North Washington Boulevard Suite 318, Sarasota, Florida 34236",
    phone: "(941) 555-1234",
    website: "https://blueskyroofing.com",
    hours: "Mon-Fri: 8AM-5PM",
    category: "Roofing Contractor",
    status: "Verified",
    reviews: 107,
    rating: 4.8
  },
  {
    id: "2",
    name: "Blue Sky Roofing",
    address: "6120 Sweden Blvd, Punta Gorda, FL 33982",
    phone: "(941) 555-5678",
    website: "https://blueskyroofing.com",
    hours: "Mon-Fri: 8AM-5PM",
    category: "Roofing Contractor",
    status: "Verified",
    reviews: 86,
    rating: 4.7
  },
  {
    id: "3",
    name: "Blue Sky Roofing",
    address: "136 4th St N #2206, St. Petersburg, FL 33701",
    phone: "(727) 555-9012",
    website: "https://blueskyroofing.com",
    hours: "Mon-Fri: 8AM-5PM",
    category: "Roofing Contractor",
    status: "Verified",
    reviews: 64,
    rating: 4.9
  },
  {
    id: "4",
    name: "Blue Sky Roofing",
    address: "13375 Center Ave, Largo, FL 33773",
    phone: "(727) 555-3456",
    website: "https://blueskyroofing.com",
    hours: "Mon-Fri: 8AM-5PM",
    category: "Roofing Contractor",
    status: "Verified",
    reviews: 53,
    rating: 4.6
  }
];

// Image category options
const imageCategories = [
  { value: "profile", label: "Profile" },
  { value: "cover", label: "Cover Photo" },
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "team", label: "Team" },
  { value: "work", label: "At Work" },
  { value: "product", label: "Product" }
];

// Post topics
const postTopics = [
  { value: "update", label: "Business Update" },
  { value: "event", label: "Event" },
  { value: "offer", label: "Offer" },
  { value: "announcement", label: "Announcement" }
];

export default function LocationsPage() {
  const { user, isLoaded } = useUser();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeLocation, setActiveLocation] = useState<BusinessLocation | null>(null);
  const [editedLocation, setEditedLocation] = useState<BusinessLocation | null>(null);
  const [imageCategory, setImageCategory] = useState("profile");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [postContent, setPostContent] = useState("");
  const [postTopic, setPostTopic] = useState("update");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  
  // New state for the new business form
  const [newBusiness, setNewBusiness] = useState<Partial<BusinessLocation>>({
    name: "",
    address: "",
    phone: "",
    website: "",
    hours: "Mon-Fri: 8AM-5PM",
    category: "Roofing Contractor",
    status: "Pending"
  });
  
  // Select all rows
  const selectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(businessLocations.map(location => location.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Toggle single row selection
  const toggleRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  // Open edit profile dialog
  const openEditProfile = (location: BusinessLocation) => {
    setActiveLocation(location);
    setEditedLocation({...location});
    setOpenDialog("editProfile");
  };

  // Open add image dialog
  const openAddImage = (location: BusinessLocation) => {
    setActiveLocation(location);
    setSelectedFile(null);
    setImageCategory("profile");
    setOpenDialog("addImage");
  };

  // Open create post dialog
  const openCreatePost = (location: BusinessLocation) => {
    setActiveLocation(location);
    setPostContent("");
    setPostTopic("update");
    setOpenDialog("createPost");
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    if (!editedLocation) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to update business profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local data (in a real app, this would come from the API response)
      const updatedLocations = businessLocations.map(loc => 
        loc.id === editedLocation.id ? {...loc, ...editedLocation} : loc
      );
      
      // Success notification would go here
      console.log("Profile updated successfully", updatedLocations);
      setOpenDialog(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      // Error notification would go here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload image
  const uploadImage = async () => {
    if (!selectedFile) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to upload image
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success notification would go here
      console.log(`Image uploaded successfully to category: ${imageCategory}`);
      setOpenDialog(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Error notification would go here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create post
  const createPost = async () => {
    if (!postContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to create post
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Success notification would go here
      console.log(`Post created successfully with topic: ${postTopic}`);
      setOpenDialog(null);
    } catch (error) {
      console.error("Error creating post:", error);
      // Error notification would go here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // View individual profile
  const viewProfile = (location: BusinessLocation) => {
    // Extract city from address (assuming format "address, city, state zip")
    const addressParts = location.address.split(',');
    // Get the city from the address (usually the second-to-last part before the state)
    const cityPart = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : '';
    // Extract just the city name, removing any "FL" or other state references
    const city = cityPart.replace(/\bFL\b|\bFlorida\b/g, '').trim();
    
    // Create a Google search URL for the business name + city
    const searchQuery = `${location.name} ${city}`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    // Open the URL in a new tab
    window.open(googleSearchUrl, '_blank');
  };

  // Add handlers for the Add Business dropdown menu items
  const openAddSingleBusiness = () => {
    setNewBusiness({
      name: "",
      address: "",
      phone: "",
      website: "",
      hours: "Mon-Fri: 8AM-5PM",
      category: "Roofing Contractor",
      status: "Pending"
    });
    setOpenDialog("addBusiness");
  };
  
  const openImportBusinesses = () => {
    // This would be implemented to handle CSV/bulk import
    console.log("Opening import businesses dialog");
    alert("Bulk import functionality coming soon! This will allow you to import multiple locations from a CSV file.");
  };
  
  // Add a function to handle the new business form submission
  const handleAddBusiness = async () => {
    if (!newBusiness.name || !newBusiness.address) {
      alert("Business name and address are required!");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would call the Google Business Profile API to create a new location
      console.log("Creating new business:", newBusiness);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random ID for the new business (In real implementation, this would come from the API)
      const id = Math.random().toString(36).substring(2, 9);
      
      // In a real implementation, we would use the API response
      const newLocation: BusinessLocation = {
        id,
        name: newBusiness.name || "",
        address: newBusiness.address || "",
        phone: newBusiness.phone || "",
        website: newBusiness.website || "",
        hours: newBusiness.hours || "Mon-Fri: 8AM-5PM",
        category: newBusiness.category || "Roofing Contractor",
        status: "Pending", // New businesses start as pending until verified
        reviews: 0,
        rating: 0
      };
      
      // Add the new business to our local state
      // In a real app, you'd fetch the updated list from the API
      businessLocations.push(newLocation);
      
      // Show success message
      alert("Business added successfully! It will be reviewed by Google before appearing in search results.");
      
      // Close the dialog
      setOpenDialog(null);
    } catch (error) {
      console.error("Error adding business:", error);
      alert("An error occurred while adding the business. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Protect this page - redirect if not authenticated (this is now handled by the layout)
  if (isLoaded && !user) {
    redirect("/");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Business Locations</h1>
        <Button onClick={() => setOpenDialog("addBusiness")}>Add Location</Button>
      </div>
      
      {/* Add Google Business Profile integration */}
      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="google-business">Google Business Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="locations" className="space-y-6">
          {/* Existing locations content */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({businessLocations.length})</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Rest of your existing locations table/content */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Businesses</CardTitle>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        Add business
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={openAddSingleBusiness}>Add single business</DropdownMenuItem>
                      <DropdownMenuItem onClick={openImportBusinesses}>Import businesses</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedRows.length === businessLocations.length && businessLocations.length > 0}
                          onCheckedChange={(checked) => selectAll(checked as boolean)}
                        />
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          Business
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedRows.includes(location.id)}
                            onCheckedChange={(checked) => toggleRow(location.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-muted-foreground">{location.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  fill={star <= Math.round(location.rating || 0) ? "#FFD700" : "#E2E8F0"} 
                                  className="w-3.5 h-3.5"
                                >
                                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm font-medium">{location.rating}</span>
                            <span className="text-sm text-muted-foreground">({location.reviews})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            Verified
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Edit business info"
                              onClick={() => openEditProfile(location)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Add photos"
                              onClick={() => openAddImage(location)}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Create post"
                              onClick={() => openCreatePost(location)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-2 text-blue-600"
                              onClick={() => viewProfile(location)}
                            >
                              <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                              </svg>
                              View on Google
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-end space-x-4 py-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select defaultValue="10">
                    <SelectTrigger className="w-16">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  1-{businessLocations.length} of {businessLocations.length}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="google-business" className="space-y-6">
          <GoogleBusinessSection 
            title="Google Business Profile Locations" 
            description="Manage your business locations directly from Google Business Profile" 
            showDebug={true}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={openDialog === "editProfile"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Info</DialogTitle>
            <DialogDescription>
              Update your business information on Google Business Profile
            </DialogDescription>
          </DialogHeader>
          
          {editedLocation && (
            <Tabs defaultValue="about" className="py-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="hours">Hours & More</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input 
                    id="name" 
                    value={editedLocation.name} 
                    onChange={(e) => setEditedLocation({...editedLocation, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Business Categories</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="primary-category" className="text-sm text-muted-foreground">Primary Category</Label>
                      <Input 
                        id="primary-category" 
                        value={editedLocation.category} 
                        onChange={(e) => setEditedLocation({...editedLocation, category: e.target.value})}
                        placeholder="e.g. Roofing contractor"
                      />
                    </div>
                    {(editedLocation.additionalCategories || []).map((category, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={category} 
                          onChange={(e) => {
                            const updatedCategories = [...(editedLocation.additionalCategories || [])];
                            updatedCategories[index] = e.target.value;
                            setEditedLocation({...editedLocation, additionalCategories: updatedCategories});
                          }}
                          placeholder={`Additional category ${index + 1}`}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            const updatedCategories = [...(editedLocation.additionalCategories || [])];
                            updatedCategories.splice(index, 1);
                            setEditedLocation({...editedLocation, additionalCategories: updatedCategories});
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="mt-2" 
                      onClick={() => {
                        const updatedCategories = [...(editedLocation.additionalCategories || []), ''];
                        setEditedLocation({...editedLocation, additionalCategories: updatedCategories});
                      }}
                    >
                      Add Category
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea 
                    id="description" 
                    value={editedLocation.description || ""} 
                    onChange={(e) => setEditedLocation({...editedLocation, description: e.target.value})}
                    placeholder="Describe your business..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(editedLocation.description?.length || 0)}/750 characters
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="opening-date">Opening Date</Label>
                  <Input 
                    id="opening-date" 
                    type="month"
                    value={editedLocation.openingDate || ""} 
                    onChange={(e) => setEditedLocation({...editedLocation, openingDate: e.target.value})}
                  />
                </div>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      value={editedLocation.phone} 
                      onChange={(e) => setEditedLocation({...editedLocation, phone: e.target.value})}
                      placeholder="e.g. (941) 841-1946"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="website" 
                      value={editedLocation.website} 
                      onChange={(e) => setEditedLocation({...editedLocation, website: e.target.value})}
                      placeholder="e.g. https://www.blueskyroofing.com/"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Social Profiles</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#E4405F">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.859.072-3.211 0-3.586-.015-4.861-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z"/>
                      </svg>
                      <Input 
                        value={editedLocation.socialProfiles?.instagram || ""} 
                        onChange={(e) => setEditedLocation({
                          ...editedLocation, 
                          socialProfiles: {
                            ...(editedLocation.socialProfiles || {}),
                            instagram: e.target.value
                          }
                        })}
                        placeholder="Instagram URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FF0000">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <Input 
                        value={editedLocation.socialProfiles?.youtube || ""} 
                        onChange={(e) => setEditedLocation({
                          ...editedLocation, 
                          socialProfiles: {
                            ...(editedLocation.socialProfiles || {}),
                            youtube: e.target.value
                          }
                        })}
                        placeholder="YouTube URL"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Business Location</Label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="address" 
                      value={editedLocation.address} 
                      onChange={(e) => setEditedLocation({...editedLocation, address: e.target.value})}
                      placeholder="e.g. 240 North Washington Boulevard Suite 318, Sarasota, Florida 34236"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Service Areas</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {(editedLocation.serviceAreas || []).map((area, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={area} 
                          onChange={(e) => {
                            const updatedAreas = [...(editedLocation.serviceAreas || [])];
                            updatedAreas[index] = e.target.value;
                            setEditedLocation({...editedLocation, serviceAreas: updatedAreas});
                          }}
                          placeholder={`Service area ${index + 1}`}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            const updatedAreas = [...(editedLocation.serviceAreas || [])];
                            updatedAreas.splice(index, 1);
                            setEditedLocation({...editedLocation, serviceAreas: updatedAreas});
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="mt-2" 
                      onClick={() => {
                        const updatedAreas = [...(editedLocation.serviceAreas || []), ''];
                        setEditedLocation({...editedLocation, serviceAreas: updatedAreas});
                      }}
                    >
                      Add Service Area
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Hours & More Tab */}
              <TabsContent value="hours" className="space-y-6">
                <div className="space-y-2">
                  <Label>Business Hours</Label>
                  <div className="grid gap-3 border rounded-md p-4">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-medium">Sunday</span>
                      <Select 
                        value={editedLocation.businessHours?.sunday || "Closed"} 
                        onValueChange={(val) => setEditedLocation({
                          ...editedLocation, 
                          businessHours: {
                            ...(editedLocation.businessHours || {}),
                            sunday: val
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="9:00 AM–5:00 PM">9:00 AM–5:00 PM</SelectItem>
                          <SelectItem value="8:00 AM–6:00 PM">8:00 AM–6:00 PM</SelectItem>
                          <SelectItem value="Open 24 hours">Open 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-medium">Monday</span>
                      <Select 
                        value={editedLocation.businessHours?.monday || "9:00 AM–5:00 PM"} 
                        onValueChange={(val) => setEditedLocation({
                          ...editedLocation, 
                          businessHours: {
                            ...(editedLocation.businessHours || {}),
                            monday: val
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="9:00 AM–5:00 PM">9:00 AM–5:00 PM</SelectItem>
                          <SelectItem value="8:00 AM–6:00 PM">8:00 AM–6:00 PM</SelectItem>
                          <SelectItem value="Open 24 hours">Open 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-medium">Tuesday</span>
                      <Select 
                        value={editedLocation.businessHours?.tuesday || "9:00 AM–5:00 PM"} 
                        onValueChange={(val) => setEditedLocation({
                          ...editedLocation, 
                          businessHours: {
                            ...(editedLocation.businessHours || {}),
                            tuesday: val
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="9:00 AM–5:00 PM">9:00 AM–5:00 PM</SelectItem>
                          <SelectItem value="8:00 AM–6:00 PM">8:00 AM–6:00 PM</SelectItem>
                          <SelectItem value="Open 24 hours">Open 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-medium">Wednesday</span>
                      <Select 
                        value={editedLocation.businessHours?.wednesday || "9:00 AM–5:00 PM"} 
                        onValueChange={(val) => setEditedLocation({
                          ...editedLocation, 
                          businessHours: {
                            ...(editedLocation.businessHours || {}),
                            wednesday: val
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="9:00 AM–5:00 PM">9:00 AM–5:00 PM</SelectItem>
                          <SelectItem value="8:00 AM–6:00 PM">8:00 AM–6:00 PM</SelectItem>
                          <SelectItem value="Open 24 hours">Open 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-medium">Thursday</span>
                      <Select 
                        value={editedLocation.businessHours?.thursday || "9:00 AM–5:00 PM"} 
                        onValueChange={(val) => setEditedLocation({
                          ...editedLocation, 
                          businessHours: {
                            ...(editedLocation.businessHours || {}),
                            thursday: val
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="9:00 AM–5:00 PM">9:00 AM–5:00 PM</SelectItem>
                          <SelectItem value="8:00 AM–6:00 PM">8:00 AM–6:00 PM</SelectItem>
                          <SelectItem value="Open 24 hours">Open 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-medium">Friday</span>
                      <Select 
                        value={editedLocation.businessHours?.friday || "9:00 AM–5:00 PM"} 
                        onValueChange={(val) => setEditedLocation({
                          ...editedLocation, 
                          businessHours: {
                            ...(editedLocation.businessHours || {}),
                            friday: val
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="9:00 AM–5:00 PM">9:00 AM–5:00 PM</SelectItem>
                          <SelectItem value="8:00 AM–6:00 PM">8:00 AM–6:00 PM</SelectItem>
                          <SelectItem value="Open 24 hours">Open 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-medium">Saturday</span>
                      <Select 
                        value={editedLocation.businessHours?.saturday || "9:00 AM–5:00 PM"} 
                        onValueChange={(val) => setEditedLocation({
                          ...editedLocation, 
                          businessHours: {
                            ...(editedLocation.businessHours || {}),
                            saturday: val
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="9:00 AM–5:00 PM">9:00 AM–5:00 PM</SelectItem>
                          <SelectItem value="8:00 AM–6:00 PM">8:00 AM–6:00 PM</SelectItem>
                          <SelectItem value="Open 24 hours">Open 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Online Service Hours</Label>
                  <div className="grid gap-3 border rounded-md p-4">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-medium">All Days</span>
                      <Select 
                        value={editedLocation.onlineHours?.sunday || "Open 24 hours"} 
                        onValueChange={(val) => {
                          const value = val;
                          setEditedLocation({
                            ...editedLocation, 
                            onlineHours: {
                              sunday: value,
                              monday: value,
                              tuesday: value,
                              wednesday: value,
                              thursday: value,
                              friday: value,
                              saturday: value,
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="Open 24 hours">Open 24 hours</SelectItem>
                          <SelectItem value="Same as business hours">Same as business hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Accessibility</Label>
                  <div className="space-y-2 border rounded-md p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="wheelchair-seating" 
                        checked={editedLocation.accessibility?.wheelchairSeating || false}
                        onCheckedChange={(checked) => setEditedLocation({
                          ...editedLocation, 
                          accessibility: {
                            ...(editedLocation.accessibility || {}),
                            wheelchairSeating: checked as boolean
                          }
                        })}
                      />
                      <Label htmlFor="wheelchair-seating" className="text-sm font-normal">
                        Has wheelchair accessible seating
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="wheelchair-restroom" 
                        checked={editedLocation.accessibility?.wheelchairRestroom || false}
                        onCheckedChange={(checked) => setEditedLocation({
                          ...editedLocation, 
                          accessibility: {
                            ...(editedLocation.accessibility || {}),
                            wheelchairRestroom: checked as boolean
                          }
                        })}
                      />
                      <Label htmlFor="wheelchair-restroom" className="text-sm font-normal">
                        Has wheelchair accessible restroom
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Service Options</Label>
                  <div className="space-y-2 border rounded-md p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="onsite-services" 
                        checked={editedLocation.serviceOptions?.onsiteServices || false}
                        onCheckedChange={(checked) => setEditedLocation({
                          ...editedLocation, 
                          serviceOptions: {
                            ...(editedLocation.serviceOptions || {}),
                            onsiteServices: checked as boolean
                          }
                        })}
                      />
                      <Label htmlFor="onsite-services" className="text-sm font-normal">
                        Onsite services available
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="online-estimates" 
                        checked={editedLocation.serviceOptions?.onlineEstimates || false}
                        onCheckedChange={(checked) => setEditedLocation({
                          ...editedLocation, 
                          serviceOptions: {
                            ...(editedLocation.serviceOptions || {}),
                            onlineEstimates: checked as boolean
                          }
                        })}
                      />
                      <Label htmlFor="online-estimates" className="text-sm font-normal">
                        Offers online estimates
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={saveProfileChanges} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Image Dialog */}
      <Dialog open={openDialog === "addImage"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Photos</DialogTitle>
            <DialogDescription>
              Upload photos to showcase your business
            </DialogDescription>
          </DialogHeader>
          
          {activeLocation && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="image-category">Photo Category</Label>
                <Select value={imageCategory} onValueChange={setImageCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose a category that best describes this photo
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image-upload">Upload Photo</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Drag and drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG. Max size: 5MB
                  </p>
                  <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                    Select File
                  </Button>
                </div>
                
                {selectedFile && (
                  <div className="mt-4 p-2 border rounded-md">
                    <p className="text-sm">Selected: {selectedFile.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button 
              onClick={uploadImage} 
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting ? "Uploading..." : "Upload Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Post Dialog */}
      <Dialog open={openDialog === "createPost"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>
              Share updates, offers or announcements with your customers
            </DialogDescription>
          </DialogHeader>
          
          {activeLocation && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 font-bold">{activeLocation.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{activeLocation.name}</p>
                  <p className="text-xs text-muted-foreground">Posting as business</p>
                </div>
              </div>
              
              <Tabs defaultValue="message">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="message">Message</TabsTrigger>
                  <TabsTrigger value="photo">Add Photo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="message" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-topic">Post Topic</Label>
                    <Select value={postTopic} onValueChange={setPostTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {postTopics.map((topic) => (
                          <SelectItem key={topic.value} value={topic.value}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="post-content">Post Content</Label>
                    <Textarea 
                      id="post-content" 
                      placeholder="What's new with your business?" 
                      rows={5}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">Be concise and highlight key information</p>
                      <p className="text-xs text-muted-foreground">{postContent.length}/1500</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="photo" className="space-y-4 pt-4">
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 h-48">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Add a photo to your post</p>
                    <p className="text-xs text-muted-foreground">
                      Photos can help your post stand out
                    </p>
                    <Button variant="outline" size="sm">Upload Photo</Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex items-center gap-2 pt-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Posts are typically reviewed within 24 hours
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button 
              onClick={createPost} 
              disabled={isSubmitting || !postContent.trim()}
            >
              {isSubmitting ? "Posting..." : "Publish Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Business Dialog */}
      <Dialog open={openDialog === "addBusiness"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Business</DialogTitle>
            <DialogDescription>
              Add a new business location to your Google Business Profile
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name *</Label>
              <Input 
                id="business-name" 
                value={newBusiness.name || ''} 
                onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
                placeholder="e.g. Blue Sky Roofing"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business-category">Business Category *</Label>
              <Select 
                value={newBusiness.category || 'Roofing Contractor'} 
                onValueChange={(value) => setNewBusiness({...newBusiness, category: value})}
              >
                <SelectTrigger id="business-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Roofing Contractor">Roofing Contractor</SelectItem>
                  <SelectItem value="Roofing Service">Roofing Service</SelectItem>
                  <SelectItem value="Construction Company">Construction Company</SelectItem>
                  <SelectItem value="Home Improvement">Home Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business-address">Business Address *</Label>
              <Textarea 
                id="business-address"
                value={newBusiness.address || ''} 
                onChange={(e) => setNewBusiness({...newBusiness, address: e.target.value})}
                placeholder="e.g. 240 North Washington Boulevard Suite 318, Sarasota, Florida 34236"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the full address including street, city, state, and zip code
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-phone">Phone Number</Label>
                <Input 
                  id="business-phone"
                  value={newBusiness.phone || ''} 
                  onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})}
                  placeholder="e.g. (941) 555-1234"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business-website">Website</Label>
                <Input 
                  id="business-website"
                  value={newBusiness.website || ''} 
                  onChange={(e) => setNewBusiness({...newBusiness, website: e.target.value})}
                  placeholder="e.g. https://blueskyroofing.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business-hours">Business Hours</Label>
              <Input 
                id="business-hours"
                value={newBusiness.hours || ''} 
                onChange={(e) => setNewBusiness({...newBusiness, hours: e.target.value})}
                placeholder="e.g. Mon-Fri: 8AM-5PM"
              />
              <p className="text-xs text-muted-foreground">
                You can edit detailed hours after creating the business
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <h4 className="text-sm font-medium text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Google Verification
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                New business listings require verification from Google. After adding your business, 
                you&apos;ll receive a verification code by mail, phone, or email depending on your business type.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button 
              onClick={handleAddBusiness} 
              disabled={isSubmitting || !newBusiness.name || !newBusiness.address}
            >
              {isSubmitting ? "Adding..." : "Add Business"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 