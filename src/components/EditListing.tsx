import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CategorySelection from './CategorySelection';
import DeliveryOptions from './DeliveryOptions';
import styles from './EditListing.module.css';

interface ListingData {
    product_name: string;
    description: string;
    number_of_units: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    initial_price: number;
    category: string[];
    photos: string[];
    delivery_option: string[];
}

const EditListing: React.FC = () => {
    const navigate = useNavigate();
    const { listingId } = useParams<{ listingId: string }>();
    const [listingData, setListingData] = useState<ListingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListingData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5001/api/listings/${listingId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch listing data');
                }
                const data: ListingData = await response.json();
                setListingData({
                    ...data,
                    dimensions: data.dimensions || { length: 0, width: 0, height: 0 }
                });
                setLoading(false);
            } catch (err) {
                setError('Error fetching listing data');
                setLoading(false);
                console.error('Fetch error:', err);
            }
        };
        if (listingId) fetchListingData();
    }, [listingId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listingData) return;

        try {
            const response = await fetch(`http://127.0.0.1:5001/api/update_listing/${listingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listingData),
            });
            if (!response.ok) {
                throw new Error('Update failed');
            }
            navigate('/dashboard');
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update listing');
        }
    };

    const validatePositiveNumber = (value: string): number => {
        const num = parseFloat(value);
        if (isNaN(num)) return 0; 
        return Math.max(0, num); 
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!listingData) return <div>No listing data found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.titleContainer}>
                <h1 className={styles.pageTitle}>Edit Listing</h1>
            </div>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.formGrid}>
                    <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Product Name:</label>
                        <input
                            className={styles.textInput}
                            type="text"
                            value={listingData.product_name}
                            onChange={(e) => setListingData({ ...listingData, product_name: e.target.value })}
                        />
                    </div>
                    <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Description:</label>
                        <textarea
                            className={styles.textareaInput}
                            value={listingData.description}
                            onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
                        />
                    </div>
                    <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Dimensions (mm):</label>
                        <div className={styles.dimensionFields}>
                            <input
                                className={styles.smallInput}
                                type="number"
                                placeholder="Length"
                                value={listingData.dimensions.length}
                                onChange={(e) =>
                                    setListingData({
                                        ...listingData,
                                        dimensions: {
                                            ...listingData.dimensions,
                                            length: validatePositiveNumber(e.target.value),
                                        },
                                    })
                                }
                            />
                            <input
                                className={styles.smallInput}
                                type="number"
                                placeholder="Width"
                                value={listingData.dimensions.width}
                                onChange={(e) =>
                                    setListingData({
                                        ...listingData,
                                        dimensions: {
                                            ...listingData.dimensions,
                                            width: validatePositiveNumber(e.target.value),
                                        },
                                    })
                                }
                            />
                            <input
                                className={styles.smallInput}
                                type="number"
                                placeholder="Height"
                                value={listingData.dimensions.height}
                                onChange={(e) =>
                                    setListingData({
                                        ...listingData,
                                        dimensions: {
                                            ...listingData.dimensions,
                                            height: validatePositiveNumber(e.target.value),
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Price:</label>
                        <input
                            className={styles.textInput}
                            type="number"
                            value={listingData.initial_price}
                            onChange={(e) =>
                                setListingData({
                                    ...listingData,
                                    initial_price: validatePositiveNumber(e.target.value),
                                })
                            }
                        />
                    </div>
                    <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Stock Quantity:</label>
                        <input
                            className={styles.textInput}
                            type="number"
                            value={listingData.number_of_units}
                            onChange={(e) =>
                                setListingData({
                                    ...listingData,
                                    number_of_units: validatePositiveNumber(e.target.value),
                                })
                            }
                        />
                    </div>
                </div>
                <div className={styles.categorySelection}>
                    <CategorySelection
                        initialSelected={listingData.category}
                        onCategorySelect={(selected) => setListingData({ ...listingData, category: selected })}
                    />
                </div>
                <div className={styles.deliveryOptions}>
                    <DeliveryOptions
                        initialSelected={listingData.delivery_option}
                        onDeliverySelect={(selected) => setListingData({ ...listingData, delivery_option: selected })}
                    />
                </div>
                <div className={styles.buttonContainer}>
                    <button className={styles.postButton} type="submit">Save Changes</button>
                    <button className={styles.goToDashboardButton} type="button" onClick={() => navigate('/dashboard')}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditListing;