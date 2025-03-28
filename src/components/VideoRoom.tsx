import { useEffect, useRef, useState } from "react";
import { Card } from "./lib/ui/card";
import { Users, Copy, CheckCircle, Link } from "lucide-react";
import { Badge } from "./lib/ui/badge";
import { toast } from "sonner";
import { Input } from "./lib/ui/input";
import { Button } from "../components/ui/button";

interface VideoRoomProps {
  roomId: string;
  onLeave: () => void;
}

export const VideoRoom = ({ roomId, onLeave }: VideoRoomProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<string[]>(["You"]);
  const [activeRooms, setActiveRooms] = useState<string[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);

  const meetingCode = `VO-${roomId}-${roomId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)}`;
  const meetingLink = `${window.location.origin}/?roomId=${roomId}&code=${meetingCode}`;

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        toast.success("Connected to camera and microphone");
      } catch (err) {
        console.error("Error accessing media devices:", err);
        toast.error("Could not access camera or microphone");
      }
    };

    startVideo();

    const timer = setTimeout(() => {
      const newParticipants = [...participants, "Pratima", "Pratima@gmail.com"];
      setParticipants(newParticipants);

      // Save in localStorage
      localStorage.setItem(`meeting-${roomId}`, JSON.stringify(newParticipants));

      // Save room in active rooms list
      const storedRooms = JSON.parse(localStorage.getItem("activeRooms") || "[]");
      if (!storedRooms.includes(roomId)) {
        storedRooms.push(roomId);
        localStorage.setItem("activeRooms", JSON.stringify(storedRooms));
      }

      setActiveRooms(storedRooms);
      toast.success("New participants have joined the meeting");
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem("activeRooms") || "[]");
    setActiveRooms(storedRooms);
  }, []);

  const handleLeaveMeeting = () => {
    localStorage.removeItem(`meeting-${roomId}`);
    onLeave();
  };

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getAudioTracks().forEach((track) => (track.enabled = isMuted));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getVideoTracks().forEach((track) => (track.enabled = !isVideoOn));
    setIsVideoOn(!isVideoOn);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      const screenStream = screenShareRef.current?.srcObject as MediaStream;
      screenStream?.getTracks().forEach((track) => track.stop());
      setIsScreenSharing(false);
      toast.success("Screen sharing ended");
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (screenShareRef.current) screenShareRef.current.srcObject = screenStream;
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          toast.info("Screen sharing ended");
        };
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      } catch (err) {
        console.error("Error sharing screen:", err);
        toast.error("Could not share screen");
      }
    }
  };

  const copyMeetingCode = () => {
    navigator.clipboard.writeText(meetingCode);
    setIsCopied(true);
    toast.success("Meeting code copied to clipboard!");
    setTimeout(() => setIsCopied(false), 3000);
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setIsLinkCopied(true);
    toast.success("Meeting link copied to clipboard! Share with participants to join.");
    setTimeout(() => setIsLinkCopied(false), 3000);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="mx-auto max-w-7xl glass-effect bg-gray-900/70 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Meeting Room: {roomId}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {participants.length} participants
              </span>
            </div>
            <ul>
              {participants.map((user, index) => (
                <li key={index} className="text-white">{user}</li>
              ))}
            </ul>
          </div>
          <Badge variant="secondary" className="text-sm">Meeting in Progress</Badge>
        </div>

        {/* Share Meeting Details */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-800/60 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">Meeting Code:</div>
              <Input value={meetingCode} readOnly className="pr-10 bg-gray-700" />
              <Button size="icon" variant="ghost" onClick={copyMeetingCode}>
                {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="video-grid mb-6">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" />
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center mt-4">
          <Button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</Button>
          <Button onClick={toggleVideo}>{isVideoOn ? "Turn Off Video" : "Turn On Video"}</Button>
          <Button onClick={toggleScreenShare}>{isScreenSharing ? "Stop Sharing" : "Share Screen"}</Button>
        </div>

        {/* Active Rooms Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold">Active Rooms:</h3>
          <ul>
            {activeRooms.map((room) => (
              <li key={room} className="text-white">{room}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};
