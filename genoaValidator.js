var GenoaValidator = function(customConfig){
	var obj = {
		config : {
			errorClass : 'vldError', // clase que se le añade al campo
			errorMsgClass : 'vldmsg', // clase mensaje error
			errorWrapperClass : 'vldW', // clase contenedor mensaje error e input
			errorAttr : 'vdtmsg', // data-XXXX en el que opcionalmente se puede insertar un mensaje de error para un campo
			listAttr : 'vdt', // data-XXXX en el que se introducen las validaciones para un campo separadas por ,
			time : 0, // tiempo muestra cartel error
			showMsg : true // mostrar mensaje de error
		},
		addValidations : function(obj){
			var $this=this;
			$.each(obj,function(i,el){
				$this.validations[i]=el;
			});
		},
		validations : {
			required : {
				error : 'Obligatorio',
				validation : function(value){
					return (!value)?false:true;
				}
			},
			email : {
				error : 'Mail no válido',
				validation : /[\w-\.]{1,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/,
			}
		},
		init : function (arr){
			var $this=this;
			$.each(arr,function(index,element){
				var element=$(element);
				element.focus(function(e){
					$this.removeError(element);
				}).blur(function(e){
					$this.testElement(element);
				});
			});
		},
		run : function (arr){
			var $this=this;
			var isValid=true;
			$.each(arr,function(index,element){
			    var element=$(element);
			    if(!$this.testElement(element)) isValid=false;
			});
			return isValid;
		},
		showError : function(element,tester){
			var msg=(element.data(this.config.errorAttr))?element.data(this.config.errorAttr):this.validations[tester].error;
			element.addClass(this.config.errorClass);
			var parent=element.parent();
			if(!parent.hasClass(this.config.errorWrapperClass)){
				element.wrap('<div class="'+this.config.errorWrapperClass+'"></div>');
				parent=element.parent(); // se ha redefinido el DOM al hacer el wrap
				parent.append('<div class="'+this.config.errorMsgClass+'"></div>');
			}
			parent.find('.'+this.config.errorMsgClass).html(msg).show(this.config.time);
			//console.log(tester);
		},
		removeError : function(element){
			element.removeClass(this.config.errorClass);
			var parent = $(element.parent());
			if (parent.hasClass(this.config.errorWrapperClass)){
				parent.find('.'+this.config.errorMsgClass).hide(this.config.time);
				// borrar el interior del mensaje, etc
			}
		},
		testElement : function(element,showError){
		    if(typeof showError == 'undefined') showError=this.config.showMsg;
		    if(showError) this.removeError(element);
		    var isValid=true;
		    var $this=this;
		    $.each(element.data(this.config.listAttr).split(','),function(j,e){
			e = e.trim();
			if(!$this.doTest(element,e)){
				if(showError) $this.showError(element,e);
				isValid=false;
				return false; // no sigo validando el resto de cosas del campo porque ya está mal
			}
		    });
		    return isValid;
		},
		doTest : function (element,tester){
			var testObj=this.validations[tester];
			if(typeof testObj == 'undefined') return this.exception('Validación '+tester+' no descrita para el campo '+element.attr('name'));
			// TODO coger el value según el tipo de elemento y guardarlo en una variable value que se pase a lo de debajo.
			// select, textarea, elementos rarunos...cada uno tiene su movida
			switch(typeof testObj.validation){
				case 'function': return testObj.validation(element.val());
				case 'object': return testObj.validation.test(element.val());
				default: return this.exception('Validación '+tester+' no válida');
			}
		},
		exception : function(msg){
			console.log(msg);
			return false;
		}
	};
	if(typeof customConfig != 'undefined') obj.config=$.extend(obj.config, customConfig);
	return obj;
}
