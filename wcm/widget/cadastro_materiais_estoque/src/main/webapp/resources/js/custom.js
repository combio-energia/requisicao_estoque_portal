var autocompletex1 = null;
var autocompletex2 = null;
var autocompletex3 = null;
var autocompletex4 = null;
var autocompletex5 = null;
var autocompletex6 = null;
var autocompletex7 = null;
var _acBound = false;
var _consultaLock = false;
var _lastCode = null;

function cadastraMaterial(tabela, estab, codigo, descricao, quantidade, localizacao, narrativa) {
  // Validação de obrigatórios
  var valida_preencgimento = [estab, codigo, descricao, quantidade, localizacao, narrativa];

  for (var i = 0; i < valida_preencgimento.length; i++) {
    if (!valida_preencgimento[i]) {
      if (tabela === 'tabelaCadastro') {
        FLUIGC.toast({ title: 'Atenção: ', message: 'Todos os campos são obrigatórios!', type: 'warning' });
      }
      return { status: "warning", message: "Todos os campos são obrigatórios!" };
    }
  }

  // Normaliza entradas
  var _estab       = (estab  || '').toString().trim();
  var _codigo      = (codigo || '').toString().trim();
  var _descr       = (descricao || '').toString();
  var _qtd         = (quantidade || '').toString();
  var _localizacao = (localizacao || '').toString();
  var _narrativa   = (narrativa || '').toString();

  // 1) Checar duplicidade por (estabelecimento + código) com match exato
  try {
    var exists = existeNoGED_porEstabCodigo(_estab, _codigo);
    if (exists) {
      if (tabela === 'tabelaCadastro') {
        FLUIGC.toast({
          title: 'Atenção: ',
          message: 'Item já cadastrado no GED para este estabelecimento e código.',
          type: 'warning'
        });
      }
      return { status: "duplicate", message: "Item já cadastrado (estabelecimento + código)." };
    }
  } catch (e) {
    console.warn('Falha na checagem de duplicidade:', e);
  }

  // 2) Prosseguir com o dataset de inclusão
  var c1 = DatasetFactory.createConstraint('estabelecimento', _estab, _estab, ConstraintType.MUST);
  var c2 = DatasetFactory.createConstraint('codigo', _codigo, _codigo, ConstraintType.MUST);
  var c3 = DatasetFactory.createConstraint('descricao', _descr, _descr, ConstraintType.MUST);
  var c4 = DatasetFactory.createConstraint('quantidade', _qtd, _qtd, ConstraintType.MUST);
  var c5 = DatasetFactory.createConstraint('localizacao', _localizacao, _localizacao, ConstraintType.MUST);
  var c6 = DatasetFactory.createConstraint('narrativa', _narrativa, _narrativa, ConstraintType.MUST);

  var constraints = [c1, c2, c3, c4, c5, c6];

  var ds = DatasetFactory.getDataset('ds_add_material', null, constraints, null);

  if (ds && ds.values && ds.values.length > 0) {
    var idCard           = ds.values[0]['cardId'];
    var form_estab       = ds.values[0]['codigoEstabelecimento'] || _estab;
    var form_codigo      = ds.values[0]['codigo'] || _codigo;
    var form_descricao   = ds.values[0]['descricao'] || _descr;
    var form_quantidade  = ds.values[0]['quantidade'] || _qtd;
    var form_localizacao = ds.values[0]['localização'] || _localizacao;
    var form_narrativa   = ds.values[0]['narrtiva'] || _narrativa;

    var resultado = form_narrativa.substring(0, 30);

    var row = `
      <tr>
        <td class="dados-tabelas">${form_estab}</td>
        <td class="dados-tabelas">${form_codigo}</td>
        <td class="dados-tabelas">${form_descricao}</td>
        <td class="dados-tabelas">${form_quantidade}</td>
        <td class="dados-tabelas">${form_localizacao}</td>
        <td class="dados-tabelas"><div data-toggle="tooltip" title="${form_narrativa.toLowerCase()}"> ${resultado} ...</div></td>
        <td class="w3-centerRei remove">
          <button type="button" class="btn btn-forms-primary btnEditar" onclick="editaItens(this, 'adicionar')" data-toggle="tooltip" title="Clique para editar os dados">
            <i class="fluigicon fluigicon-fileedit icon-xs"></i>
          </button>
          <button type="button" class="btn btn-danger botoesPaiFilho" data-toggle="tooltip" title="Excluir dados do motorista" onclick="delItem(this);">
            <i class="fluigicon fluigicon-trash icon-xs"></i>
          </button>
        </td>
        <input name="cardId" id="cardId" class="form-control cardId" type="hidden" value="${idCard}">
        <input name="estabTabelaCadastro" id="estabTabelaCadastro" class="form-control estabTabelaCadastro" type="hidden" value="${form_estab}"/>
        <input name="codigoTabelaCadastro" id="codigoTabelaCadastro" class="form-control codigoTabelaCadastro" type="hidden" value="${form_codigo}"/>
        <input name="descrTabelaCadastro" id="descrTabelaCadastro" class="form-control descrTabelaCadastro" type="hidden" value="${form_descricao}"/>
        <input name="quantidadeTabelaCadastro" id="quantidadeTabelaCadastro" class="form-control quantidadeTabelaCadastro" type="hidden" value="${form_quantidade}"/>
        <input name="localizacaoTabelaCadastro" id="localizacaoTabelaCadastro" class="form-control localizacaoTabelaCadastro" type="hidden" value="${form_localizacao}"/>
        <input name="narrativaTabelaCadastro" id="narrativaTabelaCadastro" class="form-control narrativaTabelaCadastro" type="hidden" value="${form_narrativa}"/>
      </tr>
    `;

    $("#" + tabela + " tbody").append(row);

    if (tabela === 'tabelaCadastro') {
      FLUIGC.toast({ title: 'Sucesso: ', message: 'Item incluído com sucesso.', type: 'success' });
    }

    return { status: "ok", message: "Incluído com sucesso", cardId: idCard };

  } else {
    if (tabela === 'tabelaCadastro') {
      FLUIGC.toast({ title: 'Erro: ', message: 'Falha ao processar o cadastro, verifique os dados e tente novamente.', type: 'danger' });
    }
    return { status: "error", message: "Falha ao incluir item." };
  }
}

function existeNoGED_porEstabCodigo(estab, codigo) {
  var est = (estab  || '').toString().trim();
  var cod = (codigo || '').toString().trim();

  var cx1 = DatasetFactory.createConstraint('estabelecimento', est, est, ConstraintType.MUST);
  var cx2 = DatasetFactory.createConstraint('codigo', cod, cod, ConstraintType.MUST);
  var ds  = DatasetFactory.getDataset('ds_get_material', null, [cx1, cx2], null);

  if (!ds || !ds.values || ds.values.length === 0) return false;

  // Tenta múltiplos nomes de coluna (ajuste se necessário ao seu dataset)
  var COLS_COD = ['codigo', 'form_codigo', 'codigoItem'];
  var COLS_EST = ['estabelecimento', 'form_estabelecimento', 'codigoEstabelecimento'];

  function getField(row, candidates) {
    for (var i = 0; i < candidates.length; i++) {
      var k = candidates[i];
      if (row.hasOwnProperty(k) && row[k] != null && row[k] !== '') return String(row[k]).trim();
    }
    return null;
  }

  for (var r = 0; r < ds.values.length; r++) {
    var row = ds.values[r];
    var rowCod = getField(row, COLS_COD);
    var rowEst = getField(row, COLS_EST);
    if (rowCod === cod && rowEst === est) return true;
  }
  return false;
}

