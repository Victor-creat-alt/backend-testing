import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { MdSort } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

import { 
  fetchProducts, 
  setSelectedCategory, 
  setSearchTerm, 
  setSortBy, 
  resetFilters,
  selectFilteredAndSortedProducts,
  selectCategories,
  selectProductsStatus,
  selectProductsError,
  selectSelectedCategory,
  selectSearchTerm,
  selectSortBy
} from "../../../redux/productSlice";

import ShoppingCartIcon from "../../ShoppingCartIcon";
import { addItemToCart, selectCartItems } from "../../../redux/cartSlice";
import Navbar from '../../../layouts/Navbar';
import './Product.css';

// Fallback data in case API fails
const fallbackProducts = [
  {
    id: 1,
    name: "Premium Pet Carrier",
    price: 89.99,
    category: "Travel",
    description: "Comfortable and durable pet carrier for safe transportation",
    image: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993"
  },
  {
    id: 2,
    name: "Automatic Pet Feeder",
    price: 129.99,
    category: "Electronics",
    description: "Smart feeding system with timer and portion control",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1"
  },
  {
    id: 3,
    name: "Luxury Pet Bed",
    price: 79.99,
    category: "Furniture",
    description: "Memory foam pet bed with washable cover",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0"
  },
  {
    id: 4,
    name: "Interactive Pet Toy",
    price: 34.99,
    category: "Toys",
    description: "Engaging toy for mental stimulation and exercise",
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97"
  },
  {
    id: 5,
    name: "Pet Grooming Kit",
    price: 49.99,
    category: "Grooming",
    description: "Complete set of grooming tools for pets",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7"
  },
  {
    id: 6,
    name: "Organic Pet Food",
    price: 59.99,
    category: "Food",
    description: "Premium organic pet food for healthy nutrition",
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"
  }
];

const sortOptions = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" }
];

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filteredAndSortedProducts = useSelector(selectFilteredAndSortedProducts);
  const categories = useSelector(selectCategories);
  const status = useSelector(selectProductsStatus);
  const error = useSelector(selectProductsError);
  const selectedCategory = useSelector(selectSelectedCategory);
  const searchTerm = useSelector(selectSearchTerm);
  const sortBy = useSelector(selectSortBy);
  const cartItems = useSelector(selectCartItems);

  const isLoading = status === 'loading';
  const [useFallback, setUseFallback] = useState(false);
  const [quantities, setQuantities] = useState({}); // key: product id, value: quantity

  useEffect(() => {
    dispatch(fetchProducts())
      .unwrap()
      .catch(error => {
        console.error("Error fetching products:", error);
        setUseFallback(true);
      });
  }, [dispatch]);

  const handleQuantityChange = (productId, value) => {
    const qty = Math.max(1, Number(value));
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const addToCartHandler = (product) => {
    const quantity = quantities[product.id] || 1;
    dispatch(addItemToCart({ product, quantity }));
  };

  const goToCart = () => {
    navigate('/cart');
  };

  const ProductCard = ({ product }) => (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="block">
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              console.error(`Failed to load image for ${product.name}`);
              e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
            }}
          />
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="product-price">KES{product.price.toFixed(2)}</span>
          </div>
        </div>
      </Link>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse mt-20">
      <div className="relative pb-[100%] bg-gray-300"></div>
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

  const displayProducts = useFallback ? fallbackProducts : filteredAndSortedProducts;

  return (
    <>
      <Navbar />
      <div className="products-header flex justify-end p-4 max-w-7xl mx-auto">
        <div onClick={goToCart} role="button" tabIndex={0} aria-label="View cart" onKeyPress={(e) => { if (e.key === 'Enter') goToCart(); }}>
          <ShoppingCartIcon />
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pet Products</h1>
          
          {error && !useFallback && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="relative flex-1 max-w-xl">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pet products..."
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
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-600">No pet products found</h2>
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
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
