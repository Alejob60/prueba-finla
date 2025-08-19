class UserRepository:
    _user = {"id": "user-1", "name": "Juan Pérez", "balance": 500_000}

    @classmethod
    def get_user(cls, user_id: str):
        return cls._user if cls._user["id"] == user_id else None

    @classmethod
    def update_balance(cls, amount: int):
        cls._user["balance"] += amount
        return cls._user
