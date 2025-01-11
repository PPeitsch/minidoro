import os

from flask import Flask

app = Flask(__name__, static_folder=os.path.abspath("app/static"))

from app import routes
