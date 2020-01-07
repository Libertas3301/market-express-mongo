const Product = require('../models/product');

const mongoose = require('mongoose');
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost:27017/shopping', { useUnifiedTopology: true, useNewUrlParser: true });

const products = [
    new Product({
        imagePath: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png',
        title: 'GAME',
        description: 'Awesome Game!!!!!',
        price: 12
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT8Jdk9voBcY_neUGO1t5Ry1S8K26gRbaoPCWuJoDUCMBGFQ-9R',
        title: 'GIRL',
        description: 'Awesome girl!!!!!',
        price: 14
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSIem70jfumLumuTSDEMTCode-J9pekScFlZGfpohrTDeXC78a8',
        title: 'BOY',
        description: 'Awesome boy!!!!!',
        price: 22
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTF6S0Abu3KNY4N2A7gkcV6WqatiJQSv1qjik2UEQ0WYoAFxDwt',
        title: 'DICK',
        description: 'Awesome dick!!!!!',
        price: 19
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQdGuPAfeswWRCBoCSTXbdjFRm4iawzqfAe6DTp4W6VghOG0bVZ',
        title: 'PICK',
        description: 'Awesome pick!!!!!',
        price: 55
    }),
    new Product({
        imagePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTXS_RoA3qTp3NGws2urOgmjgFegNtGjdbYwT8oBW3rsRV2MY4h',
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