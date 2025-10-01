function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();
	var retorno = transformConstraintInFields(constraints);
    var fieldsConst = retorno;
	var dsRetorno = getDados(
        fieldsConst.cardId, 
        fieldsConst.codigo, 
        fieldsConst.estabelecimento, 
        fieldsConst.descricao, 
        fieldsConst.quantidade 
       
    );

	dataset = dsRetorno;

	return dataset;
}

function transformConstraintInFields(constraints) {

    var fields = {
        "cardId": "",
        "estabelecimento": "",
        "codigo": "",	
        "descricao" : "",
		"quantidade": ""
        
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

function getDados(cardId, estab, codigo, descricao, quantidade) {
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
            method: "PUT",
            dataType: "text",
            params: {
                "values": [
                    {
                        "fieldId": "form_estab",
                        "value": "" + estab
                    },
                    {
                        "fieldId": "form_codigo",
                        "value": "" + codigo
                    },
                    {
                        "fieldId": "form_descricao",
                        "value": "" + descricao
                    },
                    {
                        "fieldId": "form_quantidade",
                        "value": "" + quantidade
                    }
                    
                ]
            }
        };

        var response = clientService.invoke(JSON.stringify(data));

        // log.info("### Request json ds_add_material " + JSON.stringify(data));

        if (response == null || response.getResult() == null || response.getResult().isEmpty()) {
            dataset.addColumn("return");
            dataset.addRow(["#### Falha ao consultar ds_add_material"]);
        } else {

            var resultStr = response.getResult();
            var result = JSON.parse(resultStr);

            log.info('### Response ds_add_material: ' + JSON.stringify(result))

           if (result.values && result.values.length > 0) {
                dataset.addColumn("cardId");
                dataset.addColumn("codigoEstabelecimento");
                dataset.addColumn("codigo");
                dataset.addColumn("descricao");
                dataset.addColumn("quantidade");

                var form_estab = getValueByField(result.values, "form_estab");
                var form_codigo = getValueByField(result.values, "form_codigo");
                var form_descricao = getValueByField(result.values, "form_descricao");
                var form_quantidade = getValueByField(result.values, "form_quantidade");
               

                dataset.addRow([
                    result.cardId,
                    form_estab,
                    form_codigo, 
                    form_descricao, 
                    form_quantidade 
                    
                ]);
            }
        }

        return dataset;

    } catch (err) {
        log.info("Erro na execucao ds_editar_material: " + err);
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

