from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ProductStatus(str, Enum):
    pendente = "pendente"
    processando_ia = "processando_ia"
    aguardando_aprovacao = "aguardando_aprovacao"
    pronto = "pronto"
    publicado = "publicado"
    erro = "erro"


class ProductCondition(str, Enum):
    novo = "novo"
    como_novo = "como_novo"
    seminovo = "seminovo"
    usado = "usado"
    # Aliases retrocompatíveis
    usado_marcas = "usado_marcas"
    com_defeito = "com_defeito"


class ProductCategory(str, Enum):
    roupas_acessorios = "roupas_acessorios"
    eletronicos = "eletronicos"
    livros = "livros"
    instrumentos_musicais = "instrumentos_musicais"
    casa_decoracao = "casa_decoracao"
    diversos = "diversos"
    # Aliases retrocompatíveis
    roupas = "roupas"
    calcados = "calcados"
    acessorios = "acessorios"
    casa = "casa"
    brinquedos = "brinquedos"
    outros = "outros"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            val_lower = value.lower().strip()
            if "roupa" in val_lower or "calçado" in val_lower or "calcado" in val_lower:
                return cls.roupas_acessorios
            if "eletr" in val_lower:
                return cls.eletronicos
            if "livro" in val_lower:
                return cls.livros
            if "instru" in val_lower or "music" in val_lower:
                return cls.instrumentos_musicais
            if "casa" in val_lower or "decor" in val_lower:
                return cls.casa_decoracao
            if "diver" in val_lower:
                return cls.diversos
        return None


class ProdutoBase(BaseModel):
    nome: Optional[str] = Field(None, max_length=255)
    condicao: ProductCondition
    categoria: ProductCategory
    observacoes_usuario: Optional[str] = ""
    preco_usuario: float = Field(..., gt=0)


class ProdutoCreate(ProdutoBase):
    pass


class ProdutoResponse(ProdutoBase):
    id: str | UUID
    fotos: List[str] = []
    status: ProductStatus
    created_at: datetime | str
    descricao_curta: Optional[str] = None
    descricao_longa: Optional[str] = None
    preco_medio_mercado: Optional[float] = None
    preco_sugerido: Optional[float] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
