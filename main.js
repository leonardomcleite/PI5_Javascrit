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
var inputQtdInicial = document.querySelector('#inputQtdInicial');
var componentConfigCompartimento = document.querySelector('[config-compartimento]');
var alerts = document.querySelector('[alerts]');
var listAlerts = [];
var timeouts = [];
var qtdCompartimentos;
var storage = [];
// ################################ Main Component ################################


/**
 * Verifica se a quantidade de compartimentos é igual ou superior à 1
 */
function setQuantidadeCompartimentos() {
    RGK42(0.1, 1000, 1);
    RGK4(0.1, 0.5, 0.01, 1000, 0, 0, 1);
    // Valida a qtd
    if (Number(inputQtdCompartimentos.value) < 1) {
        showAlert("O mínimo de compartimentos é 1.");
    } else { // Reseta o storage de compartimentos
        storage = [];
        storage.push({
            compartimento: 0,
            qtdInicial: 0,
            saidas: [],
            entradas: []
        });        
        // Passa para o proximo Step Criando os compartimentos de acordo com a qtd informada
        if (formStep1.checkValidity()) {
            $('.carousel').carousel('next');
            qtdCompartimentos = Number(inputQtdCompartimentos.value);
            comboCompartimentoSelecionado.innerHTML = createListOptions();
        }
    }
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
 * Observa qualquer alteração feita no combo dos compartimentos para preencher os formularios que ja foram salvos
 */
function changeCompartimento() {
    // Rendereriza opções para o compartimento selecionado
    componentConfigCompartimento.innerHTML = configSelect(Number(comboCompartimentoSelecionado.value));
    // Preenche os campos que ja foram salvos
    inputQtdInicial.value = 0;
    if (comboCompartimentoSelecionado.value !== "") {
        btnSalvar.disabled = false;
        configuracoes.style.display = "block";
        var atual = storage[comboCompartimentoSelecionado.value];
        if (atual) {
            inputQtdInicial.value = atual.qtdInicial;
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
    for (let i = 0; i <= qtdCompartimentos; i++) {
        if (i !== atual) {
            result += `
            <form>
                <div class="input-group row">
                    <div class="col-sm-3"></div>
                    <div class="col-sm-10">
                        <div class="custom-control custom-checkbox mr-sm-2" for="check${i}">
                            <input class="custom-control-input" type="checkbox" id="check${i}" style="cursor: pointer" onchange="return showElement(form${i})">
                            <label class="custom-control-label" style="cursor: pointer" for="check${i}">
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
    for (let i = 0; i <= qtdCompartimentos; i++) {
        var check = document.querySelector(`#check${i}`);
        var item = document.querySelector(`#taxa${i}`);
        if (i !== indexAtual && check && check.checked &&  Number(item.value)) {
            saidas.push({
                compartimento: i,
                taxa: - Number(item.value),
                qtdInicial: Number(inputQtdInicial.value)
            });
            if (!storage[i]) {
                storage[i] = {
                    compartimento: i,
                    qtdInicial: 0,
                    saidas: [],
                    entradas: [{
                        compartimento: indexAtual,
                        taxa: Number(item.value),
                        qtdInicial: Number(inputQtdInicial.value)
                    }]
                };
            } else {
                storage[i].entradas.push({
                    compartimento: indexAtual,
                    taxa: Number(item.value),
                    qtdInicial: Number(inputQtdInicial.value)
                });
            }
        }
    }

    if (saidas.length > 0) {
        if (!storage[indexAtual]) {
            storage[indexAtual] = {
                compartimento: indexAtual,
                qtdInicial: Number(inputQtdInicial.value),
                saidas: saidas,
                entradas: []
            }
        } else {
            storage[indexAtual].saidas = [...storage[indexAtual].saidas, ...saidas];
        }
        btnSimular.disabled = false;
        showAlert("Dados salvos com sucesso!", 'success');
    } else if (inputQtdInicial.value > 0) {
        storage[indexAtual].qtdInicial = inputQtdInicial.value;
    } else {
        showAlert("Selecione ao menos 1 Compartimento de Transferência ou Altere a Quantidade");
    }
}

/**
 * Muda de step e desenha os comprtimentos com as quantidades iniciais
 */
function continuarSimulacao() {
    $('.carousel').carousel('next');
    var comp = document.querySelector('[compartimentos]');
    var drawAll = ``;
    for (let i = 1; i <= qtdCompartimentos; i++) {
        var atual = storage[i];
        if (atual) {
            var left = `left: ${(atual.compartimento - 1)*170}px`;
            drawAll +=  `
            <div style="${left}" id="back-compart${atual.compartimento}" class="compartimento compartimento-background" data-toggle="tooltip" data-placement="top" title="100.00%" delay="0"></div>
            <div style="${left}" id="compart${atual.compartimento}" class="compartimento" data-toggle="tooltip" data-placement="top" title="100.00%" delay="0"></div>
            <span class="title-comp" style="${left}">Compartimento ${atual.compartimento}</span>`
        }
    }
    comp.innerHTML = drawAll;
    setTimeout(() => {
        simularTransferencias();
    }, 1000);
}

function simularTransferencias() {
    time = isNaN(Number(inputTempo.value)) ? 0 : Number(inputTempo.value); 
    var calculo = rungeKuttaOrdemQuatro(time, storage);
    console.log(calculo);
    for (let i = 1; i <= qtdCompartimentos; i++) {
        var compart = document.querySelector(`#compart${i}`);
        compart.style.height = `${(calculo[i]/storage[i].qtdInicial)*200}px`;
        compart.title = `${calculo[i].toFixed(2)} - (${((calculo[i]/storage[i].qtdInicial)*100).toFixed(2)}%)`;
    }
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

function rungeKuttaOrdemQuatro(tFinal, compartimentos) {
    var h = 0.01;
    var k = new Array(compartimentos.length); 
    for (let ar = 0; ar < k.length; ar++) {
        k[ar] = new Array(4);
    }
    // O quatro é porque é rungeKuta4
    var yn = [];
    var xn = [];
    for (let w = 0; w < compartimentos.length; w++) {
        if (compartimentos[w]) {
            yn.push(compartimentos[w].qtdInicial);
            xn.push(compartimentos[w].qtdInicial);
        }
    }
    var n = (tFinal/h);

    for (let tn = 0; tn < n; tn = tn+h) {
        for (let i = 0; i < k.length; i++) {
            for (let j = 0; j < k.length; j++) {
                xn[j] = yn[j];
            }
            k[i][0] = ft(compartimentos[i], xn);
            for (let j = 0; j < k.length; j++) {
                xn[j] = yn[j] + (h/2 * k[i][0]);
            }
            k[i][1] = ft(compartimentos[i], xn);
            k[i][2] = ft(compartimentos[i], xn);
            for (let j = 0; j < k.length; j++) {
                xn[j] = yn[j] + (h * k[i][0]);
            }
            k[i][3] = ft(compartimentos[i], xn);
        }
        for (let i = 0; i < k.length; i++) {
            yn[i] = yn[i] + (h/6 * (k[i][0] + 2*(k[i][1] + k[i][2]) + k[i][3]));
        }
    }
    return yn;
}

function ft(compartimento, c) {
    var calc = 0;
    compartimento.entradas.forEach((entrada, i) => {
        calc += entrada.taxa * c[entrada.compartimento]; 
    });
    compartimento.saidas.forEach((saida, i) => {
        calc += saida.taxa * c[compartimento.compartimento]; 
    });
    return calc;
}

// ######################## Calculo balistico #############################
function RK4(x0, v0, tFinal) {
    var h = 0.01;
    var tn = 0;
    var xn = x0;
    var vn = v0;
    var k1, k2, k3, k4, l1, l2, l3, l4;
    for (let i = 0; xn >= 0.0; i++) {
        k1 = fx(tn, xn, vn);
        l1 = gx(tn, xn, vn);
        k2 = fx(tn + (h/2), xn + (h/2 * k1), vn + (h/2 * k1));
        l2 = gx(tn + (h/2), xn + (h/2 * l1), vn + (h/2 * l1));
        k3 = fx(tn + (h/2), xn + (h/2 * k2), vn + (h/2 * k2));
        l3 = gx(tn + (h/2), xn + (h/2 * l2), vn + (h/2 * l2));
        k4 = fx(tn + h, xn + (h * k3), vn + (h * k3));
        l4 = gx(tn + h, xn + (h * l3), vn + (h * l3));
        xn = xn + (h/6 * (k1 + 2*(k2 + k3) + k4));
        vn = vn + (h/6 * (l1 + 2*(l2 + l3) + l4));
        tn += h;
        console.log(`[${tn}, ${xn}, ${vn}]`);
    }
}

function fx(t, x, v) {
    return v;
}

function gx(t, x, v) {
    //AK-47
    var m = 7.9/1000;
    var coeficiente = 0.5;
    var densidade = 1.2927;
    var gravidade = 9.8;
    var calibre = 7.62;
    var area = Math.PI * Math.pow(calibre/2, 2) * 0.000001;
    return (
        -1/(2*m)
        *coeficiente
        *densidade
        *area
        *Math.pow(v, 2)
         - gravidade
    );
}

// ################################## Teste #######################################
function RGK4(k12, k23, k31, c1, c2, c3, tFinal) {
    var h = 1;
    var tn = 0;
    var n = (tFinal/h);
    var k1, k2, k3, k4, l1, l2, l3, l4, m1, m2, m3, m4;
    for (tn = 0; tn < n; tn = tn + h) {
        k1 = fc1(k12, k23, k31, c1, c2, c3);
        l1 = fc2(k12, k23, k31, c1, c2, c3);
        m1 = fc3(k12, k23, k31, c1, c2, c3);
        
        k2 = fc1(k12, k23, k31, c1 + (h/2 * k1) , c2 + (h/2 * k1), c3 + (h/2 * k1));
        l2 = fc2(k12, k23, k31, c1 + (h/2 * l1) , c2 + (h/2 * l1), c3 + (h/2 * l1));
        m2 = fc3(k12, k23, k31, c1 + (h/2 * m1) , c2 + (h/2 * m1), c3 + (h/2 * m1));
        
        k3 = fc1(k12, k23, k31, c1 + (h/2 * k2) , c2 + (h/2 * k2), c3 + (h/2 * k2));
        l3 = fc2(k12, k23, k31, c1 + (h/2 * l2) , c2 + (h/2 * l2), c3 + (h/2 * l2));
        m3 = fc3(k12, k23, k31, c1 + (h/2 * m2) , c2 + (h/2 * m2), c3 + (h/2 * m2));
       
        k4 = fc1(k12, k23, k31, c1 + (h * k3) , c2 + (h * k3), c3 + (h * k3));
        l4 = fc2(k12, k23, k31, c1 + (h * l3) , c2 + (h * l3), c3 + (h * l3));
        m4 = fc3(k12, k23, k31, c1 + (h * m3) , c2 + (h * m3), c3 + (h * m3));
       
        c1 = c1 + (h/6 * (k1 + 2*(k2 + k3) + k4));
        c2 = c2 + (h/6 * (l1 + 2*(l2 + l3) + l4));
        c3 = c3 + (h/6 * (m1 + 2*(m2 + m3) + m4));
        tn += h;
    }
    console.log(`[${c1}, ${c2}, ${c3}]`);
}

function fc1(k12, k23, k31, c1, c2, c3) {
    return -k12 * c1 + k31 * c3;
}

function fc2(k12, k23, k31, c1, c2, c3) {
    return -k23 * c2 + k12 * c1;
}

function fc3(k12, k23, k31, c1, c2, c3) {
    return -k31 * c3 + k23 * c2;
}

// ################################## Teste2 #######################################
function RGK42(k12, c1, tFinal) {
    var h = 1;
    var tn = 0;
    var n = (tFinal/h);
    var k1, k2, k3, k4;
    for (tn = 0; tn < n; tn = tn + h) {
        k1 = fc12(k12, c1);
        k2 = fc12(k12, c1 + (h/2 * k1));
        k3 = fc12(k12, c1 + (h/2 * k2));
        k4 = fc12(k12, c1 + (h * k3));
        c1 = c1 + (h/6 * (k1 + 2*(k2 + k3) + k4));
        tn += h;
    }
    console.log(`[${c1}]`);
}

function fc12(k12, c1) {
    return -k12 * c1;
}
