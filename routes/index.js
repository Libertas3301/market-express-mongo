const Product = require('../models/product')
const express = require('express');
const router = express.Router();
const multer = require('multer');

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

router.get('/products/:page', function (req, res, next) {
  var perPage = 9
  var page = req.params.page || 1

  Product
    .find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, products) {
      console.log(products);
      Product.count().exec(function (err, count) {
        if (err) return next(err)
        res.render('products.ejs', {
          products: products,
          current: page,
          pages: Math.ceil(count / perPage)
        })
      })
    })
})

router.get('/', function (req, res, next) {
  res.render('index.ejs')
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
//       res.render('shop/index.hbs', { title: 'Market', products: productChunks });
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
//       res.render('shop/index.hbs', { title: 'Market', products: productChunks });
//     });
//   }
// });

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
