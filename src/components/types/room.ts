export type ConferenceRoom = {
    id: string;
    name: string;
    capacity: number;
    description?: string;
    isOccupied: boolean;
    meetingId: string;
    participants: string[];
  };
  