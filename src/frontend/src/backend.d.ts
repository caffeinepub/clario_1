import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface OrderStats {
    pendingCount: bigint;
    totalOrders: bigint;
    completedCount: bigint;
    totalRevenue: number;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    revenue: number;
    createdAt: bigint;
    description: string;
    address: string;
    quantity: bigint;
    phone: string;
    photo: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(customerName: string, phone: string, address: string, quantity: bigint, description: string, photo: ExternalBlob, revenue: number): Promise<bigint>;
    deleteOrder(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<OrderStats>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(id: bigint): Promise<void>;
}
