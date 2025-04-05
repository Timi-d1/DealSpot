import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AddListing.module.css';
import ProgressBar from './ProgressBar';
import CategorySelection from './CategorySelection';
import PhotoUpload, { UploadedPhoto } from './PhotoUpload';
import ProductDetails from './ProductDetails';
import DeliveryOptions from './DeliveryOptions';

const AddListing: React.FC = () => {
    const navigate = useNavigate();
    const { listingId } = useParams<{ listingId: string }>();
    
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        product_name: "",
        description: "",
        number_of_units: "",
        dimensions: { length: "", width: "", height: "" },
        initial_price: "",
        category: [],
        photos: [],
        delivery_option: []
    });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if (listingId) {
            const fetchListingData = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:5001/api/listings/${listingId}`);
                    const data = await response.json();
                    if (response.ok) {
                        setFormData(data);
                    } else {
                        alert(data.error || "Failed to fetch listing data.");
                    }
                } catch (error) {
                    alert("Error fetching listing data.");
                }
            };
            fetchListingData();
        }
    }, [listingId]);

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

    const handlePostListing = async () => {
        if (!formData.initial_price || Number(formData.initial_price) <= 0) {
            alert("Initial price must be greater than zero!");
            return;
        }

        const payload = {
            ...formData,
            initial_price: Number(formData.initial_price),
            number_of_units: Number(formData.number_of_units),
            seller_id: sellerId(),
            photos: formData.photos.map(photo => photo.url),
        };

        console.log("🚀 Final payload sent to Flask:", payload);

        try {
            const response = await fetch('http://127.0.0.1:5001/api/add_listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                navigate("/dashboard");
                window.location.reload();
            } else {
                alert(result.error || "An error occurred");
            }
        } catch (error) {
            alert("Failed to post listing.");
        }
    };

    return (
        <div className={styles.sellerDashboard}>
            <div className={styles.titleContainer}>
                <h1 className={styles.pageTitle}>Add Listing</h1>
            </div>
            <button className={styles.goToDashboardButton} onClick={() => window.location.href = "/dashboard"}>Dashboard</button>
            <ProgressBar />
            <CategorySelection onCategorySelect={(categories) => setFormData(prev => ({ ...prev, category: categories }))} />
            <PhotoUpload onPhotosUpload={(photos) => setFormData(prev => ({ ...prev, photos }))} />
            <ProductDetails
                onProductDetailsChange={(details) => setFormData(prev => ({
                    ...prev,
                    ...details,
                    number_of_units: String(details.number_of_units),
                    initial_price: String(details.initial_price),
                    dimensions: {
                        ...prev.dimensions,
                        ...(details.dimensions && {
                            length: String(details.dimensions.length ?? prev.dimensions.length),
                            width: String(details.dimensions.width ?? prev.dimensions.width),
                            height: String(details.dimensions.height ?? prev.dimensions.height)
                        })
                    }
                }))}
            />
            <DeliveryOptions onDeliverySelect={(deliveryOptions) => setFormData(prev => ({ ...prev, delivery_option: deliveryOptions }))} />
            <button className={styles.postButton} onClick={handlePostListing}>Post</button>
        </div>
    );
};

export default AddListing;