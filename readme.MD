ZAMA – Zona de Aviso Manaus
ZAMA é um sistema que fornece informações em tempo real sobre a situação de energia em Manaus. Ele integra dados oficiais, relatos dos usuários e, futuramente, previsões de quedas de energia para manter você informado sobre as áreas afetadas.

Funcionalidades
Mapa Interativo:
Visualize um mapa focado em Manaus que destaca os bairros com base no status da energia:

Energia disponível: Exibido com um círculo amarelo.
Energia em análise: Se houver relatos (1 a 9) de falta de energia, o sistema mostra um alerta com um círculo transparente e borda cinza.
Bairro sem energia: Quando há 10 ou mais relatos, é exibida uma mensagem profissional informando que o bairro está sem energia e que as operadoras já foram alertadas, com liberação temporária de dados móveis.
Registro de Relatos:
Os usuários podem reportar apagões. Cada relato é registrado com data e hora e atualizado automaticamente no feed. O sistema exibe os relatos em páginas (5 relatos por página).

Notícias da Amazonas Energia:
Notícias reais são buscadas de uma fonte oficial e exibidas em uma área dedicada.

Funcionalidade em Desenvolvimento:
Um botão "Notificar sobre possíveis quedas de luz" informa que essa opção ainda está em fase de testes.

Como Usar
Visualizar Status de Energia:
Clique em Visualizar status de energia ou na área interativa do "Status da Sua Região" para ativar a geolocalização. O sistema identificará seu bairro e exibirá o status:

Se não houver relatos, mostrará que a energia está disponível.
Se houver relatos, mostrará que a energia está em análise.
Se houver 10 ou mais relatos, indicará que o bairro está sem energia e que as operadoras foram alertadas.
Reportar Apagões:
Clique em Reportar que está sem luz para enviar um relato do apagão no seu bairro. Após o envio, o sistema atualizará o status e o feed de relatos automaticamente.

Notificar Quedas de Luz:
Ao clicar em Notificar sobre possíveis quedas de luz, um popup informará que essa funcionalidade está em desenvolvimento e que, em breve, você poderá receber alertas sobre possíveis quedas.

Consultar Notícias:
A seção de Notícias da Amazonas Energia exibirá as últimas notícias oficiais. Clique nos links para ler mais.

Como Rodar o Projeto
Pré-Requisitos
Navegador com Internet: Para carregar os mapas (Leaflet) e acessar as APIs de notícias.
Servidor Local:
Você pode rodar o projeto como arquivos estáticos ou integrá-lo a um backend (por exemplo, usando Flask) se precisar de endpoints adicionais.
Execução
Rodando como Arquivos Estáticos:
Abra o arquivo index.html no seu navegador ou use um servidor simples:

bash
Copiar código
python -m http.server
Em seguida, acesse http://localhost:8000/index.html.

Backend com Flask (opcional):
Se você tiver um backend (por exemplo, para fornecer o endpoint /amazonas-news), inicie o servidor Flask e acesse http://127.0.0.1:5000.

Estrutura do Projeto
index.html:
Contém a estrutura principal da página (cabeçalho, seções para mapa, status, relatos e notícias, e rodapé).

static/css/style.css:
Define os estilos e layout do site (cores, fontes, posicionamento dos elementos, etc.).

static/js/script.js:
Contém a lógica JavaScript para:

Inicializar o mapa com Leaflet.
Gerenciar geolocalização e atualizar o status de energia.
Registrar relatos e atualizar o feed com paginação.
Carregar notícias e exibir popups informativos.
Futuras Melhorias
Modelo Preditivo:
Treinar um modelo com dados históricos e meteorológicos para prever quedas de energia automaticamente.

Integração de Dados Oficiais:
Conectar a APIs de distribuidoras e órgãos governamentais para obter dados atualizados em tempo real.

Notificações Avançadas:
Desenvolver a funcionalidade de notificar sobre possíveis quedas de energia com alertas automáticos.

Créditos
Desenvolvido por TrizCodes
© 2025 ZAMA – Zona de Aviso Manaus