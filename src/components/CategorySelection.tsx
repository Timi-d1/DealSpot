import React, { useState, useEffect } from 'react';
import styles from './CategorySelection.module.css';

interface Category {
    name: string;
    subcategories: string[];
}

const categories: Category[] = [
    { name: 'Phones and accessories', subcategories: ['Smartphones', 'Smartwatches', 'Tablets', 'Accessories GSM', 'Cases and covers'] },
    { name: 'Minor appliances', subcategories: ['Kitchen, cooking', 'Hygiene and care', 'For home', 'Vacuum cleaners'] },
    { name: 'Computers', subcategories: ['Laptops', 'Laptop components', 'Desktop Computers', 'Computer components', 'Printers and scanners'] },
    { name: 'Appliances', subcategories: ['Fridges', 'Washing machines', 'Clothes dryers', 'Free-standing kitchens'] },
    { name: 'TVs and accessories', subcategories: ['TVs', 'Projectors', 'Headphones', 'Audio for home', 'Home cinema'] },
    { name: 'Built-in appliances', subcategories: ['Hotplates', 'Built-in ovens', 'Built-in dishwashers', 'Hoods'] },
    { name: 'Consoles and slot machines', subcategories: ['Consoles PlayStation 5', 'Consoles Xbox Series X/S', 'Consoles PlayStation 4', 'Consoles Xbox One', 'Consoles Nintendo Switch'] },
    { name: 'Photography', subcategories: ['Digital cameras', 'Lenses', 'Photo accessories', 'Instant cameras (Instax, Polaroid)'] }
];

interface CategorySelectionProps {
    onCategorySelect: (categories: string[]) => void;
    initialSelected?: string[];
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ onCategorySelect,   initialSelected = []  }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelected);

    const handleCategoryChange = (subcategory: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(subcategory)) {
                return prev.filter(cat => cat !== subcategory);
            } else if (prev.length < 3) {
                return [...prev, subcategory];
            } else {
                return prev;
            }
        });
    };
   
    useEffect(() => {
        onCategorySelect(selectedCategories);
    }, [selectedCategories]);

    const handleCategoryClick = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category) 
                : [...prev, category]
        );
    };

    return (
        <div className={styles.categorySelection}>
            <h2 className={styles.sectionTitle}>Select the category your goods belong to (max. 3)</h2>
            <div className={styles.categoriesGrid}>
                {categories.map(category => (
                    <div key={category.name} className={styles.categoryColumn}>
                        <h3 className={styles.categoryName}>{category.name}</h3>
                        <ul className={styles.subcategoryList}>
                            {category.subcategories.map(subcategory => (
                                <li key={subcategory} className={styles.subcategoryItem}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={selectedCategories.includes(subcategory)}
                                            onChange={() => handleCategoryChange(subcategory)}
                                            disabled={!selectedCategories.includes(subcategory) && selectedCategories.length >= 3}
                                        />
                                        <span className={styles.checkboxText}>{subcategory}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className={styles.selectedCategories}>
                <h3 className={styles.selectedTitle}>Selected categories:</h3>
                <div className={styles.categoryChips}>
                    {selectedCategories.map(subcategory => (
                        <span key={subcategory} className={styles.categoryChip}>
                            {subcategory}
                            <button className={styles.removeChip} onClick={() => handleCategoryChange(subcategory)}> ✖ </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategorySelection;