
import axios from "axios";
import {create} from "zustand"

const useCategoriesStore = create((set) => ({
    categories : [],
    loading : false,
    error : null,

    fetchCategories : async () => {
        set({loading : true, error : null});
        try {
            const res = await 
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/category/get-category`);
            const data = res.data;
            if (!data.categories) throw new Error("No categories found");
            set({ categories: data.categories, loading: false });
            
           

        } catch (error) {
            set({error : error.message, loading : false});
        }

    }
    
}));


export default useCategoriesStore;
