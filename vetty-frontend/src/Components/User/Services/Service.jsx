import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { MdSort } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

import {
  fetchServices,
  setSearchTerm,
  setSelectedCategory,
  setSortBy,
  resetFilters,
  selectFilteredAndSortedServices,
  selectCategories,
  selectServicesStatus,
  selectServicesError,
  selectSelectedCategory,
  selectSearchTerm,
  selectSortBy,
} from '../../../redux/servicesSlice';

import ShoppingCartIcon from "../../ShoppingCartIcon";
import { addItemToCart, selectCartItems } from "../../../redux/cartSlice";
import Navbar from '../../../layouts/Navbar';
import '../../User/Services/Service.css';

// Fallback data in case API fails for services
const fallbackServices = [
  {
    id: 1,
    name: "Basic Pet Grooming",
    price: 49.99,
    category: "Grooming",
    description: "Includes bath, brush, and nail trim.",
    image: "https://via.placeholder.com/400x300?text=Grooming",
  },
  {
    id: 2,
    name: "Dog Walking (30 mins)",
    price: 25.00,
    category: "Walking",
    description: "A 30-minute walk for your furry friend.",
    image: "https://via.placeholder.com/400x300?text=Dog+Walking",
  },
  {
    id: 3,
    name: "Pet Sitting (per day)",
    price: 75.00,
    category: "Sitting",
    description: "Overnight pet sitting at your home.",
    image: "https://via.placeholder.com/400x300?text=Pet+Sitting",
  },
  {
    id: 4,
    name: "Advanced Dental Cleaning",
    price: 120.00,
    category: "Veterinary",
    description: "Professional dental cleaning under anesthesia.",
    image: "https://via.placeholder.com/400x300?text=Dental+Cleaning",
  },
  {
    id: 5,
    name: "Pet Training (4 sessions)",
    price: 199.00,
    category: "Training",
    description: "Four one-hour training sessions with a certified trainer.",
    image: "https://via.placeholder.com/400x300?text=Pet+Training",
  },
  {
    id: 6,
    name: "Luxury Pet Spa Day",
    price: 99.99,
    category: "Grooming",
    description: "Full grooming service including massage and special treatments.",
    image: "https://via.placeholder.com/400x300?text=Pet+Spa",
  },
];

const sortOptions = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" }
];

const Service = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filteredAndSortedServices = useSelector(selectFilteredAndSortedServices);
  const categoriesRaw = useSelector(selectCategories);
  const status = useSelector(selectServicesStatus);
  const error = useSelector(selectServicesError);
  const selectedCategory = useSelector(selectSelectedCategory);
  const searchTerm = useSelector(selectSearchTerm);
  const sortBy = useSelector(selectSortBy);
  const cartItems = useSelector(selectCartItems);

  const isLoading = status === 'loading';
  const [useFallback, setUseFallback] = useState(false);
  const [quantities, setQuantities] = useState({}); // key: service id, value: quantity

  useEffect(() => {
    dispatch(fetchServices())
      .unwrap()
      .catch(error => {
        console.error("Error fetching services:", error);
        setUseFallback(true);
      });
  }, [dispatch]);

  const handleQuantityChange = (serviceId, value) => {
    const qty = Math.max(1, Number(value));
    setQuantities(prev => ({ ...prev, [serviceId]: qty }));
  };

  const addToCartHandler = (service) => {
    const quantity = quantities[service.id] || 1;
    dispatch(addItemToCart({ service, quantity }));
  };

  const goToCart = () => {
    navigate('/cart');
  };

  // Sanitize categories to remove duplicates and undefined/null values
  const categories = Array.isArray(categoriesRaw)
    ? Array.from(new Set(categoriesRaw.filter(cat => cat != null && cat !== '')))
    : [];

  const ServiceCard = ({ service }) => (
    <div className="service-card">
      <Link to={`/services/${service.id}`} className="block">
        <div className="service-image-container">
          <img
            src={service.image_url || service.image}
            alt={service.name}
            className="service-image"
            loading="lazy"
            onError={(e) => {
              console.error(`Failed to load image for ${service.name}`);
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            }}
          />
        </div>
        <div className="service-info">
          <h3 className="service-name">{service.name}</h3>
          <p className="service-description">{service.description}</p>
          <div className="flex justify-between items-center">
            <span className="service-price">KES{service.price.toFixed(2)}</span>
          </div>
        </div>
      </Link>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse mt-20">
      <div className="relative pb-[75%] bg-gray-300"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 w-20 bg-gray-300 rounded"></div>
          <div className="h-10 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );

  const displayServices = useFallback ? fallbackServices : filteredAndSortedServices;

  return (
    <>
      <Navbar />
      <div className="services-header flex justify-end p-4 max-w-7xl mx-auto">
        <div onClick={goToCart} role="button" tabIndex={0} aria-label="View cart" onKeyPress={(e) => { if (e.key === 'Enter') goToCart(); }}>
          <ShoppingCartIcon />
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pet Services</h1>

          {error && !useFallback && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
              {typeof error === 'string' && error.toLowerCase().includes('failed to fetch') && (
                <p>Please check your backend server or API endpoint.</p>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="relative flex-1 max-w-xl">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pet services..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedCategory}
                onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="relative">
                <select
                  className="border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  value={sortBy}
                  onChange={(e) => dispatch(setSortBy(e.target.value))}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <MdSort className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {isLoading && !useFallback ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : displayServices.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-600">No pet services found</h2>
              <span
                className="mt-4 text-indigo-600 cursor-pointer hover:text-indigo-700"
                onClick={() => dispatch(resetFilters())}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter') dispatch(resetFilters()); }}
              >
                Reset Filters
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayServices.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Service;
