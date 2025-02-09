import { Input } from "@/components/ui/input"

const AddProducts = () => {
  return (
    <div>
        <div>
            <h1>Add Product</h1>
            <div>
                <div>
                    <label htmlFor="productName">Product Name:</label>
                   <Input type = "text" placeholder = "Product Name"/>
                </div>
            </div>
        </div>
    </div>
  )
}
export default AddProducts