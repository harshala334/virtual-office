import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
//import { RoomCard } from "@/components/RoomCard";
import { VideoRoom } from "@/components/VideoRoom";
import { Plus} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../lib/ui/dialog";
import { Input } from "../lib/ui/input";

import { toast } from "sonner";
import type { ConferenceRoom } from "../types/room";
import { Label } from "../lib/ui/label";

const Index = () => {
  // Load rooms from localStorage if available
  const loadRooms = (): ConferenceRoom[] => {
    const savedRooms = localStorage.getItem("conferenceRooms");
    if (savedRooms) return JSON.parse(savedRooms);

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

  // Upcoming meetings data
//   const upcomingMeetings = [
//     { id: "1", title: "Weekly Team Sync", time: "Today, 3:00 PM", participants: 8 },
//     { id: "2", title: "Project Alpha Review", time: "Tomorrow, 10:00 AM", participants: 5 },
//     { id: "3", title: "Quarterly Planning", time: "Friday, 2:00 PM", participants: 12 },
//   ];

  // Check URL for room invitation link parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    const code = params.get("code");

    if (roomId && code) {
      if (code.startsWith("VO-")) {
        const room = rooms.find((r) => r.id === roomId);
        if (room) {
          toast.success(`Joining meeting room: ${room.name}`);
          setActiveRoom(roomId);
          // Clean up URL after joining
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          toast.error("Invalid meeting room. The room may have been deleted.");
        }
      } else {
        toast.error("Invalid meeting code");
      }
    }
  }, [rooms]);

  // Save rooms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("conferenceRooms", JSON.stringify(rooms));
  }, [rooms]);

  // Create a new room
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

  // Join a room
  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      const updatedRooms = rooms.map((r) =>
        r.id === roomId ? { ...r, isOccupied: true, participants: [...r.participants, "You"] } : r
      );
      setRooms(updatedRooms);
      setActiveRoom(roomId);
    }
  };

  // Leave the room
  const handleLeaveRoom = () => {
    if (activeRoom) {
      const updatedRooms = rooms.map((r) =>
        r.id === activeRoom
          ? {
              ...r,
              isOccupied: r.participants.length > 1,
              participants: r.participants.filter((p: string) => p !== "You"),
            }
          : r
      );
      setRooms(updatedRooms);
      setActiveRoom(null);
    }
  };

  // Join with a meeting code
  const handleJoinWithCode = () => {
    if (!joinWithCode.trim()) {
      toast.error("Please enter a meeting code");
      return;
    }

    const parts = joinWithCode.split("-");
    if (parts.length >= 2 && parts[0] === "VO") {
      const roomId = parts[1];
      const room = rooms.find((r) => r.id === roomId);
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Virtual Office
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Join or create meeting rooms for your virtual workspace
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Join with Code Dialog */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Join with Code</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="meeting-code">Meeting Code</Label>
                  <Input
                    id="meeting-code"
                    value={joinWithCode}
                    onChange={(e) => setJoinWithCode(e.target.value)}
                    placeholder="Enter meeting code (VO-...)"
                  />
                  <Button className="w-full" onClick={handleJoinWithCode}>
                    Join Meeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Create Room Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="name">Room Name *</Label>
                  <Input id="name" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Enter room name" />
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input id="capacity" type="number" value={newRoomCapacity} onChange={(e) => setNewRoomCapacity(e.target.value)} placeholder="Enter room capacity" />
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input id="description" value={newRoomDescription} onChange={(e) => setNewRoomDescription(e.target.value)} placeholder="Enter room description" />
                  <Button className="w-full" onClick={handleCreateRoom}>
                    Create Room
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
