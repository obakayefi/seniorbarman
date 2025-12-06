export interface IEventStats {
    totalTicketsBought: number;
    totalPeopleCheckedIn: number;
    totalPeopleInside: number;
    totalPeopleOutside: number;
    
}

export type TicketPayload = {
    _id: string;
    eventId: string;
    userId: string;
    checkInToken: string;
    status: string;
    checkInLogs: []
    user: {
        name: string;
        email: string;
        image: string | null;
    };
    qrCode: string;      // the Base64 PNG string
    decodedQR: string;   // e.g. "255dd9f9abcbd9fb12f662f5577604d0"
};
