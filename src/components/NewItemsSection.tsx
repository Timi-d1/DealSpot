import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import styles from "./NewItemsSection.module.css";

interface Product {
  images: string[];
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  description: string;
  category: string[];
  seller: { name: string; id: string };
  number_of_units: number;
  dimensions: { length: number; width: number; height: number };
  delivery_option: string[];
  sellerLocation: string; // ✅ Changed 'location' to 'sellerLocation' for consistency
}

interface NewItemsSectionProps {
  subcategory?: string;
  searchQuery?: string;
}

const NewItemsSection: React.FC<NewItemsSectionProps> = ({ subcategory, searchQuery = "" }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    let url = "http://127.0.0.1:5001/api/listings";
    if (searchQuery.trim()) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const formattedProducts = data
          .filter((item: any) => {
            // Only filter by search if a search query exists
            if (!searchQuery.trim()) return true;
            
            const query = searchQuery.toLowerCase();
            const matchesSearch = item.product_name?.toLowerCase().includes(query);
            const matchesCategory = item.category?.some((cat: string) => cat.toLowerCase().includes(query));
            
            return matchesSearch || matchesCategory;
          })
          .map((item: any) => ({
            images: item.photos || ["https://via.placeholder.com/150"],
            name: item.product_name || "Unnamed Product",
            price: item.initial_price || 0,
            originalPrice: item.original_price || undefined,
            rating: item.rating || 0,
            description: item.description || "No description available",
            category: item.category || [],
            seller: { 
              name: item.seller_name || "Unknown Seller", 
              id: item.seller_id || "unknown" 
            },
            number_of_units: item.number_of_units || 0,
            dimensions: item.dimensions || { length: 0, width: 0, height: 0 },
            delivery_option: item.delivery_option || [],
            sellerLocation: item.location || "Location not available", // ✅ Fixed naming
          }));
        
        setProducts(formattedProducts);
      })
      .catch((error) => {
        console.error("Error fetching listings:", error);
      })
      .finally(() => setLoading(false));
  }, [searchQuery]); // Ensure re-fetching on search change

  const filteredProducts = subcategory
    ? products.filter((product) => product.category.includes(subcategory))
    : products;

  return (
    <section className={styles.newItemsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.indicator} />
        <h2 className={styles.sectionTitle}>New Items</h2>
      </div>
      <div className={styles.productGrid}>
        {loading ? (
          <p>Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <ProductCard key={index} {...product} sellerLocation={product.sellerLocation} images={product.images} />
          ))
        ) : (
          <p>No products found in this category.</p>
        )}
      </div>
    </section>
  );
};

export default NewItemsSection;