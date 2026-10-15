from typing import Any, Dict, List, Optional
from ..database import execute_query, execute_update


class ProductRepository:
    """Repositório assíncrono para operações de banco de dados na entidade Produto."""

    async def create(
        self,
        produto_id: str,
        nome: Optional[str],
        condicao: str,
        categoria: str,
        observacoes_usuario: str,
        preco_usuario: float,
        fotos: List[str],
    ) -> Dict[str, Any]:
        query = """
        INSERT INTO produtos (id, nome, condicao, categoria, observacoes_usuario, preco_usuario, fotos)
        VALUES (%s, %s, %s, %s, %s, %s, %s::text[])
        RETURNING id, created_at, nome, condicao, categoria, observacoes_usuario, preco_usuario, fotos, status,
                  descricao_curta, descricao_longa, preco_medio_mercado, preco_sugerido
        """
        fotos_array = "{" + ",".join(f'"{f}"' for f in fotos) + "}"
        params = (
            produto_id,
            nome,
            condicao,
            categoria,
            observacoes_usuario,
            float(preco_usuario),
            fotos_array,
        )
        rows = await execute_query(query, params)
        if not rows:
            raise RuntimeError("Falha ao inserir produto no banco de dados.")
        return rows[0]

    async def list_all(self) -> List[Dict[str, Any]]:
        query = """
        SELECT id, created_at, nome, condicao, categoria, observacoes_usuario, preco_usuario, fotos, status,
               descricao_curta, descricao_longa, preco_medio_mercado, preco_sugerido
        FROM produtos
        ORDER BY created_at DESC
        """
        return await execute_query(query)

    async def get_by_id(self, produto_id: str) -> Optional[Dict[str, Any]]:
        query = """
        SELECT id, created_at, nome, condicao, categoria, observacoes_usuario, preco_usuario, fotos, status,
               descricao_curta, descricao_longa, preco_medio_mercado, preco_sugerido
        FROM produtos
        WHERE id = %s
        """
        rows = await execute_query(query, (produto_id,))
        return rows[0] if rows else None

    async def update_status(self, produto_id: str, status: str) -> None:
        query = "UPDATE produtos SET status = %s WHERE id = %s"
        await execute_update(query, (status, produto_id))
