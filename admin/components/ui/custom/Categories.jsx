"use client"
import React, { useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import useCategoriesStore from "@/Store/categoriesStore";

// Add onChange and value props
const Categories = ({ onChange, value }) => {
    const { categories, loading, error, fetchCategories } = useCategoriesStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <Select 
                value={value} 
                onValueChange={onChange} // Add onValueChange handler
                required // Add required attribute
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    <SelectGroup>
                        {categories.map((category) => (
                            <SelectItem 
                                key={category._id} 
                                value={category._id}
                            >
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default Categories;