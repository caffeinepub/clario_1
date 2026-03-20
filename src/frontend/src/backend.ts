import { Actor } from "@icp-sdk/core/agent";
import { idlFactory } from "./declarations/backend.did.js";
import type { _SERVICE } from "./declarations/backend.did";
import type { Principal } from "@icp-sdk/core/principal";

// ─── ExternalBlob ────────────────────────────────────────────────────────────

export class ExternalBlob {
  private _bytes?: Uint8Array;
  private _url?: string;
  _onProgress?: (percentage: number) => void;

  private constructor(bytes?: Uint8Array, url?: string) {
    this._bytes = bytes;
    this._url = url;
  }

  async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    if (this._bytes) return this._bytes as Uint8Array<ArrayBuffer>;
    if (this._url) {
      const resp = await fetch(this._url);
      const buf = await resp.arrayBuffer();
      this._bytes = new Uint8Array(buf);
      return this._bytes as Uint8Array<ArrayBuffer>;
    }
    return new Uint8Array(0) as Uint8Array<ArrayBuffer>;
  }

  getDirectURL(): string {
    return this._url ?? "";
  }

  static fromURL(url: string): ExternalBlob {
    return new ExternalBlob(undefined, url);
  }

  static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
    return new ExternalBlob(blob);
  }

  withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    const clone = new ExternalBlob(this._bytes, this._url);
    clone._onProgress = onProgress;
    return clone;
  }
}

// ─── OrderStatus ─────────────────────────────────────────────────────────────

export enum OrderStatus {
  pending = "pending",
  completed = "completed",
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateActorOptions = {
  agentOptions?: { identity?: any; [key: string]: any };
  agent?: any;
  processError?: (e: unknown) => never;
};

export interface backendInterface {
  _initializeAccessControlWithSecret(token: string): Promise<void>;
  assignCallerUserRole(user: Principal, role: any): Promise<void>;
  createOrder(
    customerName: string,
    phone: string,
    address: string,
    quantity: bigint,
    description: string,
    photo: ExternalBlob,
    revenue: number,
  ): Promise<bigint>;
  deleteOrder(id: bigint): Promise<void>;
  getAllOrders(): Promise<any[]>;
  getCallerUserProfile(): Promise<any | null>;
  getCallerUserRole(): Promise<any>;
  getDashboardStats(): Promise<any>;
  getOrdersByStatus(status: OrderStatus): Promise<any[]>;
  getUserProfile(user: Principal): Promise<any | null>;
  isCallerAdmin(): Promise<boolean>;
  saveCallerUserProfile(profile: any): Promise<void>;
  updateOrderStatus(id: bigint): Promise<void>;
}

// ─── IDL helpers ─────────────────────────────────────────────────────────────

function toVariant(value: string): Record<string, null> {
  return { [value]: null };
}

function fromVariant(variant: Record<string, null>): string {
  return Object.keys(variant)[0];
}

function fromOption<T>(opt: [] | [T]): T | null {
  if (opt.length > 0) return opt[0] as T;
  return null;
}

async function fromOrder(
  o: any,
  downloadFile: (bytes: Uint8Array) => Promise<ExternalBlob>,
): Promise<any> {
  return {
    ...o,
    status: fromVariant(o.status) as OrderStatus,
    photo: await downloadFile(o.photo as Uint8Array),
  };
}

// ─── createActor ─────────────────────────────────────────────────────────────

export function createActor(
  canisterId: string,
  uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  downloadFile: (bytes: Uint8Array) => Promise<ExternalBlob>,
  options?: CreateActorOptions,
): backendInterface {
  const raw = Actor.createActor<_SERVICE>(idlFactory, {
    agent: options?.agent,
    canisterId,
  });

  return {
    _initializeAccessControlWithSecret: (token) =>
      (raw as any)._initializeAccessControlWithSecret(token),

    assignCallerUserRole: (user, role) =>
      (raw as any).assignCallerUserRole(user, toVariant(role as string)),

    createOrder: async (name, phone, addr, qty, desc, photo, revenue) => {
      const bytes = await uploadFile(photo);
      return raw.createOrder(name, phone, addr, qty, desc, bytes, revenue);
    },

    deleteOrder: (id) => raw.deleteOrder(id),

    getAllOrders: async () => {
      const orders = await raw.getAllOrders();
      return Promise.all(orders.map((o) => fromOrder(o, downloadFile)));
    },

    getCallerUserProfile: async () =>
      fromOption(await raw.getCallerUserProfile()),

    getCallerUserRole: async () =>
      fromVariant((await raw.getCallerUserRole()) as any),

    getDashboardStats: () => raw.getDashboardStats(),

    getOrdersByStatus: async (status) => {
      const orders = await raw.getOrdersByStatus(toVariant(status as string) as any);
      return Promise.all(orders.map((o) => fromOrder(o, downloadFile)));
    },

    getUserProfile: async (user) =>
      fromOption(await raw.getUserProfile(user)),

    isCallerAdmin: () => raw.isCallerAdmin(),

    saveCallerUserProfile: (profile) => raw.saveCallerUserProfile(profile),

    updateOrderStatus: (id) => raw.updateOrderStatus(id),
  };
}
