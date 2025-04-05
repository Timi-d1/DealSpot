import React, { useState, useEffect } from 'react';
import styles from './DeliveryOptions.module.css';
/*************************************************************************** */ 
interface DeliveryOptionsProps {
    onDeliverySelect: (deliveryOptions: string[]) => void;
    initialSelected?: string[];     /*The initial save state of the product to the database*/ 
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ 
    onDeliverySelect, 
    initialSelected = [] 
}) => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelected);

    useEffect(() => {
        onDeliverySelect(selectedOptions);
    }, [selectedOptions]);
/*************************************************************************** */ 
    const options = [
        { id: "selfPickup", label: "Self pickup" },
        { id: "onlinePayment", label: "Online payment" },
        { id: "cashOnDelivery", label: "Courier cash on delivery" }
    ];

    const handleCheckboxChange = (optionId: string) => {
        setSelectedOptions(prev => 
            prev.includes(optionId) 
                ? prev.filter(item => item !== optionId) 
                : [...prev, optionId]
        );
    };

    return (
        <div className={styles.deliveryOptions}>
            <h2 className={styles.sectionTitle}>Delivery options</h2>
            <div className={styles.optionList}>
                {options.map(option => (
                    <label key={option.id} className={styles.optionItem}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={selectedOptions.includes(option.id)}
                            onChange={() => handleCheckboxChange(option.id)}
                        />
                        <span className={styles.optionText}>{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default DeliveryOptions;