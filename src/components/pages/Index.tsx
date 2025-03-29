import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { VideoRoom } from "@/components/VideoRoom";
import { Plus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../lib/ui/dialog";
import { Input } from "../lib/ui/input";
import { toast } from "sonner";
import type { ConferenceRoom } from "../types/room";
import { Label } from "../lib/ui/label";
import { RoomCard } from "../Roomcard";

// 🔹 Hardcoded default room (visible to everyone)
const DEFAULT_ROOM: ConferenceRoom = {
  id: "default-room",
  name: "Open Meeting Room",
  capacity: 10,
  description: "A public room for all users",
  isOccupied: false,
  meetingId: "meet-default",
  participants: [],
};

const Index = () => {
  // Load rooms from localStorage if available
  const loadRooms = (): ConferenceRoom[] => {
    const savedRooms = localStorage.getItem("conferenceRooms");
    if (savedRooms) return [DEFAULT_ROOM, ...JSON.parse(savedRooms)];
    return [DEFAULT_ROOM];
  };

  const [rooms, setRooms] = useState<ConferenceRoom[]>(loadRooms);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("conferenceRooms", JSON.stringify(rooms.filter((room) => room.id !== "default-room")));
    
    // Check URL for roomId and code parameters (for direct joining)
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdParam = urlParams.get('roomId');
    const codeParam = urlParams.get('code');
    
    if (roomIdParam && codeParam) {
      handleJoinWithCode(roomIdParam, codeParam);
      
      // Clear URL parameters after joining
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Generate a meeting code for a room
  const generateMeetingCode = (roomId: string) => {
    return `VO-${roomId}-${roomId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)}`;
  };

  // Create a new room
  const handleCreateRoom = () => {
    if (!newRoomName || !newRoomCapacity) {
      toast.error("Please fill in all required fields");
      return;
    }

    const roomId = `room-${Date.now()}`;
    const newRoom: ConferenceRoom = {
      id: roomId,
      name: newRoomName,
      capacity: parseInt(newRoomCapacity),
      description: newRoomDescription,
      isOccupied: false,
      meetingId: `meet-${Date.now()}`,
      participants: [],
    };

    setRooms([...rooms, newRoom]);
    setIsDialogOpen(false);
    
    // Clear form
    setNewRoomName("");
    setNewRoomCapacity("");
    setNewRoomDescription("");
    
    toast.success(`Room created successfully! Code: ${generateMeetingCode(roomId)}`);
  };

  // Join a room
  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      // Add current user to participants
      const updatedRooms = rooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            isOccupied: true,
            participants: [...r.participants, "You"]
          };
        }
        return r;
      });
      
      setRooms(updatedRooms);
      setActiveRoom(roomId);
      
      // Store participant info in localStorage
      const currentParticipants = JSON.parse(localStorage.getItem(`meeting-${roomId}`) || "[]");
      if (!currentParticipants.includes("You")) {
        localStorage.setItem(`meeting-${roomId}`, JSON.stringify([...currentParticipants, "You"]));
      }
    }
  };

  // Try to join a room with a meeting code
  const handleJoinWithCodeButton = () => {
    if (!joinCode) {
      toast.error("Please enter a meeting code");
      return;
    }

    // Parse the meeting code (format: VO-roomId-checksum)
    const parts = joinCode.split('-');
    if (parts.length !== 3 || parts[0] !== 'VO') {
      toast.error("Invalid meeting code format");
      return;
    }

    const roomId = parts[1];
    const checksum = parts[2];
    
    // Verify the meeting code
    const calculatedChecksum = roomId.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString();
    
    if (checksum !== calculatedChecksum) {
      toast.error("Invalid meeting code");
      return;
    }

    handleJoinWithCode(roomId, joinCode);
    setIsJoinDialogOpen(false);
  };
  
  // Join with a validated room ID and code
  const handleJoinWithCode = (roomId: string, code: string) => {
    // Check if room exists
    const roomExists = rooms.some(r => r.id === roomId);
    
    if (!roomExists) {
      // Create a temporary room if it doesn't exist
      // (This allows joining rooms created by others)
      const newRoom: ConferenceRoom = {
        id: roomId,
        name: `Meeting ${roomId.substring(0, 5)}`,
        capacity: 10,
        description: "Joined via meeting code",
        isOccupied: true,
        meetingId: `meet-${roomId}`,
        participants: ["You"],
      };
      
      setRooms(prevRooms => [...prevRooms, newRoom]);
    }
    
    // Join the room
    handleJoinRoom(roomId);
    toast.success("Joined meeting successfully!");
  };

  // Leave the room
  const handleLeaveRoom = () => {
    if (activeRoom) {
      // Remove current user from participants
      const updatedRooms = rooms.map(r => {
        if (r.id === activeRoom) {
          const participants = r.participants.filter(p => p !== "You");
          return {
            ...r,
            isOccupied: participants.length > 0,
            participants
          };
        }
        return r;
      });
      
      setRooms(updatedRooms);
    }
    
    setActiveRoom(null);
  };

  if (activeRoom) {
    // Get room details for the active room
    const room = rooms.find(r => r.id === activeRoom) || {
      id: activeRoom,
      name: `Meeting ${activeRoom.substring(0, 5)}`,
      participants: ["You"]
    };
    
    return (
      <VideoRoom 
        roomId={activeRoom} 
        roomName={room.name} 
        onLeave={handleLeaveRoom} 
        initialParticipants={room.participants} 
      />
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Virtual Office
          </h1>
          
          <div className="flex gap-3">
            {/* Join Meeting Dialog */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="join-code">Meeting Code</Label>
                    <Input
                      id="join-code"
                      placeholder="Enter meeting code (VO-room-code)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleJoinWithCodeButton}>Join Meeting</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Create Meeting Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Room Name</Label>
                    <Input
                      id="room-name"
                      placeholder="Enter room name"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-capacity">Capacity</Label>
                    <Input
                      id="room-capacity"
                      type="number"
                      placeholder="Enter maximum participants"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-description">Description (Optional)</Label>
                    <Input
                      id="room-description"
                      placeholder="Enter room description"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateRoom}>Create Room</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Display Available Rooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={handleJoinRoom}
            />
          ))}
        </div>
        
        {rooms.length === 0 && (
          <div className="text-center p-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No rooms available</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first room
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;