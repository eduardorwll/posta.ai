import pytest_asyncio
from httpx import ASGITransport, AsyncClient

try:
    from src.main import app
    from src.database import init_pool, close_pool
except ImportError:
    from backend.src.main import app
    from backend.src.database import init_pool, close_pool


@pytest_asyncio.fixture(autouse=True)
async def app_lifespan():
    await init_pool()
    yield
    await close_pool()


@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
