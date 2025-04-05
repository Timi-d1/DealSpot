from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import uuid
import smtplib
from email.mime.text import MIMEText
import time
from email.mime.multipart import MIMEMultipart
from firebase_admin.firestore import FieldFilter
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
CORS(app)

# Initialize Firebase only if not already initialized
try:
    cred = credentials.Certificate("./serviceAccountKey.json")
    firebase_app = firebase_admin.initialize_app(cred)
except ValueError:
    # App already initialized
    firebase_app = firebase_admin.get_app()

db = firestore.client()

SMTP_CONFIG = {
    "server": "smtp.gmail.com",
    "port": 465,
    "username": "dealspotyorku@gmail.com",
    "password": "xlvd jtab flvs oqdd"
}

# Email sending functionality --> Parmoun added for checkin 3

def send_email(to_email: str, subject: str, body: str) -> bool:
    msg = MIMEMultipart()
    msg['From'] = SMTP_CONFIG['username']
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # SSL config non blocking
        with smtplib.SMTP_SSL(SMTP_CONFIG['server'], SMTP_CONFIG['port']) as server:
            server.login(SMTP_CONFIG['username'], SMTP_CONFIG['password'])
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"SMTP Error: {str(e)}")
        return False
    
# Root endpoint to confirm the server is running
@app.route('/')
def index():
    return "Server is running!"

