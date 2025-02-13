"use client"
import { Button } from "@/components/ui/button";
import LoadingPage from "@/components/ui/custom/Loading";
import OrderStatus from "@/components/ui/custom/OrderStatus";
import useOrderStore from "@/Store/orderStore";
import Image from "next/image";


import { useEffect } from "react"
import { toast } from "react-toastify";

const Order = () => {
  const { order, loading, error, fetchOrders, updateOrderStatus } = useOrderStore();

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
        const success = await updateOrderStatus(orderId, newStatus);
        if (success) {
            toast.success("Order status updated successfully!");
            // Optionally refresh orders here if needed
            await fetchOrders();
        }
    } catch (error) {
        console.error("Failed to update status:", error);
        toast.error(error.response?.data?.message || error.message || "Failed to update order status");
    }
};
  // console.log(order.order);
  

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <div><LoadingPage /> </div>

  return (
    <div className="p-4">
      <div>
       
          <table className="min-w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Customer Name</th>
                <th className="border p-2">Customer Email</th>
                <th className="border p-2">Product Name</th>
                <th className="border p-2">Product Images</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Total Price</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Order Date</th>
              </tr>
            </thead>
            <tbody>
              {order?.order && order.order.length > 0 ? (
                order.order.map((orderItem) => (
                  orderItem.items.map((item, index) => (
                    <tr key={`${orderItem._id}-${index}`}>
                      <td className="border p-2">{orderItem.user?.name || "N/A"}</td>
                      <td className="border p-2">{orderItem.user?.email || "N/A"}</td>
                      <td className="border p-2">{item.product?.name || "N/A"}</td>
                      <td className="border p-2">
                      {item.product?.thumbnail ? (
                          <div className=" ">
                            <Image 
                              src={item.product.thumbnail}
                              alt={item.product.name || "Product image"}
                              width={40}
                              height={40}
                              className="object-cover rounded"
                              style={{ maxWidth: '100%', height: 'auto' }}
                            />
                          </div>
                        ) : (
                          "No image"
                        )}
                      </td>
                      <td className="border p-2">{item.quantity}</td>
                      <td className="border p-2">${orderItem.totalPrice}</td>
                      <td className="border p-2 flex gap-2"><OrderStatus onStatusChange={handleStatusUpdate} orderId={orderItem._id} status = {orderItem.status}/>  </td>
                      <td className="border p-2">{orderItem.orderDate}</td>
                    </tr>
                  ))
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="border p-2 text-center">
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        
      </div>
    </div>
  )
}
export default Order