/*
function uploadPlanilha(file) {

  console.log('Iniciando upload da planilha...');

  $('#divTabPlanilha').removeClass('hide');

  var reader = new FileReader();

  reader.onload = function (e) {
    try {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: 'array' });

      var firstSheetName = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[firstSheetName];

      var jsonDataRaw = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Normaliza títulos/keys
      var jsonData = jsonDataRaw.map(function (row) {
        var cleanedRow = {};
        Object.keys(row).forEach(function (key) {
          cleanedRow[key.trim()] = row[key];
        });
        return cleanedRow;
      });

      // Acumuladores para mensagens finais
      var inseridos = 0;
      var duplicados = [];
      var checagemCache = {}; // evita consultar o mesmo par estab+codigo várias vezes

      // Processa linhas
      for (var i = 0; i < jsonData.length; i++) {
        var p_cod_estab   = jsonData[i]['COD_ESTABELECIMENTO'];
        var p_codigo      = jsonData[i]['CÓDIGO'];
        var p_descricao   = jsonData[i]['ITEM'];
        var p_quantidade  = jsonData[i]['QUANTIDADE'];
        var p_localizacao = jsonData[i]['LOCALIZAÇÃO'];
        var p_narrativa   = jsonData[i]['DESCRIÇÃO'];

        // Código vazio? pula silenciosamente
        if (!p_codigo || String(p_codigo).trim() === '') continue;

        var est = (p_cod_estab || '').toString().trim();
        var cod = (p_codigo || '').toString().trim();
        var cacheKey = est + '|' + cod;

        var jaExiste = checagemCache.hasOwnProperty(cacheKey)
          ? checagemCache[cacheKey]
          : (checagemCache[cacheKey] = existeNoGED_porEstabCodigo(est, cod));

        if (jaExiste) {
          duplicados.push(est + ' - ' + cod);
          continue; // não cadastra novamente
        }

        // valida se o item existe no datasul
        var cons1 = DatasetFactory.createConstraint("codigo", p_codigo, p_codigo, ConstraintType.MUST);
        var constraintItem = [cons1];
        var ds_item = DatasetFactory.getDataset('ds_itemAndDescription', null, constraintItem, null);

        if(ds_item.values.length > 0){
            var _item_existe = ds_item.values[0]['codigo'];
            console.log('_item_existe', _item_existe);
            cadastraMaterial('tabelaPlanilha', p_cod_estab, _item_existe, p_descricao, p_quantidade, p_localizacao, p_narrativa);
            inseridos++;
        }else{
            console.log('Item não existe no datasul: ', p_codigo);
        }
       
      }

      // Ajustes visuais da tabela
      setTimeout(function () {
        paginandoTabela({ rowsPerPage: 5, ignoreFirstTr: true }, 'tabelaPlanilha', 'tabPlanilha', 'pagination');

        // Mensagens finais
        if (inseridos > 0) {
          FLUIGC.toast({
            title: 'Sucesso: ',
            message: inseridos + ' item(ns) incluído(s) a partir da planilha.',
            type: 'success'
          });
        } else if (duplicados.length === 0) {
          FLUIGC.toast({
            title: 'Aviso: ',
            message: 'Nenhum item válido encontrado para inclusão.',
            type: 'warning'
          });
        }

        if (duplicados.length > 0) {
          var listaPreview = duplicados.slice(0, 10).join(', ');
          var sufixoMais = duplicados.length > 10 ? ' ...' : '';
          FLUIGC.toast({
            title: 'Atenção: ',
            message: 'Foram detectados ' + duplicados.length +
              ' item(ns) já cadastrados no GED (por estabelecimento + código) e não foram incluídos. Exemplos: ' +
              listaPreview + sufixoMais,
            type: 'warning'
          });
        }

       
      }, 300);

    } catch (err) {
      FLUIGC.toast({ title: 'Erro: ', message: 'Falha ao processar a planilha. Detalhes: ' + err, type: 'danger' });
    }
  };

  reader.onerror = function (err) {
    FLUIGC.toast({ title: 'Erro: ', message: 'Não foi possível ler o arquivo. Detalhes: ' + err, type: 'danger' });
  };

  // inicia leitura
  reader.readAsArrayBuffer(file);
}
*/

function uploadPlanilha(file) {

  console.log('Iniciando upload da planilha...');

  $('#divTabPlanilha').removeClass('hide');

  var reader = new FileReader();

  reader.onload = function (e) {
    try {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: 'array' });

      var firstSheetName = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[firstSheetName];

      var jsonDataRaw = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Normaliza títulos/keys
      var jsonData = jsonDataRaw.map(function (row) {
        var cleanedRow = {};
        Object.keys(row).forEach(function (key) {
          cleanedRow[key.trim()] = row[key];
        });
        return cleanedRow;
      });

      // Acumuladores para mensagens finais
      var inseridos = 0;
      var duplicados = [];
      var itensNaoCadastrados = [];          // << NOVO: acumula códigos não encontrados no Datasul
      var checagemCache = {};                // evita consultar o mesmo par estab+codigo várias vezes (GED)
      var cacheItemDatasul = {};             // << NOVO: cache para existência no Datasul por código

      // Processa linhas
      for (var i = 0; i < jsonData.length; i++) {
        var p_cod_estab   = jsonData[i]['COD_ESTABELECIMENTO'];
        var p_codigo_raw  = jsonData[i]['CÓDIGO'];
        var p_descricao   = jsonData[i]['ITEM'];
        var p_quantidade  = jsonData[i]['QUANTIDADE'];
        var p_localizacao = jsonData[i]['LOCALIZAÇÃO'];
        var p_narrativa   = jsonData[i]['DESCRIÇÃO'];

        // normaliza código (pode vir numérico do Excel)
        var p_codigo = (p_codigo_raw === null || p_codigo_raw === undefined) ? "" : String(p_codigo_raw).trim();

        // Código vazio? pula silenciosamente
        if (!p_codigo) continue;

        var est = (p_cod_estab || '').toString().trim();
        var cod = p_codigo; // já normalizado
        var cacheKey = est + '|' + cod;

        var jaExiste = checagemCache.hasOwnProperty(cacheKey)
          ? checagemCache[cacheKey]
          : (checagemCache[cacheKey] = existeNoGED_porEstabCodigo(est, cod));

        if (jaExiste) {
          duplicados.push(est + ' - ' + cod);
          continue; // não cadastra novamente
        }

        // -------- valida se o item existe no Datasul (com cache) --------
        var existeNoDatasul;
        if (cacheItemDatasul.hasOwnProperty(cod)) {
          existeNoDatasul = cacheItemDatasul[cod];
        } else {
          try {
            var cons1 = DatasetFactory.createConstraint("codigo", cod, cod, ConstraintType.MUST);
            var constraintItem = [cons1];
            var ds_item = DatasetFactory.getDataset('ds_itemAndDescription', null, constraintItem, null);

            existeNoDatasul = !!(ds_item && ds_item.values && ds_item.values.length > 0);
          } catch (eDatasul) {
            // Em caso de erro no dataset, considera como não encontrado e loga
            console.log('Erro ao consultar Datasul para o código:', cod, eDatasul);
            existeNoDatasul = false;
          }
          cacheItemDatasul[cod] = existeNoDatasul;
        }

        if (existeNoDatasul) {
          var _item_existe = cod; // já sabemos que existe; se quiser pegar outro campo, use ds_item.values[0]['codigo']
          console.log('_item_existe', _item_existe);
          cadastraMaterial('tabelaPlanilha', p_cod_estab, _item_existe, p_descricao, p_quantidade, p_localizacao, p_narrativa);
          inseridos++;
        } else {
          // << NOVO: acumula o código para mensagem única no final
          itensNaoCadastrados.push(cod);
          console.log('Item não existe no Datasul:', cod);
        }
      }

      // Ajustes visuais da tabela
      setTimeout(function () {
        paginandoTabela({ rowsPerPage: 5, ignoreFirstTr: true }, 'tabelaPlanilha', 'tabPlanilha', 'pagination');

        // Mensagens finais
        if (inseridos > 0) {
          FLUIGC.toast({
            title: 'Sucesso: ',
            message: inseridos + ' item(ns) incluído(s) a partir da planilha.',
            type: 'success'
          });
        } else if (duplicados.length === 0 && itensNaoCadastrados.length === 0) {
          FLUIGC.toast({
            title: 'Aviso: ',
            message: 'Nenhum item válido encontrado para inclusão.',
            type: 'warning'
          });
        }

        if (duplicados.length > 0) {
          var listaPreviewDup = duplicados.slice(0, 10).join(', ');
          var sufixoMaisDup = duplicados.length > 10 ? ' ...' : '';
          FLUIGC.toast({
            title: 'Atenção: ',
            message: 'Foram detectados ' + duplicados.length +
              ' item(ns) já cadastrados no GED (por estabelecimento + código) e não foram incluídos. Exemplos: ' +
              listaPreviewDup + sufixoMaisDup,
            type: 'warning'
          });
        }

        // << NOVO: mensagem única com todos os códigos não encontrados no Datasul (sem duplicar códigos)
        if (itensNaoCadastrados.length > 0) {
          // remove duplicidades mantendo a ordem de primeira ocorrência
          var vistos = {};
          var unicos = [];
          for (var u = 0; u < itensNaoCadastrados.length; u++) {
            var c = itensNaoCadastrados[u];
            if (!vistos[c]) {
              vistos[c] = true;
              unicos.push(c);
            }
          }
          var listaPreviewNF = unicos.slice(0, 15).join(', ');
          var sufixoMaisNF = unicos.length > 15 ? ' ...' : '';
          FLUIGC.toast({
            title: 'Itens não encontrados no Datasul: ',
            message: 'Não foi possível localizar ' + unicos.length + ' código(s) no Datasul. ' +
                     'Códigos: ' + listaPreviewNF + sufixoMaisNF,
            type: 'danger'
          });
        }

      }, 300);

    } catch (err) {
      FLUIGC.toast({ title: 'Erro: ', message: 'Falha ao processar a planilha. Detalhes: ' + err, type: 'danger' });
    }
  };

  reader.onerror = function (err) {
    FLUIGC.toast({ title: 'Erro: ', message: 'Não foi possível ler o arquivo. Detalhes: ' + err, type: 'danger' });
  };

  // inicia leitura
  reader.readAsArrayBuffer(file);
}


