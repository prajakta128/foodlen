#!/usr/bin/env python3
"""Create the foodlens database if it doesn't exist."""
import sys
import psycopg

def create_database():
    """Connect to PostgreSQL and create the foodlens database."""
    # Try various connection options
    connection_options = [
        {"host": "localhost", "port": 5432, "user": "postgres", "dbname": "postgres", "connect_timeout": 5},  # Trust auth (no password)
        {"host": "localhost", "port": 5432, "user": "postgres", "password": "postgres", "dbname": "postgres", "connect_timeout": 5},
        {"host": "localhost", "port": 5432, "user": "postgres", "password": "", "dbname": "postgres", "connect_timeout": 5},
    ]

    conn = None
    for i, opts in enumerate(connection_options):
        try:
            conn = psycopg.connect(**opts)
            print(f"✓ Connected using option {i+1}")
            break
        except psycopg.Error as e:
            if i == len(connection_options) - 1:
                print(f"✗ All connection attempts failed: {e}")
                return False
            continue

    if conn is None:
        return False

    try:
        with conn:
            conn.autocommit = True
            with conn.cursor() as cur:
                # Check if database exists
                cur.execute(
                    "SELECT 1 FROM pg_database WHERE datname = 'foodlens';"
                )
                if cur.fetchone():
                    print("✓ Database 'foodlens' already exists")
                    return True

                # Create database
                cur.execute("CREATE DATABASE foodlens;")
                print("✓ Database 'foodlens' created successfully")
                return True
    except psycopg.Error as e:
        print(f"✗ Database error: {e}")
        return False
    except Exception as e:
        print(f"✗ Connection error: {e}")
        return False

if __name__ == "__main__":
    success = create_database()
    sys.exit(0 if success else 1)
