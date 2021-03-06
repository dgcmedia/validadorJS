/**
@author David García Carbayo
	
	Validador de formularios multilenguaje.
	
	Ejemplo de inicialización: 
	var validador=GenoaValidator({
		time : 0,
		errorClass : 'vldError2',
		showMsg : true
	});

*/
;
var GenoaValidator = function(customConfig){
	var obj = {
		config : {
			errorClass : 'vldError', // clase que se le añade al campo
			errorMsgClass : 'vldmsg', // clase mensaje error
			errorWrapperClass : 'vldW', // clase contenedor mensaje error e input
			errorAttr : 'vdtmsg', // data-XXXX en el que opcionalmente se puede insertar un mensaje de error para un campo
			listAttr : 'vdt', // data-XXXX en el que se introducen las validaciones para un campo separadas por ,
			time : 0, // tiempo muestra cartel error
			posAttr: 'vdtpos', // en el input se puede indicar la posicion del mensaje de error data-XXX="10,false,false,15" (tipo css)
			showMsg : true, // mostrar mensaje de error
			lang : 0 // en caso de que los mensajes de error sean un array, índice que cogerá
		},
		/**
		 * Método para añadir nuevas validaciones del mismo formato que las validaciones incluidas en el plugin
		 * Si ya existe una de clave similar, la sustituye
		 */
		addValidations : function(obj){
			this.validations=jQuery.extend(this.validations, obj);
		},
		/**
		 * Inicia la validación automática de los campos contenidos en el array
		 * Ejemplo de llamada:
		 * validador.init($( "input[data-vdt]" ));
		 */
		init : function (arr){
			var $this=this;
			jQuery.each(arr,function(index,element){
				var element=jQuery(element);
				element.focus(function(e){
					$this.removeError(element);
				}).blur(function(e){
					$this.testElement(element);
				});
			});
		},
		/**
		 * Hace una validación completa del array pasado, devolviendo true o false.
		 * Ejemplo de llamada:
		 * var result=validador.run($( "input[data-vdt]" ));
		 */
		run : function (arr){
			var $this=this;
			var isValid=true;
			jQuery.each(arr,function(index,element){
			    var element=jQuery(element);
			    if(!$this.testElement(element)) isValid=false;
			});
			return isValid;
		},
		/**
		 * Muestra los errores de un elemento
		 * element: un elemento a validar
		 * tester: clave del test realizado (de la colección de validaciones existente)
		 * msg(opc): mensaje de error personalizado
		 */
		showError : function(element,tester,msg){
			try{
				if(!msg){
					var lang = this.config.lang;
					var msgVal='Error';
					if(typeof this.validations[tester].error == "object"){
						msgVal=(typeof this.validations[tester].error[lang] != 'undefined')?this.validations[tester].error[lang]:this.validations[tester].error[0];
					}else if(typeof this.validations[tester].error == 'string'){
						msgVal=this.validations[tester].error;
					}
					msg=(element.data(this.config.errorAttr))?element.data(this.config.errorAttr):msgVal;
				}
				element.addClass(this.config.errorClass);
				var parent=element.parent();
				if(!parent.hasClass(this.config.errorWrapperClass)){
					element.wrap('<div class="'+this.config.errorWrapperClass+'"></div>');
					parent=element.parent(); // se ha redefinido el DOM al hacer el wrap
					parent.append('<div class="'+this.config.errorMsgClass+'"></div>');
				}
				var msgEl=parent.find('.'+this.config.errorMsgClass);
				if(element.data(this.config.posAttr)){
					posArr=element.data(this.config.posAttr).split(',');
					var pos = ['top','right','bottom','left'];
					for(var k in pos){
						if(typeof posArr[k] != 'undefined' && posArr[k].trim()!="false"){
							msgEl.css(pos[k],parseInt(posArr[k])+'px');
						}
					}
				}
				msgEl.html(msg).show(this.config.time);
			}catch(e){
				this.exception('Error al mostrar mensaje del validador Genoa',e);
			}
		},
		/**
		 * Oculta el mensaje de error de un elemento (si existe)
		 */
		removeError : function(element){
			try{
				element.removeClass(this.config.errorClass);
				var parent = jQuery(element.parent());
				if (parent.hasClass(this.config.errorWrapperClass)){
					parent.find('.'+this.config.errorMsgClass).hide(this.config.time);
					// borrar el interior del mensaje, etc
				}
			}catch(e){
				this.exception('Error al eliminar error del validador Genoa',e);
			}				
		},
		
		/**
		 * Lanza todos los test de un elemento
		 * element: un elemento a validar
		 * showError(opc): mostrar (o no) mensaje de error
		 * @return bool
		 */
		testElement : function(element,showError){
		    if(typeof showError == 'undefined') showError=this.config.showMsg;
		    if(showError) this.removeError(element);
		    var isValid=true;
		    var $this=this;
		    jQuery.each(element.data(this.config.listAttr).split(','),function(j,e){
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
		
		/**
		 * Lanza un test determinado en un elemento
		 * element: un elemento a validar
		 * tester: clave de un test (de la colección existente)
		 * @return true (válido), false (inválido) o mensaje de error personalizado del test (inválido)
		 */
		doTest : function (element,tester){
			var testObj=this.validations[tester];
			if(typeof testObj == 'undefined') return this.exception('Validación '+tester+' no descrita para el campo '+element.attr('name'));
			var val = '';
			switch(jQuery(element).prop('tagName')){
			case 'SELECT':
				val = element.children(':selected').val();
				break;
			default:
				val = element.val();
			}
			switch(typeof testObj.validation){
				case 'function': return testObj.validation(val,element,this);
				case 'object': return testObj.validation.test(val);
				default: return this.exception('Validación '+tester+' no válida');
			}
		},
		/**
		 * Gestión tonta de excepciones.
		 */
		exception : function(msg,error){
			console.log(msg);
			console.log(error);
			return false;
		},
		/**
		 * Colección de validaciones.
		 * clave : {
		 * 		error : (opcional. Texto o un array utilizando por clave el lenguaje),
		 * 		validation : (regex o funcion)
		 * }
		 */
		validations : {
			required : {
				error : [
				    'Campo obligatorio.',
				    'Required field.'
				],
				validation : function(value,element){
					return (!value)?false:true;
				}
			},
			email : {
				error : [
				    'Email no válido.',
				    'Invalid email.'
				],
				validation : /[\w-\.]{1,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/,
			},
			checked : {
				error : [
				    'Debe hacer check en esta opción.',
				    'Please do check this option.'
				],
				validation : function(value,element){
					return element.is(':checked');
				}
			},
			noblank : {
				error : [
				    'No puede contener espacios en blanco.',
				    'The field can not contain blank spaces.'
				],
				validation : function (value){
					return (value.indexOf(" ")===-1);
				}
			},
			repass : {
				error : [
				    'Las contraseñas no coinciden.',
				    'Passwords do not match.'
				],
				validation : function(value,element,validator){
					var valid=true;
					var passElements=jQuery("[data-"+validator.config.listAttr+"*='repass']");
					jQuery.each(passElements,function(i,item){
						item=jQuery(item);
						if(item.val()!=value){
							valid=false;
							return false;
						}
					});
					jQuery.each(passElements,function(i,item){
						item=jQuery(item);
						if(!valid) validator.showError(item,'repass');
						else validator.removeError(item);
					});
					return valid;
				}
			},
			minLength : {
				validation : function (value,element,validator){
					var length = element.data('minlength');
					var msgs=[
					    'El campo ha de tener al menos '+length+' caracteres.',
					    'The field must be at least '+length+' characters.'
					];
					if(value.length<length) return msgs[validator.config.lang];
					else return true;
				}
			},
			phone : {
				error : [
				    'Introduzca un teléfono válido. No puede contener espacios.',
				    'Please enter a valid phone number. It can not contain blank spaces.'
				],
				validation : /^$|(\\+[0-9]{2})?[0-9]{9}/
			},
			pass : {
				error : [
				    'La contraseña ha de tener un mínimo de 8 caracteres, y contener al menos una mayúscula, una minúscula y un número. Sin espacios.',
				    'The password must be at least 8 characters, and contain at least one uppercase, one lowercase and one number. No blank spaces.'
				],
				validation : /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,255}$/
			}
		}
	};
	if(typeof customConfig != 'undefined') obj.config=jQuery.extend(obj.config, customConfig);
	return obj;
};
