<div id="MyWidget_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide" data-params="MyWidget.instance()">
    <script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Kodchasan:wght@400;700&display=swap" rel="stylesheet"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script lang="javascript" src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
  
  <div id="div_principal" class="container-fluid fluig-style-guide">
    <div class="row text-center fs-xs-margin-horizontal">
      <div class="bg-primary fs-xs-padding-top fs-md-padding-bottom">
        <h1 class="text-center">Cadastro de Materiais Para Controle de Estoque no Fluig</h1>
        <h4 id="subtitulo_${instanceId}"></h4>
        <span class="label label-success fs-text-xs">Versão 20.00</span>
      </div>
    </div>
    <div id="id01" class="w3-modal">
        <div class="w3-modal-content w3-animate-left w3-card-2">
            <header class="w3-container w3-teal" style="border-bottom: 2px solid #f8c400;">
                <div class="w3-center text-center">
                    <h2>EDITAR CADASTRO</h2>
                </div>
            </header><br>
            <div class="w3-container">				
                <div class="row">
                    <div class="form-group col-md-2">
                        <label class="control-label" for="m_estabelecimento">Estabelecimento</label>
                        <input class="form-control m_estabelecimento" type="text" name="m_estabelecimento" id="m_estabelecimento"/>
                    </div>
                    <div class="form-group col-md-6">
                        <label class="control-label" for="m_codigo">Código/Descrição</label>
                        <input class="form-control m_codigo" type="text" name="m_codigo" id="m_codigo"/>
                    </div>
                    <div class="form-group col-md-2">
                        <label class="control-label" for="m_quantidade">Quantidade</label>
                        <input class="form-control m_quantidade" type="text" name="m_quantidade" id="m_quantidade"/>						                      	 
                    </div>
                    <div class="form-group col-md-2">
                        <label class="control-label" for="m_localizacao">Localização</label>
                        <input class="form-control m_localizacao" type="text" name="m_localizacao" id="m_localizacao"/>						                      	 
                    </div>	
                    <div class="form-group col-md-12">
                        <label class="control-label" for="m_narrativa">Narrativa</label>
                        <textarea class="form-control maiuscula" rows="3" id="m_narrativa" name="m_narrativa"></textarea>					                      	 
                    </div>		
                </div>
                <div class="row">
                    <div class="col-md-12" style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
                    <button class="btnSalvar" type="button" id="btnAddModal" onclick="addItens(this);">SALVAR</button>
                    <button class="btnFechar" type="button" onclick="abreFecha('','id01');">FECHAR</button>	
                </div>
                </div>
            </div>			    					      	
        </div>
    </div>
    <div class="tabs">
      <button type="button" class="tab active" data-tab="consultar"><span class="textSpan">CONSULTAR CADASTRO</span></button>
      <button type="button" class="tab" data-tab="cadastro-unico"><span class="textSpan">CADASTRO ÚNICO</span></button>
      <button type="button" class="tab" data-tab="cadastro-massa"><span class="textSpan">CADASTRO EM MASSA</span></button>
    </div><br>  
    <!-- Aba 1: Cadastro Único -->
    <div id="cadastro-unico" class="tab-content">
        <form id="cadastroForm">
            <div class="row">
                <div class="form-group col-md-2">
                    <label class="control-label" for="estabelecimento">Estabelecimento</label>
                    <input class="form-control estabelecimento" type="text" name="estabelecimento" id="estabelecimento"/>
                    <input type="hidden" id="cod_estab" name="cod_estab"/>
                </div>
                <div class="form-group col-md-7">
                    <label class="control-label" for="codigo">Código/Descrição</label>
                    <input class="form-control codigo_descr_add" type="text" name="codigo_descr_add" id="codigo_descr_add"/>
                    <input type="hidden" id="codigo" name="codigo"/>
                    <input type="hidden" name="descricao" id="descricao"/>
                </div>
                <div class="form-group col-md-1">
                    <label class="control-label" for="quantidade">Quantidade</label>
                    <input class="form-control quantidade" type="number" name="quantidade" id="quantidade"/>						                      	 
                </div> 
                <div class="form-group col-md-2">
                    <label class="control-label" for="localizacao">Localização</label>
                    <input class="form-control localizacao maiuscula" type="text" name="localizacao" id="localizacao"/>						                      	 
                </div> 
                <div class="form-group col-md-12">
                    <label class="control-label" for="narrativa_unico">Narrativa</label>
                    <textarea class="form-control" rows="3" id="narrativa_unico" name="narrativa_unico maiuscula"></textarea>
                </div>            
            </div>
            <div class="row">
                <div class="form-group col-md-offset-5 col-md-3">
                    <button type="button" class="btn" id="btnCadastraMaterial">
                        CADASTRAR MATERIAL
                    </button>
                </div>
            </div><br>
            <div class="row hide" id="divTabCadastro">
                <table tablename="cadastro" id="tabelaCadastro" class="tabelaCombio table table-bordered table-hover">
                    <thead>
                        <tr class="tableHeadRow">
                            <th style="width: 8%;">Estabelecimento</th>
                            <th class="idTh" style="width: 10%;">Código</th>
                            <th style="width: 24%;">Descrição</th>
                            <th style="width: 8%;">Quantidade</th>
                            <th style="width: 8%;">Localização</th>
                            <th style="width: 30%;">Narrativa</th>
                            <th class="w3-centerRei remove" style="width: 12%;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </form>
    </div>
    <!-- Aba 2: Cadastro em Massa -->
    <div id="cadastro-massa" class="tab-content">
        <form id="formUpload">
            <div class="row" >					
                <div class="col-md-offset-1 col-md-5 text-center" id="divUpload">
                    <div class="custom-file-upload">
                        <input type="file" name="planilha" id="planilha" style="display: none;">
                        <div class="file-input-display">
                            <span class="file-text" id="file-text">Nenhum arquivo escolhido</span>
                            <button type="button" class="file-button" onclick="document.getElementById('planilha').click();">
                                UPLOAD DE PLANILHA
                            </button>
                        </div>
                    </div>					
                </div>
                <div class="col-md-5">
                    <button type="button" class="btn-padrao" id="downloadCadastroMateriais" onclick="downloadPlanilha('padrao_upload_materiais.xlsx')">
                    <i class="fluigicon fluigicon-download icon-sm" aria-hidden="true"></i>&nbsp;PLANILHA PADRÃO (.xlsx)
                    </button>
                </div>												
            </div><br>
            <div class="row hide" id="divTabPlanilha">
                <table tablename="tabPlanilha" id="tabelaPlanilha" class="tabelaCombio table table-bordered table-hover">
                    <thead>
                       <tr class="tableHeadRow">
                            <th style="width: 8%;">Estabelecimento</th>
                            <th class="idTh" style="width: 10%;">Código</th>
                            <th style="width: 24%;">Descrição</th>
                            <th style="width: 8%;">Quantidade</th>
                            <th style="width: 8%;">Localização</th>
                            <th style="width: 30%;">Narrativa</th>
                            <th class="w3-centerRei remove" style="width: 12%;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div id="pagination-container">
                    <div id="pagination" class="mt-2"></div>
                </div>
            </div>
        </form>        
    </div>
    <!-- Aba 3: Consultar Cadastro -->
    <div id="consultar" class="tab-content active">
        <form id="formConsulta">
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group has-feedback">
                        <label class="control-label" for="consulta_estab">Consulta por estabelecimento</label>
                        <input class="form-control consulta_estab" type="text" name="consulta_estab" id="consulta_estab"/>
                        <i class="flaticon flaticon-search icon-sm form-control-feedback" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group has-feedback">
                        <label class="control-label" for="codigo_descricao">Consultar por código ou descrição do item</label>
                        <input class="form-control codigo_descricao" type="text" name="codigo_descricao" id="codigo_descricao"/>
                        <i class="flaticon flaticon-search icon-sm form-control-feedback" aria-hidden="true"></i>
                    </div>
                </div>
                          
            </div><br>         
            <div class="row hide" id="divTabConsulta">
                <table tablename="consulta" id="tabelaConsulta" class="tabelaCombio table table-bordered table-hover">
                    <thead>
                        <tr class="tableHeadRow">
                            <th style="width: 8%;">Estabelecimento</th>
                            <th class="idTh" style="width: 10%;">Código</th>
                            <th style="width: 24%;">Descrição</th>
                            <th style="width: 8%;">Quantidade</th>
                            <th style="width: 8%;">Localização</th>
                            <th style="width: 30%;">Narrativa</th>
                            <th class="w3-centerRei remove" style="width: 12%;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div id="pagination-container2">
                    <div id="pagination2" class="mt-2"></div>
                </div>
            </div>
        </form>      
    </div>
  </div>
</div>

