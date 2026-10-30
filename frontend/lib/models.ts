export enum Role {
    Artist = "Artist",
    Professor = "Professor"
}

export interface Workshop {
    name: string;
    address: string;
    description: string;
    latitude: number;
    longitude: number;
    link: string | null;
    date: string;
    type?: string;
}

export interface WorkshopFull extends Workshop {
    id: number;
    type: string;
    institute_id: number | null;
    created_by: number | null;
}

export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: Role;
    institute_id: number | null;
}
