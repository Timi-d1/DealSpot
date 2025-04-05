import React from 'react';
import styles from './Dashboard.module.css';

interface Product {
  image: string;
}

interface ProductsSectionProps {
  products: Product[];
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ products }) => {
  return (
    <section className={styles.productsSection}>
      <h2 className={styles.sectionHeader}>Your Products</h2>
      <div className={styles.sectionContent}>
        <div className={styles.productsTable}>
          {products.map((product, index) => (
            <div key={index} className={styles.productRow}>
              <img 
                src={product.image} 
                alt={`Product ${index + 1}`} 
                className={styles.productImage}
              />
              <div className={styles.iconButtons}>
                <button className={styles.editButton}>✏️ Edit</button>
                <button className={styles.deleteButton}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};;

export default ProductsSection;