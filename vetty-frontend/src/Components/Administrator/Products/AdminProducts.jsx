import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/api'; // Import the shared Axios instance
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

  // Get token from Redux state
  const token = useSelector(state => state.auth.token);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await api.get('/products'); // Use Axios instance
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch products');
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
      let response;
      if (editingProduct) {
        response = await api.put(`/products/${editingProduct.id}`, formData); // Axios handles token
      } else {
        response = await api.post('/products', formData); // Axios handles token
      }
      // No need to check response.ok, Axios throws on non-2xx
      await fetchProducts();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save product');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/products/${id}`); // Axios handles token
      // No need to check response.ok
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete product');
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
        <div className="modal-content space-y-3" style={{ maxHeight: '60vh', overflowY: 'scroll', paddingRight: '1rem' }}>
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
        <div className="modal-footer mt-4 flex justify-end" style={{ paddingBottom: '1rem', background: 'white', position: 'sticky', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e7eb' }}>
          <Button onClick={handleSubmit} disabled={loading}>{editingProduct ? 'Update' : 'Add'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProducts;
