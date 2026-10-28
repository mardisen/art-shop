export enum Role {
    Artist = "Artist",
    Professor = "Professor"
}

export interface Workshop {
    id: number;
    name: string;
    address: string;
    description: string;
    latitude: number;
    longitude: number;
    link: string;
    type: string;
    date: Date;
}

export interface User{
    id: number;
    name: string;
    surname: string;
    email: string;
    role: Role;
    institute_id: number | null;
}