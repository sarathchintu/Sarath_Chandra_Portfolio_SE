from .state import EmailingAgent
from .nodes import generating_mail_node,human_approvel_node,send_node
from langgraph.graph import StateGraph,START,END
from psycopg_pool import ConnectionPool
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg.rows import dict_row
from dotenv import load_dotenv
import os

load_dotenv()


def route_after_decision(state:EmailingAgent):
    return 'send_node' if state['approved'] else END


builder=StateGraph(EmailingAgent)

builder.add_node('mail_node',generating_mail_node)
builder.add_node('approvel_node',human_approvel_node)
builder.add_node('send_node',send_node)

builder.add_edge(START,'mail_node')
builder.add_edge('mail_node','approvel_node')
builder.add_conditional_edges('approvel_node',route_after_decision)
builder.add_edge('send_node',END)

pool=ConnectionPool(
    conninfo=os.getenv('DATABASE_URL'),
    min_size=1,
    max_size=3,
    open=True,
    kwargs={
        "autocommit":True,
        "prepare_threshold": 0,
        "row_factory": dict_row,
    }
)

checkpointer=PostgresSaver(pool)
checkpointer.setup()
graph=builder.compile(checkpointer=checkpointer)