from app.domain.identity.entities import Customer, UserPreference
from app.domain.identity.repository import ICustomerRepository, IUserPreferenceRepository

__all__ = [
    "Customer",
    "UserPreference",
    "ICustomerRepository",
    "IUserPreferenceRepository",
]
