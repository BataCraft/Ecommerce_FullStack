import { create } from "zustand";

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/get-product`);
      if (!res.ok) throw new Error("Failed to fetch product data");

      const data = await res.json();
    //   console.log(data); // Log the entire response to inspect its structure

      // Extract products from the response and store them
      if (data && data.products) {
        set({ products: data.products, loading: false });
      } else {
        set({ error: "No products found in response", loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useProductStore;
