'use strict';

//指令
var cvDirectives = angular.module("CvDirectives", []);

//文件上传指令
cvDirectives.directive('fileUpload', ["baseUrl", "$timeout", "Modal","CV", function (baseUrl, $timeout, Modal,CV) {
    return {
        restrict: 'AE',
        templateUrl: 'templates/directives/upload_file.html',
        replace: true,
        require: 'fileUpload',
        scope: {
            fileupload  : '=fileupload',
            deletefile  : '&deletefile',
            downfile    : '&downfile',
            onSuccess   : '&successthen'
        },
        controller: ["$scope", "FileUploader", "baseUrl", function($scope, FileUploader, baseUrl) {
            $scope.uploader = new FileUploader({
                url: baseUrl+'fileupload?uploadPath='+$scope.fileupload.uploadpath,
                autoUpload: true
            });
        }],
        link: function(scope, elem, attrs, ctrl) {
            var _modal;
            var _uploader = scope.uploader;
            var suffixs = scope.fileupload.suffixs ? scope.fileupload.suffixs.split(",") : [];

            scope.fileupload.candown = attrs.downfile ? true : false;
            scope.fileupload.candelete = attrs.deletefile ? true : false;
            scope.exsit_package = attrs.package ? true : false;
            _uploader.filters.push({
                name: 'suffixFilter',   //文件后缀验证
                fn: function (item) {
                    if(suffixs.length == 0) {
                        return true;
                    } else if(suffixs.indexOf(item.name.split(".")[item.name.split(".").length-1].toLowerCase()) == -1) {
                        Modal.alert("文件名后缀限定为["+suffixs.toString().replace(",", " 或 ")+"]格式！");
                        return false;
                    } else {
                        return true;
                    }
                }
            });
            _uploader.filters.push({
                name: 'pathFilter',   //上传路径验证
                fn: function (item) {
                    if(scope.fileupload.uploadpath) {
                        return true;
                    } else {
                        Modal.alert(item.name+"("+Math.round(item.size/1000)+"KB)上传地址未就绪！");
                        return false;
                    }
                }
            });
            _uploader.filters.push({
                name: 'repeatFilter',   //文件重复性验证
                fn: function (item) {
                    if(attrs.package){
                        if(scope.fileupload.filenames.indexOf(item.name) != -1) {
                            Modal.alert(item.name+"文件已存在！");
                            return false;
                        } else {
                            return true;
                        }
                    }else{
                        return true;
                    }
                }
            });
            scope.$watch('fileupload.uploadpath', function(val) {
                _uploader.url = baseUrl+'fileupload?uploadPath='+val;
            });
            _uploader.onWhenAddingFileFailed = function(item, filter, options) {
                //DO NOTHING
            };
            _uploader.onAfterAddingAll  = function(){
                _modal = Modal.loading('文件上传中...');
            }
            _uploader.onCompleteAll = function(){
                $timeout(function() {
                    _modal.close();
                    scope.onSuccess();
                },1000);

            };
            _uploader.onSuccessItem = function (fileItem, response, status, headers) {
                if(response.indexOf("true") != -1) {
                    if(attrs.package){
                        scope.fileupload.filenames.push(fileItem.file.name);
                    }else{
                        scope.fileupload.filename = fileItem.file.name;
                    }
                }
            };
            _uploader.onErrorItem = function(fileItem, response, status, headers) {
                _modal.close();
                _uploader.queue.length = 0;
                scope.fileupload.filename = "";
                Modal.alert("文件上传失败: " + status);
            };
            scope.deletefiles = function(filename){
                if(attrs.package){
                    var _index = scope.fileupload.filenames.indexOf(filename);
                    scope.fileupload.filenames.splice(_index,1);
                }else{
                    scope.deletefile();
                }
            };
            scope.downfiles = function(filename){
                if(attrs.package){
                    var _download_filepath = scope.fileupload.uploadpath +"/" + filename;
                    CV.downloadFile(_download_filepath);
                }else{
                    scope.downfile()
                }
            };
        }
    }
}]);
//导入EXCEL指令
cvDirectives.directive('excelImport', ["baseUrl", "Modal", function(baseUrl, Modal) {
    return {
        restrict: 'AE',
        templateUrl: 'templates/directives/import_excel.html',
        replace: true,
        scope: {
            fileupload  : '=fileupload',
            onSuccess : '&successthen'
        },
        controller: ["$scope", "FileUploader", "baseUrl", function($scope, FileUploader,baseUrl) {
            $scope.uploader = new FileUploader({
                url: baseUrl+'fileupload?uploadPath='+$scope.fileupload.uploadpath,
                autoUpload: true
            });
        }],
        link: function(scope, elem, attrs, ctrl){
            var _uploader = scope.uploader;
            var suffixs = scope.fileupload.suffixs ? scope.fileupload.suffixs.split(",") : [];
            _uploader.filters.push({
                name: 'suffixFilter',   //文件后缀验证
                fn: function (item) {
                    if(suffixs.length == 0) {
                        return true;
                    } else if(suffixs.indexOf(item.name.split(".")[1]) == -1) {
                        Modal.alert("文件名后缀限定为["+suffixs.toString().replace(",", " 或 ")+"]格式！");
                        return false;
                    } else {
                        return true;
                    }
                }
            });
            scope.$watch('fileupload.uploadpath', function(val) {
                _uploader.url = baseUrl+'fileupload?uploadPath='+val;
            });
            _uploader.onWhenAddingFileFailed = function(item, filter, options) {
                //DO NOTHING
            };
            _uploader.onSuccessItem = function (fileItem, response, status, headers) {
                if(response.indexOf("true") != -1) {
                    scope.fileupload.filename = fileItem.file.name;
                    scope.onSuccess();
                } else {
                    Modal.alert(scope.fileupload.filetype+'上传失败');
                }
            };
            _uploader.onErrorItem = function(fileItem, response, status, headers) {
                _uploader.queue.length = 0;
                scope.fileupload.filename = "";
                Modal.alert("文件上传失败: " + status);
            };
        }
    }
}]);
//导入实例
cvDirectives.directive('importInstance',["baseUrl", "Modal", function(baseUrl, Modal){
    return {
        restrict: 'AE',
        templateUrl: 'templates/directives/import_instance.html',
        replace: true,
        scope: {
            fileupload  : '=fileupload',
            onSuccess : '&successthen'
        },
        controller: ["$scope", "FileUploader", "baseUrl", function($scope, FileUploader,baseUrl) {
            $scope.uploader = new FileUploader({
                url: baseUrl+'fileupload?uploadPath='+$scope.fileupload.uploadpath,
                autoUpload: true
            });
        }],
        link: function(scope, elem, attrs, ctrl){
            var _uploader = scope.uploader;
            var suffixs = scope.fileupload.suffixs ? scope.fileupload.suffixs.split(",") : [];
            _uploader.filters.push({
                name: 'suffixFilter',   //文件后缀验证
                fn: function (item) {
                    if(suffixs.length == 0) {
                        return true;
                    } else if(suffixs.indexOf(item.name.split(".")[1]) == -1) {
                        Modal.alert("文件名后缀限定为["+suffixs.toString().replace(",", " 或 ")+"]格式！");
                        return false;
                    } else {
                        return true;
                    }
                }
            });
            scope.$watch('fileupload.uploadpath', function(val) {
                _uploader.url = baseUrl+'fileupload?uploadPath='+val;
            });

            //文件选择失败-没有过filter
            _uploader.onWhenAddingFileFailed = function(item, filter, options) {
                //DO NOTHING
            };
            _uploader.onSuccessItem = function (fileItem, response, status, headers) {
                if(response.indexOf("true") != -1) {
                    scope.fileupload.filename = fileItem.file.name;
                    scope.onSuccess();
                } else {
                    Modal.alert(scope.fileupload.filetype+'上传失败');
                }
            };
            _uploader.onErrorItem = function(fileItem, response, status, headers) {
                _uploader.queue.length = 0;
                scope.fileupload.filename = "";
                Modal.alert("文件上传失败: " + status);
            };
        }
    }
}]);

/**
 * 表单验证-输入值是否存在
 */
cvDirectives.directive("ensureExist", function() {
    return  {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            var dataKey;
            var objdata_s = attrs.ensureExist;
            if(attrs.ensureExist.indexOf("|") != -1) {
                var objdata_ss = attrs.ensureExist.split("|");
                dataKey = objdata_ss[1].trim();
                objdata_s = objdata_ss[0].trim();
            }
            var arrs = objdata_s.split(".");

            var isExist = function(val, dataKey, dataArray) {
                var unexist = false;
                if(dataKey) {
                    for(var i = 0; i < dataArray.length; i ++) {
                        if(dataArray[i][dataKey] == val) {
                            unexist = true;
                            break;
                        }
                    }
                } else if(jQuery.inArray(val, dataArray) != -1) {
                    unexist = true;
                }
                if(val ==''){
                    return true;
                }else{
                    return unexist;
                }

            }
            //动态去后台查询是否存在
            if(dataKey == 'dynamic') {
                elem.on("blur", function() {
                    scope[objdata_s]().then(function(data) {
                        ctrl.$setValidity('unexist', true);
                    }, function(error) {
                        ctrl.$setValidity('unexist', false);
                    });
                });
                elem.on("focus", function() {
                    ctrl.$setValidity('unexist', true);
                });
            } else {
                scope.$watch(function() {
                    if(objdata_s.indexOf(".") != -1) {
                        return scope[arrs[0]][arrs[1]];        //当前版本仅支持两层的json数组，如：scope.data.数组 | key
                    } else {
                        return scope[objdata_s];
                    }
                }, function(val) {
                    if(val.length != 0) {
                        scope.$watch(attrs.ngModel, function(mpdelVal) {
                            if(angular.isUndefined(mpdelVal)) return false;
                            ctrl.$setValidity('unexist', isExist(mpdelVal, dataKey, val));
                        });
                    }
                });
            }
        }
    }
});

/**
 * 表单验证-项目名是否在某系统下唯一
 */
cvDirectives.directive("ensureProjUnique", ["$timeout", "Proj", "Modal", function($timeout, Proj, Modal) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            var timeoutPromise;
            var waitTime = 3000;
            var doValidateWithTimeout = function(projName, busiName) {
                timeoutPromise = $timeout(function () {
                    doValidate(projName, busiName);
                }, waitTime);
            };
            var cancelPreviousTimeout = function() {
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }
            };

            var doValidate = function(projName, busiName) {
                if(projName && busiName) {
                    Proj.uniqueProj(projName, busiName).then(function(data) {
                        if(data.result) {
                            ctrl.$setValidity('unique', false);
                        } else {
                            ctrl.$setValidity('unique', true);
                        }
                    }, function(error) {
                        //Modal.alert(error.message);
                    });
                }
            };
            scope.$watch(function() {
                return scope.info || scope.quick_prod_info ;
            }, function(newVal, oldVal) {
                if(newVal.project_name && newVal.business_sys_name && newVal.project_name.length > 0 && newVal.business_sys_name.length > 0 && newVal.project_name != oldVal.project_name || newVal.business_sys_name != oldVal.business_sys_name) {
                    //开始验证
                    cancelPreviousTimeout();
                    doValidateWithTimeout(newVal.project_name, newVal.business_sys_name);
                }
            }, true);
        }
    }
}]);

/**
 * 表单验证-输入值是否唯一(服务端)(可以修改/zhanggy)
 * HTML: <ANY ensure-unique="服务名 | 原始值" />
 */
cvDirectives.directive("ensureUnique", ["$timeout", "Task", "Modal", function($timeout, Task, Modal) {
    return  {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            elem.on("blur", function() {
                $timeout(function () {
                    var val = ctrl.$modelValue;
                    var _oldName ='';
                    if(angular.isUndefined(val) || val == '') {
                        return false;
                    }
                    if(attrs.ensureUnique.indexOf('|') != -1){
                        var serviceName = attrs.ensureUnique.split('|')[0].trim();
                        _oldName = attrs.ensureUnique.split('|')[1].trim();
                    }else{
                        var serviceName = attrs.ensureUnique;
                    }
                    if(_oldName != val){
                        Task.ExecuteTask({data:val}, serviceName).then(function(data) {
                            if(data.result) {
                                ctrl.$setValidity('unique', false);
                            } else {
                                ctrl.$setValidity('unique', true);
                            }
                        }, function(error) {
                            Modal.alert(error.message);
                        });
                    }
                },0);
            });
            elem.on("focus", function() {
                ctrl.$setValidity('unique', true);
            });
        }
    }
}]);

/**
 * 表单验证-输入值是否唯一(scope数组)
 * HTML: <ANY ensure-unique="data.list | key" /> 或者 <ANY ensure-unique="data.list" />
 */
cvDirectives.directive("ensureOnly", ["Task","CV", "$timeout", "Modal", function(Task, CV, $timeout) {
    return  {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            elem.on("blur", function() {
                $timeout(function(){
                    var val = ctrl.$modelValue;
                    if(angular.isUndefined(val) || val == '') return false;

                    var _scope_list = attrs.ensureOnly.split("|") || [];
                    var _data_str = _scope_list[0].trim();
                    var _data_key = _scope_list[1] ? _scope_list[1].trim() : "";
                    var _data_list = scope.$eval(_data_str);

                    var _exist_ceil = 0;    //存在天花板
                    var _exist_count = 0;   //存在数量
                    //如果表单name以数字结尾，则在ng-repeat中，否则在表单中
                    var _last_name = ctrl.$name.charAt(ctrl.$name.length - 1).replace(/[^0-9]+/g, '');
                    if(_last_name) {
                        _exist_ceil = 1;
                    }

                    for(var i = 0; i < _data_list.length; i ++) {
                        var _data = _data_key ? _data_list[i][_data_key] : _data_list[i];
                        if(_data === val) {
                            _exist_count ++;
                        }
                    }
                    if(_exist_count > _exist_ceil) {
                        ctrl.$setValidity('only', false);
                    } else {
                        ctrl.$setValidity('only', true);
                    }
                },0);
            });
            elem.on("focus", function() {
                ctrl.$setValidity('only', true);
            });
        }
    }
}]);

/**
 * 表单验证-统一表单验证提示信息
 * <validate-msg>
 *  text文本类型 ：<validate-msg tag-cn-name="" name=""></validate-msg>
 *  其他类型     ：<validate-msg tag-cn-name="" type="" name="" model=""></validate-msg>
 * </validate-msg>
 */
cvDirectives.directive("validateMsg", ["$compile", function($compile) {
   return {
       restrict: "E",
       link: function(scope, elem, attrs) {
           var valiTypeList = [
               {key: "required", error: "$error.required", text: "不能为空"},
               {key: "ng-minlength", error: "$error.minlength", text: "最小长度限制[?]个字符"},
               {key: "ng-maxlength", error: "$error.maxlength", text: "最大长度限制[?]个字符"},
               {key: "ng-pattern", error: "$error.pattern", text: "不符合命名规范"},
               {key: "ensure-unique", error: "$error.unique", text: "已经存在"},
               {key: "ensure-only", error: "$error.only", text: "已经存在"},
               {key: "ensure-exist", error: "$error.unexist", text: "不存在"},
               {key: "ensure-proj-unique", error: "$error.unique", text: "项目已经存在"},
           ];
           var valiHtml = "";

           var tagCnName = attrs.tagCnName; //验证对象中文描述
           var tagName = attrs.name;        //验证对象表单name的值
           var tagType = attrs.type ? attrs.type : "text";  //验证对象类型（checkbox， select， text）
           var tagModel = attrs.model;      //验证对象ngModel的值
           var formName = elem.parents("form").attr("name") + "." + tagName;   //表单名.验证对象表单name的值

           var buildHtml = function(tag) {
               var vHtml = '<div ng-if="'+formName+'.$dirty && '+formName+'.$invalid" style="color: #e9416e; list-style: none; padding: 0px 0 0 0;">';
               var requiredStr = formName +"."+ valiTypeList[0].error;
               vHtml += '<li ng-show="'+requiredStr+'">'+tagCnName+valiTypeList[0].text+'</li>';
               for(var i = 1; i < valiTypeList.length; i ++) {
                   var valiType = valiTypeList[i];
                   if((typeof(tag.attr(valiType.key)) != "undefined") || tag.attr("type") == valiType.key) {
                       vHtml += '<li ng-show="'+formName +'.'+ valiType.error+'&&!'+requiredStr+'">'+tagCnName+valiType.text.replace("?", tag.attr(valiType.key))+'</li>';
                   }
               }
               vHtml += '</div>';
               return vHtml;
           }

           if(tagType == "checkbox") {          //多个内容
               elem.before($compile('<input ng-repeat="i in [1]" type="text" name="'+tagName+'" ng-model="'+tagModel+'.str" style="display: none;" required/>')(scope));
               valiHtml = buildHtml(elem.before());
               scope.$watch(function() {
                   return scope.$eval(tagModel);
               }, function(val) {
                   if(val) val.str = val.join(",");
               }, true);
           } else if(tagType == "radio") {
               elem.before($compile('<input ng-repeat="i in [1]" type="text" name="'+tagName+'" ng-model="'+tagModel+'" style="display: none;" required/>')(scope));
               valiHtml = buildHtml(elem.before());
           }else if(tagType == "select") {
               elem.before($compile('<input ng-repeat="i in [1]" type="text" name="'+tagName+'" ng-model="'+tagModel+'" style="display: none;" required/>')(scope));
               valiHtml = buildHtml(elem.before());
           } else {
               valiHtml = buildHtml(elem.parent().children().first());
           }

           if(valiHtml) elem.append($compile(valiHtml)(scope));
       }
   }
}]);

/**
 * 迁入-select
 */
cvDirectives.directive("bsSelect", ["$compile", "$timeout", function($compile, $timeout) {
    /**
     * <bs-select>
     * items='下拉菜单数据集合'(仅支持二层json:如：data.xList)
     * my-select='已选中的数据'
     * (可选)select-val='选择回调方法'
     * (可选)option-labal='下拉菜单中显示的值,辅助显示的值(支持逗号连接两个值)'
     * (可选)option-key='下拉菜单中显示的值(主Key值)'
     * (可选)empty-option='下拉菜单中“空选项”显示的内容'
     * (可选)opacity 是否默认有透明度
     * (可选)init-label='默认显示的内容，不填默认为‘--- 请选择 ---’'
     * (可选)no-border 是否默认有边框 >
     * </bs-select>
     */
    return {
        restrict: 'E',
        scope: {
            items        : '=',
            selectedItem : '=mySelect',
            doSelect     : '&selectVal',
            isDisable    : '=disable',
            loading      : '='
        },
        templateUrl: 'templates/directives/bs_select_template.html',
        link: function(scope, elem, attrs) {
            var _option_key = attrs.optionKey;
            var _is_init = true;     //自动赋值是否完毕
            scope.has_opacity = (attrs.opacity === '' || attrs.opacity === 'true') ? true : false;
            scope.has_noborder = (attrs.noBorder === '' || attrs.noBorder === 'true') ? true : false;
            scope.init_label = attrs.initLabel ? attrs.initLabel : "请选择";
            scope.realItems = [];    //下拉列表初始化都是空
            if(scope.has_opacity) {
                elem.on("mouseenter", ".btn-group", function() { $(this).css("opacity", 1); });
                elem.on("mouseleave", ".btn-group", function() { $(this).css("opacity", 0.3); });
            };
            /*滚动条配置*/
            scope.scroll_config_info={
                axis:"xy" ,
                theme:"custom-dark",
                scrollbarPosition: "inside",
                scrollInertia:400,
                scrollEasing:"easeOutCirc",
                autoDraggerLength: true,
                autoHideScrollbar: true,
                scrollButtons:{ enable: false },
                mouseWheel:{ preventDefault:true },
            };
            scope.changeUlStyle = function() {
                return scope.realItems.length > 5 ? {height: '160px','min-width':'100%'} : {height: (scope.realItems.length * 30 )+ 15 + 'px','min-width':'100%'};
            };
            scope.widthStyle = function(){
                if(scope.has_noborder){
                    return {
                        width:attrs.width ? (attrs.width+'px') : '',
                    }
                }else{
                    var _width = attrs.width ? attrs.width : elem.children().width();
                    _width = (!attrs.maxWidth || _width < attrs.maxWidth) ? _width : attrs.maxWidth;
                    return {
                        width: _width-26+'px',
                    }
                }
            };
            //解决窗口缩放时宽度的自适应
            $(window).resize(function() {
                if(!attrs.width){
                    var _width = elem.children().width()-52;
                    elem.find('Button').first().width(_width);
                }
            });
            scope.opacityStyle = function(){
                return{
                    opacity:scope.has_opacity ? '0.3' : '1',
                }
            };
            var bindHtml = function(_value) {
                scope.init_label =_option_key && _value.indexOf("  [") != -1 ? _value.substring(0, _value.indexOf("  [")) : _value;
                //$(".button-label", elem).attr("title",_option_key && _value.indexOf("  [") != -1 ? _value.substring(0, _value.indexOf("  [")) : _value);
            };
            //格式化下拉数据集合
            var formatItems = function() {
                scope.realItems = [];
                if(_option_key) {//配置了option-labal和option-key(显示效果为AAA[BBB])
                    var _option_labels = attrs.optionLabal.replace(" ", "").split(",");
                    for(var i = 0; i < scope.items.length; i ++) {
                        var _item = scope.items[i];
                        scope.realItems.push({
                            key: _item[_option_key],
                            value: (_item[_option_labels[0]] + (_item[_option_labels[1]] ? "  [" + _item[_option_labels[1]] + "]" : ""))
                        });
                    }
                } else if(scope.items.length >= 1 && angular.isString(scope.items[0])) {  //数据中是字符串，key&value是同一个值
                    for(var i = 0; i < scope.items.length; i ++) {
                        scope.realItems.push({key: scope.items[i], value: scope.items[i]});
                    }
                } else {
                    for(var i = 0; i < scope.items.length; i ++) {   //数据中自动包含Key/Value
                        scope.realItems.push(scope.items[i]);
                    }
                }
                if(attrs.emptyOption) {
                    scope.realItems.push({key: '', value: attrs.emptyOption});
                }
            }
            //绑定下拉菜单
            var bindSelect = function() {
                formatItems();
                //补齐空选项，并默认先选中空选项
                if(attrs.emptyOption) {
                    bindHtml(attrs.emptyOption);
                }
                //当只有一个可选项时，直接选中，不再管其他，且仅执行一遍
                if((!attrs.emptyOption) && (scope.realItems.length == 1) && _is_init) {
                    var _item = scope.realItems[0];
                    scope.selectedItem = _item.key;
                    bindHtml(_item.value);
                    $timeout(function(){
                        scope.doSelect({selectKey: _item.key,selectValue : _item.value});
                    },0)
                   _is_init = false;
                }
                //下拉列表有值，已选也有值，正常选择
                if(scope.realItems.length > 1) {
                    for(var i = 0; i < scope.realItems.length; i++) {
                        var _item = scope.realItems[i];
                        if (_item.key === scope.selectedItem) {
                            bindHtml(_item.value);
                            break;
                        }
                        if(i == scope.realItems.length-1 && _item.key != scope.selectedItem){
                            scope.init_label = "请选择";
                        }
                    }
                }
            };
            //内部选择方法
            scope.selectVal = function(item) {
                _is_init = false;                        //标志手动触发变动
                scope.selectedItem = item.key;           //绑定新Key值
                bindHtml(item.value);                    //绑定页面显示
                $timeout(function(){
                    scope.doSelect({selectKey: item.key,selectValue : item.value});   //执行用户自定义方法
                },0);
            };

            //当下拉显示值改变时
            scope.$watch(function() {
                return scope.selectedItem;
            }, function(val) {
                if(val === undefined || val === ''){
                    //有空选项时默认先选中空选项
                    if(attrs.emptyOption) {
                        bindHtml(attrs.emptyOption);
                    }else{
                        bindHtml('请选择');
                    }
                }
                if(!_is_init) return false;  //手动改变选中不触发$watch
                if(val) {
                    bindSelect();
                }//仅有值才会触发绑定值
            });
            //当下拉列表内容改变时
            scope.$watch(function() {
                return scope.items;
            }, function(val) {
                if(val){
                    _is_init = true;
                    bindSelect();
                }
            }, true);
        }
    }
}]);

/**
 * 节点文件浏览指令
 * 绑定节点信息
 * node: {
 *      node_name: '',  //节点名
 *      init_path: '',  //初始化路径
 *      path_files: []  //当前路径文件列表（生成）
 *      loading: T/F    //文件列表加载中（生成）
 *      full_path: '',  //完整路径（生成）
 *      is_dir: T/F     //当前是目录还是文件(自动维护)
 *      checked_files: [],      //选中的文件列表（自动维护）
 *      deleted_files: []       //删除的文件列表（自动维护）
 * }
 *
 * 返回文件信息
 * file: {
        "type":         "目录",      //文件类型
        "file":         "backup",   //文件名
        "dir":          true,       //是否是目录
        "modified_flag":false,      //是否修改过
        "edit_flag":    true,       //是否可修改
        "check_flag":   false,      //是否被选中
        "delete_flag":  false       //是否被删除
    }
 */
