var GlobalData = angular.module("GlobalData", []);
/** -------------------------(公共请求头模块)----------------------------- **/
//请求公共数据
GlobalData.factory("CommData", function() {
    return {
        org_user_id         : "",
        org_dept_id         : "",
        org_term_no         : "",
        org_channel_code    : "01",
        org_work_code       : "",
        org_srv_name        : "",
        org_rs_code         : "00",
        submit_type         : 1,
        orguser_cn_name     : '',
        orgdept_cn_name     : ''
    }
});
/** -------------------------(发布管理模块)----------------------------- **/
//发布项目--新增项目-发布类型
GlobalData.factory("ProjType", function() {
    return ["例行发布", "紧急发布", "一般项目发布", "大型项目发布", "特大型项目发布"];
});
//项目扭转状态（改版）
GlobalData.factory("ProjectStatus", function() {
    return [
        {key: 1, value: '已登记'},
        {key: 2, value: '待发布'},
        {key: 3, value: '未审核'},
        {key: 4, value: '发布中'},
        {key: 5, value: '发布异常'},
        {key: 6, value: '正常结束'},
        {key: 7, value: '异常结束'},
        {key: 8, value: '已挂起'},
        {key: 9, value: '已关闭'}
    ];
});
//项目发布类型（改版）
GlobalData.factory("ProjectReleaseType", function() {
    return [
        {key: 1, value: '例行发布'},
        {key: 2, value: '紧急发布'},
        {key: 3, value: '补充发布 '}
    ];
});
//组件--jdk版本
GlobalData.factory("jdkVersion", function() {
    return ["1.5","1.6","1.7","1.8"];
});
//项目登记-发布类型
GlobalData.factory("ProjectNature", function() {
    return [
        {key: 1, value: '例行发布'},
        {key: 2, value: '紧急发布'},
        {key: 3, value: '一般项目发布'},
        {key: 4, value: '大型项目发布'},
        {key: 5, value: '特大型项目发布'}
    ];
});
//项目列表-系统状态
GlobalData.factory("ProjState",function(){
    return [
        {key: 1, value: '待准备'},
        {key: 2, value: '待执行'},
        {key: 3, value: '执行中'},
        {key: 4, value: '自动结束'},
        {key: 5, value: '手动结束'},
        {key: 6, value: '回退中'},
        {key: 7, value: '回退成功'},
        {key: 8, value: '回退失败'},
        {key: 9, value: '待回退'}
    ];
});
//项目列表-发布结果
GlobalData.factory("ProdFlag",function(){
    return [
        {key:1,value:'成功'},
        {key:2,value:'失败'}
    ]
});
//项目发布-执行项目发布-节点状态
GlobalData.factory("ProdNodeState",function(){
    return [
        {key:1,value:'未执行'},
        {key:2,value:'正在执行'},
        {key:3,value:'执行失败'},
        {key:4,value:'执行成功'},
        {key:5,value:'执行跳过'}
    ]
});
//项目发布-执行项目发布-命令状态
GlobalData.factory("ProdCmdState",function(){
    return [
        {key:1,value:'未执行'},
        {key:2,value:'正在执行'},
        {key:3,value:'执行报错'},
        {key:4,value:'验证失败'},
        {key:5,value:'执行成功'},
        {key:6,value:'执行跳过'},
        {key:7,value:'执行终止'},
        {key:8,value:'手动成功'}
    ]
});
//计划编列-项目组颜色
GlobalData.factory("ProjGroupColor", function() {
    return ["#920783", "#8fc31f", "#956134", "#e4007f", "#006934", "#0b318f"];
});
//发布评价-问题类型
GlobalData.factory("IssueType", function() {
    return [
        {key: 1, value: '业务需求问题'},
        {key: 2, value: '发布包错误'},
        {key: 3, value: '代码问题'},
        {key: 4, value: '夹带发布'},
        {key: 5, value: '环境配置错误'},
        {key: 6, value: '发布问题'},
        {key: 7, value: '其他问题'}
    ];
});
//查看准备信息-路径类型
GlobalData.factory("pathType", function() {
    return [
        {key: 1, value: '本地'},
        {key: 2, value: '版本机'}
    ];
});
//文件比对指令--文件编码方式
GlobalData.factory("EncodingType", function() {
    return ['UTF-8', 'GBK'];
});
//文件比对指令--主题样式
GlobalData.factory("ScriptDayNight", function() {
    return ['日间', '夜间'];
});
//发布文件类型
GlobalData.factory("ReleaseFileType", function() {
    return [
        {key:1,value:'txt'},
        {key:2,value:'xlsx'},
        {key:3,value:'xls'},
        {key:4,value:'bat'},
        {key:5,value:'sh'},
        {key:6,value:'xml'},
        {key:7,value:'html'},
        {key:8,value:'properties'},
        {key:9,value:'tar'},
        {key:10,value:'zip'},
        {key:11,value:'rar'},
        {key:12,value:'gz'},
        {key:13,value:'jar'},
        {key:14,value:'sql'},
        {key:15,value:'py'},
        {key:16,value:'java'},
        {key:17,value:'js'}
    ];
});
/** -------------------------(故障管理模块)----------------------------- **/
//故障单任务-任务状态
GlobalData.factory("TaskState", function(){
    return [
        {key:1,value:'待授权'},
        {key:2,value:'授权拒绝'},
        {key:3,value:'待执行'},
        {key:4,value:'执行完毕'},
        {key:5,value:'关闭任务'}
    ];
});
//工单-工单类型
GlobalData.factory("WorkorderType", function() {
    return [
        {key: 1, value: '故障单'},
        {key: 2, value: '常规维护'}
    ];
});
//工单-流转类型
GlobalData.factory("WoFlowType", function() {
    return [
        {key: 1, value: '创建工单'},
        {key: 2, value: '指派工单'},
        {key: 3, value: '退回工单'},
        {key: 4, value: '处理工单'},
        {key: 5, value: '关闭工单'},
        {key: 6, value: '重启工单'}
    ];
});
//工单-工单状态
GlobalData.factory("WoStatusType", function() {
    return [
        {key: 1, value: '待处理'},
        {key: 2, value: '被退回'},
        {key: 3, value: '处理中'},
        {key: 4, value: '已处理'},
        {key: 5, value: '正常关闭'},
        {key: 6, value: '异常关闭'}
    ];
});
//工单-工单处理(关闭)原因
GlobalData.factory("WoCloseType", function() {
    return [
        {key: 1, value: '处理完毕'},
        {key: 2, value: '问题重复'},
        {key: 3, value: '已解决'},
        {key: 4, value: '超时自动关闭'},
        {key: 5, value: '无法处理'}
    ];
});
//工单-工单处理(重启)原因
GlobalData.factory("WoRestartType", function() {
    return [
        {key: 1, value: '问题未解决'}
    ];
});
//方案-SQL语句类型
GlobalData.factory("SqlType", function() {
    return [
        {key: 1, value: 'select(查询)'},
        {key: 2, value: 'update(更新)'},
        {key: 3, value: 'insert(插入)'},
        {key: 4, value: 'delete(删除)'}
    ];
});
//方案-事务处理类型
GlobalData.factory("transactionType", function () {
   return [{
       key:1,value:'整体事务'
   },{
       key:2,value:'独立事务'
   }]
});
//方案-参数类型
GlobalData.factory("SparamType", function() {
    return [
        {key: 1, value: '输入文本'},
        {key: 2, value: '单选框'},
        {key: 3, value: '复选框'},
        {key: 4, value: '下拉框'},
        {key: 5, value:'固定值'}
    ];
});
//方案-SQL参数授权类型
GlobalData.factory("SparamAuthType", function() {
    return [
        {key: 1, value: '本地授权'},
        {key: 2, value: '远程授权'},
    ];
});
//工单处理--SQL维护--时段类型
GlobalData.factory("BucketType", function() {
    return [
        {key: 1, value: '非高峰期'},
        {key: 2, value: '高峰期'}
    ];
});
//参数配置-工作日类型
GlobalData.factory("WorkDayType", function() {
    return [
        {key: 1, value: '普通工作日'},
        {key: 2, value: '普通周末'},
        {key: 3, value: '调休工作日'},
        {key: 4, value: '节假日'},
    ];
});

