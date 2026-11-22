from typing import TypedDict, Optional

class EmailingAgent(TypedDict,total=False):
    email:str
    context:str
    subject:Optional[str]
    body:Optional[str]
    approved:Optional[bool]
