document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const pesoForm = document.getElementById('peso-form');
    const dataInput = document.getElementById('data');
    const pesoInput = document.getElementById('peso');
    const historicoBody = document.getElementById('historico-body');
    const semRegistros = document.getElementById('sem-registros');
    const pesoChart = document.getElementById('peso-chart');
    const pesoInicial = document.getElementById('peso-inicial');
    const pesoAtual = document.getElementById('peso-atual');
    const pesoDiferenca = document.getElementById('peso-diferenca');
    const toast = document.getElementById('toast');
    const quoteText = document.getElementById('quote-text');

    // Definir data atual no input
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];
    dataInput.value = dataHoje;
    dataInput.max = dataHoje; // Impedir datas futuras

    // Carregar dados do localStorage
    let registros = JSON.parse(localStorage.getItem('registrosPeso')) || [];

    // Instância do gráfico
    let grafico = null;

    // Frases motivacionais
    const frases = [
        "O sucesso não é dado. É conquistado. Na pista, no campo, na academia. Com sangue, suor e o trabalho ocasional de uma lágrima.",
        "A dor que você sente hoje será a força que você sentirá amanhã.",
        "Não importa o quão devagar você vá, desde que você não pare.",
        "Seu corpo consegue quase tudo. É sua mente que você precisa convencer.",
        "Fitness não é sobre ser melhor que outra pessoa. É sobre ser melhor do que você costumava ser.",
        "O único treino ruim é aquele que não aconteceu.",
        "Não conte os dias, faça os dias contarem.",
        "Você não encontra tempo para se exercitar, você cria tempo para isso."
    ];

    // Função para formatar data (DD/MM/YYYY)
    function formatarData(dataString) {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Função para salvar dados no localStorage
    function salvarDados() {
        localStorage.setItem('registrosPeso', JSON.stringify(registros));
    }

    // Função para mostrar toast
    function mostrarToast(mensagem, tipo = 'success') {
        const toastIcon = document.querySelector('.toast-icon i');
        const toastMessage = document.querySelector('.toast-message');
        
        if (tipo === 'success') {
            toastIcon.className = 'fas fa-check-circle';
            document.querySelector('.toast-icon').style.color = 'var(--success)';
        } else if (tipo === 'error') {
            toastIcon.className = 'fas fa-exclamation-circle';
            document.querySelector('.toast-icon').style.color = 'var(--error)';
        }
        
        toastMessage.textContent = mensagem;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Função para atualizar a tabela de histórico
    function atualizarHistorico() {
        historicoBody.innerHTML = '';
        
        if (registros.length === 0) {
            semRegistros.classList.remove('hidden');
            return;
        }
        
        semRegistros.classList.add('hidden');
        
        // Ordenar por data (mais recente primeiro)
        const registrosOrdenados = [...registros].sort((a, b) => 
            new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        
        registrosOrdenados.forEach((registro, index) => {
            const row = document.createElement('tr');
            
            // Calcular variação
            let variacaoHTML = '--';
            if (index < registrosOrdenados.length - 1) {
                const pesoAtual = registro.peso;
                const pesoAnterior = registrosOrdenados[index + 1].peso;
                const variacao = (pesoAtual - pesoAnterior).toFixed(1);
                
                if (variacao < 0) {
                    variacaoHTML = `<span class="negative">${variacao} kg</span>`;
                } else if (variacao > 0) {
                    variacaoHTML = `<span class="positive">+${variacao} kg</span>`;
                } else {
                    variacaoHTML = `<span>0 kg</span>`;
                }
            }
            
            row.innerHTML = `
                <td>${formatarData(registro.data)}</td>
                <td>${registro.peso} kg</td>
                <td>${variacaoHTML}</td>
                <td>
                    <button class="btn btn-small btn-danger excluir-registro" data-id="${registro.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            historicoBody.appendChild(row);
        });
        
        // Adicionar event listeners para botões de excluir
        document.querySelectorAll('.excluir-registro').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                excluirRegistro(id);
            });
        });
    }

    // Função para atualizar o gráfico
    function atualizarGrafico() {
        if (registros.length === 0) {
            if (grafico) {
                grafico.destroy();
                grafico = null;
            }
            return;
        }
        
        // Ordenar por data (mais antiga primeiro para o gráfico)
        const registrosOrdenados = [...registros].sort((a, b) => 
            new Date(a.data).getTime() - new Date(b.data).getTime()
        );
        
        const labels = registrosOrdenados.map(registro => formatarData(registro.data));
        const dados = registrosOrdenados.map(registro => registro.peso);
        
        // Destruir gráfico existente se houver
        if (grafico) {
            grafico.destroy();
        }
        
        // Criar novo gráfico
        grafico = new Chart(pesoChart, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Peso (kg)',
                    data: dados,
                    backgroundColor: 'rgba(98, 0, 234, 0.2)',
                    borderColor: 'rgba(98, 0, 234, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(98, 0, 234, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 10,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Função para atualizar estatísticas
    function atualizarEstatisticas() {
        if (registros.length === 0) {
            pesoInicial.textContent = '--';
            pesoAtual.textContent = '--';
            pesoDiferenca.textContent = '--';
            return;
        }
        
        // Ordenar por data
        const registrosOrdenados = [...registros].sort((a, b) => 
            new Date(a.data).getTime() - new Date(b.data).getTime()
        );
        
        const primeiro = registrosOrdenados[0].peso;
        const ultimo = registrosOrdenados[registrosOrdenados.length - 1].peso;
        const diferenca = (ultimo - primeiro).toFixed(1);
        
        pesoInicial.textContent = `${primeiro} kg`;
        pesoAtual.textContent = `${ultimo} kg`;
        
        if (diferenca < 0) {
            pesoDiferenca.textContent = `${diferenca} kg`;
            pesoDiferenca.className = 'stat-value negative';
        } else if (diferenca > 0) {
            pesoDiferenca.textContent = `+${diferenca} kg`;
            pesoDiferenca.className = 'stat-value positive';
        } else {
            pesoDiferenca.textContent = `${diferenca} kg`;
            pesoDiferenca.className = 'stat-value';
        }
    }

    // Função para adicionar novo registro
    function adicionarRegistro(data, peso) {
        // Verificar se já existe um registro para esta data
        const registroExistente = registros.find(r => r.data === data);
        
        if (registroExistente) {
            if (confirm('Já existe um registro para esta data. Deseja substituí-lo?')) {
                registroExistente.peso = peso;
                mostrarToast('Registro atualizado com sucesso!');
            } else {
                return false;
            }
        } else {
            // Criar novo registro
            const novoRegistro = {
                id: Date.now().toString(), // ID único baseado no timestamp
                data: data,
                peso: peso
            };
            
            registros.push(novoRegistro);
            mostrarToast('Novo registro adicionado com sucesso!');
        }
        
        salvarDados();
        return true;
    }

    // Função para excluir registro
    function excluirRegistro(id) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            registros = registros.filter(registro => registro.id !== id);
            salvarDados();
            atualizarHistorico();
            atualizarGrafico();
            atualizarEstatisticas();
            mostrarToast('Registro excluído com sucesso!');
        }
    }

    // Event Listeners
    pesoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const data = dataInput.value;
        const peso = parseFloat(pesoInput.value);
        
        if (!data || !peso) {
            mostrarToast('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (adicionarRegistro(data, peso)) {
            pesoInput.value = '';
            atualizarHistorico();
            atualizarGrafico();
            atualizarEstatisticas();
        }
    });

    // Mudar frase motivacional a cada 10 segundos
    function mudarFrase() {
        const fraseAtual = quoteText.textContent;
        let novaFrase;
        
        do {
            novaFrase = frases[Math.floor(Math.random() * frases.length)];
        } while (novaFrase === fraseAtual && frases.length > 1);
        
        quoteText.style.opacity = 0;
        
        setTimeout(() => {
            quoteText.textContent = novaFrase;
            quoteText.style.opacity = 1;
        }, 500);
    }

    setInterval(mudarFrase, 10000);

    // Inicializar
    atualizarHistorico();
    atualizarGrafico();
    atualizarEstatisticas();
});