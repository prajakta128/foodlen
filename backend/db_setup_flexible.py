#!/usr/bin/env python3
"""Attempt to connect to PostgreSQL with various methods and create database."""
import psycopg
import sys

# Try different connection URLs
connection_attempts = [
    # Using trust auth (localhost peer)
    "postgresql://postgres@/postgres",
    # Using default empty password
    "postgresql://postgres:@localhost/postgres",
    # Check if the connection is possible with simple TCP
    "postgresql://localhost/postgres",
]

print("Attempting to connect to PostgreSQL server...")

for conn_str in connection_attempts:
    try:
        print(f"\n  Trying: {conn_str}")
        with psycopg.connect(conn_str, connect_timeout=3) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT version();")
                version = cur.fetchone()[0]
                print(f"  ✓ Connected successfully!")
                print(f"  PostgreSQL version: {version[:60]}...")

                # Now try to create the database
                conn.autocommit = True
                try:
                    cur.execute("CREATE DATABASE foodlens;")
                    print(f"  ✓ Created database 'foodlens'")
                except psycopg.errors.DuplicateDatabase:
                    print(f"  ℹ Database 'foodlens' already exists")

                sys.exit(0)
    except Exception as e:
        print(f"    ✗ {type(e).__name__}: {str(e)[:80]}")
        continue

print("\n✗ Could not connect to PostgreSQL with any method")
print("\nTo fix this, you can:")
print("  1. Reset the postgres user password via Windows services")
print("  2. Use pgAdmin to create the foodlens database")
print("  3. Manually set DATABASE_URL in .env to a working connection")
sys.exit(1)
