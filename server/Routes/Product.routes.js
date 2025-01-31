const express = require('express');
const { createProduct, updateProduct, DeleteProduct, GetAllProduct, GetProductById } = require('../Controller/Product.controller');
const { isAuthUser, authorizeRoles } = require('../MiddlerWare/Auth');
const upload = require('../MiddlerWare/milter.midlerware');

const route = express.Router();


route.post('/create-product',  isAuthUser, authorizeRoles('admin'),  upload.array('images', 5), createProduct);
route.put('/update-product/:id', isAuthUser, authorizeRoles('admin'),  updateProduct);
route.delete('/delete-product/:id', isAuthUser, authorizeRoles('admin'), DeleteProduct);
route.get('/get-product', GetAllProduct);
route.get('/get-product/:id', GetProductById);


module.exports = route;