cvDirectives.directive("fileBrowse", ["$compile", function($compile){
    return {
        restrict: 'E',
        scope: {
            node: '=',
            changePath: '&',
            deleteFile: '&'
        },
        link: function(scope, elem, attr) {
            //_has_checkbox : 1 全选，2 只选文件
            var _has_checkbox = (attr.check === '' || attr.check === 'true' || attr.check === '1') ? 1 : attr.check === '2'? 2 :false;
            var  _has_radio = attr.radiocheck==='1' ?  1 : 2;
            var _allow_modify=attr.allowmodify ==='1' ? 1 : 2;
            var _old_path_files = scope.node.path_files;
            //var _has_checkbox = (attr.check && attr.check === 'false') || !attr.check ? false : true;
            if(_allow_modify == 1){
                scope.node.checked_files =  scope.node.checked_files ?  scope.node.checked_files : [];
            }else{
                scope.node.checked_files =[];
            }
            scope.node.deleted_files = [];
            //var _has_delete = attr.delete && attr.delete === 'false' ? false : true;
            //var _has_delete = angular.isFunction(scope.deleteFile) ? true : false;
            var _has_delete = false;
            scope.path_flag = false;
            var _fill_path = "";
            var _init_path = scope.node.init_path;
            //去掉路径最后的'/'
            _init_path = _init_path.length > 1 && _init_path.lastIndexOf("/") == _init_path.length -1 ? _init_path.slice(0, _init_path.length-1) : _init_path;
            var _last_slash_index = _init_path.lastIndexOf("/");
            // /, /a, a, /a/b, a/b, a/
            if(!_init_path) {           //''
                scope.node.paths = [];
            } else if(_last_slash_index == -1) {   //没有'/'或''
                scope.node.paths = [_init_path];
                 scope.path_flag = true;
            } else if(_init_path.length == 1 && _last_slash_index == 0) {   //只有'/'
                scope.node.paths = ['/'];
                scope.path_flag = true;
            } else if(_last_slash_index == 0) {     // '/x'
                _fill_path = "/";
                scope.node.paths = [_init_path.slice(1)];
            } else {
                _fill_path = "/";
                // _fill_path = _init_path.slice(0, _last_slash_index + 1);
                // scope.node.paths = [_init_path.slice(_last_slash_index + 1)];
                scope.node.paths = _init_path.slice(1).split("/");
            }
            scope.node.full_path = _init_path;  //dft init
            scope.node.is_dir = true;           //dft init
            // var _longer_path_files;
            var _show_more_index = 1;
            var _path_files = [];

            var getShortFiles = function(path_files){
                if(path_files.length >= 100*_show_more_index){
                    scope.node.path_files_short = path_files.slice(0,100*_show_more_index);
                    scope.node.show_more = true;
                    _show_more_index = _show_more_index+1;
                }else{
                    _show_more_index = 1;
                    scope.node.show_more = false;
                    scope.node.path_files_short = path_files;
                }
            };
            scope.goMore = function(){
                if(_path_files.length == 0){
                    getShortFiles(scope.node.path_files);
                }else{
                    getShortFiles(_path_files);
                }
            }
            scope.customConfig ={
                axis:"y" ,
                theme:"custom-dark",
                scrollbarPosition: "outside",
                scrollInertia:400,
                scrollEasing:"easeOutCirc",
                autoDraggerLength: true,
                autoHideScrollbar: true,
                scrollButtons:{ enable: false }
            };
            var html = ['<div>',
                '<ol class="breadcrumb" style="margin-bottom: 0;background:#091118">',
                    '<input type="text" class="form-control" ng-model="node.search_key_word"  placeholder="文件名" ng-enter="searchByKeyword()"  style="background:#091016;width: 52px;padding:2px;position: absolute; right: 16px;top: 5px;height: 24px;">',
                    '<li class="active">文件路径：&nbsp;</li>',
                    '<li ><a ng-click="goback($index)" style="cursor: pointer;">/&nbsp;</a></li>',
                    '<li ng-if="!path_flag" ng-repeat="path in node.paths track by $index"><a ng-click="goback($index)" ng-bind="path" style="cursor: pointer;"></a><span ng-if="!$last" style="color: #ccc;padding: 0 0px;">/</span></li>',
                    '<li ng-if="path_flag && !$first" ng-repeat="path in node.paths track by $index"><a ng-click="goback($index)" ng-bind="path" style="cursor: pointer;"></a><span ng-if="!$last" style="color: #ccc;padding: 0 0px;">/</span></li>',
                '</ol>',
                '<ol ng-show="node.loading" style="padding-left: 0px; margin: 30px auto;">',
                    '<li style="list-style: none; text-align: center; font-size: 20px;">',
                    '<i class="fa fa-spinner fa-spin" style="font-size: 30px; color: #44dcfd;"></i>',
                    '</li>',
                '</ol>',
                '<ol ng-show="node.paths.length == 0 && !node.loading" style="padding-left: 0px; margin: 30px auto;">',
                    '<li style="list-style: none; text-align: center; font-size: 18px; color: #999;">',
                    '<span style="color: #FF9933;" ng-bind="node.err_msg"></span> ',
                    '</li>',
                '</ol>',
                '<ol class="file_list" style="max-height: 400px; padding-left: 0px;" ng-if="node.paths.length != 0 && !node.loading" custom-scroll custom-config="customConfig">',
                    '<li style="height: 24px; line-height: 24px; list-style: none;" ng-if="node.paths.length > 1">',
                        '<i class="" style="margin-right: 10px; color: #FFF;"></i><a style="cursor: pointer;" title="上一层" ng-click="goprev();">..</a>',
                    '</li>',
                    '<li ng-repeat="file in node.path_files_short" class="li-file" ' + (_has_delete ? 'ng-style="liStyle(file);" ng-mouseover="file.hover = true;" ng-mouseout="file.hover = false;"' : '') +'>',
                    _has_checkbox == 1 ? '<input type="checkbox" i-check ng-model="file.checked" ng-change="checkFile(file);">' :
                        _has_checkbox == 2 ? '<input type="checkbox" ng-if="!file.dir" i-check ng-model="file.checked" ng-change="checkFile(file);"><div ng-if="file.dir" style="display: inline-block;margin-left:18px;"></div>':_has_radio == 1 ?  '<input type="radio" i-check ng-if="!file.dir" ng-model="file.checked" name="radio_check" value="$index" ng-change="checkRadioFile(file);">':'',,
                        //_has_checkbox ? '<input type="checkbox" ng-if="!file.dir" i-check ng-model="file.checked" ng-change="checkFile(file);">' : '',
                        //_has_checkbox ? '<div style="display: inline-block;">' : '<div style="display: inline-block; margin-left: 18px;">',
                        '<div style="display: inline-block;">',
                            '<i ng-if="file.dir" class="fa fa-folder-open" style="margin-left: 10px; color: #EAC344; display: block; padding-bottom: 4px;"></i>',
                            '<i ng-if="!file.dir" class="fa fa-file-text-o" style="margin-left: 10px; color: #44dcfd; display: block; padding-bottom: 4px;"></i>',
                            '<a ng-if="file.edit_flag && file.dir" style="cursor: pointer;display: block; word-wrap: break-word; padding-left: 30px;margin-top: -25px;" ng-click="gofront(file);" ng-style="fileStyle(file.modified_flag, file.checked);" ng-bind="file.file"></a>',
                            '<a ng-if="file.edit_flag && !file.dir" style="cursor: pointer;display: block; word-wrap: break-word; padding-left: 30px;margin-top: -25px;" ng-click="gofile(file);" ng-style="fileStyle(file.modified_flag, file.checked);" ng-bind="file.file"></a>',
                            '<span ng-if="!file.edit_flag" style="color: #44dcfd;display: block; word-wrap: break-word;padding-left: 30px;margin-top: -25px;" ng-bind="file.file"></span>',
                        '</div>',
                        _has_delete ? "<i class='fa li-file-trash' ng-class='trashClass(file);' ng-style='trashStyle(file);' ng-click='delete(file);'></i>" : "",
                    '</li>',
                    '<li ng-if="node.path_files_short.length != 0 && node.show_more" class="li-file ng-scope" ng-click="goMore()"><a style="cursor: pointer;">加载更多...</a></li>',
                    '<li ng-if="node.path_files_short.length == 0" style="list-style: none;text-align: center; color: #ccc;height: 140px;line-height: 140px;font-size: 16px;">暂无文件信息</li>',
                '</ol>',
                '</div>'].join("");
            elem.append($compile(html)(scope));
            //文件路径改变通用函数
            var chengePath = function() {
                if(scope.path_flag){
                    scope.node.full_path = _fill_path + scope.node.paths.join("/").slice(1);
                }else{
                    scope.node.full_path = _fill_path + scope.node.paths.join("/");
                }
                scope.changePath();
            };
            //文件行鼠标样式
            scope.liStyle = function(file) {
                return file.hover ? {background: "#EFEFEF"} : {background: "#FFF"};
            };
            //区别文件是否修改过的样式
            scope.fileStyle = function(modified_flag, checked_flag) {
                var _style_o = {};
                _style_o.color = modified_flag ? "#E3AC36" : "#428bca";
                _style_o.fontWeight = checked_flag ? "bolder" : "";
                //_style_o.textDecoration = delete_flag ? "line-through" : "";
                //_style_o.color = delete_flag ? "#FF9999" : "rgb(66, 139, 202)";
                return _style_o;
            };
            //删除按钮鼠标样式
            scope.trashStyle = function(file) {
                return file.hover ? {color: '#666'} : {color: '#FFF'};
            };
            //删除文件
            scope.delete = function(file) {
                //直接删除文件
                file.hover = true;
                scope.node.parent_path = _fill_path + scope.node.paths.join("/");
                scope.node.full_path = _fill_path + scope.node.paths.join("/") + "/" + file.file;
                scope.node.is_dir = file.dir;
                scope.deleteFile();
            };
            scope.searchByKeyword = function(){
                _path_files = [];
                if(scope.node.search_key_word){
                    for(var i = 0 ; i < _old_path_files.length ; i++){
                        var _string = _old_path_files[i].file;
                        if(_string.indexOf(scope.node.search_key_word) != -1){
                            _path_files.push(_old_path_files[i]);
                        }
                    }
                    getShortFiles(_path_files);
                }else{
                    scope.changePath();
                }
            };
            //选中文件
            scope.checkFile = function(file) {
                if(file.checked) {
                    scope.node.checked_files.push({'file': file.file, 'path': _fill_path + scope.node.paths.join("/")});
                } else {
                    var _exist_index = -1;
                    for(var i = 0; i < scope.node.checked_files.length; i ++) {
                        var _checked_file = scope.node.checked_files[i];
                        if(_checked_file.file === file.file) {
                            _exist_index = i;
                        }
                    }
                    scope.node.checked_files.splice(_exist_index, 1);
                }
            };
            //radio单选文件
            scope.checkRadioFile=function(file){
                for(var i=0;i<scope.node.path_files.length;i++){
                    var _one_node=scope.node.path_files[i];
                    if(file.file !=_one_node.file){
                        _one_node.checked=false;
                    }
                }
                scope.node.checked_files=[];
                if(file.checked){
                    scope.node.checked_files.push({'file': file.file, 'path': _fill_path + scope.node.paths.join("/")});
                }
            }
            //恢复按钮鼠标样式
            scope.trashClass = function(file) {
                return file.deleted ? "fa-reply" : "fa-trash-o";
            };
            //返回上一级目录
            scope.goprev = function() {
                if(scope.node.paths.length > 1) scope.goback(scope.node.paths.length - 2);
            };
            //返回任意一级目录
            scope.goback = function(index) {
                scope.node.is_dir = true;
                scope.node.paths.splice(index + 1);
                if(scope.node.paths.length == 0){
                    scope.node.paths = ['/'];
                    scope.path_flag = true;
                }
                chengePath();
            };
            //返回下一级目录
            scope.gofront = function(file) {
                scope.node.is_dir = true;
                scope.node.paths.push(file.file);
                chengePath();
            };
            //点击文件
            scope.gofile = function(file) {
                scope.node.full_path = _fill_path + scope.node.paths.join("/") + "/" + file.file;
                scope.node.full_path = scope.node.full_path.replace(/\/*/,'\/');
                scope.node.is_dir = false;
                scope.changePath();
            };
            //实时根据选中和删除的文件列表改变文件样式
            scope.$watch("node.path_files", function() {
                if(!scope.node.path_files) return false;
                for(var i = 0; i < scope.node.path_files.length; i ++) {
                    var _file = scope.node.path_files[i];
                    for(var j = 0; j < scope.node.checked_files.length; j ++) {
                        if(scope.node.checked_files[j].file === _file.file) _file.checked = true;
                    }
                    for(var j = 0; j < scope.node.deleted_files.length; j ++) {
                        if(scope.node.deleted_files[j].file === _file.file) _file.deleted = true;
                    }
                }
            });
            scope.$watch("node.path_files",function(){
                _path_files = [];
                _old_path_files = scope.node.path_files;
                if(scope.node.path_files){
                    getShortFiles(scope.node.path_files);
                }
            });
            scope.changePath(); //init
            /*修复没有根路径的时候不显示目录的问题*/
            if(scope.node.full_path == ""){
                scope.goback(0);
            }
        }
    };
}]);

/**
 * iCheck指令
 */
cvDirectives.directive('iCheck', ["$timeout", "$parse", function($timeout, $parse) {
    return {
        require: 'ngModel',
        link: function($scope, element, $attrs, ngModel) {
            return $timeout(function() {
                var value, checkValue, uncheckValue;
                var $ele = $(element);
                if($ele.attr('type') === 'radio') {
                    value = $parse($attrs['ngValue'])($scope) ? $parse($attrs['ngValue'])($scope) : $attrs['value'];
                } else {
                    checkValue = $attrs['ngTrueValue'];
                    uncheckValue = $attrs['ngFalseValue'];
                }

                $scope.$watch($attrs['ngModel'], function(newValue){
                    $ele.iCheck('update');
                });

                return $ele.iCheck({
                    radioClass: 'iradio_minimal-blue',
                    checkboxClass: 'icheckbox_minimal-blue',
                    increaseArea: '20%'
                }).on('ifChanged', function(event) {
                    if ($ele.attr('type') === 'checkbox') {
                        return $scope.$apply(function() {
                            if(checkValue && uncheckValue) {    //has ng-true-value and ng-false-value
                                if(event.target.checked) {
                                    $parse($attrs.ngModel).assign($scope, checkValue);
                                    return ngModel.$setViewValue(checkValue);
                                } else {
                                    $parse($attrs.ngModel).assign($scope, uncheckValue);
                                    return ngModel.$setViewValue(uncheckValue);
                                }
                            } else {    //only ng-model
                                return ngModel.$setViewValue(!$parse($attrs['ngModel'])($scope));
                            }
                        });
                    } else if ($ele.attr('type') === 'radio'){    //radio
                        if(event.target.checked) {
                            return $scope.$apply(function() {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    }
                });
            });
        }
    };
}]);

/**
 工单维护方案动态步骤指令
 */
cvDirectives.directive('programStepForm', ["$timeout", "$parse", "$compile", "CV", function($timeout, $parse, $compile, CV) {
    return {
        restrict: 'E',
        templateUrl: 'templates/modal/program_step_form.html',
        scope: {
            data: '=data',
            authFlag:'=flag',
            submitMethod: '&submitMethod',
            viewAuthDetail  : '&viewAuth',
        },
        link: function(scope, elem, attrs) {
            scope.read_only = attrs.detail ? true : scope.data.stepFormLock;
            //是否显示查看按钮 --默认显示
            scope.show_btn = attrs.showbtn;
            scope.param_obj_list = [];
            //获取复选框验证信息位置
            scope.getCheckTestInfo = function(flag,length){
                return {
                    top:((flag == 1 ? 25 : 31)+(Math.ceil(length/3)-1)*33)+'px'
                }
            };
            //返回值不对
            for(var i = 0, len = scope.data.sql_list ? scope.data.sql_list.length : 0; i < len; i ++) {
                var _sql = scope.data.sql_list[i];
                var _pl = _sql.sql_param_list ? _sql.sql_param_list : [];
                //_param_list中加入sql_seq属性
                scope.param_obj_list.push({sql_index:i,param_list:_pl,sql_text:_sql.sql_text});
            }
            scope.closePgTask =function(){
                scope.submitMethod();
            };
            scope.changeCheckbox = function(sparam_val, one_param) {
                if(sparam_val.checked) {
                    one_param.col_type = (typeof (sparam_val.key) == 'string') ? 1 : 2;
                    one_param.sparam_scope_list_key.push(sparam_val.key);
                    one_param.sparam_scope_list_val.push(sparam_val.value);
                } else {
                    for(var i=0; i < one_param.sparam_scope_list_key.length; i++){
                        if(one_param.sparam_scope_list_key[i] == sparam_val.key){
                            one_param.sparam_scope_list_key.splice(i, 1);
                            one_param.sparam_scope_list_val.splice(i, 1);
                        }
                    }
                }
            }
            for(var m = 0; m < scope.param_obj_list.length; m++){
                var _param_list = scope.param_obj_list[m].param_list;
                for(var i=0;i < _param_list.length; i++){
                    var _param = _param_list[i];
                    _param.tag_ng_model = '';
                    _param.sparam_value = _param.sparam_value ? _param.sparam_value :'';
                    _param.tag_cn_name = _param.sparam_cn_name ? _param.sparam_cn_name : '';
                    _param.sparam_scope_list = []; //解析后的参数值范围Json数组
                    if(_param.sparam_type != 1 && _param.sparam_type != 5) {
                        _param.sparam_scope_list = angular.fromJson(_param.sparam_scope);
                    }
                    if(_param.sparam_type ==3){
                        var _sparam_val_list = _param.sparam_value.split(",");
                        _param.sparam_scope_list_key = [];
                        _param.sparam_scope_list_val = [];
                        for(var k = 0 ; k < _param.sparam_scope_list.length;k++){
                            for(var j =0 ; j < _sparam_val_list.length; j++){
                                if(_sparam_val_list[j] == _param.sparam_scope_list[k].key){
                                    _param.sparam_scope_list[k].checked =true;
                                    _param.sparam_scope_list_key.push(_param.sparam_scope_list[k].key);
                                    _param.sparam_scope_list_val.push(_param.sparam_scope_list[k].value);
                                }
                            }
                        }
                    }else if(_param.sparam_type ==4){
                        scope.data.select_items =_param.sparam_scope_list;
                        _param.tag_ng_model = CV.findValue(_param.sparam_value, _param.sparam_scope_list);
                    }else if(_param.sparam_type ==2){
                        _param.tag_ng_model = _param.sparam_value;
                    }else if(_param.sparam_type ==1){
                        _param.tag_ng_model=_param.sparam_value;
                    }
                }
            }
            scope.viewAuthPro = function(){
                scope.viewAuthDetail();
            };
            scope.noParamSubmit = function() {
                scope.btnBusLoading = true;
                scope.submitMethod();
            }
            scope.FormSubmit = function() {
                scope.authFlag.btn_loading = true;
                if(!CV.valiForm(scope.pgForm)) {
                    scope.authFlag.btn_loading = false;
                    return false;
                }
                for(var i = 0; i < scope.param_obj_list.length; i++){
                    var _param_list = scope.param_obj_list[i].param_list;
                    for (var j = 0; j < _param_list.length; j++) {
                        var _param = _param_list[j];
                        if(_param.sparam_type == 3) {//多选
                            _param.sparam_value = _param.sparam_scope_list_key.join(",");
                            _param.sparam_value_text = _param.sparam_scope_list_val.join(",");
                        }else if(_param.sparam_type == 2 || _param.sparam_type ==4 ){//单选,下拉
                            _param.sparam_value = _param.tag_ng_model;
                            _param.sparam_value_text = CV.findValue(_param.sparam_value, _param.sparam_scope_list);
                        }else if(_param.sparam_type == 5){
                            _param.sparam_value = _param.sparam_scope;
                            _param.sparam_value_text = _param.sparam_scope;
                        }  else {
                            _param.sparam_value = _param.tag_ng_model;
                            _param.sparam_value_text = _param.tag_ng_model;
                        }
                    }
                }
                for (var j = 0; j < scope.param_obj_list.length; j++) {
                    scope.data.sql_list[scope.param_obj_list[j].sql_index].sql_param_list =scope.param_obj_list[j].param_list;
                }
                scope.submitMethod();
                scope.$watch('data.stepFormLock',function(){
                    scope.read_only = scope.data.stepFormLock;
                });
                scope.$watch('authFlag.btn_loading',function(){
                },true);
            };
            if(!attrs.detail){
                scope.$watch('data.stepFormLock',function(){
                    scope.read_only = scope.data.stepFormLock;
                });
            }
        },

    }
}]);

/**
 方案动态步骤指令
 */
cvDirectives.directive('schemeParamTab', ["$timeout", "$parse", "$compile", "CV", "Modal", function($timeout, $parse, $compile, CV, Modal) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/param_auth_tb.html',
        replace: 'true',
        link: function(scope, elem, attrs) {
            scope.form={};
            scope.param_key_value_type =[{key:1,value:"整型"},{key:2,value:"字符串"}];
            //处理数据
            for(var i = 0 ;i < scope.sql.param_list.length; i++){
                scope.sql.param_list[i].auth_show = false;
                scope.sql.param_list[i].param_show = false;
                scope.sql.param_list[i].param_key_value_list = [];
                scope.sql.editable = scope.sql.editable == false ? scope.sql.editable : true;
                scope.sql.param_list[i].old_auth_bk_expl = scope.sql.param_list[i].auth_bk_expl;
                scope.sql.param_list[i].old_param_auth_list = scope.sql.param_list[i].param_auth_list;
                if(scope.sql.param_list[i].param_auth_list){
                    if(scope.sql.param_list[i].param_auth_list.length!=0){
                        scope.sql.param_list[i].success_flag = true;
                        for(var j = 0; j < scope.sql.param_list[i].param_auth_list.length; j++){
                            if( scope.sql.param_list[i].param_auth_list[j].auth_dprl_code){
                                scope.getSqlParamAuthRoleByDept(scope.sql.param_list[i].param_auth_list[j].auth_dept_id, j,i, scope.sql.param_list[i].param_auth_list[j]);
                            }
                        }
                    }else {
                        scope.sql.param_list[i].success_flag = false;
                    }
                }else{
                    scope.sql.param_list[i].success_flag = false;
                }
            }
            //显示参数设置框
            scope.showParamType = function(index){
                scope.sql.param_list[index].param_show = true;
                scope.sql.param_list[index].auth_show = false;
                for(var i = 0 ;i < scope.sql.param_list.length; i++){
                    if(i != index){
                        scope.sql.param_list[i].param_show = false;
                    }
                }
                //如果有值得话反显
                if(scope.sql.param_list[index].sparam_scope){
                    scope.sql.param_list[index].param_key_value_list = eval(scope.sql.param_list[index].sparam_scope);
                    var _key = scope.sql.param_list[index].param_key_value_list[0].key;
                    var _value = scope.sql.param_list[index].param_key_value_list[0].value;
                    if(typeof _key === 'number' && _key%1 === 0){
                        scope.sql.param_list[index].param_key_type = 1;
                        scope.sql.param_list[index].old_param_key_type = 1;
                    }else{
                        scope.sql.param_list[index].param_key_type = 2;
                        scope.sql.param_list[index].old_param_key_type = 2;
                    }
                    if(typeof _value === 'number' && _value%1 === 0){
                        scope.sql.param_list[index].param_value_type = 1;
                        scope.sql.param_list[index].old_param_value_type = 1;
                    }else{
                        scope.sql.param_list[index].param_value_type = 2;
                        scope.sql.param_list[index].old_param_value_type = 2;
                    }
                }

            };
            //改变参数设置框中key类型
            scope.changeKeyValue = function(type,tr){
                if(tr.old_param_key_type && tr.old_param_key_type != tr.param_key_type){
                    for(var i =0;i < tr.param_key_value_list.length;i ++){
                        tr.param_key_value_list[i].key ='';
                    }
                }
                tr.old_param_key_type = type;
            };
            //改变参数设置框中Value类型
            scope.changepParamValue = function(type,tr){
                if(tr.old_param_value_type && tr.old_param_value_type != tr.param_value_type){
                    for(var i =0;i < tr.param_key_value_list.length;i ++){
                        tr.param_key_value_list[i].value ='';
                    }
                }
                tr.old_param_value_type = type;
            };
            //显示权限设置框
            scope.showAuth = function(index){
                scope.sql.param_list[index].auth_bk_expl = angular.copy(scope.sql.param_list[index].old_auth_bk_expl);
                scope.sql.param_list[index].param_auth_list = angular.copy(scope.sql.param_list[index].old_param_auth_list);
                scope.sql.param_list[index].auth_show = !scope.sql.param_list[index].auth_show;
                scope.sql.param_list[index].param_show = false;
                for(var i = 0 ;i < scope.sql.param_list.length; i++){
                    if(i != index){
                        scope.sql.param_list[i].auth_show = false;
                    }
                }
            };
            //移除一条授权条件
            scope.removeAuthList = function(index,parent_index){
                scope.sql.param_list[parent_index].param_auth_list.splice(index,1);
                if(scope.sql.param_list[parent_index].param_auth_list.length==0){
                    scope.sql.param_list[parent_index].success_flag = false;
                }
            }
            //增加一条授权条件
            scope.addAuthList = function(index){
                scope.noParamList = false;
                if(!scope.sql.param_list[index].param_auth_list){
                    scope.sql.param_list[index].param_auth_list = [];
                }
                var _lenght = scope.sql.param_list[index].param_auth_list.length;
                if(_lenght == 0){
                    scope.sql.param_list[index].param_auth_list.push({
                        condition_seq: 1,
                        condition_text: '',
                        auth_dprl_code: '',
                        sparam_auth:"",
                        sparam_auth_list:scope.data.auth_type,
                        auth_dept_id:"",
                        authRole:[]
                    });
                }else{
                    var _data = scope.sql.param_list[index].param_auth_list[_lenght-1];
                    if(_data.condition_text == "" || _data.sparam_auth == "" || _data.auth_dept_id == "" || _data.auth_dprl_code == ""){
                        Modal.alert("请完善上一授权条件");
                    }else{
                        if(_data.sparam_auth ==2){
                            scope.sql.param_list[index].param_auth_list.push({
                                condition_seq: 1,
                                condition_text: '',
                                auth_dprl_code: '',
                                sparam_auth:"",
                                sparam_auth_list:[{key:2,value:"远程授权"}],
                                auth_dept_id:"",
                                authRole:[]
                            });
                        }else{
                            scope.sql.param_list[index].param_auth_list.push({
                                condition_seq: 1,
                                condition_text: '',
                                auth_dprl_code: '',
                                sparam_auth:"",
                                sparam_auth_list:scope.data.auth_type,
                                auth_dept_id:"",
                                authRole:[]
                            });
                        }
                    }
                }
            };
            //移除一条key-value键值对
            scope.removeKeyValueList = function (index,parent_index) {
                scope.sql.param_list[parent_index].param_key_value_list.splice(index,1);
            };
            //变动参数值
            scope.addParamKeyValueList = function(index){
                if(!scope.sql.param_list[index].param_value_type || !scope.sql.param_list[index].param_key_type){
                    Modal.alert("请先选择键值对类型");
                    return false;
                }
                scope.sql.param_list[index].param_key_value_list.push({key:"",value:""});
            };
            //获得授权角色备选数据
            scope.loadauthRoleData = function(selectKey, index, parent_index){
                scope.sql.param_list[parent_index].param_auth_list[index].auth_dprl_code ='';
                scope.getSqlParamAuthRoleByDept(selectKey, index, parent_index, scope.sql.param_list[parent_index].param_auth_list[index]);
            };
            //取消权限设置
            scope.formcancel = function(index,flag){
                if(scope.sql.param_list[index].auth_bk_expl){
                    scope.noParamList = false;
                    if(!CV.valiForm(scope.sql.param_list[index].param_auth_form)) {
                        scope.btnBus_loading = false;
                        return false;
                    }
                    if(!scope.sql.param_list[index].param_auth_list){
                        scope.noParamList = true;
                        return false;
                    }else if(scope.sql.param_list[index].param_auth_list.length == 0){
                        scope.noParamList = true;
                        return false;
                    }
                    scope.sql.param_list[index].auth_show = false;
                    scope.sql.param_list[index].success_flag = true;
                    scope.sql.param_list[index].old_auth_bk_expl = scope.sql.param_list[index].auth_bk_expl;
                    scope.sql.param_list[index].old_param_auth_list = scope.sql.param_list[index].param_auth_list;
                }else{
                     scope.sql.param_list[index].old_auth_bk_expl = scope.sql.param_list[index].auth_bk_expl = "";
                     scope.sql.param_list[index].old_param_auth_list = scope.sql.param_list[index].param_auth_list = [];
                     scope.sql.param_list[index].auth_show = false;
                     scope.noParamList = false;
                }
            };
            //取消参数值变更
            scope.formParamKeyValueCancel = function(index){
                if(scope.sql.editable){
                    if(!CV.valiForm(scope.sql.param_list[index].param_key_value_form)) {
                        scope.btnBus_loading = false;
                        return false;
                    }
                    if(scope.sql.param_list[index].param_key_value_list.length == 0){
                        Modal.alert("请添加参数值！");
                        return false;
                    }
                    if(scope.sql.param_list[index].sparam_type == 2 && scope.sql.param_list[index].param_key_value_list.length < 2){
                        Modal.alert("参数类型为单选框，参数值需配置两条！");
                        return false;
                    }
                    for(var i = 0; i < scope.sql.param_list[index].param_key_value_list.length; i++){
                        if(scope.sql.param_list[index].param_key_type == 1){
                            scope.sql.param_list[index].param_key_value_list[i].key = parseInt(scope.sql.param_list[index].param_key_value_list[i].key);
                        }
                        if(scope.sql.param_list[index].param_value_type == 1){
                            scope.sql.param_list[index].param_key_value_list[i].value = parseInt(scope.sql.param_list[index].param_key_value_list[i].value);
                        }
                    }
                    scope.sql.param_list[index].sparam_scope= angular.toJson(scope.sql.param_list[index].param_key_value_list);
                }
                scope.sql.param_list[index].param_show = false;
                scope.sql.param_list[index].param_key_value_list = [];
                scope.sql.param_list[index].param_value_type = "";
                scope.sql.param_list[index].param_key_type = "";
            };
            //改变参数类型
            scope.changeParamType = function(sparam_type,index){
                scope.sql.param_list[index].sparam_scope = "";
                scope.sql.param_list[index].param_key_value_list = [];
            };
            //参数边框设置
            scope.borderParamStyle = function(index){
                if(scope.sql.param_list[index].param_show){
                    return{
                        'border': "1px solid #555f76"
                    };
                }else{
                    return{};
                }
            };
            //授权边框设置
            scope.borderAuthStyle = function(index){
                if(scope.sql.param_list[index].auth_show){
                    return{
                        'border': "1px solid #555f76",
                        'border-bottom':'none'
                    };
                }else{
                    return{};
                }
            };
        }
    }
}]);

/**
 * 动态修改表格指令
 * <editable-table table-data="data"></editable-table>
 * 数据格式：
 * {
    read_only : false,
    theads : [
        {key: '列Key', value: '表头显示文字', primary_key: true/false, read_only: true/false, display: true/false}
    ],
    tbodys : [
        {列Key: '列值'}
    ]
   }
 */
cvDirectives.directive('editableTable', ["$timeout", "$parse", "$compile", "ScrollBarConfig","Modal", "CV", function($timeout, $parse, $compile,ScrollBarConfig, Modal, CV) {
    return {
        restrict: 'E',
        scope: {
            data : '=tableData',
            read_only: '=readOnly',
            can_insert: '=canInsert',
            resetBack:'&resetAll'
        },
        templateUrl: 'templates/directives/editable_table.html',
        link: function(scope, elem, attrs) {
            scope.$watch(function() {
                return scope.data;
            }, function(data) {
                if(data && data.tbodys && data.theads) {
                    for(var i = 0; i < data.theads.length; i ++) {
                        var _head = data.theads[i];
                        _head.key = _head.key.toLowerCase();
                        _head.primary_key = _head.primary_key ? _head.primary_key : false;
                        if(scope.read_only) {
                            _head.read_only = true;
                        } else {
                            _head.read_only = data.read_only ? true : (_head.read_only ? _head.read_only : false);
                        }
                        _head.display = _head.display ? _head.display : true;
                    }
                    for(var i = 0; i < data.tbodys.length; i ++) {
                        var _tr = data.tbodys[i];
                        for(var j = 0; j < data.theads.length; j ++) {
                            var _head = data.theads[j];
                            _tr['original_' + _head.key] = _tr[_head.key];
                            _tr[_head.key + 'modify_flag'] = false;
                            _tr['updating_' + _head.key] = false;
                        }
                        _tr.row_status = 1;
                        _tr.checked = false;
                    }
                }
            });
            scope.$watch(function() {
                return scope.read_only;
            }, function(val) {
                if(val) {
                    for(var i = 0; i < scope.data.theads.length; i ++) {
                        var _head = scope.data.theads[i];
                        _head.read_only = true;
                    }
                }
            });
            //修改单元格
            scope.updateTd = function(tr_index, curr_key, value) {
                var _tr = scope.data.tbodys[tr_index];
                var _has_diff = false;
                for(var i = 0; i < scope.data.theads.length; i ++) {
                    var _head = scope.data.theads[i];
                    if(_tr[_head.key] !== _tr['original_'+_head.key]) {   //original不存在则为不可编辑的主键列
                        _has_diff = true;
                        _tr[_head.key + 'modify_flag'] = true;
                        break;
                    }
                }
                if(_has_diff && _tr.row_status != 3){
                    _tr.row_status = 2;                 //不是新增行
                }
                _tr["updating_"+curr_key] = false;
            };
            //撤销单元格
            //scope.rollbackTd = function(tr_index, curr_key) {
            //    var _tr = scope.data.tbodys[tr_index];
            //    _tr[curr_key] = _tr["original_"+curr_key];
            //    _tr["updating_"+curr_key] = false;
            //    var _has_diff = false;
            //    for(var i = 0; i < scope.data.theads.length; i ++) {
            //        var _head = scope.data.theads[i];
            //        if(_tr['original_'+_head.key] && _tr[_head.key] !== _tr['original_'+_head.key]) {
            //            _has_diff = true;
            //        }
            //    }
            //    if(!_has_diff && _tr.row_status != 3) {
            //        _tr.row_status = 1;
            //    }
            //};
            //撤销选中行
            //scope.undoLines = function() {
            //    for(var i = 0; i < scope.data.tbodys.length; i ++) {
            //        var _tr = scope.data.tbodys[i];
            //        if(_tr.checked) {
            //            if(_tr.row_status == 3) {
            //                scope.data.tbodys.splice(i, 1);
            //            }
            //            for(var j = 0; j < scope.data.theads.length; j ++) {
            //                var _head = scope.data.theads[j];
            //                if(_tr['original_'+_head.key]) {
            //                    _tr[_head.key] = _tr['original_'+_head.key];
            //                    _tr['updating_'+_head.key] = false;
            //                }
            //            }
            //            _tr.row_status = 1;
            //            _tr.checked = false;
            //        }
            //    }
            //};
            //插销所有行
            scope.undoAllLines = function() {
                //撤销后执行的操作
                if(!scope.resetBack()){
                    return ;
                }
                for(var i = 0; i < scope.data.tbodys.length; i ++) {
                    var _tr = scope.data.tbodys[i];
                    if(_tr.row_status == 3) {
                        scope.data.tbodys.splice(i, 1);
                    }
                    for(var j = 0; j < scope.data.theads.length; j ++) {
                        var _head = scope.data.theads[j];
                        if(_tr['original_'+_head.key]) {
                            _tr[_head.key] = _tr['original_'+_head.key];
                            _tr['updating_'+_head.key] = false;
                        }
                    }
                    _tr.row_status = 1;
                    _tr.checked = false;
                }
            }
            //新增行
            scope.newLine = function() {
                var _line = {checked: false, row_status: 3};
                for(var j = 0; j < scope.data.theads.length; j ++) {
                    var _head = scope.data.theads[j];
                    _line[_head.key] = '';
                    _line["original_"+_head.key] = '';
                    _line["updating_"+_head.key] = true;
                }
                scope.data.tbodys.push(_line);
            }
            //删除选中行
            scope.deleteLines = function() {
                for(var i = 0; i < scope.data.tbodys.length; i ++) {
                    var _tr = scope.data.tbodys[i];
                    if(_tr.checked) {
                        if(_tr.row_status == 3) {
                            scope.data.tbodys.splice(i, 1);
                        } else {
                            _tr.row_status = 4;
                            _tr.checked = false;
                        }
                    }
                }
            }
            //单元格样式
            scope.tdStyle = function(tr, head) {
                var _style = {};
                if(tr[head.key] !== tr['original_'+head.key]) {
                    _style.color = '#339900';
                    _style.background = '#0f161f';
                }
                if(tr.row_status == 4) {
                    _style.background = '#6d7183';
                    _style['text-decoration'] = 'line-through';
                }
                return _style;
            }
        }
    }
}]);

/**
 * 工单流转指令
 */
cvDirectives.directive('workOrderFlow',["$timeout", "$parse", "$compile", "CV", function($timeout, $parse, $compile, CV) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/work_order_flow.html',
        replace: 'true',
        scope:{
            flowList : '=data'
        },
        link: function(scope, elem, attrs) {
            //流转信息--圆圈颜色
            scope.flowCircleStyle = function(one, _index){
                return{
                    'position'          :"absolute",
                    'height'            :"10px",
                    'width'             :"10px",
                    'background-color'  : one.deal_time ? "#43fc8c" : "#999999",
                    'border-radius'     :"5px",
                    'top'               :_index * 60 +"px"
                }
            };
            //流转信息--字体颜色
            scope.flowTypeStyle = function(one){
                return {
                    'position'      :"relative",
                    'left'          :"-100px",
                    'top'           :"-4px",
                    'width'         :"140px",
                    'color'         : one.deal_time ? "#43fc8c" : "#999999"
                }
            };
            //流转信息--线条颜色
            scope.flowLineStyle = function(one, index){
                    return {
                        'position'          :"relative",
                        'height'            :"60px",
                        'width'             :"2px",
                        'background-color'  :one.deal_time && scope.flowList[index+1].deal_time ? "#43fc8c" :"#999999",
                        'top'               :one.deal_time ? "-43px" : "-68px",
                        'left'              :"4px"
                    }
            };
        },
    }
}]);

/*生成方案指令*/
cvDirectives.directive("proBsSelect", ["$compile", "$timeout", function($compile, $timeout) {
    /**
     * <bs-select>
     * items='下拉菜单数据集合'(仅支持二层json:如：data.xList)
     * my-select='已选中的数据'
     * (可选)select-val='选择回调方法'
     * (可选)option-labal='下拉菜单中显示的值,辅助显示的值(支持逗号连接两个值)'
     * (可选)option-key='下拉菜单中显示的值(主Key值)'
     * (可选)empty-option='下拉菜单中“空选项”显示的内容'
     * (可选)opacity 是否默认有透明度
     * (可选)init-label='默认显示的内容，不填默认为‘--- 请选择 ---’'
     * (可选)no-border 是否默认有边框 >
     * </bs-select>
     */
    return {
        restrict: 'E',
        scope: {
            items        : '=',
            selectedItem : '=mySelect',
            doSelect     : '&selectVal',
            isDisable    : '=disable',
            loading      : '='
        },
        templateUrl: 'templates/modal/bs_select_template.html',
        link: function(scope, elem, attrs) {
            var _option_key = attrs.optionKey;
            var _is_init = true;     //自动赋值是否完毕
            scope.has_opacity = (attrs.opacity === '' || attrs.opacity === 'true') ? true : false;
            scope.has_noborder = (attrs.noBorder === '' || attrs.noBorder === 'true') ? true : false;
            scope.init_label = attrs.initLabel ? attrs.initLabel : "--- 请选择 ---";
            scope.realItems = [];    //下拉列表初始化都是空
            if(scope.has_opacity) {
                elem.on("mouseenter", ".btn-group", function() { $(this).css("opacity", 1); });
                elem.on("mouseleave", ".btn-group", function() { $(this).css("opacity", 0.3); });
            };
            scope.scroll_config_info={
                axis:"xy" ,
                theme:"custom-dark",
                scrollbarPosition: "inside",
                scrollInertia:400,
                scrollEasing:"easeOutCirc",
                autoDraggerLength: true,
                autoHideScrollbar: true,
                scrollButtons:{ enable: false },
                mouseWheel:{ preventDefault:true },
            };
            scope.changeUlStyle = function() {
                return scope.realItems.length > 5 ? {height: '160px','min-width':'100%'} : {height: (scope.realItems.length * 30 )+ 15 + 'px','min-width':'100%'};
            };
            scope.widthStyle = function(){
                var _width = attrs.width ? attrs.width : $('.default-width').width();
                return {
                    width:(scope.has_noborder ? _width : _width-26)+'px',
                }
            };
            scope.opacityStyle = function(){
                return{
                    opacity:scope.has_opacity ? '0.3' : '1'
                }
            };
            var bindHtml = function(_value) {
                scope.init_label =_option_key && _value.indexOf("  [") != -1 ? _value.substring(0, _value.indexOf("  [")) : _value;
                $(".button-label", elem).attr("title",_option_key && _value.indexOf("  [") != -1 ? _value.substring(0, _value.indexOf("  [")) : _value);
            };
            //格式化下拉数据集合
            var formatItems = function() {
                scope.realItems = [];
                if(_option_key) {//配置了option-labal和option-key(显示效果为AAA[BBB])
                    var _option_labels = attrs.optionLabal.replace(" ", "").split(",");
                    for(var i = 0; i < scope.items.length; i ++) {
                        var _item = scope.items[i];
                        scope.realItems.push({key: _item[_option_key], value: (_item[_option_labels[0]] + (_item[_option_labels[1]] ? "  [" + _item[_option_labels[1]] + "]" : ""))});
                    }
                } else if(scope.items.length >= 1 && angular.isString(scope.items[0])) {  //数据中是字符串，key&value是同一个值
                    for(var i = 0; i < scope.items.length; i ++) {
                        scope.realItems.push({key: scope.items[i], value: scope.items[i]});
                    }
                } else {
                    for(var i = 0; i < scope.items.length; i ++) {   //数据中自动包含Key/Value
                        scope.realItems.push(scope.items[i]);
                    }
                }
                if(attrs.emptyOption) {
                    scope.realItems.push({key: '', value: attrs.emptyOption});
                }
            }
            //绑定下拉菜单
            var bindSelect = function() {
                formatItems();
                //补齐空选项，并默认先选中空选项
                if(attrs.emptyOption) {
                    bindHtml(attrs.emptyOption);
                }
                //当只有一个可选项时，直接选中，不再管其他，且仅执行一遍
                if((!attrs.emptyOption) && (scope.realItems.length == 1) && _is_init) {
                    var _item = scope.realItems[0];
                    scope.selectedItem = _item.key;
                    bindHtml(_item.value);
                    $timeout(function(){
                        scope.doSelect({selectKey: _item.key});
                    },0)
                    _is_init = false;
                }
                //下拉列表有值，已选也有值，正常选择
                if(scope.realItems.length > 1) {
                    for(var i = 0; i < scope.realItems.length; i++) {
                        var _item = scope.realItems[i];
                        if (_item.key === scope.selectedItem) {
                            bindHtml(_item.value);
                            break;
                        }
                        if(i == scope.realItems.length-1 && _item.key != scope.selectedItem){
                            scope.init_label = "--- 请选择 ---";
                        }
                    }
                }
            };
            //内部选择方法
            scope.selectVal = function(item) {
                _is_init = false;                        //标志手动触发变动
                scope.selectedItem = item.key;           //绑定新Key值
                bindHtml(item.value);                    //绑定页面显示
                $timeout(function(){
                    scope.doSelect({selectKey: item.key});   //执行用户自定义方法
                },0);

            };

            //当下拉显示值改变时
            scope.$watch(function() {
                return scope.selectedItem;
            }, function(val) {
                if(val) bindSelect();       //仅有值才会触发绑定值
            });
            //当下拉列表内容改变时
            scope.$watch(function() {
                return scope.items;
            }, function(val) {
                if(val){
                    _is_init = true;
                    bindSelect();
                }
            }, true);
        }
    }
}]);

/**
 * 发布项目阶段流程图Diagram指令
 */
cvDirectives.directive('phaseDiagram', function() {
    return {
        restrict: 'E',
        template: '<div></div>',  // just an empty DIV element
        replace: true,
        scope: { model: '=goModel', projs: '=projData' , read_only: '=readOnly'},
        link: function(scope, element, attrs) {
            var $ = go.GraphObject.make;

            var diagram = $(go.Diagram, element[0],  // must name or refer to the DIV HTML element
                {
                    initialContentAlignment: go.Spot.Top,
                    allowCopy: false,
                    autoScrollRegion: 10,
                    "animationManager.isEnabled": false,
                    "ModelChanged": updateAngular,
                    "isReadOnly" : scope.read_only ? true : false, //只读属性 用于查看
                    "undoManager.isEnabled": true   //支持ctrl+z
                }
            );

            diagram.groupTemplate =
                $(go.Group, "Vertical", {
                    locationSpot: go.Spot.Top,
                    locationObjectName: "HEADER",
                    minLocation: new go.Point(0, 0),
                    maxLocation: new go.Point(9999, 0),
                    selectionObjectName: "HEADER",
                    deletable: false
                },
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Panel, "Auto",
                    { name: "HEADER"},
                    $(go.Shape, "RoundedRectangle",
                        {parameter1: 10, desiredSize: new go.Size(200, 50), fill: '#66D2E5', stroke: null}),
                    $(go.TextBlock,
                        { margin: 5,
                            font: "14px Microsoft YaHei"},
                        new go.Binding("text", "text"))
                )
            );

            diagram.nodeTemplate =
                $(go.Node, "Horizontal",{
                        locationSpot: go.Spot.Right,
                        locationObjectName: "SHAPE",
                        isShadowed: true,
                        shadowOffset: new go.Point(3, 2),
                        copyable : false,
                        deletable: false,
                        movable: true,
                        linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                            return validateLink(from_node, to_node);
                        }
                    },
                    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                    $(go.Panel, "Auto",
                        $(go.Shape, "Ellipse", new go.Binding("fill", "color"), {
                            portId: "",
                            name: "SHAPE",
                            desiredSize: new go.Size(36, 36),
                            strokeWidth: 0,
                            cursor: "pointer",
                            fromLinkable: true, toLinkable: true,
                            fromLinkableSelfNode: false, toLinkableSelfNode: false,
                            fromLinkableDuplicates: false, toLinkableDuplicates: false
                        }),
                        $(go.TextBlock, new go.Binding("text", "name"), {
                            editable: false,
                            font: '18px Arial',
                            stroke: "white",
                            margin: new go.Margin(6, 0, 0, 2)
                        })
                    ),
                    $(go.TextBlock, new go.Binding("text", "text"), {
                        editable: false,
                        font: '14px Microsoft YaHei',
                        stroke: "#6695B5",
                        shadowVisible: false,
                        width:180,
                        margin: new go.Margin(6, 0, 0, 10)
                    })
            );

            diagram.linkTemplate = $(go.Link, {
                    relinkableFrom: true, relinkableTo: true,
                    fromLinkableDuplicates: false, toLinkableDuplicates: false,
                    isShadowed: true, shadowOffset: new go.Point(2, 2),
                    },
                $(go.Shape,  // the link path shape
                    { isPanelMain: true, stroke: "#336281", strokeWidth: 2 }),
                $(go.Shape,  // the arrowhead
                    { toArrow: "standard", stroke: "#336281", strokeWidth: 2})
            );
            function validateLink(from, to) {
                for(var i = 0; i < scope.model.linkDataArray.length; i ++) {
                    var _link = scope.model.linkDataArray[i];
                    if(_link.from == to.data.key && _link.to == from.data.key) {     //不能重复连接
                        return false;
                    }
                }
                scope.$apply();
                return true;
            }

            // whenever a GoJS transaction has finished modifying the model, update all Angular bindings
            function updateAngular(e) {
                if (e.isTransactionFinished) {
                    scope.$applyAsync();
                }
            }

            // notice when the value of "model" changes: update the Diagram.model
            scope.$watch("model", function(newmodel) {
                var oldmodel = diagram.model;
                if (oldmodel !== newmodel) {
                    diagram.removeDiagramListener("ChangedSelection", updateSelection);
                    diagram.model = newmodel;
                    diagram.addDiagramListener("ChangedSelection", updateSelection);
                }
            });
             //update the model when the selection changes
            function updateSelection(e) {
                diagram.model.selectedNodeData = null;
                var it = diagram.selection.iterator;
                while (it.next()) {
                    var selnode = it.value;
                    // ignore a selected link or a deleted node
                    if (selnode instanceof go.Node && selnode.data !== null) {
                        diagram.model.selectedNodeData = selnode.data;
                        break;
                    }
                }
                scope.$applyAsync();
            }
            //diagram.addDiagramListener("ChangedSelection", updateSelection);
        }
    };
});

/**
 * 项目发布执行面板动态高度指令
 */
cvDirectives.directive('dynaHeight', function() {
    return {
        link: function(scope, element, attrs) {
            var _ele_bottom = attrs.initBottom ? attrs.initBottom : 200;
            var _ele_top = parseInt($(element).css("top")); //距顶的高度
            var resetHeight = function(eleBottom) {
                $(element).css('height', $(window).height() - eleBottom - (isNaN(_ele_top)? 0 : _ele_top));
            };
            $(window).resize(function () {
                setTimeout(function () {
                    resetHeight(_ele_bottom);
                },50)
            });
            scope.resetHandle = function(eleBottom) {
                _ele_bottom = eleBottom;
                resetHeight(_ele_bottom);
            };
            resetHeight(_ele_bottom);
        }
    }
});

/**
 * 项目登记 保存按钮 动态计算 始终处于页面底部
 */
cvDirectives.directive('dynamicPosition', function() {
    return {
        link: function(scope, element, attrs) {
            var _ele_top = parseInt($('.ui-view-content').height());
            var _reset_top = _ele_top;
            var resetPosition = function(top) {
                $(element).css('marginTop', (isNaN(top) ? 0 : top - 310));
            };
            $(window).resize(function () {
                setTimeout(function () {
                    _reset_top = parseInt($('.ui-view-content').height());
                    resetPosition(_reset_top);
                },50)
            });
            resetPosition(_ele_top)
        }
    }
});

/**
 * 项目发布滚动高度计算指令
 */
cvDirectives.directive('dynaTop', function() {
   return {
       link: function(scope, element, attrs) {
           scope.heights.push($(element).offset().top);
       }
   }
});

/**
 * 页面内表格的加行操作
 */
