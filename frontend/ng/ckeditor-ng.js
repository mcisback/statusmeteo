angular.module('ckeditorDirective', [])
.directive('ckeditor', function Directive($rootScope) {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            console.log('ckeditor element: ', element)

            var editorOptions;
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
                    filebrowserImageUploadUrl: 'http://localhost:8081/upload',
                    removeButtons: 'About,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Save,CreateDiv,Language,BidiLtr,BidiRtl,Flash,Iframe,addFile,Styles',
                    extraPlugins: 'simpleuploads,imagesfromword'
                };
            }

            // enable ckeditor
            var ckeditor = CKEDITOR.replace( element[0].id );

            // update ngModel on change
            ckeditor.on('change', function () {
                ngModel.$setViewValue(this.getData());
            });

            ckeditor.on('pasteState', function() {
                scope.$apply(function() {
                    ngModel.$setViewValue(ckeditor.getData());
                });
            });
    
            ngModel.$render = function(value) {
                ckeditor.setData(ngModel.$viewValue);
            };
        }
    };
})