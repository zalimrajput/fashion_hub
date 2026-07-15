# products.py
PRODUCTS = [
    {"name": "Black Embroidered Maxi", "category": "dress", "price": 4999, "color": "black", "sizes": ["S","M","L"], "gender": "women"},
    {"name": "Black Chiffon Dress", "category": "dress", "price": 5499, "color": "black", "sizes": ["M","L","XL"], "gender": "women"},
    {"name": "Men's Formal Shirt", "category": "shirt", "price": 2499, "color": "white", "sizes": ["M","L","XL"], "gender": "men"},
]

def search_products(query_terms: dict):
    results = PRODUCTS
    if query_terms.get("color"):
        results = [p for p in results if p["color"] == query_terms["color"]]
    if query_terms.get("category"):
        results = [p for p in results if p["category"] == query_terms["category"]]
    if query_terms.get("max_price"):
        results = [p for p in results if p["price"] <= query_terms["max_price"]]
    return results[:5]