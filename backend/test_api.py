import sys
import os
sys.path.append('.')
try:
    from api import app
    print("API import success")
except Exception as e:
    print(f"API import failed: {e}")
    import traceback
    traceback.print_exc()
