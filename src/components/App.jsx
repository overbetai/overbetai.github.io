import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { io } from 'socket.io-client';
import { GameTable } from './GameTable';
import { TextCard } from './common/TextCard';
import { PLAYER_CLASS, PLAYER_SHORT_NAMES } from './common/constants';

export function App() {
    const [gameState, setGameState] = useState(null);
    const [payoffs, setPayoffs] = useState(undefined);
    const [cumulativePayoffs, setCumulativePayoffs] = useState([0, 0, 0, 0]);

    useEffect(() => {
        const socket = io('https://staff-dev1.poker.camp:8001');
        const debugContainer = document.getElementById('debug-container');

        function appendMessage(msg) {
            const msgElement = document.createElement('div');
            try {
                const parsedMsg = JSON.parse(msg);
                console.log(parsedMsg);

                if ('hands' in parsedMsg) {
                    // Show hole cards when new hand starts
                    if (parsedMsg.street === 0 && parsedMsg.action_history_by_street[0].length === 0) {
                        const headerElement = document.createElement('div');
                        headerElement.appendChild(document.createTextNode('\n*** HOLE CARDS ***\n'));
                        debugContainer.appendChild(headerElement);

                        // Show each player's cards from left of dealer
                        parsedMsg.hands.forEach((hand, i) => {
                            const playerElement = document.createElement('div');
                            const b = document.createElement('b');
                            b.className = PLAYER_CLASS[i];
                            b.textContent = PLAYER_SHORT_NAMES[i] + ': ';
                            playerElement.appendChild(b);

                            const cardContainer = document.createElement('span');
                            const root = ReactDOM.createRoot(cardContainer);
                            root.render(
                                <React.Fragment>
                                    {hand.map((card, j) => (
                                        <React.Fragment key={j}>
                                            {j === 0 ? '' : ' '}
                                            <TextCard card={card} />
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                            playerElement.appendChild(cardContainer);
                            debugContainer.appendChild(playerElement);
                        });

                        // Add PREFLOP header after showing hole cards
                        const preflopHeader = document.createElement('div');
                        preflopHeader.appendChild(document.createTextNode('\n*** PREFLOP ***\n'));
                        debugContainer.appendChild(preflopHeader);
                    }

                    // Check if this is a new street with no actions yet
                    if (parsedMsg.street > 0 && parsedMsg.action_history_by_street[parsedMsg.street].length === 0) {
                        const streetNames = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'];
                        const streetCards = parsedMsg.board[parsedMsg.street - 1] || [];
                        
                        msgElement.appendChild(document.createTextNode(`\n*** ${streetNames[parsedMsg.street]} *** [`));
                        
                        // Render each card using React
                        const cardContainer = document.createElement('span');
                        const root = ReactDOM.createRoot(cardContainer);
                        root.render(
                            <React.Fragment>
                                {streetCards.map((card, i) => (
                                    <React.Fragment key={i}>
                                        {i === 0 ? '' : ' '}
                                        <TextCard card={card} />
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        );
                        msgElement.appendChild(cardContainer);
                        msgElement.appendChild(document.createTextNode(']\n'));
                    }
                } else if ('actor' in parsedMsg) {
                    const verb = parsedMsg.action.verb.toLowerCase();
                    const b = document.createElement('b');
                    b.className = PLAYER_CLASS[parsedMsg.actor];
                    b.textContent = PLAYER_SHORT_NAMES[parsedMsg.actor];
                    msgElement.appendChild(b);
                    msgElement.appendChild(document.createTextNode(` ${verb}s${parsedMsg.action.total ? ` to $${parsedMsg.action.total}` : ''}`));
                } else if ('payoffs' in parsedMsg) {
                    msgElement.appendChild(document.createTextNode('\n'));
                    // Sort players by payoff amount, descending
                    const sortedPayoffs = parsedMsg.payoffs
                        .map((payoff, i) => ({payoff, index: i}))
                        .filter(p => p.payoff !== 0)
                        .sort((a, b) => b.payoff - a.payoff);
                    
                    sortedPayoffs.forEach(({payoff, index}) => {
                        const b = document.createElement('b');
                        b.className = PLAYER_CLASS[index];
                        b.textContent = PLAYER_SHORT_NAMES[index];
                        msgElement.appendChild(b);
                        msgElement.appendChild(document.createTextNode(`: ${payoff > 0 ? '+$' : '-$'}${Math.abs(payoff)}\n`));
                    });
                    msgElement.appendChild(document.createTextNode('\n'));
                }

                if ('hands' in parsedMsg) {
                    setPayoffs(undefined);
                    setGameState(parsedMsg);
                } else if ('payoffs' in parsedMsg) {
                    setPayoffs(parsedMsg.payoffs);
                    setCumulativePayoffs(prev => 
                        prev.map((payoff, i) => payoff + (parsedMsg.payoffs[i] || 0))
                    );
                }
            } catch (e) {
                console.log(msg);
                msgElement.style.opacity = "0.3";
                msgElement.textContent = msg;
            }
            debugContainer.appendChild(msgElement);
            debugContainer.scrollTop = debugContainer.scrollHeight;
        }
        
        socket.on('connect', () => {
            appendMessage('Connected to server');
            socket.emit('request_spectate_match', {
                version: "0.1.0",
                params: {
                    game_type: "holdllm",
                    variant: 0
                }
            });
        });

        socket.on('available_spectate_match', (data) => {
            appendMessage('Connected to spectator room');
            setCumulativePayoffs([0, 0, 0, 0]);
        });

        socket.on('game_message', (msg) => {
            appendMessage(msg);
        });

        socket.on('create_match_error', (msg) => {
            appendMessage('Error creating match: ' + msg);
        });

        socket.on('match_ended', () => {
            appendMessage('Match ended');
        });

        return () => socket.disconnect();
    }, []);

    return <GameTable 
        gameState={gameState} 
        payoffs={payoffs}
        cumulativePayoffs={cumulativePayoffs}
    />;
}