cvDirectives.directive('rowPlus', ["$timeout", "$compile", function($timeout, $compile) {
    return  {
        restrict: 'A',
        replace: false,
        scope: {
            rowPlus: '&',
            tblData: '='
        },
        link: function(scope, elem, attrs) {
            var _html = '<tfoot>' +
                '   <tr>\n' +
                '       <td style="text-align: center;" colspan='+(elem.find("thead > tr > td").length-1)+'><span ng-if="tblData && tblData.length == 0" style="color: #999;">暂无数据</span></td>\n' +
                '       <td style="text-align: center;"><a class="add_line" style="cursor: pointer;"><i class="fa fa-plus" style="color: #99CCFF;"></i>&nbsp;新增</a></td>\n' +
                '   </tr>\n' +
                '</tfoot>\n';
            elem.find("thead").after($compile(_html)(scope));
            elem.find(".add_line:first").on("click", function() {
                scope.$apply(function(){                    scope.rowPlus();

                });
                });
        }
    }
}]);

/**
 * Material风格表格内输入框
 */
cvDirectives.directive('subFormControl', function() {
    return  {
        restrict: 'C',
        replace: false,
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            var _addControlFocus = function(elem) {
                var $ele = $(elem);
                if (!$ele.prop('disabled')) {   //兼容chrome
                    $ele.addClass("is-focused");
                }
            };
            var _removeControlFocus = function(elem) {
                $(elem).removeClass("is-focused");
            };
            elem.on("focus", function () {
                _addControlFocus(this);
            });
            elem.on("blur", function () {
                _removeControlFocus(this);
            });

        }
    }
});

/**
 * 快捷辅助导航栏
 * <navi-plus navi-list="scope里的数据列表" taget="ngrepeat的div的id的前缀，如：div_" text="scope里的数据列表中的中文显示key" top bottom />
 */
cvDirectives.directive('naviPlus', ["$timeout", "$window", "$compile", function($timeout, $window, $compile) {
    return {
        scope: {
            naviList: '=',
        },
        link: function(scope, elem, attrs) {
            var _has_top = (attrs.top === '' || attrs.top === 'true') ? true : false;
            var _has_bottom = (attrs.bottom === '' || attrs.bottom === 'true') ? true : false;
            var _text = angular.isString(attrs.text) ? attrs.text : "";
            var _taget = angular.isString(attrs.taget) ? attrs.taget : "";
            var _curr_timeout;
            var lis_divs = [];
            scope.resList = [];
            var _html = [
                '<div class="navi-plus">',
                _has_top ? '<div class="oth" title="到页面顶部" ng-click="scollLimit(0);"><i class="fa fa-angle-double-up"></i></div>' : '',
                '   <div class="lis" id="{{navi.id}}" ng-repeat="navi in resList" ng-click="scollTo(navi, $event, $index);">{{navi.id}}</div>',
                _has_bottom ? '<div class="oth" title="到页面底部" ng-click="scollLimit(9999);"><i class="fa fa-angle-double-down"></i></div>' : '',
                '</div>',
            ].join("");
            elem.append($compile(_html)(scope));
            scope.$watch(function() {
                return scope.naviList.length;
            }, function(val) {
                if(val && val > 0) {
                    scope.resList = [];
                    //重新构建当行专用列表对象
                    if(scope.naviList.length <= 7) {
                        for(var i = 0; i < scope.naviList.length; i ++) {
                            scope.resList.push({id: i+1, title: scope.naviList[i][_text]});
                        }
                    } else if(scope.naviList.length > 7) {
                        var _sp = Math.ceil(scope.naviList.length / 7);    //间隔
                        for(var i = 0; i < scope.naviList.length; i += _sp) {
                            var _joins = [];
                            for(var j = 0; j < _sp; j ++) {
                                if(scope.naviList[i+j]) _joins.push("【"+(i+j+1)+"】"+scope.naviList[i+j][_text]);
                            }
                            scope.resList.push({id: i+1, title: _joins.join(",   ")});
                        }
                    }
                    //TODO:  滚动后刷新
                }
            });
            //滚动选中
            var actionScroll = function() {
                lis_divs = $(document).find(".navi-plus .lis"); //重置div
                for(var i = 0; i < lis_divs.length; i ++) {
                    var _$lis = $(lis_divs[i]);
                    var _$target = $("#" + _taget + (_$lis.attr("id")-1));
                    if($(window).scrollTop() >= _$target.offset().top) {
                        _$lis.css({"background-color":"#3399CC", "color": "#FFF"});
                    } else {
                        _$lis.css({"background-color":"#EEE", "color": "#999"});
                    }
                }
            };
            //滚动跟踪
            $(window).scroll(function () {
                $timeout.cancel(_curr_timeout);
                _curr_timeout = null;
                _curr_timeout = $timeout(function() {
                    actionScroll();
                }, 100);
            });
            //鼠标经过显示文字内容
            $(document).on("mouseenter", ".navi-plus .lis", function() {
                var _index = $(this).index();
                $(this).html(scope.resList[_index-1].title)
                    .css({"min-width": "200px", "width": scope.resList[_index-1].title.length*12, "padding": "0 10px", "background-color":"#3399CC", "color": "#FFF"});
            });
            //鼠标移开归位
            $(document).on("mouseleave", ".navi-plus .lis", function() {
                var _index = $(this).index();
                $(this).html(scope.resList[_index-1].id)
                    .css({"width":30, "min-width": "0", "padding": 0});
                actionScroll();
            });
            //中间列表导航
            scope.scollTo = function(navi, event, index) {
                $('html,body').animate({scrollTop:($("#"+_taget+(navi.id-1)).offset().top)+1});
                $(event.target).html(scope.resList[index-1].id)
                    .css({"width":30, "min-width": "0", "padding": 0});
            };
            //头尾导航
            scope.scollLimit = function(limit) {
                $('html,body').animate({scrollTop:limit});
            };
            //销毁
            scope.$on('$destroy', function(){
                $(document).off("mouseenter", ".navi-plus .lis");
                $(document).off("mouseleave", ".navi-plus .lis");
            });
        }
    }
}]);

/**
 * toggle开关指令
 * <toggle-button checked="scope里的true/false" side="left/right" text="显示文字"></toggle-button>
 */
cvDirectives.directive('toggleButton', ["$compile", function($compile) {
    return {
        replace: true,
        scope: {
            checked: '=',
            doChange : '&',
            disabled  : '@'
        },
        link: function (scope, element, $attrs) {
            element.css("line-height", "24px");
            var html ='<div class="togglebutton">'+
                '<label style="font-size: 12px; color: #d2f1fe;">'+
                ($attrs['side'] === "left" && $attrs['text'] ? '<span style="-webkit-padding-end:10px;margin-right: 15px">'+$attrs['text']+'</span>' : "") +
                '<input type="checkbox" ng-model="checked" ng-disabled="disabled">'+
                '<span class="toggle"></span>'+
                ($attrs['side'] === "right" && $attrs['text'] ? '<span style="-webkit-padding-start: 10px;margin-right: 15px">'+$attrs['text']+'</span>' : "") +
                '</label>'+
                '<div>';
            element.append($compile(html)(scope));
            element.find('input').on('click' , function () {
                scope.$apply(function(){
                    scope.doChange();
                });

            });
        }
    };
}]);

/**
 * 返回页面顶部辅助按钮(全局)
 */
cvDirectives.directive('goTop', ["$compile", "$timeout", "$interval", function($compile, $timeout, $interval) {
    return {
        link: function(scope, element, attrs) {
            var _html = '<div id="gotop" title="返回页面顶部" style="width: 40px; height: 40px; cursor: pointer; background: #EEE; color: #111; border-radius: 50%; font-size: 25px; opacity:0.3; position: fixed; left: 130px; bottom: 20px; box-shadow: 0 1px 1.5px 0 rgba(0, 0, 0, 0.12), 0 1px 1px 0 rgba(0, 0, 0, 0.24); text-align: center; display: none;" ng-click="goTop();"><i class="fa fa-angle-double-up"></i></div>';
            element.append($compile(_html)(scope));
            scope.goTop = function() {
                $('body,html').animate({scrollTop:0},500);
                return false;
            };
            $("#gotop").hover(function() {
                $(this).css("opacity", 1);
            }, function() {
                $(this).css("opacity", 0.5);
            });
            $(window).scroll(function () {
                if($(document).scrollTop() > 400 && $("#gotop").is(":hidden")) {
                    $("#gotop").fadeIn();
                } else if($(document).scrollTop() <= 400 && !$("#gotop").is(":hidden")) {
                    $("#gotop").fadeOut();
                }
            });
        }
    }
}]);


//cd_文件浏览指令
//文件浏览指令
cvDirectives.directive("fileBrowseCheck", ["$compile", function($compile) {
    /**
     * 页面写法：
     * 绑定节点信息
     * node: {
 *      node_name: '',  //节点名
 *      init_path: '',  //初始化路径
 *      path_files: []              //当前路径文件列表（生成）
 *      loading: T/F                //文件列表加载中（生成）
 *      full_path: '',              //完整路径（生成）
 *      is_dir: T/F                 //当前是目录还是文件(自动维护)
 *      checked_files: [],          //选中的文件列表（自动维护）
 *      deleted_files: []           //删除的文件列表（自动维护）
 *      modified_files: []          //已经修改结果的文件列表
 *      spical_files: []            //特殊需要修改的文件列表
 * }
     *
     * 返回文件信息
     * file: {
        "type":         "目录",      //文件类型
        "file":         "backup",   //文件名
        "dir":          true,       //是否是目录
        "modified_flag":false,      //是否修改过 （！！！CE中没有，CV里保留）
        "edit_flag":    true,       //是否可修改
        "check_flag":   false,      //是否被选中
        "delete_flag":  false       //是否被删除
    }
     */
    return {
        restrict: 'E',
        scope: {
            node: '=',
            changePath: '&',
            deleteFile: '&'
        },
        link: function(scope, elem, attr) {
            var _has_checkbox = (attr.check === '' || attr.check === 'true') ? true : false;
            var _has_delete = attr.deleteFile ? true : false;
            var _fill_path = "";
            var _init_path = scope.node.init_path;
            //去掉路径最后的'/'
            _init_path = _init_path.length > 1 && _init_path.lastIndexOf("/") == _init_path.length -1 ? _init_path.slice(0, _init_path.length-1) : _init_path;
            var _last_slash_index = _init_path.lastIndexOf("/");
            // /, /a, a, /a/b, a/b, a/
            if(!_init_path) {           //''
                scope.node.paths = [];
            } else if(_last_slash_index == -1) {   //没有'/'或''
                scope.node.paths = [_init_path];
            } else if(_init_path.length == 1 && _last_slash_index == 0) {   //只有'/'
                scope.node.paths = [_init_path];
            } else if(_last_slash_index == 0) {     // '/x'
                _fill_path = "/";
                scope.node.paths = [_init_path.slice(1)];
            } else {
                _fill_path = _init_path.slice(0, _last_slash_index + 1);
                scope.node.paths = [_init_path.slice(_last_slash_index + 1)];
            }
            scope.node.full_path = _init_path;  //dft init
            scope.node.is_dir = true;           //dft init
            var html = ['<div>',
                '<ol class="breadcrumb" style="margin-bottom: 0;background:#091118">',
                '<li class="active">文件路径：&nbsp;..</li>',
                '<li ng-repeat="path in node.paths track by $index"><a ng-click="goback($index)" ng-bind="path" style="cursor: pointer;"></a></li>',
                '</ol>',
                '<ol ng-show="node.loading" style="padding-left: 0px; margin: 30px auto;">',
                '<li style="list-style: none; text-align: center; font-size: 20px;">',
                '<i class="fa fa-spinner fa-spin" style="font-size: 30px; color: #44dcfd;"></i>',
                '</li>',
                '</ol>',
                '<ol ng-show="node.err_msg && !node.loading" style="padding-left: 0px; margin: 30px auto;">',
                '<li style="list-style: none; text-align: center; font-size: 18px; color: #999;">',
                '<span style="color: #FF9933;" ng-bind="node.err_msg"></span> ',
                '</li>',
                '</ol>',
                '<ol class="file_list" style="overflow-y:scroll; padding-left: 0;" ng-show="!node.err_msg && !node.loading">',
                '<li style="height: 24px; line-height: 24px; list-style: none;" ng-if="node.paths.length > 1">',
                '<i class="" style="margin-right: 10px;"></i><a style="cursor: pointer;" title="上一层" ng-click="goprev();">..</a>',
                '</li>',
                '<li ng-repeat="file in node.path_files" class="li-file" ' + (_has_delete ? 'ng-style="liStyle(file);" ng-mouseover="file.hover = true;" ng-mouseout="file.hover = false;"' : '') +'>',
                _has_checkbox ? '<input type="checkbox" i-check ng-model="file.checked" ng-change="checkFile(file);">' : '',
                '<div style="display: inline-block;">', //"'+''+'" : "'+'fa-file-text-o'+'"
                '<i class="fa" ng-class="file.dir ? '+"'fa-folder-open'"+' : '+"'fa-file-text-o'"+' " style="margin-left: 10px; color: #EAC344; display: block; padding-bottom: 4px;"></i>',
                '<a ng-if="file.edit_flag && file.dir" style="cursor: pointer;display: block; word-wrap: break-word; padding-left: 30px;margin-top: -25px;" ng-click="gofront(file);" ng-style="fileStyle(file.file, file.check_flag, file.modified_flag);" ng-bind="file.file"></a>',
                '<a ng-if="file.edit_flag && !file.dir" style="cursor: pointer;display: block; word-wrap: break-word; padding-left: 30px;margin-top: -25px;" ng-click="gofile(file);" ng-style="fileStyle(file.file, file.check_flag, file.modified_flag);" ng-bind="file.file"></a>',
                '<span ng-if="!file.edit_flag" style="color: #44dcfd;display: block; word-wrap: break-word;padding-left: 30px;margin-top: -25px;" ng-bind="file.file"></span>',
                '</div>',
                _has_delete ? "<i class='fa li-file-trash' ng-class='trashClass(file);' ng-style='trashStyle(file);' ng-click='delete(file);'></i>" : "",
                '</li>',
                '</ol>',
                '</div>'].join("");
            elem.append($compile(html)(scope));
            //文件路径改变通用函数
            var chengePath = function() {
                scope.node.full_path = _fill_path + scope.node.paths.join("/");
                scope.changePath();
            };
            //文件行鼠标样式
            scope.liStyle = function(file) {
                return file.hover ? {background: "#EFEFEF"} : {background: "#FFF"};
            };
            //区别文件是否修改过的样式
            scope.fileStyle = function(file_name, checked_flag, modified_flag) {
                var _style_o = {};
                _style_o.fontWeight = checked_flag ? "bolder" : "";
                _style_o.color = modified_flag ? "#E3AC36" : "#428bca";
                if(scope.node.spical_files.indexOf(file_name) != -1) {
                    _style_o.color = "#E3AC36";
                    _style_o.fontWeight = "bold";
                }
                //else {
                //    _style_o.color = "#428bca";
                //}
                //_style_o.color = modified_flag ? "#E3AC36" : "#428bca";
                return _style_o;
            };
            //删除按钮鼠标样式
            scope.trashStyle = function(file) {
                return file.hover ? {color: '#666'} : {color: '#FFF'};
            };
            //删除文件
            scope.delete = function(file) {
                //直接删除文件
                file.hover = true;
                scope.node.parent_path = _fill_path + scope.node.paths.join("/");
                scope.node.full_path = _fill_path + scope.node.paths.join("/") + "/" + file.file;
                scope.node.is_dir = file.dir;
                scope.deleteFile();
            };
            //选中文件
            scope.checkFile = function(file) {
                if(file.checked) {
                    scope.node.checked_files.push({'file': file.file, 'path': _fill_path + scope.node.paths.join("/"), dir: file.dir});
                } else {
                    var _exist_index = -1;
                    for(var i = 0; i < scope.node.checked_files.length; i ++) {
                        var _checked_file = scope.node.checked_files[i];
                        if(_checked_file.file === file.file && _checked_file.path === scope.node.full_path) {
                            _exist_index = i;
                        }
                    }
                    scope.node.checked_files.splice(_exist_index, 1);
                }
            }
            //恢复按钮鼠标样式
            scope.trashClass = function(file) {
                return file.deleted ? "fa-reply" : "fa-trash-o";
            };
            //返回上一级目录
            scope.goprev = function() {
                if(scope.node.paths.length > 1) scope.goback(scope.node.paths.length - 2);
            };
            //返回任意一级目录
            scope.goback = function(index) {
                scope.node.is_dir = true;
                scope.node.paths.splice(index + 1);
                chengePath();
            };
            //返回下一级目录
            scope.gofront = function(file) {
                scope.node.is_dir = true;
                scope.node.paths.push(file.file);
                chengePath();
            };
            //点击文件
            scope.gofile = function(file) {
                scope.node.full_path = _fill_path + scope.node.paths.join("/") + "/" + file.file;
                scope.node.is_dir = false;
                scope.changePath();
            };
            //实时根据选中和删除的文件列表改变文件样式
            scope.$watch("node.path_files", function() {
                var _node_full_path = scope.node.full_path;
                if(!scope.node.path_files) return false;
                if(!scope.node.checked_files) scope.node.checked_files = [];
                if(!scope.node.deleted_files) scope.node.deleted_files = [];
                for(var i = 0; i < scope.node.path_files.length; i ++) {
                    var _file = scope.node.path_files[i];
                    for(var j = 0; j < scope.node.checked_files.length; j ++) {
                        var _checked_file_j = scope.node.checked_files[j];
                        if(_checked_file_j.file === _file.file && _checked_file_j.path === _node_full_path) _file.checked = true;
                    }
                    for(var j = 0; j < scope.node.deleted_files.length; j ++) {
                        if(scope.node.deleted_files[j].file === _file.file) _file.deleted = true;
                    }
                }
            });
            scope.$watch(function() {
                return scope.node.modified_files;
            }, function(val) {
                for(var i = 0; i < scope.node.path_files.length; i ++) {
                    var _file = scope.node.path_files[i];
                    for(var j = 0; j < val.length; j ++) {
                        var modify = val[j];
                        if(modify === (_fill_path + scope.node.paths.join("/") + "/" + _file.file)) {
                            _file.modified_flag = true;
                        }
                    }
                }
            }, true);
            scope.changePath(); //init
        }
    };
}]);

//侧边自适应指令
cvDirectives.directive('cusHeight',["$window",function($window){
    return {
        restrict: 'AE',
        link: function(scope, elem, attr) {
            elem.css('height',$(window).scrollTop()+$(window).height()-64 +'px');
            $(window).resize(function(){
                elem.css('height',$(window).scrollTop()+$(window).height()-64 +'px');
            });
            $(window).scroll(function () {
                elem.css('height',$(window).scrollTop()+$(window).height()-64+ 'px');
            });
        }
    };
}]);


//整个body宽度自适应指令
cvDirectives.directive('dynamicWeight',["$window",function($window){
    return {
        restrict: 'AE',
        link: function(scope, elem, attr) {
            if($window.innerWidth > 1400){
                elem.css('left',(($window.innerWidth-1400)/2)+"px");
            }else{
                elem.css('left',"0px");
            }
            $(window).resize(function(){
                if($window.innerWidth > 1400){
                    elem.css('left',(($window.innerWidth-1400)/2)+"px");
                }else{
                    elem.css('left',"0px");
                }
            });
        }
    };
}]);
//侧边自适应指令
cvDirectives.directive('cusHeightSyn',["$timeout",function($timeout){
    return {
        restrict: 'AE',
        link: function(scope, elem, attr) {
            scope.$watch('tabs',function(){
                $timeout(function(){
                    var _height =$('.left').css('height');
                    $('.right').css('height',_height);
                },200);
            },true);
        }
    };
}]);
//侧边自适应指令
cvDirectives.directive('cusLineFlow',["$compile", "$timeout", function($compile,$timeout){
    return {
        restrict: 'AE',
        link: function(scope, elem, attr) {
            var html = "<div class='line' style='position:absolute;width: 1px;background: #59a8f9;left: 51%;top:57px;'></div>"
            $('.tab-content').prepend($compile(html)(scope));
            $timeout(function(){
                var _height = $('.tab-content').css('height');
                $('.line').css('height',_height);
            },2000);

        }
    };
}]);

//周期配置输入验证
cvDirectives.directive('cusTimeVal',["$compile", "$timeout", function($compile,$timeout){
    return {
        restrict: 'AE',
        require: '?ngModel',
        scope:{error_mes:'=errorMes'},
        link: function(scope, elem, attr, ctrl) {
            scope.error_mes = '';
            var _html = '<div class="ss" ng-bind="error_mes" ng-if="errorPrompt" style="color: #e9416e;padding-left:14px;"></div>';
            elem.on("blur", function () {
               scope.errorPrompt = true;
                scope.error_mes = '';
                elem.parent().siblings('.ss').remove();
                var val = elem.val();
                if(attr.name == "week"){
                    if(!/^[1-7]$/.test(val)){
                        scope.error_mes = "周格式不正确(1-7)";
                    }
                }else if(attr.name == "mouth" || attr.name == "mouthtep"){
                    if(!/^([1-9]|1[0-2]){0,1}$/.test(val)){
                        scope.error_mes = attr.name == "hour" ? "月格式不正确(1-12)" : "月间隔格式不正确(1-12)";
                    }
                }else if(attr.name == "day" || attr.name == "daytep"){
                    if(!/^([1-9]|[1-2][0-9]|3[0-1]){0,1}$/.test(val)){
                        scope.error_mes = attr.name == "day" ? "日格式不正确(1-31)" : "日间隔格式不正确(1-31)";
                    }
                }else if(attr.name == "hour"){
                    if(!/^(\d|[0-1]\d|2[0-3]){0,1}$/.test(val)){
                        scope.error_mes =  "时格式不正确(0-23)";
                    }
                }else if(attr.name == "hourtep"){
                    if(!/^([1-9]|[1]\d|2[0-3]){0,1}$/.test(val)){
                        scope.error_mes = "时间隔格式不正确(1-23)";
                    }
                } else if(attr.name == "minute"){
                    if(!/^(\d|[0-5]\d){0,1}$/.test(val)){
                        scope.error_mes = "分格式不正确(0-59)";
                    }
                }else if(attr.name == "minutep"){
                    if(!/^([1-9]|[1-5]\d){0,1}$/.test(val)){
                        scope.error_mes = "分间隔格式不正确(1-59)";
                    }
                }else if(attr.name == "duration" && !val){
                    scope.error_mes = "时长不能为空";
                }
                if(scope.error_mes){
                    scope.$apply(function(){
                        elem.parent().siblings('.ss').remove();
                        $(".autoStyle").before($compile(_html)(scope));
                    })
                }
            });
            elem.on("keydown",function(e){
                e = e ? e : event;
                if(e.keyCode == 8){
                    e.stopPropagation();
                    scope.$apply(function(){
                        scope.error_mes = '';
                      /*  elem.val("");*/
                    });
                }
            });
        }
    };
}]);

