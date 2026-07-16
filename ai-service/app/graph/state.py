from typing import TypedDict, Optional


class GraphState(TypedDict):

    session_id: str

    message: str

    products: Optional[list]

    recommendations: Optional[list]

    order: Optional[dict]

    response: Optional[str]