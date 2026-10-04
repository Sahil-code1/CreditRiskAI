import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
import uvicorn
uvicorn.run('backend.app.main:app', host='0.0.0.0', port=8000, reload=True)
