import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_index_route(client):
    """Test the main route returns correct HTML"""
    rv = client.get("/")
    assert rv.status_code == 200
    assert b"Minidoro" in rv.data
    assert b"timer-container" in rv.data


def test_static_files(client):
    """Test static files are served correctly"""
    routes = ["styles.css", "script.js"]
    for route in routes:
        rv = client.get(f"/{route}")
        assert rv.status_code == 200


def test_timer_elements_present(client):
    """Test all timer elements are present in HTML"""
    rv = client.get("/")
    html = rv.data.decode()
    assert "Pomodoro" in html
    assert "Short Break" in html
    assert "Long Break" in html
    assert "START" in html
    assert "settingsModal" in html


@pytest.mark.parametrize(
    "route,expected_content_type",
    [
        ("styles.css", "text/css"),
        ("script.js", "text/javascript"),  # Corregido el content type esperado
    ],
)
def test_static_content_types(client, route, expected_content_type):
    """Test static files have correct content types"""
    rv = client.get(f"/{route}")
    assert expected_content_type in rv.headers["Content-Type"]


def test_settings_modal_elements(client):
    """Test settings modal contains all required elements"""
    rv = client.get("/")
    html = rv.data.decode()
    assert "Theme Color" in html
    assert "Invert Layout" in html
    assert "Enable Sound" in html
    assert "Enable Desktop Notifications" in html
    assert "Sound Volume" in html


def test_invalid_route(client):
    """Test 404 is returned for invalid routes"""
    rv = client.get("/nonexistent")
    assert rv.status_code == 404


def test_static_notification_sound(client):
    """Test notification sound file is served correctly"""
    rv = client.get("/static/notification.mp3")
    assert rv.status_code == 200
    assert "audio/mpeg" in rv.headers["Content-Type"]


def test_static_paths_configuration():
    """Test static folder configuration"""
    assert app.static_folder is not None
    assert "static" in app.static_folder
