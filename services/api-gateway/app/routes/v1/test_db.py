from fastapi import APIRouter

router = APIRouter(prefix="/db", tags=["db"])


@app.get("/db")
def show_db_schema():
    inspector = inspect(engine)
    schema = {}

    for table in inspector.get_table_names():
        schema[table] = inspector.get_columns(table)

    return schema