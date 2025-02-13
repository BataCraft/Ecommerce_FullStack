const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, getAllOrders } = require('../Controller/Order.controller');
const { isAuthUser, authorizeRoles } = require('../MiddlerWare/Auth');

const router = express.Router();

router.post('/create-order', isAuthUser,  createOrder);
router.get('/get-orders',isAuthUser, getOrders);
router.get('/get-allorders',  getAllOrders); //authorizeRoles('admin'), isAuthUser,
router.get('/get-order/:orderId', isAuthUser, authorizeRoles('admin'), getOrderById);
router.put('/update-order/:orderId',  updateOrder);
router.delete('/delete-order/:orderId', deleteOrder);

module.exports = router;



