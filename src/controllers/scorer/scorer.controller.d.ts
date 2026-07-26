import type { Request, Response } from 'express';
export declare const recordScores: (req: Request, res: Response) => Promise<void>;
export declare const getGolferSummary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyFlight: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=scorer.controller.d.ts.map