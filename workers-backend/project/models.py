from pydantic import BaseModel
from typing import List, Any

class Number(BaseModel):
    number: int

class BetInfo(BaseModel):
    bets_results: List[Any]
    upcoming_fixtures: List[Any]
    old_fixtures: List[Any]