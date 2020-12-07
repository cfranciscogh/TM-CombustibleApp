var rutaWS = "http://proveedores.tmeridian.com.pe:9001/api_combustible/";
//var rutaWS = "https://www.meridian.com.pe/AntaresAduanas/Servicio_TEST/AntaresAduanas/";

$(document).ready(function(e) {
	
    	$("#ingresar").click(function(e) {
            e.preventDefault();			
			setTimeout(loginValidar, 100);
        });
		

});

var loginValidar = function(){
		
	  if ( $("#usuario").val() == "0" ) 
		{
			alerta('Ingresar usuario');
			return;
		} 
		
	if (  $("#clave").val() == "" )
		{
			alerta('Ingresar contraseña');
			return;
		} 

	$.mobile.loading('show');
	var placa = $("#usuario").val();
	var pass = $("#clave").val();
	/*$.post("http://proveedores.tmeridian.com.pe:9001/api_combustible/Login", {placa, pass})
	.done(function(data){
		console.info(data);
		if(data.split(',')[1]==""){ 
			window.localStorage.setItem("txtPlaca",placa);
			location.href = "consulta.html?placa=" + placa; 
		}else{
			alert(data.split(',')[1]);
			$("#txtPass").val('');
			$("#txtPass").focus();
			
		}
			
	}).fail(function( jqXHR, textStatus, errorThrown ) {
		alert(textStatus);
		console.log(jqXHR);
	}); 
	
	return;*/
	$.ajax({
        url : rutaWS + "Login",
        type: "POST",
		crossDomain: true,
		data: {placa, pass},
        //dataType : "json",
        //data : '{"usuario" : "' + $("#placa").val() + '", "pass" : "' + $("#clave").val() + '"}',
        //contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
		  console.log(data);		
          resultado = data.split(',');//$.parseJSON(data.d);
		  console.log(resultado);
		  if ( resultado[1] == ""){			  
			  	var recordar = ( $('input#recordar').is(':checked') ? 1 : 0);
			    window.localStorage.setItem("user", $("#usuario").val());
				window.localStorage.setItem("pass",$("#clave").val());
				//window.localStorage.setItem("code", resultado.datos[0].codigo);				
				window.localStorage.setItem("recordar", recordar);
				location.href = "consulta.html?placa=" + placa; 
		  }
		  else{
			   $.mobile.loading('hide');
			   var message = resultado[1];//resultado.message;
			   alerta(message);
			   //$("#usuario").val("");
			   $("#clave").val("");
			   //$("#usuario").focus();
			   $(".loadLogin").fadeOut("fast");
		  }
        },

        error : function(jqxhr) 
        {
			console.log(jqxhr);
			$.mobile.loading('hide');
			alerta('Error de conexi\u00f3n, contactese con sistemas!'); 
        }

    });	
	

};

function alertDismissed(){
}

function alerta(mensaje){
	if ( navigator.notification == null ){
		alert(mensaje);
		return;
	}
	 navigator.notification.alert(
            mensaje,  // message
            alertDismissed,         // callback
           'Informaci\u00f3n',            // title
            'Aceptar'                  // buttonName
        	);
	
}
