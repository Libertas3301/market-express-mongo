var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user: { type: Object, required: true },
    cart: { type: Object, required: true },
    address: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    paymentId: { type: String, required: true }
});

module.exports = mongoose.model('Order', schema);