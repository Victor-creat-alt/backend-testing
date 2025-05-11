import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../../ui/buttons';
import { Input } from '../../ui/Input';
import Modal from '../../ui/Modal';
import { motion } from 'framer-motion';
import './AdminServices.css';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image_url: '', duration: '', });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get token from Redux state
  const token = useSelector(state => state.auth.token);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openModal = (service = null) => {
    setEditingService(service);
    setFormData(service || { name: '', price: '', description: '', image_url: '', duration: '',  });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const name = formData.name.trim();
      const description = formData.description.trim();
      const image_url = formData.image_url.trim();
      const price = Number(formData.price);
      const duration = formData.duration.trim();

      if (
        !name ||
        !description ||
        !image_url ||
        isNaN(price) ||
        price <= 0 ||
        !duration
      ) {
        throw new Error('Please fill all fields correctly with valid values.');
      }

      const url = editingService ? `/services/${editingService.id}` : '/services';
      const method = editingService ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price,
          description,
          image_url,
          duration: String(duration), // ensure duration is string
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        console.error('Error response from server:', errData);
        throw new Error(errData.error || 'Failed to save service');
      }
      alert(editingService ? 'Service updated successfully.' : 'Service added successfully.');
      await fetchServices();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete service');
      }
      await fetchServices();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-800">Manage Services</h2>
        <Button onClick={() => openModal()}>Add Service</Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <motion.div
            key={service.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-blue-900">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
              <p className="text-sm text-gray-800 font-medium">Price: ${service.price}</p>
              <p className="text-sm text-gray-800 font-medium">Duration: {service.duration}</p>

              <div className="flex justify-between mt-3">
                <Button size="sm" onClick={() => openModal(service)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>Delete</Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingService ? 'Edit Service' : 'Add Service'}
      >
        <div className="modal-content space-y-3" style={{ maxHeight: '60vh', overflowY: 'scroll', paddingRight: '1rem' }}>
          <label className="block text-sm font-medium text-gray-700">Service Name</label>
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
          <label className="block text-sm font-medium text-gray-700">Duration</label>
          <Input
            name="duration"
            type="text"
            value={formData.duration}
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
          <Button onClick={handleSubmit} disabled={loading}>{editingService ? 'Update' : 'Add'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminServices;
