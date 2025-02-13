"use client"
import { Button } from "@/components/ui/button";
import LoadingPage from "@/components/ui/custom/Loading";
import useProductStore from "@/Store/productStore";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Product = () => {
    const { products, loading, error, fetchProduct } = useProductStore();
    const router = useRouter();

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    console.log(fetchProduct);


    if (loading) {
        return <div className="h-screen flex justify-center items-center"><LoadingPage /></div>
    };

    if (error) {
        return error
    }


    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <div className="m-8">
                <Button className="bg-primaryColor text-white hover:bg-primaryColor/60 rounded-lg">
                <Link href={'/add-product'} className="flex items-center gap-2 ">Add product <Plus/></Link>
                </Button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Purchase Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Sale Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Feature Product
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {
                        products && products.length > 0 ? (
                            products.map((product, index) => {
                                // Get the first image URL from the 'images' array
                                const productImage = product.images && product.images[0];

                                return (
                                    <tr className="hover:bg-gray-50" key={index}>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="flex items-center gap-4">
                                                {/* Display the product image */}
                                                {productImage && (
                                                    <img
                                                        src={productImage}
                                                        alt={product.name}
                                                        width={50}
                                                        height={50}
                                                        className="size-20 object-cover rounded-md"
                                                    />
                                                )}
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">${product.price.regular}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">${product.price.sale}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.flags.
                                                isFeatured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {product.flags.
                                                    isFeatured ? 'Featured' : 'Not Featured'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <span className={`inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium  ${product.stock.status ? 'text-green-800' : 'text-red-600'} `}>
                                                {
                                                    product.stock.status ? 'In Stock' : 'Out of Stocks'
                                                }
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="flex space-x-3">
                                                <Link  href={`/edit-product/${product._id}`} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-100 hover:text-blue-700">
                                                    <Pencil className="mr-1 h-4 w-4" />
                                                    Edit
                                                </Link>

                                                <button className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-100 hover:text-red-700">
                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-sm text-gray-900">
                                    No products available.
                                </td>
                            </tr>
                        )
                    }
                </tbody>

            </table>
        </div>
    )
}
export default Product