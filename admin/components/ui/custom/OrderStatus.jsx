import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import useOrderStore from "@/Store/orderStore";


const OrderStatus = ({ status, orderId }) => {
  const { updateOrderStatus } = useOrderStore();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) {
      toast.info("Status is already set to " + newStatus);
      return;
    }

    setLoading(true);
    const success = await updateOrderStatus(orderId, newStatus);
    setLoading(false);

    if (success) {
      toast.success("Order status updated successfully!");
    } else {
      toast.error("Failed to update order status.");
    }
  };

  return (
    <div>
      <Select onValueChange={handleStatusChange} disabled={loading}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={status} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default OrderStatus;
