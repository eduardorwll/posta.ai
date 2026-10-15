import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import psycopg
from psycopg import AsyncConnection
from psycopg_pool import AsyncConnectionPool

from .config import DATABASE_URL

_pool: AsyncConnectionPool | None = None


async def init_pool() -> None:
    global _pool
    _pool = AsyncConnectionPool(DATABASE_URL, min_size=1, max_size=10, open=False)
    await _pool.open()


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()


@asynccontextmanager
async def get_connection() -> AsyncGenerator[AsyncConnection, None]:
    global _pool
    if not _pool:
        raise RuntimeError("Connection pool not initialized")
    async with _pool.connection() as conn:
        yield conn


async def execute_query(query: str, params: tuple = ()) -> list[dict]:
    async with get_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(query, params)
            await conn.commit()
            cols = [desc[0] for desc in cur.description] if cur.description else []
            return [dict(zip(cols, row)) for row in await cur.fetchall()]


async def execute_insert(query: str, params: tuple = ()) -> str | None:
    async with get_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(query, params)
            await conn.commit()
            result = await cur.fetchone()
            return result[0] if result else None


async def execute_update(query: str, params: tuple = ()) -> None:
    async with get_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(query, params)
            await conn.commit()


async def check_db_health() -> bool:
    """Verifica se o pool e o banco PostgreSQL estão operacionais."""
    try:
        async with get_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
                res = await cur.fetchone()
                return bool(res and res[0] == 1)
    except Exception:
        return False