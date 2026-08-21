from app.database import engine

try:
    conn = engine.connect()
    print("✅ Connected to Supabase successfully!")
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)