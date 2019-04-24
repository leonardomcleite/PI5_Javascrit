export default class Alert {
    /**
     * Alert
     * @param message 
     * @param type 
     */
    showAlert(message, type = 'warning') {
        var alert = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="alert${listAlerts.length + 1}">
            <strong>${message}</strong>
            <button type="button" class="close" aria-label="Close" onclick="closeAlert(${listAlerts.length + 1})">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
        `;
        listAlerts.push(alert);
        this.drawAlerts();
        timeouts.push(setTimeout(() => {
            listAlerts.shift();
            this.drawAlerts();
        }, 3000));
    }

    /**
     * Desenha alerts da fila
     */
    drawAlerts() {
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
    closeAlert(indexAlert) {
        for (let index = 0; index < listAlerts.length; index++) {
            if (listAlerts[index].indexOf(`alert${indexAlert}`) > -1) {
                listAlerts.splice(index, 1);
                clearTimeout(timeouts[index]);
                break;
            }
        }
        this.drawAlerts();
    }
}
