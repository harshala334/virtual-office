import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/lib/ui/card";

import { Users, Video, Calendar, Clock, Star, Check } from "lucide-react";
import { useState } from "react";
import type { ConferenceRoom } from "@/types/room";
import { Badge } from "./lib/ui/badge";

interface RoomCardProps {
  room: ConferenceRoom;
  onJoin: (roomId: string) => void;
}

export const RoomCard = ({ room, onJoin }: RoomCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card
      className={[
        "w-full max-w-sm",
        "transition-all duration-300 hover:shadow-lg animate-fade-up",
        "glass-effect bg-gray-800/40",
      ].join(" ")}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle
            className={[
              "text-xl font-semibold",
              "bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent",
            ].join(" ")}
          >
            {room.name}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
            >
              <Star
                className={[
                  "h-4 w-4",
                  isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                ].join(" ")}
              />
              <span className="sr-only">Favorite</span>
            </Button>
            <Badge variant={room.isOccupied ? "destructive" : "secondary"} className="glass-effect">
              {room.isOccupied ? "In Use" : "Available"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {room.participants.length} / {room.capacity}
            </span>
          </div>
          {room.description && <p className="text-sm text-muted-foreground">{room.description}</p>}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-700/40">
              <Clock className="h-4 w-4 mb-1 text-blue-400" />
              <span className="text-xs">No time limit</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-700/40">
              <Calendar className="h-4 w-4 mb-1 text-blue-400" />
              <span className="text-xs">Available now</span>
            </div>
          </div>

          {/* Room Features */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="text-xs font-medium mb-2">Room Features:</h4>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {["HD Video", "Screen Sharing", "Recording", "Chat"].map((feature) => (
                <li key={feature} className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className={[
            "w-full glass-effect",
            "bg-primary/80 hover:bg-primary",
          ].join(" ")}
          onClick={() => onJoin(room.id)}
          disabled={room.isOccupied && room.participants.length >= room.capacity}
        >
          <Video className="mr-2 h-4 w-4" />
          Join Meeting
        </Button>
      </CardFooter>
    </Card>
  );
};
