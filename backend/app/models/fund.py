from pydantic import BaseModel

class Fund(BaseModel):
    id: str
    name: str
    category: str
    minAmount: int
