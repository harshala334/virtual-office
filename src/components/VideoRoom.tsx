import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Copy, CheckCircle,
Link, Monitor, MonitorUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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

VIRTUAL OFFICE MEET 78

const localVideoRef = useRef<HTMLVideoElement>(null);
const screenShareRef = useRef<HTMLVideoElement>(null);
const remoteVideoRef = useRef<HTMLVideoElement>(null);
// Generate a meeting code that will be consistent for the same roomId
const meetingCode = `VO-${roomId}-${roomId.split('').reduce((a, b) => a +
b.charCodeAt(0), 0)}`;
// Generate a meeting link that others can use to join
const meetingLink =
`${window.location.origin}/?roomId=${roomId}&code=${meetingCode}`;
// YouTube video IDs for CSS coding tutorials
const cssVideoIds = [
"1PnVor36_40", // CSS in 20 Minutes
"yfoY53QXEnI", // CSS Crash Course
];
useEffect(() => {
const startVideo = async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({
video: true,
audio: true
});
if (localVideoRef.current) {
localVideoRef.current.srcObject = stream;
}
toast.success("Connected to camera and microphone");
} catch (err) {
console.error("Error accessing media devices:", err);
toast.error("Could not access camera or microphone");
// Fallback to avatar if camera access fails
if (localVideoRef.current) {
localVideoRef.current.classList.add('camera-unavailable');
}
}
};
startVideo();
// Simulate other participants joining after a short delay
const timer = setTimeout(() => {
setParticipants(prev => [...prev, "Pratima", "Pratima@gmail.com"]);
toast.success("New participants have joined the meeting");
// Simulate remote video connection

VIRTUAL OFFICE MEET 79

if (remoteVideoRef.current) {
try {
// This is just a simulation - in a real app this would be from

WebRTC

navigator.mediaDevices.getUserMedia({
video: true,
audio: false
}).then(stream => {
if (remoteVideoRef.current) {
remoteVideoRef.current.srcObject = stream;
}
});
} catch (error) {
console.error("Could not simulate remote video", error);
}
}
}, 3000);
return () => {
const stream = localVideoRef.current?.srcObject as MediaStream;
stream?.getTracks().forEach(track => track.stop());
const screenStream = screenShareRef.current?.srcObject as MediaStream;
screenStream?.getTracks().forEach(track => track.stop());
const remoteStream = remoteVideoRef.current?.srcObject as MediaStream;
remoteStream?.getTracks().forEach(track => track.stop());
clearTimeout(timer);
};
}, []);
const toggleMute = () => {
const stream = localVideoRef.current?.srcObject as MediaStream;
stream?.getAudioTracks().forEach(track => {
track.enabled = isMuted;
});
setIsMuted(!isMuted);
};
const toggleVideo = () => {
const stream = localVideoRef.current?.srcObject as MediaStream;
stream?.getVideoTracks().forEach(track => {
track.enabled = !isVideoOn;
});
setIsVideoOn(!isVideoOn);
};

VIRTUAL OFFICE MEET 80