//流程定制指令
cvDirectives.directive('cusFlowMade',["$compile", "$timeout","$rootScope", function($compile,$timeout,$rootScope){
    return {
        restrict: 'AE',
        require: '?ngModel',
        scope: {model: '=goModel', pal_data: '=palData',selectKey:'=selectKey',jobConfig:'=jobConfig' ,reflashNode:'=reflashNode', config:'&config',dealNode:'&getInstance', refresh: '&refresh',read_only: '=readOnly',undo: '=undo', redo:'=redo',array:'=array',configNoData:'&configNoData'},
        link: function(scope, elem, attr, ctrl) {
            var myDiagram;
            var privatePalette;
            var palette_list = scope.pal_data.palette_list ? scope.pal_data.palette_list : {}; //基础元素面板
            var private_palette_list = scope.pal_data.private_palette_list ? scope.pal_data.private_palette_list : []; //私有元素面板
            var scene_palette_list = scope.pal_data.scene_palette_list ? scope.pal_data.scene_palette_list : []; //场景元素面板
            var _group_index = 0;
            var _node_id = 0;
            var _pop_list = [];

            scope.selectNode = {};
            function DemoForceDirectedLayout() {
                go.TreeLayout.call(this);
            }
             go.Diagram.inherit(DemoForceDirectedLayout, go.TreeLayout);
            function init() {
                var $ = go.GraphObject.make;  // for conciseness in defining templates
                myDiagram =
                    $(go.Diagram, "myEditDiagramDiv",  // must name or refer to the DIV HTML element
                        {
                            initialContentAlignment: go.Spot.TopCenter,
                            "grid.visible": false,
                            allowMove:true,//画布上的节点是否可以拖动
                            allowDrop: true,  // must be true to accept drops from the Palette
                            "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
                            "LinkRelinked": showLinkLabel,
                            "ChangedSelection": updateSelection,// when click your node or group then selected it
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            "undoManager.isEnabled": true,  // enable undo & redo
                            // initialAutoScale: go.Diagram.UniformToFill,
                            autoScale:go.Diagram.UniformToFill,
                        }
                    );
                 //when the document is modified, add a "*" to the title and enable the "Save" buttonExternalObjectsDropped
                myDiagram.addDiagramListener("LayoutCompleted", function (e) {
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                //拖动增加
                myDiagram.addDiagramListener("ExternalObjectsDropped", function (e) {
                    if(_pop_list.length != 0){
                        var _key = _pop_list.shift();
                        myDiagram.model.setDataProperty(myDiagram.model.selectedNodeData, "key", _key);
                    }else{
                        _node_id++;
                        myDiagram.model.setDataProperty(myDiagram.model.selectedNodeData, "key", _node_id);
                    }

                });
                //复制
                myDiagram.addDiagramListener("SelectionCopied", function (e) {
                    if(_pop_list.length != 0){
                        var _key = _pop_list.shift();
                        myDiagram.model.setDataProperty(myDiagram.model.selectedNodeData, "key", _key);
                    }else{
                        _node_id++;
                        myDiagram.model.setDataProperty(myDiagram.model.selectedNodeData, "key", _node_id);
                        var job_bean = angular.copy(myDiagram.model.selectedNodeData.sd_job_bean);
                        job_bean.job_id =  myDiagram.model.selectedNodeData.key;
                        myDiagram.model.setDataProperty(myDiagram.model.selectedNodeData, "sd_job_bean", job_bean);
                    }

                });
                //删除
                myDiagram.addDiagramListener("SelectionDeleted", function (e) {
                    if(myDiagram.model.selectedNodeData){
                        _pop_list.push(myDiagram.model.selectedNodeData.key);
                    }
                });
                // helper definitions for node templates
                function nodeStyle() {
                    return [
                        // The Node.location comes from the "loc" property of the node data,
                        // converted by the Point.parse static method.
                        // If the Node.location is changed, it updates the "loc" property of the node data,
                        // converting back using the Point.stringify static method.
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        new go.Binding("layerName", "isHighlighted", function(h) { return "Foreground"; }).ofObject(),
                        {
                            // the Node.location is at the center of each node
                            locationSpot: go.Spot.Center,
                            cursor:'pointer',
                            //isShadowed: true,
                            //shadowColor: "#888",
                            // handle mouse enter/leave events to show/hide the ports
                            mouseEnter: function (e, obj) {
                                showPorts(obj.part, true);
                            },
                            mouseLeave: function (e, obj) {
                                showPorts(obj.part, false);
                                if(scope.pal_data.right_tab==2){
                                    scope.pal_data.right_tab_show = true;
                                    scope.$apply();
                                }
                            },
                            click:function(e,obj){
                                console.log(e,obj);
                                obj.part.stroke = "#CCCCCC";
                                console.log(scope)
                                if(scope.pal_data.tab_num == 1 && scope.pal_data.judge_bool){
                                    $rootScope.tiHuan_obj = []
                                    $rootScope.elem_name = obj.Zd.text
                                    $rootScope.elem_type = obj.Zd.type
                                    $rootScope.elem_category = obj.Zd.category
                                    var arr = scope.pal_data.submit_arr
                                    for(var i = 0 ; i < arr.length ; i++){
                                        if($rootScope.elem_name == arr[i].draw_name){
                                            $rootScope.tiHuan_obj = arr[i]
                                        }
                                    }
                                    scope.$emit("tiHuan_obj", {data:$rootScope.tiHuan_obj});
                                }else if(scope.pal_data.judge_bool){
                                    $rootScope.pro_tiHuan = []
                                    $rootScope.pro_elem_name = obj.Zd.text
                                    var arr = scope.pal_data.pro_save_list
                                    console.log(arr)
                                    for(var i = 0 ; i<arr.length ; i++){
                                        console.log('循环')
                                        if($rootScope.pro_elem_name == arr[i].element_name){
                                            $rootScope.pro_tiHuan = arr[i]
                                            console.log($rootScope.pro_tiHuan)
                                        }
                                    }
                                    scope.$emit("pro_tiHuan", {data:$rootScope.tiHuan_obj});
                                    console.log($rootScope.pro_elem_name)
                                }
                            }
                        }
                    ];
                }
                function palNodeStyle(){
                    return[
                        {mouseEnter: function (e, obj) {
                            obj.part.background = "#526276";
                            var text = obj.findObject("TEXT");
                            text.stroke = "#d2f1fe";
                        },
                        mouseLeave: function (e, obj) {
                            obj.part.background = "transparent";
                            var text = obj.findObject("TEXT");
                            text.stroke = "#61A1B8";
                        }
                        }
                    ]
                };
                function validateLink(from, to, from_obj) {
                    var _able = true;
                    for(var j = 0; j < scope.model.linkDataArray.length; j ++) {
                        var _j_link = scope.model.linkDataArray[j];
                        if(from_obj && from_obj.part.data.category == '3' ){
                            if((from.data.key == _j_link.from && to.data.key == _j_link.to) ||  (to.data.key == _j_link.from && from.data.key == _j_link.to)){
                                _able = false;
                            }
                        }else{
                            if(from_obj.part.data.category != '3' && (from.data.key == _j_link.from || to.data.key == _j_link.to || (to.data.key == _j_link.from && from.data.key == _j_link.to))){
                                _able = false;
                            }
                        }

                    }
                    return _able;
                }
                // control whether the user can draw links from or to the port.
                function makePort(name, spot, output, input,node) {
                    // the port is basically just a small circle that has a white stroke when it is made visible
                    return $(go.Shape, "Circle",
                        {
                            fill: "transparent",
                            stroke: "#7c8e8b",  // this is changed to "white" in the showPorts function
                            desiredSize: new go.Size(8, 8),
                            alignment: spot, alignmentFocus: spot,  // align the port on the main Shape
                            portId: name,  // declare this object to be a "port"
                            fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
                            fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
                            cursor: "pointer",  // show a different cursor to indicate potential link point
                        },new go.Binding("visible", "group", function(c) {
                            if(c == 0 || !c){
                                return true;
                            }else{
                                return false;
                            }
                    }));
                }
                myDiagram.toolManager.dragSelectingTool.delay = 0;//禁止拖动整个画布
                myDiagram.nodeTemplateMap.add("7",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                console.log(1);
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        //// the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                        //new go.Binding("selectionAdorned", "selection", function(c) {
                        //    if(c) return true;
                        //    if(!c) return false;
                        //}),
                        $(go.Panel, "Auto",
                            $(go.Shape, "Rectangle",
                                {fill: "#091016",cursor: "pointer", stroke: "#164957", strokeWidth:1, width:120,height:56}),
                                //new go.Binding("figure", "figure")),
                            $(go.Panel, "Auto",{padding:6,alignment:go.Spot.Left},
                                $(go.Picture, {
                                    width: 36, height: 36,
                                },
                                new go.Binding("source", "", function(t) {
                                    if(t.sd_job_bean.sdwork_cn_name && t.sd_job_bean.config){
                                        if(t.type == 6){return 'img/dispatch/fl/context/rep.png';}
                                        else if(t.type == 7){return 'img/dispatch/fl/context/ftpU.png';}
                                        else if(t.type == 8){return 'img/dispatch/fl/context/ftpD.png';}
                                        else if(t.type == 9){return 'img/dispatch/fl/context/sftpU.png';}
                                        else if(t.type == 10){return 'img/dispatch/fl/context/sftpD.png';}
                                        else if(t.type == 11){return 'img/dispatch/fl/context/zngtU.png';}
                                        else if(t.type == 12){return 'img/dispatch/fl/context/zngtD.png';}
                                        else if(t.type == 13){return 'img/dispatch/fl/context/copy.png';}
                                        else if(t.type == 14){return 'img/dispatch/fl/context/sql.png';}
                                        else if(t.type == 15){return 'img/dispatch/fl/context/sqlS.png';}
                                        else if(t.type== 16){return 'img/dispatch/fl/context/web.png';}
                                        else if(t.type == 17){return 'img/dispatch/fl/context/sysSt.png';}
                                        else if(t.type == 18){return 'img/dispatch/fl/context/sysE.png';}
                                        else if(t.type == 19){return 'img/dispatch/fl/context/python.png';}
                                        else if(t.type == 20){return 'img/dispatch/fl/context/shell.png';}
                                        else if(t.type == 21){return 'img/dispatch/fl/context/bat.png';}
                                        else if(t.type == 22){return 'img/dispatch/fl/context/rb.png';}
                                        else if(t.type== 23){return 'img/dispatch/fl/context/perl.png';}
                                        else if(t.type == 24){return 'img/dispatch/fl/context/webs.png';}
                                        else if(t.type == 25){return 'img/dispatch/fl/context/tcp.png';}
                                        else if(t.type == 26){return 'img/dispatch/fl/context/http.png';}
                                        else if(t.type == 27){return 'img/dispatch/fl/context/tux.png';}
                                        else if(t.type == 28){return 'img/dispatch/fl/context/cl.png';}
                                        else if(t.type == 29){return 'img/dispatch/fl/context/rpg.png';}
                                        else if(t.type == 30){return 'img/dispatch/fl/context/java.png';}
                                        else if(t.type == 31){return 'img/dispatch/fl/context/c.png';}
                                        else if(t.type == 32){return 'img/dispatch/fl/context/c++.png';}
                                        else if(t.type == 33){return 'img/dispatch/fl/context/site.png';}
                                        else if(t.type == 34){return 'img/dispatch/fl/context/area.png';}
                                        else if(t.type == 35){return 'img/dispatch/fl/context/cell.png';}
                                        else if(t.type == 36){return 'img/dispatch/fl/context/unit.png';}
                                        else if(t.type == 37){return 'img/dispatch/fl/context/enterprise.png';}
                                        else if(t.type == 38){return 'img/dispatch/fl/context/t38.png';}
                                        else if(t.type == 39){return 'img/dispatch/fl/context/t39.png';}
                                        else if(t.type == 40){return 'img/dispatch/fl/context/t40.png';}
                                        else if(t.type == 41){return 'img/dispatch/fl/context/t41.png';}
                                        else if(t.type == 42){return 'img/dispatch/fl/context/t42.png';}
                                        else if(t.type == 43){return 'img/dispatch/fl/context/t43.png';}
                                        else if(t.type == 44){return 'img/dispatch/fl/context/t44.png';}
                                        else if(t.type == 45){return 'img/dispatch/fl/context/t45.png';}
                                        else if(t.type == 46){return 'img/dispatch/fl/context/t46.png';}
                                        else if(t.type == 47){return 'img/dispatch/fl/context/t47.png';}
                                        else if(t.type == 48){return 'img/dispatch/fl/context/t48.png';}
                                        else if(t.type == 49){return 'img/dispatch/fl/context/t49.png';}
                                        else if(t.type == 50){return 'img/dispatch/fl/context/t50.png';}
                                        else if(t.type == 51){return 'img/dispatch/fl/context/t51.png';}
                                        else if(t.type == 52){return 'img/dispatch/fl/context/t52.png';}
                                        else if(t.type == 53){return 'img/dispatch/fl/context/t53.png';}
                                        else if(t.type == 54){return 'img/dispatch/fl/context/t54.png';}
                                        else if(t.type == 55){return 'img/dispatch/fl/context/t55.png';}
                                        else if(t.type == 56){return 'img/dispatch/fl/context/t56.png';}
                                        else if(t.type == 57){return 'img/dispatch/fl/context/t57.png';}
                                        else if(t.type == 58){return 'img/dispatch/fl/context/t58.png';}
                                        else if(t.type == 59){return 'img/dispatch/fl/context/t59.png';}
                                        else if(t.type == 60){return 'img/dispatch/fl/context/t60.png';}
                                        else if(t.type == 61){return 'img/dispatch/fl/context/t61.png';}
                                        else if(t.type == 62){return 'img/dispatch/fl/context/t61.png';}
					else if(t.type == 63){return 'img/dispatch/fl/context/t63.png';}
                                        else if(t.type == 64){return 'img/dispatch/fl/context/t64.png';}
                                        else if(t.type == 65){return 'img/dispatch/fl/context/t65.png';}
                                        else if(t.type == 66){return 'img/dispatch/fl/context/t66.png';}
                                        else if(t.type == 67){return 'img/dispatch/fl/context/t67.png';}
                                        else if(t.type == 68){return 'img/dispatch/fl/context/t68.png';}
                                        else if(t.type == 69){return 'img/dispatch/fl/context/t69.png';}
                                        else if(t.type == 70){return 'img/dispatch/fl/context/t70.png';}
                                        else if(t.type == 71){return 'img/dispatch/fl/context/t71.png';}
                                        else if(t.type == 72){return 'img/dispatch/fl/context/t72.png';}
                                        else if(t.type == 73){return 'img/dispatch/fl/context/t73.png';}
                                        else if(t.type == 74){return 'img/dispatch/fl/context/t74.png';}
                                        else if(t.type == 75){return 'img/dispatch/fl/context/t75.png';}
                                        else if(t.type == 76){return 'img/dispatch/fl/context/t76.png';}
                                        else if(t.type == 77){return 'img/dispatch/fl/context/t77.png';}
                                    }else{
                                        if(t.type == 1){return 'img/dispatch/fl/context/start_un.png';}
                                        else if(t.type == 6){return 'img/dispatch/fl/context/rep_un.png';}
                                        else if(t.type == 7){return 'img/dispatch/fl/context/ftpU_un.png';}
                                        else if(t.type == 8){return 'img/dispatch/fl/context/ftpD_un.png';}
                                        else if(t.type == 9){return 'img/dispatch/fl/context/sftpU_un.png';}
                                        else if(t.type == 10){return 'img/dispatch/fl/context/sftpD_un.png';}
                                        else if(t.type == 11){return 'img/dispatch/fl/context/zngtU_un.png';}
                                        else if(t.type == 12){return 'img/dispatch/fl/context/zngtD_un.png';}
                                        else if(t.type == 13){return 'img/dispatch/fl/context/copy_un.png';}
                                        else if(t.type == 14){return 'img/dispatch/fl/context/sql_un.png';}
                                        else if(t.type == 15){return 'img/dispatch/fl/context/sqlS_un.png';}
                                        else if(t.type== 16){return 'img/dispatch/fl/context/web_un.png';}
                                        else if(t.type == 17){return 'img/dispatch/fl/context/sysSt_un.png';}
                                        else if(t.type == 18){return 'img/dispatch/fl/context/sysE_un.png';}
                                        else if(t.type == 19){return 'img/dispatch/fl/context/python_un.png';}
                                        else if(t.type == 20){return 'img/dispatch/fl/context/shell_un.png';}
                                        else if(t.type == 21){return 'img/dispatch/fl/context/bat_un.png';}
                                        else if(t.type == 22){return 'img/dispatch/fl/context/rb_un.png';}
                                        else if(t.type== 23){return 'img/dispatch/fl/context/perl_un.png';}
                                        else if(t.type == 24){return 'img/dispatch/fl/context/webs_un.png';}
                                        else if(t.type == 25){return 'img/dispatch/fl/context/tcp_un.png';}
                                        else if(t.type == 26){return 'img/dispatch/fl/context/http_un.png';}
                                        else if(t.type == 27){return 'img/dispatch/fl/context/tux_un.png';}
                                        else if(t.type == 28){return 'img/dispatch/fl/context/cl_un.png';}
                                        else if(t.type == 29){return 'img/dispatch/fl/context/rpg_un.png';}
                                        else if(t.type == 30){return 'img/dispatch/fl/context/java_un.png';}
                                        else if(t.type == 31){return 'img/dispatch/fl/context/c_un.png';}
                                        else if(t.type == 32){return 'img/dispatch/fl/context/c++_un.png';}
                                        else if(t.type == 33){return 'img/dispatch/fl/context/site.png';}
                                        else if(t.type == 34){return 'img/dispatch/fl/context/area.png';}
                                        else if(t.type == 35){return 'img/dispatch/fl/context/cell.png';}
                                        else if(t.type == 36){return 'img/dispatch/fl/context/unit.png';}
                                        else if(t.type == 37){return 'img/dispatch/fl/context/enterprise.png';}
                                        else if(t.type == 38){return 'img/dispatch/fl/context/t38.png';}
                                        else if(t.type == 39){return 'img/dispatch/fl/context/t39.png';}
                                        else if(t.type == 40){return 'img/dispatch/fl/context/t40.png';}
                                        else if(t.type == 41){return 'img/dispatch/fl/context/t41.png';}
                                        else if(t.type == 42){return 'img/dispatch/fl/context/t42.png';}
                                        else if(t.type == 43){return 'img/dispatch/fl/context/t43.png';}
                                        else if(t.type == 44){return 'img/dispatch/fl/context/t44.png';}
                                        else if(t.type == 45){return 'img/dispatch/fl/context/t45.png';}
                                        else if(t.type == 46){return 'img/dispatch/fl/context/t46.png';}
                                        else if(t.type == 47){return 'img/dispatch/fl/context/t47.png';}
                                        else if(t.type == 48){return 'img/dispatch/fl/context/t48.png';}
                                        else if(t.type == 49){return 'img/dispatch/fl/context/t49.png';}
                                        else if(t.type == 50){return 'img/dispatch/fl/context/t50.png';}
                                        else if(t.type == 51){return 'img/dispatch/fl/context/t51.png';}
                                        else if(t.type == 52){return 'img/dispatch/fl/context/t52.png';}
                                        else if(t.type == 53){return 'img/dispatch/fl/context/t53.png';}
                                        else if(t.type == 54){return 'img/dispatch/fl/context/t54.png';}
                                        else if(t.type == 55){return 'img/dispatch/fl/context/t55.png';}
                                        else if(t.type == 56){return 'img/dispatch/fl/context/t56.png';}
                                        else if(t.type == 57){return 'img/dispatch/fl/context/t57.png';}
                                        else if(t.type == 58){return 'img/dispatch/fl/context/t58.png';}
                                        else if(t.type == 59){return 'img/dispatch/fl/context/t59.png';}
                                        else if(t.type == 60){return 'img/dispatch/fl/context/t60.png';}
                                        else if(t.type == 61){return 'img/dispatch/fl/context/t61.png';}
                                        else if(t.type == 62){return 'img/dispatch/fl/context/t61.png';}
					else if(t.type == 63){return 'img/dispatch/fl/context/t63.png';}
                                        else if(t.type == 64){return 'img/dispatch/fl/context/t64.png';}
                                        else if(t.type == 65){return 'img/dispatch/fl/context/t65.png';}
                                        else if(t.type == 66){return 'img/dispatch/fl/context/t66.png';}
                                        else if(t.type == 67){return 'img/dispatch/fl/context/t67.png';}
                                        else if(t.type == 68){return 'img/dispatch/fl/context/t68.png';}
                                        else if(t.type == 69){return 'img/dispatch/fl/context/t69.png';}
                                        else if(t.type == 70){return 'img/dispatch/fl/context/t70.png';}
                                        else if(t.type == 71){return 'img/dispatch/fl/context/t71.png';}
                                        else if(t.type == 72){return 'img/dispatch/fl/context/t72.png';}
                                        else if(t.type == 73){return 'img/dispatch/fl/context/t73.png';}
                                        else if(t.type == 74){return 'img/dispatch/fl/context/t74.png';}
                                        else if(t.type == 75){return 'img/dispatch/fl/context/t75.png';}
                                        else if(t.type == 76){return 'img/dispatch/fl/context/t76.png';}
                                        else if(t.type == 77){return 'img/dispatch/fl/context/t77.png';}
                                    }
                                })
                            )),
                            $(go.Panel, "Auto",{margin: new go.Margin(10, 6, 4, 48),width:62},
                                $(go.TextBlock,
                                    {
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe'
                                    },
                                    new go.Binding("text").makeTwoWay()
                                )
                            ),
                            $(go.Panel, "Auto",{alignment:go.Spot.TopRight,margin: new go.Margin(1, 1, 0, 0)},
                                $(go.Shape, "Rectangle",
                                    {fill: "#091016", stroke: null,width:24,height:16}),
                                $(go.Picture, {
                                        width: 14, height: 8
                                    },
                                    new go.Binding("source", "", function(t) {
                                         if(t.sd_job_bean.pre_job_list) return 'img/dispatch/fl/fl_pre.png';
                                    }),
                                    new go.Binding("visible", "", function(c) {
                                        if(c.sd_job_bean.pre_job_list.length != 0){
                                            return true;
                                        }
                                        if(c.sd_job_bean.pre_job_list == 0){
                                            return false;
                                        }
                                    })
                                )
                            )
                        ),
                        makePort("T", go.Spot.Top, true, true),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("3",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,cursor: "pointer",},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016", stroke: "#164957", strokeWidth:1}),
                            //new go.Binding("figure", "figure")),
                                $(go.Picture,
                                    new go.Binding("source", "", function(t) {
                                        if(t.sd_job_bean.sdwork_cn_name){
                                            return 'img/dispatch/fl/context/condition.png';
                                        }else{
                                            return 'img/dispatch/fl/context/condition_un.png';
                                        }

                                    })
                                )

                        ),
                        makePort("T", go.Spot.Top, false, true),
                        makePort("B", go.Spot.Bottom, true, true),
                        makePort("L", go.Spot.Left, true, true),
                        makePort("R", go.Spot.Right, true, true)
                    ));
                myDiagram.nodeTemplateMap.add("4",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,cursor: "pointer",},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016", stroke: "#164957", strokeWidth:1}),
                            //new go.Binding("figure", "figure")),
                            $(go.Picture,
                                new go.Binding("source", "", function(t) {
                                    if(t.sd_job_bean.sdwork_cn_name){
                                        return 'img/dispatch/fl/context/rep.png';
                                    }else{
                                        return 'img/dispatch/fl/context/rep_un.png';
                                    }

                                })
                            )

                        ),
                        makePort("T", go.Spot.Top, true, true),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("5",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,cursor: "pointer",},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016", stroke: "#164957", strokeWidth:1,}),
                            //new go.Binding("figure", "figure")),
                            $(go.Picture,
                                new go.Binding("source", "", function(t) {
                                    if(t.sd_job_bean.sdwork_cn_name){
                                        return 'img/dispatch/fl/context/stop.png';
                                    }else{
                                        return 'img/dispatch/fl/context/stop_un.png';
                                    }
                                })
                            )

                        ),
                        makePort("T", go.Spot.Top, true, true),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("1",
                    $(go.Node, "Spot", nodeStyle(),
                        {
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                {width:26,height:26, fill: "#091016", stroke: "#194C5A",strokeWidth:2,cursor: "pointer"})
                        ),
                        // three named ports, one on each side except the top, all output only:
                        makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("2",
                    $(go.Node, "Spot", nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                {width:25,height:25, fill: null, stroke: "#194C5A",strokeWidth:2}),
                            $(go.Panel, "Auto",
                                $(go.Shape, "Circle",
                                    {width:14,height:14, fill: "#194C5A", stroke: null})
                                )

                        ),
                        // three named ports, one on each side except the bottom, all input only:
                        makePort("T", go.Spot.Top, false, true)
                    ));
                // this function is used to highlight a Group that the selection may be dropped into
                function highlightGroup(e, grp, show) {
                    if (!grp) return;
                    e.handled = true;
                    if (show) {
                        // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
                        // instead depend on the DraggingTool.draggedParts or .copiedParts
                        var tool = grp.diagram.toolManager.draggingTool;
                        var map = tool.draggedParts || tool.copiedParts;  // this is a Map
                        // now we can check to see if the Group will accept membership of the dragged Parts
                        if (grp.canAddMembers(map.toKeySet())) {
                            grp.isHighlighted = true;
                            return;
                        }
                    }
                    grp.isHighlighted = false;
                }

                // Upon a drop onto a Group, we try to add the selection as members of the Group.
                // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
                // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
                function finishDrop(e, grp) {
                    var ok = (grp !== null
                        ? grp.addMembers(grp.diagram.selection, true)
                        : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
                    if (!ok || myDiagram.model.selectedNodeData.type == 6 || myDiagram.model.selectedNodeData.type == 4 || myDiagram.model.selectedNodeData.type == 5) {
                            e.diagram.currentTool.doCancel();
                        $timeout(function(){
                            myDiagram.clearSelection();
                            scope.jobConfig = false;
                        },20);
                    }else{
                        var _group_list = [];
                        for(var i = 0 ; i < myDiagram.model.nodeDataArray.length; i++){
                            if(myDiagram.model.nodeDataArray[i].group){
                                _group_list.push(myDiagram.model.nodeDataArray[i].key);
                            }
                        }
                        var _linkDataArray = angular.copy(myDiagram.model.linkDataArray);
                        //清除组内的连线
                        $timeout(function(){
                            for(var i =_linkDataArray.length-1 ; i >= 0 ; i--){
                                for(var j = 0; j <_group_list.length; j++){
                                    if(_linkDataArray.length != 0){
                                        if(_linkDataArray[i].from == _group_list[j] || _linkDataArray[i].to == _group_list[j]){
                                            myDiagram.model.removeLinkData(myDiagram.model.linkDataArray[i]);
                                        }
                                    }
                                }
                            }
                        },200);
                    }
                }
                myDiagram.groupTemplateMap.add("6",
                    $(go.Group, "Auto", nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_node);
                            },
                        },
                        {
                            //isShadowed: true,
                            //background: "transparent",
                            // highlight when dragging into the Group
                            mouseDragEnter: function (e, grp, prev) {
                                highlightGroup(e, grp, true);
                            },
                            mouseDragLeave: function (e, grp, next) {
                                highlightGroup(e, grp, false);
                            },
                            computesBoundsAfterDrag: true,
                            // when the selection is dropped into a Group, add the selected Parts into that Group;
                            // if it fails, cancel the tool, rolling back any changes
                            mouseDrop: finishDrop,
                            handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
                            // Groups containing Groups lay out their members horizontally
                            layout: $(go.GridLayout,
                                {
                                    wrappingWidth: Infinity, alignment: go.GridLayout.Position,
                                    cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
                                }
                            )
                        },
                        $(go.Shape, "RoundedRectangle",
                            {fill: "#091016", stroke: "#164957", strokeWidth: 1}),
                        $(go.Panel, "Vertical", {margin:-2}, // title above Placeholder
                            $(go.Panel, "Horizontal",  // button next to TextBlock
                                {stretch: go.GraphObject.Horizontal, background: "#1F3144",padding:4},
                                //$("SubGraphExpanderButton",
                                //    {alignment: go.Spot.Right, margin: 5}),
                                $(go.Panel, "Auto",
                                    $(go.Shape,"Circle",
                                        {
                                            width: 25, height: 25,
                                            fill: "#091016",
                                            stroke: "#1F3144",
                                        }),
                                    $(go.TextBlock,
                                        {
                                            font: "14px Microsoft YaHei",
                                            opacity: 0.75,
                                            stroke: "#d2f1fe",
                                        },
                                        new go.Binding("text", "grid",function(t){
                                            if(t != 0){
                                                _group_index = parseInt(t);
                                                return t;
                                            }else{
                                                return _group_index;
                                            }
                                        }).makeTwoWay()
                                    )
                                ),
                                $(go.TextBlock,
                                    {
                                        alignment: go.Spot.Left,
                                        editable: true,
                                        margin: 5,
                                        font: "14px Microsoft YaHei",
                                        opacity: 0.75,
                                        stroke: "#61a1b8"
                                    },
                                    new go.Binding("text", "text").makeTwoWay()
                                )
                            ),  // end Horizontal Panel
                            $(go.Placeholder,
                                {padding: 20, alignment: go.Spot.TopLeft})
                        ), // end Vertical Panel
                        makePort("T", go.Spot.Top, true, true),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));  // end Group and call to add to template Map

                myDiagram.linkTemplate =
                    $(go.Link,
                        $(go.Shape,{stroke: "gray",fill:"gray"}),
                        $(go.Shape, { toArrow: "Standard" ,stroke: null,fill:"gray"}),
                        $(go.Panel, "Auto",  // this whole Panel is a link label
                            {visible: false, name: "LABEL"},
                            new go.Binding("visible", "visible").makeTwoWay(),
                            $(go.Shape, "RoundedRectangle", { fill: "#091016", stroke: "null" }),
                            $(go.TextBlock, "判断条件",  // the label
                                {
                                    textAlign: "center",
                                    font: "10pt helvetica, arial, sans-serif",
                                    stroke: "#d2f1fe",
                                    editable: true,

                                },
                                new go.Binding("text").makeTwoWay()
                            )
                        )
                    );
                // Make link labels visible if coming out of a "conditional" node.
                // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
                function showLinkLabel(e) {
                    var label = e.subject.findObject("LABEL");
                    if (label !== null) label.visible = (e.subject.fromNode.data.type === 4);
                };
                myDiagram.addDiagramListener("ChangedSelection", function(){
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                    if(!myDiagram.model.selectedNodeData){
                            scope.jobConfig = false;
                    }else{
                        if(myDiagram.model.selectedNodeData.type != 3){
                            scope.selectNode = myDiagram.model.selectedNodeData;
                            scope.jobConfig = true;
                            scope.config({key:myDiagram.model.selectedNodeData});
                        }
                    }
                });
                // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
                myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
                myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
                load();  // load an initial diagram from some JSON text
                // initialize the Palette that is on the left side of the page
                var myPalette0 =
                    $(go.Palette, "myPaletteDiv0", {padding:2}, // must name or refer to the DIV HTML element
                        {
                            "animationManager.duration": 600, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.condition_list),
                            allowResize: true,
                            mouseDragOver :function(){}
                        }
                    );
                myPalette0.groupTemplate =
                    $(go.Group, "Vertical",{
                            locationSpot: go.Spot.LeftCenter,
                            selectionAdorned: false,
                            width:60,height:60,
                        },
                        $(go.Panel, "Vertical",{margin:new go.Margin(-34, 0, 0, 0)},
                            $(go.Shape, "RoundedRectangle", {
                                    fill: "transparent", width: 60, height: 56,
                                    cursor: "pointer", stroke: null
                                }
                            ),
                            $(go.Picture, {
                                    width: 38, height: 38,
                                    margin: new go.Margin(-14, 0, 0, 0),
                                },
                                new go.Binding("source", "type", function(t) {
                                    return 'img/dispatch/fl/palette/group.png';
                                })
                            ),
                            $(go.TextBlock, "Yes",  // the label
                                {
                                    textAlign: "center",
                                    font: '12px Microsoft YaHei',
                                    stroke: '#61A1B8',
                                    editable: true,
                                    name:'TEXT'
                                },
                                new go.Binding("text").makeTwoWay()
                            )
                        ),
                        palNodeStyle()
                        // no ports, because no links are allowed to connect with a comment
                    );
                myPalette0.nodeTemplate =
                    $(go.Node, "Vertical",{
                            locationSpot: go.Spot.Left,
                            selectionAdorned: false,
                            width:60,height:60,
                        },
                        $(go.Panel, "Vertical",{margin:new go.Margin(-34, 0, 0, 0)},
                            $(go.Shape, "RoundedRectangle", {
                                    fill: "transparent", width: 60, height: 56,
                                    cursor: "pointer",stroke: null,
                                }
                            ),
                            $(go.Picture, {
                                    width: 38, height: 38,
                                    margin: new go.Margin(-14, 0, 0, 0),
                                    cursor: "pointer",
                                    background:"transparent",
                                },
                                new go.Binding("source", "type", function(t) {
                                    if(t == 1){return 'img/dispatch/fl/palette/start.png';}
                                    else if(t == 2){return 'img/dispatch/fl/palette/end.png';}
                                    else if(t == 3){return 'img/dispatch/fl/palette/group.png';}
                                    else if(t == 4){return 'img/dispatch/fl/palette/condition.png';}
                                    else if(t == 5){return 'img/dispatch/fl/palette/stop.png';}
                                    else if(t == 6){return 'img/dispatch/fl/palette/rep.png';}
                                    else if(t == 7){return 'img/dispatch/fl/palette/ftp_u.png';}
                                    else if(t == 8){return 'img/dispatch/fl/palette/ftp_d.png';}
                                    else if(t == 9){return 'img/dispatch/fl/palette/sftp_u.png';}
                                    else if(t == 10){return 'img/dispatch/fl/palette/sftp_d.png';}
                                    else if(t == 11){return 'img/dispatch/fl/palette/agnt_u.png';}
                                    else if(t == 12){return 'img/dispatch/fl/palette/agnt_d.png';}
                                    else if(t == 13){return 'img/dispatch/fl/palette/copy.png';}
                                    else if(t == 14){return 'img/dispatch/fl/palette/sql.png';}
                                    else if(t == 15){return 'img/dispatch/fl/palette/sql_s.png';}
                                    else if(t == 16){return 'img/dispatch/fl/palette/net.png';}
                                    else if(t == 17){return 'img/dispatch/fl/palette/sys_start.png';}
                                    else if(t == 18){return 'img/dispatch/fl/palette/sys_end.png';}
                                    else if(t == 19){return 'img/dispatch/fl/palette/python.png';}
                                    else if(t == 20){return 'img/dispatch/fl/palette/shell.png';}
                                    else if(t == 21){return 'img/dispatch/fl/palette/bat.png';}
                                    else if(t == 22){return 'img/dispatch/fl/palette/ruby.png';}
                                    else if(t == 23){return 'img/dispatch/fl/palette/perl.png';}
                                    else if(t == 24){return 'img/dispatch/fl/palette/web.png';}
                                    else if(t == 25){return 'img/dispatch/fl/palette/tcp.png';}
                                    else if(t == 26){return 'img/dispatch/fl/palette/http.png';}
                                    else if(t == 27){return 'img/dispatch/fl/palette/tux.png';}
                                    else if(t == 28){return 'img/dispatch/fl/palette/cl.png';}
                                    else if(t == 29){return 'img/dispatch/fl/palette/rpg.png';}
                                    else if(t == 30){return 'img/dispatch/fl/palette/java.png';}
                                    else if(t == 31){return 'img/dispatch/fl/palette/c.png';}
                                    else if(t == 32){return 'img/dispatch/fl/palette/c++.png';}
                                    else if(t == 33){return 'img/dispatch/fl/context/site.png';}
                                    else if(t == 34){return 'img/dispatch/fl/context/area.png';}
                                    else if(t == 35){return 'img/dispatch/fl/context/cell.png';}
                                    else if(t == 36){return 'img/dispatch/fl/context/unit.png';}
                                    else if(t == 37){return 'img/dispatch/fl/context/enterprise.png';}
                                    else if(t == 38){return 'img/dispatch/fl/context/t38.png';}
                                    else if(t == 39){return 'img/dispatch/fl/context/t39.png';}
                                    else if(t == 40){return 'img/dispatch/fl/context/t40.png';}
                                    else if(t == 41){return 'img/dispatch/fl/context/t41.png';}
                                    else if(t == 42){return 'img/dispatch/fl/context/t42.png';}
                                    else if(t == 43){return 'img/dispatch/fl/context/t43.png';}
                                    else if(t == 44){return 'img/dispatch/fl/context/t44.png';}
                                    else if(t == 45){return 'img/dispatch/fl/context/t45.png';}
                                    else if(t == 46){return 'img/dispatch/fl/context/t46.png';}
                                    else if(t == 47){return 'img/dispatch/fl/context/t47.png';}
                                    else if(t == 48){return 'img/dispatch/fl/context/t48.png';}
                                    else if(t == 49){return 'img/dispatch/fl/context/t49.png';}
                                    else if(t == 50){return 'img/dispatch/fl/context/t50.png';}
                                    else if(t == 51){return 'img/dispatch/fl/context/t51.png';}
                                    else if(t == 52){return 'img/dispatch/fl/context/t52.png';}
                                    else if(t == 53){return 'img/dispatch/fl/context/t53.png';}
                                    else if(t == 54){return 'img/dispatch/fl/context/t54.png';}
                                    else if(t == 55){return 'img/dispatch/fl/context/t55.png';}
                                    else if(t == 56){return 'img/dispatch/fl/context/t56.png';}
                                    else if(t == 57){return 'img/dispatch/fl/context/t57.png';}
                                    else if(t == 58){return 'img/dispatch/fl/context/t58.png';}
                                    else if(t == 59){return 'img/dispatch/fl/context/t59.png';}
                                    else if(t == 60){return 'img/dispatch/fl/context/t60.png';}
                                    else if(t == 61){return 'img/dispatch/fl/context/t61.png';}
                                    else if(t == 62){return 'img/dispatch/fl/context/t61.png';}
				    else if(t == 63){return 'img/dispatch/fl/context/t63.png';}
                                    else if(t == 64){return 'img/dispatch/fl/context/t64.png';}
                                    else if(t == 65){return 'img/dispatch/fl/context/t65.png';}
                                    else if(t == 66){return 'img/dispatch/fl/context/t66.png';}
                                    else if(t == 67){return 'img/dispatch/fl/context/t67.png';}
                                    else if(t == 68){return 'img/dispatch/fl/context/t68.png';}
                                    else if(t == 69){return 'img/dispatch/fl/context/t69.png';}
                                    else if(t == 70){return 'img/dispatch/fl/context/t70.png';}
                                    else if(t == 71){return 'img/dispatch/fl/context/t71.png';}
                                    else if(t == 72){return 'img/dispatch/fl/context/t72.png';}
                                    else if(t == 73){return 'img/dispatch/fl/context/t73.png';}
                                    else if(t == 74){return 'img/dispatch/fl/context/t74.png';}
                                    else if(t == 75){return 'img/dispatch/fl/context/t75.png';}
                                    else if(t == 76){return 'img/dispatch/fl/context/t76.png';}
                                    else if(t == 77){return 'img/dispatch/fl/context/t77.png';}

                                })
                            ),
                            $(go.TextBlock, "Yes",  // the label
                                {
                                    textAlign: "center",
                                    font: '12px Microsoft YaHei',
                                    stroke: '#61A1B8',
                                    editable: true,
                                    name:'TEXT'
                                },
                                new go.Binding("text").makeTwoWay()
                            ),
                            {
                                toolTip:  // define a tooltip for each node that displays the color as text
                                    $(go.Adornment, "Auto",
                                        $(go.Shape, { fill: "#091016",stroke:'#d2f1fe',strokeWidth:1}),
                                        $(go.TextBlock, { margin: 4 , stroke: '#d2f1fe'},
                                            new go.Binding("text", "text")),
                                            new go.Binding("visible", "text", function(c) {
                                                return c !== '';
                                            })
                                    )  // end of Adornment
                            }
                        ),
                        palNodeStyle()
                        // three named ports, one on each side except the top, all output only:
                    );


                var myPalette1 =
                    $(go.Palette, "myPaletteDiv1",{padding:new go.Margin(0,0,0,0),layout: $(go.GridLayout,{
                            arrangement: go.GridLayout.LeftToRight,
                            spacing: new go.Size(3, 3)
                        })}, // must name or refer to the DIV HTML element  // must name or refer to the DIV HTML element
                        {
                            initialDocumentSpot : go.Spot.Left,
                            initialContentAlignment:go.Spot.Left,
                            initialViewportSpot:go.Spot.TopLeft,
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.polling_list),
                            nodeTemplate: myPalette0.nodeTemplate,
                            allowResize: true,
                            mouseDragOver :function(){}
                        }
                    );
                var myPalette2 =
                    $(go.Palette, "myPaletteDiv2", {padding:2}, // must name or refer to the DIV HTML element
                        {
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.file_list),
                            nodeTemplate: myPalette0.nodeTemplate,
                            allowResize: true,
                            mouseDragOver :function(){}
                        }
                    );
                var myPalette3 =
                    $(go.Palette, "myPaletteDiv3",{padding:2},  // must name or refer to the DIV HTML element
                        {
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.db_list),
                            nodeTemplate: myPalette0.nodeTemplate,
                            allowResize: true,
                            mouseDragOver :function(){}
                        }
                    );
                var myPalette4 =
                    $(go.Palette, "myPaletteDiv4", {padding:new go.Margin(0,0,0,0),layout: $(go.GridLayout,{
                            arrangement: go.GridLayout.LeftToRight,
                            spacing: new go.Size(3, 3)
                        })}, // must name or refer to the DIV HTML element
                        {
                            initialDocumentSpot : go.Spot.Left,
                            initialContentAlignment:go.Spot.Left,
                            initialViewportSpot:go.Spot.TopLeft,
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.web_list),
                            nodeTemplate: myPalette0.nodeTemplate,
                            //allowResize: true,
                            mouseDragOver :function(){},
                            //initialPosition :go.Point(0, 0),
                        }
                    );
                var myPalette5 =
                    $(go.Palette, "myPaletteDiv5",{padding:2},  // must name or refer to the DIV HTML element
                        {
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.apply_list),
                            nodeTemplate: myPalette0.nodeTemplate,
                            allowResize: true,
                            mouseDragOver :function(){}
                        }
                    );
                var myPalette6 =
                    $(go.Palette, "myPaletteDiv6", {padding:2}, // must name or refer to the DIV HTML element
                        {
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.shell_list),
                            nodeTemplate: myPalette0.nodeTemplate,
                            allowResize: true,
                            mouseDragOver :function(){}
                        }
                    );
                var myPalette7 =
                    $(go.Palette, "myPaletteDiv7",{padding:2},  // must name or refer to the DIV HTML element
                        {
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.webS_list),
                            allowResize: true,
                            nodeTemplate: myPalette0.nodeTemplate,
                            mouseDragOver :function(){}
                        }
                    );
                var myPalette8 =
                    $(go.Palette, "myPaletteDiv8",{padding:2},  // must name or refer to the DIV HTML element
                        {
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette_list.other_list),
                            nodeTemplate: myPalette0.nodeTemplate,
                            allowResize: true,

                        }
                    );

                scope.$watch('pal_data.list_stu',function(now){
                    if(now){
                        var myPalette20 =
                            $(go.Palette, "zaozhi",{padding:2},  // must name or refer to the DIV HTML element
                                {
                                    "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                    model: new go.GraphLinksModel(palette_list.zaozhi),
                                    nodeTemplate: myPalette0.nodeTemplate,
                                    allowResize: true,

                                }
                            );
                        var myPalette21 =
                            $(go.Palette, "yancao",{padding:2},  // must name or refer to the DIV HTML element
                                {
                                    "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                    model: new go.GraphLinksModel(palette_list.yancao),
                                    nodeTemplate: myPalette0.nodeTemplate,
                                    allowResize: true,

                                }
                            );
                        var myPalette22 =
                            $(go.Palette, "s95",{padding:2},  // must name or refer to the DIV HTML element
                                {
                                    "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                    model: new go.GraphLinksModel(palette_list.s95data),
                                    nodeTemplate: myPalette0.nodeTemplate,
                                    allowResize: true,

                                }
                            );
                    }
                })

                scope.$watch('pal_data.tab_stu',function(now){
                    if(now == 1){
                        setTimeout(function(){
                            var myPalette23 =
                                $(go.Palette, "Modeling",{padding:2},  // must name or refer to the DIV HTML element
                                    {
                                        "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                        model: new go.GraphLinksModel(palette_list.Modeling),
                                        nodeTemplate: myPalette0.nodeTemplate,
                                        allowResize: true,
                                    }
                                );
                        },1000)
                    }
                })
                scope.$watch('pal_data.tab_stus',function(now){
                    if(now == 1){
                        console.log(now)
                        setTimeout(function(){
                            var myPalette23 =
                                $(go.Palette, "Modelings",{padding:2},  // must name or refer to the DIV HTML element
                                    {
                                        "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                        model: new go.GraphLinksModel(palette_list.Modeling),
                                        nodeTemplate: myPalette0.nodeTemplate,
                                        allowResize: true,
                                    }
                                );
                        },1000)
                    }
                })

                scope.$watch('pal_data.treeStu.num',function(now){
                    if(now>0){
                        for(var i=0;i<scope.pal_data[scope.pal_data.treeStu.name].length;i++){
                            tree(scope.pal_data[scope.pal_data.treeStu.name][i].num,scope.pal_data[scope.pal_data.treeStu.name][i].data);
                        }
                    }
                },true)

                scope.$watch('pal_data.treeOneStu.num',function(now){
                    if(now>0){
                        for(var v=0;v<scope.pal_data[scope.pal_data.treeOneStu.name].length;v++){
                            if(!scope.pal_data[scope.pal_data.treeOneStu.name][v].re&&scope.pal_data[scope.pal_data.treeOneStu.name][v].stu){
                                for(var i=0;i<scope.pal_data[scope.pal_data.treeOneStu.name][v].child.length;i++){
                                    treeOne(scope.pal_data[scope.pal_data.treeOneStu.name][v].child[i].num,
                                        scope.pal_data[scope.pal_data.treeOneStu.name][v].child[i].data);
                                    scope.pal_data[scope.pal_data.treeOneStu.name][v].re = true;
                                }
                            }
                        }
                    }
                },true)

                scope.$watch('pal_data.treeTwoStu.num',function(now){
                    if(now>0){
                        for(var v=0;v<scope.pal_data[scope.pal_data.treeTwoStu.name].length;v++){
                            for(var i=0;i<scope.pal_data[scope.pal_data.treeTwoStu.name][v].child.length;i++){
                                if(!scope.pal_data[scope.pal_data.treeTwoStu.name][v].child[i].re&&scope.pal_data[scope.pal_data.treeTwoStu.name][v].child[i].stu){
                                    for(var k=0;k<scope.pal_data[scope.pal_data.treeTwoStu.name][v].child[i].child.length;k++){
                                        treeTwo(scope.pal_data[scope.pal_data.treeTwoStu.name][v].child[i].child[k].num,
                                            scope.pal_data[scope.pal_data.treeTwoStu.name][v].child[i].child[k].data);
                                        scope.pal_data[scope.pal_data.treeTwoStu.name][v].child[i].re = true;
                                    }
                                }
                            }
                        }
                    }
                },true)

                scope.$watch('pal_data.treeInfo.num',function(now){
                    if(now>0){
                        for(var v=0;v<scope.pal_data[scope.pal_data.treeInfo.name].length;v++){
                            for(var i=0;i<scope.pal_data[scope.pal_data.treeInfo.name][v].child.length;i++){
                                for(var k=0;k<scope.pal_data[scope.pal_data.treeInfo.name][v].child[i].child.length;k++){
                                    if(!scope.pal_data[scope.pal_data.treeInfo.name][v].child[i].child[k].re&&scope.pal_data[scope.pal_data.treeInfo.name][v].child[i].child[k].stu){
                                        for(var j=0;j<scope.pal_data[scope.pal_data.treeInfo.name][v].child[i].child[k].child.length;j++){
                                            treeInfo(scope.pal_data[scope.pal_data.treeInfo.name][v].child[i].child[k].child[j].num,
                                                scope.pal_data[scope.pal_data.treeInfo.name][v].child[i].child[k].child[j].data);
                                            scope.pal_data[scope.pal_data.treeInfo.name][v].child[i].child[k].re = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                },true)

                function tree(v,data){
                    console.log(data);
                    var myPalette9 =
                        $(go.Palette, "myTree"+v,{padding:0},  // must name or refer to the DIV HTML element
                            {
                                "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                model: new go.GraphLinksModel(data||palette_list.hf_list),
                                allowResize: true,
                                mouseDragOver :function(){}
                            }
                        );

                    myPalette9.nodeTemplate =
                        $(go.Node, "Vertical",{
                                locationSpot: go.Spot.Left,
                                selectionAdorned: false,
                                width:180,height:25,
                                cursor: "pointer",
                                click:function(){
                                    console.log(1);
                                }
                            },
                            $(go.Panel, "Vertical",{margin:new go.Margin(-23, 100, 0, 0)},
                                $(go.Shape, "RoundedRectangle", {
                                        fill: "transparent", width: 180, height: 25,
                                        cursor: "pointer",stroke: null,
                                    }
                                ),
                                // $(go.Picture, {
                                //         width: 16, height: 16,
                                //         margin: new go.Margin(-5, 0, 0, 0),
                                //         cursor: "pointer",
                                //         background:"transparent",
                                //     },
                                //     new go.Binding("source", "type", function(t) {
                                //         return 'img/dispatch/fl/palette/open.png';
                                //     })
                                // ),
                                $(go.TextBlock, "Yes",  // the label
                                    {
                                        textAlign: "left",
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe',
                                        editable: true,
                                        name:'TEXT',
                                        cursor: "pointer",
                                    },
                                    new go.Binding("text").makeTwoWay(),
                                ),
                                {
                                    toolTip:  // define a tooltip for each node that displays the color as text
                                        $(go.Adornment, "Auto",
                                            $(go.Shape, { fill: "#091016",stroke:'#d2f1fe',strokeWidth:1}),
                                            $(go.TextBlock, { margin: 4 , stroke: '#d2f1fe'},
                                                new go.Binding("text", "text")),
                                            new go.Binding("visible", "text", function(c) {
                                                return c !== '';
                                            })
                                        )  // end of Adornment
                                }
                            ),
                            //palNodeStyle(),
                            // three named ports, one on each side except the top, all output only:
                        );
                }

                function treeOne(v,data){
                    var myPalette10 =
                        $(go.Palette, "myTreeOne"+v,{padding:0},  // must name or refer to the DIV HTML element
                            {
                                "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                model: new go.GraphLinksModel(data||palette_list.hf_list_one),
                                allowResize: true,
                                mouseDragOver :function(){},
                            }
                        );

                    myPalette10.nodeTemplate =
                        $(go.Node, "Vertical",{
                                locationSpot: go.Spot.Left,
                                selectionAdorned: false,
                                width:180,height:25,
                                cursor: "pointer"
                            },
                            $(go.Panel, "Vertical",{margin:new go.Margin(-23, 60, 0, 0)},
                                $(go.Shape, "RoundedRectangle", {
                                        fill: "transparent", width: 180, height: 25,
                                        cursor: "pointer",stroke: null,
                                    }
                                ),

                                $(go.TextBlock, "Yes",  // the label
                                    {
                                        textAlign: "left",
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe',
                                        editable: true,
                                        name:'TEXT',
                                        cursor: "pointer",
                                    },
                                    new go.Binding("text").makeTwoWay(),
                                ),
                                {
                                    toolTip:  // define a tooltip for each node that displays the color as text
                                        $(go.Adornment, "Auto",
                                            $(go.Shape, { fill: "#091016",stroke:'#d2f1fe',strokeWidth:1}),
                                            $(go.TextBlock, { margin: 4 , stroke: '#d2f1fe'},
                                                new go.Binding("text", "text")),
                                            new go.Binding("visible", "text", function(c) {
                                                return c !== '';
                                            })
                                        )  // end of Adornment
                                }
                            ),
                            //palNodeStyle(),
                            // three named ports, one on each side except the top, all output only:
                        );
                }

                function treeTwo(v,data){
                    console.log(data);
                    var myPalette11 =
                        $(go.Palette, "myTreeTwo"+v,{padding:0},  // must name or refer to the DIV HTML element
                            {
                                "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                model: new go.GraphLinksModel(data||palette_list.hf_list_two),
                                allowResize: true,
                                mouseDragOver :function(){},
                            }
                        );

                    myPalette11.nodeTemplate =
                        $(go.Node, "Vertical",{
                                locationSpot: go.Spot.Left,
                                selectionAdorned: false,
                                width:180,height:25,
                                cursor: "pointer"
                            },
                            $(go.Panel, "Vertical",{margin:new go.Margin(-23, 20, 0, 0)},
                                $(go.Shape, "RoundedRectangle", {
                                        fill: "transparent", width: 180, height: 25,
                                        cursor: "pointer",stroke: null,
                                    }
                                ),

                                $(go.TextBlock, "Yes",  // the label
                                    {
                                        textAlign: "left",
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe',
                                        editable: true,
                                        name:'TEXT',
                                        cursor: "pointer",
                                    },
                                    new go.Binding("text").makeTwoWay(),
                                ),
                                {
                                    toolTip:  // define a tooltip for each node that displays the color as text
                                        $(go.Adornment, "Auto",
                                            $(go.Shape, { fill: "#091016",stroke:'#d2f1fe',strokeWidth:1}),
                                            $(go.TextBlock, { margin: 4 , stroke: '#d2f1fe'},
                                                new go.Binding("text", "text")),
                                            new go.Binding("visible", "text", function(c) {
                                                return c !== '';
                                            })
                                        )  // end of Adornment
                                }
                            ),
                            //palNodeStyle(),
                            // three named ports, one on each side except the top, all output only:
                        );
                }

                function treeInfo(v,data){
                    var myPalette12 =
                        $(go.Palette, "info"+v,{padding:0},  // must name or refer to the DIV HTML element
                            {
                                "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                model: new go.GraphLinksModel(data||palette_list.hf_list_info),
                                allowResize: true,
                                mouseDragOver :function(){},
                            }
                        );

                    myPalette12.nodeTemplate =
                        $(go.Node, "Vertical",{
                                locationSpot: go.Spot.Left,
                                selectionAdorned: false,
                                width:180,height:25,
                                cursor: "pointer"
                            },
                            $(go.Panel, "Vertical",{margin:new go.Margin(-23, -40, 0, 0)},
                                $(go.Shape, "RoundedRectangle", {
                                        fill: "transparent", width: 180, height:25,
                                        cursor: "pointer",stroke: null,
                                    }
                                ),

                                $(go.TextBlock, "Yes",  // the label
                                    {
                                        textAlign: "left",
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe',
                                        editable: true,
                                        name:'TEXT',
                                        cursor: "pointer",
                                    },
                                    new go.Binding("text").makeTwoWay(),
                                ),
                                {
                                    toolTip:  // define a tooltip for each node that displays the color as text
                                        $(go.Adornment, "Auto",
                                            $(go.Shape, { fill: "#091016",stroke:'#d2f1fe',strokeWidth:1}),
                                            $(go.TextBlock, { margin: 4 , stroke: '#d2f1fe'},
                                                new go.Binding("text", "text")),
                                            new go.Binding("visible", "text", function(c) {
                                                return c !== '';
                                            })
                                        )  // end of Adornment
                                }
                            ),
                            //palNodeStyle(),
                            // three named ports, one on each side except the top, all output only:
                        );
                }


               //私有元素Palette(左侧面板)
                var drawPrivatePalette = function(){
                    if(document.getElementById('privatePaletteDiv') === null) return;
                    privatePalette =
                        $(go.Palette, "privatePaletteDiv",{padding:2},  // must name or refer to the DIV HTML element
                            {
                                initialDocumentSpot : go.Spot.Left,
                                initialViewportSpot:go.Spot.TopLeft,
                                initialContentAlignment:go.Spot.Left,
                                "toolManager.hoverDelay": 200,     //toolTip 200 milliseconds
                                "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                model: new go.GraphLinksModel(private_palette_list),
                                nodeTemplate: myPalette0.nodeTemplate,
                                allowResize: true,
                                mouseDragOver :function(){},
                                "ModelChanged": function(e) {
                                    if (e.isTransactionFinished){
                                        dynamicHeight("privatePaletteDiv",scope.pal_data.private_palette_list.length);
                                    }
                                }
                            }
                        );
                };
                //初始化私有元素Palette
                drawPrivatePalette();

               //绘制场景元素Palette
               var drawScenePalette = function(scenePaletteDivId,_category){
                   $(go.Palette,scenePaletteDivId,{padding:2},  // must name or refer to the DIV HTML element
                       {
                           initialDocumentSpot : go.Spot.Left,
                           initialViewportSpot:go.Spot.TopLeft,
                           initialContentAlignment:go.Spot.Left,
                           "toolManager.hoverDelay": 200,     //toolTip 200 milliseconds
                           "animationManager.duration": 800, // slightly longer than default (600ms) animation
                           model: new go.GraphLinksModel(_category.element_list),
                           nodeTemplate: myPalette0.nodeTemplate,
                           allowResize: true,
                           mouseDragOver :function(){},
                           "ModelChanged": function(e) {
                               if (e.isTransactionFinished){ }
                           }

                       }
                   );
               };

                //场景元素Palette(左侧面板)
               //初始化场景元素Palette
                var asyncDrawScenePalette = function(scenePaletteDivId,_category){
                    if(scenePaletteDivId){
                        $timeout(function(){
                            drawScenePalette(scenePaletteDivId,_category);
                            dynamicHeight(scenePaletteDivId,_category.element_list.length);
                        },10)
                    }
                };
                //监控场景元素列表
                scope.$watch('pal_data.scene_palette_list.length',function(newValue,oldValue){
                    if(newValue && newValue > oldValue){ //列表长度增加
                        for(var i = oldValue; i < newValue; i++){
                            var _new_scene = scope.pal_data.scene_palette_list[i];
                            _new_scene.category_list = _new_scene.category_list ? _new_scene.category_list : [];
                            for(var j = 0; j < _new_scene.category_list.length; j++){
                                var _category = _new_scene.category_list[j];
                                _category.element_list = _category.element_list ? _category.element_list : [];
                                var scenePaletteDivId = 'scenePaletteDiv' + i + '-' + j;
                                if(document.getElementById(scenePaletteDivId)) continue;
                                asyncDrawScenePalette(scenePaletteDivId,_category);
                            }
                        }
                       // console.log('场景元素列表变化')
                    }
                });


                // The following code overrides GoJS focus to stop the browser from scrolling
                // the page when either the Diagram or Palette are clicked or dragged onto.
                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }
                myDiagram.doFocus = customFocus;
                //myPalette.doFocus = customFocus;
            } // end init
            // Make all ports on a node visible when the mouse is over the node
            function showPorts(node, show) {
                var diagram = node.diagram;
                if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
                node.ports.each(function (port) {
                    port.stroke = (show ? "#999999" : null);
                });
            }
            function load() {
                myDiagram.model = go.Model.fromJson(scope.model);
            }
            //// update the Angular model when the Diagram.selection changes
            function updateSelection(e) {
                myDiagram.model.selectedNodeData = null;
                var it = myDiagram.selection.iterator;
                while (it.next()) {
                    var selnode = it.value;
                    // ignore a selected link or a deleted node
                    if (selnode instanceof go.Node && selnode.data !== null) {
                        myDiagram.model.selectedNodeData = selnode.data;
                        break;
                    }
                }
                scope.$applyAsync();  //手动更新页面
            }

            var layout = function() {
                myDiagram.startTransaction("change Layout");
                myDiagram.layout.isOngoing  = true;
                myDiagram.layout = new DemoForceDirectedLayout();
                myDiagram.layout.treeStyle = go.TreeLayout.StyleLayered;
                myDiagram.layout.layerStyle = go.TreeLayout.LayerSiblings;
                myDiagram.layout.angle = 90;
                myDiagram.layout.alignment = go.TreeLayout.AlignmentCenterChildren;
                myDiagram.layout.arrangementSpacing = new go.Size(20,40);
                myDiagram.layout.layerSpacing = 50;
                myDiagram.layout.isOngoing  = false;
                myDiagram.commitTransaction("change Layout");
            }
            var rebuildGraph = function(){
                generateTree();
            }
            function generateTree() {
                myDiagram.startTransaction("generateTree");
                var _nodeData = [];
                for(var i = 0 ; i < scope.model.nodeDataArray.length; i++){
                    _nodeData.push({
                        category:scope.model.nodeDataArray[i].category,
                        text    :scope.model.nodeDataArray[i].text,
                        key     :scope.model.nodeDataArray[i].key,
                        sd_job_bean : scope.model.nodeDataArray[i].sd_job_bean,
                        type        : scope.model.nodeDataArray[i].type,
                        grid        : scope.model.nodeDataArray[i].grid ? scope.model.nodeDataArray[i].grid : undefined,
                        isGroup        : scope.model.nodeDataArray[i].isGroup ? scope.model.nodeDataArray[i].isGroup : undefined,
                        group        : scope.model.nodeDataArray[i].group ? scope.model.nodeDataArray[i].group : undefined,

                    })
                }
                myDiagram.model.nodeDataArray = scope.model.nodeDataArray;

                var _linkData = [];
                for(var i = 0 ; i < scope.model.linkDataArray.length; i++){
                    _linkData.push({ from: scope.model.linkDataArray[i].from, to: scope.model.linkDataArray[i].to});
                }
                myDiagram.model.linkDataArray = scope.model.linkDataArray;
                layout();
                myDiagram.commitTransaction("generateTree");
            }


            //动态计算面板高度
            function dynamicHeight(div_Id,nodedata_length){
                var _div = document.getElementById(div_Id);
                var _row = Math.ceil(nodedata_length / 2);   //面板行数(一行两个元素)
                if(_div !== null){
                    _div.style.left = nodedata_length === 1 ? '-35px' : '0';
                    if(_row > 1){
                        _div.style.height = _row * 70 + 'px';
                    }
                }
               // console.log('面板高度已重置')
            }
            init();
            //隐藏滚动条
            $("#myEditDiagramDiv > div").css('overflow','hidden');
            //添加私有元素
            scope.$on("addPalette", function(event, data) {
                privatePalette.startTransaction("add palette");
                privatePalette.model.addNodeData(data);
                privatePalette.commitTransaction("add palette");
            });
            //更新私有元素
            scope.$on("updatePalette", function(event, data) {
                privatePalette.startTransaction("update palette");
                privatePalette.model.nodeDataArray = scope.pal_data.private_palette_list;
                privatePalette.commitTransaction("update palette");
            });
            //监控节点
            scope.$watch('model.nodeDataArray.length',function(){
                var _index_times = 0;
                for(var i = 0 ; i < scope.model.nodeDataArray.length; i++){
                    //处理组号
                    if(scope.model.nodeDataArray[i].isGroup){
                        _index_times = _index_times + 1;
                    }
                    //处理节点key值
                    if(scope.model.nodeDataArray[i].key > _node_id){
                        _node_id = scope.model.nodeDataArray[i].key;
                    }
                }

                _group_index = _index_times;
                myDiagram.startTransaction('change node');
                if(myDiagram.model.selectedNodeData){
                    if(myDiagram.model.selectedNodeData.isGroup){
                        myDiagram.model.selectedNodeData.grid = _group_index;
                    }
                }
                var node = myDiagram.findNodeForData(myDiagram.model.selectedNodeData);
                if (node !== null) {
                    node.updateTargetBindings("");
                }
                myDiagram.commitTransaction('change node');
                //scope.dealNode();
                myDiagram.clearSelection();
                scope.selectKey = 0;
            },true);
            //刷新前置的
            scope.$watch("reflashNode", function() {
                myDiagram.startTransaction('change node');
                if(myDiagram.model.selectedNodeData){
                    for(var i =0;i < scope.model.nodeDataArray.length;i++){
                        if(scope.model.nodeDataArray[i].key == myDiagram.model.selectedNodeData.key){
                            myDiagram.model.selectedNodeData.sd_job_bean = scope.model.nodeDataArray[i].sd_job_bean;
                            var node = myDiagram.findNodeForData(myDiagram.model.selectedNodeData);
                            if (node !== null) {
                                node.updateTargetBindings("");
                            }
                        }
                    }
                }
                myDiagram.commitTransaction('change node');
                //scope.dealNode();
            },true);
            //绑定选中
            scope.$watch('jobConfig',function(){
                if(!scope.jobConfig){
                    myDiagram.clearSelection();
                    scope.selectKey = 0;
                    scope.configNoData();
                    //myDiagram.select(myDiagram.findNodeForKey(-4));
                }
            },true);
            //点击实例选中 作业
            scope.$watch('selectKey',function(){
                if(scope.selectKey !=0){
                    myDiagram.select(myDiagram.findNodeForKey(scope.selectKey));
                }
            },true);
            //页面undo操作
            scope.$watch("undo",function (value) {
                scope.undo = value;
                scope.undo.invoke = function () {
                    myDiagram.undoManager.undo();
                }
            });
            scope.$watch("array",function (value) {
                $timeout(function(){
                    rebuildGraph();
                },100)
            },true);
            //页面redo操作
            scope.$watch("redo",function (value) {
                scope.redo = value;
                scope.redo.invoke = function () {
                    myDiagram.undoManager.redo();
                }
            });
        }
    };
}]);
//流程查看指令
cvDirectives.directive('cusFlowDetail',["$compile", "$timeout", function($compile,$timeout){
    return {
        restrict: 'AE',
        require: '?ngModel',
        scope: {model: '=goModel', read_only: '=readOnly',undo: '=undo', redo:'=redo',jobConfig:'=jobConfig' ,config:'&config',},
        link: function(scope, elem, attr, ctrl) {
            var myDiagram;
            var _group_index = 0;
            var _random_flag = false;
            scope.selectNode = {};
            function init() {
                var $ = go.GraphObject.make;  // for conciseness in defining templates
                myDiagram =
                    $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
                        {
                            initialContentAlignment: go.Spot.Top,
                            allowDrop: true,  // must be true to accept drops from the Palette
                            "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
                            "LinkRelinked": showLinkLabel,
                            "ChangedSelection": updateSelection,// when click your node or group then selected it
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            "undoManager.isEnabled": true,  // enable undo & redo
                            "allowResize": true,
                            autoScale:go.Diagram.UniformToFill,
                            "isReadOnly" : true, //只读属性 用于查看
                        }
                    );
                myDiagram.layout =
                    $(go.TreeLayout,
                        { angle: 90, layerSpacing: 70,nodeSpacing:110,arrangementSpacing:new go.Size(20,40),sorting: go.TreeLayout.SortingAscending
                        });

                function SqueezingTreeLayout() {
                    go.TreeLayout.call(this);
                }
                //when the document is modified, add a "*" to the title and enable the "Save" button
                myDiagram.addDiagramListener("LayoutCompleted", function (e) {
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                myDiagram.addDiagramListener("ChangedSelection", function(){
                    if(!myDiagram.model.selectedNodeData){
                        scope.jobConfig = false;
                    }else{
                        if(myDiagram.model.selectedNodeData.type != 3){
                            scope.selectNode = myDiagram.model.selectedNodeData;
                            scope.jobConfig = true;
                            scope.config({key:myDiagram.model.selectedNodeData});
                        }
                    }
                });
                // helper definitions for node templates
                function nodeStyle() {
                    return [
                        // The Node.location comes from the "loc" property of the node data,
                        // converted by the Point.parse static method.
                        // If the Node.location is changed, it updates the "loc" property of the node data,
                        // converting back using the Point.stringify static method.
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        new go.Binding("layerName", "isHighlighted", function(h) { return "Foreground"; }).ofObject(),
                        {
                            // the Node.location is at the center of each node
                            locationSpot: go.Spot.Center,
                            selectionAdorned: false,//选中修饰
                            //isShadowed: true,
                            //shadowColor: "#888",
                            // handle mouse enter/leave events to show/hide the ports
                            // mouseEnter: function (e, obj) {
                            //     showPorts(obj.part, true);
                            // },
                            // mouseLeave: function (e, obj) {
                            //     showPorts(obj.part, false);
                            // },
                            click:function(e,obj){
                                obj.part.stroke = "#CCCCCC";
                            }
                        }
                    ];
                }
                function validateLink(from, to) {
                    var _able = true;
                    for(var j = 0; j < scope.model.linkDataArray.length; j ++) {
                        var _j_link = scope.model.linkDataArray[j];
                        if(from.data.key == _j_link.from || to.data.key == _j_link.to){
                            _able = false;
                        }
                    }
                    return _able;
                }
                // Define a function for creating a "port" that is normally transparent.
                // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
                // and where the port is positioned on the node, and the boolean "output" and "input" arguments
                // control whether the user can draw links from or to the port.
                function makePort(name, spot, output, input,node) {
                    // the port is basically just a small circle that has a white stroke when it is made visible
                    return $(go.Shape, "Circle",
                        {
                            fill: "transparent",
                            stroke: "#7c8e8b",  // this is changed to "white" in the showPorts function
                            desiredSize: new go.Size(8, 8),
                            alignment: spot, alignmentFocus: spot,  // align the port on the main Shape
                            portId: name,  // declare this object to be a "port"
                            fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
                            fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
                            cursor: "pointer",  // show a different cursor to indicate potential link point
                        },new go.Binding("visible", "group", function(c) {
                            if(c == 0 || !c){
                                return true;
                            }else{
                                return false;
                            }
                        }));
                }

                // define the Node templates for regular nodes
                myDiagram.nodeTemplateMap.add("7",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        //// the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                        //new go.Binding("selectionAdorned", "selection", function(c) {
                        //    if(c) return true;
                        //    if(!c) return false;
                        //}),
                        $(go.Panel, "Auto",
                            $(go.Shape, "Rectangle",
                                {fill: "#091016", stroke: "164957",width:120,height:56}),
                            //new go.Binding("figure", "figure")),
                            $(go.Panel, "Auto",{padding:6,alignment:go.Spot.Left},
                                $(go.Picture, {
                                        width: 36, height: 36,
                                    },
                                    new go.Binding("source", "", function(t) {
                                        if(t.sd_job_bean.sdwork_cn_name){
                                            if(t.type == 6){return 'img/dispatch/fl/context/rep.png';}
                                            else if(t.type == 7){return 'img/dispatch/fl/context/ftpU.png';}
                                            else if(t.type == 8){return 'img/dispatch/fl/context/ftpD.png';}
                                            else if(t.type == 9){return 'img/dispatch/fl/context/sftpU.png';}
                                            else if(t.type == 10){return 'img/dispatch/fl/context/sftpD.png';}
                                            else if(t.type == 11){return 'img/dispatch/fl/context/zngtU.png';}
                                            else if(t.type == 12){return 'img/dispatch/fl/context/zngtD.png';}
                                            else if(t.type == 13){return 'img/dispatch/fl/context/copy.png';}
                                            else if(t.type == 14){return 'img/dispatch/fl/context/sql.png';}
                                            else if(t.type == 15){return 'img/dispatch/fl/context/sqlS.png';}
                                            else if(t.type== 16){return 'img/dispatch/fl/context/web.png';}
                                            else if(t.type == 17){return 'img/dispatch/fl/context/sysSt.png';}
                                            else if(t.type == 18){return 'img/dispatch/fl/context/sysE.png';}
                                            else if(t.type == 19){return 'img/dispatch/fl/context/python.png';}
                                            else if(t.type == 20){return 'img/dispatch/fl/context/shell.png';}
                                            else if(t.type == 21){return 'img/dispatch/fl/context/bat.png';}
                                            else if(t.type == 22){return 'img/dispatch/fl/context/rb.png';}
                                            else if(t.type== 23){return 'img/dispatch/fl/context/perl.png';}
                                            else if(t.type == 24){return 'img/dispatch/fl/context/webs.png';}
                                            else if(t.type == 25){return 'img/dispatch/fl/context/tcp.png';}
                                            else if(t.type == 26){return 'img/dispatch/fl/context/http.png';}
                                            else if(t.type == 27){return 'img/dispatch/fl/context/tux.png';}
                                            else if(t.type == 28){return 'img/dispatch/fl/context/cl.png';}
                                            else if(t.type == 29){return 'img/dispatch/fl/context/rpg.png';}
                                            else if(t.type == 30){return 'img/dispatch/fl/context/java.png';}
                                            else if(t.type == 31){return 'img/dispatch/fl/context/c.png';}
                                            else if(t.type == 32){return 'img/dispatch/fl/context/c++.png';}
                                            else if(t.type == 33){return 'img/dispatch/fl/context/site.png';}
                                            else if(t.type == 34){return 'img/dispatch/fl/context/area.png';}
                                            else if(t.type == 35){return 'img/dispatch/fl/context/cell.png';}
                                            else if(t.type == 36){return 'img/dispatch/fl/context/unit.png';}
                                            else if(t.type == 37){return 'img/dispatch/fl/context/enterprise.png';}
                                            else if(t.type == 38){return 'img/dispatch/fl/context/t38.png';}
                                            else if(t.type == 39){return 'img/dispatch/fl/context/t39.png';}
                                            else if(t.type == 40){return 'img/dispatch/fl/context/t40.png';}
                                            else if(t.type == 41){return 'img/dispatch/fl/context/t41.png';}
                                            else if(t.type == 42){return 'img/dispatch/fl/context/t42.png';}
                                            else if(t.type == 43){return 'img/dispatch/fl/context/t43.png';}
                                            else if(t.type == 44){return 'img/dispatch/fl/context/t44.png';}
                                            else if(t.type == 45){return 'img/dispatch/fl/context/t45.png';}
                                            else if(t.type == 46){return 'img/dispatch/fl/context/t46.png';}
                                            else if(t.type == 47){return 'img/dispatch/fl/context/t47.png';}
                                            else if(t.type == 48){return 'img/dispatch/fl/context/t48.png';}
                                            else if(t.type == 49){return 'img/dispatch/fl/context/t49.png';}
                                            else if(t.type == 50){return 'img/dispatch/fl/context/t50.png';}
                                            else if(t.type == 51){return 'img/dispatch/fl/context/t51.png';}
                                            else if(t.type == 52){return 'img/dispatch/fl/context/t52.png';}
                                            else if(t.type == 53){return 'img/dispatch/fl/context/t53.png';}
                                            else if(t.type == 54){return 'img/dispatch/fl/context/t54.png';}
                                            else if(t.type == 55){return 'img/dispatch/fl/context/t55.png';}
                                            else if(t.type == 56){return 'img/dispatch/fl/context/t56.png';}
                                            else if(t.type == 57){return 'img/dispatch/fl/context/t57.png';}
                                            else if(t.type == 58){return 'img/dispatch/fl/context/t58.png';}
                                            else if(t.type == 59){return 'img/dispatch/fl/context/t59.png';}
                                            else if(t.type == 60){return 'img/dispatch/fl/context/t60.png';}
                                            else if(t.type == 61){return 'img/dispatch/fl/context/t61.png';}
                                            else if(t.type == 62){return 'img/dispatch/fl/context/t61.png';}
                                        }else{
                                            if(t.type == 1){return 'img/dispatch/fl/context/start_un.png';}
                                            else if(t.type == 6){return 'img/dispatch/fl/context/rep_un.png';}
                                            else if(t.type == 7){return 'img/dispatch/fl/context/ftpU_un.png';}
                                            else if(t.type == 8){return 'img/dispatch/fl/context/ftpD_un.png';}
                                            else if(t.type == 9){return 'img/dispatch/fl/context/sftpU_un.png';}
                                            else if(t.type == 10){return 'img/dispatch/fl/context/sftpD_un.png';}
                                            else if(t.type == 11){return 'img/dispatch/fl/context/zngtU_un.png';}
                                            else if(t.type == 12){return 'img/dispatch/fl/context/zngtD_un.png';}
                                            else if(t.type == 13){return 'img/dispatch/fl/context/copy_un.png';}
                                            else if(t.type == 14){return 'img/dispatch/fl/context/sql_un.png';}
                                            else if(t.type == 15){return 'img/dispatch/fl/context/sqlS_un.png';}
                                            else if(t.type== 16){return 'img/dispatch/fl/context/web_un.png';}
                                            else if(t.type == 17){return 'img/dispatch/fl/context/sysSt_un.png';}
                                            else if(t.type == 18){return 'img/dispatch/fl/context/sysE_un.png';}
                                            else if(t.type == 19){return 'img/dispatch/fl/context/python_un.png';}
                                            else if(t.type == 20){return 'img/dispatch/fl/context/shell_un.png';}
                                            else if(t.type == 21){return 'img/dispatch/fl/context/bat_un.png';}
                                            else if(t.type == 22){return 'img/dispatch/fl/context/rb_un.png';}
                                            else if(t.type== 23){return 'img/dispatch/fl/context/perl_un.png';}
                                            else if(t.type == 24){return 'img/dispatch/fl/context/webs_un.png';}
                                            else if(t.type == 25){return 'img/dispatch/fl/context/tcp_un.png';}
                                            else if(t.type == 26){return 'img/dispatch/fl/context/http_un.png';}
                                            else if(t.type == 27){return 'img/dispatch/fl/context/tux_un.png';}
                                            else if(t.type == 28){return 'img/dispatch/fl/context/cl_un.png';}
                                            else if(t.type == 29){return 'img/dispatch/fl/context/rpg_un.png';}
                                            else if(t.type == 30){return 'img/dispatch/fl/context/java_un.png';}
                                            else if(t.type == 31){return 'img/dispatch/fl/context/c_un.png';}
                                            else if(t.type == 32){return 'img/dispatch/fl/context/c++_un.png';}
                                            else if(t.type == 33){return 'img/dispatch/fl/context/site.png';}
                                            else if(t.type == 34){return 'img/dispatch/fl/context/area.png';}
                                            else if(t.type == 35){return 'img/dispatch/fl/context/cell.png';}
                                            else if(t.type == 36){return 'img/dispatch/fl/context/unit.png';}
                                            else if(t.type == 37){return 'img/dispatch/fl/context/enterprise.png';}
                                            else if(t.type == 38){return 'img/dispatch/fl/context/t38.png';}
                                            else if(t.type == 39){return 'img/dispatch/fl/context/t39.png';}
                                            else if(t.type == 40){return 'img/dispatch/fl/context/t40.png';}
                                            else if(t.type == 41){return 'img/dispatch/fl/context/t41.png';}
                                            else if(t.type == 42){return 'img/dispatch/fl/context/t42.png';}
                                            else if(t.type == 43){return 'img/dispatch/fl/context/t43.png';}
                                            else if(t.type == 44){return 'img/dispatch/fl/context/t44.png';}
                                            else if(t.type == 45){return 'img/dispatch/fl/context/t45.png';}
                                            else if(t.type == 46){return 'img/dispatch/fl/context/t46.png';}
                                            else if(t.type == 47){return 'img/dispatch/fl/context/t47.png';}
                                            else if(t.type == 48){return 'img/dispatch/fl/context/t48.png';}
                                            else if(t.type == 49){return 'img/dispatch/fl/context/t49.png';}
                                            else if(t.type == 50){return 'img/dispatch/fl/context/t50.png';}
                                            else if(t.type == 51){return 'img/dispatch/fl/context/t51.png';}
                                            else if(t.type == 52){return 'img/dispatch/fl/context/t52.png';}
                                            else if(t.type == 53){return 'img/dispatch/fl/context/t53.png';}
                                            else if(t.type == 54){return 'img/dispatch/fl/context/t54.png';}
                                            else if(t.type == 55){return 'img/dispatch/fl/context/t55.png';}
                                            else if(t.type == 56){return 'img/dispatch/fl/context/t56.png';}
                                            else if(t.type == 57){return 'img/dispatch/fl/context/t57.png';}
                                            else if(t.type == 58){return 'img/dispatch/fl/context/t58.png';}
                                            else if(t.type == 59){return 'img/dispatch/fl/context/t59.png';}
                                            else if(t.type == 60){return 'img/dispatch/fl/context/t60.png';}
                                            else if(t.type == 61){return 'img/dispatch/fl/context/t61.png';}
                                            else if(t.type == 62){return 'img/dispatch/fl/context/t61.png';}
                                        }
                                    })
                                )),
                            $(go.Panel, "Auto",{margin: new go.Margin(10, 6, 4, 48),width:62},
                                $(go.TextBlock,
                                    {
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe'
                                    },
                                    new go.Binding("text").makeTwoWay()
                                )
                            ),
                            $(go.Panel, "Auto",{alignment:go.Spot.TopRight,margin: new go.Margin(1, 1, 0, 0)},
                                $(go.Shape, "Rectangle",
                                    {fill: "#091016", stroke: null,width:24,height:16}),
                                $(go.Picture, {
                                        width: 14, height: 8
                                    },
                                    new go.Binding("source", "", function(t) {
                                        if(t.sd_job_bean.pre_job_list) return 'img/dispatch/fl/fl_pre.png';
                                    }),
                                    new go.Binding("visible", "", function(c) {
                                        if(c.sd_job_bean.pre_job_list.length != 0){
                                            return true;
                                        }
                                        if(c.sd_job_bean.pre_job_list == 0){
                                            return false;
                                        }
                                    })
                                )
                            )
                        )
                    ));
                myDiagram.nodeTemplateMap.add("3",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016", stroke: "#164957", strokeWidth:1}),
                            //new go.Binding("figure", "figure")),
                            $(go.Picture,
                                new go.Binding("source", "", function() {
                                    return 'img/dispatch/fl/context/condition.png';
                                })
                            )

                        )
                    ));

                myDiagram.nodeTemplateMap.add("4",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016", stroke: "#164957", strokeWidth:1}),
                            //new go.Binding("figure", "figure")),
                            $(go.Picture,
                                new go.Binding("source", "", function(t) {
                                    if(t.sd_job_bean.sdwork_cn_name){
                                        return 'img/dispatch/fl/context/rep.png';
                                    }else{
                                        return 'img/dispatch/fl/context/rep_un.png';
                                    }

                                })
                            )

                        )
                        // makePort("T", go.Spot.Top, true, true),
                        // makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("5",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016", stroke: "#164957", strokeWidth:1}),
                            //new go.Binding("figure", "figure")),
                            $(go.Picture,
                                new go.Binding("source", "", function(t) {
                                    if(t.sd_job_bean.sdwork_cn_name){
                                        return 'img/dispatch/fl/context/stop.png';
                                    }else{
                                        return 'img/dispatch/fl/context/stop_un.png';
                                    }
                                })
                            )

                        )
                        // makePort("T", go.Spot.Top, true, true),
                        // makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("1",
                    $(go.Node, "Spot", nodeStyle(),
                        {
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                {width:26,height:26, fill: "#091016", stroke: "#194C5A",strokeWidth:2})
                        )
                        // three named ports, one on each side except the top, all output only:
                        //makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("2",
                    $(go.Node, "Spot", nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                {width:25,height:25, fill: null, stroke: "#194C5A",strokeWidth:2}),
                            $(go.Panel, "Auto",
                                $(go.Shape, "Circle",
                                    {width:14,height:14, fill: "#194C5A", stroke: null})
                            )

                        )
                        // three named ports, one on each side except the bottom, all input only:
                        //makePort("T", go.Spot.Top, false, true)
                    ));
                // this function is used to highlight a Group that the selection may be dropped into
                function highlightGroup(e, grp, show) {
                    if (!grp) return;
                    e.handled = true;
                    if (show) {
                        // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
                        // instead depend on the DraggingTool.draggedParts or .copiedParts
                        var tool = grp.diagram.toolManager.draggingTool;
                        var map = tool.draggedParts || tool.copiedParts;  // this is a Map
                        // now we can check to see if the Group will accept membership of the dragged Parts
                        if (grp.canAddMembers(map.toKeySet())) {
                            grp.isHighlighted = true;
                            return;
                        }
                    }
                    grp.isHighlighted = false;
                }

                // Upon a drop onto a Group, we try to add the selection as members of the Group.
                // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
                // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
                function finishDrop(e, grp) {
                    var ok = (grp !== null
                        ? grp.addMembers(grp.diagram.selection, true)
                        : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
                    if (!ok) e.diagram.currentTool.doCancel();
                }
                myDiagram.groupTemplateMap.add("6",
                    $(go.Group, "Auto", nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        {
                            //isShadowed: true,
                            //background: "transparent",
                            // highlight when dragging into the Group
                            mouseDragEnter: function (e, grp, prev) {
                                highlightGroup(e, grp, true);
                            },
                            mouseDragLeave: function (e, grp, next) {
                                highlightGroup(e, grp, false);
                            },
                            computesBoundsAfterDrag: true,
                            // when the selection is dropped into a Group, add the selected Parts into that Group;
                            // if it fails, cancel the tool, rolling back any changes
                            mouseDrop: finishDrop,
                            handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
                            // Groups containing Groups lay out their members horizontally
                            layout: $(go.GridLayout,
                                {
                                    wrappingWidth: Infinity, alignment: go.GridLayout.Position,
                                    cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
                                }
                            )
                        },
                        $(go.Shape, "RoundedRectangle",
                            {fill: "#091016", stroke: "#164957", strokeWidth: 1}),
                        $(go.Panel, "Vertical", {margin:-2}, // title above Placeholder
                            $(go.Panel, "Horizontal",  // button next to TextBlock
                                {stretch: go.GraphObject.Horizontal, background: "#1F3144",padding:4},
                                //$("SubGraphExpanderButton",
                                //    {alignment: go.Spot.Right, margin: 5}),
                                $(go.Panel, "Auto",
                                    $(go.Shape,"Circle",
                                        {
                                            width: 25, height: 25,
                                            fill: "#091016",
                                            stroke: "#1F3144"
                                        }),
                                    $(go.TextBlock,
                                        {
                                            font: "14px Microsoft YaHei",
                                            opacity: 0.75,
                                            stroke: "#d2f1fe",
                                        },
                                        new go.Binding("text", "grid",function(t){
                                            if(t != 0){
                                                _group_index = parseInt(t);
                                                return t;
                                            }else{
                                                return _group_index;
                                            }
                                        }).makeTwoWay()
                                    )
                                ),
                                $(go.TextBlock,
                                    {
                                        alignment: go.Spot.Left,
                                        editable: true,
                                        margin: 5,
                                        font: "14px Microsoft YaHei",
                                        opacity: 0.75,
                                        stroke: "#61a1b8"
                                    },
                                    new go.Binding("text", "text").makeTwoWay()
                                )
                            ),  // end Horizontal Panel
                            $(go.Placeholder,
                                {padding: 20, alignment: go.Spot.TopLeft})
                        ) // end Vertical Panel
                        //makePort("T", go.Spot.Top, true, true),
                        //makePort("B", go.Spot.Bottom, true, false)
                    ));  // end Group and call to add to template Map
                myDiagram.linkTemplate =
                    $(go.Link,
                        $(go.Shape,{stroke: "gray",fill:"gray"}),
                        $(go.Shape, { toArrow: "Standard" ,stroke: null,fill:"gray"}),
                        $(go.Panel, "Auto",  // this whole Panel is a link label
                            {visible: false, name: "LABEL",
                                segmentIndex: 1},
                            new go.Binding('segmentFraction','',function(t){
                                if(t.visible){
                                   if(!_random_flag){
                                       _random_flag = true;
                                       return 0.8;
                                   }else{
                                       _random_flag = false;
                                       return 0.5;
                                   }
                                }
                            }),
                            new go.Binding("visible", "visible").makeTwoWay(),
                            $(go.Shape, "RoundedRectangle", { fill: "#091016", stroke: "null" }),
                            $(go.TextBlock, "判断条件",  // the label
                                {
                                    font: "10pt helvetica, arial, sans-serif",
                                    stroke: "#d2f1fe",
                                    editable: true,
                                },
                                new go.Binding("text").makeTwoWay()
                            )
                        )
                    );
                // Make link labels visible if coming out of a "conditional" node.
                // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
                function showLinkLabel(e) {
                    var label = e.subject.findObject("LABEL");
                    if (label !== null) label.visible = (e.subject.fromNode.data.type === 4);
                };
                // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
                myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
                myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
                load();  // load an initial diagram from some JSON text
                // initialize the Palette that is on the left side of the page

                // The following code overrides GoJS focus to stop the browser from scrolling
                // the page when either the Diagram or Palette are clicked or dragged onto.
                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }
                myDiagram.doFocus = customFocus;
                //myPalette.doFocus = customFocus;
                //隐藏滚动条
            } // end init
            // Make all ports on a node visible when the mouse is over the node
            function showPorts(node, show) {
                var diagram = node.diagram;
                if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
                node.ports.each(function (port) {
                    port.stroke = (show ? "#999999" : null);
                });
            }
            function load() {
                myDiagram.model = go.Model.fromJson(scope.model);
            }
            //// update the Angular model when the Diagram.selection changes
            function updateSelection(e) {
                myDiagram.model.selectedNodeData = null;
                var it = myDiagram.selection.iterator;
                while (it.next()) {
                    var selnode = it.value;
                    // ignore a selected link or a deleted node
                    if (selnode instanceof go.Node && selnode.data !== null) {
                        myDiagram.model.selectedNodeData = selnode.data;
                        break;
                    }
                }
                scope.$applyAsync();  //手动更新页面
            }
            init();
            $("#myDiagramDiv > div").css('overflow','hidden');
            scope.$watch('jobConfig',function(){
                if(!scope.jobConfig){
                    myDiagram.clearSelection();
                }
            },true);
        }
    };
}]);
//流程任务执行指令
cvDirectives.directive('cusFlowTaskExe',["$compile", "$timeout", "$interval", function($compile,$timeout,$interval){
    return {
        restrict: 'AE',
        require: '?ngModel',
        scope: {model: '=goModel', read_only: '=readOnly',undo: '=undo', redo:'=redo',jobConfig:'=jobConfig' ,config:'&config',nodeSelected:'=nodeSelected'},
        link: function(scope, elem, attr, ctrl) {
            var myDiagram;
            var _group_index = 0;
            scope.selectNode = {};
            var _random_flag = false;
            function init() {
                var $ = go.GraphObject.make;  // for conciseness in defining templates
                myDiagram =
                    $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
                        {
                            initialContentAlignment: go.Spot.Top,
                            allowMove:false,
                            allowDrop: false,  // must be true to accept drops from the Palette
                            "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
                            "LinkRelinked": showLinkLabel,
                            "ChangedSelection": updateSelection,// when click your node or group then selected it
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            "undoManager.isEnabled": true,  // enable undo & redo
                            "allowResize": false,
                            'initialAutoScale': go.Diagram.UniformToFill,
                            "isReadOnly" : true, //只读属性 用于查看

                        }
                    );

                myDiagram.layout =
                    $(go.TreeLayout,
                        { angle: 90, layerSpacing: 70,nodeSpacing:110,arrangementSpacing:new go.Size(20,40),
                        });
                myDiagram.toolManager.dragSelectingTool.delay = 0;
                //when the document is modified, add a "*" to the title and enable the "Save" button
                myDiagram.addDiagramListener("LayoutCompleted", function (e) {
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                myDiagram.addDiagramListener("ChangedSelection", function(){
                    if(!myDiagram.model.selectedNodeData) return;
                    if(myDiagram.model.selectedNodeData.type != 3){
                        scope.selectNode = myDiagram.model.selectedNodeData;
                        scope.config({key:myDiagram.model.selectedNodeData});
                    }
                });
                // helper definitions for node templates
                function nodeStyle() {
                    return [
                        // The Node.location comes from the "loc" property of the node data,
                        // converted by the Point.parse static method.
                        // If the Node.location is changed, it updates the "loc" property of the node data,
                        // converting back using the Point.stringify static method.
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        new go.Binding("layerName", "isHighlighted", function(h) { return "Foreground"; }).ofObject(),
                        {
                            // the Node.location is at the center of each node
                            locationSpot: go.Spot.Center,
                            selectionAdorned: false,//选中修饰
                            cursor: "pointer",//鼠标样式
                            //isShadowed: true,
                            //shadowColor: "#888",
                            // handle mouse enter/leave events to show/hide the ports
                            mouseEnter: function (e, obj) {
                                showPorts(obj.part, true);
                            },
                            mouseLeave: function (e, obj) {
                                showPorts(obj.part, false);
                            },
                            click:function(e,obj){
                                obj.part.stroke = "#CCCCCC";
                            }
                        }
                    ];
                }
                function validateLink(from, to) {
                    var _able = true;
                    for(var j = 0; j < scope.model.linkDataArray.length; j ++) {
                        var _j_link = scope.model.linkDataArray[j];
                        if(from.data.key == _j_link.from || to.data.key == _j_link.to){
                            _able = false;
                        }
                    }
                    return _able;
                }
                // Define a function for creating a "port" that is normally transparent.
                // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
                // and where the port is positioned on the node, and the boolean "output" and "input" arguments
                // control whether the user can draw links from or to the port.
                function makePort(name, spot, output, input,node) {
                    // the port is basically just a small circle that has a white stroke when it is made visible
                    return $(go.Shape, "Circle",
                        {
                            fill: "transparent",
                            stroke: "#7c8e8b",  // this is changed to "white" in the showPorts function
                            desiredSize: new go.Size(8, 8),
                            alignment: spot, alignmentFocus: spot,  // align the port on the main Shape
                            portId: name,  // declare this object to be a "port"
                            fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
                            fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
                            cursor: "pointer",  // show a different cursor to indicate potential link point
                        },new go.Binding("visible", "group", function(c) {
                            if(c == 0 || !c){
                                return true;
                            }else{
                                return false;
                            }
                        }));
                }

                // define the Node templates for regular nodes
                myDiagram.nodeTemplateMap.add("7",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        //// the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                        //new go.Binding("selectionAdorned", "selection", function(c) {
                        //    if(c) return true;
                        //    if(!c) return false;
                        //}),
                        $(go.Panel, "Auto",
                            $(go.Shape, "Rectangle",
                                {fill: "#091016",width:120,height:56,strokeWidth:1.5},
                                //边框样式
                                new go.Binding("stroke", "", function(t) {
                                        var _color = null;
                                        switch (t.sd_job_bean.job_status){
                                            //case 1 6:  _color = '#C1CFD2'; break;
                                           // case 3 :  _color = '#9CB85F'; break;
                                            case 2 :  _color = '#2D6DB8'; break;
                                            case 3 :  _color =  null;      break;
                                            case 4 :  _color = '#ED6F67'; break;
                                            case 5 :  _color = '#FEA04D'; break;
                                            case 7 :  _color = '#ED6F67'; break;
                                            default: _color = '#164957'; break;
                                        }
                                        return _color;
                                    }
                                )),
                            //new go.Binding("figure", "figure")),
                            $(go.Panel, "Auto",{padding:6,alignment:go.Spot.Left},
                                $(go.Picture, {
                                        width: 36, height: 36,
                                    },
                                    new go.Binding("source", "", function(t) {
                                        if(t.sd_job_bean.sdwork_cn_name){
                                            if(t.type == 6){return 'img/dispatch/fl/context/rep.png';}
                                            else if(t.type == 7){return 'img/dispatch/fl/context/ftpU.png';}
                                            else if(t.type == 8){return 'img/dispatch/fl/context/ftpD.png';}
                                            else if(t.type == 9){return 'img/dispatch/fl/context/sftpU.png';}
                                            else if(t.type == 10){return 'img/dispatch/fl/context/sftpD.png';}
                                            else if(t.type == 11){return 'img/dispatch/fl/context/zngtU.png';}
                                            else if(t.type == 12){return 'img/dispatch/fl/context/zngtD.png';}
                                            else if(t.type == 13){return 'img/dispatch/fl/context/copy.png';}
                                            else if(t.type == 14){return 'img/dispatch/fl/context/sql.png';}
                                            else if(t.type == 15){return 'img/dispatch/fl/context/sqlS.png';}
                                            else if(t.type== 16){return 'img/dispatch/fl/context/web.png';}
                                            else if(t.type == 17){return 'img/dispatch/fl/context/sysSt.png';}
                                            else if(t.type == 18){return 'img/dispatch/fl/context/sysE.png';}
                                            else if(t.type == 19){return 'img/dispatch/fl/context/python.png';}
                                            else if(t.type == 20){return 'img/dispatch/fl/context/shell.png';}
                                            else if(t.type == 21){return 'img/dispatch/fl/context/bat.png';}
                                            else if(t.type == 22){return 'img/dispatch/fl/context/rb.png';}
                                            else if(t.type== 23){return 'img/dispatch/fl/context/perl.png';}
                                            else if(t.type == 24){return 'img/dispatch/fl/context/webs.png';}
                                            else if(t.type == 25){return 'img/dispatch/fl/context/tcp.png';}
                                            else if(t.type == 26){return 'img/dispatch/fl/context/http.png';}
                                            else if(t.type == 27){return 'img/dispatch/fl/context/tux.png';}
                                            else if(t.type == 28){return 'img/dispatch/fl/context/cl.png';}
                                            else if(t.type == 29){return 'img/dispatch/fl/context/rpg.png';}
                                            else if(t.type == 30){return 'img/dispatch/fl/context/java.png';}
                                            else if(t.type == 31){return 'img/dispatch/fl/context/c.png';}
                                            else if(t.type == 32){return 'img/dispatch/fl/context/c++.png';}
                                        }else{
                                            if(t.type == 1){return 'img/dispatch/fl/context/start_un.png';}
                                            else if(t.type == 7){return 'img/dispatch/fl/context/ftpU_un.png';}
                                            else if(t.type == 8){return 'img/dispatch/fl/context/ftpD_un.png';}
                                            else if(t.type == 9){return 'img/dispatch/fl/context/sftpU_un.png';}
                                            else if(t.type == 10){return 'img/dispatch/fl/context/sftpD_un.png';}
                                            else if(t.type == 11){return 'img/dispatch/fl/context/zngtU_un.png';}
                                            else if(t.type == 12){return 'img/dispatch/fl/context/zngtD_un.png';}
                                            else if(t.type == 13){return 'img/dispatch/fl/context/copy_un.png';}
                                            else if(t.type == 14){return 'img/dispatch/fl/context/sql_un.png';}
                                            else if(t.type == 15){return 'img/dispatch/fl/context/sqlS_un.png';}
                                            else if(t.type== 16){return 'img/dispatch/fl/context/web_un.png';}
                                            else if(t.type == 17){return 'img/dispatch/fl/context/sysSt_un.png';}
                                            else if(t.type == 18){return 'img/dispatch/fl/context/sysE_un.png';}
                                            else if(t.type == 19){return 'img/dispatch/fl/context/python_un.png';}
                                            else if(t.type == 20){return 'img/dispatch/fl/context/shell_un.png';}
                                            else if(t.type == 21){return 'img/dispatch/fl/context/bat_un.png';}
                                            else if(t.type == 22){return 'img/dispatch/fl/context/rb_un.png';}
                                            else if(t.type== 23){return 'img/dispatch/fl/context/perl_un.png';}
                                            else if(t.type == 24){return 'img/dispatch/fl/context/webs_un.png';}
                                            else if(t.type == 25){return 'img/dispatch/fl/context/tcp_un.png';}
                                            else if(t.type == 26){return 'img/dispatch/fl/context/http_un.png';}
                                            else if(t.type == 27){return 'img/dispatch/fl/context/tux_un.png';}
                                            else if(t.type == 28){return 'img/dispatch/fl/context/cl_un.png';}
                                            else if(t.type == 29){return 'img/dispatch/fl/context/rpg_un.png';}
                                            else if(t.type == 30){return 'img/dispatch/fl/context/java_un.png';}
                                            else if(t.type == 31){return 'img/dispatch/fl/context/c_un.png';}
                                            else if(t.type == 32){return 'img/dispatch/fl/context/c++_un.png';}
                                        }
                                    })
                                )),
                            $(go.Panel, "Auto",{margin: new go.Margin(8, 6, 4, 48),width:62},
                                $(go.TextBlock,
                                    {
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe'
                                    },
                                    new go.Binding("text").makeTwoWay()
                                )
                            ),
                            $(go.Panel, "Auto",{alignment:go.Spot.TopRight,margin:new go.Margin(1,1,0,0)},
                                new go.Binding("width", "", function(b) {
                                    return b.sd_job_bean.pre_job_list ? "auto" : 0;
                                }),
                                $(go.Picture, {
                                        width: 14, height: 8
                                    },
                                    new go.Binding("source", "", function(t) {
                                        if(t.sd_job_bean.pre_job_list) return 'img/dispatch/fl/fl_pre.png';
                                    }),
                                    new go.Binding("visible", "", function(c) {
                                        return c.sd_job_bean.pre_job_list.length != 0;
                                    })
                                )
                            ),
                            $(go.Panel, "Auto",{alignment:go.Spot.BottomLeft},//进度条
                                $(go.Shape, "RoundedRectangle",
                                    {stroke: null,height:4},
                                    new go.Binding("width", "", function(t) {
                                        t.sd_job_bean = t.sd_job_bean || {};
                                        var _progress = t.sd_job_bean.width ? t.sd_job_bean.width : 0;
                                        return _progress;
                                    }),
                                    new go.Binding("fill", "", function(t) {
                                        var _color = '';
                                        switch (t.sd_job_bean.job_status){
                                            case 2 :  _color = '#2D6DB8'; break;
                                            case 3 :  _color = '#9CB85F'; break;
                                            case 4 :  _color = '#ED6F67'; break;
                                            case 5 :  _color = '#FEA04D'; break;
                                            case 7 :  _color = '#ED6F67'; break;
                                            default: _color = ''; break;
                                        }
                                        return _color;
                                    })
                                ),
                                new go.Binding("visible", "", function(b) {
                                    var _is_visible,_jobstatus = b.sd_job_bean.job_status;
                                    if(b.sd_job_bean && ((_jobstatus >= 2 && _jobstatus <= 4) || _jobstatus == 7)){
                                        _is_visible = true;
                                    }else{
                                        _is_visible = false;
                                    }
                                    return _is_visible;
                                })
                            )
                        )
                    ));
                myDiagram.nodeTemplateMap.add("3",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016"},
                                //边框样式
                                new go.Binding("stroke", "", function(t) {
                                    var _color = null;
                                    switch (t.sd_job_bean.job_status){
                                        //case 1 6:  _color = '#C1CFD2'; break;
                                        //case 3 :  _color = '#9CB85F'; break;
                                        case 2 :  _color = '#2D6DB8'; break;
                                        case 4 :  _color = '#ED6F67'; break;
                                        case 5 :  _color = '#FEA04D'; break;
                                        case 7 :  _color = '#ED6F67'; break;
                                        default: _color = null; break;
                                    }
                                    return _color;
                                })
                            ),
                            //new go.Binding("figure", "figure")),
                            $(go.Picture,
                                new go.Binding("source", "", function() {
                                    return 'img/dispatch/fl/context/condition.png';
                                })
                            ),
                            $(go.Panel, "Auto",{alignment:new go.Spot(0,0,50,48)},//进度条
                                $(go.Shape, "RoundedRectangle",
                                    {fill:'#9CB85F',stroke: null,height:4,width:100}
                                ),
                                new go.Binding("visible", "", function(b) {
                                    return b.sd_job_bean.job_status == 3;
                                })
                            )

                        )
                    ));
                myDiagram.nodeTemplateMap.add("4",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,cursor: "pointer",},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016"},
                                //边框样式
                                new go.Binding("stroke", "", function(t) {
                                    var _color = null;
                                    switch (t.sd_job_bean.job_status){
                                        //case 1 6:  _color = '#C1CFD2'; break;
                                        //case 3 :  _color = '#9CB85F'; break;
                                        case 2 :  _color = '#2D6DB8'; break;
                                        case 4 :  _color = '#ED6F67'; break;
                                        case 5 :  _color = '#FEA04D'; break;
                                        case 7 :  _color = '#ED6F67'; break;
                                        default: _color = null; break;
                                    }
                                    return _color;
                                })
                            ),
                            //new go.Binding("figure", "figure")),
                            $(go.Picture,
                                new go.Binding("source", "", function(t) {
                                    if(t.sd_job_bean.sdwork_cn_name){
                                        return 'img/dispatch/fl/context/rep.png';
                                    }else{
                                        return 'img/dispatch/fl/context/rep_un.png';
                                    }
                                })
                            ),
                            $(go.Panel, "Auto",{alignment:new go.Spot(0,0,50,48)},//进度条
                                $(go.Shape, "RoundedRectangle",
                                    {fill:'#9CB85F',stroke: null,height:4,width:100}),
                                new go.Binding("visible", "", function(b) {
                                    return b.sd_job_bean.job_status == 3;
                                })
                            )

                        )
                        // makePort("T", go.Spot.Top, true, true),
                        // makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("5",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Spot",{ width: 100, height: 50,cursor: "pointer",},
                            $(go.Shape, "Rectangle",
                                {fill: "#091016"},
                                //边框样式
                                new go.Binding("stroke", "", function(t) {
                                    var _color = null;
                                    switch (t.sd_job_bean.job_status){
                                        //case 1 6:  _color = '#C1CFD2'; break;
                                        //case 3 :  _color = '#9CB85F'; break;
                                        case 2 :  _color = '#2D6DB8'; break;
                                        case 4 :  _color = '#ED6F67'; break;
                                        case 5 :  _color = '#FEA04D'; break;
                                        case 7 :  _color = '#ED6F67'; break;
                                        default: _color = null; break;
                                    }
                                    return _color;
                                })
                            ),
                            //new go.Binding("figure", "figure")),
                            $(go.Picture,
                                new go.Binding("source", "", function(t) {
                                    if(t.sd_job_bean.sdwork_cn_name){
                                        return 'img/dispatch/fl/context/stop.png';
                                    }else{
                                        return 'img/dispatch/fl/context/stop_un.png';
                                    }
                                })
                            ),
                            $(go.Panel, "Auto",{alignment:new go.Spot(0,0,50,48)},//进度条
                                $(go.Shape, "RoundedRectangle",
                                    {fill:'#9CB85F',stroke: null,height:4,width:100}),
                                new go.Binding("visible", "", function(b) {
                                    return b.sd_job_bean.job_status == 3;
                                })
                            )

                        )
                        // makePort("T", go.Spot.Top, true, true),
                        // makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("1",
                    $(go.Node, "Spot", nodeStyle(),
                        {
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                {width:26,height:26, fill: "#091016", strokeWidth:2},
                                //边框样式
                                new go.Binding("stroke", "", function(t) {
                                    var _color = "#CCCCCC";
                                    switch (t.sd_job_bean.job_status){
                                        //case 1 6:  _color = '#C1CFD2'; break;
                                        case 2 :  _color = '#2D6DB8'; break;
                                        case 3 :  _color = '#9CB85F'; break;
                                        case 4 :  _color = '#ED6F67'; break;
                                        case 5 :  _color = '#FEA04D'; break;
                                        case 7 :  _color = '#ED6F67'; break;
                                        default: _color = "#CCCCCC"; break;
                                    }
                                    return _color;
                                })
                            )
                        )
                        // three named ports, one on each side except the top, all output only:
                        //makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.nodeTemplateMap.add("2",
                    $(go.Node, "Spot", nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                {width:25,height:25, fill: null,strokeWidth:2},
                                //边框样式
                                new go.Binding("stroke", "", function(t) {
                                    var _color = "#666666";
                                    switch (t.sd_job_bean.job_status){
                                        //case 1 6:  _color = '#C1CFD2'; break;
                                        case 2 :  _color = '#2D6DB8'; break;
                                        case 3 :  _color = '#9CB85F'; break;
                                        case 4 :  _color = '#ED6F67'; break;
                                        case 5 :  _color = '#FEA04D'; break;
                                        case 7 :  _color = '#ED6F67'; break;
                                        default: _color = "#666666"; break;
                                    }
                                    return _color;
                                })
                            ),
                            $(go.Panel, "Auto",
                                $(go.Shape, "Circle",
                                    {width:14,height:14, fill: "#194C5A", stroke: null})
                            )

                        )
                        // three named ports, one on each side except the bottom, all input only:
                        //makePort("T", go.Spot.Top, false, true)
                    ));
                // this function is used to highlight a Group that the selection may be dropped into
                function highlightGroup(e, grp, show) {
                    if (!grp) return;
                    e.handled = true;
                    if (show) {
                        // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
                        // instead depend on the DraggingTool.draggedParts or .copiedParts
                        var tool = grp.diagram.toolManager.draggingTool;
                        var map = tool.draggedParts || tool.copiedParts;  // this is a Map
                        // now we can check to see if the Group will accept membership of the dragged Parts
                        if (grp.canAddMembers(map.toKeySet())) {
                            grp.isHighlighted = true;
                            return;
                        }
                    }
                    grp.isHighlighted = false;
                }

                function updateSelection(e) {
                    myDiagram.model.selectedNodeData = null;
                    var it = myDiagram.selection.iterator;
                    while (it.next()) {
                        var selnode = it.value;
                        // ignore a selected link or a deleted node
                        if (selnode instanceof go.Node && selnode.data !== null) {
                            myDiagram.model.selectedNodeData = selnode.data;
                            break;
                        }
                    }
                    scope.$applyAsync();  //手动更新页面
                }
                // Upon a drop onto a Group, we try to add the selection as members of the Group.
                // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
                // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
                function finishDrop(e, grp) {
                    var ok = (grp !== null
                        ? grp.addMembers(grp.diagram.selection, true)
                        : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
                    if (!ok) e.diagram.currentTool.doCancel();
                }
                myDiagram.groupTemplateMap.add("6",
                    $(go.Group, "Auto", nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                        },
                        {
                            //isShadowed: true,
                            //background: "transparent",
                            // highlight when dragging into the Group
                            mouseDragEnter: function (e, grp, prev) {
                                highlightGroup(e, grp, true);
                            },
                            mouseDragLeave: function (e, grp, next) {
                                highlightGroup(e, grp, false);
                            },
                            computesBoundsAfterDrag: true,
                            // when the selection is dropped into a Group, add the selected Parts into that Group;
                            // if it fails, cancel the tool, rolling back any changes
                            mouseDrop: finishDrop,
                            handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
                            // Groups containing Groups lay out their members horizontally
                            layout: $(go.GridLayout,
                                {
                                    wrappingWidth: Infinity, alignment: go.GridLayout.Position,
                                    cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
                                }
                            )
                        },
                        $(go.Shape, "RoundedRectangle",
                            {fill: "#091016", stroke: "#164957", strokeWidth: 1}),
                        $(go.Panel, "Vertical", {margin:-2}, // title above Placeholder
                            $(go.Panel, "Horizontal",  // button next to TextBlock
                                {stretch: go.GraphObject.Horizontal, background: "#1F3144",padding:4},
                                //$("SubGraphExpanderButton",
                                //    {alignment: go.Spot.Right, margin: 5}),
                                $(go.Panel, "Auto",
                                    $(go.Shape,"Circle",
                                        {
                                            width: 25, height: 25,
                                            fill: "#091016",
                                            stroke: "#1F3144"
                                        }),
                                    $(go.TextBlock,
                                        {
                                            font: "14px Microsoft YaHei",
                                            opacity: 0.75,
                                            stroke: "#d2f1fe",
                                        },
                                        new go.Binding("text", "grid",function(t){
                                            if(t != 0){
                                                _group_index = parseInt(t);
                                                return t;
                                            }else{
                                                return _group_index;
                                            }
                                        }).makeTwoWay()
                                    )
                                ),
                                $(go.TextBlock,
                                    {
                                        alignment: go.Spot.Left,
                                        editable: true,
                                        margin: 5,
                                        font: "14px Microsoft YaHei",
                                        opacity: 0.75,
                                        stroke: "#61a1b8"
                                    },
                                    new go.Binding("text", "text").makeTwoWay()
                                )
                            ),  // end Horizontal Panel
                            $(go.Placeholder,
                                {padding: 20, alignment: go.Spot.TopLeft})
                        ) // end Vertical Panel
                        //makePort("T", go.Spot.Top, true, true),
                        //makePort("B", go.Spot.Bottom, true, false)
                    ));  // end Group and call to add to template Map


                myDiagram.linkTemplate =
                    $(go.Link,
                        $(go.Shape,{stroke: "gray",fill:"gray"}),
                        $(go.Shape, { toArrow: "Standard" ,stroke: null,fill:"gray"}),
                        $(go.Panel, "Auto",  // this whole Panel is a link label
                            {visible: false, name: "LABEL",segmentIndex:1},
                            new go.Binding("visible", "visible").makeTwoWay(),
                            new go.Binding('segmentFraction','',function(t){
                                if(t.visible){
                                    if(!_random_flag){
                                        _random_flag = true;
                                        return 0.85;
                                    }else{
                                        _random_flag = false;
                                        return 0.4;
                                    }
                                }
                            }),
                            $(go.Shape, "RoundedRectangle", { fill: "#091016", stroke: "null" }),
                            $(go.TextBlock, "判断条件",  // the label
                                {
                                    textAlign: "center",
                                    font: "10pt helvetica, arial, sans-serif",
                                    stroke: "#d2f1fe",
                                    editable: true,

                                },
                                new go.Binding("text").makeTwoWay()
                            )
                        )
                    );
                // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
                function showLinkLabel(e) {
                    var label = e.subject.findObject("LABEL");
                    if (label !== null) label.visible = (e.subject.fromNode.data.type === 4);
                };
                myDiagram.addDiagramListener("ChangedSelection", function(){
                    //if(!myDiagram.model.selectedNodeData){
                    //    scope.jobConfig = false;
                    //}else{
                    //    if(myDiagram.model.selectedNodeData.type != 3){
                    //        scope.selectNode = myDiagram.model.selectedNodeData;
                    //        scope.jobConfig = true;
                    //        scope.config({key:myDiagram.model.selectedNodeData});
                    //    }
                    //}
                });
                // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
                myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
                myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
                load();  // load an initial diagram from some JSON text
                // initialize the Palette that is on the left side of the page

                // The following code overrides GoJS focus to stop the browser from scrolling
                // the page when either the Diagram or Palette are clicked or dragged onto.
                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }
                myDiagram.doFocus = customFocus;
                //myPalette.doFocus = customFocus;
            } // end init
            // Make all ports on a node visible when the mouse is over the node
            function showPorts(node, show) {
                var diagram = node.diagram;
                if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
                node.ports.each(function (port) {
                    port.stroke = (show ? "#999999" : null);
                });
            }
            function load() {
                myDiagram.model = go.Model.fromJson(scope.model);
            }
            //// update the Angular model when the Diagram.selection changes
            function updateSelection(e) {
                myDiagram.model.selectedNodeData = null;
                var it = myDiagram.selection.iterator;
                while (it.next()) {
                    var selnode = it.value;
                    // ignore a selected link or a deleted node
                    if (selnode instanceof go.Node && selnode.data !== null) {
                        myDiagram.model.selectedNodeData = selnode.data;
                        break;
                    }
                }
                scope.$applyAsync();  //手动更新页面
            }
            init();
            //隐藏滚动条
            $("#myDiagramDiv > div").css('overflow','hidden');
           /* scope.$watch('jobConfig',function(){
             if(!scope.jobConfig){
             myDiagram.clearSelection();
             }
             },true);*/
            //监控单个节点选择状态
            scope.$watch('nodeSelected',function(newValue,oldValue){
                if(newValue === oldValue) return;
                myDiagram.clearSelection();
            });
            //监控节点状态变化
            scope.$watch('model.nodeDataArray',function(){
                myDiagram.startTransaction('change node');
                for(var i = 0; i < scope.model.nodeDataArray.length; i++){
                    var _single_node = scope.model.nodeDataArray[i];
                    if(_single_node.type == 3) continue;
                    var _job = _single_node.sd_job_bean ? _single_node.sd_job_bean : {};
                     if(_job.job_status &&_job.job_status != 1){
                         /*--start处理作业进度--*/
                         if(_job.job_status == 3){
                             _job.width = (_single_node.type >3 && _single_node.type <6) ? 100:120;
                             $interval.cancel(_job.timer);
                         }else if(_job.job_status == 2 || _job.job_status == 4 || _job.job_status == 7){
                             if(_job.width && _job.width >= 105){
                                 _job.width = 110;
                                 $interval.cancel(_job.timer);
                             }
                         }
                         /*--end处理作业进度--*/
                         var node = myDiagram.findNodeForData(_single_node);
                         if (node) node.updateTargetBindings("");
                     }
                }
                myDiagram.commitTransaction('change node');
            },true);
        }
    };
}]);