function camposAutocomplet() {
    var loading = FLUIGC.loading(window, {
		textMessage: 'Processando informações...',
		title: "Loading",
		css: {
			padding: 0,
			margin: 0,
			width: '30%',
			top: '40%',
			left: '35%',
			textAlign: 'center',
			color: '#000',
			border: '3px solid #aaa',
			backgroundColor: '#fff',
			cursor: 'wait'
		},
		overlayCSS: {
			opacity: 0.7,
			cursor: 'wait'
		},
		cursorReset: 'default',
		baseZ: 1001,
		centerX: true,
		centerY: true,
		bindEvents: true,
		fadeIn: 200,
		fadeOut: 400,
		timeout: 0,
		showOverlay: true,
		onBlock: null,
		onUnblock: null,
		ignoreIfBlocked: false
	});

	loading.show();

  var ds1 = DatasetFactory.getDataset("ds_requisicao_estoque", null, null, null);
  var dados1 = ["TODOS"];
  var tagData = {};
  var tagremove = null;

  setTimeout(function () {
    if (ds1) {
      $.each(ds1.values, function (k, v) {
        dados1.push(v['form_codigo'] + " | " + v['form_descricao']);
      });

      // Inicializa só uma vez
      if (!autocompletex1) {
        autocompletex1 = FLUIGC.autocomplete('#codigo_descricao', {
          source: substringMatcher(dados1),
          name: 'nome',
          displayKey: 'description',
          type: 'tagAutocomplete',
          maxTags: 1,
          tagClass: 'tag-gray',
          tagMaxWidth: '100%',
          highlight: true
        });
      } else {
        // se já existe, apenas atualiza a fonte
        if (typeof autocompletex1.setSource === 'function') {
          autocompletex1.setSource(substringMatcher(dados1));
        }
      }

      // Garante que há somente UM handler
      $('#codigo_descricao')
        .off('fluig.autocomplete.selected.consulta')
        .on('fluig.autocomplete.selected.consulta', function (event) {
          
          console.log('Item selecionado no autocomplete de código/descrição para consulta.');

          var item = (event.detail && event.detail.item) || event.item;
          var code = (item && item.description ? item.description : '').split(' | ')[0];

          if (!code) return;

          // evita chamadas duplicadas por corrida ou mesma seleção
          if (_consultaLock) return;
          if (code === _lastCode) return;

          _consultaLock = true;
          _lastCode = code;
          
          autocompletex7.removeAll();
          $('#tabelaConsulta tbody tr').remove();   
          code == "TODOS" ? consultarMaterial('', code) : consultarMaterial('codigo', code);

          // libera o lock ao final do tick
          setTimeout(function(){ _consultaLock = false; }, 0);
        });

      $('#codigo_descricao')
        .off('fluig.autocomplete.itemRemoved.consulta')
        .on('fluig.autocomplete.itemRemoved.consulta', function (event) {
          _lastCode = null;
          $('#tabelaConsulta tbody tr').remove();
        });
    }

    loading.hide();
  }, 150);

  var ds2 = DatasetFactory.getDataset("ds_zoom_estab_cnpj", null, null, null);
	var dados2 = ["TODOS"];
  

	setTimeout(function () {
		if (ds2) {
			$.each(ds2.values, function (k, v) {
				dados2.push(v['CODIGO'] + " | " + v['NOME']);
			});

			autocompletex2 = FLUIGC.autocomplete('#estabelecimento', {
				source: substringMatcher(dados2),
				name: 'nome',
				displayKey: 'description',
				type: 'tagAutocomplete',
				maxTags: 1,
				tagClass: 'tag-gray',
				tagMaxWidth: '100%',
				highlight: true
			});

      autocompletex3 = FLUIGC.autocomplete('#m_estabelecimento', {
				source: substringMatcher(dados2),
				name: 'nome',
				displayKey: 'description',
				type: 'tagAutocomplete',
				maxTags: 1,
				tagClass: 'tag-gray',
				tagMaxWidth: '100%',
				highlight: true
			});

      autocompletex7 = FLUIGC.autocomplete('#consulta_estab', {
				source: substringMatcher(dados2),
				name: 'nome',
				displayKey: 'description',
				type: 'tagAutocomplete',
				maxTags: 1,
				tagClass: 'tag-gray',
				tagMaxWidth: '100%',
				highlight: true
			});

      autocompletex2.on("fluig.autocomplete.selected", function (event) {
				loading.show();
				setTimeout(function () {
					let itemSelecionado = event.item;
          ds2.values.filter(function (e) {
							if (itemSelecionado.description.split(" | ")[0] == e["CODIGO"]) {
								$("#cod_estab").val("");
								$("#cod_estab").val(e["CODIGO"]);
							}
					});
					loading.hide();
				}, 150);
			});

      autocompletex3.on("fluig.autocomplete.selected", function (event) {
				loading.show();
				setTimeout(function () {
					let itemSelecionado = event.item;
          ds2.values.filter(function (e) {
							if (itemSelecionado.description.split(" | ")[0] == e["CODIGO"]) {
								$("#cod_estab").val("");
								$("#cod_estab").val(e["CODIGO"]);
							}
					});
					loading.hide();
				}, 150);
			});

			autocompletex7.on("fluig.autocomplete.selected", function (event) {
				loading.show();
				setTimeout(function () {
					let itemSelecionado = event.item;
          ds2.values.filter(function (e) {
							if (itemSelecionado.description.split(" | ")[0] == e["CODIGO"]) {
                autocompletex1.removeAll();
                $('#tabelaConsulta tbody tr').remove();               
								consultarMaterial('estabelecimento', e["CODIGO"]);
							}else{
                autocompletex1.removeAll();
                $('#tabelaConsulta tbody tr').remove(); 
                consultarMaterial('', itemSelecionado.description);
              }
					});
					loading.hide();
				}, 150);
			});
     
			autocompletex2.on("fluig.autocomplete.itemRemoved", function (event) {
				$("#cod_estab").val("");
			});

      autocompletex3.on("fluig.autocomplete.itemRemoved", function (event) {
				$("#cod_estab").val("");
			});

      autocompletex7.on("fluig.autocomplete.itemRemoved", function (event) {        
				$('#tabelaConsulta tbody tr').remove();
			});

		}

		loading.hide();

	}, 150);

  var ds3 = DatasetFactory.getDataset("ds_zoom_item_sinc", null, null, null);
	var dados3 = [];

  setTimeout(function () {
    if(ds3){
      $.each(ds3.values, function (k, v) {
				dados3.push(v['codigo'] + " | " + v['descricao']);
			});

      autocompletex4 = FLUIGC.autocomplete('#codigo_descr_add', {
				source: substringMatcher(dados3),
				name: 'nome',
				displayKey: 'description',
				type: 'tagAutocomplete',
				maxTags: 1,
				tagClass: 'tag-gray',
				tagMaxWidth: '100%',
				highlight: true
			});

      autocompletex5 = FLUIGC.autocomplete('#m_codigo', {
				source: substringMatcher(dados3),
				name: 'nome',
				displayKey: 'description',
				type: 'tagAutocomplete',
				maxTags: 1,
				tagClass: 'tag-gray',
				tagMaxWidth: '100%',
				highlight: true
			});

      autocompletex4.on("fluig.autocomplete.selected", function (event) {
				loading.show();
				setTimeout(function () {
					let itemSelecionado = event.item;
          ds3.values.filter(function (e) {
							if (itemSelecionado.description.split(" | ")[0] == e["codigo"]) {
								$("#codigo").val(e["codigo"]);
								$("#descricao").val(e["descricao"]);
							}
					});
					loading.hide();
				}, 150);
			});

      autocompletex5.on("fluig.autocomplete.selected", function (event) {
				loading.show();
				setTimeout(function () {
					let itemSelecionado = event.item;
          ds3.values.filter(function (e) {
							if (itemSelecionado.description.split(" | ")[0] == e["codigo"]) {
								$("#codigo").val(e["codigo"]);
								$("#descricao").val(e["descricao"]);
							}
					});
					loading.hide();
				}, 150);
			});

      autocompletex4.on("fluig.autocomplete.itemRemoved", function (event) {
				$("#codigo").val("");
				$("#descricao").val("");
			});

      autocompletex5.on("fluig.autocomplete.itemRemoved", function (event) {
				$("#codigo").val("");
				$("#descricao").val("");
			});
    }
  }, 150);

}

