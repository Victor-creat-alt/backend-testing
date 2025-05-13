import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiCalendar, FiStar, FiClock, FiUser, FiMapPin } from 'react-icons/fi';
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
import Modal from '../../ui/Modal';
import ServiceRequestForm from '../../User/Services/ServiceRequestForm';

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
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

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

  const handleBookServiceClick = () => {
    setShowRequestForm(true);
  };

  const handleRequestFormClose = () => {
    setShowRequestForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
        <ErrorMessage message={error} onRetry={() => dispatch(fetchServiceById(id))} />
        <Link to="/services" className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/services" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-6 group">
          <FiArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" /> 
          <span className="hover:underline">Back to Services</span>
        </Link>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all hover:shadow-3xl">
          <div className="md:flex">
            <div className="md:w-1/2 relative">
              {imageLoading && !imageError && (
                <div className="absolute inset-0 w-full h-full flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <LoadingSpinner size="md" />
                </div>
              )}
              {imageError && (
                <div className="absolute inset-0 w-full h-full flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
                  Image Not Available
                </div>
              )}
              <img
                src={service.image_url || service.image || 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={service.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                  <div className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mb-3">
                    {service.category}
                  </div>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(service.price)}
                </div>
              </div>

              <div className="flex items-center mb-6">
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                {service.duration && (
                  <div className="flex items-center text-gray-700">
                    <FiClock className="mr-2 text-indigo-500" />
                    <span>{service.duration}</span>
                  </div>
                )}
                {service.provider && (
                  <div className="flex items-center text-gray-700">
                    <FiUser className="mr-2 text-indigo-500" />
                    <span>{service.provider}</span>
                  </div>
                )}
                {service.location && (
                  <div className="flex items-center text-gray-700">
                    <FiMapPin className="mr-2 text-indigo-500" />
                    <span>{service.location}</span>
                  </div>
                )}
              </div>

              <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'reviews'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Reviews
                  </button>
                </nav>
              </div>

              {activeTab === 'details' && (
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">{service.description}</p>
                  {service.additional_info && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Additional Information</h3>
                      <p className="text-gray-600">{service.additional_info}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Customer Reviews</h3>
                    <p className="text-gray-600 italic">No reviews yet. Be the first to review this service!</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="mr-4 text-gray-700 font-medium">
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
                      className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                    />
                  </div>
                </div>

                {!showRequestForm && (
                  <button
                    onClick={handleBookServiceClick}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-md hover:from-indigo-700 hover:to-indigo-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center shadow-lg"
                  >
                    <FiCalendar className="mr-2" /> Book Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {similarServices.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-2 border-b border-gray-200">Similar Services You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {similarServices.map((similar) => (
                <div
                  key={similar.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
                >
                  <Link to={`/services/${similar.id}`} className="block" aria-label={`View details for ${similar.name}`}>
                    <div className="relative h-48">
                      <img
                        src={similar.image_url || similar.image || 'https://via.placeholder.com/400x300?text=Similar+Service'}
                        alt={similar.name}
                        className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                        {formatCurrency(similar.price)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{similar.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{similar.category}</p>
                      {similar.rating && (
                        <div className="flex items-center">
                          {[...Array(Math.round(similar.rating))].map((_, index) => (
                            <FiStar key={index} className="h-4 w-4 text-yellow-400 mr-1" />
                          ))}
                          {[...Array(5 - Math.round(similar.rating))].map((_, index) => (
                            <FiStar key={index + Math.round(similar.rating)} className="h-4 w-4 text-gray-300 mr-1" />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({similar.rating.toFixed(1)})</span>
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Modal isOpen={showRequestForm} onClose={handleRequestFormClose} title="Book a Service Appointment">
        <ServiceRequestForm onClose={handleRequestFormClose} service={service} />
      </Modal>
    </div>
  );
};

export default ServiceDetail;