//键盘enter事件--zhanggy
cvDirectives.directive('ngEnter',["$compile", function($compile){
    //return function (scope, element, attrs) {
    //    element.bind("keydown keypress", function (event) {
    //        if (event.which === 13) {
    //            scope.$apply(function () {
    //                scope.$eval(attrs.ngEnter);
    //            });
    //            event.preventDefault();
    //        }
    //    });
    //};
    return {
        restrict: 'AE',
        link: function(scope, elem, attr, ctrl) {
            elem.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attr.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        }
    };
}]);
//流程定制页面动态高度
// cvDirectives.directive('autoHeight',["$timeout",function($timeout){
//     return {
//         restrict: 'AE',
//         link: function(scope, elem, attr) {
//             var _first_loading = true;
//             var setHeight = function(){
//                 elem.css('height',$(window).height()-$(elem).offset().top-100 +'px');
//                 // elem.animate({height:$(window).height()-$(elem).offset().top-140 +'px'},200)
//             };
//             // $('body').css('overflow-y','hidden');
//             // $('body').attr('class','noMarginRigth');
//             if(_first_loading){
//                 $timeout(function(){
//                     setHeight();
//                 },1000);
//             }else{
//                 setHeight();
//             }
//             $(window).resize(function(){
//                 _first_loading = false;
//                 setHeight();
//             });
//             scope.$watch('control.job_config',function(){
//                 $timeout(function(){
//                     setHeight();
//                 },4);
//             },true);
//             scope.$watch('control.show_basic_detail',function(){
//                 if(scope.control.show_basic_detail){
//                     $timeout(function(){
//                         setHeight();
//                     },500)
//                 }else{
//                     $timeout(function(){
//                         elem.css('height',$(window).height()-$(elem).offset().top-100 +'px');
//                     },360)
//                     $('body').scrollTop(10);
//                 }
//             },true);
//         }
//     };
// }]);
//转化用户名和用户id的过滤器--zgy
cvDirectives.filter('getNameFilter',['$sce',function($sce){
    return function(input){
        for(var i = 0 ; i < input.length; i++){
            if(input[i].flag){
                return input[i].user_cn_name;
            }
        }
    }
}])
//分组监控指令
cvDirectives.directive('dragMonitor',['$compile','$timeout','Modal', function($compile,$timeout,Modal){
    return {
        restrict: "AE",
        require:  "?ngModel",
        scope:{
            model:'=goModel',
            group:'=groupData',
            read_only:'=readOnly',
            node_length:'=nodeLength',
        },
        link:function(scope,elem,attr,ctrl){
            var _height = (scope.group.proj_list.length)*150+'px';
            elem.css('height',_height);
            elem.children().css('height',_height);
            function setStyle(node){
                var _phase= scope.group.proj_list[node.data.row-1].phase_list[node.data.col-1];
                Modal.viewPhaseSoc(_phase).then(function(){});
            }
            //节点的状态颜色
            var color = ['#F2F2F2','#FC9E47','#de6d69','#89D098'];
            //计算画布长度
            var _out_group_width = scope.node_length*75;
            var myDiagram;
            function maybeChangeLinkCategory(e) {
                var link = e.subject;
                var linktolink = (link.fromNode.isLinkLabel || link.toNode.isLinkLabel);
                e.diagram.model.setCategoryForLinkData(link.data, (linktolink ? "linkToLink" : ""));
            }
            function init() {
                var $ = go.GraphObject.make;  // for conciseness in defining templates
                myDiagram =
                    $(go.Diagram, elem.children().attr('id'),  // must name or refer to the DIV HTML element
                        {
                            initialContentAlignment: go.Spot.TopLeft, // use a GridLayout
                            allowMove:true,//画布上的节点是否可以拖动
                            allowDrop: false,  // must be true to accept drops from the Palette
                            "ChangedSelection": updateSelection,// when click your node or group then selected it
                            // "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            "undoManager.isEnabled": true,  // enable undo & redo
                            "LinkDrawn": maybeChangeLinkCategory,     // these two DiagramEvents call a
                            "LinkRelinked": maybeChangeLinkCategory,  // function that is defined below
							"animationManager.isEnabled":false,
                            allowVerticalScroll:false,
                            allowHorizontalScroll :true,
                            allowZoom:false,
                            "isReadOnly" : scope.read_only, //只读属性 用于查看
                            layout: $(go.GridLayout,  // automatically lay out the lane's subgraph
                                {
                                    wrappingColumn: 1,
                                    cellSize: new go.Size(1, 1),
                                    spacing: new go.Size(1, 1),
                                    alignment: go.GridLayout.Position,
                                    comparer: function(a, b) {  // can re-order tasks within a lane
                                        var ay = a.location.y;
                                        var by = b.location.y;
                                        if (isNaN(ay) || isNaN(by)) return 0;
                                        if (ay < by) return -1;
                                        if (ay > by) return 1;
                                        return 0;
                                    }
                                }),
                        }
                    );
                //when the document is modified, add a "*" to the title and enable the "Save" buttonExternalObjectsDropped
                myDiagram.addDiagramListener("LayoutCompleted", function (e) {
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                myDiagram.addDiagramListener("SelectionDeleting", function (e) {
                    var _link = {
                        from:myDiagram.selection.first().data.from,
                        to:myDiagram.selection.first().data.to,
                        statue:myDiagram.selection.first().data.statue,
                        extra_flag:myDiagram.selection.first().data.extra_flag
                    }
                    if(_link.extra_flag === false){
                        $timeout(function(){
                            myDiagram.startTransaction("add node and link");
                            // add the new link to the model
                            myDiagram.model.addLinkData(_link);
                            // finish the transaction
                            myDiagram.commitTransaction("add node and link");
                        },10);
                    }
                });
                myDiagram.addModelChangedListener(function(e) {
                    if (e.isTransactionFinished) {
                         myDiagram.model.nodeDataArray = scope.model.nodeDataArray;
                         myDiagram.model.linkDataArray = scope.model.linkDataArray;
                    }
                });
                function validateLink(from, to) {
                    var _able = true;
                    for(var i = 0; i < scope.model.linkDataArray.length; i ++) {
                        var _link = scope.model.linkDataArray[i];
                        if(_link.from == to.data.key && _link.to == from.data.key) {     //不能重复连接
                            _able = false;
                        }
                    }
                   if(from.data.row == to.data.row){
                        _able = false;
                    }
                    return _able;
                }
                // helper definitions for node templates
                function nodeStyle() {
                    return [
                        {
                            cursor:'pointer',
                            deletable:false,
                            fromLinkable: true, toLinkable: true,
                            mouseEnter: function (e, obj) {
                                showPorts(obj.part, true);
                            },
                            mouseLeave: function (e, obj) {
                                showPorts(obj.part, false);
                            },
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                            click:function(e,obj){
                                obj.part.stroke = "#CCCCCC";
                                setStyle(obj);
                            }
                        }
                    ];
                }

                myDiagram.nodeTemplateMap.add("noExecute",
                    $(go.Node, "Vertical",nodeStyle(),
                        $(go.Shape, "Circle",
                            {width:19,height:19,},
                            new go.Binding("fill", "status",function(data){
                                if(data == 1){
                                    return '#6d7183';
                                }else if(data == 3){
                                    return '#de6d69';
                                }else if(data == 6){
                                    return '#FC9E47';
                                }else if(data == 5){
                                    return '#89D098';
                                }else{
                                    return '#de6d69';
                                }
                            }),
                            new go.Binding("stroke", "status",function(data){
                                if(data == 1){
                                    return '#6d7183';
                                }else if(data == 3){
                                    return '#de6d69';
                                }else if(data == 6){
                                    return '#FC9E47';
                                }else if(data == 5){
                                    return '#89D098';
                                }else{
                                    return '#de6d69';
                                }
                            })
                        )
                    )
                );
                myDiagram.nodeTemplateMap.add("executing",
                    $(go.Node, "Vertical",nodeStyle(),
                        $(go.Panel,
                            new go.Binding("itemArray", "slices"),
                            {
                                itemTemplate:
                                    $(go.Panel,
                                        $(go.Shape,
                                            { fill: "lightgreen", isGeometryPositioned: true, strokeWidth: 0 },
                                            new go.Binding("fill", "color"),
                                            new go.Binding("geometry", "", makeGeo))
                                    )
                            }),
                        $(go.TextBlock,
                            {margin:new go.Margin(-27,0,0,0)},
                            new go.Binding("text", "dynamic")
                        )
                    )
                );
                myDiagram.groupTemplateMap.add("OfGroups",
                    $(go.Group, "Vertical",
                        {selectable :false,
                            deletable:false,
                            width:60,
                            height:140,},
                       /* $(go.TextBlock,    // group title
                            { alignment: go.Spot.Center, font: "9pt Sans-Serif" ,stroke:'#ccc'},
                            new go.Binding("text", "date_flag")
                        ),*/
                       /* $(go.TextBlock,  // group title
                            { alignment: go.Spot.Center, font: "9pt Sans-Serif" ,stroke:'#ccc'},
                            new go.Binding("text", "time")
                        ),*/
                        $(go.Panel, "Auto",{width:40,height:40,},
                            $(go.Shape, "RoundedRectangle",  // surrounds the Placeholder
                                {fill: "transparent",stroke:null}),
                            $(go.Placeholder,    // represents the area of all member parts,
                                { padding: 1})  // with some extra padding around them
                        ),
                        $(go.TextBlock,         // group title
                            { alignment: go.Spot.Right, font: "9pt Sans-Serif" ,angle:45,stroke:'rgba(109, 113, 131, 0.53)'},
                            new go.Binding("text", "test")
                        )
                    )
                );
                myDiagram.groupTemplateMap.add("OfNodes",
                    $(go.Group, "Vertical",{layout: $(go.TreeLayout,
                        {layerSpacing: 20,}),selectionAdorned :false,selectable :true,deletable:false,dragComputation: stayInGroup},
                        $(go.Panel, "Auto",
                            $(go.Shape, "Rectangle",  // the rectangular shape around the members
                                {fill: "#141e2a", stroke: null,width:_out_group_width}),
                            $(go.Placeholder, { margin: 2, background: "transparent",alignment: go.Spot.Left })  // represents where the members are
                        )
                    )
                );
                myDiagram.linkTemplate =
                    $(go.Link,{
                            reshapable: true, resegmentable: true,
                            relinkableFrom: true, relinkableTo: true,
                            adjusting: go.Link.Stretch,
                        },
                        $(go.Shape,{ "fill": "#44dcfd" ,stroke: "#44dcfd"},
                            new go.Binding("stroke", "statue",function(data){
                                if(data != 1 && data != 3){
                                    return '#44dcfd';
                                }else {
                                    return 'gray';
                                }
                            }).makeTwoWay(),
                            new go.Binding("fill", "statue",function(data){
                                if(data != 1 && data != 3){
                                    return '#44dcfd';
                                }else {
                                    return 'gray';
                                }
                            }).makeTwoWay()),
                        $(go.Shape, { toArrow: "Standard"},
                            new go.Binding("stroke", "",function(data){
                                if(!data.statue){
                                    return '#44dcfd';
                                }else{
                                    if(data.statue == 1 || data.statue == 3){
                                        return 'gray';
                                    }else {
                                        return '#44dcfd';
                                    }
                                }
                            }).makeTwoWay(),
                            new go.Binding("fill", "",function(data){
                                if(!data.statue){
                                    return '#44dcfd';
                                }else{
                                    if(data.statue == 1 || data.statue == 3){
                                        return 'gray';
                                    }else {
                                        return '#44dcfd';
                                    }
                                }
                            }).makeTwoWay())

                    );
                myDiagram.addDiagramListener("ChangedSelection", function(){
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                // temporary links used by LinkingTool and RelinkingTool are also orthogonal,normal,AvoidsNodes:
                myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Normal;
                myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Normal;
                load();
                // The following code overrides GoJS focus to stop the browser from scrolling
                // the page when either the Diagram or Palette are clicked or dragged onto.
                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }
                myDiagram.doFocus = customFocus;
            } // end init
            // Make all ports on a node visible when the mouse is over the node
            function showPorts(node, show) {
                var diagram = node.diagram;
                if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
                node.ports.each(function (port) {
                    port.stroke = (show ? "#999999" : null);
                });
            }
            //只可以横向移动，不可以上下移动 pt
            function stayInGroup(part, pt, gridpt) {
                return new go.Point(pt.x, part.location.y);
            }
            function load() {
                myDiagram.model = go.Model.fromJson(scope.model);
            }
            //// update the Angular model when the Diagram.selection changes
            function updateSelection(e) {
                myDiagram.model.selectedNodeData = null;
                var it = myDiagram.selection.iterator;
                while (it.next()) {
                    var selnode = it.value;
                    // ignore a selected link or a deleted node
                    if (selnode instanceof go.Node && selnode.data !== null) {
                        myDiagram.model.selectedNodeData = selnode.data;
                        break;
                    }
                }
                scope.$applyAsync();  //手动更新页面
            }
            function makeGeo(data) {
                // this is much more efficient than calling go.GraphObject.make:
                return new go.Geometry()
                    .add(new go.PathFigure(data.radius, data.radius)  // start point
                        .add(new go.PathSegment(go.PathSegment.Arc,
                            data.start, data.sweep,  // angles
                            data.center, data.center,  // center
                            data.radius, data.radius)  // radius
                            .close()));
            }
            scope.$watch('model',function(){
                if(elem.children().attr('id')){
                    load();
                }
            },true)
            init();
            elem.children().children().next().css('overflow',"hidden");

        }
    }

}]);

/*文件树*/
cvDirectives.directive('fileTree',['$timeout', 'treeConfig','ReleaseFileType', "CV",function($timeout, treeConfig, ReleaseFileType, CV){
    return  {
        restrict: 'E',
        scope:{
            files: '=',
            changePath: '&',
            getFileContent:'&',
            dbFile:'&',
            go:'&',
            commonControl:'=',  //比对公共控制
            compareConfig:'='
        },
        templateUrl: 'templates/directives/file_tree.html',
        controller:['$scope',function ($scope) {
            this.scope =$scope;
        }],
        link: function(scope, elem, attrs) {
            //更改配置默认为收起状态
            treeConfig.defaultCollapsed=true;
            scope.control={
                alter_flag:false,        //显示带有路径的文件
                diff_flag  :false        //变更标志
            };
            scope.common_control = scope.commonControl || {};
            scope.control.alter_flag = attrs['alter']  ? true:false;
            scope.control.diff_flag = attrs['diff']  ? true:false;
            scope.tree_config = scope.compareConfig ? angular.extend({compare_mode:false,status:''},scope.compareConfig):{compare_mode:false,status:''};
            var init = function () {//no_init_flag是否需要初始化
                if(scope.changePath && !scope.files.no_init_flag && scope.tree_config.status!='right'){
                    scope.files.loading=true;
                    scope.changePath().then(function (data) {
                        if(data && data.message){
                            scope.files.loading=false;
                            scope.err_msg =data.message;
                            return;
                        }
                        scope.files.nodes = data ? data:[];
                        scope.data = scope.files.nodes;
                        scope.files.curr_file=angular.extend(scope.files.curr_file,{file_count:scope.data.length,dir:true});
                        scope.files.loading=false;
                        if(scope.getFileContent) scope.getFileContent(); //查看文件
                        if( scope.tree_config.compare_mode){
                            drawCompareBg();
                        }
                    });
                }else {
                    scope.data = scope.files.nodes;
                }
            };
            //点击获取下一层文件
            scope.getMoreFile = function (scope) {
                var nodeData = scope.$modelValue;
                scope.toggle();
                scope.files.curr_fold_path= (nodeData.file_path ? nodeData.file_path :nodeData.tar_path)+'/'+nodeData.file;
                if(nodeData.dir && !nodeData.nodes && !scope.collapsed){
                    scope.files.curr_file.relate_path=nodeData.relate_path ? nodeData.relate_path :nodeData.file+'/';
                    nodeData.loading = true;
                    scope.changePath().then(function (data) {
                        nodeData.nodes = data ? data:[];
                        if(nodeData.nodes.length==0){
                            scope.toggle();
                        }
                        //当前点击的文件夹对象
                        nodeData.loading=false;
                        scope.files.curr_file=angular.extend(scope.files.curr_file,{file_count:nodeData.nodes.length,relate_path:nodeData.relate_path});
                        if(scope.getFileContent) scope.getFileContent(); //查看文件
                    });
                }else {
                    scope.files.curr_file ={
                        file_path:nodeData.file_path ? nodeData.file_path :nodeData.tar_path,
                        file:nodeData.file,
                        file_count:nodeData.nodes ? nodeData.nodes.length :0,
                        size:nodeData.file_size,
                        dir:true,
                        relate_path:nodeData.relate_path,
                        modify_time:nodeData.modify_time
                    };
                    if(scope.getFileContent) scope.getFileContent(); //查看文件
                }

            };
            //点击非文件夹
            scope.getFileTarget = function (scope) {
                var nodeData = scope.$modelValue,_file_type;
                if(scope.tree_config.compare_mode){
                    _file_type = nodeData.name.lastIndexOf('.')==-1 ? 0 :CV.findKey(nodeData.name.substring(nodeData.name.lastIndexOf('.')+1),ReleaseFileType);
                }else{
                    _file_type = nodeData.file.lastIndexOf('.')==-1 ? 0 :CV.findKey(nodeData.file.substring(nodeData.file.lastIndexOf('.')+1),ReleaseFileType);
                }
                scope.files.curr_file ={
                    file_path:nodeData.file_path ? nodeData.file_path :nodeData.tar_path,
                    file:nodeData.file,
                    file_type:_file_type,
                    size:nodeData.file_size,
                    dir:false,
                    relate_path:nodeData.relate_path,
                    modify_time:nodeData.modify_time
                };
                //查看文件
                if(scope.getFileContent) scope.getFileContent();
            };
            /*双击文件*/
            scope.fileDbClick =function (curr_scope) {
                var nodeData = curr_scope.$modelValue;
                var _type = nodeData.name.lastIndexOf('.')==-1 ? 0 :CV.findKey(nodeData.name.substring(nodeData.name.lastIndexOf('.')+1),ReleaseFileType);
                //不能比对的文件
                if(!_type || _type==2 || _type==3 || (8 <_type && _type<14)){
                    return;
                }
                scope.files.compare_path1 = nodeData.path1 ? nodeData.path1 :'';
                scope.files.compare_path2 = nodeData.path2 ? nodeData.path2 :'';
                scope.dbFile();
            };
            //目录比对
            scope.getcompareFiles = function (curr_scope) {
                var nodeData = curr_scope.$modelValue;
                scope.files.temp=null;
                /*   curr_scope.toggle();*/
                scope.files.curr_fold_path= nodeData.path1 ? nodeData.path1:nodeData.path2;
                scope.go();
                if(!nodeData.isfile && !nodeData.nodes && !curr_scope.collapsed){
                    scope.common_control.disabled_control=true;
                    scope.files.compare_path1 = nodeData.path1 ? nodeData.path1 :'';
                    scope.files.compare_path2 = nodeData.path2 ? nodeData.path2 :'';
                    nodeData.loading = true;
                    scope.files.temp=nodeData;
                    scope.go();
                    scope.changePath().then(function (data) {
                        nodeData.nodes = data ? data:[];
                        //当前点击的文件夹对象
                        nodeData.loading=false;
                        scope.files.curr_file=angular.extend(scope.files.curr_file,{file_count:nodeData.nodes.length});
                        scope.files.temp=nodeData;
                        scope.go();
                        if(scope.getFileContent) scope.getFileContent(); //查看文件
                        drawCompareBg();
                        scope.common_control.disabled_control=false;
                    });
                }else {
                    scope.files.curr_file ={
                        file_path:nodeData.path1 ? nodeData.path1:nodeData.path2,
                        file:nodeData.file,
                        file_count:nodeData.nodes ? nodeData.nodes.length :0,
                        size:nodeData.file_size,
                        dir:true,
                        modify_time:nodeData.modify_time
                    };
                    if(scope.getFileContent) scope.getFileContent(); //查看文件
                    drawCompareBg();
                }
            };
            //添加隔行变色
            var drawCompareBg=function () {
                $timeout(function () {
                    var _file_num=0;
                    $('.tree-content').html('');
                    var _do_height=elem.height();
                    _file_num=Math.ceil(parseInt(_do_height)/22);
                    var _total_div='';
                    for(var i=0;i<_file_num;i++){
                        if(i%2==0){
                            _total_div+='<div style="height:22px;background:transparent"></div>'
                        }else {
                            _total_div+='<div style="height:22px;background:rgba(37,53,73,0.25);"></div>'
                        }
                    }
                    $('.tree-content').html(_total_div);
                },100)
            };
            init();
        }
    }
}]);
/*比对树*/
cvDirectives.directive('compareTree',['$timeout', 'treeConfig','ReleaseFileType', "CV",function($timeout, treeConfig, ReleaseFileType, CV){
    return  {
        restrict: 'A',
        require: '^fileTree',
        link: function(scope, elem, attrs,controller) {
            var on_str=attrs.compareTree;
            scope.$on(on_str,function(e,_data){
                if(_data){
                    var nodeData = scope.$modelValue;
                    nodeData.loading=_data.loading;
                    nodeData.nodes=_data.nodes;
                }else {
                    scope.toggle();
                }
            })
        }
    }
}]);
/*文件树结构线*/
cvDirectives.directive('treeLine',['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require:'ngModel',
        controller:['$scope', '$element','$attrs', function ($scope, $element, $attrs) {
            this.scope = $scope;
        }],
        link: function(scope, elem, attr,trl) {
            var _flag=attr.treeLine;
            scope.countHeight=function () {
                var _list = trl.$modelValue;
                var _diff_status = _flag =='left' ? 'right':'left';
                var _dom_list=elem.children('li');
                for(var i=_list.length-1;i>=0;i--){
                    if(_list[i].status==_diff_status){
                        _dom_list.eq(i).children('.ui-tree-fold-line').css({'display':'none'});
                    }else {
                        _dom_list.eq(i).children('ol').children('.ui-tree-cover').css({'display':'block'});
                        break;
                    }
                }
            }
        }
    }
}]);
/*ng-repeat是否完成*/
cvDirectives.directive('repeatFinish',function(){
    return {
        restrict: 'A',
        require:'^?treeLine',
        link: function(scope,element,attr,ctrl){
            if(scope.$last == true){
                ctrl.scope.countHeight();
            }
        }
    }
});
//版本管理-版本流
cvDirectives.directive('versionTree',['$compile','$timeout','Modal',function($compile,$timeout,Modal){
    return {
        restrict: "AE",
        require:  "?ngModel",
        scope:{
            model:'=goModel',
            linkLength:'=linkLength',
            changeVersion:'&changeVersion',
        },
        link:function(scope,elem,attr,ctrl){
            //线条高度
            var _line_height = scope.linkLength;

            //节点的状态颜色
            var color = ['#F2F2F2','#FC9E47','#de6d69','#89D098'];
            //计算画布长度
            var myDiagram;
            function maybeChangeLinkCategory(e) {
                var link = e.subject;
                var linktolink = (link.fromNode.isLinkLabel || link.toNode.isLinkLabel);
                e.diagram.model.setCategoryForLinkData(link.data, (linktolink ? "linkToLink" : ""));
            };
            function setStyle(node){
                for(var i = 0 ; i < myDiagram.model.nodeDataArray.length; i++){
                    var _node = myDiagram.model.nodeDataArray[i];
                    if(_node.category == 'node' && _node.select){
                        myDiagram.startTransaction('change node');
                        _node.select = false;
                        var node = myDiagram.findNodeForData(_node);
                        if (node !== null) {
                            node.updateTargetBindings("");
                        }
                        myDiagram.commitTransaction('change node');
                    }
                }
                myDiagram.startTransaction('change node');
                if(myDiagram.model.selectedNodeData){
                    myDiagram.model.selectedNodeData.select = true;
                }
                var node = myDiagram.findNodeForData(myDiagram.model.selectedNodeData);
                if (node !== null) {
                    node.updateTargetBindings("");
                }
                myDiagram.commitTransaction('change node');
                scope.changeVersion({key:node.data.vsversion_id});

            };
            function init() {
                var $ = go.GraphObject.make;  // for conciseness in defining templates
                myDiagram =
                    $(go.Diagram, "versionDiagram",  // must name or refer to the DIV HTML element
                        {
                            initialContentAlignment: go.Spot.TopLeft, // use a GridLayout
                            allowMove:true,//画布上的节点是否可以拖动
                            allowDrop: false,  // must be true to accept drops from the Palette
                            "ChangedSelection": updateSelection,// when click your node or group then selected it
                            // "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            "undoManager.isEnabled": true,  // enable undo & redo
                            "LinkDrawn": maybeChangeLinkCategory,     // these two DiagramEvents call a
                            "LinkRelinked": maybeChangeLinkCategory,  // function that is defined below
                            "animationManager.isEnabled":false,
                            allowVerticalScroll:true,
                            allowHorizontalScroll :false,
                            allowZoom:false,
                            "toolManager.mouseWheelBehavior":go.ToolManager.WheelNone,//鼠标滚轮事件禁止
                            "isReadOnly" : true, //只读属性 用于查看
                        }
                    );

                // This is the actual HTML context menu:
                var cxElement = document.getElementById("nodeDetail");
                // Since we have only one main element, we don't have to declare a hide method,
                // we can set mainElement and GoJS will hide it automatically
                var myContextMenu = $(go.HTMLInfo, {
                    show: showContextMenu,
                    mainElement: cxElement
                });
                myDiagram.addDiagramListener("LayoutCompleted", function (e) {
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                function nodeStyle() {
                    return [
                        {
                            cursor:'pointer',
                            deletable:false,
                            selectionAdorned :false,
                            locationSpot: go.Spot.Center,
                            fromLinkable: true, toLinkable: true,
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node);
                            },
                            click:function(e,obj){
                                if(obj.data.color =="#FC9E22") {
                                    setStyle(obj);
                                }else{
                                    showContextMenu(obj,myDiagram);
                                    elem.find("#mask").css("display","block");
                                }
                            },
                        }
                    ];
                }
                myDiagram.nodeTemplateMap.add("node",
                    $(go.Node, "Vertical",nodeStyle(),{contextMenu: myContextMenu},
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                {width:24,height:24, isGeometryPositioned: true, fill: "#091016", stroke: "#666666",strokeWidth:2},
                                new go.Binding("stroke", "color").makeTwoWay()),
                            $(go.Panel, "Auto",
                                $(go.Shape, "Circle",
                                    {width:18,height:18,isGeometryPositioned: true, fill: "#091016", stroke: null},
                                    new go.Binding("fill","select",function(data){
                                        if(data){
                                            return "#FC9E22";
                                        }else{
                                            return "#091016";
                                        }
                                    }))
                            )
                        )
                    )
                );
                myDiagram.groupTemplateMap.add("OfNodes",
                    $(go.Group, "Vertical",{selectionAdorned :false,alignment: go.Spot.Center,width:300,
                            selectable :false,deletable:false,dragComputation: stayInGroup},
                        $(go.Panel, "Auto",{alignment: go.Spot.Center},
                            $(go.Shape, "RoundedRectangle",  // the rectangular shape around the members
                                {fill: "transparent", stroke: null,alignment: go.Spot.Center}),
                            $(go.Placeholder,    // represents the area of all member parts,
                                { padding: 30})
                        ),
                        $(go.TextBlock, {alignment: go.Spot.Center,width:150,margin:new go.Margin(-62,-180,0,0),font: "bold 12pt helvetica, arial, sans-serif", stroke: "#d2f1fe"},
                            new go.Binding('text',"version_number").makeTwoWay()),
                        $(go.TextBlock, {alignment: go.Spot.Center,width:150,margin:new go.Margin(4,-180,0,0),font: "10pt helvetica, arial, sans-serif", stroke: "#d2f1fe"},
                            new go.Binding('text',"date_time").makeTwoWay()),
                        $(go.TextBlock, {alignment: go.Spot.Center,width:150,margin:new go.Margin(-63,-180,0,0),font: "10pt helvetica, arial, sans-serif", stroke: "#61a1b8"},
                            new go.Binding('text',"proj_cn_name").makeTwoWay(),
                            new go.Binding("visible","proj_cn_name",function(data){
                                if(data == ''){
                                    return false;
                                }else{
                                    return true;
                                }
                            }).makeTwoWay())

                    )
                );
                myDiagram.groupTemplateMap.add("OfGroups",
                    $(go.Group, "Vertical",
                        {selectable :false,
                            selectionAdorned :true,
                            deletable:false,
                            dragComputation: stayInGroup,// create a TreeLayout for the family tree
                            layout:
                                $(go.TreeLayout,
                                    {angle: 270,}
                                ),
                            width:130,
                        },
                        $(go.Panel, "Auto",{width:60,height:40,margin:new go.Margin(0,-6,0,0)},
                            $(go.TextBlock, {font: "10pt helvetica, arial, sans-serif"},
                                new go.Binding("text", "data"),
                                new go.Binding("stroke", "color").makeTwoWay())),
                        $(go.Shape, "TriangleUp",
                            {width:17,height:17},
                            new go.Binding("fill", "color").makeTwoWay(),
                            new go.Binding("stroke", "color").makeTwoWay()),
                        $(go.Panel, "Auto",{width:3,height:_line_height},//140*i+130
                            $(go.Shape, "RoundedRectangle",// surrounds the Placeholder
                                new go.Binding("fill", "color").makeTwoWay(),
                                new go.Binding("stroke", "color").makeTwoWay()),
                            $(go.Placeholder,    // represents the area of all member parts,
                                { padding: 1})  // with some extra padding around them
                        )
                    )
                );
                myDiagram.linkTemplate =
                    $(go.Link,{
                            reshapable: true, resegmentable: true,selectable :false,
                            relinkableFrom: true, relinkableTo: true,
                            adjusting: go.Link.Stretch,
                        },
                        $(go.Shape,{strokeWidth: 2,stroke:"#61a1b8",fill:"#61a1b8"}),
                        $(go.Shape, { toArrow: "Standard" ,stroke: null,scale: 1.6,fill:"#61a1b8"})
                    );
                myDiagram.addDiagramListener("ChangedSelection", function(){
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                // temporary links used by LinkingTool and RelinkingTool are also orthogonal,normal,AvoidsNodes:
                myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Normal;
                myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Normal;
                load();
                // The following code overrides GoJS focus to stop the browser from scrolling
                // the page when either the Diagram or Palette are clicked or dragged onto.
                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }
                myDiagram.doFocus = customFocus;
                myDiagram.contextMenu = myContextMenu;
                cxElement.addEventListener("contextmenu", function(e) {
                    e.preventDefault();
                    return false;
                }, false);
                var mask = document.getElementById("mask");
                mask.addEventListener('click',function(e){
                    cxElement.style.display = "none";
                    mask.style.display = 'none';
                },false);
                function showContextMenu(obj, diagram, tool) {
                    if(obj && obj.data.color =='#44dcfd'){
                        document.getElementById("proj_cn_name").innerHTML = obj.data.proj_cn_name || '--';
                        document.getElementById("vsversion_id").innerHTML = obj.data.vsversion_id || '--';
                        document.getElementById("operasion_user_name").innerHTML = obj.data.operasion_user_name || '--';
                        document.getElementById("date_time").innerHTML = obj.data.date_time || '--';
                        // Now show the whole context menu element
                        cxElement.style.display = "block";
                        // we don't bother overriding positionContextMenu, we just do it here:
                        var mousePt = diagram.lastInput.viewPoint;
                        cxElement.style.left = mousePt.x-39 + "px";
                        cxElement.style.top = mousePt.y+33 + "px";
                    }
                }
                // var diagramDiv = document.getElementById("versionDiagram");
                // Make sure the infoBox is hidden when the mouse is not over the Diagram
            } // end init


            //只可以横向移动，不可以上下移动 pt
            function stayInGroup(part, pt, gridpt) {
                return new go.Point(part.location.x,pt.y);
            }
            function load() {
                myDiagram.model = go.Model.fromJson(scope.model);
            }
            //// update the Angular model when the Diagram.selection changes
            function updateSelection(e) {
                myDiagram.model.selectedNodeData = null;
                var it = myDiagram.selection.iterator;
                while (it.next()) {
                    var selnode = it.value;
                    // ignore a selected link or a deleted node
                    if (selnode instanceof go.Node && selnode.data !== null) {
                        myDiagram.model.selectedNodeData = selnode.data;
                        break;
                    }
                }
                scope.$applyAsync();  //手动更新页面
            };
            $timeout(function(){
                init();
                elem.children().children().next().css('overflow',"hidden");
            },200);
        }
    }
}]);
//过滤器
cvDirectives.filter('getProjStateGreaterThanThree',[function(){
    return function(data){
        var _projList = [];
        for(var i = 0 ; i < data.length; i++){
            if(data[i].sys_publish_status < 4 && data[i].sys_publish_status > 1 ){
                _projList.push(data[i]);
            }
        }
        return _projList;
    }
}]);

