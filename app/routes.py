from pathlib import Path

from flask import jsonify, render_template

from app import app

VERSION_FILE = Path(__file__).resolve().parent.parent / "VERSION"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/health")
def health():
    """For a monitor: the app answers, and which version runs."""
    try:
        version = VERSION_FILE.read_text().strip()
    except OSError:
        version = None
    return jsonify(status="ok", version=version)


@app.route("/<path:filename>")
def serve_static(filename):
    return app.send_static_file(filename)
