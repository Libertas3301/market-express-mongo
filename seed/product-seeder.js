const Product = require('../models/product');

const mongoose = require('mongoose');
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost:27017/market', { useUnifiedTopology: true, useNewUrlParser: true });

const products = [
    new Product({
        imagePath: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png',
        title: 'GAME',
        description: 'Awesome Game!!!!!',
        price: 12
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTPUhL4NaJim0qKTzr1vst3PE7DVCRSrhKS4gw6BPTs7i-S1D_h',
        title: 'GIRL',
        description: 'Awesome girl!!!!!',
        price: 14
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTtJXEln1E99wgQJaOnfVugJTv6DvEP9Uwu-Oz-PLXzG3mAXY3F',
        title: 'BOY',
        description: 'Awesome boy!!!!!',
        price: 22
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTQK580szpzzcLteRLM52DuuHgfCbg67mi0f5pwO0sRFFw2ckQt',
        title: 'DICK',
        description: 'Awesome dick!!!!!',
        price: 19
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRxZ_SFBICELk7y1A3ER67zpWUf08PZHACkfaBGfWwNtmiU-HjW',
        title: 'PICK',
        description: 'Awesome pick!!!!!',
        price: 55
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTBoZVY_f_Qc5B7d9J8rrxdFyRwQS5NfeCog3wmbIQ_49HwkWfE',
        title: 'MOM',
        description: 'Awesome mom!!!!!',
        price: 30
    }),
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save((err, result) => {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}