from __future__ import annotations


class DomainException(Exception):
    pass


class EntityNotFoundException(DomainException):
    def __init__(self, entity_type: str, entity_id: str):
        self.entity_type = entity_type
        self.entity_id = entity_id
        super().__init__(f"{entity_type} with id {entity_id} not found")


class InvalidEntityStateException(DomainException):
    def __init__(self, entity_type: str, message: str):
        self.entity_type = entity_type
        super().__init__(f"Invalid state for {entity_type}: {message}")


class BusinessRuleViolationException(DomainException):
    def __init__(self, rule: str, message: str):
        self.rule = rule
        super().__init__(f"Business rule violation [{rule}]: {message}")
