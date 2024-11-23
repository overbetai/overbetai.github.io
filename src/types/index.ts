export interface Card {
    rank: string
    suit: string
}

export interface GameState {
    num_players?: number;
    starting_stack: number[];
    dealer_button: number;
    winner_index?: number;
    hands: Card[][];
    board: Card[][];
    street: number;
    chips_paid_previous_streets: number[];
    chips_paid_this_street: number[];
    player_to_act: number;
    player_live: boolean[];
}

export interface Position {
    left: string
    top: string
}

export interface PlayerPosition {
    info: Position
    cards: Position
    bet: Position
}

export interface PlayerProps {
    index: number
    name: string
    stack: number
    sessionDelta: number
    position: PlayerPosition
    cards: Card[]
    displayedBet: number
    displayedExtraBet: number
    isActive: boolean
    isLive: boolean
    isDealer: boolean
    playerClass: string
}

export interface TableCenterProps {
    board: Card[][]
    street: number
    pot: number
    prevStreetPot: number
}
