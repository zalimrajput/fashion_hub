from typing import TypedDict, Optional, List, Dict, Any


class GraphState(TypedDict):
    session_id: str
    customer_id: Optional[str]
    platform: Optional[str]
    message: str

    customer: Optional[Dict[str, Any]]
    conversation: Optional[Dict[str, Any]]
    history: Optional[List[Dict[str, Any]]]

    intent: Dict[str, Any]
    sentiment: Dict[str, Any]
    entities: Dict[str, Any]
    customer_goal: str

    products: Optional[List[Dict[str, Any]]]
    recommendations: Optional[List[Dict[str, Any]]]
    order: Optional[Dict[str, Any]]
    delivery: Optional[Dict[str, Any]]
    policies: Optional[Dict[str, Any]]
    settings: Optional[Dict[str, Any]]

    # Cart & Purchase
    cart: Optional[List[Dict[str, Any]]]
    checkout_stage: Optional[str]
    purchase_confirmed: Optional[bool]
    purchase_result: Optional[Dict[str, Any]]

    # Temp multi-turn checkout data (not persisted to cart)
    temp_product: Optional[Dict[str, Any]]
    temp_quantity: Optional[int]
    temp_name: Optional[str]
    temp_phone: Optional[str]
    temp_address: Optional[str]
    temp_city: Optional[str]
    temp_payment: Optional[str]

    reply: str