@app.route("/api/listings", methods=["GET"])
def get_listings():
    subcategory = request.args.get("subcategory")
    try:
        listings_ref = db.collection("listings").stream()
        listings = []
        
        for doc in listings_ref:
            listing_data = doc.to_dict()
            listing_data["id"] = doc.id
            
            # Add seller information
            if "seller_id" in listing_data:
                seller_id = listing_data["seller_id"]
                # Query the Users collection for the seller
                sellers_query = db.collection("Users").where("seller_id", "==", seller_id).limit(1).get()
                
                if sellers_query:
                    seller_doc = sellers_query[0]
                    seller_data = seller_doc.to_dict()
                    listing_data["seller_name"] = seller_data.get("name", "Unknown Seller")
            
            listings.append(listing_data)
            
        if subcategory:
            listings = [listing for listing in listings if subcategory in listing.get("category", [])]
        return jsonify(listings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Signup Endpoint
@app.route("/signup", methods=["POST"])
def signup():
    try:
        print("Signup attempt received")
        data = request.json
        print(f"Signup data: {data}")  # Log the received signup data

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")
        location = data.get("location")

        if not name or not email or not password or not role:
            print("Missing required fields")
            return jsonify({"error": "All fields must be completed!"}), 400

        existing_user = db.collection("Users").where("email", "==", email).limit(1).get()
        if existing_user:
            print(f"Email already exists: {email}")
            return jsonify({"error": "An account with this email already exists!"}), 400

        # Generate a unique ID based on the role
        user_id = str(uuid.uuid4())
        hashed_password = generate_password_hash(password) 
        if role == "seller":
            user_data = {
                "name": name,
                "email": email,
                "password": hashed_password,
                "role": role,
                "location": location,
                "seller_id": user_id  # Store seller_id for sellers
            }
            print(f"Generated Seller ID: {user_id}")
        elif role == "buyer":
            user_data = {
                "name": name,
                "email": email,
                "password": hashed_password,
                "role": role,
                "location": location,
                "buyer_id": user_id  # Store buyer_id for buyers
            }
            print(f"Generated Buyer ID: {user_id}")
        else:
            return jsonify({"error": "Invalid role"}), 400

        # Save to Firestore (assuming `db.collection("Users")` is correctly set up)
        db.collection("Users").add(user_data)

        # Determine the user ID (either seller_id or buyer_id)
        user_id = user_data.get("seller_id") or user_data.get("buyer_id") or user_data.get('id')

        print(f"User created successfully: {email}")
        return jsonify({"message": "User was created successfully!", "user_data": user_data}), 201
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({"error": str(e)}), 500

# Login Endpoint
@app.route("/login", methods=["POST"])
def login():
    try:
        print("Login attempt received")
        data = request.json
        print(f"Login data: {data}")  # Log the received login data
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            print("Missing email or password")
            return jsonify({"error": "Email and password are required!"}), 400

        print(f"Searching for user with email: {email}")
        users_ref = db.collection("Users").where("email", "==", email).stream()
        user_doc = next(users_ref, None)

        if not user_doc:
            print(f"User not found: {email}")
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        print(f"User found: {user_data.get('name')}")

        if not check_password_hash(user_data.get("password", ""), password):
            print("Invalid password")
            return jsonify({"error": "Invalid password!"}), 401

        # Add user ID to the response
        user_data['id'] = user_doc.id
        
        # Ensure seller_id or buyer_id is included in the response
        if user_data.get("role") == "seller" and not user_data.get("seller_id"):
            # If seller_id is missing, generate a new one
            seller_id = str(uuid.uuid4())
            user_data["seller_id"] = seller_id
            
            # Update the user document with the new seller_id
            db.collection("Users").document(user_doc.id).update({"seller_id": seller_id})
            print(f"Generated and updated seller_id: {seller_id} for user: {user_data.get('name')}")
        
        # Determine the user ID (either seller_id or buyer_id)
        user_id = user_data.get("seller_id") or user_data.get("buyer_id") or user_data['id']

        print("Login successful")
        
        # Send back user details with the determined user ID
        return jsonify({
            "message": "Login was successful!",
            "user": {
                "id": user_id,  # Use seller_id or buyer_id if they exist
                "name": user_data.get("name"),
                "role": user_data.get("role"),
            }
        }), 200
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": str(e)}), 500
    
#################### Reviews ############################
@app.route("/reviews", methods=["GET"])
def get_reviews():
    """Get all reviews for a seller"""
    try:
        print("Review retrieval attempt")
        seller_id = request.args.get("seller_id")
        
        if not seller_id:
            print("Missing seller ID")
            return jsonify({"error": "Seller ID is required"}), 400
            
        print(f"Retrieving reviews for seller: {seller_id}")
        # Query Firestore for reviews
        reviews = db.collection("Reviews").where("seller_id", "==", seller_id).stream()
        
        review_list = []
        for review in reviews:
            review_data = review.to_dict()
            review_data["id"] = review.id
            
            # If review doesn't have buyer_name already, fetch it
            if "buyer_name" not in review_data:
                buyer_id = review_data.get("buyer_id")
                if buyer_id:
                    buyer_query = db.collection("Users").where("buyer_id", "==", buyer_id).limit(1).get()
                    if len(buyer_query) > 0:
                        buyer_data = buyer_query[0].to_dict()
                        review_data["buyer_name"] = buyer_data.get("name", f"User {buyer_id}")
                    else:
                        review_data["buyer_name"] = f"User {buyer_id}"
                        
            review_list.append(review_data)
        
        print(f"Found {len(review_list)} reviews")
        return jsonify({"reviews": review_list}), 200
    except Exception as e:
        print(f"Error getting reviews: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/reviews", methods=["POST"])
def add_review():
    """Add a new review for a seller"""
    try:
        print("Review submission attempt")
        data = request.json
        print(f"Review data: {data}")
        
        buyer_id = data.get("buyer_id")
        seller_id = data.get("seller_id")
        rating = data.get("rating")
        comment = data.get("comment")
        
        if not buyer_id or not seller_id or not rating:
            print("Missing required fields")
            return jsonify({"error": "Buyer ID, seller ID, and rating are required"}), 400
        
        # Get buyer name from Users collection
        buyer_name = f"User {buyer_id}"  # Default fallback
        buyer_query = db.collection("Users").where("buyer_id", "==", buyer_id).limit(1).get()
        if len(buyer_query) > 0:
            buyer_data = buyer_query[0].to_dict()
            buyer_name = buyer_data.get("name", buyer_name)
        
        # Check if user has already reviewed this seller
        existing_reviews = db.collection("Reviews")\
            .where("buyer_id", "==", buyer_id)\
            .where("seller_id", "==", seller_id)\
            .get()
            
        if len(existing_reviews) > 0:
            return jsonify({"error": "You have already reviewed this seller"}), 400
            
        # Create review object
        review_data = {
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "rating": rating,
            "comment": comment,
            "created_at": firestore.SERVER_TIMESTAMP,
            "buyer_name": buyer_name  # Add buyer name to review data
        }
        
        # Add to Firestore
        review_ref = db.collection("Reviews").add(review_data)
        print(f"Review added successfully")
        
        # Update seller's average rating
        update_seller_rating(seller_id)
        
        return jsonify({"message": "Review added successfully", "review_id": review_ref[1].id}), 201
    except Exception as e:
        print(f"Error adding review: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/reviews/<review_id>", methods=["PUT"])
def update_review(review_id):
    """Update an existing review"""
    try:
        print(f"Review update attempt for review ID: {review_id}")
        data = request.json
        print(f"Update data: {data}")
        
        rating = data.get("rating")
        comment = data.get("comment")
        
        # Ensure the user owns this review (in production, check user authentication)
        buyer_id = data.get("buyer_id")
        
        if not review_id or not rating:
            print("Missing required fields")
            return jsonify({"error": "Review ID and rating are required"}), 400
            
        # Update the review
        review_ref = db.collection("Reviews").document(review_id)
        review = review_ref.get()
        
        if not review.exists:
            print(f"Review not found: {review_id}")
            return jsonify({"error": "Review not found"}), 404
            
        # Verify ownership (in production, check against authenticated user)
        review_data = review.to_dict()
        if review_data.get("buyer_id") != buyer_id:
            print("Unauthorized edit attempt")
            return jsonify({"error": "Unauthorized to edit this review"}), 403
            
        # Update fields
        update_data = {}
        if rating:
            update_data["rating"] = rating
        if comment:
            update_data["comment"] = comment
            
        review_ref.update(update_data)
        print(f"Review updated successfully: {review_id}")
        
        # Update seller's average rating
        update_seller_rating(review_data.get("seller_id"))
        
        return jsonify({"message": "Review updated successfully"}), 200
    except Exception as e:
        print(f"Error updating review: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/reviews/<review_id>", methods=["DELETE"])
def delete_review(review_id):
    """Delete a review"""
    try:
        print(f"Review deletion attempt for review ID: {review_id}")
        buyer_id = request.args.get("buyer_id")
        
        if not review_id or not buyer_id:
            print("Missing required fields")
            return jsonify({"error": "Review ID and buyer ID are required"}), 400
            
        # Get the review
        review_ref = db.collection("Reviews").document(review_id)
        review = review_ref.get()
        
        if not review.exists:
            print(f"Review not found: {review_id}")
            return jsonify({"error": "Review not found"}), 404
            
        # Verify ownership (in production, check against authenticated user)
        review_data = review.to_dict()
        if review_data.get("buyer_id") != buyer_id:
            print("Unauthorized deletion attempt")
            return jsonify({"error": "Unauthorized to delete this review"}), 403
            
        # Store seller_id for updating average
        seller_id = review_data.get("seller_id")
        
        # Delete the review
        review_ref.delete()
        print(f"Review deleted successfully: {review_id}")
        
        # Update seller's average rating
        update_seller_rating(seller_id)
        
        return jsonify({"message": "Review deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting review: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/reviews/summary", methods=["GET"])
def get_review_summary():
    """Get summary statistics for a seller's reviews"""
    try:
        print("Review summary retrieval attempt")
        seller_id = request.args.get("seller_id")
        
        if not seller_id:
            print("Missing seller ID")
            return jsonify({"error": "Seller ID is required"}), 400
            
        print(f"Calculating review summary for seller: {seller_id}")
        # Query Firestore for reviews
        reviews = db.collection("Reviews").where("seller_id", "==", seller_id).stream()
        
        review_list = []
        total_rating = 0
        ratings_count = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        
        for review in reviews:
            review_data = review.to_dict()
            review_data["id"] = review.id
            review_list.append(review_data)
            
            # Accumulate total rating
            rating = review_data.get("rating", 0)
            total_rating += rating
            
            # Count rating distribution
            if 1 <= rating <= 5:
                ratings_count[rating] += 1
        
        total_reviews = len(review_list)
        average_rating = total_rating / total_reviews if total_reviews > 0 else 0
        
        # Calculate percentages for each rating
        rating_percentages = {}
        for rating, count in ratings_count.items():
            rating_percentages[rating] = (count / total_reviews * 100) if total_reviews > 0 else 0
        
        summary = {
            "total_reviews": total_reviews,
            "average_rating": round(average_rating, 1),
            "rating_distribution": ratings_count,
            "rating_percentages": rating_percentages
        }
        
        print(f"Calculated review summary for {total_reviews} reviews")
        return jsonify({"summary": summary}), 200
    except Exception as e:
        print(f"Error getting review summary: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/reviews/check", methods=["GET"])
def check_user_reviewed_seller():
    """Check if a buyer has already reviewed a seller"""
    try:
        print("Review check attempt")
        buyer_id = request.args.get("buyer_id")
        seller_id = request.args.get("seller_id")
        
        if not buyer_id or not seller_id:
            print("Missing required fields")
            return jsonify({"error": "Both buyer_id and seller_id are required"}), 400
            
        # Query Firestore for reviews from this buyer for this seller
        reviews = db.collection("Reviews")\
            .where("buyer_id", "==", buyer_id)\
            .where("seller_id", "==", seller_id)\
            .limit(1)\
            .get()
        
        # Check if any reviews exist
        has_reviewed = len(reviews) > 0
        
        review_data = None
        if has_reviewed:
            review_doc = reviews[0]
            review_data = review_doc.to_dict()
            review_data["id"] = review_doc.id
            
        print(f"User {buyer_id} has reviewed seller {seller_id}: {has_reviewed}")
        return jsonify({
            "has_reviewed": has_reviewed,
            "review": review_data
        }), 200
    except Exception as e:
        print(f"Error checking review status: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/reviews/featured", methods=["GET"])
def get_featured_reviews():
    """Get featured reviews for a seller"""
    try:
        print("Featured reviews retrieval attempt")
        seller_id = request.args.get("seller_id")
        limit = request.args.get("limit", 3, type=int)
        
        if not seller_id:
            print("Missing seller ID")
            return jsonify({"error": "Seller ID is required"}), 400
            
        # Query Firestore for reviews, sorted by rating (highest first)
        reviews_query = db.collection("Reviews")\
            .where("seller_id", "==", seller_id)\
            .order_by("rating", direction=firestore.Query.DESCENDING)\
            .limit(limit)
            
        reviews = reviews_query.stream()
        
        featured_reviews = []
        for review in reviews:
            review_data = review.to_dict()
            review_data["id"] = review.id
            
            # If review doesn't have buyer_name, fetch it
            if "buyer_name" not in review_data:
                buyer_id = review_data.get("buyer_id")
                if buyer_id:
                    buyer_query = db.collection("Users").where("buyer_id", "==", buyer_id).limit(1).get()
                    if len(buyer_query) > 0:
                        buyer_data = buyer_query[0].to_dict()
                        review_data["buyer_name"] = buyer_data.get("name", f"User {buyer_id}")
                    else:
                        review_data["buyer_name"] = f"User {buyer_id}"
                
            featured_reviews.append(review_data)
        
        print(f"Found {len(featured_reviews)} featured reviews")
        return jsonify({"featured_reviews": featured_reviews}), 200
    except Exception as e:
        print(f"Error getting featured reviews: {e}")
        return jsonify({"error": str(e)}), 500

def update_seller_rating(seller_id):
    """Update seller's average rating"""
    try:
        print(f"Updating rating for seller: {seller_id}")
        reviews = db.collection("Reviews").where("seller_id", "==", seller_id).stream()
        
        total_rating = 0
        count = 0
        
        for review in reviews:
            review_data = review.to_dict()
            total_rating += review_data.get("rating", 0)
            count += 1
        
        if count > 0:
            avg_rating = total_rating / count
            
            # Update user record with average rating
            seller_docs = db.collection("Users").where("id", "==", seller_id).stream()
            seller_doc = next(seller_docs, None)
            
            if seller_doc:
                seller_ref = db.collection("Users").document(seller_doc.id)
                seller_ref.update({"avg_rating": avg_rating})
                print(f"Updated seller {seller_id} rating to {avg_rating}")
            else:
                # Try to find seller by document ID
                seller_ref = db.collection("Users").document(seller_id)
                if seller_ref.get().exists:
                    seller_ref.update({"avg_rating": avg_rating})
                    print(f"Updated seller {seller_id} rating to {avg_rating}")
                else:
                    print(f"Seller not found: {seller_id}")
        else:
            print(f"No reviews found for seller: {seller_id}")
    except Exception as e:
        print(f"Error updating seller rating: {e}")

#************************************ Listing related routes *****************************************#
@app.route("/api/seller_listings", methods=["GET"])
def get_seller_listings():
    try:
        seller_id = request.args.get("seller_id")
        if not seller_id:
            return jsonify({"error": "Seller ID is required!"}), 400

        listings_ref = db.collection("listings").where("seller_id", "==", seller_id).stream()
        listings = [
            {**doc.to_dict(), "id": doc.id} for doc in listings_ref
        ]
        return jsonify(listings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/seller_name", methods=["GET"])
def get_seller_name():
    try:
        seller_id = request.args.get("seller_id")
        if not seller_id:
            return jsonify({"error": "Seller ID is required"}), 400
            
        # Query the Users collection for the seller
        sellers_query = db.collection("Users").where("seller_id", "==", seller_id).get()
        
        print(f"Looking for seller with ID: {seller_id}")
        print(f"Found {len(sellers_query)} results")
        
        if len(sellers_query) > 0:
            seller_doc = sellers_query[0]
            seller_data = seller_doc.to_dict()
            seller_name = seller_data.get("name", "Unknown Seller")  # Default to "Unknown Seller"
            print(f"Found seller name: {seller_name}")
            return jsonify({"name": seller_name}), 200
        else:
            # If not found by seller_id, try document ID as fallback
            seller_doc = db.collection("Users").document(seller_id).get()
            if seller_doc.exists:
                seller_data = seller_doc.to_dict()
                seller_name = seller_data.get("name", "Unknown Seller")  # Default to "Unknown Seller"
                print(f"Found seller by document ID, name: {seller_name}")
                return jsonify({"name": seller_name}), 200
            
            print(f"Seller not found with ID: {seller_id}")
            return jsonify({"name": "Unknown Seller"}), 200  # Return "Unknown Seller" when no seller found
    except Exception as e:
        print(f"Error in get_seller_name: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/update_listing/<listing_id>', methods=['PUT'])
def update_listing(listing_id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data received"}), 400

        # Reference the listing document by ID
        listing_ref = db.collection("listings").document(listing_id)
        listing_ref.update(data)  # Update the document with new data
        return jsonify({"message": "Listing updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/listings/<listing_id>", methods=["GET"])
def get_listing_by_id(listing_id):
    try:
        listing_ref = db.collection("listings").document(listing_id)
        listing = listing_ref.get()
        if listing.exists:
            return jsonify(listing.to_dict()), 200
        else:
            return jsonify({"error": "Listing not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete_listing/<listing_id>', methods=['DELETE'])
def delete_listing(listing_id):
    try:
        print(f"Attempting to delete listing with ID: {listing_id}")  # Log the ID
        # Reference the listing document by ID
        listing_ref = db.collection("listings").document(listing_id)
        listing_ref.delete()  # Delete the document
        print(f"Successfully deleted listing with ID: {listing_id}")  # Log success
        return jsonify({"message": "Listing deleted successfully!"}), 200
    except Exception as e:
        print(f"Error deleting listing: {str(e)}")  # Log the error
        return jsonify({"error": str(e)}), 500

@app.route('/api/add_listing', methods=['POST'])
def add_listing():
    try:
        data = request.json
        print("Received data for listing:", data)

        required_fields = ["product_name", "description", "initial_price", "seller_id", "category", "photos", "delivery_option", "number_of_units"]
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        seller_id = data.get("seller_id")

        # Get seller details (including location)
        seller_query = db.collection("Users").where("seller_id", "==", seller_id).limit(1).get()
        if not seller_query:
            return jsonify({"error": "Invalid seller ID"}), 400

        seller_data = seller_query[0].to_dict()
        location = seller_data.get("location", "Unknown")

        # Include location in listing
        listing_data = {
            **data,
            "location": location
        }

        db.collection("listings").add(listing_data)
        return jsonify({"message": "Listing successfully posted!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#************************************ Listing related routes *****************************************#
    
#################### Messaging ############################
@app.route("/messages", methods=["GET"])
def get_messages():
    """Get messages between two users"""
    try:
        print("Message retrieval attempt")
        user_id = request.args.get("user_id")
        other_user_id = request.args.get("other_user_id")
        
        if not user_id:
            print("Missing user ID")
            return jsonify({"error": "User ID is required"}), 400
        
        print(f"Retrieving messages for user: {user_id}")
        
        # If other_user_id is provided, get conversation between the two users
        if other_user_id:
            print(f"Getting conversation with: {other_user_id}")
            
            # Query for messages where user_id is sender and other_user_id is receiver
            messages1 = db.collection("Messages")\
                .where("sender_id", "==", user_id)\
                .where("receiver_id", "==", other_user_id)\
                .stream()
            print(f"Message1:", messages1)
                
            # Query for messages where user_id is receiver and other_user_id is sender
            messages2 = db.collection("Messages")\
                .where("sender_id", "==", other_user_id)\
                .where("receiver_id", "==", user_id)\
                .stream()
            print(f"Message2:", messages2)
                
            # Combine and sort by timestamp
            message_list = []
            for message in messages1:
                message_data = message.to_dict()
                message_data["id"] = message.id
                message_list.append(message_data)
                
            for message in messages2:
                message_data = message.to_dict()
                message_data["id"] = message.id
                message_list.append(message_data)
                
            # Sort by timestamp
            message_list.sort(key=lambda x: x.get("timestamp", 0))
            
            print(f"Found {len(message_list)} messages")
            return jsonify({"messages": message_list}), 200
        
        # If only user_id is provided, get all conversations for that user
        else:
            print(f"Getting all conversations for user: {user_id}")
            
            # Get all messages where user is sender or receiver
            sent_messages = db.collection("Messages").where("sender_id", "==", user_id).stream()
            received_messages = db.collection("Messages").where("receiver_id", "==", user_id).stream()
            
            # Collect unique conversation partners
            conversation_partners = set()
            
            for message in sent_messages:
                conversation_partners.add(message.to_dict().get("receiver_id"))
                
            for message in received_messages:
                conversation_partners.add(message.to_dict().get("sender_id"))
            
            # For each partner, get the most recent message
            conversations = []
            
            for partner_id in conversation_partners:
                # Get latest message between user and partner
                latest_message = get_latest_message(user_id, partner_id)
                if latest_message:
                    # Get partner info
                    partner_info = get_user_details(partner_id)
                    partner_name = partner_info.get("name", f"User {partner_id}") if partner_info else f"User {partner_id}"
                    
                    conversations.append({
                        "partner_id": partner_id,
                        "partner_name": partner_name,
                        "latest_message": latest_message
                    })
            
            print(f"Found {len(conversations)} conversations")
            return jsonify({"conversations": conversations}), 200
            
    except Exception as e:
        print(f"Error getting messages: {e}")
        return jsonify({"error": str(e)}), 500

# Modified messages endpoint to implement email sending as well --> checkin 3 Parmoun
@app.route("/messages", methods=["POST"])
def send_message():
    """Send a message from one user to another"""
    try:
        data = request.json
        sender_id = data.get("sender_id")
        receiver_id = data.get("receiver_id")
        message = data.get("message")

        # Validate required fields
        if not sender_id or not receiver_id or not message:
            return jsonify({"error": "Missing required fields"}), 400

        # Find receiver document
        receiver_query = db.collection("Users").where(
            filter=FieldFilter("buyer_id", "==", receiver_id)
        ).limit(1).get()
        
        if not receiver_query:
            receiver_query = db.collection("Users").where(
                filter=FieldFilter("seller_id", "==", receiver_id)
            ).limit(1).get()

        if not receiver_query:
            print(f"Receiver {receiver_id} not found")
            return jsonify({"error": "Receiver not found"}), 404

        receiver_doc = receiver_query[0]
        receiver_data = receiver_doc.to_dict()
        receiver_email = receiver_data.get("email")
        
        if not receiver_email:
            print("Receiver email missing")
            return jsonify({"error": "Receiver email not found"}), 400

        # Get sender name
        sender_doc = db.collection("Users").document(sender_id).get()
        sender_name = sender_doc.to_dict().get("name", "A user") if sender_doc.exists else "A user"

        # Prepare email
        email_subject = "🔔 New Message Notification"
        email_body = f"""Hello {receiver_data.get('name', 'there')},

You've received a new message in your message box:

"{message}"

Sign in to DealSpot to continue the conversation.


Best regards,
DealSpot Team"""

        # Send email
        if send_email(receiver_email, email_subject, email_body):
            print("Email notification sent successfully")
        else:
            print("Email notification failed")

        # Save message to Firestore
        message_ref = db.collection("Messages").add({
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "message": message,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "read": False
        })

        return jsonify({"message": "Message sent successfully"}), 200

    except Exception as e:
        print(f"Message send error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/messages/seller", methods=["GET"])
def get_seller_messages():
    """Get messages for a seller from a specific buyer"""
    try:
        print("Seller message retrieval attempt")
        seller_id = request.args.get("seller_id")
        buyer_id = request.args.get("buyer_id")
        
        if not seller_id:
            print("Missing seller ID")
            return jsonify({"error": "Seller ID is required"}), 400
            
        print(f"Retrieving messages for seller: {seller_id}")
        
        # If buyer_id is provided, get conversation between seller and specific buyer
        if buyer_id:
            messages1 = db.collection("Messages")\
                .where("sender_id", "==", seller_id)\
                .where("receiver_id", "==", buyer_id)\
                .stream()
                
            messages2 = db.collection("Messages")\
                .where("sender_id", "==", buyer_id)\
                .where("receiver_id", "==", seller_id)\
                .stream()
                
            # Combine and sort by timestamp
            message_list = []
            for message in messages1:
                message_data = message.to_dict()
                message_data["id"] = message.id
                message_list.append(message_data)
                
            for message in messages2:
                message_data = message.to_dict()
                message_data["id"] = message.id
                message_list.append(message_data)
                
            # Sort by timestamp
            message_list.sort(key=lambda x: x.get("timestamp", 0))
            
            print(f"Found {len(message_list)} messages")
            return jsonify({"messages": message_list}), 200
        
        # If only seller_id is provided, get all buyer conversations for that seller
        else:
            # Get all messages where seller is sender or receiver
            sent_messages = db.collection("Messages").where("sender_id", "==", seller_id).stream()
            received_messages = db.collection("Messages").where("receiver_id", "==", seller_id).stream()
            
            # Collect unique conversation partners (buyers)
            buyer_partners = set()
            
            for message in sent_messages:
                buyer_partners.add(message.to_dict().get("receiver_id"))
                
            for message in received_messages:
                buyer_partners.add(message.to_dict().get("sender_id"))
            
            # For each buyer, get the most recent message
            conversations = []
            
            for buyer_id in buyer_partners:
                # Get latest message between seller and buyer
                latest_message = get_latest_message(seller_id, buyer_id)
                if latest_message:
                    # Get buyer details
                    buyer_info = get_user_details(buyer_id)
                    buyer_name = buyer_info.get("name", f"User {buyer_id}") if buyer_info else f"User {buyer_id}"
                    
                    conversations.append({
                        "buyer_id": buyer_id,
                        "buyer_name": buyer_name,
                        "latest_message": latest_message
                    })
            
            print(f"Found {len(conversations)} buyer conversations")
            return jsonify({"conversations": conversations}), 200
            
    except Exception as e:
        print(f"Error getting seller messages: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/messages/read", methods=["POST"])
def mark_messages_read():
    """Mark messages as read"""
    try:
        print("Mark messages read attempt")
        data = request.json
        user_id = data.get("user_id")
        sender_id = data.get("sender_id")
        
    
        if not user_id or not sender_id:
            print("Missing required fields")
            return jsonify({"error": "User ID and sender ID are required"}), 400
            
        # Find messages sent by sender_id to user_id that are unread
        messages = db.collection("Messages")\
            .where("sender_id", "==", sender_id)\
            .where("receiver_id", "==", user_id)\
            .where("read", "==", False)\
            .stream()
            
        updated_count = 0
        for message in messages:
            message_ref = db.collection("Messages").document(message.id)
            message_ref.update({"read": True})
            updated_count += 1
            
        print(f"Marked {updated_count} messages as read")
        return jsonify({"message": f"Marked {updated_count} messages as read"}), 200
    except Exception as e:
        print(f"Error marking messages as read: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/contacts", methods=["GET"])
def get_contacts():
    """Get all contacts or conversations for a user."""
    try:
        print("Contacts retrieval attempt")
        user_id = request.args.get("user_id")
        
        if not user_id:
            print("Missing user ID")
            return jsonify({"error": "User ID is required"}), 400
        
        print(f"Retrieving contacts for user: {user_id}")
        
        # Retrieve conversations or contacts for the user
        conversations = []
        sent_messages = db.collection("Messages").where("sender_id", "==", user_id).stream()
        received_messages = db.collection("Messages").where("receiver_id", "==", user_id).stream()
        
        # Collect unique contacts (sender or receiver)
        contact_ids = set()
        for message in sent_messages:
            contact_ids.add(message.to_dict().get("receiver_id"))
            print("Sent message:", message.to_dict())
        for message in received_messages:
            contact_ids.add(message.to_dict().get("sender_id"))
            print("Received message:", message.to_dict())
        
        print("Contact IDS:", contact_ids)
        
        # Get user details for each contact
        for contact_id in contact_ids:
            contact_details = get_user_details(contact_id)
            if contact_details:
                conversations.append({
                    "contact_id": contact_id,
                    "contact_name": contact_details.get("name", f"User {contact_id}")
                })
        
        print(f"Found {len(conversations)} contacts")
        return jsonify({"contacts": conversations}), 200
        
    except Exception as e:
        print(f"Error getting contacts: {e}")
        return jsonify({"error": str(e)}), 500

def get_latest_message(user_id, partner_id):
    """Get the most recent message between two users"""
    try:
        # Query for messages where user_id is sender and partner_id is receiver
        messages1 = db.collection("Messages")\
            .where("sender_id", "==", user_id)\
            .where("receiver_id", "==", partner_id)\
            .order_by("timestamp", direction=firestore.Query.DESCENDING)\
            .limit(1)\
            .get()
            
        # Query for messages where user_id is receiver and partner_id is sender
        messages2 = db.collection("Messages")\
            .where("sender_id", "==", partner_id)\
            .where("receiver_id", "==", user_id)\
            .order_by("timestamp", direction=firestore.Query.DESCENDING)\
            .limit(1)\
            .get()
            
        # Get the latest message from both queries
        latest_message = None
        latest_timestamp = 0
        
        for message in messages1:
            message_data = message.to_dict()
            message_timestamp = message_data.get("timestamp", 0)
            
            if message_timestamp > latest_timestamp:
                latest_timestamp = message_timestamp
                latest_message = message_data
                latest_message["id"] = message.id
                
        for message in messages2:
            message_data = message.to_dict()
            message_timestamp = message_data.get("timestamp", 0)
            
            if message_timestamp > latest_timestamp:
                latest_timestamp = message_timestamp
                latest_message = message_data
                latest_message["id"] = message.id
                
        return latest_message
    except Exception as e:
        print(f"Error getting latest message: {e}")
        return None

def get_user_details(user_id):
    """Get user details by ID"""
    try:
        print(f"user_id", user_id)
        
        # Check query for seller_id
        user_docs = db.collection("Users").where("seller_id", "==", user_id).stream()
        user_doc = next(user_docs, None)
        if user_doc:
            print(f"Found user with seller_id: {user_doc.to_dict()}")
        else:
            print("No user found with seller_id.")
        
        if user_doc:
            return user_doc.to_dict()

        # If no seller_id found, check by buyer_id
        user_docs = db.collection("Users").where("buyer_id", "==", user_id).stream()
        user_doc = next(user_docs, None)
        if user_doc:
            print(f"Found user with buyer_id: {user_doc.to_dict()}")
        else:
            print("No user found with buyer_id.")
        
        if user_doc:
            return user_doc.to_dict()

        # If neither buyer_id nor seller_id works, try by document ID
        user_doc = db.collection("Users").document(user_id)
        user = user_doc.get()
        if user.exists:
            print(f"Found user by document ID: {user.to_dict()}")
            return user.to_dict()
        else:
            print(f"User not found: {user_id}")
            return None
        
    except Exception as e:
        print(f"Error getting user details: {e}")
        return None

@app.route("/api/save_listing", methods=["POST"])
def save_listing():
    try:
        data = request.json
        user_id = data.get("user_id")  
        listing_id = data.get("listing_id")  
        listing_name = data.get("listing_name")  
        image = data.get("image")  
        price = data.get("price")  

        if not user_id or not listing_id:
            return jsonify({"error": "Missing user_id or listing_id"}), 400

        saved_ref = db.collection("Users").document(user_id).collection("savedListings").document(listing_id)
        doc = saved_ref.get()

        if doc.exists:
            saved_ref.delete()  # Remove listing if already saved
            return jsonify({"message": "Listing removed from saved listings"}), 200
        else:
            saved_ref.set({
                "listing_id": listing_id,
                "listing_name": listing_name,
                "image": image,
                "price": price,
                "timestamp": datetime.utcnow()
            })  # Save listing in Firestore
            return jsonify({"message": "Listing saved successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/saved_listings/<user_id>", methods=["GET"])
def get_saved_listings(user_id):
    try:
        saved_ref = db.collection("Users").document(user_id).collection("savedListings").stream()
        saved_listings = [doc.to_dict() for doc in saved_ref]
        return jsonify(saved_listings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/test-email")
def test_email():
    success = send_email(
        "buyertest@gmail.com",
        "Test Email",
        "This is a test email from DealSpot"
    )
    return jsonify({"success": success})

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001, debug=True)