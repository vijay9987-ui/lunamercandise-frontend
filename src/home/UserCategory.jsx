import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../views/Navbar";
import Footer from "../views/Footer";
import UserProductDetails from "./UserProductDetails";



const UserCategory = () => {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState("featured");
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);

   
   

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://194.164.148.244:4066/api/products/category/${categoryName}`
                );

                if (response.data && response.data.length > 0) {
                    setProducts(response.data);
                    setFilteredProducts(response.data);
                    const subcats = [...new Set(response.data.map(p => p.subcategoryName))];
                    setAvailableSubcategories(subcats.filter(Boolean));
                } else {
                    setError(`No products found in ${categoryName}`);
                }
            } catch (err) {
                setError(`Failed to load ${categoryName} products`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, [categoryName]);

    useEffect(() => {
        let result = [...products];

        result = result.filter(
            p => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        if (selectedSubcategories.length > 0) {
            result = result.filter(p =>
                selectedSubcategories.includes(p.subcategoryName)
            );
        }

        switch (sortOption) {
            case "price-low":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                result.sort((a, b) => b.popularity - a.popularity);
        }

        setFilteredProducts(result);
    }, [products, sortOption, priceRange, selectedSubcategories]);

    const toggleSubcategory = (subcat) => {
        setSelectedSubcategories(prev =>
            prev.includes(subcat)
                ? prev.filter(s => s !== subcat)
                : [...prev, subcat]
        );
    };

    const handleProductClick = (product) => {
        setSelectedItem(product);
        setStep(2);
    };

    const quantityDec = () => {
        setQuantity(prev => Math.max(prev - 1, 1));
    };

    const quantityInc = () => {
        setQuantity(prev => prev + 1);
    };

    const addToCart = () => {
        if (selectedItem) {
            const newItem = {
                ...selectedItem,
                quantity,
                total: selectedItem.price * quantity
            };
            const updatedCart = [...cart, newItem];
            setCart(updatedCart);
            navigate('/dashboard/my-cart', { state: { cart: updatedCart } });
        }
    };

    const goBack = () => {
        setStep(1);
        setQuantity(1);
    };

    const renderProductCard = (product) => {
        const isInWishlist = wishlist.includes(product._id);

        return (
            <div
                key={product._id}
                className="card shadow-sm overflow-hidden flex-shrink-0"
                style={{
                    width: "16rem",
                    cursor: "pointer",
                    backgroundColor: "#000",
                    color: "#fff",
                    border: "1px solid #333",
                    transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                }}
               onClick={()=>handleProductClick(product)}
            >
                <div style={{ position: "relative" }}>
                    <img
                        src={product.images?.[0] || "fallback.png"}
                        className="card-img img-fluid"
                        alt={product.name}
                        style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div
                        className="position-absolute"
                        style={{
                            top: "10px",
                            right: "10px",
                            zIndex: 10,
                            cursor: "pointer",
                        }}
                       
                    >
                        <i
                            className={`fa-heart fa-2xl ${isInWishlist ? "fa-solid" : "fa-regular"}`}
                            style={{
                                color: isInWishlist ? "#ff0000" : "#000000",
                                fontSize: "1.8rem"
                            }}
                        ></i>
                    </div>
                </div>

                <div className="card-body text-center">
                    <h5 className="card-title text-white">{product?.name}</h5>
                    <p className="card-text">
                        ₹{product?.price}
                        {product?.originalPrice && (
                            <span className="text-decoration-line-through ms-2" style={{ color: "grey" }}>
                                ₹{product.originalPrice}
                            </span>
                        )}
                    </p>
                    {product.subcategoryName && (
                        <span className="badge bg-secondary">{product.subcategoryName}</span>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh', color: 'dark' }}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="container text-center py-5 text-light">
                    <h2>{error}</h2>
                    <button className="btn btn-outline-dark mt-3" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container py-4 text-dark">
                {step === 1 ? (
                    <>
                        {/* Toggle Button */}
                        <div className="d-flex justify-content-end mb-3">
                            <button
                                className="btn btn-outline-dark"
                                onClick={() => setShowFilters(prev => !prev)}
                            >
                                {showFilters ? "Hide Filters" : "Show Filters"}
                            </button>
                        </div>

                        <div className="row">
                            {/* Sidebar Filters */}
                            {showFilters && (
                                <div className="col-12 col-md-4 col-lg-3 mb-4">
                                    <div className="card bg-dark border-dark p-3 h-100" style={{ color: "white" }}>
                                        <h4 className="mb-3">Filters</h4>

                                        {/* Price Filter */}
                                        <div className="mb-4">
                                            <h6>Price Range</h6>
                                            <div className="d-flex justify-content-between small">
                                                <span>₹{priceRange[0]}</span>
                                                <span>₹{priceRange[1]}</span>
                                            </div>
                                            <input
                                                type="range"
                                                className="form-range mt-2"
                                                min="0"
                                                max="10000"
                                                step="100"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                            />
                                        </div>

                                        {/* Subcategory Filters */}
                                        {availableSubcategories.length > 0 && (
                                            <div className="mb-4">
                                                <h6>Subcategories</h6>
                                                {availableSubcategories.map(subcat => (
                                                    <div key={subcat} className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id={`sub-${subcat}`}
                                                            checked={selectedSubcategories.includes(subcat)}
                                                            onChange={() => toggleSubcategory(subcat)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`sub-${subcat}`}>
                                                            {subcat}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Product Listing */}
                            <div className={showFilters ? "col-12 col-md-8 col-lg-9" : "col-12"}>
                                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4">
                                    <h2 className="text-capitalize">{categoryName}</h2>
                                    <div className="mt-3 mt-sm-0 d-flex align-items-center gap-2">
                                        <span className="me-2">Sort by:</span>
                                        <select
                                            className="form-select bg-dark text-light border-secondary"
                                            style={{ width: 'auto' }}
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                        >
                                            <option value="featured">Featured</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="newest">Newest Arrivals</option>
                                        </select>
                                    </div>
                                </div>

                                {filteredProducts.length === 0 ? (
                                    <div className="text-center py-5">
                                        <h5>No products match your filters</h5>
                                        <button
                                            className="btn btn-outline-light mt-3"
                                            onClick={() => {
                                                setSelectedSubcategories([]);
                                                setPriceRange([0, 10000]);
                                            }}
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-wrap gap-4">
                                        {filteredProducts.map(renderProductCard)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <UserProductDetails
                        selectedItem={selectedItem}
                        quantity={quantity}
                        quantityDec={quantityDec}
                        quantityInc={quantityInc}
                        addToCart={addToCart}
                        goBack={goBack}
                    />
                )}
            </div>
            <Footer />
        </>
    );
};

export default UserCategory;