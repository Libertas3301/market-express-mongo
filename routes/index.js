const Product = require('../models/product')
const express = require('express');
const router = express.Router();
const multer = require('multer');
var path = require('path');

// const upload = multer({ dest: 'file/' })
const mongoose = require('mongoose');

router.post('/filterRequest', function (req, res) {
  if (req.body.radioOption === 'radioOption1') {
    Product.find({ title: 'best costea' }, (err, docs) => {
      const productChunks = [];
      const chunkSize = 3;
      docs.reverse();
      for (var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
      }
      res.render('shop/index', { title: 'Market', products: productChunks });
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
      res.render('shop/index', { title: 'Market', products: productChunks });
    });
  }

});

/* GET home page. */
router.get('/', function (req, res, next) {
  Product.find((err, docs) => {
    const productChunks = [];
    const chunkSize = 3;
    docs.reverse();
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('shop/index', { title: 'Market', products: productChunks });
  });
});

/* GET dashboard. */
router.get('/dashboard', function (req, res, next) {
  res.render('shop/dashboard');
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
