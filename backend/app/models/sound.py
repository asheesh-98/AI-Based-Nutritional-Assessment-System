"""
SQLAlchemy ORM models for sound categories and sound tracks.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class SoundCategory(Base):
    __tablename__ = "sound_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), default="Music")
    created_at = Column(DateTime, server_default=func.now())

    # Relationship
    tracks = relationship("SoundTrack", back_populates="category", cascade="all, delete-orphan")


class SoundTrack(Base):
    __tablename__ = "sound_tracks"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("sound_categories.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    is_synthesized = Column(Boolean, default=False)
    freq_hz = Column(Float, default=432.0)
    binaural_hz = Column(Float, default=10.0)
    duration_sec = Column(Integer, default=300)
    thumbnail_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship
    category = relationship("SoundCategory", back_populates="tracks")
