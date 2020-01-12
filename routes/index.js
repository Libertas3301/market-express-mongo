const Product = require('../models/product')
const express = require('express');
const router = express.Router();
const multer = require('multer');
const url = require('url')

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