function substringMatcher(strs) {
	return function findMatches(q, cb) {
		var matches, substrRegex;

		matches = [];

		substrRegex = new RegExp(q, 'i');

		$.each(strs, function (i, str) {
			if (substrRegex.test(str)) {
				matches.push({
					description: str
				});
			}
		});
		cb(matches);
	};
}

function consultarMaterial(constraint, codigo) {

  console.log('Consultando material...');

  $('#divTabConsulta').removeClass('hide');

  var loading = FLUIGC.loading(window, {
    textMessage: 'Consultando cadastros...',
    title: "Loading",
    css: { padding: 0, margin: 0, width: '30%', top: '40%', left: '35%', textAlign: 'center', color: '#000', border: '3px solid #aaa', backgroundColor: '#fff', cursor: 'wait' },
    overlayCSS: { opacity: 0.7, cursor: 'wait' },
    cursorReset: 'default', baseZ: 1001, centerX: true, centerY: true, bindEvents: true, fadeIn: 200, fadeOut: 400, timeout: 0, showOverlay: true
  });

  // utilzinho para obter valor com fallback
  function get(v, key) {
    return (v && v[key] != null) ? v[key] : '';
  }

  // desenha a linha de "sem resultados"
  function desenhaMensagemSemResultado() {
    const msgRow = `
      <tr class="tr-sem-resultado">
        <td colspan="7" class="text-center text-muted" style="font-style: italic;">
          Não existe cadastro para essa consulta
        </td>
      </tr>`;
    $("#tabelaConsulta tbody").append(msgRow);
  }

  loading.show();

  try {
    var ds;

    if(codigo == "TODOS"){
      ds = DatasetFactory.getDataset('ds_get_material', null, null, null);
    }else{
      var c1 = DatasetFactory.createConstraint(constraint, codigo, codigo, ConstraintType.MUST);
      var constraints = [c1];
      ds = DatasetFactory.getDataset('ds_get_material', null, constraints, null);
    }
    
    // Limpa mensagens antigas para não acumular
    $("#tabelaConsulta tbody .tr-sem-resultado").remove();

    // Valida retorno do dataset
    if (!ds || !ds.values || !ds.values.length) {
      desenhaMensagemSemResultado();
      return;
    }

    var inseriuAlgumaLinha = false;

    for (var i = 0; i < ds.values.length; i++) {

      var rowData = ds.values[i];

      // Se o dataset vier "vazio" (campos nulos), pula
      var cardId       = get(rowData, 'cardId');
      var _codigo      = get(rowData, 'codigo') || get(rowData, 'form_codigo');
      var _descricao   = get(rowData, 'descricao') || get(rowData, 'form_descricao');
      var _estab       = get(rowData, 'codigoEstabelecimento') || get(rowData, 'form_estabelecimento');
      var _quantidade  = get(rowData, 'quantidade') || get(rowData, 'form_quantidade');
      var _localizacao = get(rowData, 'localizacao') || get(rowData, 'form_localizacao');
      var _narrativa   = get(rowData, 'narrativa') || get(rowData, 'form_narrativa');

      // Se não tiver ao menos um identificador chave, ignora o registro
      if (!_codigo && !_descricao && !_estab && !_quantidade && !_localizacao && !_narrativa) continue;

      var row = `
        <tr>
          <td class="dados-tabelas">${_estab}</td>
          <td class="dados-tabelas">${_codigo}</td>
          <td class="dados-tabelas">${_descricao}</td>
          <td class="dados-tabelas">${_quantidade}</td>
          <td class="dados-tabelas">${_localizacao}</td>
          <td class="dados-tabelas"><div data-toggle="tooltip" title="${_narrativa.toLowerCase()}"> ${_narrativa.substring(0, 30)} ...</div></td>
          <td class="w3-centerRei remove">
            <button type="button" class="btn btn-forms-primary btnEditar" onclick="editaItens(this, 'consultar')" data-toggle="tooltip" title="Clique para editar os dados">
              <i class="fluigicon fluigicon-fileedit icon-xs"></i>
            </button>
            <button type="button" class="btn btn-danger botoesPaiFilho" data-toggle="tooltip" title="Excluir dados do motorista" onclick="delItem(this);">
              <i class="fluigicon fluigicon-trash icon-xs"></i>
            </button>
          </td>
          <input name="cardId" id="cardId" class="form-control cardId" type="hidden" value="${cardId}"/>
          <input name="codigoTabelaConsulta" id="codigoTabelaConsulta" class="form-control codigoTabelaConsulta" type="hidden" value="${_codigo}"/>
          <input name="estabTabelaConsulta" id="estabTabelaConsulta" class="form-control estabTabelaConsulta" type="hidden" value="${_estab}"/>
          <input name="descrTabelaConsulta" id="descrTabelaConsulta" class="form-control descrTabelaConsulta" type="hidden" value="${_descricao}"/>
          <input name="quantidadeTabelaConsulta" id="quantidadeTabelaConsulta" class="form-control quantidadeTabelaConsulta" type="hidden" value="${_quantidade}"/>
          <input name="localizacaoTabelaConsulta" id="localizacaoTabelaConsulta" class="form-control localizacaoTabelaConsulta" type="hidden" value="${_localizacao}"/>
          <input name="narrativaTabelaConsulta" id="narrativaTabelaConsulta" class="form-control narrativaTabelaConsulta" type="hidden" value="${_narrativa}"/>
        </tr>
      `;

      $("#tabelaConsulta tbody").append(row);
      inseriuAlgumaLinha = true;
    }

    paginandoTabela({ rowsPerPage: 5, ignoreFirstTr: true }, 'tabelaConsulta', 'consulta', 'pagination2');

    // Se percorreu tudo e não inseriu nada útil, mostra mensagem
    if (!inseriuAlgumaLinha) {
      desenhaMensagemSemResultado();
    }

  } catch (e) {
    // Em caso de erro inesperado, também mostra a mensagem na tabela
    console.error('Erro ao consultar material:', e);
    $("#tabelaConsulta tbody .tr-sem-resultado").remove();
    desenhaMensagemSemResultado();
    // opcional: também notificar
    try {
      FLUIGC.toast({ title: 'Atenção: ', message: 'Falha ao consultar cadastros.', type: 'warning' });
    } catch (_) {}
  } finally {
    loading.hide();
  }
}


function abreFecha(abre, fecha) {
   
	if (abre) document.getElementById(abre).style.display = 'block'; //Abre						
	if (fecha) document.getElementById(fecha).style.display = 'none'; //Fecha				
	
}

// Helper permanece igual
function setSingleTag(ac, description){
  if (!ac || !description) return;
  try {
    if (typeof ac.removeAll === 'function') ac.removeAll();
    else if (typeof ac.clear === 'function') ac.clear();
    else if (typeof ac.getTags === 'function' && typeof ac.remove === 'function') {
      (ac.getTags() || []).forEach(function(t){ ac.remove(t); });
    }
    if (typeof ac.add === 'function') ac.add({ description: description });
  } catch(e){ console.warn('setSingleTag falhou:', e); }
}

