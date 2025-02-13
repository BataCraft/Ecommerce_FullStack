"use client"

import { useState, useEffect } from "react"
import useProductStore from "@/Store/productStore"
import useAuthStore from "@/Store/authStore"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import Categories from "@/components/ui/custom/Categories"
import { toast } from "react-toastify"
import Image from "next/image"

export default function AddProduct() {
  // Initial form state with exact date and user
  const initialFormData = {
    name: '',
    categoryId: '',
    brand: '',
    price: {
      regular: '',
      sale: '',
      discount_percentage: 0
    },
    stock: {
      quantity: '0',
      status: 'in_stock'
    },
    specifications: {
      dimensions: '',
      weight: '',
      bluetooth_version: '',
      battery_life: '',
      waterproof_rating: ''
    },
    features: [],
    description: '',
    flags: {
      isNew: true,
      isFeatured: false,
      isWeeklyDeal: false
    },
   
  };

  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const { addProduct } = useProductStore();
  const { user } = useAuthStore();

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_IMAGES = 5;

  // Cleanup function for image previews
  useEffect(() => {
    return () => {
      imagesPreviews.forEach(URL.revokeObjectURL);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [imagesPreviews, thumbnailPreview]);

  // Handle image file selection
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of files
    if (files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate file sizes
    const hasLargeFile = files.some(file => file.size > MAX_FILE_SIZE);
    if (hasLargeFile) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagesPreviews(previews);
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Thumbnail must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter product name');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!thumbnailFile) {
      toast.error('Please select a thumbnail image');
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('Please select at least one product image');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter product description');
      return;
    }

    setLoading(true);

    try {
      const productFormData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && !Array.isArray(formData[key])) {
          productFormData.append(key, JSON.stringify(formData[key]));
        } else if (Array.isArray(formData[key])) {
          productFormData.append(key, JSON.stringify(formData[key]));
        } else {
          productFormData.append(key, formData[key]);
        }
      });

      // Add thumbnail with specific field name
      productFormData.append('thumbnail', thumbnailFile);

      // Add multiple images with specific field name
      imageFiles.forEach(file => {
        productFormData.append('images', file);
      });

      const result = await addProduct(productFormData);
      
      if (result.success) {
        toast.success(result.message);
        // Reset form to initial state with current date and user
        setFormData(initialFormData);
        setImageFiles([]);
        setThumbnailFile(null);
        setImagesPreviews([]);
        setThumbnailPreview('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium">Product Name</label>
            <Input 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name" 
              maxLength={100}
              required 
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <Categories 
              onChange={(categoryId) => setFormData(prev => ({ ...prev, categoryId }))}
              value={formData.categoryId}
            />
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Product Thumbnail</label>
            <Input 
              type="file"
              onChange={handleThumbnailChange}
              accept="image/*"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
              file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
            />
            <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
          </div>
          
          {thumbnailPreview && (
            <div className="relative w-32 h-32">
              <Image 
                src={thumbnailPreview}
                alt="Thumbnail preview"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Multiple Images Upload */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Product Images</label>
            <Input 
              type="file"
              onChange={handleImagesChange}
              accept="image/*"
              multiple
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
              file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 5 images, 5MB each</p>
          </div>
          
          {imagesPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagesPreviews.map((url, index) => (
                <div key={index} className="relative w-32 h-32">
                  <Image 
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price and Brand Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="brand" className="text-sm font-medium">Brand</label>
            <Input 
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Enter brand name" 
              required 
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="price.regular" className="text-sm font-medium">Regular Price</label>
            <Input 
              type="number"
              id="price.regular"
              name="price.regular"
              value={formData.price.regular}
              onChange={handleChange}
              placeholder="0.00"
              required
              min="0"
              step="0.01"
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="price.sale" className="text-sm font-medium">Sale Price</label>
            <Input 
              type="number"
              id="price.sale"
              name="price.sale"
              value={formData.price.sale}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="mt-1"
            />
          </div>
        </div>

        {/* Stock Information */}
        <div>
          <label htmlFor="stock.quantity" className="text-sm font-medium">Stock Quantity</label>
          <Input 
            type="number"
            id="stock.quantity"
            name="stock.quantity"
            value={formData.stock.quantity}
            onChange={handleChange}
            placeholder="0"
            required
            min="0"
            max="9999"
            className="mt-1"
          />
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries({
              dimensions: 'Dimensions',
              weight: 'Weight',
              bluetooth_version: 'Bluetooth Version',
              battery_life: 'Battery Life',
              waterproof_rating: 'Waterproof Rating'
            }).map(([key, label]) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <Input
                  value={formData.specifications[key]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: {
                      ...prev.specifications,
                      [key]: e.target.value
                    }
                  }))}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <label htmlFor="features" className="text-sm font-medium">Features (one per line)</label>
          <Textarea 
            id="features"
            value={formData.features.join('\n')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              features: e.target.value.split('\n').filter(feature => feature.trim())
            }))}
            placeholder="Enter features (one per line)" 
            className="mt-1 h-32"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <Textarea 
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description" 
            className="mt-1 h-32"
            required
          />
        </div>

        {/* Product Flags */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Product Flags</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="flags.isNew"
                checked={formData.flags.isNew}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  flags: { ...prev.flags, isNew: checked }
                }))}
              />
              <label htmlFor="flags.isNew" className="text-sm font-medium">New Product</label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="flags.isFeatured"
                checked={formData.flags.isFeatured}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  flags: { ...prev.flags, isFeatured: checked }
                }))}
              />
              <label htmlFor="flags.isFeatured" className="text-sm font-medium">Featured Product</label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="flags.isWeeklyDeal"
                checked={formData.flags.isWeeklyDeal}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  flags: { ...prev.flags, isWeeklyDeal: checked }
                }))}
              />
              <label htmlFor="flags.isWeeklyDeal" className="text-sm font-medium">Weekly Deal</label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </Button>
      </form>
    </div>
  );
}