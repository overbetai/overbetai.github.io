import React from 'react';
import { CHIP_DENOMS } from './constants';

const Circle = ({ size, fill, color, strokeWidth, style, strokeDasharray }) => (
    <div className="chip" style={{
        width: size + 'px',
        height: size + 'px',
        backgroundColor: fill,
        border: `${strokeWidth}px ${strokeDasharray ? 'dashed' : 'solid'} ${color}`,
        borderStyle: strokeDasharray ? 'dashed' : 'solid',
        ...style
    }} />
);

const SingleChip = ({ color }) => (
    <div style={{ position: 'relative' }}>
        <Circle
            size={24}
            fill={color}
            color={color === '#000000' ? 'black' : 'black'}
            strokeWidth={2}
        />
        {/* Black circle overlay */}
        <Circle
            size={24}
            fill="transparent"
            color="black"
            strokeWidth={2}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }}
        />
    </div>
);


export const BetStack = ({ amount, horizontal = false }) => {
    if (amount === 0) return null;

    let remaining = amount;
    const chipStacks = horizontal ? [] : [[]];
    
    for (const denom of CHIP_DENOMS) {
        const count = Math.floor(remaining / denom.value);
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                if (horizontal) {
                    if (chipStacks.length > 0 && chipStacks[chipStacks.length-1][0].value === denom.value) {
                        chipStacks[chipStacks.length-1].push(denom);
                    } else {
                        chipStacks.push([denom]);
                    }
                } else {
                    chipStacks[0].push(denom);
                }
            }
            remaining -= count * denom.value;
        }
    }

    return (
        <div className="bet-stack">
            {chipStacks.map((stack, stackIndex) => (
                stack.map((chip, i) => (
                    <div
                        key={`${chip.value}-${stackIndex}-${i}`}
                        style={{
                            position: 'absolute',
                            bottom: `${i * 6}px`,
                            left: `calc(50% + ${stackIndex * 29}px)`,
                            transform: 'translateX(-50%)',
                            zIndex: 100+i
                        }}
                    >
                        <SingleChip color={chip.color} />
                    </div>
                ))
            ))}
            <div style={{
                position: 'absolute',
                left: `calc(50% + ${(chipStacks.length - 1) * 29/2}px)`,
                bottom: `5px`,
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                zIndex: 200
            }}>
                ${amount}
            </div>
        </div>
    );
};