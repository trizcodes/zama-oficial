import requests
from bs4 import BeautifulSoup

def scrape_amazonas_noticias():
    url = 'https://website.amazonasenergia.com/informacoes/destaques/'
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; SeuProjetoBot/1.0; +https://seudominio.com)'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Levanta exceção para status != 200
    except requests.RequestException as e:
        print("Erro ao acessar a página:", e)
        return []  # Retorna lista vazia em caso de erro
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Busca os links com a classe "ek-link" que contêm as notícias
    news_links = soup.find_all('a', class_='ek-link')
    
    noticias = []
    for link in news_links[:6]:
        title = link.get_text(strip=True)
        href = link.get('href')
        # Caso o href não seja absoluto, você pode concatenar com o domínio
        if href and not href.startswith('http'):
            href = "https://website.amazonasenergia.com" + href
        noticias.append({"title": title, "url": href})
    
    return noticias

if __name__ == '__main__':
    noticias = scrape_amazonas_noticias()
    for noticia in noticias:
        print(noticia)
