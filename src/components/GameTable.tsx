import React from 'react';

import { Card } from '../types';
import { Player } from './Player';
import { TableCenter } from './TableCenter';
import { PLAYER_CLASS, PLAYER_NAMES } from './common/constants';

interface GameTableProps {
    gameState: {
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
    } | null;
    payoffs: number[] | undefined;
    cumulativePayoffs: number[];
}

export const GameTable = ({ gameState, payoffs, cumulativePayoffs }: GameTableProps) => {
    if (!gameState) return null;

    // Calculate remaining chips for each player
    const remainingChips = (gameState.starting_stack || []).map((stack, index) => {
        const paidPrevious = (gameState.chips_paid_previous_streets || [])[index] || 0;
        const paidThis = (gameState.chips_paid_this_street || [])[index] || 0;
        return stack - paidPrevious - paidThis;
    });

    const handInfo = {
        players: gameState.num_players || 4,
        stacks: gameState.winner_index !== undefined ? 
            gameState.starting_stack : 
            remainingChips,
        positions: [gameState.dealer_button],
        winner: gameState.winner_index
    };


    const positions = calculatePlayerPositions(handInfo.players);

    const isPayoffState = payoffs !== undefined;

    // Calculate pot values
    const totalPot = (
        (gameState.chips_paid_previous_streets || []).reduce((sum, chips) => sum + chips, 0)
        + (gameState.chips_paid_this_street || []).reduce((sum, chips) => sum + chips, 0)
    );
    
    const prevStreetPot = isPayoffState ? 0 : (
        (gameState.chips_paid_previous_streets || []).reduce((sum, chips) => sum + chips, 0)
    );

    return (
        <div className="game-visualizer">
            <div className="game-table">
                <div className="table-surface">
                    <div className="table-content">
                        <img src="https://overbet.ai/logo.png" className="table-logo" alt="Overbet AI Logo" />

                        <TableCenter 
                            board={gameState.board}
                            street={gameState.street}
                            pot={totalPot}
                            prevStreetPot={prevStreetPot}
                        />

                        {positions.map((pos, i) => (
                            <Player 
                                key={i}
                                index={i}
                                name={PLAYER_NAMES[i]}
                                stack={gameState.starting_stack[i] - gameState.chips_paid_this_street[i] - gameState.chips_paid_previous_streets[i]}
                                sessionDelta={cumulativePayoffs[i]}
                                position={pos}
                                cards={gameState.hands[i]}
                                displayedBet={isPayoffState && payoffs[i] <= 0 ? 0 : gameState.chips_paid_this_street[i]}
                                displayedExtraBet={isPayoffState && payoffs[i] > 0 ? payoffs[i] + gameState.chips_paid_previous_streets[i] : 0}
                                isActive={gameState.player_to_act === i}
                                isLive={gameState.player_live[i]}
                                isDealer={gameState.dealer_button === i}
                                playerClass={PLAYER_CLASS[i]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const calculatePlayerPositions = (numPlayers) => {
    return [...Array(numPlayers)].map((_, i) => {
        const angles = {
            0: -120, // NW
            1: -40,  // NE
            2: 65,   // SE
            3: 140   // SW
        };
        const angle = angles[i] * (Math.PI / 180);

        const aOuter = 59;
        const bOuter = 50;
        const aInner = 38;
        const bInner = 32;

        // Adjust bet offsets for diagonal positions
        let betOffset;
        if (i === 0) {      // NW
            betOffset = { x: 10, y: 10 };
        } else if (i === 1) { // NE
            betOffset = { x: -10, y: 10 };
        } else if (i === 2) { // SE
            betOffset = { x: -10, y: -10 };
        } else {              // SW
            betOffset = { x: 10, y: -10 };
        }

        const cardPos = {
            left: 50 + aInner * Math.cos(angle),
            top: 50 + bInner * Math.sin(angle)
        };
        
        return {
            info: {
                left: `${50 + aOuter * Math.cos(angle)}%`,
                top: `${50 + bOuter * Math.sin(angle)}%`,
            },
            cards: {
                left: `${cardPos.left}%`,
                top: `${cardPos.top}%`,
            },
            bet: {
                left: `${cardPos.left + betOffset.x}%`,
                top: `${cardPos.top + betOffset.y}%`,
            }
        };
    });
};