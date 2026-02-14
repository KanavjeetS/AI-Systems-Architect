import os
import sys

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from main import app as synapse_app

# Create a root app to handle the /api prefix
app = FastAPI()

# Mount the main Synapse app under /api
# This ensures that requests to /api/build are routed to synapse_app /build
app.mount("/api", synapse_app)
