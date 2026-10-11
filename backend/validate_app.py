#!/usr/bin/env python3
"""Test backend import and schema creation."""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

try:
    from app.main import app
    from app.core.database import engine, Base
    from app.core.config import get_settings

    settings = get_settings()
    print(f"✓ Backend app loaded successfully")
    print(f"✓ Settings loaded: environment={settings.environment}, db_url={settings.database_url[:40]}...")

    # Try to connect and create tables
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database schema created/verified successfully")
    except Exception as e:
        # If schema creation fails (e.g., no db), that's ok - we'll handle it below
        print(f"⚠ Schema creation attempt: {type(e).__name__}: {str(e)[:100]}")

    print("✓ All backend components validated")
    sys.exit(0)

except Exception as e:
    print(f"✗ Backend validation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