//自定义样式滚动条插件
cvDirectives.directive('customScroll',['$timeout',function($timeout){
    return {
        restrice: 'EA',
        /*scope:{
            config:'=customConfig',
        },*/
        replace:true,
        link: function(scope, element, attrs) {
            $timeout(function () {
                var _options;
                var _str = attrs.customConfig;
                if(_str){
                    _options = scope.$eval(_str);
                }
                if(attrs.callbacks){
                    if(_options) _options.callbacks = scope[attrs.callbacks];
                }else{
                    if(_options) _options.callbacks = false;
                }
                //将属性与默认属性匹配
                element.mCustomScrollbar(_options);
                if(attrs.func){
                    //获取需要用到的函数名称
                    var func = scope.$eval(attrs.func);
                    //设置各种操作函数
                    if (func.scroll) {
                        scope[func.scroll] = function(position, option) {
                            element.mCustomScrollbar("scrollTo", position, option);
                        }
                    }
                    if (func.stop) {
                        scope[func.stop] = function() {
                            element.mCustomScrollbar("stop");
                        }
                    };
                }
            });

        }
    }
}]);
//自定义滚动条解决codemirror滚动条不滚的指令
cvDirectives.directive('scrollControl',[function(){
    return {
        restrice: 'EA',
        template:'',
        replace:true,
        link: function(scope, element, attrs) {
            element.bind("mouseover",function(){
                $('._mCS1').mCustomScrollbar('disable')
            });
            element.bind("mouseleave",function(){
                $('._mCS1').mCustomScrollbar('update')
            });
        }
    }
}]);
//鼠标右击事件
cvDirectives.directive('ngRightClick', ['$parse', function($parse) {
    return {
        restrict: 'AE',
        link: function(scope, elem, attr, ctrl) {
            var fn = $parse(attr.ngRightClick);
            elem.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        }
    };
}]);

