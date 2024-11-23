import React from 'react';

import { PlayerProps } from '../../types';
import { PokerCard } from '../common/PokerCard';
import { BetStack } from '../common/BetStack';
import { DealerButton } from './DealerButton';

export const Player = ({ 
    index, name, stack, sessionDelta, position, 
    cards, displayedBet, displayedExtraBet, isActive, isLive, isDealer, playerClass 
}: PlayerProps) => {
    const isLeftToRight = (index === 0 || index === 3);

    return (
        <>
            {/* Player Info Box */}
            <div className={`player-info ${playerClass}`} style={{
                left: position.info.left,
                top: position.info.top,
            }}>
                <div className={`player-info-box ${isActive ? 'player-info-box-active' : ''} ${
                    isLive ? '' : 'player-info-box-not-live'
                }`}>
                    <div>{name}</div>
                    <div>${stack} ({sessionDelta >= 0 ? '+' : '-'}${Math.abs(sessionDelta)} session)</div>
                </div>
            </div>

            {/* Player Cards */}
            <div className={`player-cards ${isLive ? '' : 'player-cards-not-live'}`} style={{
                left: position.cards.left,
                top: position.cards.top,
                position: "absolute",
            }}>
                {isDealer && (
                    <DealerButton style={{
                        top: "50%",
                        left: isLeftToRight ? -22 : "auto",
                        right: isLeftToRight ? "auto" : -62,
                    }} />
                )}

                {(cards || []).map((card, cardIdx) => (
                    <PokerCard key={cardIdx} card={card} />
                ))}

                <div className="player-bet" style={{
                    top: "70%",
                    left: isLeftToRight ? "auto" : -20,
                    right: isLeftToRight ? -48 : "auto",
                    transform: "translateX(-50%) translateY(-50%)",
                }}>
                    <BetStack 
                        amount={displayedBet}
                    />
                </div>

                <div className="player-bet" style={{
                    top: "70%",
                    left: isLeftToRight ? "auto" : -52,
                    right: isLeftToRight ? -80 : "auto",
                    transform: "translateX(-50%) translateY(-50%)",
                }}>
                    <BetStack 
                        amount={displayedExtraBet}
                    />
                </div>
            </div>
            
        </>
    );
};
