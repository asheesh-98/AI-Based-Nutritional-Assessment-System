"""
FastAPI router for Sound Categories and Sound Tracks.
Supports patient public fetching and admin CRUD operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database.db import get_db
from backend.app.models.sound import SoundCategory, SoundTrack
from backend.app.models.user import User
from backend.app.auth.security import get_current_user, get_admin_user

router = APIRouter()


# --- Pydantic Schemas ---

class SoundCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon_name: Optional[str] = "Music"


class SoundCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon_name: Optional[str] = "Music"
    track_count: Optional[int] = 0

    class Config:
        from_attributes = True


class SoundTrackCreate(BaseModel):
    category_id: int
    title: str
    description: Optional[str] = None
    audio_url: Optional[str] = None
    is_synthesized: bool = False
    freq_hz: float = 432.0
    binaural_hz: float = 10.0
    duration_sec: int = 300
    thumbnail_url: Optional[str] = None
    is_active: bool = True


class SoundTrackResponse(BaseModel):
    id: int
    category_id: int
    category_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    audio_url: Optional[str] = None
    is_synthesized: bool = False
    freq_hz: float = 432.0
    binaural_hz: float = 10.0
    duration_sec: int = 300
    thumbnail_url: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


# --- Public Endpoints ---

@router.get("/categories", response_model=List[SoundCategoryResponse])
def get_public_sound_categories(db: Session = Depends(get_db)):
    """Get active sound categories for patient studio."""
    categories = db.query(SoundCategory).all()
    res = []
    for cat in categories:
        track_count = db.query(SoundTrack).filter(SoundTrack.category_id == cat.id, SoundTrack.is_active == True).count()
        res.append(SoundCategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            icon_name=cat.icon_name,
            track_count=track_count
        ))
    return res


@router.get("/tracks", response_model=List[SoundTrackResponse])
def get_public_sound_tracks(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get active sound tracks for patient studio."""
    query = db.query(SoundTrack).filter(SoundTrack.is_active == True)
    if category_id:
        query = query.filter(SoundTrack.category_id == category_id)
    
    tracks = query.all()
    res = []
    for t in tracks:
        cat_name = t.category.name if t.category else "General"
        res.append(SoundTrackResponse(
            id=t.id,
            category_id=t.category_id,
            category_name=cat_name,
            title=t.title,
            description=t.description,
            audio_url=t.audio_url,
            is_synthesized=t.is_synthesized,
            freq_hz=t.freq_hz,
            binaural_hz=t.binaural_hz,
            duration_sec=t.duration_sec,
            thumbnail_url=t.thumbnail_url,
            is_active=t.is_active
        ))
    return res


# --- Admin Endpoints ---

@router.post("/admin/categories", response_model=SoundCategoryResponse)
def create_sound_category(
    payload: SoundCategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Admin: Create a new sound category."""
    existing = db.query(SoundCategory).filter(SoundCategory.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    cat = SoundCategory(
        name=payload.name,
        description=payload.description,
        icon_name=payload.icon_name or "Music"
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return SoundCategoryResponse(
        id=cat.id,
        name=cat.name,
        description=cat.description,
        icon_name=cat.icon_name,
        track_count=0
    )


@router.put("/admin/categories/{category_id}", response_model=SoundCategoryResponse)
def update_sound_category(
    category_id: int,
    payload: SoundCategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Admin: Update sound category."""
    cat = db.query(SoundCategory).filter(SoundCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    cat.name = payload.name
    cat.description = payload.description
    cat.icon_name = payload.icon_name or cat.icon_name
    db.commit()
    db.refresh(cat)
    
    track_count = db.query(SoundTrack).filter(SoundTrack.category_id == cat.id).count()
    return SoundCategoryResponse(
        id=cat.id,
        name=cat.name,
        description=cat.description,
        icon_name=cat.icon_name,
        track_count=track_count
    )


@router.delete("/admin/categories/{category_id}")
def delete_sound_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Admin: Delete sound category."""
    cat = db.query(SoundCategory).filter(SoundCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}


@router.post("/admin/tracks", response_model=SoundTrackResponse)
def create_sound_track(
    payload: SoundTrackCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Admin: Add a new sound track or frequency preset."""
    cat = db.query(SoundCategory).filter(SoundCategory.id == payload.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid Category ID")
    
    track = SoundTrack(
        category_id=payload.category_id,
        title=payload.title,
        description=payload.description,
        audio_url=payload.audio_url,
        is_synthesized=payload.is_synthesized,
        freq_hz=payload.freq_hz,
        binaural_hz=payload.binaural_hz,
        duration_sec=payload.duration_sec,
        thumbnail_url=payload.thumbnail_url,
        is_active=payload.is_active
    )
    db.add(track)
    db.commit()
    db.refresh(track)
    
    return SoundTrackResponse(
        id=track.id,
        category_id=track.category_id,
        category_name=cat.name,
        title=track.title,
        description=track.description,
        audio_url=track.audio_url,
        is_synthesized=track.is_synthesized,
        freq_hz=track.freq_hz,
        binaural_hz=track.binaural_hz,
        duration_sec=track.duration_sec,
        thumbnail_url=track.thumbnail_url,
        is_active=track.is_active
    )


@router.put("/admin/tracks/{track_id}", response_model=SoundTrackResponse)
def update_sound_track(
    track_id: int,
    payload: SoundTrackCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Admin: Update sound track details."""
    track = db.query(SoundTrack).filter(SoundTrack.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Sound track not found")
    
    track.category_id = payload.category_id
    track.title = payload.title
    track.description = payload.description
    track.audio_url = payload.audio_url
    track.is_synthesized = payload.is_synthesized
    track.freq_hz = payload.freq_hz
    track.binaural_hz = payload.binaural_hz
    track.duration_sec = payload.duration_sec
    track.thumbnail_url = payload.thumbnail_url
    track.is_active = payload.is_active
    
    db.commit()
    db.refresh(track)
    
    cat_name = track.category.name if track.category else "General"
    return SoundTrackResponse(
        id=track.id,
        category_id=track.category_id,
        category_name=cat_name,
        title=track.title,
        description=track.description,
        audio_url=track.audio_url,
        is_synthesized=track.is_synthesized,
        freq_hz=track.freq_hz,
        binaural_hz=track.binaural_hz,
        duration_sec=track.duration_sec,
        thumbnail_url=track.thumbnail_url,
        is_active=track.is_active
    )


@router.delete("/admin/tracks/{track_id}")
def delete_sound_track(
    track_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Admin: Delete sound track."""
    track = db.query(SoundTrack).filter(SoundTrack.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Sound track not found")
    
    db.delete(track)
    db.commit()
    return {"message": "Sound track deleted successfully"}
