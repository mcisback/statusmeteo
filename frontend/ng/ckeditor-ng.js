angular.module('ckeditorDirective', [])
.directive('ckeditor', function Directive($rootScope) {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            console.log('element.type: ', element.type)
            console.log('ckeditor element: ', element)
            console.log('ckeditor scope.appUrl', scope.appUrl)

            if (element[0].type !== 'textarea') 
                return;

            var editorOptions = undefined;
            if (attr.ckeditor === 'minimal') {
                // minimal editor
                editorOptions = {
                    height: 100,
                    toolbar: [
                        { name: 'basic', items: ['Bold', 'Italic', 'Underline'] },
                        { name: 'links', items: ['Link', 'Unlink'] },
                        { name: 'tools', items: ['Maximize'] },
                        { name: 'document', items: ['Source'] },
                    ],
                    removePlugins: 'elementspath',
                    resize_enabled: false
                };
            } else {
                // regular editor
                editorOptions = {
                    filebrowserImageUploadUrl: scope.apiEndpointUrl + '/img/ck4upload',
                    filebrowserUploadMethod: 'xhr',             
                    fileTools_requestHeaders: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': 'Bearer ' + window.localStorage.getItem('token') 
                    },
                    removeButtons: 'About,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Save,CreateDiv,Language,BidiLtr,BidiRtl,Flash,Iframe,addFile,Styles',
                    extraPlugins: 'uploadwidget,uploadimage'
                    /* simpleUpload: {
                        // The URL that the images are uploaded to.
                        uploadUrl: scope.appUrl + '/img/upload',
                        
                        // Headers sent along with the XMLHttpRequest to the upload server.
                        headers: {
                            // 'X-CSRF-TOKEN': 'CSFR-Token',
                            // Authorization: 'Bearer <JSON Web Token>'
                        }
                    } */
                };
            }

            // Enable local "abbr" plugin from /myplugins/abbr/ folder.
            // CKEDITOR.plugins.addExternal( 'abbr', '/myplugins/abbr/', 'plugin.js' );
            // extraPlugins needs to be set too.
            /* CKEDITOR.replace( 'editor1', {
                extraPlugins: 'abbr'
            } ); */

            CKEDITOR.plugins.addExternal(  'uploadwidget', '/ng/uploadwidget/', 'plugin.js' );
            CKEDITOR.plugins.addExternal(  'uploadimage', '/ng/uploadimage/', 'plugin.js' );

            // enable ckeditor
            var ckeditor = CKEDITOR.replace(
                element[0].id,
                editorOptions
            );

            // update ngModel on change
            ckeditor.on('change', function () {
                //ngModel.$setViewValue(this.getData());
            });

            ckeditor.on('pasteState', function() {
                scope.$apply(function() {
                    ngModel.$setViewValue(ckeditor.getData());
                });
            });
    
            ngModel.$render = function(value) {
                ckeditor.setData(ngModel.$viewValue);
            };

            /* var oldValue = null;
            element.bind('focus',function() {
                console.log('element.getAttribute(\'data-done-editing\'): ', element.getAttribute('data-done-editing'))

                scope.$apply(function() {
                    oldValue = ckeditor.getData();
                    
                    console.log('ckeditor:focus oldValue: ', oldValue);
                });
            })

            element.bind('blur', function() {
                scope.$apply(function() {
                    var newValue = ckeditor.getData();
                    console.log('ckeditor:blur newValue: ', newValue);
                    
                    if (newValue !== oldValue){
                        scope.$eval(element.getAttribute('data-done-editing'));
                    }
                    
                    alert('ckeditor:blur Changed oldValue: ' + oldValue);
                });         
            });*/
        }
    };
})