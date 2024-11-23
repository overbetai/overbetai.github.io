import React from 'react';

import { TableCenterProps } from '../../types';
import { PokerCard } from '../common/PokerCard';
import { BetStack } from '../common/BetStack';

export const TableCenter = ({ board, street, pot, prevStreetPot }: TableCenterProps) => {
    return (
        <div style={{
            position: 'absolute',
            top: '35%',
            left: '25%',
            width: '50%',
            height: '28%',
        }}>
            {/* Total Pot Display */}
            <div className="total-pot-display" style={{top: street === 0 ? '30%' : '0'}}>
                <span><strong>Pot: ${pot}</strong></span>
            </div>
            
            {/* Board Cards */}
            <div className="board-cards">
                {(board || []).map((streetCards, streetIndex) => (
                    streetCards.map((card, cardIndex) => (
                        <div key={`${streetIndex}-${cardIndex}`} 
                            style={{ opacity: streetIndex >= street ? 0 : 1 }}>
                            <PokerCard card={card} />
                        </div>
                    ))
                ))}
            </div>


            {/* Previous Street Pot */}
            <div className="prev-pot-display" style={{
                position: 'absolute',
                top: '90%',  // Adjust this to move up/down
                left: '40%', // This positions it between 4th and 5th card
                transform: 'translate(-50%, -50%)',
            }}>
                <BetStack 
                    amount={prevStreetPot}
                    horizontal={true}
                />
            </div>
        </div>
    );
};