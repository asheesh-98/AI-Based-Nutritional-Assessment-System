"""
SQLAlchemy engine, session factory, Base class, and helper utilities.
Uses SQLite for local development (no PostgreSQL dependency needed).
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from backend.app.config.settings import DATABASE_URL

# For SQLite we need check_same_thread=False so FastAPI's threaded
# request handling works correctly.
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables defined by ORM models (import them first) and auto-migrate missing columns."""
    # Import every model module so Base.metadata knows about them.
    import backend.app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Safe auto-migration for schema updates across SQLite & PostgreSQL
    try:
        with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
            for query in [
                "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS medical_conditions VARCHAR(200)",
                "ALTER TABLE health_profiles ADD COLUMN medical_conditions VARCHAR(200)",
                "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS allergies VARCHAR(200)",
                "ALTER TABLE health_profiles ADD COLUMN allergies VARCHAR(200)",
                "ALTER TABLE food_diary ADD COLUMN IF NOT EXISTS unit VARCHAR(50)",
                "ALTER TABLE food_diary ADD COLUMN unit VARCHAR(50)",
            ]:
                try:
                    conn.execute(text(query))
                except Exception:
                    pass

    # Seed default sound categories if empty
    try:
        db = SessionLocal()
        from backend.app.models.sound import SoundCategory
        if db.query(SoundCategory).count() == 0:
            default_cats = [
                SoundCategory(name="Binaural Beats", description="Alpha & Theta brainwave entrainment tones", icon_name="Activity"),
                SoundCategory(name="Solfeggio Frequencies", description="432Hz and 528Hz healing sound waves", icon_name="Sparkles"),
                SoundCategory(name="Nature Sounds", description="Ambient ocean waves, rain, and forest soundscapes", icon_name="TreePine"),
                SoundCategory(name="Guided Meditation", description="Breathing visualizer and calmness guides", icon_name="Wind"),
                SoundCategory(name="Relaxing Instrumentals", description="Soothing piano and acoustic acoustic melodies", icon_name="Music")
            ]
            db.add_all(default_cats)
            db.commit()
        db.close()
    except Exception:
        pass
    except Exception:
        pass
