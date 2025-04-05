import React, { useState } from 'react';
import styles from './CategorySection.module.css';

interface CategoryItemProps {
  name: string;
  onClick: (subcategory: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ name, onClick }) => {
  return (
    <div onClick={() => onClick(name)} className={styles.categoryItem}>
      <div className={styles.categoryName}>{name}</div>
    </div>
  );
};

const categories = {
  "Phones and accessories": ["Smartphones", "Smartwatches", "Tablets", "Accessories GSM", "Cases and covers"],
  "Minor appliances": ["Kitchen, cooking", "Hygiene and care", "For home", "Vacuum cleaners"],
  "Computers": ["Laptops", "Laptop components", "Desktop Computers", "Computer components", "Printers and scanners"],
  "TVs and accessories": ["TVs", "Projectors", "Headphones", "Audio for home", "Home cinema"],
  "Built-in appliances": ["Hotplates", "Built-in ovens", "Built-in dishwashers", "Hoods"],
  "Consoles and slot machines": ["Consoles PlayStation 5", "Consoles Xbox Series X/S", "Consoles PlayStation 4", "Consoles Xbox One", "Consoles Nintendo Switch"],
  "Photography": ["Digital cameras", "Lenses", "Photo accessories", "Instant cameras (Instax, Polaroid)"]
};

const CategorySection: React.FC<{ onSubcategorySelect: (subcategory: string) => void }> = ({ onSubcategorySelect }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <section className={styles.categorySection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Browse By Category</h2>
      </div>
      {/* Add this container div */}
      <div className={styles.buttonContainer}>
        {Object.entries(categories).map(([category, subcategories]) => (
          <div key={category}>
            <button 
              className={styles.categoryButton} 
              data-tour-id="category"
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            >
              {category}
            </button>
            {expandedCategory === category && (
              <div className={styles.categoryList}>
                {subcategories.map((subcategory, index) => (
                  <CategoryItem key={index} name={subcategory} onClick={onSubcategorySelect} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
export default CategorySection;