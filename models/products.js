var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    productName:String,
    productDescription:String,
    productImage:String,
    productPrice:Number,
    productCategory:String,
    
})
module.exports = mongoose.model('Products',productSchema)