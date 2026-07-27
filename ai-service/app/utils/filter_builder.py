import re
import logging

logger = logging.getLogger("fashionhub.filter")


# ----------------------------------------------------
# Gender Mapping
# ----------------------------------------------------

GENDER_MAP = {
    "male": "Men",
    "man": "Men",
    "men": "Men",

    "female": "Women",
    "woman": "Women",
    "women": "Women",

    "boy": "Boys",
    "boys": "Boys",

    "girl": "Girls",
    "girls": "Girls",

    "kid": "Kids",
    "kids": "Kids",

    "unisex": "Unisex"
}


# ----------------------------------------------------
# Product Synonyms
# ----------------------------------------------------

SEARCH_SYNONYMS = {

    "bag": [
        "bag",
        "bags",
        "handbag",
        "handbags",
        "purse",
        "purses"
    ],

    "handbag": [
        "handbag",
        "handbags",
        "bag",
        "bags",
        "purse"
    ],

    "shirt": [
        "shirt",
        "shirts",
        "tshirt",
        "t-shirt",
        "tee",
        "polo"
    ],

    "pant": [
        "pant",
        "pants",
        "trouser",
        "trousers",
        "jeans"
    ],

    "shoe": [
        "shoe",
        "shoes",
        "sneaker",
        "sneakers",
        "trainer",
        "trainers"
    ],

    "dress": [
        "dress",
        "dresses",
        "frock",
        "frocks",
        "kurti",
        "kurtis"
    ],

    "hoodie": [
        "hoodie",
        "hoodies",
        "sweatshirt"
    ]
}


# ----------------------------------------------------
# Helpers
# ----------------------------------------------------

def _parse_price(value):

    if not value:
        return None

    value = re.sub(r"[^\d.]", "", str(value))

    if value == "":
        return None

    return int(float(value))


def expand_term(term):

    term = term.lower().strip()

    expanded = {term}

    for key, values in SEARCH_SYNONYMS.items():

        if term == key or term in values:

            expanded.update(values)

    return list(expanded)


# ----------------------------------------------------
# Product Filter
# ----------------------------------------------------

def build_product_filter(entities):

    query = {}

    if not entities:
        return query

    search_terms = []

    if entities.get("productName"):
        search_terms.append(entities["productName"])

    if entities.get("category"):
        search_terms.append(entities["category"])

    if entities.get("subCategory"):
        search_terms.append(entities["subCategory"])

    if search_terms:

        or_query = []

        for term in search_terms:

            synonyms = expand_term(term)

            regex = "|".join(
                re.escape(x)
                for x in synonyms
            )

            or_query.extend([

                {
                    "productName": {
                        "$regex": regex,
                        "$options": "i"
                    }
                },

                {
                    "category": {
                        "$regex": regex,
                        "$options": "i"
                    }
                },

                {
                    "subCategory": {
                        "$regex": regex,
                        "$options": "i"
                    }
                },

                {
                    "description": {
                        "$regex": regex,
                        "$options": "i"
                    }
                }

            ])

        query["$or"] = or_query

    # Gender

    gender = entities.get("gender", "").lower()

    gender = GENDER_MAP.get(gender, gender)

    if gender:

        query["gender"] = {
            "$regex": f"^{gender}$",
            "$options": "i"
        }

    # Color

    if entities.get("color"):

        query["colors"] = {
            "$regex": entities["color"],
            "$options": "i"
        }

    # Size

    if entities.get("size"):

        query["sizes"] = {
            "$regex": entities["size"],
            "$options": "i"
        }

    # Season

    if entities.get("season"):

        query["season"] = {
            "$regex": entities["season"],
            "$options": "i"
        }

    # Price

    price = {}

    minimum = _parse_price(entities.get("minPrice"))

    maximum = _parse_price(entities.get("maxPrice"))

    budget = _parse_price(entities.get("budget"))

    if minimum is not None:
        price["$gte"] = minimum

    if maximum is not None:
        price["$lte"] = maximum

    elif budget is not None:
        price["$lte"] = budget

    if price:
        query["price"] = price

    # Bestseller

    if str(entities.get("bestSeller")).lower() == "true":

        query["isBestSeller"] = True

    # Trending

    if str(entities.get("trend")).lower() == "true":

        query["isTrending"] = True

    # Rating

    rating = _parse_price(entities.get("rating"))

    if rating:

        query["rating"] = {
            "$gte": rating
        }

    # Discount

    discount = _parse_price(entities.get("discount"))

    if discount:

        query["discount"] = {
            "$gte": discount
        }

    # Only active products

    query["status"] = True

    # In Stock

    query["stock"] = {
        "$gt": 0
    }

    logger.info("Product Query = %s", query)

    return query


# ----------------------------------------------------
# Sorting
# ----------------------------------------------------

def build_sort_config(entities):

    sort_by = entities.get("sort_by", "").lower()

    order = entities.get("sort_order", "").lower()

    if not sort_by:
        return None

    direction = -1

    if order in [
        "asc",
        "ascending",
        "cheap",
        "cheapest",
        "low"
    ]:
        direction = 1

    mapping = {

        "price": "price",

        "rating": "rating",

        "discount": "discount",

        "newest": "createdAt"

    }

    field = mapping.get(sort_by)

    if not field:
        return None

    return [(field, direction)]
