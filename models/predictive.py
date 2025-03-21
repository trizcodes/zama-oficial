def predict_outage(data):
    """
    Função dummy para prever queda de energia.
    Se a chuva (rainfall) for maior que 50 mm, retorna alta probabilidade.
    """
    threshold = 50
    rainfall = data.get('rainfall', 0)
    if rainfall > threshold:
        return {"probabilidade_queda": 0.9, "mensagem": "Alta probabilidade de queda"}
    else:
        return {"probabilidade_queda": 0.1, "mensagem": "Baixa probabilidade de queda"}
