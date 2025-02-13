import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";


const useOrderStore = create((set) => ({
  order: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("token");
      // console.log('Token being used:', token?.substring(0, 10) + '...'); // Only log first 10 chars for security

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/get-allorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
          }
        }
      );

      // Log the response data structure for debugging
      // console.log('API Response structure:', {
      //   success: response.data.success,
      //   orderCount: response.data.order?.length,
      //   firstOrderSample: response.data.order?.[0]
      // });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Invalid server response");
      }

      // Ensure we're setting the data in the correct structure
      set({
        order: response.data,
        loading: false,
        error: null
      });

      return response.data;

    } catch (error) {
      console.error('Order fetching error:', {
        message: error.message,
        response: error.response?.data
      });

      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch orders";

      set({
        error: errorMessage,
        loading: false,
        order: []
      });

      // Optionally handle token expiration
      if (error.response?.status === 401) {
        // Handle token expiration - maybe clear token and redirect to login
        localStorage.removeItem("token");
      }

      return null;
    }
  },

  // Optional: Add a method to clear orders
  clearOrders: () => {
    set({
      order: [],
      loading: false,
      error: null
    });
  },
  
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error('User not authenticated');
        return;
      }
  
      const decodedToken = jwt_decode(token); // Decode token to get userId (if using JWT)
      const userId = decodedToken?.userId;
  
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/update-order/${orderId}`,
        { status: newStatus, userId }, // Include userId here
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
  
      if (response.status === 200) {
        set((state) => ({
          order: Array.isArray(state.order)
            ? state.order.map(order =>
                order._id === orderId ? { ...order, status: newStatus } : order
              )
            : [],
        }));
  
        toast.success('Order status updated successfully');
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Status update error details:', error.response);
  
      if (error.response?.status === 401) {
        console.log('Authorization failed - checking token validity');
      }
  
      toast.error('Failed to update order status');
      throw error;
    }
  }
  
  
  



}));

export default useOrderStore;