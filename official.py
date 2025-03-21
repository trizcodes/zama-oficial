import requests

def get_official_data():
    """
    Tenta consultar uma API oficial para obter dados da distribuidora.
    Se falhar, retorna dados dummy.
    """
    try:
        # URL fictícia – substitua por uma URL real se disponível
        response = requests.get("https://api.exemplo.com/official-data", timeout=5)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print("Erro na consulta da API oficial:", e)
    
    # Dados dummy caso a API não responda
    data = {
        "distribuidora": "Amazonas Energia",
        "status_rede": "Operacional",
        "manutencoes_programadas": [
            {"local": "Zona Leste", "horario": "2025-03-22T10:00:00", "duracao": "2h"}
        ]
    }
    return data