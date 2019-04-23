// Forms
var formStep1 = document.querySelector('#formStep1');
// Inputs
var inputQtdCompartimentos = document.querySelector('#inputQtdCompartimentos');
var inputTempo = document.querySelector('#inputTempo');
// Selects
var comboCompartimentoSelecionado = document.querySelector('#comboCompartimentoSelecionado');
// Buttons
var btnSalvar = document.querySelector('#btnSalvar');
var btnSimular = document.querySelector('#btnSimular');
// Utils
var configuracoes = document.querySelector('#configuracoes');
var qtdInicial = document.querySelector('#qtdInicial');
var componentConfigCompartimento = document.querySelector('[config-compartimento]');
var alerts = document.querySelector('[alerts]');
var storage = [];
var listAlerts = [];
var timeouts = [];
var qtdCompartimentos;

// ################################ Main Component ################################


/**
 * Verifica se a quantidade de compartimentos é igual ou superior à 2
 */
function setQuantidadeCompartimentos() {
    // Valida a qtd
    if (Number(inputQtdCompartimentos.value) < 2) {
        showAlert("O mínimo de compartimentos é 2.");
    } else { // Reseta o storage de compartimentos
        storage = [];
        // Passa para o proximo Step Criando os compartimentos de acordo com a qtd informada
        if (formStep1.checkValidity()) {
            $('.carousel').carousel('next');
            comboCompartimentoSelecionado.innerHTML = createListOptions();
            qtdCompartimentos = Number(inputQtdCompartimentos.value);
        }
    }
}

/**
 * Observa qualquer alteração feita no combo dos compartimentos para preencher os formularios que ja foram salvos
 */
function changeCompartimento() {
    // Rendereriza opções para o compartimento selecionado
    componentConfigCompartimento.innerHTML = configSelect(Number(comboCompartimentoSelecionado.value));
    // Preenche os campos que ja foram salvos
    qtdInicial.value = 0;
    if (comboCompartimentoSelecionado.value !== "") {
        btnSalvar.disabled = false;
        configuracoes.style.display = "block";
        var atual = storage[comboCompartimentoSelecionado.value];
        if (atual) {
            qtdInicial.value = atual.qtdInicial;
            for (let i = 1; i <= qtdCompartimentos; i++) {
                if (i !== Number(comboCompartimentoSelecionado.value)) {
                    var check = document.querySelector(`#check${i}`);
                    var taxa = document.querySelector(`#taxa${i}`);
                    var item = document.querySelector(`#form${i}`);
                    for (let j = 0; j < atual.saidas.length; j++) {
                        if (atual.saidas[j].compartimento === i && check && taxa) {
                            check.checked = true;
                            taxa.value = atual.saidas[j].taxa;
                            item.style.display = "flex";
                        }
                    }
                }
            }
        }
    } else {
        btnSalvar.disabled = true;
        configuracoes.style.display = "none";
    }
}

/**
 * Renderiza os compartimentos possiveis, onde o compartimento selecionado possa realizar tranferencias
 * @param atual - Compartimento atual 
 */
function configSelect(atual) {
    var result = ``;
    for (let i = 1; i <= qtdCompartimentos; i++) {
        if (i !== atual) {
            result += `
            <form>
                <div class="input-group row">
                    <div class="col-sm-3"></div>
                    <div class="col-sm-10">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="check${i}" onchange="return showElement(form${i})">
                            <label class="form-check-label" id="check${i}">
                
                            Tranfere para Compartimento ${i}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="input-group row" id="form${i}" style="display: none">
                    <label for="form${i}" class="col-sm-3 col-form-label"> Taxa Transferência</label>
                    <div class="input-group-prepend">
                        <div class="input-group-text"> % </div>
                    </div>
                    <input type="number" class="form-control" id="taxa${i}" placeholder="Taxa">
                </div>
            </form>`;
        }
    }
    return result;
}

/**
 * Cria a lista de compartimentos para o combo
 */
function createListOptions() {
    var result = `<option value="" selected>Selecione um Compartimento</option>`;
    for (let i = 1; i <= qtdCompartimentos; i++) {
        result += `<option value="${i}">Compartimento ${i}</option>`;
    }
    return result;
}


/**
 * Usando o css display esta função mostra ou não um elemento
 * @param el - Elemento HTML 
 */
function showElement(el) {
    if (el.style.display === "none") {
        el.style.display = "flex";
    } else {
        el.style.display = "none";
    }
}

/**
 * Salva as configurações feitas para o compartimento selecionado
 */
