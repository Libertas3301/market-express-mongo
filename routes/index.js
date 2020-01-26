// libraries
const express = require('express');
const router = express.Router();
const multer = require('multer');
const url = require('url');

// imports
const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

// variables
let isAdminLoggedIn;
let isUserLoggedIn;

// Get home page
router.get('/', (req, res, next) => {
  Product
    .find({})
    .sort({ _id: -1 })
    .limit(3)
    .exec((err, docs) => {
      let successMsg = req.flash('success')[0];
      if (err) return next(err)
      res.render('shop/index.ejs', {
        successMsg: successMsg,
        noMessage: !successMsg,
        products: docs,
      });
    });
});

// Get products page
router.get('/products/:page', (req, res, next) => {
  var perPage = 6
  var page = req.params.page || 1
  Product
    .find({})
    .sort({ _id: -1 })
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec((err, docs) => {
      Product.count().exec((err, count) => {
        if (err) return next(err)
        res.render('shop/products.ejs', {
          products: docs,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

// Get contacts page
router.get('/contacts', (req, res, next) => {
  res.render('shop/contacte.hbs');
});

// Get Shopping cart
router.get('/shopping-cart', (req, res, next) => {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart.hbs', { products: null })
  }
  let cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart.hbs', { products: cart.generateArray(), totalPrice: cart.totalPrice })
});

// Reduce product count on click
router.get('/reduce/:id', (req, res, next) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// increase product count on click
router.get('/addprod/:id', (req, res, next) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.addByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// Remove product
router.get('/remove/:id', (req, res, next) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// Get checkout page
router.get('/checkout', isLoggedInCheckout, (req, res, next) => {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  User.findById(req.session.userId).exec((error, user) => {
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout.hbs', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg, user, cart: cart.generateArray() });
  });
});

// Initialize a payment
router.post('/checkout', (req, res, next) => {

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
  }, (err, charge) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    User.findById(req.session.userId).exec((error, user) => {
      var order = new Order({
        user: user._id,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        paymentId: charge.id
      });

      order.save((err, result) => {
        finsum = 0;
        req.flash('success', 'Successfully bought product!');
        req.session.cart = null;
        res.redirect('/');
      });
    });
  });
});

// Personal page of each product
router.get('/product-review', (req, res, next) => {
  const { query } = url.parse(req.url, true);
  Product.findOne({ _id: query.id }, (err, docs) => {
    res.render('shop/product_template_overview.hbs', { products: docs });
  });
});

router.post('/actlikepro', (req, res, next) => {
  let productId = req.body.identificator;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let dezabuire = req.body.dezabuire;
  let dez, sen, but, ram, but_dou;
  let senzor = req.body.Senzor;
  let buton = req.body.buton;
  let ramaInox = req.body.ramaInox;
  let buton_dublu = req.body.buton_dublu;
  console.log(dezabuire, senzor, buton_dublu, buton, ramaInox);
  let culoare_lumina = req.body.radiogroup10;
  let pretMaximototal = req.body.pretTotalA;
  Product.findById(productId, (err, product) => {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);

    if (dezabuire) {
      product.dezabuireBool = true;
      dez = true;
    } else { product.dezabuireBool = false; dez = false; }

    if (senzor) {
      product.senzorBool = true;
      sen = true;
    }
    else {
      product.senzorBool = false; sen = false;
    }

    if (buton) {
      product.butonBool = true;
      but = true;
    }
    else { product.butonBool = false; but = false; }

    if (ramaInox) {
      product.ramainoxBool = true;
      ram = true;
    }
    else { product.ramainoxBool = false; ram = false; }

    if (buton_dublu) {
      product.buton_dubluBool = true;
      but_dou = true;
    }
    else { product.buton_dubluBool = false; but_dou = false; }
    let myquery = { _id: productId };
    let newvalues = { $set: { dezabuireBool: dez, senzorBool: sen, butonBool: but, ramainoxBool: ram, buton_dubluBool: but_dou } };
    Product.updateOne(myquery, newvalues, (err, res) => {
      if (err) throw err;
      console.log("1 document updated");
    });
    let mesaj = cart.items[product.id].message;
    if (!mesaj) {
      cart.items[product.id].item.price = parseFloat(pretMaximototal);
      cart.items[product.id].price = parseFloat(pretMaximototal);
      cart.totalPrice += parseFloat(cart.items[product.id].item.price);
      console.log(cart.items[product.id].qty);
    }
    console.log(cart.items[product.id].price);
    console.log(mesaj);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/shopping-cart');
  });
})

// Get authentification page
router.get('/auth', isLoggedInFoAuth, (req, res, next) => {
  res.render('user/index.hbs', { message: req.flash('message'), message2: req.flash('message2') });
});

//Initialize authentificating
router.post('/authpost', (req, res, next) => {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = 'Passwords do not match.';
    req.flash('message', err);
    res.redirect('back');
    res.redirect('back');
  }

  User.findOne({ email: req.body.email }, (err, user) => {
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
        var err = 'Your account was succesfully created';
        req.flash('message2', err);
        res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, (error, user) => {
      if (error || !user) {
        var error = 'Wrong email or password';
        req.flash('message', error);
        res.redirect('/auth')
      } else {
        req.session.userId = user._id;
        res.redirect('/profile');
        if (req.body.logemail === 'root-vladislav@gmail.com') {
          isAdminLoggedIn = true;
        }
        isUserLoggedIn = true;
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// Get profile page
router.get('/profile', isLoggedIn, (req, res, next) => {
  if (req.session.userId) {
    User.findById(req.session.userId).exec((error, user) => {
      Order.find({ user: user._id }).sort({ _id: -1 }).exec((err, orders) => {

        if (err) {
          return res.write('Error!');
        }
        let cart;
        orders.forEach((order) => {
          cart = new Cart(order.cart);
          order.items = cart.generateArray();
        });
        res.render('user/profile.hbs', { orders, user });
      })
    });
  }
});

// Logout from app
router.get('/logout', isLoggedIn, (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/auth');
      }
    });
  }
  isUserLoggedIn = false;
});

// Get delete product page
router.get('/dashboard/deletePost/:page', isLoggedIn, isAdmin, (req, res, next) => {
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
          pages: Math.ceil(count / perPage),
        })
      })
    })
})

// Initialize delete of a product
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

// Get edit product page
router.get('/dashboard/editPost/:page', isLoggedIn, isAdmin, (req, res, next) => {
  var perPage = 9;
  var page = req.params.page || 1;
  Product
    .find({})
    .sort({ _id: -1 })
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, docs) {
      Product.count().exec(function (err, count) {
        if (err) return next(err)
        res.render('shop/dashboard-edit.ejs', {
          products: docs,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

// initialize edit of a product
router.post('/editPost228', (req, res) => {
  let myquery = { _id: req.body.idshnic };
  let newvalues = { $set: { title: req.body.title, description: req.body.description, price: req.body.price } };
  Product.updateOne(myquery, newvalues, (err, res) => {
    if (err) throw err;
    console.log("1 document updated");
  });
  res.redirect('dashboard/editPost/:page')
});

// Filter data on product page
router.post('/filterRequest', (req, res) => {
  let forma = '';
  if (req.body.radiogroup1 === 'dreptunghiulara' || req.body.forma_oglinda === 'dreptunghiulara') {
    forma = 'dreptunghiulara';
  }
  else if (req.body.radiogroup1 === 'ovala' || req.body.forma_oglinda === 'ovala') {
    forma = 'ovala';
  }
  else if (req.body.radiogroup1 === 'patrata' || req.body.forma_oglinda === 'patrata') {
    forma = 'patrata';
  }
  else if (req.body.radiogroup1 === 'rotunda' || req.body.forma_oglinda === 'rotunda') {
    forma = 'rotunda';
  }
  else if (req.body.radiogroup1 === 'asimetrica' || req.body.forma_oglinda === 'asimetrica') {
    forma = 'asimetrica';
  }

  let locul = '';
  if (req.body.radiogroup2 === 'baie' || req.body.loc_amplasare === 'baie') {
    locul = 'baie';
  }
  else if (req.body.radiogroup2 === 'hol' || req.body.loc_amplasare === 'hol') {
    locul = 'hol';
  }
  else if (req.body.radiogroup2 === 'living' || req.body.loc_amplasare === 'living') {
    locul = 'living';
  }
  else if (req.body.radiogroup2 === 'dormitor' || req.body.loc_amplasare === 'dormitor') {
    locul = 'dormitor';
  }
  else if (req.body.radiogroup2 === 'Dressing' || req.body.loc_amplasare === 'Dressing') {
    locul = 'Dressing';
  }
  else if (req.body.radiogroup2 === 'make-up' || req.body.loc_amplasare === 'make-up') {
    locul = 'make-up';
  }
  else if (req.body.radiogroup2 === 'spatii_comerciale' || req.body.loc_amplasare === 'spatii_comerciale') {
    locul = 'spatii_comerciale';
  }

  let tipul = '';
  if (req.body.radiogroup3 === 'led' || req.body.tip_oglinda === 'led') {
    tipul = 'led';
  }
  else if (req.body.radiogroup3 === 'led_sensor_buton' || req.body.tip_oglinda === 'led_sensor_buton') {
    tipul = 'led_sensor_buton';
  }
  else if (req.body.radiogroup3 === 'sensor_mana' || req.body.tip_oglinda === 'sensor_mana') {
    tipul = 'sensor_mana';
  }
  else if (req.body.radiogroup3 === 'cu_incalzire' || req.body.tip_oglinda === 'cu_incalzire') {
    tipul = 'cu_incalzire';
  }
  if (forma && !tipul && !locul) {
    var perPage = 6;
    var page = req.params.page || 1;
    Product
      .find({ oglinda_forma: forma })
      .sort({ _id: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, docs) {
        Product.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('shop/products.ejs', {
            products: docs,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  }

  else if (locul && !tipul && !forma) {
    var perPage = 6;
    var page = req.params.page || 1;
    Product
      .find({ loc_amplasare: locul })
      .sort({ _id: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, docs) {
        Product.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('shop/products.ejs', {
            products: docs,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  }

  else if (tipul && !locul && !forma) {
    var perPage = 6;
    var page = req.params.page || 1;
    Product
      .find({ oglinda_type: tipul })
      .sort({ _id: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, docs) {
        Product.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('shop/products.ejs', {
            products: docs,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  }

  else if (forma && locul && !tipul) {
    var perPage = 6;
    var page = req.params.page || 1;
    Product
      .find({ $or: [{ oglinda_forma: forma }, { loc_amplasare: locul }] })
      .sort({ _id: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, docs) {
        console.log(docs.oglinda_forma)
        Product.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('shop/products.ejs', {
            products: docs,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  }

  else if (forma && !locul && tipul) {
    var perPage = 6;
    var page = req.params.page || 1;
    Product
      .find({ $or: [{ oglinda_forma: forma }, { oglinda_type: tipul }] })
      .sort({ _id: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, docs) {
        console.log(docs.oglinda_forma)
        Product.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('shop/products.ejs', {
            products: docs,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  }

  else if (!forma && locul && tipul) {
    var perPage = 6;
    var page = req.params.page || 1;
    Product
      .find({ $or: [{ oglinda_type: tipul }, { loc_amplasare: locul }] })
      .sort({ _id: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, docs) {
        console.log(docs.oglinda_forma)
        Product.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('shop/products.ejs', {
            products: docs,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  }

  else if (forma && locul && tipul) {
    var perPage = 6;
    var page = req.params.page || 1;
    Product
      .find({ $or: [{ oglinda_forma: forma }, { loc_amplasare: locul }, { oglinda_type: tipul }] })
      .sort({ _id: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, docs) {
        console.log(docs.oglinda_forma)
        Product.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('shop/products.ejs', {
            products: docs,
            current: page,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  } else {
    var perPage = 6;
    var page = req.params.page || 1;
    Product
      .find({})
      .sort({ _id: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, docs) {
        console.log(docs.oglinda_forma)
        Product.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('shop/products.ejs', {
            products: docs,
            current: page,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  }
});

// Get new product page
router.get('/dashboard/newPost', isLoggedIn, isAdmin, (req, res, next) => {
  res.render('shop/dashboard.hbs');
});

// add product initialize
router.post('/addproduct', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.end(`Error uploading file: ${err}`);
    }
    new Product({
      imagePath: req.file.originalname,
      title: req.body.title,
      description: req.body.description,
      marime1: req.body.marime1,
      marime2: req.body.marime2,
      oglinda_forma: req.body.oglinda_forma,
      loc_amplasare: req.body.loc_amplasare,
      oglinda_type: req.body.oglinda_type,
      price: req.body.price,
      dezabuireBool: false,
      butonBool: false,
      senzorBool: false,
      ramainoxBool: false,
      buton_dubluBool: false
    }).save(function (err, doc) {
      if (err) res.json(err);
      else {
        res.redirect('/dashboard');
      }
    });
  });
});

// Get orders page
router.get('/dashboard/orders', isLoggedIn, isAdmin, (req, res, next) => {
  Order.find({}).sort({ _id: -1 }).exec((err, orders) => {

    if (err) {
      return res.write('Error!');
    }
    let cart;
    orders.forEach(function (order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('shop/dashboard-orders.hbs', { orders });
  });
});

// Get dashboard page
router.get('/dashboard', isLoggedIn, isAdmin, (req, res, next) => {
  res.render('shop/dashboard.hbs');
});

// save uploaded photo to page files
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

// upload
var upload = multer({ storage: storage }).single('imagePath');

// export router to app.js
module.exports = router;

// If user is logged in page redirect you to /auth
function isLoggedIn(req, res, next) {
  if (isUserLoggedIn) {
    return next();
  } else if (!isUserLoggedIn) res.redirect('/auth');
}

// If user is logged in page redirect you to /auth
function isLoggedInCheckout(req, res, next) {
  if (isUserLoggedIn) {
    return next();
  } else if (!isUserLoggedIn) res.redirect('/auth');
}

// If user is logged in page redirect you to /profile
function isLoggedInFoAuth(req, res, next) {
  if (!isUserLoggedIn) {
    return next();
  } else if (isUserLoggedIn) res.redirect('/profile');
}

// If user is logged in page redirect you to /
function isAdmin(req, res, next) {
  if (isAdminLoggedIn) {
    return next();
  } else if (!isAdminLoggedIn) res.redirect('/');
  console.log(isAdminLoggedIn);
}