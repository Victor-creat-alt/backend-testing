import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api'; // Import the shared Axios instance
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  fetchProductById,
  selectProductById,
  selectProductsStatus,
  selectProductsError,
  selectAllProducts
} from '../../../redux/productSlice';

import { addItemToCart } from '../../../redux/cartSlice';

import { formatCurrency } from '../../../utils/currencyFormatter';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorMessage from '../../ui/ErrorMessage';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const product = useSelector(selectProductById);
  const allProducts = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);
  const error = useSelector(selectProductsError);
  
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);

  const loading = status === 'loading';

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!product || !product.id) {
        toast.error('Product information is missing.');
        return;
      }

      // Token is handled by the api instance interceptor
      const payload = {
        product_id: product.id,
        quantity: quantity,
      };
      console.log("handleAddToCart payload:", payload);
      // Using the shared api instance
      await api.post('/cart/items', payload);

      // No need to check response.ok, Axios throws on non-2xx errors.
      // The catch block will handle errors.

      // Assuming a successful POST to /cart/items means the backend handled it.
      // If the backend returns the updated cart item or cart, 
      // the response would be in `response.data` if needed.
      // For now, we'll just dispatch based on frontend data as before.

      dispatch(addItemToCart({ product, quantity }));
      toast.success('Added item to the cart successfully!');
    } catch (error) {
      console.error("handleAddToCart error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
    }
  };

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
        <ErrorMessage message={error} onRetry={() => dispatch(fetchProductById(id))} />
        <Link to="/products" className="mt-4 text-indigo-600 hover:underline flex items-center">
          <FiArrowLeft className="mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const similarProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id && p.price <= product.price * 1.2)
    .sort((a, b) => b.stock_quantity - a.stock_quantity)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/products" className="inline-flex items-center text-indigo-600 hover:underline mb-6">
          <FiArrowLeft className="mr-2" /> Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <div className="relative pb-[100%] md:pb-0 md:h-full">
                <img
                  src={product.image || product.image_url}
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-cover md:absolute"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                  }}
                />
              </div>
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="text-sm text-gray-500 mb-4">Category: {product.category}</div>
              <p className="text-gray-700 mb-6">{product.description}</p>
              <div className="text-2xl font-bold text-indigo-600 mb-6">
                {formatCurrency(product.price)}
              </div>
              
              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-4 text-gray-700">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <FiShoppingCart className="mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.map(similar => (
                <div key={similar.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={similar.image}
                    alt={similar.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{similar.name}</h3>
                    <p className="text-gray-600">{formatCurrency(similar.price)}</p>
                  </div>
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

export default ProductDetail;
