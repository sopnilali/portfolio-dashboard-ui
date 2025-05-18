export type TUser = {
    email?: string;
    exp?: number;
    iat?: number;
    id: string;
    role: "User" | "Admin";
};