const toggleScreenShare = async () => {
if (isScreenSharing) {
const screenStream = screenShareRef.current?.srcObject as MediaStream;
screenStream?.getTracks().forEach(track => track.stop());
setIsScreenSharing(false);
toast.success("Screen sharing ended");
} else {
try {
const screenStream = await navigator.mediaDevices.getDisplayMedia({
video: true,
audio: true
});
if (screenShareRef.current) {
screenShareRef.current.srcObject = screenStream;
}
// Auto-stop screen sharing when track ends
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
toast.success("Meeting link copied to clipboard! Share with participants
to join.");
setTimeout(() => setIsLinkCopied(false), 3000);
};
return (

VIRTUAL OFFICE MEET 81

<div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 to-gray-
800">

<Card className="mx-auto max-w-7xl glass-effect bg-gray-900/70">
<div className="p-6">
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
<Badge variant="secondary" className="text-sm">
Meeting in Progress
</Badge>
</div>
<div className="mb-6 space-y-4">
<div className="p-4 bg-gray-800/60 rounded-lg">
<div className="flex items-center gap-3">
<div className="text-sm font-medium">Share this meeting

code:</div>

<div className="relative flex-1 max-w-xs">
<Input
value={meetingCode}
readOnly
className="pr-10 bg-gray-700"
/>
<Button
size="icon"
variant="ghost"
className="absolute right-0 top-0 h-full"
onClick={copyMeetingCode}
>
{isCopied ?
<CheckCircle className="h-4 w-4 text-green-500" /> :
<Copy className="h-4 w-4" />
}
</Button>
</div>
<div className="text-xs text-muted-foreground hidden

sm:block">

Others can join using this code
</div>
</div>
</div>

VIRTUAL OFFICE MEET 82

<div className="p-4 bg-gray-800/60 rounded-lg">
<div className="flex items-center gap-3">
<div className="text-sm font-medium">Share this meeting

link:</div>

<div className="relative flex-1">
<Input
value={meetingLink}
readOnly
className="pr-10 bg-gray-700 text-xs sm:text-sm"
/>
<Button
size="icon"
variant="ghost"
className="absolute right-0 top-0 h-full"
onClick={copyMeetingLink}
>
{isLinkCopied ?
<CheckCircle className="h-4 w-4 text-green-500" /> :
<Link className="h-4 w-4" />
}
</Button>
</div>
</div>
</div>
</div>
<div className="video-grid mb-6">
{/* Screen share container - shown only when screen is being

shared */}

{isScreenSharing && (

<div className="video-container col-span-2 row-span-2 bg-gray-
800">

<video
ref={screenShareRef}
autoPlay
playsInline
className="w-full h-full object-contain rounded-lg"
/>
<div className="absolute top-3 left-3 bg-black/50 px-2 py-1

rounded text-xs">

Your Screen
</div>
</div>
)}
{/* Your video */}
<div className="video-container">

VIRTUAL OFFICE MEET 83

<video
ref={localVideoRef}
autoPlay
playsInline
muted
className="w-full h-full object-cover rounded-lg"
/>
<div className="absolute top-3 left-3 bg-black/50 px-2 py-1

rounded text-xs">

You (Host)
</div>
<div className="controls-overlay">
<Button
variant="secondary"
size="sm"
onClick={toggleMute}
className="bg-gray-800/80 hover:bg-gray-700"
>
{isMuted ? <MicOff className="h-4 w-4" /> : <Mic

className="h-4 w-4" />}
</Button>
<Button
variant="secondary"
size="sm"
onClick={toggleVideo}
className="bg-gray-800/80 hover:bg-gray-700"
>
{isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff

className="h-4 w-4" />}
</Button>
<Button
variant="secondary"
size="sm"
onClick={toggleScreenShare}
className="bg-gray-800/80 hover:bg-gray-700"
>
{isScreenSharing ?
<MonitorUp className="h-4 w-4" /> :
<Monitor className="h-4 w-4" />
}
</Button>
<Button
variant="destructive"
size="sm"
onClick={onLeave}
className="bg-red-600/80 hover:bg-red-700"
>
<PhoneOff className="h-4 w-4" />

VIRTUAL OFFICE MEET 84

</Button>
</div>
</div>
{/* Participant video blocks */}
{participants.slice(1).map((participant, index) => (
<div key={index} className="video-container bg-gray-800">
{index === 0 ? (
<video
ref={remoteVideoRef}
autoPlay
playsInline
className="w-full h-full object-cover rounded-lg"
/>
) : (

<div className="w-full h-full flex items-center justify-
center relative">

<div className="text-2xl font-bold text-gray-
600">{participant.charAt(0)}</div>

</div>
)}
<div className="absolute top-3 left-3 bg-black/50 px-2 py-1

rounded text-xs">

{participant}
</div>
</div>
))}
{/* YouTube video iframes for CSS tutorials */}
{cssVideoIds.map((videoId, index) => (
<div key={`video-${index}`} className="video-container">
<iframe
src={`https://www.youtube.com/embed/${videoId}`}
title={`CSS Tutorial ${index + 1}`}

allow="accelerometer; autoplay; clipboard-write; encrypted-
media; gyroscope; picture-in-picture"

allowFullScreen
className="w-full h-full"
/>
</div>
))}
</div>
</div>
</Card>
</div>
);
};