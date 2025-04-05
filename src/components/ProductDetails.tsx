import React, { useState, useEffect } from 'react';
import styles from './ProductDetails.module.css';


interface ProductDetailsProps {
    onProductDetailsChange: (details: {
        product_name: string;
        description: string;
        number_of_units: number | "";
        initial_price: number | "";
        dimensions?: { length: number | ""; width: number | ""; height: number | ""; };
    }) => void;
    initialData?: {
        product_name: string;
        description: string;
        number_of_units: number | "";
        initial_price: number | "";
        dimensions?: { length: number | ""; width: number | ""; height: number | ""; };
    };
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ 
    onProductDetailsChange,
    initialData
}) => {
    const [productName, setProductName] = useState(initialData?.product_name || "");
    const [productDescription, setProductDescription] = useState(initialData?.description || "");
    const [unitsAvailable, setUnitsAvailable] = useState<number | "">(initialData?.number_of_units || "");
    const [length, setLength] = useState<number | "">(initialData?.dimensions?.length || "");
    const [width, setWidth] = useState<number | "">(initialData?.dimensions?.width || "");
    const [height, setHeight] = useState<number | "">(initialData?.dimensions?.height || "");
    const [initialPrice, setInitialPrice] = useState<number | "">(initialData?.initial_price || "");

    const maxProductNameLength = 60;
    const maxProductDescriptionLength = 1200;

    // Fixed type definition for setter parameter
    const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<number | "">>) => 
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value === "" ? "" : Math.max(0, Number(event.target.value));
            setter(value);
        };

    useEffect(() => {
        onProductDetailsChange({
            product_name: productName,
            description: productDescription,
            number_of_units: unitsAvailable,
            initial_price: initialPrice,
            dimensions: { length, width, height },
        });
    }, [productName, productDescription, unitsAvailable, initialPrice, length, width, height, onProductDetailsChange]);

    return (
        <div className={styles.productDetails}>
            <h2 className={styles.sectionTitle}>Fill in the basic information about your item</h2>
            <div className={styles.formGrid}>
                <div className={styles.formField}>
                    <label htmlFor="productName" className={styles.fieldLabel}>Product name</label>
                    <input 
                        type="text" 
                        id="productName" 
                        className={styles.textInput} 
                        value={productName} 
                        onChange={(e) => setProductName(e.target.value.slice(0, maxProductNameLength))} 
                        placeholder="Enter product name" 
                    />
                    <span className={styles.characterCount}>{productName.length}/{maxProductNameLength}</span>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="unitsAvailable" className={styles.fieldLabel}>Number of units available</label>
                    <input 
                        type="number" 
                        id="unitsAvailable" 
                        className={`${styles.textInput} ${styles.smallInput}`} 
                        value={unitsAvailable} 
                        onChange={handleNumberChange(setUnitsAvailable)} 
                        placeholder="Availability" 
                    />
                </div>
            </div>
            <div className={styles.descriptionSection}>
                <div className={styles.descriptionField}>
                    <label htmlFor="productDescription" className={styles.fieldLabel}>Description</label>
                    <textarea 
                        id="productDescription" 
                        className={styles.textareaInput} 
                        rows={6} 
                        value={productDescription} 
                        onChange={(e) => setProductDescription(e.target.value.slice(0, maxProductDescriptionLength))} 
                        placeholder="Enter product description" 
                    />
                    <span className={styles.characterCount}>{productDescription.length}/{maxProductDescriptionLength}</span>
                </div>
                <div className={styles.dimensionsSection}>
                    <h3 className={styles.subsectionTitle}>Dimensions (optional)</h3>
                    <div className={styles.dimensionFields}>
                        <div className={styles.dimensionField}>
                            <label htmlFor="length" className={styles.fieldLabel}>Length [mm]</label>
                            <input 
                                type="number" 
                                id="length" 
                                className={`${styles.numberInput} ${styles.smallInput}`} 
                                value={length} 
                                onChange={handleNumberChange(setLength)} 
                            />
                        </div>
                        <div className={styles.dimensionField}>
                            <label htmlFor="width" className={styles.fieldLabel}>Width [mm]</label>
                            <input 
                                type="number" 
                                id="width" 
                                className={`${styles.numberInput} ${styles.smallInput}`} 
                                value={width} 
                                onChange={handleNumberChange(setWidth)} 
                            />
                        </div>
                        <div className={styles.dimensionField}>
                            <label htmlFor="height" className={styles.fieldLabel}>Height [mm]</label>
                            <input 
                                type="number" 
                                id="height" 
                                className={`${styles.numberInput} ${styles.smallInput}`} 
                                value={height} 
                                onChange={handleNumberChange(setHeight)} 
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.priceField}>
                <label htmlFor="initialPrice" className={styles.fieldLabel}>Initial price</label>
                <input 
                    type="number" 
                    id="initialPrice" 
                    className={`${styles.numberInput} ${styles.smallInput}`} 
                    value={initialPrice} 
                    onChange={handleNumberChange(setInitialPrice)} 
                    placeholder="Product price" 
                />
            </div>
        </div>
    );
};

export default ProductDetails;