function editaItens(oElement, tipo) {

  var $tr = $(oElement).closest('tr');

  var usaCadastro = $tr.find('.codigoTabelaCadastro').length > 0;
  var usaConsulta = $tr.find('.codigoTabelaConsulta').length > 0;

  var estab  = usaCadastro ? $tr.find('.estabTabelaCadastro').val()       : $tr.find('.estabTabelaConsulta').val();
  var codigo = usaCadastro ? $tr.find('.codigoTabelaCadastro').val()      : $tr.find('.codigoTabelaConsulta').val();
  var descri = usaCadastro ? $tr.find('.descrTabelaCadastro').val()       : $tr.find('.descrTabelaConsulta').val();
  var qtd    = usaCadastro ? $tr.find('.quantidadeTabelaCadastro').val()  : $tr.find('.quantidadeTabelaConsulta').val();
  var local  = usaCadastro ? $tr.find('.localizacaoTabelaCadastro').val() : $tr.find('.localizacaoTabelaConsulta').val();
  var narrat = usaCadastro ? $tr.find('.narrativaTabelaCadastro').val()   : $tr.find('.narrativaTabelaConsulta').val();
  
  // Estabelecimento -> autocompletex3
  if (typeof autocompletex3 !== 'undefined') {
    setSingleTag(autocompletex3, (estab || '').trim());
  }

  // Código/Descrição -> autocompletex5  (formato "CODIGO | DESCRICAO")
  var codigoDescrTag = ((codigo || '').trim() ? (codigo.trim() + ' | ') : '') + (descri || '').trim();
  if (typeof autocompletex5 !== 'undefined') {
    setSingleTag(autocompletex5, codigoDescrTag);
  }

  // Fallbacks (se existirem inputs além do autocomplete)
  if (document.getElementById('m_estabelecimento')) $('#m_estabelecimento').val(estab || '');
  if (document.getElementById('m_codigo')) $('#m_codigo').val(codigoDescrTag || '');
  if (document.getElementById('m_quantidade')) $('#m_quantidade').val((qtd || '').toString().replace(/\D/g,''));
  if (document.getElementById('m_localizacao')) $('#m_localizacao').val(local || '');
  if (document.getElementById('m_narrativa')) $('#m_narrativa').val(narrat || '');

  $('#id01').data('row', $tr);
  $('#id01').data('origem', usaCadastro ? 'cadastro' : (usaConsulta ? 'consulta' : (tipo||'')));

  abreFecha('id01', '');
}

function getFirstTagDescription(ac){
  if (!ac || typeof ac.getTags !== 'function') return '';
  try {
    var tags = ac.getTags() || [];
    if (!tags.length) return '';
    var t = tags[0];
    return (t.description || t.value || t.label || '').toString().trim();
  } catch(e){ return ''; }
}

