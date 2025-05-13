import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../../ui/buttons';
import { Input } from '../../ui/Input';
import Modal from '../../ui/Modal';
import { motion } from 'framer-motion';
import api from '../../api/api'; // import axios instance
import './AdminServices.css';

const AdminServices = () => {
  // ... other state and hooks unchanged

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch services');
    }
    setLoading(false);
  };

  // ... other functions unchanged

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const name = formData.name.trim();
      const description = formData.description.trim();
      const image_url = formData.image_url.trim();
      const category = formData.category.trim();
      const price = Number(formData.price);
      const duration = Number(formData.duration);

      if (
        !name ||
        !description ||
        !image_url ||
        !category ||
        isNaN(price) ||
        price <= 0 ||
        isNaN(duration) ||
        duration <= 0
      ) {
        throw new Error('Please fill all fields correctly with valid values.');
      }

      const data = {
        name,
        price,
        description,
        image_url,
        duration,
        category,
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, data);
        alert('Service updated successfully.');
      } else {
        await api.post('/services', data);
        alert('Service added successfully.');
      }

      await fetchServices();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save service');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/services/${id}`);
      await fetchServices();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete service');
    }
    setLoading(false);
  };

  // ... rest of component unchanged
};

export default AdminServices;