/** -------------------------(系統巡检管理模块)----------------------------- **/
//指标模型-实例类型
GlobalData.factory("InstanceType", function() {
    return [
        {key: 1, value: '源数据集'},
        {key: 2, value: '分析数据集'},
        {key: 3, value: '表格'},
        {key: 4, value: '折线图'},
        {key: 5, value: '条形图'},
        {key: 6, value: '柱形图'},
        {key: 7, value: '饼图'},
        {key: 8, value: '全局变量'},
        {key: 9, value: 'SQL'},
        {key: 10, value: 'Java'}
    ];
})
//指标模型--数据表--字段类型
GlobalData.factory("FieldType", function() {
    return [
        {key:1,value:'CHAR'},
        {key:2,value:'VARCHAR'},
        {key:3,value:'INT'},
        {key:4,value:'DOUBLE'},
    ];
});
//巡检任务-任务状态
GlobalData.factory("intaskState", function() {
    return [
        {key:1,value:'待导入'},
        {key:2,value:'导入中'},
        {key:3,value:'执行中'},
        {key:4,value:'生成中'},
        {key:5,value:'已完成'},
    ];
});
//数据采集-任务运行状态
GlobalData.factory("coTaskState", function() {
    return [
        {key:1,value:'待执行'},
        {key:2,value:'执行中'},
        {key:3,value:'执行成功'},
        {key:4,value:'执行失败'},
        {key:5,value:'已暂停'},
        {key:6,value:'已关闭'},
    ];
});
//巡检数据库导入文件-类型
GlobalData.factory("FileType", function() {
    return [
        {key:1,value:'SQL'},
        {key:2,value:'JSON'},
        {key:3,value:'CSV'},
        {key:4,value:'OTHER'},
    ];
});

