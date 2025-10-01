var MyWidget = SuperWidget.extend({
    //variáveis da widget
    variavelNumerica: null,
    variavelCaracter: null,

    //método iniciado quando a widget é carregada
    init: function() {

        console.log('Deploy: 9');

        camposAutocomplet();

        $('#descricao').on('input', function () {
            var valor = $(this).val();
            valor = valor.toUpperCase();
            valor = valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            valor = valor.replace(/[^A-Z ]/g, "");
            $(this).val(valor);
        }); 

         $('#m_descricao').on('input', function () {
            var valor = $(this).val();
            valor = valor.toUpperCase();
            valor = valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            valor = valor.replace(/[^A-Z ]/g, "");
            $(this).val(valor);
        }); 

        $('.tab').on('click', function() {
            console.log('Cliquei na aba');
            const tabName = $(this).data('tab');        
            $('.tab, .tab-content').removeClass('active');
            $(this).addClass('active');
            $('#' + tabName).addClass('active');
            camposAutocomplet();
        });
        
        $('#btnCadastraMaterial').on('click', function() {

            var loading = FLUIGC.loading(window, {
                textMessage: 'Cadastrando...',
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
            
            var estab = $('#cod_estab').val();
            var codigo = $('#codigo').val();
            var descricao = $('#descricao').val();
            var quantidade = $('#quantidade').val();
            
            $('#divTabCadastro').removeClass('hide');
            var resultado = cadastraMaterial('tabelaCadastro',estab, codigo, descricao, quantidade);
            console.log('Resultado do cadastro: ', resultado);

            autocompletex2.removeAll();
            autocompletex4.removeAll();
            $('#cod_estab').val("");
            $('#descricao').val("");
            $('#quantidade').val("");
            

            loading.hide();

        });

        $("#planilha").on('change', function() {

            var loading = FLUIGC.loading(window, {
                textMessage: 'Fazendo upload do arquivo...',
                title: "Loading",
                css: {
                padding: 0, margin: 0, width: '30%', top: '40%', left: '35%',
                textAlign: 'center', color: '#000', border: '3px solid #aaa',
                backgroundColor: '#fff', cursor: 'wait'
                },
                overlayCSS: { opacity: 0.7, cursor: 'wait' },
                cursorReset: 'default',
                baseZ: 1001, centerX: true, centerY: true, bindEvents: true,
                fadeIn: 200, fadeOut: 400, timeout: 0, showOverlay: true
            });

            loading.show();

            var file = this.files[0];
            uploadPlanilha(file);

            loading.hide();
        });
        
    },
  
});

