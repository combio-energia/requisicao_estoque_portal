function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();
	var retorno = transformConstraintInFields(constraints);
    var fieldsConst = retorno;
	var dsRetorno = getDados(
        fieldsConst.cardId, 
        fieldsConst.estabelecimento, 
        fieldsConst.codigo, 
        fieldsConst.descricao, 
        fieldsConst.quantidade,
        fieldsConst.localizacao, 
        fieldsConst.narrativa
       
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
		"quantidade": "",
        "localizacao": "",
        "narrativa": ""
        
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

function getDados(cardId, estab, codigo, descricao, quantidade, localizacao, narrativa) {

    console.log("### cardId: " + cardId);
    console.log("### estab: " + estab);
    console.log("### codigo: " + codigo);
    console.log("### descricao: " + descricao);
    console.log("### quantidade: " + quantidade);

    try {
        var dataset = DatasetBuilder.newDataset();

        var clientService = fluigAPI.getAuthorizeClientService();
        var empresa = getValue("WKCompany");
        var cardindex = '883044'; // teste
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
                    },
                    {
                        "fieldId": "form_localizacao",
                        "value": "" + localizacao
                    },
                    {
                        "fieldId": "form_narrativa",
                        "value": "" + narrativa
                    }
                    
                ]
            }
        };

        var response = clientService.invoke(JSON.stringify(data));

        // log.info("### Request json ds_add_material " + JSON.stringify(data));

        if (response == null || response.getResult() == null || response.getResult().isEmpty()) {
            dataset.addColumn("return");
            dataset.addRow(["#### Falha ao consultar ds_editar_material:"]);
        } else {

            var resultStr = response.getResult();
            var result = JSON.parse(resultStr);

            log.info('### Response ds_editar_material: ' + JSON.stringify(result))

           if (result.values && result.values.length > 0) {
                dataset.addColumn("cardId");
                dataset.addColumn("codigoEstabelecimento");
                dataset.addColumn("codigo");
                dataset.addColumn("descricao");
                dataset.addColumn("quantidade");
                dataset.addColumn("localizacao");
                dataset.addColumn("narrativa");

                var form_estab = getValueByField(result.values, "form_estab");
                var form_codigo = getValueByField(result.values, "form_codigo");
                var form_descricao = getValueByField(result.values, "form_descricao");
                var form_quantidade = getValueByField(result.values, "form_quantidade");
                var form_localizacao = getValueByField(result.values, "form_localizacao");
                var form_narrativa = getValueByField(result.values, "form_narrativa");

                dataset.addRow([
                    result.cardId,
                    form_estab,
                    form_codigo, 
                    form_descricao, 
                    form_quantidade,
                    form_localizacao,
                    form_narrativa                   
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

