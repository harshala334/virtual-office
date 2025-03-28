import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from
"@/components/lib/ui/card";
import { Button } from "@/components/lib/ui/button";
import { Input } from "@/components/lib/ui/input";
import { Label } from "@/components/lib/ui/label";
import { User, Mail, Phone, X, Check } from "lucide-react";
import { toast } from "sonner";
const Account = () => {
const [isEditing, setIsEditing] = useState(false);
const [userInfo, setUserInfo] = useState({
name: "John Doe",
email: "john.doe@example.com",
phone: "+1 234 567 890"
});
const [editableInfo, setEditableInfo] = useState({
name: userInfo.name,
email: userInfo.email,
phone: userInfo.phone
});
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const { name, value } = e.target;
setEditableInfo(prev => ({
...prev,
[name]: value
}));
};
const handleSave = () => {
// Simple validation
if (!editableInfo.name.trim()) {
toast.error("Name cannot be empty");
return;


}
if (!editableInfo.email.trim() || !editableInfo.email.includes('@')) {
toast.error("Please enter a valid email address");
return;
}
if (!editableInfo.phone.trim()) {
toast.error("Phone number cannot be empty");
return;
}
setUserInfo(editableInfo);
setIsEditing(false);
toast.success("Profile updated successfully!");
};
const handleCancel = () => {
setEditableInfo(userInfo);
setIsEditing(false);
};
return (
<div className="min-h-screen p-6">
<div className="mx-auto max-w-2xl">
<h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary
to-blue-400 bg-clip-text text-transparent">

Account
</h1>
<Card className="glass-effect mb-6">
<CardHeader>
<CardTitle>Profile Information</CardTitle>
</CardHeader>
<CardContent>
{isEditing ? (
<div className="space-y-4">
<div className="space-y-2">
<Label htmlFor="name">Full Name</Label>
<div className="flex items-center gap-3">
<User className="h-5 w-5 text-primary shrink-0" />
<Input
id="name"
name="name"
value={editableInfo.name}
onChange={handleChange}
/>
</div>


</div>
<div className="space-y-2">
<Label htmlFor="email">Email</Label>
<div className="flex items-center gap-3">
<Mail className="h-5 w-5 text-primary shrink-0" />
<Input
id="email"
name="email"
type="email"
value={editableInfo.email}
onChange={handleChange}
/>
</div>
</div>
<div className="space-y-2">
<Label htmlFor="phone">Phone</Label>
<div className="flex items-center gap-3">
<Phone className="h-5 w-5 text-primary shrink-0" />
<Input
id="phone"
name="phone"
value={editableInfo.phone}
onChange={handleChange}
/>
</div>
</div>
</div>
) : (
<div className="space-y-4">
<div className="flex items-center gap-3">
<User className="h-5 w-5 text-primary" />
<div>
<p className="font-medium">{userInfo.name}</p>
<p className="text-sm text-muted-foreground">Full Name</p>
</div>
</div>
<div className="flex items-center gap-3">
<Mail className="h-5 w-5 text-primary" />
<div>
<p className="font-medium">{userInfo.email}</p>
<p className="text-sm text-muted-foreground">Email</p>
</div>
</div>
<div className="flex items-center gap-3">
<Phone className="h-5 w-5 text-primary" />
<div>
<p className="font-medium">{userInfo.phone}</p>
<p className="text-sm text-muted-foreground">Phone</p>


</div>
</div>
</div>
)}
</CardContent>
{isEditing && (
<CardFooter className="flex justify-end gap-2">
<Button variant="outline" onClick={handleCancel}>
<X className="mr-1 h-4 w-4" />
Cancel
</Button>
<Button onClick={handleSave}>
<Check className="mr-1 h-4 w-4" />
Save Changes
</Button>
</CardFooter>
)}
</Card>
{!isEditing && (
<Button className="w-full glass-effect" onClick={() =>

setIsEditing(true)}>
Edit Profile
</Button>
)}
</div>
</div>
);
};
export default Account;