const PLANS = {
    'Developer': {
        limit: 50,
        priceId: null, // Gratis
        name: 'Developer Plan'
    },
    'Startup': {
        limit: 5000,
        priceId: "price_1SayGp2clhdvCXt0RyfIjCbZ", // <--- SOSTITUISCI CON ID STRIPE VERO
        name: 'Startup Plan'
    },
    'Scale': {
        limit: 25000,
        priceId: "price_1SayH82clhdvCXt0vpawKhLq",   // <--- SOSTITUISCI CON ID STRIPE VERO
        name: 'Scale Plan'
    },
    'Enterprise': {
        limit: Infinity,
        priceId: "price_1SayQe2clhdvCXt0hXvcLy3V", // O gestito custom
        name: 'Enterprise Plan'
    }
};

module.exports = PLANS;