import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiCalendar, FiStar } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  fetchServiceById,
  selectSelectedService,
  selectServicesStatus,
  selectServicesError,
  selectServices,
} from '../../../redux/servicesSlice';

import {
  createServiceRequest,
} from '../../../redux/serviceRequestSlice';

import { formatCurrency } from '../../../utils/currencyFormatter';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorMessage from '../../ui/ErrorMessage';

const Star = React.memo(({ starId, currentRating, currentHoverRating, onStarMouseEnter, onStarMouseLeave, onStarClick }) => {
  const fill = starId <= (currentHoverRating || currentRating) ? 'text-yellow-400' : 'text-gray-300';
  return (
    <FiStar
      className={`h-6 w-6 cursor-pointer ${fill}`}
      onMouseEnter={onStarMouseEnter}
      onMouseLeave={onStarMouseLeave}
      onClick={onStarClick}
      aria-label={`Rate ${starId} stars`}
    />
  );
});

const ServiceDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const service = useSelector(selectSelectedService);
  const allServices = useSelector(selectServices);
  const status = useSelector(selectServicesStatus);
  const error = useSelector(selectServicesError);

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const loading = status === 'loading';

  useEffect(() => {
    if (id) {
      dispatch(fetchServiceById(id));
    }
  }, [dispatch, id]);

  const handleQuantityChange = useCallback((event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else {
      setQuantity(1);
    }
  }, []);

  const handleBookService = useCallback(async () => {
    if (!service || !service.id) { // Add a check for service and service.id
      toast.error('Service information is not loaded properly.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to book a service appointment.', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/login');
      return;
    }
    try {
      // For appointment_time, use current time + 1 minute to ensure future datetime
      const appointment_time = new Date(Date.now() + 60000).toISOString();

      const bookedServiceRequest = await dispatch(createServiceRequest({ service_id: service.id, appointment_time })).unwrap();

      toast.success(`${service.name} appointment booked successfully!`, {
        position: 'top-right',
        autoClose: 2000,
      });

      // Add the booked service request to the cart with quantity 1
      dispatch({
        type: 'cart/addItemToCart',
        payload: { service: bookedServiceRequest, quantity: 1 },
      });

      navigate('/service-requests'); // Assuming a route to view service requests
    } catch (error) {
      console.error(error);
      toast.error('Error booking service appointment', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  }, [dispatch, navigate, service]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <ErrorMessage message={error} onRetry={() => dispatch(fetchServiceById(id))} />
        <Link to="/services" className="mt-4 text-indigo-600 hover:underline flex items-center">
          <FiArrowLeft className="mr-2" /> Back to Services
        </Link>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const similarServices = allServices
    ? allServices
        .filter((s) => s.category === service.category && s.id !== service.id)
        .sort((a, b) => a.price - b.price)
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/services" className="inline-flex items-center text-indigo-600 hover:underline mb-6">
          <FiArrowLeft className="mr-2" /> Back to Services
        </Link>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 relative">
              {imageLoading && !imageError && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-100">
                  <LoadingSpinner size="md" />
                </div>
              )}
              {imageError && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-100 text-gray-500">
                  Image Not Available
                </div>
              )}
              <img
                src={service.image_url || service.image || 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={service.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{service.name}</h1>
              <div className="text-sm text-gray-500 mb-4">Category: {service.category}</div>
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((starId) => (
                  <Star
                    key={starId}
                    starId={starId}
                    currentRating={rating}
                    currentHoverRating={hoverRating}
                    onStarMouseEnter={() => setHoverRating(starId)}
                    onStarMouseLeave={() => setHoverRating(0)}
                    onStarClick={() => setRating(starId)}
                  />
                ))}
                {rating > 0 && <span className="text-gray-600 ml-2">({rating} stars)</span>}
              </div>
              <p className="text-gray-700 mb-6">{service.description}</p>
              <div className="text-2xl font-bold text-indigo-600 mb-6">
                {formatCurrency(service.price)}
              </div>

              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-4 text-gray-700">
                  Quantity:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                </div>
              </div>

              <button
                onClick={handleBookService}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <FiCalendar className="mr-2" /> Book Appointment
              </button>
            </div>
          </div>
        </div>

        {similarServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Similar Services You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarServices.map((similar) => (
                <div
                  key={similar.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <Link to={`/services/${similar.id}`} aria-label={`View details for ${similar.name}`}>
                    <div className="relative">
                      <img
                        src={similar.image_url || similar.image || 'https://via.placeholder.com/400x300?text=Similar+Service'}
                        alt={similar.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{similar.name}</h3>
                      <p className="text-gray-600">{formatCurrency(similar.price)}</p>
                      {similar.rating && (
                        <div className="flex items-center mt-2">
                          {[...Array(Math.round(similar.rating))].map((_, index) => (
                            <FiStar key={index} className="h-4 w-4 text-yellow-400 mr-1" />
                          ))}
                          {[...Array(5 - Math.round(similar.rating))].map((_, index) => (
                            <FiStar key={index + Math.round(similar.rating)} className="h-4 w-4 text-gray-300 mr-1" />
                          ))}
                          <span className="text-sm text-gray-500 ml-1">({similar.rating.toFixed(1)})</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ServiceDetail;
