"""Chunk model (embeddings / RAG support)."""
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from .base import Base

class Chunk(Base):
    __tablename__ = 'chunks'
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey('documents.id'))
    embedding_id = Column(String)
    vector = Column(String)  # In prod use vector DB
