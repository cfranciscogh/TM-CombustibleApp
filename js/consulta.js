var rutaWS = "http://proveedores.tmeridian.com.pe:9001/servicios/";
//var rutaWS = "http://localhost:34927/";
var parametros = null;
var placa = "";
var Li = null;
var imageData64 = "";
function base64toBlob(base64Data, contentType) {
    contentType = contentType || 'image/jpeg';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function sendImage(src) {
    src = (src == 'library') ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA;
    navigator.camera.getPicture(CamaraSuccess, CamaraFail, { 
        quality: 60,
        destinationType: navigator.camera.DestinationType.DATA_URL,
        sourceType: src, 
		//targetWidth: 1240,
		//targetHeight: 1754,
		correctOrientation: true,
        encodingType: navigator.camera.EncodingType.JPEG,
        saveToPhotoAlbum: false
    });
}
 
function CamaraSuccess(imageData) {
    //$.mobile.loading('show'); 
	$("#img_detalle").val();
	imageData64 = imageData;
	$("#imgFoto").attr("src", "data:image/jpeg;base64," + imageData);
	$("#imgFoto").css("opacity","1");
	//alert(imageData);
	return;
	
    if (window.FormData !== undefined) {
        var data = new FormData();
        data.append("IDPedido", $("#IDPedido").val());
        var blob = b64toBlob(imageData, 'image/jpeg');
        data.append("file", blob);
        //alert(data);
        $.ajax({
            type: "POST",
			url: dominio_extranet + '/Servicios/UploadImageTracking.ashx?NroOrden=' + NroOrden,
            contentType: false,
            processData: false,
            data: data,
            success: function (result) {
                resp = result.toString().split("|");
                console.log(resp);
                if (resp[0] == 0) {
                    alerta(resp[1]);
                    setFotosPedido($.QueryString["IDPedido"]);
                }
                else {
                    //alerta("Error, no se pudo subir la foto");
                    alerta(resp[1]);
                    //alerta(resp[2]);
                }
                    

                $.mobile.loading('hide');
                //$('#fileFoto').val("");
            },
            error: function (xhr, status, p3, p4) {
                var err = "Error " + " " + status + " " + p3 + " " + p4;
                if (xhr.responseText && xhr.responseText[0] == "{")
                    err = JSON.parse(xhr.responseText).Message;

                //$('#file').val("");
                console.log(xhr);
                console.log(status);
				alerta("Error, no se pudo subir la foto");
                alerta(err);
                $.mobile.loading('hide');
            }
        });
    } else {
        alert("This app doesn't support file uploads!");
        $.mobile.loading('show');
    }
    /*
    var url = dominio_extranet + '/Public/Servicios/UploadImageTracking.ashx?IDPedido=' + $("#IDPedido").val();
    var params = { image: imageData };
    // send the data
    $.post(url, params, function (data) {
        console.log(data)
        alert(data);
    });
    */
}

function CamaraFail(message) {
    //alert(message);
}


$(document).ready(function(e) {  
	//getProgramaciones();
	
	$('#btnFoto').click(function () { sendImage("camera"); });   
	$('#btnAlbum').click(function () { sendImage("library"); });   
	
	placa = $.QueryString["placa"];
	//code_usuario = window.localStorage.getItem("code");
	$("#actualizar").click(function(e) {
        getConsumos();
    });
	 $("form").keypress(function(e) {
        if (e.which == 13) {
            return false;
        }
    });
	
	$("#guardar").click(function(e) {
		setValidar();
    });
	
	$("#btnContinuar").click(function(e) {
        setGuardar();
    });
	
	$("#btnEliminar").click(function(e) {
        setEliminar();
    });
	
	$("#btnCancelar").click(function(e) {
       $(".page2").fadeOut(100,function(){
		   $(".page1").fadeIn();
	   });
    });
	
 	getConsumos();
	
});	
 
function getConsumos(){
	$.mobile.loading('show'); 
	$("#listProgramacion").html(""); 	
	$.ajax({
        url: rutaWS + "Combustible/Grifo.asmx/ConsultarConsumo",
        type: "POST",
		//crossDomain: true,
        dataType : "json",
        data : '{"placa":"' + placa + '"}',
        //contentType: "xml",
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
		resultado = $.parseJSON(data.d);
			//console.log(resultado); 
			$.mobile.loading('hide');
			$(".panelMensaje").hide();
			$(".panelOrden").fadeIn("fast");			
			if ( resultado.length > 0 ){
				var count = 0;
				for (var i = 0; i<resultado.length;i++){ 				
					$("#listProgramacion").append("<li data-pos='" + i + "' data-id='"+ $.trim(resultado[i].id_detalle)+"' data-clie='"+ $.trim(resultado[i].id_cabecera)+"'><a onclick='Editar(this);' data-ajax='false' style='font-weight: normal;' ><b>Fecha: </b>"+ $.trim(resultado[i].fch_documento) + "<br><b>Nro. Ticket: </b>"+ $.trim(resultado[i].num_documento) + "<br><b>Galones: </b>"+ $.trim(resultado[i].cantidad) + "<br><b>Kilometraje: </b>"+ $.trim(resultado[i].Kilometraje) +"</a></li>");
				}
				$("#listProgramacion").listview("refresh");				
			}
			else{
				$(".panelOrden").hide();
				$(".panelMensaje").fadeIn("fast");
			}
        },
        error : function(jqxhr) 
        {
		   console.log(jqxhr);	
           alerta('Error de conexi\u00f3n, contactese con sistemas!');
        }

    });		 
	
}

