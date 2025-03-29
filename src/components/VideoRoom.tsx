import { useEffect, useRef, useState } from "react";
import { Card } from "./lib/ui/card";
import { Users, Copy, CheckCircle, Link, Video, Mic, MicOff, VideoOff, ScreenShare, StopCircle, X } from "lucide-react";
import { Badge } from "./lib/ui/badge";
import { toast } from "sonner";
import { Input } from "./lib/ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./lib/ui/avatar";

interface VideoRoomProps {
  roomId: string;
  roomName: string;
  onLeave: () => void;
  initialParticipants?: string[];
}

interface Participant {
  id: string;
  name: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  hasScreenShare: boolean;
}

export const VideoRoom = ({ roomId, roomName, onLeave, initialParticipants = ["You"] }: VideoRoomProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants.map((name, index) => ({
      id: `p-${index}`,
      name,
      isVideoOn: name === "You",
      isAudioOn: name === "You",
      hasScreenShare: false
    }))
  );

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);

  const meetingCode = `VO-${roomId}-${roomId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)}`;
  const meetingLink = `${window.location.origin}/?roomId=${roomId}&code=${meetingCode}`;

  // Set up pub/sub communication with localStorage for participant syncing
  const syncKey = `meeting-sync-${roomId}`;
  
  // Function to sync participant data across browser tabs
  const syncParticipants = () => {
    localStorage.setItem(syncKey, JSON.stringify({
      timestamp: Date.now(),
      participants: participants,
      sender: "You"
    }));
  };

  // Listen for storage events to receive participant updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === syncKey) {
        try {
          const data = JSON.parse(e.newValue || '{}');
          if (data.sender !== "You" && data.participants) {
            // Merge participants from other tabs/users
            const otherParticipants = data.participants.filter(
              (p: Participant) => !participants.some(existing => existing.id === p.id)
            );
            
            if (otherParticipants.length > 0) {
              setParticipants(prev => [...prev, ...otherParticipants]);
              toast.info(`${otherParticipants.map((p: Participant) => p.name).join(", ")} joined the meeting`);
            }
          }
        } catch (err) {
          console.error("Error parsing participant sync data:", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial sync to announce presence
    setTimeout(syncParticipants, 500);
    
    // Simulate other participants joining (for demo)
    const timer = setTimeout(() => {
      const names = ["Pratima", "Alex", "Taylor"];
      const newParticipants = names.map((name, i) => ({
        id: `demo-${i}`,
        name: name,
        isVideoOn: Math.random() > 0.3,
        isAudioOn: Math.random() > 0.5,
        hasScreenShare: false
      }));
      
      setParticipants(prev => [...prev, ...newParticipants]);
      toast.success("New participants have joined the meeting");
      
      // Save and sync the updated participant list
      setTimeout(syncParticipants, 100);
    }, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timer);
    };
  }, []);

  // Initialize webcam and mic
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        toast.success("Connected to camera and microphone");
      } catch (err) {
        console.error("Error accessing media devices:", err);
        toast.error("Could not access camera or microphone");
        // Update participant state to reflect no video
        setIsVideoOn(false);
        setParticipants(prev => 
          prev.map(p => p.name === "You" ? {...p, isVideoOn: false} : p)
        );
      }
    };

    startVideo();
  }, []);

  const handleLeaveMeeting = () => {
    // Remove the current user from participants list in storage
    const currentParticipants = JSON.parse(localStorage.getItem(`meeting-${roomId}`) || "[]");
    const updatedParticipants = currentParticipants.filter((p: string) => p !== "You");
    localStorage.setItem(`meeting-${roomId}`, JSON.stringify(updatedParticipants));
    
    // Sync participant removal
    localStorage.setItem(syncKey, JSON.stringify({
      timestamp: Date.now(),
      participants: participants.filter(p => p.name !== "You"),
      sender: "You",
      action: "leave"
    }));
    
    onLeave();
  };

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = isMuted));
    }
    setIsMuted(!isMuted);
    
    // Update participant state
    setParticipants(prev => 
      prev.map(p => p.name === "You" ? {...p, isAudioOn: isMuted} : p)
    );
    
    // Sync changes
    setTimeout(syncParticipants, 100);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !isVideoOn));
    }
    setIsVideoOn(!isVideoOn);
    
    // Update participant state
    setParticipants(prev => 
      prev.map(p => p.name === "You" ? {...p, isVideoOn: !isVideoOn} : p)
    );
    
    // Sync changes
    setTimeout(syncParticipants, 100);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      const screenStream = screenShareRef.current?.srcObject as MediaStream;
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
      setIsScreenSharing(false);
      
      // Update participant state
      setParticipants(prev => 
        prev.map(p => p.name === "You" ? {...p, hasScreenShare: false} : p)
      );
      
      toast.success("Screen sharing ended");
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (screenShareRef.current) screenShareRef.current.srcObject = screenStream;
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          
          // Update participant state
          setParticipants(prev => 
            prev.map(p => p.name === "You" ? {...p, hasScreenShare: false} : p)
          );
          
          toast.info("Screen sharing ended");
          
          // Sync changes
          setTimeout(syncParticipants, 100);
        };
        
        setIsScreenSharing(true);
        
        // Update participant state
        setParticipants(prev => 
          prev.map(p => p.name === "You" ? {...p, hasScreenShare: true} : p)
        );
        
        toast.success("Screen sharing started");
      } catch (err) {
        console.error("Error sharing screen:", err);
        toast.error("Could not share screen");
      }
    }
    
    // Sync changes
    setTimeout(syncParticipants, 100);
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
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="mx-auto max-w-7xl glass-effect bg-gray-900/70 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              {roomName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {participants.length} participants
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">Meeting in Progress</Badge>
            <Button variant="destructive" size="sm" onClick={handleLeaveMeeting}>
              <X className="h-4 w-4 mr-1" />
              Leave
            </Button>
          </div>
        </div>

        {/* Share Meeting Details */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/60 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">Meeting Code:</div>
                <Input value={meetingCode} readOnly className="bg-gray-700" />
                <Button size="icon" variant="ghost" onClick={copyMeetingCode}>
                  {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-800/60 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">Invite Link:</div>
                <Input value={meetingLink} readOnly className="bg-gray-700" />
                <Button size="icon" variant="ghost" onClick={copyMeetingLink}>
                  {isLinkCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Link className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Your video */}
            <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-video">
              {isVideoOn ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                      {participants.find(p => p.name === "You")?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                You {isMuted && '(Muted)'}
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                {isMuted && <MicOff className="h-4 w-4 text-red-500" />}
                {!isVideoOn && <VideoOff className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            
            {/* Screen share (if active) */}
            {isScreenSharing && (
              <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-video col-span-2">
                <video 
                  ref={screenShareRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-contain bg-black" 
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  Your Screen
                </div>
              </div>
            )}
            
            {/* Other participants */}
            {participants
              .filter(p => p.name !== "You")
              .map((participant, index) => (
                <div key={participant.id} className="relative overflow-hidden rounded-lg bg-gray-800 aspect-video">
                  {participant.hasScreenShare ? (
                    <div className="flex items-center justify-center h-full bg-blue-900/30">
                      <div className="text-center">
                        <ScreenShare className="h-10 w-10 mx-auto mb-2 text-blue-400" />
                        <p className="text-sm">{participant.name}'s Screen</p>
                      </div>
                    </div>
                  ) : participant.isVideoOn ? (
                    // Placeholder for participant video (in a real app, this would be a video stream)
                    <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <div className="p-8 rounded-full bg-primary/20">
                        <Video className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {participant.name} {!participant.isAudioOn && '(Muted)'}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!participant.isAudioOn && <MicOff className="h-4 w-4 text-red-500" />}
                    {!participant.isVideoOn && <VideoOff className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Button 
            onClick={toggleMute} 
            variant={isMuted ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
          
          <Button 
            onClick={toggleVideo} 
            variant={isVideoOn ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            {isVideoOn ? "Turn Off Video" : "Turn On Video"}
          </Button>
          
          <Button 
            onClick={toggleScreenShare} 
            variant={isScreenSharing ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isScreenSharing ? <StopCircle className="h-4 w-4" /> : <ScreenShare className="h-4 w-4" />}
            {isScreenSharing ? "Stop Sharing" : "Share Screen"}
          </Button>
        </div>

        {/* Participant List */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Participants ({participants.length})</h3>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                    </Avatar>
                  <span className="font-medium">
                    {participant.name} {participant.name === "You" && "(You)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {participant.hasScreenShare && (
                    <Badge variant="outline" className="bg-blue-900/20 text-blue-400">
                      <ScreenShare className="h-3 w-3 mr-1" />
                      Sharing
                    </Badge>
                  )}
                  {!participant.isAudioOn && <MicOff className="h-4 w-4 text-gray-400" />}
                  {!participant.isVideoOn && <VideoOff className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};