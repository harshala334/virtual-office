import { useEffect, useRef, useState } from "react";

import { Card } from "./lib/ui/card";

import{ Mic, MicOff, Video, VideoOff, PhoneOff, Users, Copy, CheckCircle,
  Link, Monitor, MonitorUp
} from "lucide-react";
import { Badge } from "./lib//ui/badge";
import { toast } from "sonner";
import { Input } from "./lib/ui/input";
import { Button } from "./lib/ui/button";

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

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Generate a meeting code
  const meetingCode = `VO-${roomId}-${roomId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)}`;

  // Generate a meeting link
  const meetingLink = `${window.location.origin}/?roomId=${roomId}&code=${meetingCode}`;

  // YouTube video IDs for CSS coding tutorials
  const cssVideoIds = ["1PnVor36_40", "yfoY53QXEnI"];

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        toast.success("Connected to camera and microphone");
      } catch (err) {
        console.error("Error accessing media devices:", err);
        toast.error("Could not access camera or microphone");
        if (localVideoRef.current) {
          localVideoRef.current.classList.add('camera-unavailable');
        }
      }
    };

    startVideo();

    // Simulate participants joining
    const timer = setTimeout(() => {
      setParticipants(prev => [...prev, "Pratima", "Pratima@gmail.com"]);
      toast.success("New participants have joined the meeting");

      // Simulate remote video
      if (remoteVideoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        }).catch(error => console.error("Could not simulate remote video", error));
      }
    }, 3000);

    return () => {
      // Stop media streams on cleanup
      [localVideoRef, screenShareRef, remoteVideoRef].forEach(ref => {
        const stream = ref.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      });
      clearTimeout(timer);
    };
  }, []);

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getAudioTracks().forEach(track => track.enabled = isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getVideoTracks().forEach(track => track.enabled = !isVideoOn);
    setIsVideoOn(!isVideoOn);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      const screenStream = screenShareRef.current?.srcObject as MediaStream;
      screenStream?.getTracks().forEach(track => track.stop());
      setIsScreenSharing(false);
      toast.success("Screen sharing ended");
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Meeting Room: {roomId}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {participants.length} participants
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">Meeting in Progress</Badge>
        </div>

        {/* Share Meeting Code */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-800/60 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">Share this meeting code:</div>
              <div className="relative flex-1 max-w-xs">
                <Input value={meetingCode} readOnly className="pr-10 bg-gray-700" />
                <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full" onClick={copyMeetingCode}>
                  {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                
              </div>
            </div>
          </div>

          {/* Share Meeting Link */}
          <div className="p-4 bg-gray-800/60 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">Share this meeting link:</div>
              <div className="relative flex-1">
                <Input value={meetingLink} readOnly className="pr-10 bg-gray-700 text-xs sm:text-sm" />
                <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full" onClick={copyMeetingLink}>
                  {isLinkCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Link className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="video-grid mb-6">
          <div className="video-container">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" />
          </div>

          {cssVideoIds.map((videoId, index) => (
            <div key={`video-${index}`} className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`CSS Tutorial ${index + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