function Editar(ctrl){
	var pos = $(ctrl).parent().data("pos");
	//alert(pos);
	limpiarForm();
	if (pos == 0) {
		var id = $(ctrl).parent().data("id");
		
		$.ajax({
        url: rutaWS + "Combustible/Grifo.asmx/ConsultarConsumo_PorCodigo",
        type: "POST",
		//crossDomain: true,
        dataType : "json",
        data : '{"codigo":' + id + '}',
        //contentType: "xml",
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
		resultado = $.parseJSON(data.d);
			//console.log(resultado); 
			$.mobile.loading('hide');
			$(".panelMensaje").hide();
			$(".panelOrden").fadeIn("fast");			
			if ( resultado.length > 0 ){
				var count = 0;
				for (var i = 0; i<resultado.length;i++){ 
					$("#cod_detalle").val($.trim(resultado[i].id_detalle));
					$("#txtDocumento").val($.trim(resultado[i].num_documento));	
					$("#txtCantidad").val($.trim(resultado[i].cantidad));	
					$("#txtKilometraje").val($.trim(resultado[i].Kilometraje));	
					$("#imgFoto").css("opacity","1");
					$("#imgFoto").attr("src",$.trim(resultado[i].cUrl));
					var arrFoto = resultado[i].cUrl.toString().split("/");
					$("#img_detalle").val(arrFoto[arrFoto.length-1]);
					 //$("#listProgramacion").append("<li data-pos='" + i + "' data-id='"+ $.trim(resultado[i].id_detalle)+"' data-clie='"+ $.trim(resultado[i].id_cabecera)+"'><a onclick='Editar(this);' data-ajax='false' style='font-weight: normal;' ><b>Fecha: </b>"+ $.trim(resultado[i].fch_documento) + "<br><b>Nro. Ticket: </b>"+ $.trim(resultado[i].num_documento) + "<br><b>Galones: </b>"+ $.trim(resultado[i].cantidad) + "<br><b>Kilometraje: </b>"+ $.trim(resultado[i].Kilometraje) +"</a></li>");
				}
				//$("#listProgramacion").listview("refresh");
				$(".page2 ul li").eq(1).show();
				$(".page2 ul").attr("class","ui-grid-b");
				$(".page2 ul li").eq(2).attr("class","ui-block-c");					
				$(".page1").fadeOut(100,function(){
					$(".page2").fadeIn();
				});				
			}
			else{
				alerta("No se encontro información");
			}
			
			
        },
        error : function(jqxhr) 
        {
		   console.log(jqxhr);	
           alerta('Error de conexi\u00f3n, contactese con sistemas!');
        }

    });		
		
		
		
	}
}

function setValidar(){
	limpiarForm();
	$(".page2 ul li").eq(1).hide();
	$(".page2 ul").attr("class","ui-grid-a");
	$(".page2 ul li").eq(2).attr("class","ui-block-b");	
	$(".page1").fadeOut(100,function(){
		 $(".page2").fadeIn();
	 });
}

function limpiarForm(){
	$("#cod_detalle").val(0);
	$("#txtDocumento").val("");	
	$("#txtCantidad").val("");	
	$("#txtKilometraje").val("");	
	$("#imgFoto").attr("src",""); 
	$("#imgFoto").css("opacity","0");
	$("#img_detalle").val("");
} 

