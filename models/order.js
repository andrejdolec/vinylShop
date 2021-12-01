const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cart: {
        type: Object,
        required: true
    },
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        enum: ['Skopje', 'Bitola', 'Ohrid', 'Prilep']
    }
});

module.exports = mongoose.model('Order', OrderSchema);