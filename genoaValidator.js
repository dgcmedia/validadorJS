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
				validation : function(value,element){
					return (!value)?false:true;
				}
			},
			email : {
				error : 'Mail no válido',
				validation : /[\w-\.]{1,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/,
			},
			checked : {
				error : 'Ha de hacer check en este campo.',
				validation : function(value,element){
					return element.is(':checked');
				}
			},
			noblank : {
				error : 'No puede contener espacios en blanco',
				validation : function (value){
					return (value.indexOf(" ")===-1);
				}
			},
			repass : {
				error : 'Las contraseñas no coinciden',
				validation : function(value,element,validator){
					var valid=true;
					var passElements=$("[data-"+validator.config.listAttr+"*='repass']");
					$.each(passElements,function(i,item){
						item=$(item);
						if(item.val()!=value){
							valid=false;
							return false;
						}
					});
					$.each(passElements,function(i,item){
						item=$(item);
						if(!valid) validator.showError(item,'repass');
						else validator.removeError(item);
					});
					return valid;
				}
			},
			minLength : {
				validation : function (value,element,validator){
					var length = element.data('minlength');
					if(value.length<length) return 'El campo ha de tener al menos '+length+' caracteres ';
					else return true;
				}
			},
			phone : {
				error : 'Formato no válido. No puede contener espacios',
				validation : /^$|(\\+[0-9]{2})?[0-9]{9}/
			},
			pass : {
				error : 'La contraseña ha de tener un mínimo de 8 caracteres, y contener al menos una mayúscula, una minúscula y un número. Sin espacios.',
				validation : /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,255}$/
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
		showError : function(element,tester,msg){
			try{
				if(!msg)
					msg=(element.data(this.config.errorAttr))?element.data(this.config.errorAttr):this.validations[tester].error;
				element.addClass(this.config.errorClass);
				var parent=element.parent();
				if(!parent.hasClass(this.config.errorWrapperClass)){
					element.wrap('<div class="'+this.config.errorWrapperClass+'"></div>');
					parent=element.parent(); // se ha redefinido el DOM al hacer el wrap
					parent.append('<div class="'+this.config.errorMsgClass+'"></div>');
				}
				parent.find('.'+this.config.errorMsgClass).html(msg).show(this.config.time);
			}catch(e){
				console.log('Error al mostrar mensaje del validador Genoa');
				console.log(e);
			}
		},
		removeError : function(element){
			try{
				element.removeClass(this.config.errorClass);
				var parent = $(element.parent());
				if (parent.hasClass(this.config.errorWrapperClass)){
					parent.find('.'+this.config.errorMsgClass).hide(this.config.time);
					// borrar el interior del mensaje, etc
				}
			}catch(e){
				console.log('Error al eliminar error del validador Genoa');
				console.log(e);
			}				
		},
		testElement : function(element,showError){
		    if(typeof showError == 'undefined') showError=this.config.showMsg;
		    if(showError) this.removeError(element);
		    var isValid=true;
		    var $this=this;
		    $.each(element.data(this.config.listAttr).split(','),function(j,e){
				e = e.trim();
				var res=$this.doTest(element,e);
				if(res!==true){
					if(showError) $this.showError(element,e,res);
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
			var val = element.val();
			switch(typeof testObj.validation){
				case 'function': return testObj.validation(val,element,this);
				case 'object': return testObj.validation.test(val);
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
