import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://posta:posta123@localhost:5432/posta_ai")
STORAGE_PATH = "/app/storage"
MAX_PHOTOS_PER_PRODUCT = 5
MAX_FILE_SIZE = 50 * 1024 * 1024