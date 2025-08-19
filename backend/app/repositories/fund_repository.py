class FundRepository:
    _funds = [
        {"id": "fund-1", "name": "Fondo Conservador", "category": "Renta Fija", "minAmount": 100_000},
        {"id": "fund-2", "name": "Fondo Moderado", "category": "Balanceado", "minAmount": 200_000},
        {"id": "fund-3", "name": "Fondo Agresivo", "category": "Acciones", "minAmount": 300_000},
    ]

    @classmethod
    def get_all(cls):
        return cls._funds

    @classmethod
    def get_fund(cls, fund_id: str):
        return next((f for f in cls._funds if f["id"] == fund_id), None)