function setGuardar(){
	 
	if ($("#txtDocumento").val() == ""){
		alerta("Debe ingresar nro de ticket"); 
		$("#txtDocumento").focus();
		return;
	}
	
	if ($("#txtCantidad").val() == ""){
		alerta("Debe ingresar cantidad de galones"); 
		$("#txtCantidad").focus();
		return;
	}

	if ($("#txtKilometraje").val() == ""){
		alerta("Debe ingresar kilometraje"); 
		$("#txtKilometraje").focus();
		return;
	}
	
	if ( $("#imgFoto").attr("src") == ""){
		alerta("Debe tomar foto al ticket"); 
		return;
	}
	
	var parametros = new Object();
	parametros.id_detalle = $("#cod_detalle").val();	
	parametros.nro_placa = placa;	
	parametros.num_documento = $("#txtDocumento").val();	
	parametros.cantidad = $("#txtCantidad").val();
	parametros.Kilometraje = $("#txtKilometraje").val();
	parametros.cUrl = $("#img_detalle").val();
	//console.log(parametros);  
	if (parametros.cUrl != ""){
		Registrar(parametros);
	}
	else {
		if (window.FormData !== undefined) {
			//alert(imageData64);
			var data = new FormData();
			//data.append("imagen", $(Li).data("orden"));
			//data.append("tipo", "vbo");
			var blob = b64toBlob(imageData64, 'image/jpeg');
			data.append("file", blob);
			//alert(data);
			$.ajax({
				type: "POST",
				url: rutaWS + 'Combustible/Upload.ashx',
				contentType: false,
				processData: false,
				data: data,
				success: function (result) {
					resp = result.toString().split("|");
					console.log(resp);
					if (resp[0] == 1) {
						//alerta(resp[1]);
						parametros.cUrl = resp[1];  				
						Registrar(parametros);
					}
					else {
						alerta(resp[1]);
					}						

					$.mobile.loading('hide');
					 
				},
				error: function (xhr, status, p3, p4) {
					var err = "Error " + " " + status + " " + p3 + " " + p4;
					if (xhr.responseText && xhr.responseText[0] == "{")
						err = JSON.parse(xhr.responseText).Message;

					console.log(xhr);
					console.log(status);
					alerta("Error, no se pudo subir la foto");
					$.mobile.loading('hide');
				}
			});
		} else {
			alert("This app doesn't support file uploads!");
			$.mobile.loading('show');
		}
	}	 	
}
 
function Registrar(parametros){
	console.log(parametros);	
	//return;	
	$.mobile.loading('show'); 
	$.ajax({
	url :  rutaWS + "Combustible/Grifo.asmx/Registrar",
	type: "POST",
	//crossDomain: true,
	dataType : "json",
	data : JSON.stringify(parametros),
	contentType: "application/json; charset=utf-8",
	success : function(data, textStatus, jqXHR) {
		//console
		//console.log(data.d);
		resultado = $.parseJSON(data.d);
		//console.log(resultado);
		$.mobile.loading('hide');
		 if ( resultado.code == 0){		 
			$(".page2").fadeOut(100,function(){
			   $(".page1").fadeIn();
		   });			 
			getConsumos();				
		 }			  
		 alerta(resultado.message); 
		},
		error : function(jqxhr) 
		{ 
			console.log(jqxhr);
		  alerta('Error de conexi\u00f3n, contactese con sistemas!');
		}

	});
}

function setEliminar(){
	var parametros = new Object();
	parametros.id_detalle = $("#cod_detalle").val();	 
	//return;	
	$.mobile.loading('show'); 
	$.ajax({
	url :  rutaWS + "Combustible/Grifo.asmx/Eliminar",
	type: "POST",
	//crossDomain: true,
	dataType : "json",
	data : JSON.stringify(parametros),
	contentType: "application/json; charset=utf-8",
	success : function(data, textStatus, jqXHR) {
		//console
		//console.log(data.d);
		resultado = $.parseJSON(data.d);
		//console.log(resultado);
		$.mobile.loading('hide');
		 if ( resultado.code == 1){		 
			$(".page2").fadeOut(100,function(){
			   $(".page1").fadeIn();
		   });			 
			getConsumos();				
		 }			  
		 alerta(resultado.message); 
		},
		error : function(jqxhr) 
		{ 
			console.log(jqxhr);
		  alerta('Error de conexi\u00f3n, contactese con sistemas!');
		}

	});
}


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
