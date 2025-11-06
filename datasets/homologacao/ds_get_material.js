function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();
	var retorno = transformConstraintInFields(constraints);
    var fieldsConst = retorno;
	var dsRetorno = getDados(
        fieldsConst.estabelecimento, 
        fieldsConst.codigo, 
        fieldsConst.descricao, 
        fieldsConst.quantidade
    );

	dataset = dsRetorno;

	return dataset;
}

function transformConstraintInFields(constraints) {

    var fields = {
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

function getDados(estab, codigo, descricao, quantidade) {
    try {
        var dataset = DatasetBuilder.newDataset();

        var clientService = fluigAPI.getAuthorizeClientService();
        var empresa = getValue("WKCompany");
        var cardindex = '883044'; // teste
        // var cardindex = '754260'; // producao

        var filtros = [];

        if (estab && estab.trim() !== "") {
            filtros.push("form_estab eq '" + estab + "'");
        }
        
        if (codigo && codigo.trim() !== "") {
            filtros.push("form_codigo eq '" + codigo + "'");
        }

        if (descricao && descricao.trim() !== "") {
            filtros.push("form_descricao eq '" + descricao + "'");
        }

        if (quantidade && quantidade.trim() !== "") {
            filtros.push("form_quantidade eq '" + quantidade + "'");
        }

        var filterQuery = "";
        if (filtros.length > 0) {
            // encodeURIComponent transforma espaços, aspas etc. em formato aceito na URL
            filterQuery = "?$filter=" + encodeURIComponent(filtros.join(" or "));
        }

        var data = {
            companyId: "" + empresa,
            serviceCode: "REST_FLUIG",
            endpoint: "ecm-forms/api/v2/cardindex/" + cardindex + "/cards" + filterQuery,
            method: "GET",
            dataType: "text",
            params: {}
        };

        var response = clientService.invoke(JSON.stringify(data));

        log.info("### Request json ds_get_material " + JSON.stringify(data));

        if (response == null || response.getResult() == null || response.getResult().isEmpty()) {
            dataset.addColumn("return");
            dataset.addRow(["#### Falha ao consultar ds_get_material"]);
        } else {

            var resultStr = response.getResult();
            var result = JSON.parse(resultStr);

            log.info('### Response ds_get_material: ' + JSON.stringify(result));

            // garante colunas
            dataset.addColumn("cardId");
            dataset.addColumn("codigoEstabelecimento");
            dataset.addColumn("codigo");
            dataset.addColumn("descricao");
            dataset.addColumn("quantidade");
            
            // normaliza a lista de registros
            var records = [];
            if (result.items && result.items.length) {
                records = result.items; // formato v2 correto
            } else if (result.values) {
                // fallback para formato “flat” (se algum dia vier assim)
                records = [{ cardId: result.cardId, values: result.values }];
            }

            // preenche linhas
            if (records.length > 0) {
                for (var r = 0; r < records.length; r++) {
                    var rec = records[r];                    
                    var form_estab = getValueByField(rec.values, "form_estab");
                    var form_codigo = getValueByField(rec.values, "form_codigo");
                    var form_descricao = getValueByField(rec.values, "form_descricao");
                    var form_quantidade = getValueByField(rec.values, "form_quantidade");

                    dataset.addRow([
                        rec.cardId,
                        form_estab,
                        form_codigo,
                        form_descricao,
                        form_quantidade,
                    ]);
                }
            } else {
                // retorno vazio, sem erro
                dataset.addRow(["not_found", "", "", ""]);
            }
        }

        return dataset;

    } catch (err) {
        log.info("Erro na execucao ds_get_material: " + err);
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

