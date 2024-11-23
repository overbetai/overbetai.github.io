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
                    // Check if this is a new street with no actions yet
                    if (parsedMsg.action_history_by_street[parsedMsg.street].length === 0) {
                        const streetNames = ['Preflop', 'Flop', 'Turn', 'River'];
                        const streetCards = parsedMsg.board[parsedMsg.street - 1] || [];
                        
                        if (parsedMsg.street > 0) { // Don't show for preflop
                            msgElement.appendChild(document.createTextNode(`\n`));
                            const b = document.createElement('b');
                            b.style.color = '#444444';
                            b.textContent = `${streetNames[parsedMsg.street]}:`;
                            msgElement.appendChild(b);
                            
                            // Render each card using React
                            const cardContainer = document.createElement('span');
                            cardContainer.style.marginLeft = '0.3em';
                            const root = ReactDOM.createRoot(cardContainer);
                            root.render(
                                <React.Fragment>
                                    {streetCards.map((card, i) => (
                                        <React.Fragment key={i}>
                                            {i == 0 ? '' : ' '}
                                            <TextCard card={card} />
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                            msgElement.appendChild(cardContainer);
                        }
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
                // Only update game state if the message contains hands data
                if ('hands' in parsedMsg) {
                    // sample game state data:
                    // {"player_to_act": 1, "action_history": [[2, {"verb": "Raise", "total": 30}], [3, {"verb": "Fold"}], [0, {"verb": "Call"}], [1, {"verb": "Call"}], [0, {"verb": "Check"}]], "action_history_by_street": [[[2, {"verb": "Raise", "total": 30}], [3, {"verb": "Fold"}], [0, {"verb": "Call"}], [1, {"verb": "Call"}]], [[0, {"verb": "Check"}]], [], []], "hands": [[{"rank": "4", "suit": "c"}, {"rank": "A", "suit": "c"}], [{"rank": "A", "suit": "s"}, {"rank": "2", "suit": "d"}], [{"rank": "Q", "suit": "s"}, {"rank": "9", "suit": "s"}], [{"rank": "9", "suit": "h"}, {"rank": "5", "suit": "c"}]], "board": [[{"rank": "7", "suit": "h"}, {"rank": "K", "suit": "h"}, {"rank": "8", "suit": "h"}], [{"rank": "3", "suit": "c"}], [{"rank": "J", "suit": "h"}]], "street": 1, "chips_paid_this_street": [0, 0, 0, 0], "chips_paid_previous_streets": [30, 30, 30, 0], "player_live": [true, true, true, false], "player_action_option": [false, true, true, false], "starting_stack": [1000, 1000, 1000, 1000]}
                    setPayoffs(undefined);
                    setGameState(parsedMsg);
                } else if ('payoffs' in parsedMsg) {
                    // Update game state with payoff information
                    
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