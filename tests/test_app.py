import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_index_route(client):
    """Test that the index route returns 200 and has expected content"""
    response = client.get("/")
    assert response.status_code == 200
    assert b"Minidoro" in response.data


def test_static_files(client):
    """Test that static files are accessible"""
    response = client.get("/static/styles.css")
    assert response.status_code == 200
    response = client.get("/static/script.js")
    assert response.status_code == 200
