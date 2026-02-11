"""Database session management (SQLAlchemy sessionmaker)."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = None
SessionLocal = None


def init_db(url: str):
    global engine, SessionLocal
    engine = create_engine(url, future=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db(): #Explanation: this function is used as a dependency in FastAPI routes to provide a database session  
    if SessionLocal is None:
        raise RuntimeError("DB not initialized")
    db = SessionLocal() #db is now a SQLAlchemy session object which is used to interact with the database
    try:
        yield db #Explanation: yield allows this function to be used as a generator, providing a session to the route handler, because yield is like return but allows the function to be resumed later
    finally:
        db.close()