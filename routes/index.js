const Product = require('../models/product')
const express = require('express');
const router = express.Router();
const multer = require('multer');
const url = require('url');
var User = require('../models/user');

const mongoose = require('mongoose');

/* GET home page. */

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

router.get('/', (req, res) => {
  const { query } = url.parse(req.url, true);
  Product.findOne({ _id: query.id }, (err, docs) => {
    res.render('shop/product_template_overview.hbs', { title: 'lol', products: docs });
  })
});


// GET route for reading data
router.get('/auth', (req, res, next) => {
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
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/profile', (req, res, next) => {
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
router.get('/logout', (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/products/:page', function (req, res, next) {
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

router.get('/home', function (req, res, next) {
  res.render('shop/index.hbs');
})

router.post('/filterRequest', function (req, res) {
  if (req.body.radioOption === 'radioOption1') {
    Product.find({ title: 'best costea' }, (err, docs) => {
      const productChunks = [];
      const chunkSize = 3;
      docs.reverse();
      for (var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
      }
      res.render('index.ejs', { title: 'Market', products: productChunks });
    });
  }
  else if (req.body.radioOption === 'radioOption2') {
    Product.find({ title: 'costea daun' }, (err, docs) => {
      const productChunks = [];
      const chunkSize = 3;
      docs.reverse();
      for (var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
      }
      res.render('index.ejs', { title: 'Market', products: productChunks });
    });
  }
});

/* GET dashboard. */
router.get('/dashboard', function (req, res, next) {
  res.render('shop/dashboard.hbs');
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
