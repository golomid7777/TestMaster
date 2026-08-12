from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from database.db import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    questions = relationship(
        "Question",
        back_populates="service"
    )



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    service_id = Column(
        Integer,
        ForeignKey("services.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )



class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    service_id = Column(
        Integer,
        ForeignKey("services.id")
    )

    question = Column(
        Text,
        nullable=False
    )

    answer = Column(
        Text,
        nullable=False
    )

    keywords = Column(
        Text,
        nullable=True
    )

    service = relationship(
        "Service",
        back_populates="questions"
    )
