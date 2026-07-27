from pydantic import BaseModel
from typing import Optional, List, Dict, Any



class ChatRequest(BaseModel):

    session_id: str

    message: str

    customer_id: Optional[str] = None

    platform: Optional[str] = None

    history: Optional[
        List[Dict[str, Any]]
    ] = []
