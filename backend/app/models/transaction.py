from pydantic import BaseModel
from datetime import datetime
import uuid

class Transaction(BaseModel):
    id: str
    fundId: str
    amount: int
    type: str
    timestamp: str

    @staticmethod
    def create(fundId: str, amount: int, type: str):
        return Transaction(
            id=str(uuid.uuid4()),
            fundId=fundId,
            amount=amount,
            type=type,
            timestamp=datetime.utcnow().isoformat()
        )
