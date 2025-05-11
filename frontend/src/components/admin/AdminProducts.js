import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/buttons';
import { Input } from '../../ui/Input';
import Modal from '../../ui/Modal';
import { motion } from 'framer-motion';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image_url: '', category: '', stock_quantity: '', discount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (product = null) => {
    setEditingProduct(product);
    setFormData(product || { name: '', price: '', description: '', image_url: '', category: '', stock_quantity: '', discount: 0 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock_quantity' || name === 'discount' ? Number(value) : value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const url = editingProduct ? `/products/${editingProduct.id}` : '/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save product');
      }
      await fetchProducts();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete product');
      }
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-800">Manage Products</h2>
        <Button onClick={() => openModal()}>Add Product</Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-blue-900">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-sm text-gray-800 font-medium">Price: ${product.price}</p>
              <p className="text-sm text-gray-800 font-medium">Category: {product.category}</p>
              <p className="text-sm text-gray-800 font-medium">Stock: {product.stock_quantity}</p>
              <p className="text-sm text-gray-800 font-medium">Discount: {product.discount}%</p>
              <div className="flex justify-between mt-3">
                <Button size="sm" onClick={() => openModal(product)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>Delete</Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <Input
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <Input
            name="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
          <Input
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <Input
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <Input
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>{editingProduct ? 'Update' : 'Add'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProducts;
