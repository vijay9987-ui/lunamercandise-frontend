import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from "./UserNavbar";
import UserFooter from './UserFooter';
import axios from 'axios';
import UserProductDetails from './UserProductDetails';

const UserNewArrivals = () => {
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const userId = storedUser.userId;

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    // Calculate pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = newArrivalsProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(newArrivalsProducts.length / productsPerPage);

   

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("https://luna-backend-1.onrender.com/api/products/new-arrivals");
                setNewArrivalsProducts(response.data); // Remove the slice(0, 10) to get all products
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    // ... rest of your functions remain the same ...

    const quantityDec = () => {
        setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1)); // Prevents going below 1
    };

    const quantityInc = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const handlePurchase = (item) => {
        setSelectedItem(item);
        setStep(2);
    };
    const addToCart = () => {
        if (selectedItem) {
            const newItem = { ...selectedItem, quantity, total: selectedItem.price * quantity };
            setCart(prevCart => [...prevCart, newItem]);
            navigate('/dashboard/my-cart', { state: { cart: [...cart, newItem] } }); // Navigate to MyCart
        }
    };

    return (
        <>
            <UserNavbar />
            <div className="d-flex justify-content-center">
                <div className="mostwanted">
                    <div className="wanted wanted-blur p-5 text-light aligfn-items-center">
                        <center>
                            <h1 className="text1">New Arrivals</h1><br />
                            <p className="text2">Latest Design For You Order Now.</p>
                        </center>
                    </div>
                </div>
            </div><br />

            {step === 1 && (
                <>
                    <div className="d-flex flex-column align-items-center py-2">
                        {/* Products Grid - Now using currentProducts instead of newArrivalsProducts */}
                        <div className="d-flex flex-wrap justify-content-center" style={{ gap: "1rem", maxWidth: "1200px" }}>
                            {currentProducts.map((product) => {
                                const isInWishlist = wishlist.includes(product._id);
                                return (
                                    <div
                                        key={product._id}
                                        className="card shadow-sm overflow-hidden"
                                        onClick={() => handlePurchase(product)}
                                        style={{
                                            width: "16rem",
                                            cursor: "pointer",
                                            backgroundColor: "#000",
                                            color: "#fff",
                                            border: "1px solid #333",
                                            transition: "transform 0.3s, box-shadow 0.3s",
                                            margin: "0.5rem"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "scale(1.03)";
                                            e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        {/* Product card content remains the same */}
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
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination - Only show if there are multiple pages */}
                        {totalPages > 1 && (
                            <nav aria-label="Page navigation" className="mt-4">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {[...Array(totalPages).keys()].map(num => (
                                        <li
                                            key={num}
                                            className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(num + 1)}
                                                style={{
                                                    background: currentPage === num + 1 ? "black" : "white",
                                                    color: currentPage === num + 1 ? "white" : "black",
                                                    borderColor: "white"
                                                }}
                                            >
                                                {num + 1}
                                            </button>
                                        </li>

                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </>
            )}

            {step === 2 && (
                <UserProductDetails
                    selectedItem={selectedItem}
                    quantity={quantity}
                    quantityDec={quantityDec}
                    quantityInc={quantityInc}
                    addToCart={addToCart}
                    goBack={() => setStep(1)}
                />
            )}

            <UserFooter />
        </>
    );
};

export default UserNewArrivals;
