import React from 'react';
import { Card } from '../../types';
import { suitClasses, suitSymbols } from './constants';

interface TextCardProps {
    card: Card
}

export const TextCard = ({ card }: TextCardProps) => {
    if (!card) return null;

    return <span className={`text-card ${suitClasses[card.suit]}`}>{card.rank}{suitSymbols[card.suit]}</span>;
};
