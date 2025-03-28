import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { VideoRoom } from "@/components/VideoRoom";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../lib/ui/dialog";
import { Input } from "../lib/ui/input";
import { toast } from "sonner";
import type { ConferenceRoom } from "../types/room";
import { Label } from "../lib/ui/label";

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

  useEffect(() => {
    localStorage.setItem("conferenceRooms", JSON.stringify(rooms.filter((room) => room.id !== "default-room")));
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
    toast.success("Room created successfully!");
  };

  // Join a room
  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setActiveRoom(roomId);
    }
  };

  // Leave the room
  const handleLeaveRoom = () => {
    setActiveRoom(null);
  };

  if (activeRoom) {
    return <VideoRoom roomId={activeRoom} onLeave={handleLeaveRoom} />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Virtual Office
        </h1>

        {/* Display Available Rooms */}
        <div className="mt-8 p-4 bg-gray-800/70 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Available Rooms:</h3>
          {rooms.length === 0 ? (
            <p className="text-gray-400">No active rooms available.</p>
          ) : (
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li key={room.id} className="flex justify-between items-center p-4 bg-gray-700 rounded-md">
                  <h4 className="text-white text-lg font-semibold">{room.name}</h4>
                  <Button onClick={() => handleJoinRoom(room.id)}>Join</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ind