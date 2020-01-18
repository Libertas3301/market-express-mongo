const express = require('express');
const router = express.Router();
const multer = require('multer');
const url = require('url');

var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');
const User = require('../models/user');

const mongoose = require('mongoose');

/* GET home page. */

let isAdminLoggedIn;
let isUserLoggedIn;
// router.get('/', function (req, res, next) {
//   Product.find((err, docs) => {
//     const productChunks = [];
//     const chunkSize = 3;
//     docs.reverse();
//     for (var i = 0; i < docs.length; i += chunkSize) {
//       productChunks.push(docs.slice(i, i + chunkSize));
//     }
//     res.render('shop/index', { title: 'Market', products: productChunks });
//   });
// });

// router.get('/blbl', (req, res) => {
//   const { query } = url.parse(req.url, true) //de aici extragi parametrii din url cu query (adica ?id=) 
//   const requiredProduct = db.products.findOne({ _id: query }) //vezi obiectul query de mai sus {query}
//   console.log(requiredProduct);
//   res.render('/shop/product_template_overview.hbs', { products: requiredProduct });
// });

router.get('/product-review', (req, res, next) => {
  const { query } = url.parse(req.url, true);
  Product.findOne({ _id: query.id }, (err, docs) => {
    res.render('shop/product_template_overview.hbs', { products: docs });
  });
});

router.get('/add-to-cart/:id', (req, res, next) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, (err, product) => {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/products/:page');
  });
});

router.get('/shopping-cart', (req, res, next) => {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart.hbs', { products: null })
  }
  let cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart.hbs', { products: cart.generateArray(), totalPrice: cart.totalPrice })
});

router.get('/reduce/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout.hbs', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
});

router.post('/checkout', function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  var stripe = require("stripe")(
    "sk_test_RDjVRjleG1h4ZQBLfKSp2VcV00ce92e5LA"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test Charge"
  }, function (err, charge) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save(function (err, result) {
      req.flash('success', 'Successfully bought product!');
      req.session.cart = null;
      res.redirect('/');
    });
  });
});

// router.post('/checkout', (req, res, next) => {
//   res.send('ebati');
// });

// router.post('/deletePost', (req, res) => {
//   Product.findOneAndRemove({ '_id': req.body.id }, (err, offer) => {
//     res.redirect('/shop/dashboard-delete.ejs');
//   });
// });

router.post('/deletePost228', (req, res) => {
  console.log(req.body.idshnic);
  Product.findOne({ _id: req.body.idshnic }, (err, doc) => {
    // or simply use
    if (err) {
      console.log(err);
    }
    else if (doc) {
      doc.remove();
      res.redirect('/dashboard/deletePost/:page');
    }
  });
});

// GET route for reading data
router.get('/auth', isLoggedInFoAuth, (req, res, next) => {
  res.render('user/index.hbs', { message: req.flash('message') });
});

//POST route for updating data
router.post('/authpost', (req, res, next) => {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    // return next(err);
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (user) {
      var err = 'A user with that email has already registered. Please use a different email..';
      req.flash('message', err);
      res.redirect('/auth');
    }
  });

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    let userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }

    User.create(userData, (error, user) => {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        res.redirect('/profile');
        if (req.body.logemail === 'root-vladislav@gmail.com') {
          isAdminLoggedIn = true;
        }
        isUserLoggedIn = true;
        console.log(req.body.logemail === 'root-vladislav@gmail.com');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/profile', isLoggedIn, (req, res, next) => {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

// GET for logout logout
router.get('/logout', isLoggedIn, (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/auth');
      }
    });
  }
  isUserLoggedIn = false;
});

router.get('/products/:page', (req, res, next) => {
  var perPage = 9
  var page = req.params.page || 1
  Product
    .find({})
    .sort({ _id: -1 })
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, docs) {
      Product.count().exec(function (err, count) {
        if (err) return next(err)
        res.render('products.ejs', {
          products: docs,
          current: page,
          pages: Math.ceil(count / perPage)
        })
      })
    })
})


router.get('/dashboard/deletePost/:page', isAdmin, (req, res, next) => {
  var perPage = 9
  var page = req.params.page || 1
  Product
    .find({})
    .sort({ _id: -1 })
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, docs) {
      Product.count().exec(function (err, count) {
        if (err) return next(err)
        res.render('shop/dashboard-delete.ejs', {
          products: docs,
          current: page,
          pages: Math.ceil(count / perPage)
        })
      })
    })
})
router.get('/', function (req, res, next) {
  res.render('shop/index.hbs');
})

// router.post('/filterRequest', function (req, res) {
//   if (req.body.radioOption === 'radioOption1') {
//     Product.find({ title: 'best costea' }, (err, docs) => {
//       const productChunks = [];
//       const chunkSize = 3;
//       docs.reverse();
//       for (var i = 0; i < docs.length; i += chunkSize) {
//         productChunks.push(docs.slice(i, i + chunkSize));
//       }
//       res.render('index.ejs', { title: 'Market', products: productChunks });
//     });
//   }
//   else if (req.body.radioOption === 'radioOption2') {
//     Product.find({ title: 'costea daun' }, (err, docs) => {
//       const productChunks = [];
//       const chunkSize = 3;
//       docs.reverse();
//       for (var i = 0; i < docs.length; i += chunkSize) {
//         productChunks.push(docs.slice(i, i + chunkSize));
//       }
//       res.render('index.ejs', { title: 'Market', products: productChunks });
//     });
//   }
// });

/* GET dashboard - add new post. */
router.get('/dashboard/newPost', isAdmin, (req, res, next) => {
  res.render('shop/dashboard.hbs');
});

/* GET dashboard - delete selected post */
router.get('/dashboard', isAdmin, (req, res, next) => {
  res.render('shop/dashboard-delete.ejs');
});

router.post('/addproduct', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      return res.end(`Error uploading file: ${err}`);
    }
    new Product({
      imagePath: req.file.originalname,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price
    }).save(function (err, doc) {
      if (err) res.json(err);
      else {
        res.send('Successfully inserted!');
      }
    });
  });


});
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('imagePath');

module.exports = router;

function isLoggedIn(req, res, next) {
  if (isUserLoggedIn) {
    return next();
  } else if (!isUserLoggedIn) res.redirect('/');
  console.log(isUserLoggedIn);
}

function isLoggedInFoAuth(req, res, next) {
  if (!isUserLoggedIn) {
    return next();
  } else if (isUserLoggedIn) res.redirect('/profile');
  console.log(isUserLoggedIn);
}

function isAdmin(req, res, next) {
  if (isAdminLoggedIn) {
    return next();
  } else if (!isAdminLoggedIn) res.redirect('/');
  console.log(isAdminLoggedIn);
}
// root-vladislav@gmail.com
// rootroot