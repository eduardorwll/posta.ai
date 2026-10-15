import os
import shutil
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status

from ..config import MAX_PHOTOS_PER_PRODUCT, STORAGE_PATH
from ..repositories.product_repository import ProductRepository
from ..schemas.product import (
    ProductCategory,
    ProductCondition,
    ProdutoResponse,
)

router = APIRouter(prefix="/produtos", tags=["produtos"])


def get_repository() -> ProductRepository:
    return ProductRepository()


def format_photo_urls(request: Request, produto_id: str, photo_names: List[str]) -> List[str]:
    base_url = str(request.base_url).rstrip("/")
    return [f"{base_url}/storage/produtos/{produto_id}/{url}" for url in photo_names]


@router.post("", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
async def criar_produto(
    request: Request,
    nome: str = Form(..., min_length=3, max_length=80),
    condicao: ProductCondition = Form(...),
    categoria: ProductCategory = Form(...),
    observacoes_usuario: str = Form(default=""),
    preco_usuario: float = Form(..., gt=0),
    fotos: list[UploadFile] = File(default=[]),
    repo: ProductRepository = Depends(get_repository),
):
    if not fotos or len(fotos) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Adicione ao menos 1 foto.",
        )

    if len(fotos) > MAX_PHOTOS_PER_PRODUCT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Máximo de {MAX_PHOTOS_PER_PRODUCT} fotos permitidas.",
        )

    produto_id = str(uuid.uuid4())
    produto_dir = Path(STORAGE_PATH) / "produtos" / produto_id
    produto_dir.mkdir(parents=True, exist_ok=True)

    foto_filenames = []
    try:
        for idx, file in enumerate(fotos):
            if not file.filename:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Arquivo sem nome válido.",
                )

            ext = Path(file.filename).suffix or ".jpg"
            foto_filename = f"foto_{idx}{ext}"
            foto_path = produto_dir / foto_filename

            contents = await file.read()
            with open(foto_path, "wb") as f:
                f.write(contents)

            foto_filenames.append(foto_filename)

    except HTTPException:
        shutil.rmtree(produto_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(produto_dir, ignore_errors=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao processar fotos: {str(e)}",
        )

    try:
        row = await repo.create(
            produto_id=produto_id,
            nome=nome,
            condicao=condicao.value if hasattr(condicao, "value") else str(condicao),
            categoria=categoria.value if hasattr(categoria, "value") else str(categoria),
            observacoes_usuario=observacoes_usuario,
            preco_usuario=preco_usuario,
            fotos=foto_filenames,
        )

        foto_completes = format_photo_urls(request, produto_id, foto_filenames)

        return ProdutoResponse(
            id=str(row["id"]),
            created_at=row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"]),
            nome=row["nome"],
            condicao=row["condicao"],
            categoria=row["categoria"],
            observacoes_usuario=row["observacoes_usuario"],
            preco_usuario=float(row["preco_usuario"]),
            fotos=foto_completes,
            status=row["status"],
            descricao_curta=row.get("descricao_curta"),
            descricao_longa=row.get("descricao_longa"),
            preco_medio_mercado=float(row["preco_medio_mercado"]) if row.get("preco_medio_mercado") else None,
            preco_sugerido=float(row["preco_sugerido"]) if row.get("preco_sugerido") else None,
        )

    except Exception as e:
        shutil.rmtree(produto_dir, ignore_errors=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar produto: {str(e)}",
        )


@router.get("", response_model=list[ProdutoResponse])
async def listar_produtos(
    request: Request,
    repo: ProductRepository = Depends(get_repository),
):
    try:
        rows = await repo.list_all()
        produtos = []
        for row in rows:
            foto_completes = format_photo_urls(request, str(row["id"]), row.get("fotos") or [])
            produtos.append(
                ProdutoResponse(
                    id=str(row["id"]),
                    created_at=row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"]),
                    nome=row["nome"],
                    condicao=row["condicao"],
                    categoria=row["categoria"],
                    observacoes_usuario=row["observacoes_usuario"],
                    preco_usuario=float(row["preco_usuario"]),
                    fotos=foto_completes,
                    status=row["status"],
                    descricao_curta=row.get("descricao_curta"),
                    descricao_longa=row.get("descricao_longa"),
                    preco_medio_mercado=float(row["preco_medio_mercado"]) if row.get("preco_medio_mercado") else None,
                    preco_sugerido=float(row["preco_sugerido"]) if row.get("preco_sugerido") else None,
                )
            )
        return produtos

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar produtos: {str(e)}",
        )


@router.get("/{id}", response_model=ProdutoResponse)
async def obter_produto(
    id: str,
    request: Request,
    repo: ProductRepository = Depends(get_repository),
):
    try:
        row = await repo.get_by_id(id)
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado.",
            )

        foto_completes = format_photo_urls(request, str(row["id"]), row.get("fotos") or [])

        return ProdutoResponse(
            id=str(row["id"]),
            created_at=row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"]),
            nome=row["nome"],
            condicao=row["condicao"],
            categoria=row["categoria"],
            observacoes_usuario=row["observacoes_usuario"],
            preco_usuario=float(row["preco_usuario"]),
            fotos=foto_completes,
            status=row["status"],
            descricao_curta=row.get("descricao_curta"),
            descricao_longa=row.get("descricao_longa"),
            preco_medio_mercado=float(row["preco_medio_mercado"]) if row.get("preco_medio_mercado") else None,
            preco_sugerido=float(row["preco_sugerido"]) if row.get("preco_sugerido") else None,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter produto: {str(e)}",
        )