function addItens() {

  const $tr = $('#id01').data('row');
  const origem = $('#id01').data('origem');
  if (!$tr || !$tr.length){
    FLUIGC.toast({ title:'Erro: ', message:'Linha não encontrada para edição.', type:'danger' });
    return;
  }

  // Estabelecimento -> autocompletex3
  var estab = '';
  if (typeof autocompletex3 !== 'undefined') estab = getFirstTagDescription(autocompletex3);
  if (!estab && document.getElementById('m_estabelecimento')) estab = ($('#m_estabelecimento').val() || '').trim();

  // Código/Descrição -> autocompletex1
  var codDesc = '';
  if (typeof autocompletex1 !== 'undefined') codDesc = getFirstTagDescription(autocompletex1);
  if (!codDesc && document.getElementById('m_codigo')) codDesc = ($('#m_codigo').val() || '').trim();

  // separa "CODIGO | DESCRICAO"
  var codigo = '', descricao = '';
  if (codDesc){
    const p = codDesc.split('|');
    codigo = (p[0] || '').trim();
    descricao = (p[1] || '').trim();
    if (!descricao && codigo && codigo.indexOf(' ') > -1) { descricao = codigo; codigo = ''; }
  }

  if(estab){
    const c = estab.split(' | ');
    estab = (c[0] || '').trim();
  }

  const quantidade = ($('#m_quantidade').val() || '').replace(/\D/g,'').trim();
  const localizacao = ($('#m_localizacao').val() || '').trim();
  const narrativa   = ($('#m_narrativa').val() || '').trim();

  if (!quantidade){
    FLUIGC.toast({ title:'Erro: ', message:'Informe a Quantidade.', type:'danger' });
    return;
  }

  if (!localizacao){
    FLUIGC.toast({ title:'Atenção: ', message:'Informe a Localização.', type:'warning' });
    return;
  }

  if (!narrativa){
    FLUIGC.toast({ title:'Atenção: ', message:'Informe a Narrativa.', type:'warning' });
    return;
  }

  if (!estab){
    FLUIGC.toast({ title:'Atenção: ', message:'Informe o Estabelecimento.', type:'warning' });
    return;
  }
  if (!codigo || !descricao){
    FLUIGC.toast({ title:'Atenção: ', message:'Informe Código e Descrição.', type:'warning' });
    return;
  }

  const cardId = ($tr.find('.cardId').val() || '').trim();
  if (!cardId){
    FLUIGC.toast({ title:'Erro: ', message:'cardId não encontrado na linha.', type:'danger' });
    return;
  }

  const loading = FLUIGC.loading(window, { textMessage:'Atualizando cadastro no GED...' });
  loading.show();

  console.log('Atualizando material no GED...', { cardId, estab, codigo, descricao, quantidade, localizacao, narrativa, origem });

  try {

    var c1 = DatasetFactory.createConstraint('cardId', cardId, cardId, ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint('estabelecimento', estab, estab, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint('codigo', codigo, codigo, ConstraintType.MUST);
    var c4 = DatasetFactory.createConstraint('descricao', descricao, descricao, ConstraintType.MUST);
    var c5 = DatasetFactory.createConstraint('quantidade',quantidade,quantidade,ConstraintType.MUST);
    var c6 = DatasetFactory.createConstraint('localizacao',localizacao,localizacao,ConstraintType.MUST);
    var c7 = DatasetFactory.createConstraint('narrativa', narrativa, narrativa, ConstraintType.MUST);

    var ds = DatasetFactory.getDataset('ds_editar_material', null, [c1,c2,c3,c4,c5,c6,c7], null);
    var r  = (ds && ds.values && ds.values[0]) ? ds.values[0] : null;

    var cls = (origem === 'cadastro') ? {
      estab: '.estabTabelaCadastro',
      codigo: '.codigoTabelaCadastro',
      descri: '.descrTabelaCadastro',
      qtd: '.quantidadeTabelaCadastro',
      local: '.localizacaoTabelaCadastro',
      narrat: '.narrativaTabelaCadastro'
    } : {
      estab: '.estabTabelaConsulta',
      codigo: '.codigoTabelaConsulta',
      descri: '.descrTabelaConsulta',
      qtd: '.quantidadeTabelaConsulta',
      local: '.localizacaoTabelaConsulta',
      narrat: '.narrativaTabelaConsulta'
    };

    var vEstab  = (r && (r.estab       || r.ESTAB         || r.estabelecimento || r.ESTABELECIMENTO)) || estab;
    var vCod    = (r && (r.codigo      || r.CODIGO))      || codigo;
    var vDesc   = (r && (r.descricao   || r.DESCRICAO))   || descricao;
    var vQtd    = (r && (r.quantidade  || r.QUANTIDADE))  || quantidade;
    var vLocal  = (r && (r.localizacao || r.LOCALIZACAO)) || localizacao;
    var vNarrat = (r && (r.narrativa   || r.NARRATIVA))   || narrativa;

    // Atualiza os inputs hidden
    $tr.find(cls.estab).val(vEstab);
    $tr.find(cls.codigo).val(vCod);
    $tr.find(cls.descri).val(vDesc);
    $tr.find(cls.qtd).val(vQtd);
    $tr.find(cls.local).val(vLocal);
    $tr.find(cls.narrat).val(vNarrat);

    // NOVO: Atualiza o texto visível nas células <td>
    var $tds = $tr.find('td.dados-tabelas');
    if ($tds.length >= 6) {
      $tds.eq(0).text(vEstab);
      $tds.eq(1).text(vCod);
      $tds.eq(2).text(vDesc);
      $tds.eq(3).text(vQtd);
      $tds.eq(4).text(vLocal);
      
      // Para narrativa, mantém o tooltip se existir
      var $narrativaDiv = $tds.eq(5).find('div[data-toggle="tooltip"]');
      if ($narrativaDiv.length) {
        $narrativaDiv.attr('data-original-title', vNarrat);
        // Atualiza o texto truncado (você pode ajustar a lógica de truncamento)
        var textoTruncado = vNarrat.length > 30 ? vNarrat.substring(0, 30) + ' ...' : vNarrat;
        $narrativaDiv.text(textoTruncado);
      } else {
        $tds.eq(5).text(vNarrat);
      }
    }

    FLUIGC.toast({ title:'Sucesso: ', message:'Material atualizado no GED e na tabela (cardId '+cardId+').', type:'success' });
    abreFecha('', 'id01');

  } catch (e){
    console.error('Erro ao atualizar GED:', e);
    FLUIGC.toast({ title:'Erro: ', message:'Falha ao atualizar cadastro no GED.', type:'danger' });
  } finally {
    loading.hide();
  }
}

// Helpers (use os seus se já tiver)
function getCardIdFromRow($tr){
  return ($tr.find('.cardId').val() || $tr.data('cardId') || '').toString().trim();
}

function confirmDelete(msg, onYes){
  if (typeof FLUIGC !== 'undefined' && FLUIGC.message && FLUIGC.message.confirm){
    FLUIGC.message.confirm({ message: msg, title: 'Confirmação', labelYes: 'Excluir', labelNo: 'Cancelar' },
      function(result){ if (result) onYes(); });
  } else { if (window.confirm(msg)) onYes(); }
}

// Deletar ITEM (Material) via ds_del_material
function delItem(oElement){
  const $tr = $(oElement).closest('tr');
  if (!$tr.length){
    FLUIGC.toast({ title:'Erro: ', message:'Linha não encontrada.', type:'danger' });
    return;
  }

  // Suporta tabelas "Cadastro" e "Consulta"
  const usaCadastro = $tr.find('.codigoTabelaCadastro').length > 0;
  const cls = usaCadastro ? {
    codigo: '.codigoTabelaCadastro',
    descri: '.descrTabelaCadastro'
  } : {
    codigo: '.codigoTabelaConsulta',
    descri: '.descrTabelaConsulta'
  };

  const codigo = ($tr.find(cls.codigo).val() || '').trim();
  const descri = ($tr.find(cls.descri).val() || '').trim();

  const cardId = getCardIdFromRow($tr);
  if (!cardId){
    FLUIGC.toast({ title:'Erro: ', message:'cardId não encontrado na linha.', type:'danger' });
    return;
  }

  confirmDelete(`Excluir o item "${codigo}" - ${descri}?`, function(){
    const loading = FLUIGC.loading(window, { textMessage:'Excluindo item no GED...' });
    loading.show();
    try {
      var c1 = DatasetFactory.createConstraint('cardId', cardId, cardId, ConstraintType.MUST);
      var ds = DatasetFactory.getDataset('ds_del_material', null, [c1], null);

      var ret = ds && ds.values && ds.values[0] && (ds.values[0]['return'] || ds.values[0]['RETURN']);
      var ok = String(ret || '').toLowerCase() === 'deletado';

      if (ok){
        if (typeof fnWdkRemoveChild === 'function') fnWdkRemoveChild(oElement);
        else $tr.remove();

        FLUIGC.toast({
          title:'Sucesso: ',
          message:`Item "${codigo}" deletado no GED e removido da tabela.`,
          type:'success'
        });
      } else {
        FLUIGC.toast({
          title:'Atenção: ',
          message:'Não foi possível confirmar a exclusão no GED.',
          type:'warning'
        });
      }
    } catch (e){
      console.error('Erro ao deletar item no GED:', e);
      FLUIGC.toast({ title:'Erro: ', message:'Falha ao deletar no GED.', type:'danger' });
    } finally {
      loading.hide();
    }
  });

  camposAutocomplet();

}
/*
function paginandoTabela(options, tableId, tableName, paginationId) {
  // opções opcionais
  options = options || {};
  var rowsPerPage   = options.rowsPerPage || 5; // Número de linhas por página
  var ignoreFirstTr = options.ignoreFirstTr === true; // ignorar a primeira TR (linha template do Fluig)

  var currentPage = 1;

  // 1) Resolve a tabela de forma segura
  var table = document.getElementById(tableId);
  if (!table) {
    table = document.querySelector('table[tablename="' + tableName + '"]');
  }
  if (!table) {
    console.warn('paginandoTabela: tabela não encontrada (#tabelaPlanilha ou table[tablename="tabPlanilha"]).');
    return;
  }

  // 2) Pega o tbody de forma robusta
  var tbody = (table.tBodies && table.tBodies[0]) ? table.tBodies[0] : table.querySelector("tbody");
  if (!tbody) {
    console.warn('paginandoTabela: tbody não encontrado dentro da tabela.');
    return;
  }

  // 3) Helper para obter as linhas atuais (recalcula sempre)
  function getRows(){
    var list = Array.from(tbody.querySelectorAll("tr"));
    if (ignoreFirstTr && list.length > 0) list = list.slice(1);
    return list;
  }

  displayRows();

  function displayRows() {
    var rows = getRows();
    if (rows.length === 0) {
      // limpa paginação se não houver linhas
      var paginationDiv = document.getElementById(paginationId);
      if (paginationDiv) paginationDiv.innerHTML = '';
      return;
    }

    var start = (currentPage - 1) * rowsPerPage;
    var end   = start + rowsPerPage;

    // mostra/esconde linhas
    rows.forEach(function(row, index){
      row.style.display = (index >= start && index < end) ? '' : 'none';
    });

    // Atualiza os botões de paginação
    updatePagination(rows);
  }

  function updatePagination(rows) {

    var totalPages   = Math.ceil(rows.length / rowsPerPage);
    var paginationDiv = document.getElementById(paginationId);

    
    if (!paginationDiv) {
      console.warn('paginandoTabela: div #pagination não encontrada.');
      return;
    }
    paginationDiv.innerHTML = '';

    if (rows.length <= rowsPerPage) return;

    var maxVisiblePages = 3;
    var startPage = Math.max(1, currentPage - 1);
    var endPage   = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (totalPages > maxVisiblePages && endPage === totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      var prevButton = document.createElement("button");
      prevButton.innerText = "Anterior";
      prevButton.className = "btnPagination";
      prevButton.onclick = function(){
        currentPage--;
        displayRows();
      };
      paginationDiv.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
      var pageButton = document.createElement("button");
      pageButton.innerText = i;
      pageButton.className = "btnPagination";
      if (currentPage === i) pageButton.classList.add("active");
      pageButton.onclick = function(){
        currentPage = i;
        displayRows();
      };
      paginationDiv.appendChild(pageButton);
    }

    if (totalPages > maxVisiblePages && endPage < totalPages) {
      if (endPage < totalPages - 1) {
        var dotsSpan = document.createElement("span");
        dotsSpan.innerText = "...";
        dotsSpan.style.padding = "0 8px";
        dotsSpan.style.color = "#666";
        paginationDiv.appendChild(dotsSpan);
      }
      var lastPageButton = document.createElement("button");
      lastPageButton.innerText = totalPages;
      lastPageButton.className = "btnPagination";
      if (currentPage === totalPages) lastPageButton.classList.add("active");
      lastPageButton.onclick = function(){
        currentPage = totalPages;
        displayRows();
      };
      paginationDiv.appendChild(lastPageButton);
    }

    if (currentPage < totalPages) {
      var nextButton = document.createElement("button");
      nextButton.innerText = "Próxima";
      nextButton.className = "btnPagination";
      nextButton.onclick = function(){
        currentPage++;
        displayRows();
      };
      paginationDiv.appendChild(nextButton);
    }
  }

  // expõe um refresh caso você adicione/remova linhas depois
  table._paginacaoRefresh = function(){
    // se a página atual ficou “vazia” após remoções, volta uma página
    var rows = getRows();
    var maxPage = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    if (currentPage > maxPage) currentPage = maxPage;
    displayRows();
  };

  // Criar o botão de exportar se não existir
  // createExportButton(tableId, paginationId);

}
*/

function downloadPlanilha(fileName) {
    var url = '/cadastro_materiais_estoque/resources/images/' + fileName;
    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
}

/*
function exportaExcelTodasAsPaginas(tableId, nomeBaseArquivo, paginationDivId) {
    const tabela = document.getElementById(tableId);
    if (!tabela) { 
        console.warn('Tabela não encontrada:', tableId); 
        return; 
    }

    console.log('Iniciando exportacao...');

    // Nome do arquivo
    const hoje = new Date();
    const dataStr = ('0'+hoje.getDate()).slice(-2)+"-"+('0'+(hoje.getMonth()+1)).slice(-2)+"-"+hoje.getFullYear();
    const nomeArquivo = `${nomeBaseArquivo}_${dataStr}.xls`;

    // Determinar total de páginas
    let totalPages = 1;
    if (typeof window.rowsPerPage === 'number' && Array.isArray(window.rows)) {
        totalPages = Math.max(1, Math.ceil(window.rows.length / window.rowsPerPage));
    } else {
        const nums = Array.from(document.querySelectorAll('#'+ paginationDivId +' .btnPagination'))
        .map(b => parseInt(b.textContent, 10)).filter(n => !isNaN(n));
        if (nums.length) totalPages = Math.max(...nums);
    }

    console.log('Total de paginas:', totalPages);

    // Guardar estado atual
    const paginaOriginal = window.currentPage || 1;
    const visAnterior = tabela.style.visibility;
    tabela.style.visibility = 'hidden';

    // Cabeçalho: copiar os TH visíveis (sem .hide/.remove)
    const thead = tabela.querySelector('thead');
    const colsHeader = [];
    if (thead) {
        thead.querySelectorAll('th').forEach(th=>{
            if (!th.classList.contains('hide') && !th.classList.contains('remove')) {
                colsHeader.push(th.textContent.trim());
            }
        });
    }

    console.log('Colunas:', colsHeader);

    // Coletar linhas únicas usando Set para garantir não duplicação
    const seenKeys = new Set();
    const rowsData = [];

    // Função para achar o índice ___N típico do WDK/Fluig
    function getRowKey(tr){
        // Procura um name/id com ___N (ex.: tb_conta___7)
        const el = tr.querySelector('input, select, textarea');
        if (el){
            const nm = (el.getAttribute('name') || el.id || '');
            const m = nm.match(/___(\d+)/);
            if (m) return m[1];
        }
        // Fallback: usa índice da própria TR no tbody
        const tbody = tr.parentElement;
        return Array.from(tbody.children).indexOf(tr).toString();
    }

    // Percorrer todas as páginas
    for (let p = 1; p <= totalPages; p++) {
        console.log('Processando pagina ' + p + '/' + totalPages);
        
        if (typeof window.displayRows === 'function') {
            window.currentPage = p;
            window.displayRows();
        }

        const trs = tabela.querySelectorAll('tbody tr');
        console.log('  Linhas encontradas: ' + trs.length);

        trs.forEach((tr, idx) => {
            // Ignora linhas de template vazio do Fluig
            if (tr.classList.contains('template') || tr.style.display === 'none') {
                return;
            }

            const key = getRowKey(tr);
            
            if (seenKeys.has(key)) {
                console.log('  Linha duplicada ignorada (key: ' + key + ')');
                return;
            }
            
            seenKeys.add(key);

            // Monta as células só das colunas visíveis
            const cells = Array.from(tr.children)
            .filter(td => !td.classList.contains('hide') && !td.classList.contains('remove'))
            .map(td=>{
                const input  = td.querySelector('input:not([type="hidden"])');
                const area   = td.querySelector('textarea');
                const select = td.querySelector('select');
                
                if (input)  return (input.value || '').trim();
                if (area)   return (area.value || '').trim();
                if (select) {
                    const opt = select.options[select.selectedIndex];
                    return opt ? (opt.text || '').trim() : '';
                }
                
                const clone = td.cloneNode(true);
                clone.querySelectorAll('.remove, button, i, svg').forEach(el=>el.remove());
                return clone.textContent.replace(/\s+/g,' ').trim();
            });

            // Descarta linhas completamente vazias
            if (cells.some(v => v !== '')) {
                rowsData.push(cells);
                console.log('  Linha adicionada (key: ' + key + '): ' + cells.slice(0, 3).join(', ') + '...');
            }
        });
    }

    console.log('Total de linhas unicas coletadas: ' + rowsData.length);

    // Restaurar a página original
    if (typeof window.displayRows === 'function') {
        window.currentPage = paginaOriginal;
        window.displayRows();
    }
    tabela.style.visibility = visAnterior;

    // Construir HTML
    let html = '<table><thead><tr>';
    colsHeader.forEach(h=> html += `<th>${escapeHtml(h)}</th>`);
    html += '</tr></thead><tbody>';
    
    rowsData.forEach(row=>{
        html += '<tr>';
        row.forEach(cell=>{
            html += `<td>${escapeHtml(cell).replace(/\r\n|\r|\n/g,'<br>')}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    const meta = '<meta http-equiv="content-type" content="text/html; charset=UTF-8" />';
    const blob = new Blob([meta + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();

    console.log('Download iniciado: ' + nomeArquivo);

    function escapeHtml(s){
        return String(s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
    }
}
*/

// function createExportButton(tableId, divPaginationId) {
//   console.log('Criando botão de exportação... Table ID:', tableId, 'DivPaginationId:', divPaginationId);

//   // Remove o container anterior se existir
//   var exportContainer = document.getElementById("export-container");
//   if (exportContainer) {
//       exportContainer.remove();
//   }

//   // Cria novo container
//   exportContainer = document.createElement("div");
//   exportContainer.id = "export-container";

//   const exportButton = document.createElement("button");
//   exportButton.innerText = "Exportar Planilha";
//   exportButton.className = "btnExport";
//   exportButton.type = "button"; // ← CRUCIAL: Previne o submit do formulário
  
//   exportButton.onclick = function(e) {
//     e.preventDefault(); // ← CRUCIAL: Previne o comportamento padrão
//     e.stopPropagation(); // ← Previne propagação do evento
//     exportaExcelTodasAsPaginas(tableId, 'Cadastro_Materiais_Estoque', divPaginationId);
//     return false; // ← Segurança adicional
//   };
  
//   exportContainer.appendChild(exportButton);

//   const paginationContainer = document.getElementById(divPaginationId);
//   if (paginationContainer) {
//       paginationContainer.appendChild(exportContainer);
//   } else {
//       console.warn('Pagination container não encontrado:', divPaginationId);
//   }
// }


// ===== UTIL: limpa texto de célula =====
function _cellText(el){
  if(!el) return '';

  // texto visível padrão
  var txt = (el.textContent || '').replace(/\s+/g,' ').trim();

  // Se for a coluna "Narrativa", pegar do hidden da LINHA (tr)
  var td = el.closest('td');
  if (td) {
    var tr    = td.closest('tr');
    var table = td.closest('table');
    if (tr && table) {
      var tableId = table.id;
      var tdIndex = Array.prototype.indexOf.call(td.parentNode.children, td);

      // Coluna Narrativa é a 6ª (índice 5) nas duas tabelas
      if (tdIndex === 5) {
        var hiddenEl = null;

        if (tableId === 'tabelaConsulta') {
          // Tabela B
          hiddenEl = tr.querySelector('input.narrativaTabelaConsulta');
        } else if (tableId === 'tabelaPlanilha') {
          // Tabela A
          hiddenEl = tr.querySelector('input.narrativaTabelaCadastro');
        }

        if (hiddenEl && typeof hiddenEl.value === 'string' && hiddenEl.value.trim() !== '') {
          txt = hiddenEl.value.trim();
        }
      }
    }
  }

  // fallback: se ainda vazio, tenta hidden dentro da célula
  if (!txt) {
    var hiddenInline = el.querySelector('input[type="hidden"]');
    if (hiddenInline && hiddenInline.value) {
      txt = hiddenInline.value.trim();
    }
  }

  return txt;
}



// ===== UTIL: monta CSV (todas as linhas, todas as páginas) =====
function exportTableToCSV(table, opts){
  opts = opts || {};
  var delimiter     = opts.delimiter || ';';         // Excel BR adora ";"
  var ignoreFirstTr = opts.ignoreFirstTr === true;   // ignora TR template do Fluig
  var skipClass     = opts.skipClass || 'remove';    // não exportar colunas com esta classe

  if(!table) return;

  // Resolve thead/headers
  var thead = table.tHead || table.querySelector('thead');
  var headerCells = thead ? Array.from(thead.querySelectorAll('tr:last-child th, tr:last-child td')) : [];
  // Quais colunas exportar? (não as que têm .remove ou data-no-export)
  var exportColIdx = [];
  var headerRow = [];

  headerCells.forEach(function(th, idx){
    var skip = th.classList.contains(skipClass) || th.hasAttribute('data-no-export');
    if(!skip){
      exportColIdx.push(idx);
      headerRow.push(_cellText(th));
    }
  });

  // Resolve tbody e linhas
  var tbody = (table.tBodies && table.tBodies[0]) ? table.tBodies[0] : table.querySelector('tbody');
  var trs   = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
  if (ignoreFirstTr && trs.length > 0) trs = trs.slice(1); // ignora linha template

  // Monta dados
  var lines = [];
  if (headerRow.length) lines.push(headerRow);

  trs.forEach(function(tr){
    // Ignora linhas vazias/placeholder
    var tds = Array.from(tr.querySelectorAll('td, th'));
    if (!tds.length) return;

    var row = [];
    exportColIdx.forEach(function(colIdx){
      var td = tds[colIdx];
      // também permite pular célula específica (se tiver .remove ou data-no-export)
      if (td && (td.classList.contains(skipClass) || td.hasAttribute('data-no-export'))) {
        // nada
      } else {
        var val = _cellText(td);
        // Escapa para CSV: se contiver ; " \n \r -> envolve em aspas e duplica aspas
        if (/[;\n\r"]/.test(val)) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        row.push(val);
      }
    });
    // Se a linha tiver alguma informação, adiciona
    if (row.some(function(x){ return x && x.length; })) {
      lines.push(row);
    }
  });

  // Concatena CSV
  var csv = lines.map(function(arr){ return arr.join(delimiter); }).join('\r\n');
  // BOM para Excel abrir com acentuação correta
  var csvWithBom = '\uFEFF' + csv;

  // Download
  var blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
  var url  = URL.createObjectURL(blob);

  // Nome de arquivo
  var now   = new Date();
  var ts    = now.getFullYear().toString()
            + String(now.getMonth()+1).padStart(2,'0')
            + String(now.getDate()).padStart(2,'0') + '_'
            + String(now.getHours()).padStart(2,'0')
            + String(now.getMinutes()).padStart(2,'0')
            + String(now.getSeconds()).padStart(2,'0');
  var name  = (opts.filenamePrefix || 'export') + '_' + ts + '.csv';

  var a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

// ===== Garante o botão "Exportar Planilha" dentro da div de paginação =====
function ensureExportButton(paginationDiv, table, opts){
  if (!paginationDiv || !table) return;

  // evita duplicar
  var existing = paginationDiv.querySelector('button.btnExport');
  if (existing) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btnExport';
  btn.textContent = 'Exportar Planilha';
  btn.style.marginLeft = 'auto';   // empurra para a direita
  btn.style.marginTop  = '6px';    // (opcional) fica bonito quando quebra linha

  btn.addEventListener('click', function(){
    exportTableToCSV(table, {
      delimiter: ';',
      ignoreFirstTr: !!(opts && opts.ignoreFirstTr),
      skipClass: 'remove',
      filenamePrefix: (opts && opts.filenamePrefix) || (table.id || table.getAttribute('tablename') || 'tabela')
    });
  });

  paginationDiv.appendChild(btn);
}

// ===== SUA FUNÇÃO DE PAGINAÇÃO (com 2 pequenas adições) =====
function paginandoTabela(options, tableId, tableName, paginationId) {
  options = options || {};
  var rowsPerPage   = options.rowsPerPage || 5;
  var ignoreFirstTr = options.ignoreFirstTr === true;

  var currentPage = 1;

  // 1) Resolve a tabela de forma segura
  var table = document.getElementById(tableId);
  if (!table) {
    table = document.querySelector('table[tablename="' + tableName + '"]');
  }
  if (!table) {
    console.warn('paginandoTabela: tabela não encontrada (#' + tableId + ' ou table[tablename="' + tableName + '"]).');
    return;
  }

  // 2) Pega o tbody
  var tbody = (table.tBodies && table.tBodies[0]) ? table.tBodies[0] : table.querySelector("tbody");
  if (!tbody) {
    console.warn('paginandoTabela: tbody não encontrado dentro da tabela.');
    return;
  }

  // 3) Helper para obter as linhas atuais (recalcula sempre)
  function getRows(){
    var list = Array.from(tbody.querySelectorAll("tr"));
    if (ignoreFirstTr && list.length > 0) list = list.slice(1);
    return list;
  }

  displayRows();

  function displayRows() {
    var rows = getRows();
    var paginationDiv = document.getElementById(paginationId);

    if (rows.length === 0) {
      if (paginationDiv) paginationDiv.innerHTML = '';
      return;
    }

    var start = (currentPage - 1) * rowsPerPage;
    var end   = start + rowsPerPage;

    rows.forEach(function(row, index){
      row.style.display = (index >= start && index < end) ? '' : 'none';
    });

    updatePagination(rows);
  }

  function updatePagination(rows) {
    var totalPages    = Math.ceil(rows.length / rowsPerPage);
    var paginationDiv = document.getElementById(paginationId);

    if (!paginationDiv) {
      console.warn('paginandoTabela: div #' + paginationId + ' não encontrada.');
      return;
    }
    paginationDiv.innerHTML = '';

    // deixa a barra de paginação flex, com o botão à direita
    paginationDiv.style.display = 'flex';
    paginationDiv.style.alignItems = 'center';
    paginationDiv.style.flexWrap = 'wrap';
    paginationDiv.style.gap = '6px';

    if (rows.length <= rowsPerPage) {
      // Mesmo com 1 página, garante o botão de exportar
      ensureExportButton(paginationDiv, table, {
        ignoreFirstTr: ignoreFirstTr,
        filenamePrefix: paginationId === 'pagination2' ? 'consulta' : 'planilha'
      });
      return;
    }

    var maxVisiblePages = 3;
    var startPage = Math.max(1, currentPage - 1);
    var endPage   = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (totalPages > maxVisiblePages && endPage === totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      var prevButton = document.createElement("button");
      prevButton.innerText = "Anterior";
      prevButton.className = "btnPagination";
      prevButton.onclick = function(){ currentPage--; displayRows(); };
      paginationDiv.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
      var pageButton = document.createElement("button");
      pageButton.innerText = i;
      pageButton.className = "btnPagination";
      if (currentPage === i) pageButton.classList.add("active");
      pageButton.onclick = function(){ currentPage = i; displayRows(); };
      paginationDiv.appendChild(pageButton);
    }

    if (totalPages > maxVisiblePages && endPage < totalPages) {
      if (endPage < totalPages - 1) {
        var dotsSpan = document.createElement("span");
        dotsSpan.innerText = "...";
        dotsSpan.style.padding = "0 8px";
        dotsSpan.style.color = "#666";
        paginationDiv.appendChild(dotsSpan);
      }
      var lastPageButton = document.createElement("button");
      lastPageButton.innerText = totalPages;
      lastPageButton.className = "btnPagination";
      if (currentPage === totalPages) lastPageButton.classList.add("active");
      lastPageButton.onclick = function(){ currentPage = totalPages; displayRows(); };
      paginationDiv.appendChild(lastPageButton);
    }

    if (currentPage < totalPages) {
      var nextButton = document.createElement("button");
      nextButton.innerText = "Próxima";
      nextButton.className = "btnPagination";
      nextButton.onclick = function(){ currentPage++; displayRows(); };
      paginationDiv.appendChild(nextButton);
    }

    // >>> AQUI: garante o botão "Exportar Planilha" dentro da mesma div de paginação
    ensureExportButton(paginationDiv, table, {
      ignoreFirstTr: ignoreFirstTr,
      filenamePrefix: paginationId === 'pagination2' ? 'consulta' : 'planilha'
    });
  }

  // expõe um refresh caso você adicione/remova linhas depois
  table._paginacaoRefresh = function(){
    var rows = getRows();
    var maxPage = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    if (currentPage > maxPage) currentPage = maxPage;
    displayRows();
  };

}
