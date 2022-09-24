import type { PlayerType } from "./player.type";
import type { ResultType } from "./result.type";

export type FixtureType = {
    id: string
    dateTime: number
    players: PlayerType[]
    result?: ResultType
    isPast: boolean
}