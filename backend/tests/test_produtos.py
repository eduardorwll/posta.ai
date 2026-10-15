import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_criar_produto_sem_fotos(async_client: AsyncClient):
    data = {
        "nome": "Camiseta Teste",
        "condicao": "novo",
        "categoria": "roupas_acessorios",
        "observacoes_usuario": "Teste sem foto",
        "preco_usuario": "49.90",
    }
    response = await async_client.post("/produtos", data=data)
    assert response.status_code == 400
    assert "Adicione ao menos 1 foto" in response.json()["detail"]


@pytest.mark.asyncio
async def test_criar_produto_muitas_fotos(async_client: AsyncClient):
    data = {
        "nome": "Camiseta Teste",
        "condicao": "novo",
        "categoria": "roupas_acessorios",
        "observacoes_usuario": "Teste muitas fotos",
        "preco_usuario": "49.90",
    }
    files = [("fotos", (f"foto_{i}.jpg", b"fakeimgbytes", "image/jpeg")) for i in range(6)]
    response = await async_client.post("/produtos", data=data, files=files)
    assert response.status_code == 400
    assert "Máximo de" in response.json()["detail"]


@pytest.mark.asyncio
async def test_criar_produto_sucesso_e_listar(async_client: AsyncClient):
    data = {
        "nome": "Tênis Esportivo Pro",
        "condicao": "seminovo",
        "categoria": "roupas_acessorios",
        "observacoes_usuario": "Pouco uso, estado impecável",
        "preco_usuario": "149.90",
    }
    files = [("fotos", ("tenis.jpg", b"faketenisbytes", "image/jpeg"))]

    response = await async_client.post("/produtos", data=data, files=files)
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["nome"] == "Tênis Esportivo Pro"
    assert json_data["preco_usuario"] == 149.90
    assert json_data["condicao"] == "seminovo"
    assert json_data["categoria"] == "roupas_acessorios"
    assert len(json_data["fotos"]) == 1
    produto_id = json_data["id"]

    # Testar GET /produtos/{id}
    resp_get = await async_client.get(f"/produtos/{produto_id}")
    assert resp_get.status_code == 200
    assert resp_get.json()["id"] == produto_id

    # Testar GET /produtos
    resp_list = await async_client.get("/produtos")
    assert resp_list.status_code == 200
    produtos = resp_list.json()
    assert isinstance(produtos, list)
    assert any(p["id"] == produto_id for p in produtos)


@pytest.mark.asyncio
async def test_criar_produto_com_categoria_legada(async_client: AsyncClient):
    data = {
        "nome": "Jaqueta Vintage",
        "condicao": "como_novo",
        "categoria": "Roupas e Calcados",
        "observacoes_usuario": "Teste normalizador enum",
        "preco_usuario": "199.00",
    }
    files = [("fotos", ("jaqueta.jpg", b"fakejaquetabytes", "image/jpeg"))]

    response = await async_client.post("/produtos", data=data, files=files)
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["categoria"] == "roupas_acessorios"


@pytest.mark.asyncio
async def test_obter_produto_nao_encontrado(async_client: AsyncClient):
    response = await async_client.get("/produtos/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    assert "não encontrado" in response.json()["detail"].lower()
