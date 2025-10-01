function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();
	var retorno = transformConstraintInFields(constraints);
    var fieldsConst = retorno;
	var dsRetorno = getDados(fieldsConst.cardId);

	dataset = dsRetorno;

	return dataset;
}

function transformConstraintInFields(constraints) {

    var fields = {
		"cardId": ""
	};

    if (constraints != null) {
        constraints.forEach(function(constraint) {
            if (fields.hasOwnProperty(constraint.fieldName)) {
                fields[constraint.fieldName] = constraint.initialValue;
            }
        });       
    }
    
    return fields;
}

function getDados(cardId) {
    try {
        var dataset = DatasetBuilder.newDataset();

        var clientService = fluigAPI.getAuthorizeClientService();
        var empresa = getValue("WKCompany");
        var cardindex = '116596'; // teste
        // var cardindex = '754260'; // producao
       
        var data = {
            companyId: "" + empresa,
            serviceCode: "REST_FLUIG",
            endpoint: "ecm-forms/api/v2/cardindex/" + cardindex + "/cards/" + cardId,
            method: "DELETE",
            dataType: "text",
            params: {}
        };

        var response = clientService.invoke(JSON.stringify(data));

        log.info("### Request json ds_del_material: " + JSON.stringify(data));

        if (response == null || response.getResult() == null || response.getResult().isEmpty()) {
            dataset.addColumn("return");
            dataset.addRow(["#### Falha ao consultar ds_del_placa"]);
        } else {

             dataset.addColumn("return");
             dataset.addRow(["deletado"]);

        }

        return dataset;

    } catch (err) {
        log.info("Erro na execucao ds_del_placa: " + err);
    }
}


function getValueByField(values, fieldId) {
    for (var i = 0; i < values.length; i++) {
        if (values[i].fieldId == fieldId) { 
            return values[i].value;
        }
    }
    return "";
}

