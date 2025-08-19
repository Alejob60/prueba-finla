from fastapi import APIRouter
from pydantic import BaseModel
from app.services.investment_service import InvestmentService

router = APIRouter()

class SubscribeRequest(BaseModel):
    userId: str
    fundId: str
    amount: int

class UnsubscribeRequest(BaseModel):
    userId: str
    fundId: str

@router.get("/state/{user_id}")
def get_state(user_id: str):
    return InvestmentService.get_state(user_id)

@router.post("/subscribe")
def subscribe(req: SubscribeRequest):
    return InvestmentService.subscribe(req.userId, req.fundId, req.amount)

@router.post("/unsubscribe")
def unsubscribe(req: UnsubscribeRequest):
    return InvestmentService.unsubscribe(req.userId, req.fundId)