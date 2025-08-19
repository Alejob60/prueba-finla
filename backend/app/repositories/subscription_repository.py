class SubscriptionRepository:
    _subscriptions = []

    @classmethod
    def get_all(cls):
        return cls._subscriptions

    @classmethod
    def add_subscription(cls, fund_id: str, amount: int):
        sub = {"fundId": fund_id, "amount": amount}
        cls._subscriptions.append(sub)
        return sub

    @classmethod
    def remove_subscription(cls, fund_id: str):
        sub = next((s for s in cls._subscriptions if s["fundId"] == fund_id), None)
        if sub:
            cls._subscriptions.remove(sub)
        return sub
