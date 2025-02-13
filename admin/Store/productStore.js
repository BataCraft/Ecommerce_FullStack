import axios from "axios";
import { create } from "zustand";
import useAuthStore from "./authStore";

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchProduct: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/get-product`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!res.ok) throw new Error("Failed to fetch product data");

      const data = await res.json();
     
      if (data && data.products) {
        set({ products: data.products, loading: false });
      } else {
        set({ error: "No products found in response", loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addProduct: async (formData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please login to add products');
      }

      // Add current timestamp and user
      formData.append('createdAt', '2025-02-10 07:15:56');
      formData.append('createdBy', 'BataCraft');

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/create-product`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      if (res.data.success) {
        set((state) => ({
          products: [...state.products, res.data.product],
          loading: false,
        }));
        return { success: true, message: res.data.message };
      } else {
        throw new Error(res.data.message || "Failed to add product");
      }
    } catch (error) {
      let errorMessage = "Failed to add product";
      if (error.response?.status === 401) {
        errorMessage = "Please login to add products";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          message: 'Please login to update products'
        };
      }

      // Add current timestamp and user
      productData.append('updatedAt', '2025-02-10 07:15:56');
      productData.append('updatedBy', 'BataCraft');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/update-product/${id}`, 
        productData,
        config
      );

      if (response.data.success) {
        // Update local state
        set((state) => ({
          products: state.products.map(product => 
            product._id === id ? response.data.product : product
          )
        }));

        return {
          success: true,
          message: 'Product updated successfully',
          product: response.data.product
        };
      }
      throw new Error(response.data.message || 'Failed to update product');
    } catch (error) {
      console.error("Update error:", error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Please login to access this feature'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update product'
      };
    }
  },

  getProductById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to access this feature');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      };

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/get-product/${id}`,
        config
      );

      if (response.data.success) {
        return response.data.product;
      }
      throw new Error(response.data.message || 'Failed to fetch product');
    } catch (error) {
      console.error("Get product error:", error);
      if (error.response?.status === 401) {
        throw new Error('Please login to access this feature');
      }
      throw new Error(error.message || 'An error occurred while fetching the product');
    }
  },
}));

export default useProductStore;