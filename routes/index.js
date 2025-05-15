const express = require('express');
const router = express.Router();
const products = require('../models/products');
const Cart = require('../models/cart');
const Wishlist = require('../models/wishlist');
const Order = require('../models/order');
const Razorpay = require('razorpay');

// Hello route
router.get("/hello", (req, res) => {
  res.send("Hello world");
});


const razorpay = new Razorpay({
    key_id: 'rzp_test_39sPA5rEf9MQOf',
    key_secret: 'jYjnIh1q8DBmoCnTRIMHAL5m',
});



router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      status: order.status
    });

  } catch (error) {
    console.error("Razorpay create-order error:", error); // 🔥 Print the full error object
    res.status(500).json({
      error: "Order creation failed",
      message: error.description || error.message || JSON.stringify(error)
    });
  }
});



// Get all products
router.get("/products", (req, res) => {
  products.find({})
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
});

// Add new product
router.post("/addproduct", (req, res) => {
  const p1 = new products(req.body);
  p1.save()
    .then(() => res.send({ status: "Product added" }))
    .catch((err) => console.log(err));
});

// Update product
router.put("/products/:pid", (req, res) => {
  products.findByIdAndUpdate(req.params.pid, req.body, { new: true })
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
});

// Find products below price
router.get("/findProducts", (req, res) => {
  const maxPrice = req.query.maxPrice;
  products.find({ productPrice: { $lt: maxPrice } })
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
});

// Search by product name
router.get("/find", (req, res) => {
  const pname = req.query.pname;
  products.find({ productName: new RegExp(pname, 'i') })
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
});

// Sort products
router.get("/sort", (req, res) => {
  const { orderby, order } = req.query;
  const sortobj = { [orderby]: order === "asc" ? 1 : -1 };
  products.find({}).sort(sortobj)
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
});

// Pagination
router.get("/pagination", (req, res) => {
  const { page, limit } = req.query;
  const skipvar = (page - 1) * limit;
  products.find({}).skip(skipvar).limit(Number(limit))
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
});


// ----------------- CART APIs -----------------

// Add to cart
router.post("/addtocart", (req, res) => {
  const { userId, productId, quantity } = req.body;

  Cart.findOne({ userId }).then(cart => {
    if (cart) {
      // check if product exists
      const index = cart.items.findIndex(item => item.productId == productId);
      if (index > -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      cart.save().then(() => res.send({ status: "Item added to cart" }));
    } else {
      const newCart = new Cart({
        userId,
        items: [{ productId, quantity }]
      });
      newCart.save().then(() => res.send({ status: "Cart created and item added" }));
    }
  }).catch(err => console.log(err));
});

// Get cart items
router.get("/getitemsofcart/:userId", (req, res) => {
  Cart.findOne({ userId: req.params.userId }).populate("items.productId")
    .then(data => res.json(data))
    .catch(err => console.log(err));
});


// ----------------- WISHLIST APIs -----------------

// Add to wishlist
router.post("/addtowishlist", (req, res) => {
  const { userId, productId } = req.body;

  Wishlist.findOne({ userId }).then(wishlist => {
    if (wishlist) {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
      wishlist.save().then(() => res.send({ status: "Item added to wishlist" }));
    } else {
      const newWishlist = new Wishlist({
        userId,
        products: [productId]
      });
      newWishlist.save().then(() => res.send({ status: "Wishlist created and item added" }));
    }
  }).catch(err => console.log(err));
});

// Get wishlist
router.get("/getwishlist/:userId", (req, res) => {
  Wishlist.findOne({ userId: req.params.userId }).populate("products")
    .then(data => res.json(data))
    .catch(err => console.log(err));
});


// ----------------- ORDER APIs -----------------

// Place order
router.post("/placeorder", (req, res) => {
  const { userId, products, totalAmount, shippingAddress } = req.body;

  const newOrder = new Order({
    userId,
    products,
    totalAmount,
    shippingAddress
  });

  newOrder.save()
    .then(() => res.send({ status: "Order placed successfully" }))
    .catch(err => console.log(err));
});

// Get all orders
router.get("/getallorders", (req, res) => {
  Order.find({}).populate("products.productId")
    .then(data => res.json(data))
    .catch(err => console.log(err));
});

// Get orders by user
router.get("/getuserorders/:userId", (req, res) => {
  Order.find({ userId: req.params.userId }).populate("products.productId")
    .then(data => res.json(data))
    .catch(err => console.log(err));
});

module.exports = router;
