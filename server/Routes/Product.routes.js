const express = require('express');
const { createProduct, updateProduct, DeleteProduct, GetAllProduct, GetProductById } = require('../Controller/Product.controller');
const { isAuthUser, authorizeRoles } = require('../MiddlerWare/Auth');
const upload = require('../MiddlerWare/milter.midlerware');

const route = express.Router();


route.post('/create-product',  isAuthUser, authorizeRoles('admin'),  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), createProduct);
route.put('/update-product/:id', isAuthUser, authorizeRoles('admin'), upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]),  updateProduct);
route.delete('/delete-product/:id', isAuthUser, authorizeRoles('admin'), DeleteProduct);
route.get('/get-product', GetAllProduct);
route.get('/get-product/:id', GetProductById);


module.exports = route;