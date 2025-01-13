from flask import render_template

from app import app


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    return app.send_static_file(filename)