function saveConfigs() {
    var indexAtual = Number(comboCompartimentoSelecionado.value);
    var saidas = [];

    for (let i = 1; i <= qtdCompartimentos; i++) {
        var check = document.querySelector(`#check${i}`);
        var item = document.querySelector(`#taxa${i}`);
        if (i !== indexAtual && check && check.checked &&  Number(item.value)) {
            saidas.push({
                compartimento: i,
                taxa: - Number(item.value)
            });
            if (!storage[i]) {
                storage[i] = {
                    compartimento: i,
                    qtdInicial: 0,
                    saidas: [],
                    entradas: [{
                        compartimento: comboCompartimentoSelecionado.value,
                        taxa: - Number(item.value)
                    }]
                };
            } else {
                storage[i].entradas.push({
                    compartimento: comboCompartimentoSelecionado.value,
                    taxa: Number(item.value)
                });
            }
        } 
    }

    if (saidas.length > 0) {
        if (!storage[comboCompartimentoSelecionado.value]) {
            var temp = {
                compartimento: Number(comboCompartimentoSelecionado.value),
                qtdInicial: Number(qtdInicial.value),
                saidas: saidas,
                entradas: []
            }
            storage[comboCompartimentoSelecionado.value] = temp;
        } else {
            storage[comboCompartimentoSelecionado.value].saidas = [...storage[comboCompartimentoSelecionado.value].saidas, ...saidas];
        }
        btnSimular.disabled = false;
        showAlert("Dados salvos com sucesso!", 'success');
    } else {
        showAlert("Selecione ao menos 1 Compartimento de Transferência")
    }
}

/**
 * Muda de step e desenha os comprtimentos com as quantidades iniciais
 */
function continuarSimulacao() {
    $('.carousel').carousel('next');
    var comp = document.querySelector('[compartimentos]');
    var drawAll = ``;
    for (let i = 0; i <= qtdCompartimentos; i++) {
        var atual = storage[i+1];
        if (atual) {
            drawAll += `<div style="left: ${(atual.compartimento - 1)*170}px" id="compart${atual.compartimento}" class="compartimento"></div>`
        }
    }
    comp.innerHTML = drawAll;
    simularTransferencias();
}

function simularTransferencias() {
    time = isNaN(Number(inputTempo.value)) ? 0 : Number(inputTempo.value); 
    setTimeout(() => {
        for (let i = 1; i <= qtdCompartimentos; i++) {
            item = storage[i];
            var el = document.querySelector(`#compart${item.compartimento}`);
            var taxaEntradaFinal = 0;
            var taxaSaidaFinal = 0;
            var qtdEntradaFinal = 0;
            var calculo = 0;

            for (const entrada of item.entradas) {
                taxaEntradaFinal += entrada.taxa;
                qtdEntradaFinal += storage[entrada.compartimento].qtdInicial;
            }
            for (const saida of item.saidas) {
                taxaSaidaFinal += saida.taxa; 
            }
            item.taxaEntradaFinal = taxaEntradaFinal;
            item.taxaSaidaFinal = taxaSaidaFinal;
            calculo += (100 * (1 - calculoTransferencia(qtdEntradaFinal, time, item.taxaEntradaFinal)));
            calculo += (100 * calculoTransferencia(item.qtdInicial, time, item.taxaSaidaFinal));
            el.style.height = `${calculo}px`;
        }
    }, 1000);
}

function calculoTransferencia(qtdInicial, inputTempo, taxa) {
    if (qtdInicial === 0) { return 1; }
    return (qtdInicial*Math.exp(inputTempo*taxa))/qtdInicial;
}


// ################################ Alert Component ################################

/**
 * Alert
 * @param message 
 * @param type 
 */
function showAlert(message, type = 'warning') {
    var alert = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="alert${listAlerts.length + 1}">
        <strong>${message}</strong>
        <button type="button" class="close" aria-label="Close" onclick="closeAlert(${listAlerts.length + 1})">
        <span aria-hidden="true">&times;</span>
        </button>
    </div>
    `;
    listAlerts.push(alert);
    drawAlerts();
    timeouts.push(setTimeout(() => {
        listAlerts.shift();
        drawAlerts();
    }, 3000));
}

/**
 * Desenha alerts da fila
 */
function drawAlerts() {
    var temp = ``;
    for (const item of listAlerts) {
        temp += item;
    }
    alerts.innerHTML = temp;
}

/**
 * Remove alert
 * @param indexAlert 
 */
function closeAlert(indexAlert) {
    for (let index = 0; index < listAlerts.length; index++) {
        if (listAlerts[index].indexOf(`alert${indexAlert}`) > -1) {
            listAlerts.splice(index, 1);
            clearTimeout(timeouts[index]);
            break;
        }
    }
    drawAlerts();
}


//############# Funçoes para calculo do Sistema de EDO's ainda em desenvolvimento ##################

function rungeKuttaOrdemDois (passo, y0, intervaloInferior, intervaloSuperior, taxa) {
    var x = intervaloInferior;
    var y = y0;
    var k1, k2;
    var yn = y0;

    var n = (intervaloSuperior - intervaloInferior) / passo;
    for(var i = 0; i < n; i++) {
        k1 = funcao(x, y, taxa);
        k2 = funcao(x + passo, y + (passo*k1), taxa);
        yn = y + passo/2*(k1+k2);
        x += passo;
        y = yn;
    }
    return yn/y0;

}

function funcao(x, y, taxa) {
    return y * Math.exp(taxa * x );
}
