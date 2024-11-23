const PLAYER_NAMES = {
    0: "Claude 3.5 Sonnet",
    1: "Gemini 1.5-flash", 
    2: "GPT-4o",
    3: "Grok-beta"
};

console.log("Constants loaded:", window.PLAYER_NAMES);

const PLAYER_SHORT_NAMES = {
    0: "Claude",
    1: "Gemini", 
    2: "GPT",
    3: "Grok"
};

const PLAYER_CLASS = {
    0: "player-claude",
    1: "player-gemini", 
    2: "player-gpt",
    3: "player-grok"
};

const CHIP_DENOMS = [
    { value: 500, color: '#800080', label: '500' },
    { value: 100, color: '#333333', label: '100' },
    { value: 25, color: '#008000', label: '25' },
    { value: 5, color: '#FF0000', label: '5' },
    { value: 1, color: '#FFFFFF', label: '1' }
];

const suitSymbols = {
    's': '♠',
    'h': '♥',
    'd': '♦',
    'c': '♣'
};

const suitClasses = {
    's': 'poker-card-spades',
    'h': 'poker-card-hearts', 
    'd': 'poker-card-diamonds',
    'c': 'poker-card-clubs'
};

export {
    PLAYER_NAMES,
    PLAYER_SHORT_NAMES,
    PLAYER_CLASS,
    CHIP_DENOMS,
    suitSymbols,
    suitClasses
};
