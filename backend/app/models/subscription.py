from pydantic import BaseModel

class Subscription(BaseModel):
    fundId: str
    amount: int
