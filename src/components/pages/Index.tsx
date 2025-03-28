import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RoomCard } from "@/components/RoomCard";
import { VideoRoom } from "@/components/VideoRoom";
import { Plus, Calendar, Clock, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger }
from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ConferenceRoom } from "@/types/room";


const Index = () => {
// Load rooms from localStorage if available
const loadRooms = (): ConferenceRoom[] => {
const savedRooms = localStorage.getItem('conferenceRooms');
if (savedRooms) {
return JSON.parse(savedRooms);
}
// Default rooms if none exist in localStorage
return [
{
id: "1",
name: "Main Conference Room",
capacity: 20,
description: "Main meeting space for company-wide meetings",
isOccupied: false,
meetingId: "meet-123",
participants: [],
},
{
id: "2",
name: "Team Huddle Room",
capacity: 8,
description: "Perfect for small team discussions",
isOccupied: true,
meetingId: "meet-456",
participants: ["user1", "user2"],
},
];
};
const [rooms, setRooms] = useState<ConferenceRoom[]>(loadRooms);
const [activeRoom, setActiveRoom] = useState<string | null>(null);
const [newRoomName, setNewRoomName] = useState("");
const [newRoomCapacity, setNewRoomCapacity] = useState("");
const [newRoomDescription, setNewRoomDescription] = useState("");
const [joinWithCode, setJoinWithCode] = useState("");
const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
// Add upcoming meetings data
const upcomingMeetings = [
{ id: "1", title: "Weekly Team Sync", time: "Today, 3:00 PM",
participants: 8 },
{ id: "2", title: "Project Alpha Review", time: "Tomorrow, 10:00 AM",
participants: 5 },
{ id: "3", title: "Quarterly Planning", time: "Friday, 2:00 PM",
participants: 12 },
];


// Check URL for room invitation link parameters
useEffect(() => {
const params = new URLSearchParams(window.location.search);
const roomId = params.get('roomId');
const code = params.get('code');
if (roomId && code) {

// Validate the code format - should start with VO-
if (code.startsWith('VO-')) {

const room = rooms.find(r => r.id === roomId);
if (room) {
toast.success(`Joining meeting room: ${room.name}`);
setActiveRoom(roomId);
// Clean up URL after joining
window.history.replaceState({}, document.title,

window.location.pathname);
} else {
toast.error("Invalid meeting room. The room may have been

deleted.");
}
} else {
toast.error("Invalid meeting code");
}
}
}, [rooms]);
// Save rooms to localStorage whenever they change
useEffect(() => {
localStorage.setItem('conferenceRooms', JSON.stringify(rooms));
}, [rooms]);
const handleCreateRoom = () => {
if (!newRoomName || !newRoomCapacity) {
toast.error("Please fill in all required fields");
return;
}
const newRoom: ConferenceRoom = {
id: `room-${Date.now()}`,
name: newRoomName,
capacity: parseInt(newRoomCapacity),
description: newRoomDescription,
isOccupied: false,
meetingId: `meet-${Date.now()}`,
participants: [],
};


setRooms([...rooms, newRoom]);
setNewRoomName("");
setNewRoomCapacity("");
setNewRoomDescription("");
toast.success("Room created successfully!");
};
const handleJoinRoom = (roomId: string) => {
const room = rooms.find(r => r.id === roomId);
if (room) {
// Mark the room as occupied when joined
const updatedRooms = rooms.map(r =>
r.id === roomId ? { ...r, isOccupied: true, participants:
[...r.participants, "You"] } : r
);
setRooms(updatedRooms);
setActiveRoom(roomId);
}
};
const handleLeaveRoom = () => {
if (activeRoom) {
// Mark the room as unoccupied and remove the current user from
participants
const updatedRooms = rooms.map(r =>
r.id === activeRoom ?
{
...r,
isOccupied: r.participants.length > 1,
participants: r.participants.filter(p => p !== "You")
} : r
);
setRooms(updatedRooms);
setActiveRoom(null);
}
};
const handleJoinWithCode = () => {
if (!joinWithCode.trim()) {
toast.error("Please enter a meeting code");
return;
}
// Extract roomId from the meeting code
const parts = joinWithCode.split('-');
if (parts.length >= 2 && parts[0] === "VO") {
const roomId = parts[1];


const room = rooms.find(r => r.id === roomId);
if (room) {
handleJoinRoom(roomId);
setJoinWithCode("");
setIsJoinDialogOpen(false);
} else {
toast.error("Invalid meeting code. The room may not exist.");
}
} else {
toast.error("Invalid meeting code format");
}
};
if (activeRoom) {
return <VideoRoom roomId={activeRoom} onLeave={handleLeaveRoom} />;
}
return (
<div className="min-h-screen p-6">
<div className="mx-auto max-w-7xl">
<div className="mb-8 flex flex-col sm:flex-row sm:items-center
sm:justify-between gap-4">

<div>
<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r

from-primary to-blue-400 bg-clip-text text-transparent">

Virtual Office
</h1>
<p className="mt-2 text-lg text-muted-foreground">
Join or create meeting rooms for your virtual workspace
</p>
</div>
<div className="flex flex-wrap gap-2">
<Dialog open={isJoinDialogOpen}
onOpenChange={setIsJoinDialogOpen}>
<DialogTrigger asChild>

<Button variant="outline" className="animate-fade-in glass-
effect">

Join with Code
</Button>
</DialogTrigger>
<DialogContent className="glass-effect">
<DialogHeader>
<DialogTitle>Join Meeting</DialogTitle>
</DialogHeader>
<div className="space-y-4">
<div>
<Label htmlFor="meeting-code">Meeting Code</Label>


<Input
id="meeting-code"
value={joinWithCode}
onChange={(e) => setJoinWithCode(e.target.value)}
placeholder="Enter meeting code (VO-...)"
/>
</div>
<Button className="w-full" onClick={handleJoinWithCode}>
Join Meeting
</Button>
</div>
</DialogContent>
</Dialog>
<Dialog>
<DialogTrigger asChild>
<Button className="animate-fade-in glass-effect">
<Plus className="mr-2 h-4 w-4" />
Create Room
</Button>
</DialogTrigger>
<DialogContent className="glass-effect">
<DialogHeader>
<DialogTitle>Create New Room</DialogTitle>
</DialogHeader>
<div className="space-y-4">
<div>
<Label htmlFor="name">Room Name *</Label>
<Input
id="name"
value={newRoomName}
onChange={(e) => setNewRoomName(e.target.value)}
placeholder="Enter room name"
/>
</div>
<div>
<Label htmlFor="capacity">Capacity *</Label>
<Input
id="capacity"
type="number"
value={newRoomCapacity}
onChange={(e) => setNewRoomCapacity(e.target.value)}
placeholder="Enter room capacity"
/>
</div>
<div>
<Label htmlFor="description">Description

(optional)</Label>


<Input
id="description"
value={newRoomDescription}
onChange={(e) => setNewRoomDescription(e.target.value)}
placeholder="Enter room description"
/>
</div>
<Button className="w-full" onClick={handleCreateRoom}>
Create Room
</Button>
</div>
</DialogContent>
</Dialog>
</div>
</div>
<div className="grid gap-6 md:grid-cols-3">
<div className="md:col-span-2">
<h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
<div className="grid gap-6 sm:grid-cols-2">
{rooms.map((room) => (
<div key={room.id} className="room-card">
<RoomCard room={room} onJoin={handleJoinRoom} />
</div>
))}
</div>
</div>
<div>
<h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
<div className="space-y-4">
{upcomingMeetings.map((meeting) => (
<div
key={meeting.id}
className="p-4 rounded-lg glass-effect bg-gray-800/40

hover:bg-gray-800/60 transition-colors cursor-pointer"

onClick={() => toast.info(`${meeting.title} details will be

available soon`)}
>
<h3 className="font-medium">{meeting.title}</h3>

<div className="mt-2 flex items-center gap-4 text-sm text-
muted-foreground">

<div className="flex items-center gap-1">
<Clock className="h-4 w-4" />
<span>{meeting.time}</span>
</div>
<div className="flex items-center gap-1">
<Users className="h-4 w-4" />


<span>{meeting.participants} participants</span>
</div>
</div>
</div>
))}
<Button
variant="outline"
className="w-full glass-effect"
onClick={() => toast.info("Calendar integration coming soon")}
>
<Calendar className="mr-2 h-4 w-4" />
View Calendar
</Button>
</div>
</div>
</div>
</div>
</div>
);
};
export default Index;