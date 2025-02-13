const Order = require('../Model/Order.model');
const Product = require('../Model/Product.model');

const createOrder = async (req, res) => {
    try {
      const { items, shippingAddress, paymentMethod } = req.body;
  
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No items in order",
        });
      }
  
      let totalPrice = 0;
      const populatedItems = await Promise.all(
        items.map(async (item) => {
          const product = await Product.findById(item.product);
          if (!product) throw new Error(`Product with ID ${item.product} not found`);
  
          const price = product.price.sale ? product.price.sale : product.price.regular;
          totalPrice += price * item.quantity; // ✅ Correct price calculation
  
          return {
            product: product._id,
            productname : product.name,
            quantity: item.quantity,
            price,
          };
        })
      );
  
      const order = new Order({
        user: req.user._id, 
        items: populatedItems,
        totalPrice,
        shippingAddress,
        paymentMethod,
      });
  
      await order.save();
  
      res.status(201).json({
        success: true,
        message: "Order added successfully!",
        order,
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

const getOrders = async (req, res) =>{
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        };
        const orders = await Order.find({user : req.user._id})
        .populate('items.product', 'name price')
        .exec();

        return res.status(200).json({
            success : true,
            orders,
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
};

// Get all Orders from admin 
const getAllOrders = async(req, res) =>{
    try {
        const order = await Order.find().populate('user', 'name email').populate('items.product', 'name thumbnail price') .sort({ orderDate: -1 }); 
        res.status(200).json({
            success : true,
            order,
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
        
    }
}

const getOrderById = async(req, res) =>{
    try {
        const {orderId} = req.params;
   

        const order = await Order.findById(orderId)
        .populate('user', 'name')
        .populate('items.product', 'name price thumbnail')
        .exec();

        if(!order)
        {
            return res.status(404).json({
                success: false,
                message: `Order not fond with ID: ${orderId}`,
                
            });
        }

        console.log("Order ID:", orderId);

        return res.status(200).json({
            success : true,
            order
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
};


const updateOrder = async(req, res) => {
  const { orderId } = req.params; 
  const { status } = req.body; 

  console.log("Updating order:", { orderId, status, userId: req.user?._id });

  try {
      // Validate status
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({
              success: false,
              message: 'Invalid status provided.'
          });
      }

      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({
              success: false,
              message: `Order not found with ID: ${orderId}`
          });
      }

      // Add logging for debugging
      console.log("Found order:", {
          orderId: order._id,
          currentStatus: order.status,
          newStatus: status
      });

      order.status = status;
      await order.save();

      res.status(200).json({
          success: true,
          message: 'Order status updated successfully.',
          order
      });
  } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ 
          success: false, 
          message: error.message
      });
  }
};

const deleteOrder = async(req, res) =>{
    try {
        const {orderId} = req.params;
        const order = await Order.findById(orderId);

        if(!order)
        {
            return res.status(404).json({
                success : false,
                message: "Order not found!"
            })
        };

        await Order.findByIdAndDelete(orderId);

        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
        


        
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, getAllOrders };