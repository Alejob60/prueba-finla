from fastapi import HTTPException
from app.repositories.user_repository import UserRepository
from app.repositories.fund_repository import FundRepository
from app.repositories.subscription_repository import SubscriptionRepository
from app.repositories.transaction_repository import TransactionRepository

class InvestmentService:

    @staticmethod
    def get_state(user_id: str):
        user = UserRepository.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "user": user,
            "funds": FundRepository.get_all(),
            "subscriptions": SubscriptionRepository.get_all(),
            "transactions": TransactionRepository.get_all(),
        }

    @staticmethod
    def subscribe(user_id: str, fund_id: str, amount: int):
        user = UserRepository.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        fund = FundRepository.get_fund(fund_id)
        if not fund:
            raise HTTPException(status_code=404, detail="Fondo no encontrado")

        if amount < fund["minAmount"]:
            raise HTTPException(status_code=400, detail=f"El monto mínimo es {fund['minAmount']}")

        if user["balance"] < amount:
            raise HTTPException(status_code=400, detail="Saldo insuficiente")

        UserRepository.update_balance(-amount)
        SubscriptionRepository.add_subscription(fund_id, amount)
        TransactionRepository.add_transaction(fund_id, amount, "subscription")
        return InvestmentService.get_state(user_id)

    @staticmethod
    def unsubscribe(user_id: str, fund_id: str):
        user = UserRepository.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        sub = SubscriptionRepository.remove_subscription(fund_id)
        if not sub:
            raise HTTPException(status_code=400, detail="No existe suscripción")

        UserRepository.update_balance(sub["amount"])
        TransactionRepository.add_transaction(fund_id, sub["amount"], "cancellation")
        return InvestmentService.get_state(user_id)
