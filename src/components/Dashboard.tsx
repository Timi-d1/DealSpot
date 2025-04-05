import React, { useEffect, useState } from 'react';
import styles from './Listingbox.module.css';
import Header from './HeaderSellerDash';
import Sidebar from './SideBar';
import StatCard from './StatCard';
import Footer from './FooterSellerDash';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string; // Include the ID for deletion
  name: string; // Only keep the name for display
  price: number; // Add price for calculations
}

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0); // Ensure it's a number
  const [averageOrderValue, setAverageOrderValue] = useState<number>(0); // Ensure it's a number
  const [activeListings, setActiveListings] = useState<number>(0); // Ensure it's a number
  const navigate = useNavigate();

  const headerProps = {
    logo: 'DealSpot',
  };

  const sellerId = () => {
    try {
      // Try to get user from local storage, fallback to a default for testing
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || user.document_id || "current-user-id";
      }
      return "current-user-id";
    } catch (e) {
      console.error("Error getting user ID:", e);
      return "current-user-id";  // Default for testing
    }
  };


  useEffect(() => {
    const fetchSellerListings = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5001/api/seller_listings?seller_id=${sellerId()}`);
        const data = await response.json();
        if (response.ok) {
          const formattedProducts = data.map((item: any) => ({
            id: item.id, // Include the ID for deletion
            name: item.product_name || "Unnamed Product", // Display product name
            price: parseFloat(item.initial_price) || 0, // Ensure price is a number
          }));
          setProducts(formattedProducts);

          // Calculate total sales, average order value, and active listings
          const total = formattedProducts.reduce((acc, product) => acc + product.price, 0);
          const average = formattedProducts.length > 0 ? total / formattedProducts.length : 0;

          setTotalSales(total);
          setAverageOrderValue(average);
          setActiveListings(formattedProducts.length);
        } else { 
          console.error("Error fetching seller listings:", data.error);
        }
      } catch (error) {
        console.error("Error fetching seller listings:", error);
      }
    };

    fetchSellerListings();
  }, [sellerId()]);

  const handleDeleteListing = async (listingId: string) => {
    console.log("Attempting to delete listing with ID:", listingId); // Log the ID
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const response = await fetch(`http://127.0.0.1:5001/api/delete_listing/${listingId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          // Remove the deleted listing from the state
          setProducts(prevProducts => {
            const updatedProducts = prevProducts.filter(product => product.id !== listingId);
            
            // Update active listings count
            setActiveListings(updatedProducts.length);
            
            // Recalculate total sales and average order value
            const total = updatedProducts.reduce((acc, product) => acc + product.price, 0);
            const average = updatedProducts.length > 0 ? total / updatedProducts.length : 0;
  
            // Update state for total sales and average order value
            setTotalSales(total);
            setAverageOrderValue(average);
  
            return updatedProducts;
          });
          alert("Listing deleted successfully!");
        } else {
          const result = await response.json();
          console.error("Delete error:", result); // Log the error response
          alert(result.error || "Failed to delete listing.");
        }
      } catch (error) {
        console.error("Error during deletion:", error); // Log the error
        alert("An error occurred while deleting the listing.");
      }
    }
  };

  const handleEditListing = (listingId: string) => {
    navigate(`/edit-listing/${listingId}`); // Navigate to edit-listing page with listing ID
  };

  const statCards = [
    {
      icon: `<svg id="2003:872" layer-name="bag-tick-2 1" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
        <path d="M19.142 8.76452C18.5166 8.07378 17.5738 7.6724 16.267 7.53238V6.82297C16.267 5.54417 15.7256 4.31203 14.7735 3.45327C13.812 2.57584 12.5612 2.16513 11.2638 2.28648C9.0329 2.50117 7.1567 4.6574 7.1567 6.99099V7.53238C5.84989 7.6724 4.90712 8.07378 4.28172 8.76452C3.37629 9.77259 3.40429 11.1167 3.50697 12.0502L4.16037 17.2494C4.35639 19.0696 5.09381 20.9365 9.10758 20.9365H14.3161C18.3299 20.9365 19.0673 19.0696 19.2633 17.2587L19.9167 12.0408C20.0194 11.1167 20.0474 9.77259 19.142 8.76452ZM11.3944 3.58395C12.3279 3.49995 13.2146 3.78931 13.9054 4.41471C14.5868 5.03078 14.9695 5.90821 14.9695 6.82297V7.47638H8.45417V6.99099C8.45417 5.32948 9.82632 3.7333 11.3944 3.58395ZM11.7118 17.7441C9.76098 17.7441 8.17414 16.1573 8.17414 14.2064C8.17414 12.2555 9.76098 10.6687 11.7118 10.6687C13.6627 10.6687 15.2495 12.2555 15.2495 14.2064C15.2495 16.1573 13.6627 17.7441 11.7118 17.7441Z" fill="#1A2B88"></path>
        <path d="M11.1785 15.935C11.0011 15.935 10.8238 15.8696 10.6838 15.7296L9.75966 14.8055C9.48897 14.5348 9.48897 14.0868 9.75966 13.8161C10.0303 13.5454 10.4784 13.5454 10.7491 13.8161L11.1971 14.2641L12.6906 12.8827C12.9707 12.6213 13.4187 12.64 13.6801 12.92C13.9414 13.2 13.9228 13.6481 13.6427 13.9094L11.6545 15.7483C11.5145 15.8696 11.3465 15.935 11.1785 15.935Z" fill="#1A2B88"></path>
      </svg>`,
      label: 'Total Sales',
      value: `$${totalSales.toFixed(2)}` // Display dynamic total sales
    },
    {
      icon: `<svg id="2003:877" layer-name="bag-tick-2 1" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
        <path d="M18.7396 8.47204C18.1142 7.7813 17.1714 7.37992 15.8646 7.2399V6.53049C15.8646 5.25169 15.3232 4.01955 14.3711 3.16079C13.4097 2.28336 12.1589 1.87265 10.8614 1.994C8.63056 2.20869 6.75435 4.36492 6.75435 6.69851V7.2399C5.44754 7.37992 4.50477 7.7813 3.87937 8.47204C2.97394 9.48011 3.00194 10.8243 3.10462 11.7577L3.75803 16.9569C3.95405 18.7771 4.69146 20.644 8.70523 20.644H13.9138C17.9275 20.644 18.6649 18.7771 18.861 16.9663L19.5144 11.7484C19.617 10.8243 19.645 9.48011 18.7396 8.47204ZM10.9921 3.29147C11.9255 3.20746 12.8123 3.49683 13.503 4.12223C14.1844 4.7383 14.5672 5.61573 14.5672 6.53049V7.1839H8.05183V6.69851C8.05183 5.037 9.42398 3.44082 10.9921 3.29147ZM11.3095 17.4516C9.35864 17.4516 7.7718 15.8648 7.7718 13.9139C7.7718 11.963 9.35864 10.3762 11.3095 10.3762C13.2603 10.3762 14.8472 11.963 14.8472 13.9139C14.8472 15.8648 13.2603 17.4516 11.3095 17.4516Z" fill="#1A2B88"></path>
        <path d="M10.7761 15.6425C10.5988 15.6425 10.4214 15.5772 10.2814 15.4371L9.35732 14.513C9.08662 14.2423 9.08662 13.7943 9.35732 13.5236C9.62801 13.2529 10.0761 13.2529 10.3468 13.5236L10.7948 13.9717L12.2883 12.5902C12.5683 12.3288 13.0164 12.3475 13.2777 12.6275C13.5391 12.9075 13.5204 13.3556 13.2404 13.6169L11.2522 15.4558C11.1122 15.5772 10.9441 15.6425 10.7761 15.6425Z" fill="#1A2B88"></path>
      </svg>`,
      label: 'Avg. Order Value',
      value: `$${averageOrderValue.toFixed(2)}` // Display dynamic average order value
    },
    {
      icon: `<svg id="2003:949" layer-name="bag-tick-2 1" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
        <path d="M18.7396 8.47204C18.1142 7.7813 17.1714 7.37992 15.8646 7.2399V6.53049C15.8646 5.25169 15.3232 4.01955 14.3711 3.16079C13.4097 2.28336 12.1589 1.87265 10.8614 1.994C8.63056 2.20869 6.75435 4.36492 6.75435 6.69851V7.2399C5.44754 7.37992 4.50477 7.7813 3.87937 8.47204C2.97394 9.48011 3.00194 10.8243 3.10462 11.7577L3.75803 16.9569C3.95405 18.7771 4.69146 20.644 8.70523 20.644H13.9138C17.9275 20.644 18.6649 18.7771 18.861 16.9663L19.5144 11.7484C19.617 10.8243 19.645 9.48011 18.7396 8.47204ZM10.9921 3.29147C11.9255 3.20746 12.8123 3.49683 13.503 4.12223C14.1844 4.7383 14.5672 5.61573 14.5672 6.53049V7.1839H8.05183V6.69851C8.05183 5.037 9.42398 3.44082 10.9921 3.29147ZM11.3095 17.4516C9.35864 17.4516 7.7718 15.8648 7.7718 13.9139C7.7718 11.963 9.35864 10.3762 11.3095 10.3762C13.2603 10.3762 14.8472 11.963 14.8472 13.9139C14.8472 15.8648 13.2603 17.4516 11.3095 17.4516Z" fill="#1A2B88"></path>
        <path d="M10.7761 15.6425C10.5988 15.6425 10.4214 15.5772 10.2814 15.4371L9.35732 14.513C9.08662 14.2423 9.08662 13.7943 9.35732 13.5236C9.62801 13.2529 10.0761 13.2529 10.3468 13.5236L10.7948 13.9717L12.2883 12.5902C12.5683 12.3288 13.0164 12.3475 13.2777 12.6275C13.5391 12.9075 13.5204 13.3556 13.2404 13.6169L11.2522 15.4558C11.1122 15.5772 10.9441 15.6425 10.7761 15.6425Z" fill="#1A2B88"></path>
      </svg>`,
      label: 'Active Listings',
      value: activeListings.toString() // Display dynamic active listings count
    }
  ];
  
  const footerSections = [
    {
      title: 'Support',
      items: [
        'Toronto, ON',
        'dealspot@gmail.com',
      ]
    },
    {
      title: 'Account',
      items: ['My Account', 'Login / Register', 'Cart', 'Wishlist', 'Shop']
    },
    {
      title: 'Quick Link',
      items: ['Privacy Policy', 'Terms Of Use', 'FAQ', 'Contact']
    }
  ];
  
  const HamburgerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
  
  return (
    <>
      {/* Hamburger Icon */}
      <div 
        className={styles.hamburgerIcon} 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <HamburgerIcon />
      </div>
  
      {/* Main App Content */}
      <div className={styles.app}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Spartan:wght@400;500;700&display=swap" rel="stylesheet" />
        
        {/* Header */}
        <Header {...headerProps} />
        <div className={styles.divider} />
  
        {/* Main Layout */}
        <div className={styles.mainLayout}>
          <Sidebar 
            isVisible={isSidebarOpen}  
            onClose={() => setIsSidebarOpen(false)} 
          />
          <main className={styles.mainContent}>
            {/* Title for Product Listings */}
            <h2 className={styles.productTitle}>My Product(s)</h2>
            <div className={styles.productsContainer}> {/* New container for the white box */}
              <div className={styles.productList}>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <div key={index} className={styles.productItem}>
                      <span className={styles.productName}>{product.name}</span>
                      <div className={styles.iconButtons}>
                        <button 
                          className={styles.deleteButton} 
                          onClick={() => handleDeleteListing(product.id)}
                          aria-label="Delete listing" // Accessibility improvement
                        >
                          🗑️
                        </button>
                        <button 
                          className={styles.editButton} 
                          onClick={() => handleEditListing(product.id)} // Navigate to edit page
                          aria-label="Edit listing" // Accessibility improvement
                        >
                          ✏️
                        </button>
                      </div>
                      <hr className={styles.separator} />
                    </div>
                  ))
                ) : (
                  <p>No products found.</p>
                )}
              </div>
            </div>
            <div className={styles.statsCards}>
              {statCards.map((card, index) => (
                <StatCard key={index} {...card} />
              ))}
            </div>
          </main>
        </div>
  
        {/* Footer */}
        <Footer sections={footerSections} />
      </div>
    </>
  );
};

export default Dashboard;