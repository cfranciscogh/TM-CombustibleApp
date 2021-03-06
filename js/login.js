//var rutaWS = "http://proveedores.tmeridian.com.pe:9001/api_combustible/";
var rutaWS = "http://proveedores.tmeridian.com.pe:9001/servicios/";
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
		
	 if ( $("#usuario").val() == "admin" ) 
		{
			location.href = "consulta.html?placa=APY717"; 
		}
    //console.log(rutaWS + "Autenticacion/Login.asmx/LoginFlota");
	$.mobile.loading('show');
	var placa = $("#usuario").val();
var pass = $("#clave").val();
console.log('{"usuario" : "' + placa + '", "clave" : "' + pass + '"}');
	$.ajax({
        url : rutaWS + "Autenticacion/Login.asmx/LoginFlota",
        type: "POST",
		crossDomain: true,
		//data: {placa, pass},
        dataType : "json",
        data : '{"usuario" : "' + placa + '", "clave" : "' + pass + '"}',
        contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
		  //console.log(data);		
          resultado = $.parseJSON(data.d);
		  console.log(resultado);
		  if ( resultado.code == 1){			  
			  	var recordar = ( $('input#recordar').is(':checked') ? 1 : 0);
			    window.localStorage.setItem("user", placa);
				window.localStorage.setItem("pass",pass);
				//window.localStorage.setItem("code", resultado.datos[0].codigo);				
				window.localStorage.setItem("recordar", recordar);
				location.href = "consulta.html?placa=" + placa; 
		  }
		  else{
			   $.mobile.loading('hide');
			   var message = resultado.message;
			   alerta(message);
			   //$("#usuario").val("");
			   $("#clave").val("");
			   $("#usuario").focus();
			   $(".loadLogin").fadeOut("fast");
		  }
        },
        error : function(xhr, ajaxOptions, thrownError) 
        {
			console.log(xhr);
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