//架构配置
cvDirectives.directive('structDrag',["$compile", "$timeout", function($compile,$timeout){
    return {
        restrict: 'AE',
        require: '?ngModel',
        scope: {
            model :'=nodeLinkData',
            palette: '=paletteData',
            config: '&config',
            save:'&save',
            node:'=node',
            reflash:'=reflash',
            clear    :'=clear',
            cancel  :'&cancel'
        },
        link: function(scope, elem, attr, ctrl) {
            var myDiagram;
            var palette = scope.palette; //基础元素面板
            scope.selectNode = {};
            function DemoForceDirectedLayout() {
                go.TreeLayout.call(this);
            }
            go.Diagram.inherit(DemoForceDirectedLayout, go.TreeLayout);
            function init() {
                var $ = go.GraphObject.make;  // for conciseness in defining templates
                myDiagram =
                    $(go.Diagram, "structDiagramDiv",  // must name or refer to the DIV HTML element
                        {
                            initialContentAlignment: go.Spot.TopCenter,
                            "grid.visible": false,
                            allowMove:true,//画布上的节点是否可以拖动
                            allowDrop: true,  // must be true to accept drops from the Palette
                            "ChangedSelection": updateSelection,// when click your node or group then selected it
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            "undoManager.isEnabled": true,  // enable undo & redo
                            allowVerticalScroll:true,
                            allowHorizontalScroll :true,
                            allowZoom:false,
                            autoScale:go.Diagram.UniformToFill,// initialAutoScale: go.Diagram.UniformToFill,
                           /* layout:
                                $(go.TreeLayout,
                                    {
                                        treeStyle: go.TreeLayout.StyleLastParents,
                                        arrangement: go.TreeLayout.ArrangementHorizontal,
                                        // properties for most of the tree:
                                        angle: 90,
                                        layerSpacing: 35,
                                        // properties for the "last parents":
                                        alternateAngle: 90,
                                        alternateLayerSpacing: 35,
                                        alternateAlignment: go.TreeLayout.AlignmentBus,
                                        alternateNodeSpacing: 20
                                    }
                                ),*/
                        }
                    );
                //when the document is modified, add a "*" to the title and enable the "Save" buttonExternalObjectsDropped
                myDiagram.addDiagramListener("LayoutCompleted", function (e) {
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                // helper definitions for node templates
                function nodeStyle() {
                    return [
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        new go.Binding("layerName", "isHighlighted", function(h) { return "Foreground"; }).ofObject(),
                        {
                            locationSpot: go.Spot.Center,
                            cursor:'pointer',
                            mouseEnter: function (e, obj) {
                                showPorts(obj.part, true);
                            },
                            mouseLeave: function (e, obj) {
                                showPorts(obj.part, false);
                            },
                            click:function(e,obj){
                                obj.part.stroke = "#CCCCCC";
                                scope.config({key:obj.data});
                                showConfigDiv();
                            }
                        }
                    ];
                }
                function palNodeStyle(){
                    return[{
                        mouseEnter: function (e, obj) {
                            obj.part.stroke = '#4A90E2';
                            obj.part.strokeWidth = 1;
                        },
                        mouseLeave: function (e, obj) {
                            obj.part.stroke = "transparent";
                            obj.part.strokeWidth = 1;
                        }
                    }]
                };
                function validateLink(from, to, from_obj) {
                    var _able = true;
                    return _able;
                }
                // control whether the user can draw links from or to the port.
                function makePort(name, spot, output, input,node) {
                    // the port is basically just a small circle that has a white stroke when it is made visible
                    return $(go.Shape, "Circle",
                        {
                            fill: "#172230",
                            stroke: "#1D3D4F",  // this is changed to "white" in the showPorts function
                            desiredSize: new go.Size(8, 8),
                            alignment: spot, alignmentFocus: spot,  // align the port on the main Shape
                            portId: name,  // declare this object to be a "port"
                            fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
                            fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
                            cursor: "pointer",  // show a different cursor to indicate potential link point
                        },new go.Binding("visible", "", function(c) {
                            return true;
                        }));
                }
                // myDiagram.toolManager.dragSelectingTool.delay = 0;//禁止拖动整个画布
                myDiagram.nodeTemplateMap.add("cNode",  // the default category
                    $(go.Node, "Spot",nodeStyle(),{
                            linkValidation: function(from_node, from_obj, to_node, to_obj, link) {
                                return validateLink(from_node, to_node, from_obj);
                            },
                        },
                        $(go.Panel, "Auto",
                            $(go.Shape, "Rectangle",
                                {fill: "#091016",cursor: "pointer", stroke: "#1D3D4F", strokeWidth:1, width:200,height:80}),
                            $(go.Panel, "Auto",{padding:6,alignment:go.Spot.Left},
                                $(go.Picture, {
                                        width: 38, height: 34,background:"transparent",
                                    },
                                    new go.Binding("source", "", function(node) {
                                        if(node.config_flag){
                                            if(node.logical_node_type == 1){return 'img/public/struct/custom_impl_c.png';}
                                            else if(node.logical_node_type == 2){return 'img/public/struct/was_impl_c.png';}
                                            else if(node.logical_node_type == 3){return 'img/public/struct/weblogic_impl_c.png';}
                                            else if(node.logical_node_type == 4){return 'img/public/struct/sql_impl_c.png';}
                                            else if(node.logical_node_type == 5){return 'img/public/struct/as400_impl_c.png';}
                                            else if(node.logical_node_type == 6){return 'img/public/struct/svn_impl_c.png';}
                                        }else{
                                            if(node.logical_node_type == 1){return 'img/public/struct/custom_impl_u.png';}
                                            else if(node.logical_node_type == 2){return 'img/public/struct/was_impl_u.png';}
                                            else if(node.logical_node_type == 3){return 'img/public/struct/weblogic_impl_u.png';}
                                            else if(node.logical_node_type == 4){return 'img/public/struct/sql_impl_u.png';}
                                            else if(node.logical_node_type == 5){return 'img/public/struct/as400_impl_u.png';}
                                            else if(node.logical_node_type == 6){return 'img/public/struct/svn_impl_u.png';}
                                        }
                                    })
                                )),
                            $(go.Panel, "Auto",{margin: new go.Margin(0, 0, 0, 50),width:100,alignment:go.Spot.Left},
                                $(go.TextBlock,
                                    {
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe'
                                    },
                                    new go.Binding("text").makeTwoWay()
                                )
                            ),
                            $(go.Panel, "Auto",{margin: new go.Margin(30, 0, 0, 50),alignment:go.Spot.Left},
                                $(go.TextBlock,
                                    {
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe'
                                    },
                                    // new go.Binding("text").makeTwoWay(),
                                    new go.Binding('visible','visible').makeTwoWay()
                                )
                            )
                        ),
                        makePort("T", go.Spot.Top, true, true),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));
                myDiagram.linkTemplate =
                    $(go.Link,
                        $(go.Shape,{stroke: "gray",fill:"gray"}),
                        $(go.Shape, { toArrow: "Standard" ,stroke: null,fill:"gray"})
                    );
                myDiagram.addDiagramListener("ChangedSelection", function(){
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                myDiagram.addDiagramListener("SelectionDeleted", function(){
                    scope.cancel();
                });
                myDiagram.addDiagramListener("BackgroundSingleClicked", function(){
                    scope.cancel();
                });

                // link的类型，箭头样式:
                myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
                myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
                load();  // load an initial diagram from some JSON text
                // initialize the Palette that is on the left side of the page
                var myPaletteW =
                    $(go.Palette, "myPaletteDiv", {padding:new go.Margin(0,0,0,0)}, // must name or refer to the DIV HTML element
                        {
                            initialDocumentSpot : go.Spot.Left,
                            initialContentAlignment:go.Spot.Left,
                            initialViewportSpot:go.Spot.TopLeft,
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            model: new go.GraphLinksModel(palette.webPalette),
                            allowResize: true,
                            mouseDragOver :function(){}
                        }
                    );
                myPaletteW.nodeTemplate =
                    $(go.Node, "Vertical",{
                            locationSpot: go.Spot.Left,
                            selectionAdorned: false,
                            width:84,height:84,
                        },
                        $(go.Panel, "Vertical",
                            $(go.Picture, {
                                    width: 38, height: 38,
                                    margin: new go.Margin(20, 0, 0, 0),
                                    cursor: "pointer",
                                    background:"transparent",
                                },
                                new go.Binding("source", "logical_node_type", function(t) {
                                    if(t == 1){return 'img/public/struct/custom_impl_c.png';}
                                    else if(t == 2){return 'img/public/struct/was_impl_c.png';}
                                    else if(t == 3){return 'img/public/struct/weblogic_impl_c.png';}
                                    else if(t == 4){return 'img/public/struct/sql_impl_c.png';}
                                    else if(t == 5){return 'img/public/struct/as400_impl_c.png';}
                                    else if(t == 6){return 'img/public/struct/svn_impl_c.png';}
                                })
                            ),
                            $(go.TextBlock, "Yes",  // the label
                                {
                                    textAlign: "center",
                                    font: '12px Microsoft YaHei',
                                    stroke: '#d2f1fe',
                                    editable: true,
                                },
                                new go.Binding("text").makeTwoWay()
                            )
                        ),
                        palNodeStyle()
                    );
                 /*       var myPaletteServerDiv =
                            $(go.Palette, "myPaletteServerDiv",{padding:new go.Margin(0,0,0,0)}, // must name or refer to the DIV HTML element  // must name or refer to the DIV HTML element
                                {
                                    initialDocumentSpot : go.Spot.Left,
                                    initialContentAlignment:go.Spot.Left,
                                    initialViewportSpot:go.Spot.TopLeft,
                                    "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                    model: new go.GraphLinksModel(palette.appPalette),
                                    nodeTemplate: myPaletteW.nodeTemplate,
                                    allowResize: true,
                                    mouseDragOver :function(){}
                                }
                            );
                        var myPaletteD =
                            $(go.Palette, "myPaletteDDiv", {padding:new go.Margin(0,0,0,0)}, // must name or refer to the DIV HTML element
                                {
                                    initialDocumentSpot : go.Spot.Left,
                                    initialContentAlignment:go.Spot.Left,
                                    initialViewportSpot:go.Spot.TopLeft,
                                    "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                    model: new go.GraphLinksModel(palette.dbPalette),
                                    nodeTemplate: myPaletteW.nodeTemplate,
                                    allowResize: true,
                                    mouseDragOver :function(){}
                                }
                            );
                        var myPaletteO =
                            $(go.Palette, "myPaletteODiv", {padding:new go.Margin(0,0,0,0)}, // must name or refer to the DIV HTML element
                                {
                                    initialDocumentSpot : go.Spot.Left,
                                    initialContentAlignment:go.Spot.Left,
                                    initialViewportSpot:go.Spot.TopLeft,
                                    "animationManager.duration": 800, // slightly longer than default (600ms) animation
                                    model: new go.GraphLinksModel(palette.otherPalette),
                                    nodeTemplate: myPaletteW.nodeTemplate,
                                    allowResize: true,
                                    mouseDragOver :function(){}
                                }
                            );*/
                // The following code overrides GoJS focus to stop the browser from scrolling
                // the page when either the Diagram or Palette are clicked or dragged onto.
                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }
                myDiagram.doFocus = customFocus;
                //myPalette.doFocus = customFocus;
            } // end init
            // Make all ports on a node visible when the mouse is over the node
            function showPorts(node, show) {
                var diagram = node.diagram;
                if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
                node.ports.each(function (port) {
                    port.stroke = (show ? "#d2f1fe" : null);
                });
            }
            function load() {
                myDiagram.model = go.Model.fromJson(scope.model);
            }
            //// update the Angular model when the Diagram.selection changes
            function updateSelection(e) {
                myDiagram.model.selectedNodeData = null;
                var it = myDiagram.selection.iterator;
                while (it.next()) {
                    var selnode = it.value;
                    // ignore a selected link or a deleted node
                    if (selnode instanceof go.Node && selnode.data !== null) {
                        myDiagram.model.selectedNodeData = selnode.data;
                        break;
                    }
                }
                scope.$applyAsync();  //手动更新页面
            }
            //刷新图片
            scope.$watch("reflash", function() {
                myDiagram.startTransaction('change node');
                if(myDiagram.model.selectedNodeData){
                    for(var i =0;i < scope.model.nodeDataArray.length;i++){
                        if(scope.model.nodeDataArray[i].key == myDiagram.model.selectedNodeData.key){
                            scope.model.nodeDataArray[i].text = scope.model.nodeDataArray[i].basic_msg.node_name;
                            myDiagram.model.selectedNodeData = scope.model.nodeDataArray[i];
                            var node = myDiagram.findNodeForData(myDiagram.model.selectedNodeData);
                            if (node !== null) {
                                node.updateTargetBindings("");
                            }
                        }
                    }
                }
                myDiagram.commitTransaction('change node');
            },true);
            init();
            var showConfigDiv = function(){
                var _canvas_h = $('#structDiagramDiv').height()*0.7+'px';
                $('.configDiv').css('width',$('#structDiagramDiv').width()-8);
                $('.configDiv').css('display','inherit');
                $('.configDiv').animate({height:_canvas_h},500);
                // $('.stepDiv').css('height',$('#structDiagramDiv').height()*0.7-36+'px');
            };
            var _resetMenuHeight = function() {
                $('.configDiv').css('width',$('#structDiagramDiv').width()-8);
            };
            _resetMenuHeight();
            $(window).resize(_resetMenuHeight);
            //隐藏滚动条
            $("#structDiagramDiv > div").css('overflow','hidden');
            $("#myPaletteDiv > div").css('overflow','hidden');
            //点击实例选中 作业
            scope.$watch('clear',function(){
                if(myDiagram.model.selectedNodeData){
                    myDiagram.clearSelection();
                }
            },true);
            scope.save = function(){};
        }
    };
}]);
//环境配置
cvDirectives.directive('envDrag',["$compile", "$timeout", function($compile, $timeout){
    return {
        restrict: 'AE',
        require: '?ngModel',
        scope: {
            model :'=nodeLinkData',
            palette: '=paletteData',
            config: '&config',
            save: '&save',
            node: '=node',
            reflash :'=reflash',
            clear  :'=clear',
            cancel : '&cancel',
        },
        link: function(scope, elem, attr, ctrl) {
            var myDiagram;
            function init() {
                var $ = go.GraphObject.make;  // for conciseness in defining templates
                myDiagram =
                    $(go.Diagram, "envDiagramDiv",  // must name or refer to the DIV HTML element
                        {
                            initialContentAlignment: go.Spot.TopCenter,
                            "grid.visible": false,
                            allowMove:true,//画布上的节点是否可以拖动
                            allowDrop: true,  // must be true to accept drops from the Palette
                            "ChangedSelection": updateSelection,// when click your node or group then selected it
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            "undoManager.isEnabled": false,  // enable undo & redo
                            "allowCopy": false,  // for the copy
                            "allowDelete": false, // for the delete
                            autoScale:go.Diagram.UniformToFill,// initialAutoScale: go.Diagram.UniformToFill,
                            layout:
                                $(go.TreeLayout,
                                    {
                                        treeStyle: go.TreeLayout.StyleLastParents,
                                        arrangement: go.TreeLayout.ArrangementHorizontal,
                                        angle: 90,
                                        layerSpacing: 35,
                                        alternateNodeSpacing: 20
                                    }),
                        }
                    );
                myDiagram.addDiagramListener("LayoutCompleted", function (e) {
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                myDiagram.addDiagramListener("ChangedSelection", function(){
                    scope.model.nodeDataArray = myDiagram.model.nodeDataArray;
                    scope.model.linkDataArray = myDiagram.model.linkDataArray;
                });
                myDiagram.addDiagramListener("SelectionDeleted", function(){
                    scope.cancel();
                });
                myDiagram.addDiagramListener("BackgroundSingleClicked", function(){
                    scope.cancel();
                });
                function nodeStyle() {
                    return [
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        new go.Binding("layerName", "isHighlighted", function(h) { return "Foreground"; }).ofObject(),
                        {
                            locationSpot: go.Spot.Center,
                            cursor:'pointer',
                            mouseEnter: function (e, obj) {
                            },
                            mouseLeave: function (e, obj) {
                            },
                            click:function(e,obj){
                                obj.part.stroke = "#CCCCCC";
                                scope.config({key:obj.data});
                                showConfigDiv();
                            }
                        }
                    ];
                }
                myDiagram.nodeTemplateMap.add("cNode",  // the default category
                    $(go.Node, "Spot",nodeStyle(),
                        $(go.Panel, "Auto",
                            $(go.Shape, "Rectangle",
                                {fill: "#091016",cursor: "pointer", stroke: "#1D3D4F", strokeWidth:1, width:200,height:80}),
                            $(go.Panel, "Auto",{padding:6,alignment:go.Spot.Left},
                                $(go.Picture, {
                                        width: 38, height: 34,
                                    },
                                    new go.Binding("source", "", function(node) {
                                        if(node.config_flag){
                                            if(node.logical_node_type == 1){return 'img/public/struct/custom_impl_c.png';}
                                            else if(node.logical_node_type == 2){return 'img/public/struct/was_impl_c.png';}
                                            else if(node.logical_node_type == 3){return 'img/public/struct/weblogic_impl_c.png';}
                                            else if(node.logical_node_type == 4){return 'img/public/struct/sql_impl_c.png';}
                                            else if(node.logical_node_type == 5){return 'img/public/struct/as400_impl_c.png';}
                                            else if(node.logical_node_type == 6){return 'img/public/struct/svn_impl_c.png';}
                                        }else{
                                            if(node.logical_node_type == 1){return 'img/public/struct/custom_impl_u.png';}
                                            else if(node.logical_node_type == 2){return 'img/public/struct/was_impl_u.png';}
                                            else if(node.logical_node_type == 3){return 'img/public/struct/weblogic_impl_u.png';}
                                            else if(node.logical_node_type == 4){return 'img/public/struct/sql_impl_u.png';}
                                            else if(node.logical_node_type == 5){return 'img/public/struct/as400_impl_u.png';}
                                            else if(node.logical_node_type == 6){return 'img/public/struct/svn_impl_u.png';}
                                        }
                                    })
                                )),
                            $(go.Panel, "Auto",{margin: new go.Margin(0, 0, 0, 50),width:100,alignment:go.Spot.Left},
                                $(go.TextBlock,
                                    {
                                        font: '12px Microsoft YaHei',
                                        stroke: '#d2f1fe'
                                    },
                                    new go.Binding("text").makeTwoWay()
                                )
                            ),
                            $(go.Panel, "Auto",{margin: new go.Margin(30, 0, 0, 50),alignment:go.Spot.Left},
                                $(go.TextBlock,
                                    {
                                        font: '12px Microsoft YaHei',
                                        stroke: '#72a0f1'
                                    },
                                    new go.Binding('visible','visible').makeTwoWay()
                                )
                            )
                        )
                    ));
                myDiagram.linkTemplate =
                    $(go.Link,
                        $(go.Shape,{stroke: "gray",fill:"gray"}),
                        $(go.Shape, { toArrow: "Standard" ,stroke: null,fill:"gray"})
                    );

                // link的类型，箭头样式:
                myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
                myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
                load();  // load an initial diagram from some JSON text
                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }
                myDiagram.doFocus = customFocus;
            } // end init
            function load() {
                myDiagram.model = go.Model.fromJson(scope.model);
            }
            function updateSelection(e) {
                myDiagram.model.selectedNodeData = null;
                var it = myDiagram.selection.iterator;
                while (it.next()) {
                    var selnode = it.value;
                    // ignore a selected link or a deleted node
                    if (selnode instanceof go.Node && selnode.data !== null) {
                        myDiagram.model.selectedNodeData = selnode.data;
                        break;
                    }
                }
                scope.$applyAsync();  //手动更新页面
            }
            function showConfigDiv(){
                var _canvas_h = $('#envDiagramDiv').height()*0.7+'px';
                $('.config-properties-container').animate({height:_canvas_h},400);
            }
            function resetConfigHeight() {
                var _config_container_height = $('#config-page-container').height();
                if(_config_container_height){
                    $('#envDiagramDiv').height(_config_container_height - 72);
                }
                if($('.config-properties-container').height() > 10){
                    var _canvas_h = $('#envDiagramDiv').height()*0.7;
                    $('.config-properties-container').height(_canvas_h);
                }
            }
            resetConfigHeight();

            //窗口变化
            $(window).resize(function () {
                $timeout(function () {
                    resetConfigHeight();
                },500);
            });
            //刷新图片
            scope.$watch("reflash", function() {
                myDiagram.startTransaction('change node');
                if(myDiagram.model.selectedNodeData){
                    for(var i =0;i < scope.model.nodeDataArray.length;i++){
                        if(scope.model.nodeDataArray[i].key == myDiagram.model.selectedNodeData.key){
                            scope.model.nodeDataArray[i].config_flag = true;
                            myDiagram.model.selectedNodeData = scope.model.nodeDataArray[i];
                            var node = myDiagram.findNodeForData(myDiagram.model.selectedNodeData);
                            if (node !== null) {
                                node.updateTargetBindings("");
                            }
                        }
                    }
                }
                myDiagram.commitTransaction('change node');
            },true);
            //清除选中
            scope.$watch('clear',function(){
                if(myDiagram.model.selectedNodeData){
                    myDiagram.clearSelection();
                }
            });
            init();
        }
    };
}]);

//高度拖拽
//resizeHeight 最小高度
cvDirectives.directive('resizeHeight',["$compile", "$timeout", function($compile, $timeout){
    return {
        restrict: 'AE',
        require: '?ngModel',
        link: function(scope, elem, attr, ctrl){
            //判断鼠标按下标志
            var _is_mousedown = false;
            //按下鼠标时记录的纵坐标、最小高度
            var _clientY = "", _max_height,  _min_height = attr.resizeHeight;
            //拖拽的边
            var _resize_ball = $(elem).prepend("<div class='resize-ball'></div>")[0].firstElementChild;
            //拖拽区的高度
            var _height = 0;
            $(_resize_ball).on("mousedown",function(e){
                _height = parseFloat($(elem).css('height'));
                _max_height = parseFloat($('.resize-parent').css('height'));
                _clientY = e.clientY;
                _is_mousedown = true;
                $(_resize_ball).addClass('resize-mask');
            });
            $(document).on("mousemove", function (e) {
                if(_is_mousedown){
                    var _timer = "";
                    var _resize_height = _height+ (_clientY - e.clientY);
                    if(_timer){
                        $timeout.cancel(_timer);
                    }
                    _timer = $timeout(function(){
                        //console.log('_resize_height   ',_resize_height);
                        //console.log('_min_height   ',_min_height);
                        if(_resize_height < _min_height){
                            _resize_height = _min_height;
                        }else if(_resize_height > _max_height){
                            _resize_height = _max_height;
                        }
                        $(elem).css('height',_resize_height+'px');
                    },50)
                }
            })
            $(document).on("mouseup",function(e){
                _is_mousedown = false;
                $(_resize_ball).removeClass('resize-mask');
            })

        }
    };
}]);
/**圆形进度条指令
 * percent 百分比
 * fontSize 自定义字体大小
 *
 */
cvDirectives.directive('cycleProgress', ["$compile", function ($compile) {
    return {
        restrict: 'AE',
        scope:{
            percent : '=percent',
            fontSize: '@fontSize',
        },
        link: function(scope, elem, attr, ctrl){
            var _percent = scope.percent || 0; //进度百分比
            var _font_size = scope.fontSize || 12; //文本字体大小
            var _show_text_flag = attr['showText'];//文本进度显示标志
            var _width = attr['width'] || 100;
            var _height = attr['height'] || 100;
            var _circle_width = attr['circleWidth'] || 10;
            var _html = "<canvas width="+_width+" height="+ _height +"></canvas>";
            elem.append($compile(_html)(scope));
            var _dom = elem.find('canvas');
            var _real_width = _dom.width = _width || 34; //宽度
            var _real_height=_dom.height = _height || 34;//高度
            var _context = _dom.get(0).getContext('2d');
            var gradient = _context.createLinearGradient(0,0,_real_width,0);//线颜色渐变
            var _rad = Math.PI*2/100; //将360度分成100份，那么每一份就是rad度
            var _speed = 0; //加载的速度
            var _center_x = _real_width/2;//Canvas中心点x轴坐标
            var _center_y = _real_height/2;//Canvas中心点y轴坐标
            gradient.addColorStop(0,'#24f7a6');
            gradient.addColorStop(1,'#3dd4fe');
            //背景圆环
            function backgroundCircle(){
                _context.save();
                _context.beginPath();
                _context.lineWidth = _circle_width;
                var _radius = _center_x - _context.lineWidth;
                _context.lineCap = "round";
                _context.strokeStyle = '#44515A';
                _context.arc(_center_x,_center_y,_radius,0,Math.PI*2,false);
                _context.stroke();
                _context.closePath();
                _context.restore();
            }
            //绘制文字
            function text(n){
                _context.save(); //save和restore可以保证样式属性只运用于该段canvas元素
                _context.fillStyle = "#fff";
                _context.font = _font_size + "px Helvetica";
                var _text_width = _context.measureText(n.toFixed(0)+"%").width;
                _context.fillText(n.toFixed(0)+"%", _center_x -_text_width/2 , _center_y +_font_size/2);
                _context.restore();
            }
            //运动圆环
            function foregroundCircle(n){
                _context.save();
                _context.strokeStyle = gradient;
                _context.lineWidth = _circle_width;
                _context.lineCap = "round";
                var _radius = _center_x - _context.lineWidth;
                _context.beginPath();
                _context.arc(_center_x,_center_y,_radius,-Math.PI/2,-Math.PI/2 + n*_rad ,false);
                _context.stroke();
                _context.closePath();
                _context.restore();
            }
            //执行动画
            (function drawFrame(){
                _context.clearRect(0, 0, _real_width, _real_height);
                backgroundCircle();
                if(!_show_text_flag){
                    text(_speed);
                }
                foregroundCircle(_speed);
                if(_speed >= _percent) return;
                _speed += 1;
                window.requestAnimationFrame(drawFrame);
            }());
        }
    };
}]);
/**内容上下左右无缝滚动指令
 * scrollHeight 每次滚动的高度
 * scrollNumber 滚动触发的items个数
 * scrollDate   滚动的数据
 */
cvDirectives.directive('slideFollow',["$compile","$timeout",function ($compile,$timeout) {
    return{
        restrict:'AE',
        scope:{
            scrollHeight:'=scrollHeight',
            scrollNumber : '=scrollNumber',
            scrollDate : '=scrollDate',
            scrollIndex:'=scrollIndex'
        },
        link:function (scope,elem,attrs) {
            $timeout(function () {
                var index = scope.scrollIndex || 0;
                var sh;
                var iLength = scope.scrollDate.length;
                var  _slide = function(){
                    if (parseInt($(elem).css("top")) > (-iLength * parseInt(scope.scrollHeight))) {
                        index++;
                        $(elem).animate({
                            top : -(parseInt(scope.scrollHeight)) * index + "px"
                        },2000);
                    } else {
                        index = 1;
                        $(elem).css("top","0px");
                        $(elem).animate({
                            top : -(parseInt(scope.scrollHeight)) + "px"
                        },2000);
                    }
                };
                if( scope.scrollDate.length >  scope.scrollNumber){
                    // 开启定时器
                    sh = setInterval(_slide,5000);
                    // 清除定时器
                    $(elem).hover(function(){
                        clearInterval(sh);
                    },function(){
                        clearInterval(sh);
                        sh = setInterval(_slide,5000);
                    })
                }
                scope.$watch("scrollDate.length",function (val) {
                    if(val > 5 && !sh){
                        sh = setInterval(_slide,5000);
                    }
                    iLength = val;
                })

            },0)

        }
    }
}]);

/**
 * show-date 大屏监控尾部滑动显示指令
 * date-list 滚动显示的数据列表
 * **/
cvDirectives.directive('showDate',["$compile","$interval","$timeout", function ($compile,$interval,$timeout) {
    return{
        restrict:'AE',
        scope: {
            dateList : '=',
            slideIndex:'='
        },
        link:function (scope,elem,attrs) {
            $timeout(function () {
                var _header_width,_body_width,_header_sh,_body_sh,_header_block,_body_block,_list_length;
                var _header_index = scope.slideIndex || 0;
                var _body_index = scope.slideIndex || 0;
                var _faile_flag;
                _faile_flag = scope.dateList[scope.slideIndex].execute_faile ? scope.dateList[scope.slideIndex].execute_faile : false;
                _list_length = scope.dateList.length;
                _header_block = $(elem).children('#header_block').children('.sys-list');
                _body_block = $(elem).children('#body_block').children('.slide-container');
                _body_width  =  $(elem).children('#body_block').width();
                _body_block.css({'width': (_body_width*_list_length)*2 +'px','margin-left': -(_body_index * _body_width)+'px' ,'display':'flex'});
                _body_block.children('.sys-monitor-detail').css({'width':_body_width + 'px'});
                _header_width = 270;
                //根据阶段运行状况 重置定时器时间
                var resetInterval = function (time) {
                    var _time = time || 5000; //默认5秒
                    if(_body_sh) clearInterval(_body_sh);
                    if(_header_sh) clearInterval(_header_sh);
                    if(_list_length >  1){
                        // 开启定时器
                        _body_sh = setInterval(_body_slide,_time);
                    }
                    if(_list_length >  5){
                        // 开启定时器
                        _header_sh = setInterval(_header_slide,_time);
                    }
                };
                //头部滚动
                var  _header_slide = function(){
                    if (parseInt(_header_block.css("margin-left")) > (-_list_length * parseInt(_header_width))) {
                            _header_index++;
                            _header_block.animate({
                                marginLeft : -(parseInt(_header_width)) * _header_index + "px"
                            },2000);
                        } else {
                            _header_index = 1;
                            _header_block.css("margin-left","0px");
                            _header_block.animate({
                                marginLeft : -(parseInt(_header_width)) + "px"
                            },2000);
                        }
                };
                //内容滚动
                var  _body_slide = function(){
                    if (parseInt(_body_block.css("margin-left")) > (-_list_length * parseInt(_body_width))) {
                        _body_index++;
                        _body_block.animate({
                            marginLeft : -(parseInt(_body_width)) * _body_index + "px"
                        },2000);
                    } else {
                        _body_index = 1;
                        _body_block.css("margin-left","0px");
                        _body_block.animate({
                            marginLeft : -(parseInt(_body_width)) + "px"
                        },2000);
                    }
                    if(scope.slideIndex == _list_length-1){
                        scope.slideIndex = 0;
                    }else{
                        scope.slideIndex = _body_index;
                    }
                    if(scope.dateList[scope.slideIndex]){
                        _faile_flag = scope.dateList[scope.slideIndex].execute_faile;
                    }
                    if(_faile_flag){
                        resetInterval(10000)
                    }else{
                        resetInterval()
                    }
                };
                if(_faile_flag){
                    resetInterval(10000)
                }else{
                    resetInterval()
                }
                // 清除定时器
                $(elem).hover(function(){
                    if(_body_sh) clearInterval(_body_sh);
                    if(_header_sh) clearInterval(_header_sh);
                },function(){
                    resetInterval()
                })
                scope.$watch("dateList.length",function (val) {
                    _list_length = val;
                    $timeout(function () {
                        _body_block.css({'width': (_body_width*_list_length)*2 +'px','margin-left': -(_body_index * _body_width)+'px' ,'display':'flex'});
                        _body_block.children('.sys-monitor-detail').css({'width':_body_width + 'px'});
                    },0)
                    resetInterval();
                })
            },0)
        }
    }
}]);
/**
 * 发布-大屏监控-行星旋转效果
 * data 数据列表 格式如:[{'key1':'value1','key2':'value2'}]
 * **/
cvDirectives.directive('merryGoRound',["$compile","$interval","$timeout", function ($compile,$interval,$timeout) {
    return{
        restrict:'AE',
        scope: {
            data : '=data',
        },
        link:function (scope,elem,attrs) {
            $timeout(function () {
                //TODO:暂时最大支持30个数据(待优化)
                scope.data = scope.data ? scope.data.slice(0,30) : [];
                var circle_x = 0;   //圆心的X坐标
                var circle_y = 0;   //圆心的Y坐标
                var circle_a = 110; //椭圆长轴
                var circle_b = 50;  //椭圆短轴
                var _rotate_angle = 20;  //整体倾斜角度(度数)
                var _translate_x = -60;  //整体x偏移量
                var _translate_y = 0;   //整体y偏移量
                var balls_array = [];   //用来存储小球信息
                var angle_change = 0.5; //角度变化(速度)
                var _canvas = $(elem)[0]; //画布
                var _context = _canvas.getContext('2d');//画布环境
                var _rotate_timer; //绘图定时器
                var publishCircleImg = new Image(); //背景圆图
                var publishRocket = new Image(); //火箭图片

                var init = function(){
                    publishCircleImg.src="../../../img/publish/monitor_list/monitor-bg.png";
                    publishRocket.src = "../../../img/publish/monitor_list/rocket-bg.png";
                    _canvas.addEventListener('mouseover', mouseOverCanvas, false); //鼠标移到Canvas
                    _canvas.addEventListener('mouseout', mouseOutCanvas, false);   //鼠标移出Canvas
                    _context.rotate((-_rotate_angle) * Math.PI / 180 ); //旋转角度
                    circle_x = _canvas.width / 2 + _translate_x;
                    circle_y = _canvas.height / 2 + _translate_y;
                    circle_a = (_canvas.width / Math.cos(_rotate_angle*Math.PI/180))/2 - 55;

                    //创建出椭圆上所有的小圆信息
                    balls_array = createBallInfo();
                    //绘制开始
                    drawStart();
                    if(scope.data.length){
                        if(_rotate_timer) $interval.cancel(_rotate_timer);
                        _rotate_timer = $interval(drawStart,50);
                    }
                };
                //画椭圆
                function drawEllipse(context, x, y, a, b) {
                    context.beginPath();
                    context.save();
                    context.ellipse(x, y, a, b, 0, -0.29* Math.PI, 1.29*Math.PI, false);
                    //线性渐变
                    var lineargradient = context.createLinearGradient(-x*Math.cos(0.8*Math.PI),-y*Math.sin(0.8*Math.PI/180),Math.cos(1.28*Math.PI),Math.sin(1.28*Math.PI));
                    lineargradient.addColorStop(0,'#2FC5E2');
                    lineargradient.addColorStop(1,'#54ED9A');
                    context.strokeStyle = lineargradient;
                    context.stroke();
                    context.restore();
                }

                //小球移动
                function ballMove() {
                    for (var i = 0; i < balls_array.length; i++) {
                        var ball = balls_array[i];
                        if (ball.angle == 360) {ball.angle = 0;}
                        ball.angle = ball.angle + angle_change; //角度
                        var radian = ball.angle * (Math.PI / 180); //弧度
                        ball.x = (circle_x + circle_a * Math.cos(radian)) - ball.w / 2;
                        ball.y = (circle_y + circle_b * Math.sin(radian)) - ball.h / 2;
                        var num = setProp(ball, 0.1, 1);
                        ball.ball_color = formatBallColor(scope.data[i].project_status); //实时同步项目状态

                        //实心球边
                        _context.beginPath();
                        _context.save();
                        _context.globalAlpha = 0.35;
                        _context.arc(ball.x, ball.y + (ball.w)/2, 15*num, 0, 2*Math.PI, false);
                        //径向渐变(开始圆形的 x 轴坐标,开始圆形的 y 轴坐标,开始圆形的半径,结束圆形的 x 轴坐标,结束圆形的 y 轴坐标,结束圆形的半径)
                        var _gradientOuter = _context.createRadialGradient(ball.x, ball.y + (ball.w)/2,0, ball.x,ball.y + (ball.w)/2,15);
                        _gradientOuter.addColorStop(0,"transparent");
                        _gradientOuter.addColorStop(1,ball.ball_color);
                        _context.fillStyle = _gradientOuter;
                        _context.fill();
                        _context.restore();

                        //画实心球
                        _context.beginPath();
                        _context.save();
                        _context.globalAlpha = num;
                        _context.fillStyle = ball.ball_color;
                        _context.arc(ball.x, ball.y + (ball.w)/2, (ball.w)*num, 0, 2*Math.PI, false);
                        _context.fill();

                        //画球上的垂直线
                        _context.moveTo(ball.x, ball.y + (ball.w)/2); //线的原始坐标
                        //rx0:item.x, ry0:item.y + (ball.w)/2 线的原始坐标(rx0,ry0)
                        //x:item.x  y:item.y + (ball.w)/2 + 20 //长度为20的点的坐标(x,y)
                        //(x,y)以(rx0,ry0)为原点，旋转α度后得到的点坐标(_new_x,_new_y)公式如下
                        //_new_x =  (x - rx0)*cos(α) - (y - ry0)*sin(α) + rx0;
                        //_new_y = (x - rx0)*sin(α) + (y - ry0)*cos(α) + ry0 ;
                        var _new_x = (ball.x - ball.x)*Math.cos(_rotate_angle * Math.PI / 180) - (ball.y+(ball.w)/2+20 - ball.y+(ball.w)/2)*Math.sin(_rotate_angle * Math.PI / 180) + ball.x;
                        var _new_y = (ball.x - ball.x)*Math.sin(_rotate_angle * Math.PI / 180) + (ball.y+(ball.w)/2+20 - ball.y+(ball.w)/2)*Math.cos(_rotate_angle * Math.PI / 180) + ball.y + (ball.w)/2;
                        _context.lineTo(_new_x, _new_y);
                        _context.strokeStyle ="rgba(163, 243, 235,0.5)";
                        _context.stroke();
                        _context.globalAlpha = 1;
                        _context.restore();

                        //画文本
                        _context.save();
                        _context.globalAlpha = num;
                        _context.textAlign = "center";
                        _context.textBaseline = "hanging";
                        _context.font = "lighter 10px arial";
                        _context.strokeStyle ="#079FF5";
                        _context.strokeText(ball.text.substring(0,5),_new_x,_new_y);
                        _context.globalAlpha = 1;
                        _context.restore();
                    }
                }
                //创建小球基本信息
                function createBallInfo() {
                    var _list = [];
                    var ballWidth = 6; //小球宽
                    var ballHeight = 6; //小球高
                    for (var i = 0,len=scope.data.length; i < len; i++) {
                        var _single_ball = scope.data[i];
                        var angle = (i + 1) * (360 / len);//角度
                        var radian = angle * (Math.PI / 180);//弧度
                        //存放小球信息
                        var ball = {
                            id: i,
                            w: ballWidth,
                            h: ballHeight,
                            x: (circle_x + circle_a * Math.cos(radian)) - ballWidth / 2,
                            y: (circle_y + circle_b * Math.sin(radian)) - ballHeight / 2,
                            angle:angle,
                            ball_color: formatBallColor(_single_ball.project_status),
                            text:_single_ball.project_name || '',
                        };
                        _list.push(ball);
                    }
                    return _list;
                }
                //鼠标移到Canvas,小球停止移动
                function mouseOverCanvas() {
                    if(_rotate_timer) $interval.cancel(_rotate_timer);
                    $interval.cancel(_rotate_timer)
                }
                //鼠标移出Canvas,小球移动
                function mouseOutCanvas() {
                    if(scope.data.length){
                        if(_rotate_timer) $interval.cancel(_rotate_timer);
                        _rotate_timer = $interval(drawStart,50)
                    }
                }
                //把Y坐标转化为透明度和尺寸属性，范围在n1到n2之间;
                function setProp(ball, n1, n2) {
                    return (((ball.y + ball.h / 2 - circle_y) + 2 * circle_b) / circle_b - 1) / 2 * (n2 - n1) + n1;
                }
                //格式化球颜色(ProjState: ) 1:'待准备' 2:待执行' 3:'执行中' 4:'自动结束' 5:'手动结束' 6:'回退中' 7:'回退成功' 8:'回退失败' 9:'待回退'， 10:'执行异常'
                var formatBallColor = function (project_status) {
                    var _color;
                    switch (project_status) {
                        case 1:
                        case 2:
                        case 9:_color = '#D1D1D1'; break;
                        case 3:
                        case 6:_color = '#40D0F0'; break;
                        case 4:
                        case 5:
                        case 7:_color = '#54EB9D'; break;
                        case 8:
                        case 10:_color = '#EB5454'; break;
                        default: _color='#000';
                    }
                    return _color;
                };
                //开始绘制
                function drawStart() {
                    _context.clearRect(_translate_x,_translate_y, _canvas.width,_canvas.height);
                    _context.drawImage(publishCircleImg,_translate_x,_translate_y, _canvas.width,_canvas.height);//Obj,x,y,w,h

                    _context.save();
                    _context.rotate(_rotate_angle*Math.PI/180);
                    _context.translate(70,-85);
                    _context.drawImage(publishRocket, circle_x-(publishRocket.width)/2, circle_y-(publishRocket.height)/2);
                    _context.restore();

                    drawEllipse(_context,circle_x,circle_y,circle_a,circle_b);
                    ballMove();
                }

                //监控数据长度-变化
                scope.$watch('data.length',function (newValue, oldValue) {
                    if(newValue !== oldValue){
                        //最大支持30个数据
                        if(newValue <= 30){
                            $interval.cancel(_rotate_timer);
                            //重新创建出椭圆上所有的小圆信息
                            balls_array = createBallInfo();
                            drawStart();
                            _rotate_timer = $interval(drawStart,50);
                        }
                    }
                });
                init();
            },0)
        }
    }
}]);


/*发布-大屏监控内部阶段执行滚动*/
cvDirectives.directive('scrollView',["$timeout", function ($timeout) {
    return{
        restrict:'A',
        scope:{
            currentPhase:'=currentPhase',
            phaseDate : '=phaseDate'
        },
        link:function (scope,elem,attrs) {
            $timeout(function () {
                var _ele_parent = elem.parent();
                var _parent_width = _ele_parent.width();
                var _phase_length = scope.phaseDate.length;
                var _phase_width = _phase_length * (44 + 50);
                if(_parent_width < _phase_width){
                    scope.$watch("currentPhase",function (val) {
                        var _curr_width = val * (44 + 50);
                        if(_curr_width > _parent_width){
                            var _distance = _curr_width - _parent_width;
                            elem.animate({
                                'marginLeft' : -_distance + 'px'
                            },"slow")
                        }
                        /*if(_val== 2){
                            if(_ele_left-_ele_parent_left+_ele_width>_parent_width){
                                _ele_parent.animate({
                                    'marginLeft' : -(_ele_left-_ele_parent_left+_ele_width-_parent_width)
                                },"slow")
                            }else {
                                _ele_parent.animate({
                                    'marginLeft' : 0
                                },"slow")
                            }
                        }*/
                    });
                }
            },0)
        }
    }
}]);

/**
 * 项目登记--拼音首字母筛选
 * data:对象数组
 * checkVal:用户自定义选择方法
 * */
cvDirectives.directive('spellScreen',["$timeout", "$compile", "ScrollBarConfig", function ($timeout,$compile,ScrollBarConfig) {
    return {
        restrict : 'EA',
        scope : {
            data : '=data',
            doCheck:'&checkVal',
            keyword:'=searchKeyword',
        },
        templateUrl:'templates/directives/spell_screen.html',
        link : function (scope,elem,attrs) {
            var _click_nav_flag = false,_timer = null;
            //配置数据
            scope.control = {
                letter_nav_top : false,
                show_no_search_data :false,
            };
            //滚动条配置
            scope.sys_screen_scroll = ScrollBarConfig.Y();
            //滚动回调函数
            scope.scoll_callbacks = {
                setLeft: 0,
                setTop:0,
                whileScrolling: function() {
                    if(_click_nav_flag) return;
                    if(_timer){
                        $timeout.cancel(_timer);
                        _timer = null;
                    }
                    _timer = $timeout(highlightNav,25);
                },
                onScroll: function () {
                    _click_nav_flag = false;
                },
                onInit: function () {
                    $('.nav-letter-li:first').addClass('active');
                }
            };

            //鼠标点击事件(滚动到Id位置)
            scope.scrollToId = function (letter,index) {
               _click_nav_flag = true;
               var _letter =  letter === '#' ? '\\#' : letter;
               $('.nav-letter-li').eq(index).addClass('active').siblings().removeClass('active');
                $timeout(function () { scope.sysScrollTo($('#-' + _letter)); },5);
            };
            //鼠标移入事件
            scope.mouseEnter = function (item) {
                if(scope.keyword){
                    var _letter =  item.letter === '#' ? '\\#' : item.letter;
                    var _letter_ele = $('#-' + _letter);
                    item.nav_disabled = _letter_ele.is(':hidden');
                }
            };
            //鼠标移出事件
            scope.mouseLeave = function (item) {
                item.nav_disabled = false;
            };
            //内部选择方法
            scope.checkVal = function(parent,children){
                //执行用户自定义方法
                scope.doCheck({parentObj: parent,childrenObj: children});
            };
            //重置系统容器高度
            scope.resetSysContainerHeight = function () {
                if($('#sys-screen-content').offset()){
                    scope.control.letter_nav_top = $('.nav-letter-ul').height() > $('#sys-screen-content').height();
                    return {
                        height : $(window).height() - $('#sys-screen-content').offset().top - 90
                    }
                }
            };
            //监控关键字变化
            scope.$watch('keyword',function (newValue,oldValue) {
                if(newValue !== oldValue){
                    $timeout(function () {
                        scope.control.show_no_search_data = $('.letter-container.ng-hide').length === scope.data.length;
                        if(scope.control.show_no_search_data){
                            //未搜索出数据-隐藏字母导航
                            $('.nav-letter-ul').addClass('ng-hide');
                        }else {
                            //搜索出数据显示字母导航
                            $('.nav-letter-ul').removeClass('ng-hide');
                            //搜索出来的第一个数据对应的导航字母高亮
                            $('.letter-container').each(function () {
                                var $this = $(this),$this_index = $this.index();
                                if(!$this.hasClass("ng-hide")){
                                    $('.nav-letter-li').eq($this_index).addClass('active').siblings().removeClass('active');
                                    return false;
                                }
                            })
                        }
                    },5);
                }
            });
            //导航字母高亮
            function highlightNav () {
                 $('.letter-container').each(function () {
                    var $this = $(this),$this_index = $this.index();
                     //10:(上下内边距之和)
                    if($this.offset().top + $this.height() - 10 > $('#sys-screen-content').offset().top){
                        $('.nav-letter-li').eq($this_index).addClass('active').siblings().removeClass('active');
                        if(scope.control.letter_nav_top){
                            //导航隐藏时-导航跟随滚动
                            $('.nav-letter-ul').css('top',-$this_index *10 + 20);
                        }else {
                            $('.nav-letter-ul').css('top','50%');
                        }
                        return false;
                    }
                });
            };
            //初始化第一个导航高亮
            $timeout(function () {
                $('.nav-letter-li:first').addClass('active');
            },10);
            $(window).resize(function () {
                $timeout(function () {
                    scope.resetSysContainerHeight();
                },100)
            })
        }
    }
}]);

/**自定义表格分页**/
cvDirectives.directive('tablePagination',["$timeout", function ($timeout) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {option: '=pageOption'},
        template: '<ul class="pagination">'
                    + '<li ng-click="pageClick(p)" ng-repeat="p in page" class="{{option.curr==p?\'active\':\'\'}}">'
                    + '<a href="javascript:;">{{p}}</a>'
                    + '</li>'
                    + '</ul>',
        link: function ($scope) {
            //容错处理
            if (!$scope.option.limit_recd || isNaN($scope.option.limit_recd) || $scope.option.limit_recd < 1) $scope.option.limit_recd = 10;
            if (!$scope.option.curr || isNaN($scope.option.curr) || $scope.option.curr < 1) $scope.option.curr = 1;
            if (!$scope.option.all_recd || isNaN($scope.option.all_recd) || $scope.option.all_recd < 1) {
                $scope.option.all = 1
            }else {
                $scope.option.all =  Math.ceil($scope.option.all_recd/$scope.option.limit_recd);
            };
            if ($scope.option.curr > $scope.option.all) $scope.option.curr = $scope.option.all;
            if (!$scope.option.count || isNaN($scope.option.count) || $scope.option.count < 1) $scope.option.count = 10;
            //得到显示页数的数组
            $scope.page = getRange($scope.option.curr, $scope.option.all, $scope.option.count);
            //绑定点击事件
            $scope.pageClick = function (page) {
                if (page == '«') {
                    page = parseInt($scope.option.curr) - 1;
                } else if (page == '»') {
                    page = parseInt($scope.option.curr) + 1;
                }
                if (page < 1) page = 1;
                else if (page > $scope.option.all) page = $scope.option.all;
                //点击相同的页数 不执行点击事件
                if (page == $scope.option.curr) return;
                if ($scope.option.click && typeof $scope.option.click === 'function') {
                $scope.option.click(page);
                $scope.option.curr = page;
                $scope.page = getRange($scope.option.curr, $scope.option.all, $scope.option.count);
            }
        };

    //返回页数范围（用来遍历）
    function getRange(curr, all, count) {
        //计算显示的页数
        curr = parseInt(curr);
        all = parseInt(all);
        count = parseInt(count);
        var from = curr - parseInt(count / 2);
        var to = curr + parseInt(count / 2) + (count % 2) - 1;
        //显示的页数容处理
        if (from <= 0) {
            from = 1;
            to = from + count - 1;
            if (to > all) {
                to = all;
            }
        }
        if (to > all) {
            to = all;
            from = to - count + 1;
            if (from <= 0) {
                from = 1;
            }
        }
        var range = [];
        for (var i = from; i <= to; i++) {
            range.push(i);
        }
        range.push('»');
        range.unshift('«');
        return range;
    }
}
    }
}]);

/**包上传选择文件树指令**/
cvDirectives.directive('packageTree',['$timeout', 'treeConfig', "CV",function($timeout, treeConfig, CV){
    return  {
        restrict: 'E',
        scope:{
            files: '=',
        },
        templateUrl: 'templates/directives/package_tree.html',
        link: function(scope, elem, attrs) {
            var _nodes = [];
            //更改配置默认为收起状态
            treeConfig.defaultCollapsed=true;
            var processTreeDate = function (list) {
                for(var i= 0; i< list.length ; i++){
                    if(list[i].nodes){
                        for(var j =0 ;j<list[i].nodes.length;j++){
                            if(list[i].nodes[j].nodes){
                                for(var k = 0; k< list[i].nodes[j].nodes.length;k++){
                                    list[i].nodes[j].nodes[k].nodes = [];
                                }
                            }
                        }
                    }
                }
                return list;
            };
            var getNextTreeDate = function (file_path,list) {
                for(var i =0 ;i < list.length; i++){
                    if(list[i].file_path == file_path){
                        _nodes = list[i].nodes;
                        break;
                    }else{
                        if(list[i].nodes){
                            getNextTreeDate(file_path,list[i].nodes);
                        }
                    }
                }
                return _nodes;
            }
            var init = function () {//no_init_flag是否需要初始化
                scope.data = processTreeDate(angular.copy(scope.files.nodes));
            };
            //点击获取下一层文件
            scope.getMoreFile = function (scope) {
                var nodeData = scope.$modelValue;
                var _curr_nodes = [];
                scope.toggle();
                _curr_nodes = getNextTreeDate(nodeData.file_path,scope.files.nodes);
                nodeData.nodes = angular.copy(_curr_nodes);
            };
            //选中当前行-复选框
            scope.chooseSingleFile= function (_value,index) {
                if(_value.checked){
                    scope.files.choosed_file_list.push({
                        file_path : _value.file_path,
                        file : _value.file,
                        dir : _value.dir
                    });
                }else{
                    for(var i = 0; i < scope.files.choosed_file_list.length;i++){
                        var _file = scope.files.choosed_file_list[i];
                        if(_file.file == _value.file && _file.file_path == _value.file_path){
                            scope.files.choosed_file_list.splice(i,1);
                            break;
                        }
                    }
                }
            };
            init();
        }
    }
}]);

cvDirectives.directive('reLoad',['$timeout', 'treeConfig', "CV",function($timeout, treeConfig, CV){
    var num = 0;
    return  {
        restrict: 'A',
        scope:{
            sum: '=',
            name:'='
        },
        link: function(scope, elem, attrs) {
            num++;
            if(num==scope.sum){
                scope.$emit("reLoad", {
                    name:scope.name
                });
                num = 0;
            }
        }
    }
}]);

cvDirectives.directive('reLoadOne',['$timeout', 'treeConfig', "CV",function($timeout, treeConfig, CV){
    var num = 0;
    return  {
        restrict: 'A',
        scope:{
            sum: '=',
            name:'='
        },
        link: function(scope, elem, attrs) {
            num++;
            if(num==scope.sum){
                scope.$emit("reLoadOne", {
                    name:scope.name
                });
                num = 0;
            }
        }
    }
}]);

cvDirectives.directive('reLoadTwo',['$timeout', 'treeConfig', "CV",function($timeout, treeConfig, CV){
    var num = 0;
    return  {
        restrict: 'A',
        scope:{
            sum: '=',
            name:'='
        },
        link: function(scope, elem, attrs) {
            console.log(scope.sum);
            num++;
            if(num==scope.sum){
                scope.$emit("reLoadTwo", {
                    name:scope.name
                });
                num = 0;
            }
        }
    }
}]);

cvDirectives.directive('reLoadInfo',['$timeout', 'treeConfig', "CV",function($timeout, treeConfig, CV){
    var num = 0;
    return  {
        restrict: 'A',
        scope:{
            sum: '=',
            name:'='
        },
        link: function(scope, elem, attrs) {
            num++;
            if(num==scope.sum){
                scope.$emit("reLoadInfo", {
                    name:scope.name
                });
                num = 0;
            }
        }
    }
}]);
