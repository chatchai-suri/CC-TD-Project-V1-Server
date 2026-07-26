import type { Request, Response } from "express";
export declare const setupFlightWithMembers: (req: Request, res: Response) => Promise<void>;
export declare const updateFlightInfo: (req: Request, res: Response) => Promise<void>;
export declare const changeFlightMembers: (req: Request, res: Response) => Promise<void>;
export declare const getFlightSetup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteFlight: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=td.flight.controller.d.ts.map