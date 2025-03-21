document.addEventListener("DOMContentLoaded", function() {
  // globais
  let energyPopupShown = false;
  let currentPage = 1;
  const itemsPerPage = 5;
  let powerCircle = null;
  let outageReports = [];

  // coordenadas em Manaus
  function isInManaus(lat, lng) {
    return lat >= -3.5 && lat <= -2.5 && lng >= -60.5 && lng <= -59.5;
  }

  // (retorna apenas o bairro)
  function reverseGeocode(lat, lng, callback) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.address) {
          const neighborhood = data.address.neighbourhood || data.address.suburb || data.address.city_district || "Desconhecido";
          callback(neighborhood);
        } else {
          callback("Desconhecido");
        }
      })
      .catch(() => callback("Desconhecido"));
  }

  // popup personalizado
  function showCustomPopup(message) {
    const popup = document.createElement("div");
    popup.id = "customPopup";
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || "#0d47a1";
    const accentColor = "#ffc107";
    
    popup.style.position = "fixed";
    popup.style.top = "20%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = `linear-gradient(to bottom, ${primaryColor}, #1976d2)`;
    popup.style.color = "#fff";
    popup.style.padding = "20px 30px";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
    popup.style.zIndex = "1000";
    popup.style.fontSize = "1.2rem";
    popup.style.borderTop = `4px solid ${accentColor}`;
    popup.style.opacity = "0";
    popup.style.transition = "opacity 0.5s ease-in-out";

    const closeButton = document.createElement("span");
    closeButton.innerHTML = "&times;";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "15px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "1.5rem";
    closeButton.style.color = accentColor;
    closeButton.addEventListener("click", function() {
      popup.style.opacity = "0";
      setTimeout(() => { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 300);
    });
    popup.appendChild(closeButton);

    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = message;
    popup.appendChild(messageDiv);

    document.body.appendChild(popup);
    void popup.offsetWidth;
    popup.style.opacity = "1";

    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 500);
    }, 10000);
  }

  // notifyDevelopment 
  function notifyDevelopment() {
    console.log("notifyDevelopment() foi chamada");
    showCustomPopup("Funcionalidade em desenvolvimento: A opção de notificar sobre possíveis quedas de luz ainda está em fase de testes. Estamos aprimorando a integração com os dados de rede e meteorológicos para fornecer notificações precisas. Em breve, você poderá ativar essa opção para receber alertas diretamente em seu dispositivo");
  }


  // "Como prevemos as quedas?"
  const btnComoPrever = document.getElementById('btnComoPrever');
  if (btnComoPrever) {
    btnComoPrever.addEventListener("click", () => {
      showCustomPopup("Nosso sistema utiliza dados históricos, meteorológicos e relatos dos usuários para prever a probabilidade de quedas de energia. Essa previsão é feita com modelos preditivos que analisam as condições atuais e históricas para alertar você em tempo real");
    });
  }

  // formulário de aviso
  const alertForm = document.getElementById('alertSubscriptionForm');
  if (alertForm) {
    alertForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const contact = document.getElementById('alertContactInfo').value;
      if (contact.trim() === "") {
        alert("Por favor, informe seu e-mail ou telefone");
        return;
      }
      showCustomPopup("Inscrição realizada com sucesso! Você receberá avisos sobre possíveis quedas");
      document.getElementById('alertContactInfo').value = "";
    });
  }
  
  // mapa em Manaus
  const map = L.map('map').setView([-3.119, -60.0217], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Exibe a data de hoje
  const todayDateEl = document.getElementById('todayDate');
  if (todayDateEl) {
    todayDateEl.textContent = new Date().toLocaleDateString('pt-BR');
  }
  
  //  status de energia
  // triggerPopup: se true, exibe o popup; se false, apenas atualiza o status sem popup
  function checkPowerStatus(triggerPopup = true) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (!isInManaus(lat, lng)) {
          alert("O serviço está disponível apenas para usuários em Manaus");
          return;
        }
        
        map.setView([lat, lng], 15);
        const today = new Date().toISOString().slice(0, 10);
        let todaysReports = outageReports.filter(report => report.date === today);
  
        reverseGeocode(lat, lng, function(neighborhood) {
          const statusMessageEl = document.getElementById('statusMessage');
          // Filtra os relatos para o bairro atual (comparação s diferenciar maiúsculas/minúsculas)
          const reportsInBairro = todaysReports.filter(report => report.neighborhood.toLowerCase() === neighborhood.toLowerCase());
  
          if (reportsInBairro.length === 0) {
            // Sem relatos: energia disponível
            const statusText = "Energia disponível no bairro " + neighborhood + "  ";
            if (powerCircle) { map.removeLayer(powerCircle); }
            powerCircle = L.circle([lat, lng], {
              radius: 2000,
              fillColor: "#ffc107",
              color: "#ffc107",
              fillOpacity: 0.5
            }).addTo(map).bindPopup(statusText).openPopup();
            statusMessageEl.innerHTML = `<p style="font-size: 1.1rem;">${statusText}</p>`;
            if (triggerPopup) showCustomPopup(statusText);
          } else if (reportsInBairro.length < 10) {
            // Entre 1 e 9 relatos: energia em análise
            const now = Date.now();
            const latestTimestamp = Math.max(...reportsInBairro.map(r => r.timestamp));
            let diffMinutes = Math.floor((now - latestTimestamp) / 60000);
            if(diffMinutes < 1) diffMinutes = 1;
            const analysisText = `Energia em análise no bairro ${neighborhood}. Houve ${reportsInBairro.length} relato(s) de falta de energia nos últimos ${diffMinutes} minuto(s).`;
            if (powerCircle) { map.removeLayer(powerCircle); }
            powerCircle = L.circle([lat, lng], {
              radius: 2000,
              fillColor: "transparent",
              color: "rgba(128,128,128,0.5)",
              fillOpacity: 0
            }).addTo(map).bindPopup(analysisText).openPopup();
            statusMessageEl.innerHTML = `<p style="font-size: 1.1rem;">${analysisText}</p>`;
            if (triggerPopup) showCustomPopup(analysisText);
          } else {
            // 10 ou mais relatos: bairro sem energia
            const now = Date.now();
            const latestTimestamp = Math.max(...reportsInBairro.map(r => r.timestamp));
            let diffMinutes = Math.floor((now - latestTimestamp) / 60000);
            if(diffMinutes < 1) diffMinutes = 1;
            const outageText = `Bairro sem energia: Houve ${reportsInBairro.length} relato(s) de falta de energia no bairro ${neighborhood} nos últimos ${diffMinutes} minuto(s). Por questões de segurança, enviamos um alerta para as operadoras, e o acesso aos dados móveis foi liberado para uso até que a energia retorne`;
            if (powerCircle) { map.removeLayer(powerCircle); }
            powerCircle = L.circle([lat, lng], {
              radius: 2000,
              fillColor: "transparent",
              color: "rgba(128,128,128,0.5)",
              fillOpacity: 0
            }).addTo(map).bindPopup(outageText).openPopup();
            statusMessageEl.innerHTML = `<p style="font-size: 1.1rem;">${outageText}</p>`;
            if (triggerPopup) showCustomPopup(outageText);
          }
        });
      }, function() {
        alert("Erro ao obter sua localização");
      });
    } else {
      alert("Geolocalização não suportada");
    }
  }
  
  // Função para reportar um apagão
  function reportOutage() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (!isInManaus(lat, lng)) {
          alert("O serviço de reporte está disponível apenas para usuários em Manaus");
          return;
        }
        
        const now = new Date();
        const datetime = now.toLocaleString('pt-BR');
        const dateStr = now.toISOString().slice(0, 10);
        const timestamp = Date.now();
        
        reverseGeocode(lat, lng, function(neighborhood) {
          const report = {
            address: neighborhood, // Usa somente o bairro
            neighborhood: neighborhood,
            datetime: datetime,
            date: dateStr,
            timestamp: timestamp,
            status: "DADOS MOVEIS"
          };
          outageReports.push(report);
          updateReports();
          L.circle([lat, lng], {
            radius: 2000,
            fillColor: "rgba(128,128,128,0.2)",
            color: "rgba(128,128,128,0.5)",
            fillOpacity: 0.5
          }).addTo(map).bindPopup("Relato: Bairro " + neighborhood + "<br>" + datetime).openPopup();
  
          fetch('/user-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
          })
          .then(response => response.json())
          .then(data => console.log("Relato enviado:", data))
          .finally(() => {
            checkPowerStatus(false);
          });
        });
      }, function() {
        alert("Erro ao obter sua localização. Verifique se a geolocalização está ativada");
      });
    } else {
      alert("Geolocalização não suportada.");
    }
  }
  
  // paginação (5 itens por página)
  function updateReports(triggerPopup = true) {
    const reportsFeed = document.getElementById('reportsFeed');
    const statusMessage = document.getElementById('statusMessage');
    const filterVal = document.getElementById('neighborhoodFilter').value.toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    
    let todaysReports = outageReports.filter(report => report.date === today);
    if (filterVal) {
      todaysReports = todaysReports.filter(report => report.neighborhood.toLowerCase().includes(filterVal));
    }
    
    const totalItems = todaysReports.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage > totalPages) {
      currentPage = totalPages || 1;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = todaysReports.slice(startIndex, startIndex + itemsPerPage);
    
    let html = "";
    if (totalItems === 0) {
      html = "<p>Nenhum relato registrado para hoje</p>";
    } else {
      html = pageItems.map(report => `
        <div class="report-item">
          <strong>Bairro:</strong> ${report.neighborhood}<br>
          <strong>Data/Horário:</strong> ${report.datetime}
        </div>
      `).join("");
    }
    
    html += `<p>Total de relatos: ${totalItems}</p>`;
    
    if (totalPages > 1) {
      html += `<div class="pagination">`;
      for (let i = 1; i <= totalPages; i++) {
        html += `<span class="page-link ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</span> `;
      }
      html += `</div>`;
    }
    
    reportsFeed.innerHTML = html;
    
    const pageLinks = document.querySelectorAll('.pagination .page-link');
    pageLinks.forEach(link => {
      link.addEventListener('click', function() {
        currentPage = parseInt(this.getAttribute('data-page'));
        updateReports(false);
      });
    });
    
    if (totalItems >= 10) {
      statusMessage.innerHTML = "<p>A operadora já foi avisada sobre o apagão nesta região e os dados móveis serão liberados em breve</p>";
      if (triggerPopup) showCustomPopup("Atenção: A operadora já foi avisada e os dados móveis serão liberados em breve. Total de relatos: " + totalItems);
    } else if (totalItems > 0) {
      statusMessage.innerHTML = "<p>Há relatos de apagão nesta região</p>";
      if (triggerPopup) showCustomPopup("Relato registrado: Há relatos de apagão nesta região. Total de relatos: " + totalItems);
    } else {
      statusMessage.innerHTML = "<p>Sua região tem energia</p>";
      if (!energyPopupShown && triggerPopup) {
        showCustomPopup("Sua região tem energia");
        energyPopupShown = true;
        setTimeout(() => { energyPopupShown = false; }, 6000);
      }
    }
  }
  
  window.checkPowerStatus = checkPowerStatus;
  window.reportOutage = reportOutage;
  window.notifyDevelopment = notifyDevelopment;
});

// Amazonas Energia via a rota /amazonas-news
function carregarNoticias() {
  fetch('/amazonas-news')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('amazonasNews');
      if (data && Array.isArray(data) && data.length > 0) {
        container.innerHTML = data.map(noticia => `
          <p>
            <a href="${noticia.url}" target="_blank" rel="noopener noreferrer">
              ${noticia.title}
            </a>
          </p>
        `).join("");
      } else {
        container.innerHTML = "<p>Nenhuma notícia encontrada</p>";
      }
    })
    .catch(error => {
      console.error("Erro ao carregar notícias:", error);
      document.getElementById('amazonasNews').innerHTML = "<p>Não foi possível carregar as notícias</p>";
    });
}

window.addEventListener('load', carregarNoticias);
