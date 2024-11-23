import React from 'react';
import { Card } from '../../types';
import { suitClasses, suitSymbols } from './constants';

interface PokerCardProps {
    card: Card
}

export const PokerCard = ({ card }: PokerCardProps) => {
    if (!card) return null;
    
    
    return (
        <div className={`poker-card ${suitClasses[card.suit]}`}>
            {card.rank}{suitSymbols[card.suit]}
        </div>
    );
};