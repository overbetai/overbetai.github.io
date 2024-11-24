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

        function getPositions(dealerIndex) {
            // BTN is at dealerIndex
            // SB is next after BTN
            // BB is next after SB
            // CO is before BTN
            return {
                btnIndex: dealerIndex,
                sbIndex: (dealerIndex + 1) % 4,
                bbIndex: (dealerIndex + 2) % 4,
                coIndex: (dealerIndex + 3) % 4
            };
        }

        function formatAction(verb, total) {
            const v = verb.toLowerCase();
            if (v === 'bet') {
                return `bets $${total}`;
            } else if (v === 'raise') {
                return `raises to $${total}`;
            } else if (v === 'fold') {
                return 'folds';
            } else if (v === 'call') {
                return 'calls';
            } else if (v === 'check') {
                return 'checks';
            }
            return v + (total ? ` $${total}` : '');
        }

        function appendMessage(msg) {
            const msgElement = document.createElement('div');
            try {
                const parsedMsg = JSON.parse(msg);
                console.log(parsedMsg);

                if ('hands' in parsedMsg) {
                    if (parsedMsg.street === 0 && parsedMsg.action_history_by_street[0].length === 0) {
                        const positions = getPositions(parsedMsg.dealer_button);

                        const headerElement = document.createElement('div');
                        headerElement.appendChild(document.createTextNode('\n*** HOLE CARDS ***\n'));
                        debugContainer.appendChild(headerElement);
                        
                        // Show cards in order: SB, BB, CO, BTN
                        [positions.sbIndex, positions.bbIndex, positions.coIndex, positions.btnIndex].forEach(i => {
                            if (!parsedMsg.hands[i]) return;
                            
                            const playerElement = document.createElement('div');
                            const b = document.createElement('b');
                            b.className = PLAYER_CLASS[i];
                            const position = i === positions.sbIndex ? 'SB' :
                                           i === positions.bbIndex ? 'BB' :
                                           i === positions.coIndex ? 'CO' : 'BTN';
                            b.textContent = `${PLAYER_SHORT_NAMES[i]} (${position}): `;
                            playerElement.appendChild(b);

                            const cardContainer = document.createElement('span');
                            const root = ReactDOM.createRoot(cardContainer);
                            root.render(
                                <React.Fragment>
                                    {'['}
                                    {parsedMsg.hands[i].map((card, j) => (
                                        <React.Fragment key={j}>
                                            {j === 0 ? '' : ' '}
                                            <TextCard card={card} />
                                        </React.Fragment>
                                    ))}
                                    {']'}
                                </React.Fragment>
                            );
                            playerElement.appendChild(cardContainer);
                            debugContainer.appendChild(playerElement);
                        });

                        // Add PREFLOP header
                        const preflopHeader = document.createElement('div');
                        preflopHeader.appendChild(document.createTextNode('\n*** PREFLOP ***\n'));
                        debugContainer.appendChild(preflopHeader);
                        
                        // Add small blind post
                        const sbPost = document.createElement('div');
                        const sbName = document.createElement('b');
                        sbName.className = PLAYER_CLASS[positions.sbIndex];
                        sbName.textContent = PLAYER_SHORT_NAMES[positions.sbIndex];
                        sbPost.appendChild(sbName);
                        sbPost.appendChild(document.createTextNode(' posts small blind $5'));
                        debugContainer.appendChild(sbPost);
                        
                        // Add big blind post
                        const bbPost = document.createElement('div');
                        const bbName = document.createElement('b');
                        bbName.className = PLAYER_CLASS[positions.bbIndex];
                        bbName.textContent = PLAYER_SHORT_NAMES[positions.bbIndex];
                        bbPost.appendChild(bbName);
                        bbPost.appendChild(document.createTextNode(' posts big blind $10'));
                        debugContainer.appendChild(bbPost);
                    }

                    // Handle new street display
                    if (parsedMsg.street > 0 && parsedMsg.action_history_by_street[parsedMsg.street].length === 0) {
                        const streetNames = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'];
                        const streetCards = parsedMsg.board[parsedMsg.street - 1] || [];
                        
                        msgElement.appendChild(document.createTextNode(`\n*** ${streetNames[parsedMsg.street]} *** [`));
                        
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
                    const b = document.createElement('b');
                    b.className = PLAYER_CLASS[parsedMsg.actor];
                    b.textContent = PLAYER_SHORT_NAMES[parsedMsg.actor];
                    msgElement.appendChild(b);
                    msgElement.appendChild(document.createTextNode(` ${formatAction(parsedMsg.action.verb, parsedMsg.action.total)}`));
                } else if ('payoffs' in parsedMsg) {
                    msgElement.appendChild(document.createTextNode('\n*** RESULTS ***\n'));
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