/** -------------------------(公共管理模块)----------------------------- **/
//业务系统-配置-节点数据源用途
GlobalData.factory("ApplicateType", function() {
   return [
       {key : 1, value : '执行'},
       {key : 2, value : '文件'},
       {key : 3, value : '校验'}
   ]
});
//分组列表-发布状态
GlobalData.factory("PublishState", function() {
    return [
        {key: 1, value: '已发布'},
        {key: 2, value: '未发布'},
    ];
});
//发布组件-适应环境
GlobalData.factory("AdaptState", function() {
    return [
        {key: 1, value: 'Linux'},
        {key: 2, value: 'AIX'},
        {key: 3, value: 'AS400'},
        {key: 4, value: 'MySql'},
        {key: 5, value: 'DB2'},
        {key: 6, value: 'ORACLE'},
    ];
});
//CodeMirror配置
GlobalData.factory("CodeMirrorOption",function() {
    var option = {};
    var publicOption = {
        lineWrapping : true,
        lineNumbers: true,
        scrollbarStyle: 'overlay',
        theme:'midnight',
    };
    option.Sh = function(readonly) {
        return angular.extend({readOnly: readonly ? readonly : false}, publicOption, {mode: 'text/x-sh'});
    };
    option.Sql = function(readonly) {
        return angular.extend({readOnly: readonly ? readonly : false}, publicOption, {mode: 'text/x-sql'});
    };
    option.Properties = function(readonly) {
        return angular.extend({readOnly: readonly ? readonly : false}, publicOption, {mode: 'text/x-properties'});
    };
    option.Python = function(readonly) {
        return angular.extend({readOnly: readonly ? readonly : false}, publicOption, {mode: 'text/x-python'});
    };
    option.Java = function(readonly) {
        return angular.extend({readOnly: readonly ? readonly : false}, publicOption, {mode: 'text/x-java'});
    };
    option.Vbs = function(readonly) {
        return angular.extend({readOnly: readonly ? readonly : false}, publicOption, {mode: 'text/vbscript'});
    };
    option.dayOrNight = function(option) {
        if(option) {
            option.theme = option.theme == 'midnight' ? 'default' : 'midnight';
        } else {
            editor_loaded.setOption("theme", editor_loaded.getOption("theme") === 'default' ? 'midnight' : 'default');
        }
    };
    option.getRangeByKey = function(_editor,readonly,keywords,count){
        var _log_list = [];
        _editor.setOption('readOnly', readonly);
        _editor.setOption('lineWrapping', false);
        _editor.setOption('lineNumbers', true);
        _editor.setOption('scrollbarStyle', 'overlay');
        _editor.setOption('theme', 'midnight');
        _editor.setOption('mode', 'text/x-properties');
        return _log_list;
    }
    option.setEditor = function(_editor,type ,plugin_list) {
        /*type 默认1 为shell语言 2 为python语言 3 为java语言 4 为SQL*/
        _editor.setOption('firstLineNumber', 1);
        _editor.setOption('lineWrapping', true);
        _editor.setOption('lineNumbers', true);
        _editor.setOption('scrollbarStyle', 'overlay');
        _editor.setOption('theme', 'midnight');
        _editor.setOption('mode', (type == 4) ? 'text/x-sql' : (type ==2) ? 'text/x-python' : (type ==3) ? 'text/x-java' : 'text/x-sh');
        _editor.on("keypress", function() {
            if(plugin_list && plugin_list.length > 0){
                _editor.showHint({'pluginKeys': plugin_list});
            }else{
                _editor.showHint();
            }
        });
        return _editor;
    };
    option.setParamsEditor = function(_editor) {
        _editor.setOption('lineWrapping', false);
        _editor.setOption('scrollbarStyle', null);
        _editor.setOption('lineNumbers', false);
        _editor.setSize('height', '26px');
        _editor.setOption('mode', 'text/x-sh');
        _editor.setOption('theme', 'midnight');
        _editor.on("keypress", function() {
            //系统参数
            _editor.showHint({'systemKeys':[
                //{key: '${task_no}', text: "${task_no} [任务编号]"},
                //{key: '${verno_path}', text: "${verno_path} [版本目录]"},
                {key: '${project_name}', text: "${project_name} [项目名]"},
                {key: '${update_local_dir}', text: "${update_local_dir} [本地上传路径]"},
                {key: '${script_file}',		text: "${script_file} [脚本文件]"},
                {key: '${script_str}',		text: "${script_str} [脚本字符]"},
            ]});
        });
        _editor.setOption("extraKeys", {
            Enter: function() { return false; },
        });
        return _editor;
    };
    //单独组件-自定义执行命令
    option.setUniqueParamsEditor = function(_editor) {
        _editor.setOption('lineWrapping', false);
        _editor.setOption('scrollbarStyle', null);
        _editor.setOption('lineNumbers', false);
        _editor.setSize('height', '26px');
        _editor.setOption('mode', 'text/x-sh');
        _editor.setOption('theme', 'midnight');
        _editor.on("keypress", function() {
            //系统参数
            _editor.showHint({'systemKeys':[
                //{key: '${task_no}', text: "${task_no} [任务编号]"},
                //{key: '${verno_path}', text: "${verno_path} [版本目录]"},
                {key: '${script_file}',		text: "${script_file} [脚本文件]"},
                {key: '${script_str}',		text: "${script_str} [脚本字符]"},
            ]});
        });
        _editor.setOption("extraKeys", {
            Enter: function() { return false; },
        });
        return _editor;
    };
    //单独组件-自定义执行命令
    option.setNoneParamsEditor = function(_editor) {
        _editor.setOption('lineWrapping', false);
        _editor.setOption('scrollbarStyle', null);
        _editor.setOption('lineNumbers', false);
        _editor.setSize('height', '26px');
        _editor.setOption('mode', 'text/x-sh');
        _editor.setOption('theme', 'midnight');
        _editor.setOption("extraKeys", {
            Enter: function() { return false; },
        });
        return _editor;
    };
    option.showParamsEditor = function(_editor,scope) {
        _editor.setOption('lineWrapping', true);
        _editor.setOption('scrollbarStyle', null);
        _editor.setOption('lineNumbers', false);
        _editor.setSize('height', '80px');
        _editor.setOption('mode', 'text/x-ini');
        _editor.setOption('theme', 'midnight');
        if(scope.data.key_word_list.length!=0){
            _editor.on("keypress", function() {
                //系统参数
                _editor.showHint({'systemKeys': scope.data.key_word_list});
            });
        }
        _editor.setOption("extraKeys", {
            Enter: function() {
                scope.sendCmdMsg();
                scope.$apply();
                // return false;
            }
        });
        return _editor;
    };
    option.getDynamicParams = function(_editor,dynamicList) {
        _editor.setOption('firstLineNumber', 1);
        _editor.setOption('lineWrapping', true);
        _editor.setOption('lineNumbers', true);
        _editor.setOption('mode', 'text/x-sh');
        _editor.setOption('theme', 'midnight');
        _editor.on("keypress", function() {
            //系统参数
            if(dynamicList && dynamicList.length > 0){
                _editor.showHint({'systemKeys': dynamicList});
            }
        });
        _editor.setOption("extraKeys", {
            Enter: function() {
                return false;
            }
        });
        return _editor;
    };

    //调度专用-结果表达式
    option.getDynamicRefParams = function(_editor,dynamicList) {
        _editor.setOption('lineWrapping', false);
        _editor.setOption('scrollbarStyle', null);
        _editor.setOption('lineNumbers', null);
        _editor.setSize('height', '34px');
        _editor.setOption('mode', 'text/x-sh');
        _editor.setOption('theme', 'midnight');
        _editor.on("keypress", function() {
            //系统参数
            if(dynamicList && dynamicList.length > 0){
                _editor.showHint({'systemKeys': dynamicList});
            }
        });
        _editor.setOption("extraKeys", {
            Enter: function() {
                return false;
            }
        });
        return _editor;
    };

    var changeLines = [];   //{line_id: 0, line_ch: ''}
    var pushBeforeChangeLine = function(CodeMirror, changeObj) {
        var pushLine = function(CodeMirror, line_id) {
            var _line_exist = false;
            for(var i = 0; i < changeLines.length; i ++) {
                if(changeLines[i].line_id === line_id) _line_exist = true;
            }
            if(!_line_exist) changeLines.push({line_id: line_id, line_ch: CodeMirror.getLine(line_id)});
        }
        if(changeObj.from.line === changeObj.to.line) { //单行
            pushLine(CodeMirror, changeObj.from.line);
        } else {                                        //多行
            for (var j = changeObj.from.line; j <= changeObj.to.line; j++) {
                pushLine(CodeMirror, j);
            }
        }
    }
    var getOriginalLine = function(line_id) {
        var _line_index = -1;
        for(var i = 0; i < changeLines.length; i ++) {
            if(changeLines[i].line_id === line_id) _line_index = i;
        }
        return _line_index === -1 ? "" : changeLines[_line_index].line_ch;
    }
    var removeMarks = function(curr_marks) {
        for(var i = 0; i < curr_marks.length; i ++) {
            curr_marks[i].clear();
        }
    }

    var editor_loaded;
    option.setFileEditor = function(_editor, readonly) {
        changeLines = [];
        //_editor.setOption('readOnly', readonly);
        _editor.setOption('lineNumbers', true);
        _editor.setOption('styleSelectedText', true);
        _editor.setOption('mode', 'text/x-properties');
        _editor.setOption('styleActiveLine', true); //焦点行高亮
        _editor.setOption('scrollbarStyle', 'overlay');
        _editor.setOption('keyMap', 'vim');
        _editor.setOption('theme', 'midnight');
        _editor.setOption("extraKeys", {
            "F11": function (cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            //"Alt-U": function(cm) {
            //    if(cm.getAllMarks().length !== 0) {
            //        for(var i = 0; i < cm.historySize().undo; i ++) {
            //            cm.undo();
            //        }
            //    }
            //},
            //"U": function(cm) {
            //    if(cm.getAllMarks().length !== 0) {
            //        cm.undo();
            //    }
            //},
            "Ctrl-F": "findPersistent",
            "Cmd-F": "findPersistent",
            "Ctrl-H": "replace",
            "Cmd-H": "replace",
            "Ctrl-G":"jumpToLine",
            "Cmd-G":"jumpToLine"
        //"Cmd-G":"jumpToLine"
        });
        _editor.on("beforeChange", function(CodeMirror, changeObj) {
            if(CodeMirror.getLine(changeObj.from.line)) pushBeforeChangeLine(CodeMirror, changeObj);
        });
        _editor.on("change", function(CodeMirror, changeObj) {
            if(changeObj.from.line === 0 && changeObj.from.ch === 0) {
                return false;
            }
            if(changeObj.from.line === changeObj.to.line) { //单行
                var original_line_ch = getOriginalLine(changeObj.from.line);
                var change_line_ch = CodeMirror.getLine(changeObj.from.line);
                if(change_line_ch !== original_line_ch && change_line_ch !== '') {   //只修改，没有删除行
                    _editor.markText({line: changeObj.from.line, ch: 0}, {line: changeObj.from.line, ch: change_line_ch.length}, {className: "selected-background"});   //通行标记
                } else if(change_line_ch === original_line_ch) {                     //手动将该行恢复原样
                    removeMarks(_editor.findMarks({line: changeObj.from.line, ch: 0}, {line: changeObj.from.line, ch: change_line_ch.length}));
                } else if(change_line_ch === '') {
                    //auto clear marks
                }
            }
        });
        editor_loaded = _editor;
    };

    //文件比对
    option.setFileCompareBg = function(_editor, readonly) {
        _editor.setOption('readOnly', true);
        _editor.setOption('firstLineNumber', 1);
        _editor.setOption('lineWrapping', true);
        _editor.setOption('lineNumbers', true);
        _editor.setOption('scrollbarStyle', 'overlay');
        _editor.setOption('mode', 'text/x-filecompare');
        _editor.setOption('theme', 'midnight');
        _editor.setSize('height', '500px'); //自定义高度
        _editor.setOption('viewportMargin',10);
        return _editor;
    };
    //交互式Sql编辑
    option.setSqlFileEditor = function(_editor) {
        changeLines = [];
        _editor.setOption('lineNumbers', true);
        _editor.setOption('lineWrapping', true);
        _editor.setOption('styleSelectedText', true);
        _editor.setOption('mode', 'text/x-sql');
        _editor.setOption('styleActiveLine', false); //焦点行高亮
        _editor.setOption('scrollbarStyle', 'overlay');
        _editor.setOption('theme', 'midnight');
        _editor.on("beforeChange", function(CodeMirror, changeObj) {
            if(CodeMirror.getLine(changeObj.from.line)){
                pushBeforeChangeLine(CodeMirror, changeObj);
            }
        });
        _editor.on("change", function(CodeMirror, changeObj) {
            if(changeObj.from.line === 0 && changeObj.from.ch === 0) {
                return false;
            }
            if(changeObj.from.line === changeObj.to.line) { //单行
                var original_line_ch = getOriginalLine(changeObj.from.line);
                var change_line_ch = CodeMirror.getLine(changeObj.from.line);
                if(change_line_ch !== original_line_ch && change_line_ch !== '') {   //只修改，没有删除行
                    _editor.markText({line: changeObj.from.line, ch: 0}, {line: changeObj.from.line, ch: change_line_ch.length}, {className: "update-background"}); //通行修改标记
                } else if(change_line_ch === original_line_ch) {                     //手动将该行恢复原样
                    removeMarks(_editor.findMarks({line: changeObj.from.line, ch: 0}, {line: changeObj.from.line, ch: change_line_ch.length}));
                }else if(change_line_ch === '') {
                    //auto clear marks
                }
            }
        });
        editor_loaded = _editor;
    };

    return option;
});
//组件-实现类型
GlobalData.factory("IML_TYPE", function() {
    return [
        {key: 1, value: 'FTP'},
        {key: 2, value: 'SHELL'},
        {key: 3, value: 'WAS'},
        {key: 4, value: 'SVN'},
        {key: 5, value: 'WEBLOGIC'},
        {key: 6, value: 'SQL'},
        {key: 7, value: 'PYTHON2'},
        {key: 8, value: 'PYTHON3'},//9 配置,10 人工阶段 11 BAT 12 FireFly 13
      /*  {key: 9, value: 'CONFIG'},
        {key: 10, value: 'MANUAL'},
        {key: 11, value: 'BAT'},
        {key: 12, value: 'FIREFLY'},
        {key: 13, value: 'CLEARCASE'},*/
        {key: 14, value: 'JAVA'},
        {key: 15, value:'C/C++'},
        {key: 16, value:'AUTOIT'},
        {key: 18, value:'AS400_CL'},//自定义
        {key: 19, value:'AS400_BGM'},//自定义
        {key: 17, value:'自定义'},//自定义
    ];
});
//组件-组件类型
GlobalData.factory("CmptType", function() {
    return [
        {key: 1, value: '应用发布'},
        {key: 2, value: '日志巡检'},
        {key: 3, value: '作业调度'},
        {key: 4, value: '故障维护'},
        {key: 5, value: '发布验证'}
    ];
});
//组件适配系统类型
GlobalData.factory("CmptSysType", function () {
   return [
           {key :1, value:'linux'},
           {key :2, value:'aix'}
           ];
});
//组件配置--节点对应的系统
GlobalData.factory("OperateSys",function () {
   return [
           { key:1,value:"linux"},
           {key :2,value:"windows"},
           {key:3,value:"ios"},
           {key:4,value:"未知"},
           {key:5,value:"aix"},
           {key:6,value:"hp-ux"},
           {key:7,value:"freebsd"},
           {key:8,value:"sco"},
           {key:9,value:"`"}
       ]
});
//流程模板-参数-类型
GlobalData.factory("ParamType", function() {
    return [
        {key: 1, value: '项目参数'},
        {key: 2, value: '发布包参数'}
    ];
});
//业务系统-配置-协议类型
GlobalData.factory("ProtocolType", function() {
    return [
        {key:1,value:'JDBC'},
        {key:2,value:'PLT_FTP'},
        {key:3,value:'AS400_FTP'},
        {key:4,value:'SCP_FTP'},
        {key:5,value:'SSH'},
        {key:6,value:'AS400_PGM'},
        {key:7,value:'AS400_CL'},
        {key:8,value:'ESB'},
        {key:9,value:'SFTP'},
        {key:10,value:'TELNET'},
        {key:11,value:'WAS'},
        {key:12,value:'WEBLOGIC'},
        {key:13,value:'SVN'},
        {key:14,value:'HTTP'},
        {key:15,value:'AGENT'},
        {key:16,value:'FIREFLY'},
        {key:17,value:'CLEARCASE'}
    ];
});
//应用系统配置-节点类型
GlobalData.factory("NodeType", function() {
    return [
        {key:1,value:'数据库'},
        {key:2,value:'Web'},
        {key:3,value:'App'},
        {key:4,value:'版本'},
    ];
});
//应用系统配置-方案类型
GlobalData.factory("ProgType", function() {
    return [
        {key:1,value:'发布方案'},
        {key:2,value:'回退方案'},
    ];
});
//应用系统分类-日志分类
GlobalData.factory("LogType", function() {
    return [
        {key:1,value:'系统日志'},
        {key:2,value:'应用服务器日志'},
        {key:3,value:'中间件日志'},
        {key:4,value:'业务日志'},
        {key:0,value:'其他'},
    ];
});
//应用系统分类-日志格式分类
GlobalData.factory("LogFormat", function() {
    return [
        {key:1,value:'TXT'},
        {key:2,value:'XML'},
        {key:3,value:'CSV'},
        {key:4,value:'JSON'},
        {key:5,value:'其他'},
    ];
});
//应用系统分类-日志字符编码分类
GlobalData.factory("logCharacterEncod", function() {
    return [
        {key:'UTF-8',value:'UTF-8'},
        {key:'GBK',value:'GBK'},
        {key:'EBCDIC',value:'EBCDIC'},
       /* 'UTF',
        'GBK',
        'EBCDIC',*/
    ];
});
//应用系统分类-日志换行方式分类
GlobalData.factory("logWrapStyle", function() {
    return [
        {key:1,value:'\\n'},
        {key:2,value:'\\r\\n'},
        {key:3,value:'\\r'},
    ];
});
//应用系统分类-时间戳格式分类
GlobalData.factory("logTimeStampType", function() {
    return [
        {key:1,value:'HH:mm:ss'},
        {key:2,value:'HHmmss'},
    ];
});
//应用系统-最近的日期格式
GlobalData.factory("newLogDateStampType", function() {
    return [
        {key:'\\d{4}[-]\\d{2}[-]\\d{2}',value:'yyyy-mm-dd(适合2017-11-09)'},
        {key:'\\d{4}[.]\\d{2}[.]\\d{2}',value:'yyyy.mm.dd(适合2017.11.09)'},
        {key:'\\d{2}[.]\\d{2}[.]\\d{2}',value:'yy.mm.dd(适合17.11.09)'},
        {key:'\\d{2}\\d{2}\\d{2}',value:'yymmdd(适合170911，171109等)'},
        {key:'\\d{4}\\d{2}\\d{2}',value:'yyyymmdd(适合20170911，20171109等)'},
    ];
});
//应用系统-最近的时间格式
GlobalData.factory("newLogTimeStampType", function() {
    return [
        {key:'[0-2][0-9][-][0-5][0-9][-][0-5][0-9]',value:'hh-mm-ss(适合12-20-30)，支持-分割'},
        {key:'[0-2][0-9][:][0-5][0-9][:][0-5][0-9]',value:'hh:mm:ss(适合12:20:30, 支持:分割)'},
        {key:'[0-2][0-9][:][0-5][0-9][:][0-5][0-9][.][1-9]{3}',value:'hh:mm:ss.SSS(适合12:20:30.222)'},
        {key:'[0-2][0-9][-][0-5][0-9][-][0-5][0-9][.][1-9]{3}',value:'hh-mm-ss.SSS(适合12-20-30.222)'},
        {key:'[0-2][0-9][0-5][0-9][0-5][0-9]',value:'hhmmss(适合122030)'},
        {key:'[0-2][0-9][0-5][0-9][0-5][0-9][.][1-9]{3}',value:'hhmmss.SSS(适合122030.123)'},
    ]
});
//日志巡检-报告模板日期分类
GlobalData.factory("ReportTemplateDateType", function() {
    return [
        {key:0,value:'日'},
        {key:1,value:'周'},
        {key:2,value:'月'},
    ];
});
//应用系统-文件上传方式
GlobalData.factory("uploadType", function() {
    return [
        {key:1,value:'拉取'},
        {key:2,value:'本地上传'},
    ];
});
//应用系统分类-日期格式
GlobalData.factory("logDateFormat", function() {
    return [
        {key:'YYYY-MM-DD',value:'YYYY-MM-DD'},
        {key:'YYYY/MM/DD',value:'YYYY/MM/DD'},
        {key:'yyyy-MM-dd',value:'yyyy-MM-dd'},
    ];
});
GlobalData.factory("logTimeFormat", function() {
    return [
        {key:'hh:mm:ss',value:'hh:mm:ss'},
        {key:'hh-mm-ss',value:'hh-mm-ss'},
    ];
});
//应用系统环境配置-环境类型
GlobalData.factory("EnvType", function() {
    return [
        {key:1,value:'开发'},
        {key:2,value:'测试'},
        {key:3,value:'准生产'},
        {key:4,value:'生产'},
        {key:5,value:'SIT'},
        {key:6,value:'SAT'}
    ];
});


//环境管理--语言名称
GlobalData.factory("LanguageName",function () {
    return [
        {key:14, value:'Java'},
        {key:7, value:'Python2'},
        { key:8, value:'Python3'},
        /*{ key:4, value:'C'},
        {key:5, value:'C++'}*/
    ]
});
//环境管理执行环境
GlobalData.factory("pluginExeEnv", function () {
   return [
       {key:1,value:'Linux'},
       {key:2,value:'Aix'},
       {key:3,value:'AS400'},
       {key:4,value:'HP-UX'},
       {key:5,value:'Windows'}
   ];
});
//环境管理操作系统位数
GlobalData.factory("operateSysBit", function () {
    return [
        {key:1,value:'不限'},
        {key:2,value:'32位'},
        {key:3,value:'64位'}
    ]
});
//插件部署--安装库类型
GlobalData.factory("pluginLibType",function () {
    return [
        {key:1,value:'PYTHON2'},
        {key:2,value:'PYTHON3'},
        {key:3,value:'EXE'},
        {key:4,value:'DLL'},
        {key:5,value:'SO'}
    ];
});
//插件管理--插件类型
GlobalData.factory("pluginType",function () {
    return [
        {key:1,value:'dll'},
        {key:2,value:'so'},
        {key:3,value:'jar'},
        {key:4,value:'py'},
        {key:5,value:'bat'},
        {key:6,value:'vbs'},
        {key:7,value:'sh'},
        {key:8,value:'exe'}
      /*  {key:9,value:'Win32'},
        {key:10,value:'Win64'},
        {key:11,value:'Linux32'},
        {key:12,value:'Linux64'},
        {key:13,value:'AIX32'},
        {key:14,value:'AIX64'},
        {key:15,value:'HP-UX32'},
        {key:16,value:'HP-UX64'},*/
    ];
})
/** -------------------------(调度模块)----------------------------- **/
//运维流程类型
GlobalData.factory("FlowType", function() {
    return [
        // {key:1,value:'操作系统',flag:false},
        // {key:2,value:'文件存储',flag:false},
        // {key:3,value:'服务中间件',flag:false},
        // {key:4,value:'消息中间件',flag:false},
        // {key:5,value:'数据库',flag:false},
        // {key:6,value:'容器',flag:false},
        // {key:7,value:'应用系统',flag:false},
        // {key:8,value:'通用',flag:false},
        {key:1,value:'企业资源',flag:false},
        {key:2,value:'企业瓶颈',flag:false},
        {key:3,value:'peoplepus',flag:false},
        {key:4,value:'企业效能',flag:false},
        {key:5,value:'精益生产',flag:false},
        {key:6,value:'LDDC',flag:false},
        {key:7,value:'应用系统',flag:false},
        {key:8,value:'通用',flag:false},
    ];
});
//运维流程操作类型
GlobalData.factory("AutoFlowOpType", function() {
    return [
        {key:1,value:'上传文件'},
        {key:2,value:'下传文件'},
        {key:3,value:'数据操作'},
        {key:4,value:'基础操作'},
        {key:5,value:'应用操作'},
        {key:6,value:'其他操作'},
    ];
});
//调度-任务状态
GlobalData.factory("OpTaskStatus", function() {
    return [
        {key:1,value:'待执行'},
        {key:2,value:'执行中'},
        {key:3,value:'正常结束'},
        {key:4,value:'终止'},
        {key:5,value:'异常'},
    ];
});
//调度-执行类型
GlobalData.factory("ExecuteType", function() {
    return [
        {key:1,value:'手动'},
        {key:2,value:'自动'},
    ];
});
//调度-任务类型
GlobalData.factory("TaskType", function() {
    return [
        {key:1,value:'操作系统'},
        {key:2,value:'中间件'},
        {key:3,value:'数据库'}
    ];
});
//调度-流程列表-流程查看-作业出错处理类型
GlobalData.factory("JobErrorType", function() {
    return [
        {key:1,value:'等待'},
        {key:2,value:'跳过'},
        {key:3,value:'重试'}
    ];
});
//调度-流程编辑-前置作业出错处理类型
GlobalData.factory("PreJobErrorType", function() {
    return [
        {key:1,value:'跳过执行'},
        {key:2,value:'跳过等待'}
    ];
});
//调度 数据库类型
GlobalData.factory("dataBaseType", function() {
    return [
        {key:1,value:'Mysql'},
        {key:2,value:'DB2'},
        {key:3,value:'Oracle'},
        {key:4,value:'Sybase'},
        {key:5,value:'Informix'},
    ];
});
//调度-流程编辑-模板库作业类型
GlobalData.factory("FlowJobType", function() {
    return [
        {key:1,value:'开始'},
        {key:2,value:'结束'},
        {key:3,value:'作业分组'},
        {key:4,value:'条件'},
        {key:5,value:'中断'},
        {key:6,value:'轮询'},
        {key:7,value:'ftp文件上传'},
        {key:8,value:'ftp文件下传'},
        {key:9,value:'sftp文件上传'},
        {key:10,value:'sftp文件下传'},
        {key:11,value:'agent文件上传'},
        {key:12,value:'agent文件下传'},
        {key:13,value:'拷贝文件'},
        {key:14,value:'数据库'},
        {key:15,value:'数据库脚本'},
        {key:16,value:'网络配置'},
        {key:17,value:'应用启动'},
        {key:18,value:'应用停止'},
        {key:19,value:'Python脚本'},
        {key:20,value:'Shell脚本'},
        {key:21,value:'Bat脚本'},
        /*{key:22,value:'Ruby脚本'},
        {key:23,value:'Perl脚本'},*/
        {key:24,value:'WebService'},
        {key:25,value:'Tcp'},
        {key:26,value:'HTTP'},
       /* {key:26,value:'Mq'},
        {key:27,value:'Tuxedo'},*/
        {key:28,value:'CL'},
        {key:29,value:'RPG'},
        {key:30,value:'Java'},
        {key:31,value:'C'},
        {key:32,value:'C++'},
        {key:33,value:'site'},
        {key:34,value:'area'},
        {key:35,value:'cell'},
        {key:36,value:'unit'},
        {key:37,value:'enterprise'},
        {key:38,value:'打浆机'},
        {key:39,value:'贮浆罐'},
        {key:40,value:'混浆机'},
        {key:41,value:'压榨机'},
        {key:42,value:'干燥机'},
        {key:43,value:'卷取机'},
        {key:44,value:'复卷机'},
        {key:45,value:'分切机'},
        {key:46,value:'包装机'},
        {key:47,value:'加料机'},
        {key:48,value:'电子称'},
        {key:49,value:'回潮机'},
        {key:50,value:'切丝机'},
        {key:51,value:'烘丝机'},
        {key:52,value:'储柜'},
        {key:53,value:'卷接机'},
        {key:54,value:'包装机'},
        {key:55,value:'封箱机'},
        {key:56,value:'喂丝机'},
        {key:57,value:'折线图'},
        {key:58,value:'柱状图'},
        {key:59,value:'热力图'},
        {key:60,value:'关系图'},
        {key:61,value:'警告'},
        {key:62,value:'错误'},
    ];
});
//调度-流程编辑-模板库分类数据
GlobalData.factory("FlowCategoryData", function() {
    return [{
        category:1, //文件
        element_list:[
            {category: 1,text: "ftp文件",type:7,sd_job_bean:{}},
            {category: 1,text: "ftp文件",type:8,sd_job_bean:{}},
            {category: 1,text: "sftp文件",type:9,sd_job_bean:{}},
            {category: 1,text: "sftp文件",type:10,sd_job_bean:{}},
            {category: 1,text: "agent文件",type:11,sd_job_bean:{}},
            {category: 1,text: "agent文件",type:12,sd_job_bean:{}},
            {category: 1,text: "拷贝文件",type:13,sd_job_bean:{}},
        ]
    },{
        category:2, //数据库
        element_list:[
            {category: 2,text: "数据库",type:14,sd_job_bean:{}},
            {category: 2,text: "数据库脚本",type:15,sd_job_bean:{}},
        ]
    },{
        category:3, //网络
        element_list:[
            {category: 3,text: "网络配置",type:16,sd_job_bean:{}},
        ]
    },{
        category:4, //应用
        element_list:[
            {category: 4,text: "应用启动",type:17,sd_job_bean:{}},
            {category: 4,text: "应用停止",type:18,sd_job_bean:{}},
        ]
    },{
        category:5, //脚本
        element_list:[
            {category: 5,text: "Python",type:19,sd_job_bean:{}},
            {category: 5,text: "Shell", type:20,sd_job_bean:{}},
            {category: 5,text: "Bat",   type:21,sd_job_bean:{}},
            {category: 5,text: "Java",  type:30,sd_job_bean:{}},
            {category: 5,text: "C",     type:31,sd_job_bean:{}},
            {category: 5,text: "C++",   type:32,sd_job_bean:{}},
            /*{category: 5,text:"Ruby",type:22,sd_job_bean:{}},
            {category: 5,text: "Perl",type:23,sd_job_bean:{}},*/
        ]
    },{
        category:6, //服务调用
        element_list:[
            {category: 6,text: "WebService",type:24,sd_job_bean:{}},
            {category: 6,text: "Tcp",type:25,sd_job_bean:{}},
            {category: 6,text: "HTTP",type:26,sd_job_bean:{}},
           /* {category: 6,text: "Mq",type:26,sd_job_bean:{}},
            {category: 6,text: "Tuxedo",type:27,sd_job_bean:{}},*/
        ]
    },{
        category:7, //轮询
        element_list:[
            {category: 7,text: "轮询",type:6,sd_job_bean:{}},
        ]
    },{
        category:8, //其他
        element_list:[
            {category: 8,text: "CL",type:28,sd_job_bean:{}},
            {category: 8,text: "RPG",type:29,sd_job_bean:{}},
        ]
    },{
        category:9, //S95
        element_list:[
            {category: 9,text: "site",type:33,sd_job_bean:{}},
            {category: 9,text: "area",type:34,sd_job_bean:{}},
            {category: 9,text: "cell",type:35,sd_job_bean:{}},
            {category: 9,text: "unit",type:36,sd_job_bean:{}},
            {category: 9,text: "enterprise",type:37,sd_job_bean:{}},
        ]
    },{
        category:10, //造纸
        element_list:[
            {category: 10,text: "site",type:33,sd_job_bean:{}},
            {category: 10,text: "area",type:34,sd_job_bean:{}},
            {category: 10,text: "cell",type:35,sd_job_bean:{}},
            {category: 10,text: "enterprise",type:37,sd_job_bean:{}},
            {category: 10,text: "打浆机",type:38,sd_job_bean:{}},
            {category: 10,text: "贮浆罐",type:39,sd_job_bean:{}},
            {category: 10,text: "混浆机",type:40,sd_job_bean:{}},
            {category: 10,text: "压榨机",type:41,sd_job_bean:{}},
            {category: 10,text: "干燥机",type:42,sd_job_bean:{}},
            {category: 10,text: "卷取机",type:43,sd_job_bean:{}},
            {category: 10,text: "复卷机",type:44,sd_job_bean:{}},
            {category: 10,text: "分切机",type:45,sd_job_bean:{}},
            {category: 10,text: "包装机",type:46,sd_job_bean:{}}
        ]
    },{
        category:11, //烟草
        element_list:[
            {category: 11,text: "site",type:33,sd_job_bean:{}},
            {category: 11,text: "area",type:34,sd_job_bean:{}},
            {category: 11,text: "cell",type:35,sd_job_bean:{}},
            {category: 11,text: "enterprise",type:37,sd_job_bean:{}},
            {category: 11,text: "加料机",type:47,sd_job_bean:{}},
            {category: 11,text: "电子称",type:48,sd_job_bean:{}},
            {category: 11,text: "回潮机",type:49,sd_job_bean:{}},
            {category: 11,text: "切丝机",type:50,sd_job_bean:{}},
            {category: 11,text: "烘丝机",type:51,sd_job_bean:{}},
            {category: 11,text: "储柜",type:52,sd_job_bean:{}},
            {category: 11,text: "卷接机",type:53,sd_job_bean:{}},
            {category: 11,text: "包装机",type:54,sd_job_bean:{}},
            {category: 11,text: "封箱机",type:55,sd_job_bean:{}},
            {category: 11,text: "喂丝机",type:56,sd_job_bean:{}}
        ]
    },{
        category:12,
        element_list:[
            {category: 12,text: "折线图",type:57,sd_job_bean:{}},
            {category: 12,text: "柱状图",type:58,sd_job_bean:{}},
            {category: 12,text: "热力图",type:59,sd_job_bean:{}},
            {category: 12,text: "关系图",type:60,sd_job_bean:{}},
            {category: 12,text: "警告",type:61,sd_job_bean:{}},
            {category: 12,text: "错误",type:62,sd_job_bean:{}}
        ]
    },
        {
            category:13,
            element_list:[
                {category: 13,text: "开始",type:63,sd_job_bean:{}},
                {category: 13,text: "工段",type:64,sd_job_bean:{}},
                {category: 13,text: "工序",type:65,sd_job_bean:{}},
                {category: 13,text: "终止",type:66,sd_job_bean:{}},
                {category: 13,text: "工艺文件",type:67,sd_job_bean:{}},
                {category: 13,text: "设备",type:68,sd_job_bean:{}},
                {category: 13,text: "人员",type:69,sd_job_bean:{}}
            ]
        },
        {
            category:14,
            element_list:[
                {category: 14,text: "盘纸线",type:70,sd_job_bean:{}},
                {category: 14,text: "辊纸线",type:71,sd_job_bean:{}},
                {category: 14,text: "接装线",type:72,sd_job_bean:{}},
                {category: 14,text: "印刷线",type:73,sd_job_bean:{}},
                {category: 14,text: "打浆",type:74,sd_job_bean:{}},
                {category: 14,text: "造纸",type:75,sd_job_bean:{}},
                {category: 14,text: "组装",type:76,sd_job_bean:{}},
                {category: 14,text: "元件",type:77,sd_job_bean:{}}
            ]
        }
    ];
});
//调度-流程编辑-服务作业请求类型
GlobalData.factory("RequestMethod", function() {
    return [
        {key:1,value:'POST'},
        {key:2,value:'GET'},
    ];
});
//调度-查看作业--操作类型
GlobalData.factory("JobOpType", function() {
    return [
        {key:1,value:'执行'},
        {key:2,value:'完成'},
        {key:3,value:'跳过'},
        {key:4,value:'重试'},
        {key:5,value:'中止'}
    ];
});
//调度-任务监控--任务状态
GlobalData.factory("OpTaskState", function() {
    return [
        {key:1,value:'等待运行'},
        {key:2,value:'正在运行'},
        {key:3,value:'运行结束'}
    ];
});
//调度-任务执行状态
GlobalData.factory("OpTaskExeStatus", function() {
    return [
        {key:1,value:'执行中'},
        {key:2,value:''},
        {key:3,value:'执行异常'},
        {key:4,value:'正常完成'},
        {key:5,value:'异常完成'},
        {key:6,value:'重试中'},
        {key:7,value:'任务暂停'},
        {key:8,value:'手动等待'},
        {key:9,value:'暂停等待'},
        {key:10,value:'执行失败'},
        {key:11,value:'排队中'}
    ];
});
//调度-任务执行--作业状态
GlobalData.factory("OpJobExeStatus", function() {
    return [
        {key:1,value:'未执行'},
        {key:2,value:'执行中'},
        {key:3,value:'成功'},
        {key:4,value:'异常'},
        {key:5,value:'跳过'},
        {key:6,value:'待重试'},
        {key:7,value:'失败'}
    ];
});
//调度-任务执行-干预类型
GlobalData.factory("OpMeddleType", function() {
    return [
        {key:1,value:'关闭任务'},
        {key:2,value:'暂停任务'},
        {key:3,value:'中止作业'},
        {key:4,value:'延时执行'},
        {key:5,value:'中止任务'},
        {key:6,value:'单步执行'},
        {key:7,value:'一键执行'},
        {key:8,value:'继续执行'},
        {key:9,value:'单个跳过'},
        {key:10,value:'重做作业'},
        {key:11,value:'重试作业'},
        {key:12,value:'重试作业链'},
        {key:13,value:'回收任务线程'},
        {key:14,value:'回收作业线程'},
        {key:15,value:'重做状态同步'},
        {key:16,value:'完成作业'}
    ];
});

//调度-场景-元素参数值来源
GlobalData.factory("ParamValueSource", function() {
    return [
        {key:1,value:'固有'},
        {key:2,value:'引用'}
    ];
});
//调度-场景-元素分类
GlobalData.factory("ElementCategory", function() {
    return [
        {key:1,value:'文件'},
        {key:2,value:'数据库'},
        {key:3,value:'网络'},
        {key:4,value:'应用'},
        {key:5,value:'脚本'},
        {key:6,value:'服务调用'},
        {key:7,value:'轮询'},
        {key:8,value:'其他'},
        {key:9,value:'S95'},
        {key:10,value:'纸业模型'},
        {key:11,value:'烟草模型'},
        {key:12,value:'UI框架'},
    ];
});

//调度-策略-策略组类型
GlobalData.factory("StrategyGroupType", function() {
    return [
        {key:1,value:'并行'},
        {key:2,value:'并发'},
        {key:3,value:'优先级'}
    ];
});
//调度-策略-优先级别
GlobalData.factory("StrategyPriority", function() {
    return [
        {key:1,value:'一'},
        {key:2,value:'二'},
        {key:3,value:'三'},
        {key:4,value:'四'},
        {key:5,value:'五'},
        {key:6,value:'六'},
        {key:7,value:'七'},
        {key:8,value:'八'},
        {key:9,value:'九'},
        {key:10,value:'十'}
    ];
});
//版本管理-新增初始版本-编码
GlobalData.factory("VersionEncodingData", function() {
    return [
        'UTF-8',
        'GBK'
    ];
});
//版本管理-文件比对-临时数据-勿删
GlobalData.factory("TempCompareData", function() {
    var temp_list = [];

    return {
        addItem: addItem,
        clearList: clearList,
        getList: getList,
    };

    function addItem(item){
        temp_list.push(item);
    }
    function clearList(){
        return temp_list = [];
    }
    function getList(){
        return temp_list;
    }
});

//版本管理-发布流-版本状态
GlobalData.factory("VersionStatus", function() {
    return [
        {key:1,value:'未入库'},
        {key:2,value:'正常'},
        {key:3,value:'已回退'},
    ];
});
//滚动条配置
GlobalData.factory("ScrollConfig", function() {
    return {
        axis:"y" ,
        theme:"custom-dark",
        scrollbarPosition: "inside",
        scrollInertia:400,
        scrollEasing:"easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons:{ enable: false },
        mouseWheel:{ preventDefault:true }
    }
});
//滚动条配置
GlobalData.factory("ScrollBarConfig", function() {
    var option = {};
    var publicOption ={
        theme:"custom-dark",
        scrollInertia:400,
        scrollEasing:"easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons:{ enable: false },
        mouseWheel:{ preventDefault:true },
    };
    //x轴滚动条
    option.X = function (barPosition) {
      return  angular.extend(angular.copy(publicOption),{axis:"x",scrollbarPosition: barPosition || "inside"});
    };
    //y轴滚动条
    option.Y = function (barPosition) {    
        return  angular.extend(angular.copy(publicOption),{axis:"y",scrollbarPosition: barPosition || "inside"});
    };
    //xy轴滚动条
    option.XY = function (barPosition) {
        return angular.extend(angular.copy(publicOption),{axis:"yx",scrollbarPosition: barPosition || "inside"});
    };    
    return option;
});
//星期转换
GlobalData.factory("weekType", function() {
    return [
        {key:0,value:'星期日'},
        {key:1,value:'星期一'},
        {key:2,value:'星期二'},
        {key:3,value:'星期三'},
        {key:4,value:'星期四'},
        {key:5,value:'星期五'},
        {key:6,value:'星期六'},
    ];
});
//字母导航列表
GlobalData.factory("LetterNavList", function() {
    return [
        {letter : "A",list:[]},
        {letter : "B",list:[]},
        {letter : "C",list:[]},
        {letter : "D",list:[]},
        {letter : "E",list:[]},
        {letter : "F",list:[]},
        {letter : "G",list:[]},
        {letter : "H",list:[]},
        {letter : "I",list:[]},
        {letter : "J",list:[]},
        {letter : "K",list:[]},
        {letter : "L",list:[]},
        {letter : "M",list:[]},
        {letter : "N",list:[]},
        {letter : "O",list:[]},
        {letter : "P",list:[]},
        {letter : "Q",list:[]},
        {letter : "R",list:[]},
        {letter : "S",list:[]},
        {letter : "T",list:[]},
        {letter : "U",list:[]},
        {letter : "V",list:[]},
        {letter : "W",list:[]},
        {letter : "X",list:[]},
        {letter : "Y",list:[]},
        {letter : "Z",list:[]},
        {letter : "#",list:[]},
    ];
});