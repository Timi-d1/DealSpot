from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow frontend to make requests


class ProductManager:
    def __init__(self):
        # Initialize Firebase
        try:
            # Try to get existing app
            self.app = firebase_admin.get_app()
        except ValueError:
            # If no app exists, initialize
            cred = credentials.Certificate("./serviceAccountKey.json")
            self.app = firebase_admin.initialize_app(cred)

        self.db = firestore.client()

    def check_duplicate(self, product):
        """Check if a product already exists in the database"""
        posts_ref = self.db.collection("post")
        query = (
            posts_ref.where(filter=firestore.FieldFilter("name", "==", product["name"]))
            .where(
                filter=firestore.FieldFilter(
                    "description", "==", product["description"]
                )
            )
            .where(filter=firestore.FieldFilter("price", "==", product["price"]))
            .where(filter=firestore.FieldFilter("category", "==", product["category"]))
            .get()
        )
        return len(query) > 0

    def add_test_products(self):
        """Add sample products to Firebase for testing"""
        test_products = [
            {
                "name": "RTX 3060",
                "description": "Graphics card with 12GB GDDR6 memory",
                "price": 299.99,
                "category": "Computer Parts",
                "upload_date": datetime.now(),
            },
            {
                "name": "Gaming Laptop",
                "description": "15.6 inch gaming laptop with RTX graphics",
                "price": 999.99,
                "category": "Computers",
                "upload_date": datetime.now(),
            },
            {
                "name": "Gaming Mouse",
                "description": "RGB gaming mouse with 16000 DPI sensor",
                "price": 49.99,
                "category": "Computer Parts",
                "upload_date": datetime.now(),
            },
        ]

        added_count = 0
        skipped_count = 0

        for product in test_products:
            if not self.check_duplicate(product):
                self.db.collection("post").add(product)
                added_count += 1
                print(f"Added new product: {product['name']}")
            else:
                skipped_count += 1
                print(f"Skipped duplicate product: {product['name']}")

        print(f"\nSummary:")
        print(f"- Added {added_count} new products")
        print(f"- Skipped {skipped_count} duplicate products")

    def search_products(self, query):
        """Search products by name, description, or category"""
        print(f"\nSearching for: '{query}'")
        products_ref = self.db.collection("post")
        products = products_ref.get()

        results = []
        query = query.lower()

        for product in products:
            data = product.to_dict()
            if data:  # Check if product data exists
                if (
                    query in data.get("name", "").lower()
                    or query in data.get("description", "").lower()
                    or query in data.get("category", "").lower()
                ):
                    data["id"] = product.id
                    results.append(data)
                    print(f"\nFound: {data.get('name')}")
                    print(f"Category: {data.get('category')}")
                    print(f"Description: {data.get('description')}")
                    print(f"Price: ${data.get('price')}")

        print(f"\nFound {len(results)} matches")
        return results

    def get_latest_products(self, limit=10):
        """Get most recent products"""
        print(f"\nFetching {limit} latest products")
        products = (
            self.db.collection("post")
            .order_by("upload_date", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .get()
        )

        results = []
        for product in products:
            data = product.to_dict()
            if data:
                data["id"] = product.id
                results.append(data)
                print(f"\nProduct: {data.get('name')}")
                print(f"Category: {data.get('category')}")
                print(f"Price: ${data.get('price')}")

        return results


# Flask Routes
@app.route("/api/search", methods=["GET"])
def search():
    """API endpoint for search"""
    query = request.args.get("q", "")
    pm = ProductManager()
    results = pm.search_products(query)
    return jsonify(results)


@app.route("/api/products/latest", methods=["GET"])
def latest_products():
    """API endpoint for latest products"""
    limit = request.args.get("limit", 10, type=int)
    pm = ProductManager()
    results = pm.get_latest_products(limit)
    return jsonify(results)


@app.route("/api/test", methods=["GET"])
def test_products():
    """API endpoint to add test products"""
    pm = ProductManager()
    pm.add_test_products()
    return jsonify({"message": "Test products processed"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
