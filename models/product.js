const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productadd = new Schema({
    imagePath: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    marime1: {
        type: String,
        required: true
    },

    marime2: {
        type: String,
        required: true
    },

    oglinda_forma: {
        type: String,
        required: true
    },

    loc_amplasare: {
        type: String,
        required: true
    },

    oglinda_type: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },
    dezabuireBool: {
        type: Boolean,
    },
    butonBool: {
        type: Boolean,
    },
    senzorBool: {
        type: Boolean,
    },
    ramainoxBool: {
        type: Boolean,
    },
    buton_dubluBool: {
        type: Boolean,
    }
});

module.exports = mongoose.model('Product', productadd);