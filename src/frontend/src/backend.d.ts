import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PuzzleTime {
    timestamp: Time;
    sessionId: GameSession;
    timeTaken: Time;
}
export type Time = bigint;
export type GameSession = Principal;
export interface Category {
    name: CategoryName;
    words: Array<string>;
}
export type CategoryName = string;
export interface backendInterface {
    getAllCategories(): Promise<Array<Category>>;
    getCategories(): Promise<Array<CategoryName>>;
    getLeaderboard(categoryName: CategoryName): Promise<Array<PuzzleTime>>;
    getPuzzle(categoryName: CategoryName): Promise<Category>;
    init(): Promise<void>;
    submitPuzzleTime(categoryName: CategoryName, timeTaken: Time): Promise<void>;
}
