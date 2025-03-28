import { Card, CardContent, CardHeader, CardTitle } from
"../lib/ui/card";
import { Label } from "../lib/ui/label";
import { Switch } from "../lib/ui/switch";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";
const Settings = () => {
const { theme, setTheme } = useTheme();
const handleDarkModeToggle = (checked: boolean) => {
const newTheme = checked ? "dark" : "light";
setTheme(newTheme);
toast.success(`${checked ? 'Dark' : 'Light'} mode activated`);
};
return (
<div className="min-h-screen p-6">
<div className="mx-auto max-w-2xl">
<h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary
to-blue-400 bg-clip-text text-transparent">

Settings
</h1>
<Card className="glass-effect mb-6">
<CardHeader>
<CardTitle>Notification Settings</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
<div className="flex items-center justify-between">
<Label htmlFor="email-notifications">Email Notifications</Label>
<Switch
id="email-notifications"
onCheckedChange={() => toast.success("Email notification preference updated")}
/>
</div>



<div className="flex items-center justify-between">
<Label htmlFor="meeting-reminders">Meeting Reminders</Label>
<Switch
id="meeting-reminders"
defaultChecked
onCheckedChange={() => toast.success("Meeting reminder preference updated")}/>
</div>
<div className="flex items-center justify-between">
<Label htmlFor="sound-effects">Sound Effects</Label>
<Switch
id="sound-effects"
defaultChecked
onCheckedChange={() => toast.success("Sound effects preference updated")}
/>
</div>
</CardContent>
</Card>
<Card className="glass-effect">
<CardHeader>
<CardTitle>Appearance</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
<div className="flex items-center justify-between">
<Label htmlFor="dark-mode">Dark Mode</Label>
<Switch
id="dark-mode"
checked={theme === "dark"}
onCheckedChange={handleDarkModeToggle}
/>
</div>
<div className="flex items-center justify-between">
<Label htmlFor="animations">Enable Animations</Label>
<Switch
id="animations"
defaultChecked
onCheckedChange={() => toast.success("Animation preference updated")}/>
</div>
</CardContent>
</Card>
</div>
</div>
);



};
export default Settings;