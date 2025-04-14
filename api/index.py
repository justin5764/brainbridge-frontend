from flask import Flask, request, jsonify
import sys
import os

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app as flask_app

# This is the handler for Vercel serverless functions
app = flask_app 