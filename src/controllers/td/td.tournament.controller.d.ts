import type { Request, Response } from 'express';
export declare const registerTournament: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTournamentLeaderboard: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const closeTournamentByPeoriaDMN: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const reopenTournamentToLive: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=td.tournament.controller.d.ts.map