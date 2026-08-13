from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Boolean
)

from sqlalchemy.orm import relationship
from datetime import datetime

from database.db import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    questions = relationship(
        "Question",
        back_populates="service"
    )

    topics = relationship(
        "Topic",
        back_populates="service"
    )


class Topic(Base):
    __tablename__ = "topics"

    id = Column(
        Integer,
        primary_key=True,
        index=True
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

    time_limit_minutes = Column(
        Integer,
        nullable=False,
        default=30
    )

    # Цена доступа хранится в копейках.
    # 0 = бесплатная тема.
    price_kopecks = Column(
        Integer,
        nullable=False,
        default=0
    )

    # На сколько минут открывается тема после подтвержденной оплаты.
    access_minutes = Column(
        Integer,
        nullable=False,
        default=0
    )

    service = relationship(
        "Service",
        back_populates="topics"
    )

    questions = relationship(
        "Question",
        back_populates="topic"
    )


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

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
        nullable=True
    )

    is_admin = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    service_id = Column(
        Integer,
        ForeignKey("services.id"),
        nullable=False
    )

    topic_id = Column(
        Integer,
        ForeignKey("topics.id"),
        nullable=True
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

    topic = relationship(
        "Topic",
        back_populates="questions"
    )


class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    topic_id = Column(
        Integer,
        ForeignKey("topics.id"),
        nullable=False
    )

    started_at = Column(
        DateTime,
        nullable=False
    )

    expires_at = Column(
        DateTime,
        nullable=False
    )


class TopicAccess(Base):
    __tablename__ = "topic_accesses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    topic_id = Column(
        Integer,
        ForeignKey("topics.id"),
        nullable=False,
        index=True
    )

    granted_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    expires_at = Column(
        DateTime,
        nullable=False,
        index=True
    )

    # Пока оплаты нет, пригодится для тестовых/админских выдач.
    source = Column(
        String,
        nullable=False,
        default="payment"
    )
