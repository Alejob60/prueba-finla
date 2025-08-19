from app.models.transaction import Transaction

class TransactionRepository:
    _transactions = []

    @classmethod
    def get_all(cls):
        return cls._transactions

    @classmethod
    def add_transaction(cls, fund_id: str, amount: int, type: str):
        tx = Transaction.create(fund_id, amount, type)
        cls._transactions.append(tx.dict())
        return tx
