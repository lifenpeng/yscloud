'use strict';
var tbDirective = angular.module("TableDirective",[]);
/********发布模块******************/
//项目--敏捷发布项目列表
tbDirective.directive('quickProjectList',function(){
    return{
        restrict: 'E',
        templateUrl: 'templates/table/quick_project_tb.html',
        replace: 'true',
        controller:["$scope", "$timeout","$state", "Proj", "config", "Col_Fmt", "TblOption", "MouseMoveEvent", "OptionColWidth", "Modal","$compile", "CV", function($scope, $timeout,$state, Proj, config, Col_Fmt, TblOption, MouseMoveEvent, OptionColWidth, Modal, $compile, CV) {
            var _params = {};
            var _node_timer;
            $scope.run=function(item){
                var _sys_publish_id =item.syspublish_id;
                var _business_sys_name=item.business_sys_name;
                var exec_type = 1;//执行类型 1 发布 2 回退
                $state.go('agile_pub_exe',{sys_publish_id:_sys_publish_id,sys_id:_business_sys_name,exec_type:exec_type,quick_pub_flag:1,auto_yn_flag:2,path_flag:1});
            };
            $scope.quickProjectControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    sortName: 'publish_date',
                    sortOrder: 'desc',

                    classes: "table table-no-bordered table-hover ",
                    rowStyle: function (row, index) {
                        if (index == 0) {
                            $('.pagination-detail').hide();
                        }
                        return { classes: 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item) return false;
                        $scope.item = item;
                        var add = true;
                        var _button_list='';
                        if(item.sys_publish_status >= 2 && !item.syspublish_success_flag ){
                            _button_list+='<button  class="ordinary-btn" ng-click="run(item)" style="margin-right:20px;"><i class="glyphicon glyphicon-play"></i>&nbsp;执行</button>';
                        }
                        var _html_prepare = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='7' style='border:0px;text-align: right;padding-right:90px;'>" +_button_list+
                            "</td>",
                            '</tr>'
                        ].join('');
                        var _html_none=[
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='7' style='border:0px;text-align: center;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            item.syspublish_success_flag ? $element.after($compile(_html_none)($scope)) : $element.after($compile(_html_prepare)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                            //无系统权限
                            if(item.validate_user && item.validate_user != 1){
                                $element.next().find(".ordinary-btn").removeClass("ordinary-btn").addClass("ordinary-btn_disabled");
                                $element.next().find(".ordinary-btn_disabled").attr({disabled:true,title:"当前用户非系统责任人,不可操作"});
                            }
                        }
                    },
                    columns: [{
                        field: 'publish_date',
                        title: '发布日期',
                        align: 'left',
                        valign: 'middle',
                        sortable: true,
                        width:'150px',
                        formatter: Col_Fmt.px100Fmt
                    },{
                        field: 'publish_time',
                        title: '发布时间',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'business_cn_name',
                        title: '应用系统',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'manager_user_name',
                        title: '执行人',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width:'120px',
                        events:{
                            'mouseenter .animate_active':function(){
                                var _this = $(this);
                                var _all_select_element = $(".animate_active").next();
                                $(document).off('mousemove');
                                if(_node_timer) $timeout.cancel(_node_timer);
                                if(_this.next()[0]){
                                    if(_this.next()[0].style.display == "none"){
                                        $timeout(function(){
                                            $(".animate_active").next().css({display:'none'});
                                        },0);
                                    }
                                }else{
                                    $timeout(function(){
                                        $(".animate_active").next().css({display:'none'});
                                    },0);
                                }
                                _node_timer = $timeout(function(){
                                    _this.next().fadeIn(200);
                                },200);
                            },
                            'mouseleave .animate_active':function(){
                                var _this = $(this);
                                if(_this.next().length > 0){
                                    var elem =  _this.next()[0];
                                    var _min_width = $(elem).offset().left;
                                    var _max_width = _min_width + 122 + 20;
                                    var _min_height = $(elem).offset().top;
                                    var _max_height = $(elem).offset().top + $(elem).height();
                                    $(document).mousemove(function(e){
                                        if((e.pageX < _min_width || e.pageX > _max_width) || (e.pageY < _min_height || e.pageY > _max_height)){
                                            if(_node_timer) $timeout.cancel(_node_timer);
                                            _node_timer = $timeout(function(){
                                                $(".animate_active").next().fadeOut(200);
                                            },0);
                                        }
                                    });
                                }
                            }
                        },
                        formatter: Col_Fmt.executeUserFmt
                    },{
                        field: 'sys_publish_status',
                        title: '执行状态',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width: '120px',
                        formatter: Col_Fmt.projStatusFmt
                    },{
                        field: 'syspublish_success_flag',
                        title: '发布结果',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width : '100px',
                        formatter: Col_Fmt.prodFlagFmt
                    },angular.extend({
                        formatter: function(value, row, index) {
                            var _tabpath,back_flag,_view_btn_html;
                            _tabpath='proj_info';
                            back_flag = 'quick_prod_list';
                            _view_btn_html =  [
                                '<div style="margin-right:6px;text-align: center;">',
                                '<a class="tabConVi" title="查看" >',
                                '</a>',
                                '</div>'
                            ].join("");
                            return _view_btn_html;
                        },
                        events: {
                            'click .tabConVi':function(e, value, row, index){
                                e.stopPropagation();
                                $state.go('proj_detail_pre',{publish_id:row.syspublish_id,sys_id:row.business_sys_name});
                            },
                        },
                    }, OptionColWidth)]
                }
            };
            function tableData(params) {
                _params = params;
                Proj.getQuickProjTblData(params).then(function (data) {
                    $timeout(function() {
                        data.total = data.all_recd;
                        data.rows = data.pj_project_list ? data.pj_project_list : [];
                        params.success(data);
                        params.complete();
                    }, 0);
                }, function (error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
//发布窗口设置的列表
tbDirective.directive('pubWindowList',function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/pubWindow_tb.html',
        replace: 'true',
        controller: ["$scope","$state" ,"$timeout", "$filter", "$location", "PubWindow", "config", "Col_Fmt", "Modal", "$compile", "CV",function($scope, $state,$timeout, $filter, $location, PubWindow, config, Col_Fmt, Modal, $compile, CV) {
            var _table_data;
            var _params;
            //关闭
            $scope.close = function(item){
                Modal.closePubWindow(item).then(function (data) {
                    tableData(_params)
                })
            };
            $scope.puWindowTableControl = {
                options: {
                    ajax: tableData,
                    search: false,
                    pagination: false,
                    pageSize:10,
                    pageNumber:1,
                    sidePagination:'server',
                    showColumns: false,
                    showRefresh: false,
                    sortName: 'open_date',
                    sortOrder: 'desc',

                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'table-old',css:{"padding":"6px 8px 5px"}};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html;
                        _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            (item.window_status == 2) ? '<td colspan="7" style="border:0px;text-align: right;"><div style="color: #6D7183;text-align: center">暂无操作项</div></td>' :'<td colspan="7" style="border:0;text-align: right;"><button class="ordinary-btn" ng-click="close(item);" style="margin-right:80px;"><i class="fa fa-power-off"></i>&nbsp;关闭</button></td>',
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover bs-relative-table",
                    columns: [{
                        field: 'open_date',
                        title: '开始日期',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.noZeroFmt
                    },{
                        field: 'window_type',
                        title: '窗口类型',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.pubWindowTypeFmt
                    },{
                        field: 'close_reason',
                        title: '关闭原因',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'window_status',
                        title: '窗口状态',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.pubWindowStatusFmt
                    }]
                }
            };
            //例行窗口设置
            $scope.routineWindowSet = function(){
                Modal.setNormalWindow().then(function (data) {
                    tableData(_params)
                })
            };
            //特殊窗口设置
            $scope.specialWindowSet = function(){
                Modal.setSpecialWindow().then(function (data) {
                    tableData(_params)
                })
            };
            //黑名单窗口设置
            $scope.blackWindowSet = function(){
                Modal.setBlackWindow().then(function (data) {
                    tableData(_params)
                })
            };
            //表格数据绑定
            function tableData(params) {
                _params = params;
                $timeout(function(){
                    PubWindow.getPubWindowList().then(function (data) {
                        if(data){
                            data.rows = _table_data = data.window_list ? data.window_list :[];
                            params.success(data);
                            params.complete();
                        }
                    },function (error) {
                        Modal.alert(error.message,3)
                    });
                },1200);
            }
        }]
    }
});
//发布申请添加项目
tbDirective.directive("releaseProjectList", function() {
    return{
        restrict:'AE',
        templateUrl:'templates/table/release_project_tbl.html',
        replace: true,
        controller: ["$scope", "$modal", "$timeout","$location", "Project", "config", "Col_Fmt", "Modal", "CV", function($scope, $modal, $timeout, $location, Project, config, Col_Fmt, Modal, CV) {
            var _tblParams={};
            $scope.releaseProjectListControl = {
                options: {
                    ajax: tableData,
                    pagination: false,
                    pageSize:20,
                    pageNumber:1,
                    sidePagination:'server',
                    showColumns: false,
                    showRefresh: false,
                    onClickRow: function (item, $element) {
                        if(!item) return;
                        item.checked =  !item.checked;
                        if(item.checked){
                            $element.find('td').addClass('checked_style');
                            $element.find('.icheckbox_minimal-blue').addClass('checked');
                        }else {
                            $element.find('td').removeClass('checked_style');
                            $element.find('.icheckbox_minimal-blue').removeClass('checked');
                        }
                        if($scope.info.proj_list.length==0){
                            $scope.info.proj_list.push(item);
                        }else {
                            for(var i = 0; i < $scope.info.proj_list.length; i++){
                                if($scope.info.proj_list[i].project_id == item.project_id){
                                    $scope.info.proj_list.splice(i,1);
                                    break;
                                }else if($scope.info.proj_list[i].project_id != item.project_id && i == $scope.info.proj_list.length-1){
                                    $scope.info.proj_list.push(item);
                                    break;
                                }
                            }
                        }
                    },
                    classes: "table table-no-bordered",
                    columns: [{
                        field: 'checked',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        width:'50px',
                        formatter: choosecmptColFmt
                    },{
                        field: 'project_id',
                        title: '项目编号',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'project_name',
                        title: '项目名称',
                        align: 'left',
                        valign: 'middle'
                    }]
                }
            };
            function tableData(params) {
                Project.applyProjectList().then(function(data) {
                    $timeout(function(){
                        if(data){
                            $scope.control.project_list_loading = false;
                            data.rows = data.pubProSys_list ? data.pubProSys_list :[];
                            params.success(data);
                            params.complete();
                        }
                    },0);
                }, function(error) {
                    $scope.control.project_list_loading = false;
                    $scope.info.error_message = error.message;
                    params.success({});
                    params.complete();
                });
            }

            function choosecmptColFmt(value, row, index) {
                var _html='<div class="icheckbox_minimal-blue"><div>';
                return _html
            }
        }]
    }
});
/********故障模块******************/
//我的工单列表--我创建的
tbDirective.directive('createWorkorder',function(){
    return {
        restrict: 'AE',
        templateUrl: 'templates/table/create_workorder_tb.html',
        replace: 'true',
        controller: ["$scope","$compile", "$modal", "$timeout", "$state", "$location", "Workorder", "config", "Col_Fmt", "Modal", "CV", function($scope, $compile, $modal, $timeout, $state, $location, Workorder, config, Col_Fmt, Modal, CV){
            var createParams = {};
            //我创建的工单配置
            $scope.workOrderCreateTableControl= {
                options: {
                    ajax: myCreateTableData,
                    pagination: true,
                    pageSize:20,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        if (index == 0) {
                            $('.pagination-detail').hide();
                        }
                        return { classes: 'tbl-odd'};
                    },
                    classes: "table table-no-bordered table-hover",
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='9' style='border:0;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='exchange(item);' style='margin-right:20px;'><i class='fa fa-exchange' style='font-size: 14px'></i>&nbsp;变更</button><button class='ordinary-btn' ng-click='appoint(item);' style='margin-right:20px;'><i class='fa fa-hand-o-right' style='font-size: 14px'></i>&nbsp;指派</button></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    columns: [{
                        field: 'order_seq',
                        title: '编号',
                        align: 'left',
                        width:  '130px',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFlagFmt
                    },{
                        field: 'business_cn_name',
                        title: '系统',
                        align: 'left',
                        valign: 'middle',
                        formatter:Col_Fmt.hideDetailFmt
                    },{
                        field: 'order_bk_title',
                        title: '标题',
                        align: 'left',
                        valign: 'middle',
                        formatter:Col_Fmt.hideDetailFmt
                    } ,{
                        field: 'workorder_type',
                        title: '工单类型',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                        formatter: Col_Fmt.workOrderTypeFmt
                    }, {
                        field: 'order_state',
                        title: '状态',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                        formatter: Col_Fmt.workOrderStateFmt
                    }, {
                        field: 'deal_user_name',
                        title: '责任人',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.workOrderFmt
                    }, {
                        field: 'crt_bk_date',
                        title: '创建时间',
                        align: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.workOrderTimeFmt
                    }, {
                        field: 'closed_bk_date',
                        title: '关闭时间',
                        align: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.workOrderTimeFmt
                    }, {
                        field: 'operate',
                        width: '100px',
                        title: '',
                        align: 'right',
                        valign: 'middle',
                        events: {
                            'click .trash': function(e, value, row, index) {
                                e.stopPropagation();
                                var _order_seq = row.order_seq;
                                Modal.confirm("确认删除["+_order_seq+"]工单？").then(function (choose) {
                                    if(choose) {
                                        Workorder.deleteWorkorder(_order_seq).then(function(data) {
                                            if(data) {
                                                Modal.alert(_order_seq + " 工单删除成功！",2);
                                                myCreateTableData(createParams);
                                                $scope.getPendingWorkorderNumber();
                                                //移除当前处理工单
                                                $scope.closeProcessOrder(-1,_order_seq);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .modify' : function(e, value, row, index) {
                                e.stopPropagation();
                                $state.go('wo_modify',{wo_seq : row.order_seq});
                            },
                            'click .view' : function(e, value, row, index) {
                                e.stopPropagation();
                                var _is_detail = true;
                                //为了修改此工单的处理序号，修改之后再得到工单基本信息
                                $scope.addProcessOrder(row.order_seq, _is_detail,row.stop_yn_flag);
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            //变更工单
            $scope.exchange = function (row) {
                var _order_seq = row.order_seq;
                Modal.workOrderChange(_order_seq).then(function (data) {
                    if (data) {
                        Modal.alert("变更完成！",2);
                        myCreateTableData(createParams);
                        //获得未处理工单条数
                        $scope.getPendingWorkorderNumber();
                    }
                });
            };
            //指派工单
            $scope.appoint = function (row) {
                var _order_seq = row.order_seq;
                Modal.workOrderAppoint(_order_seq).then(function (ret) {
                    if (ret) {
                        Modal.alert("指派完成！",2);
                        myCreateTableData(createParams);
                        //获得未处理工单条数
                        $scope.getPendingWorkorderNumber();
                    }
                });
            };
            //表格操作列
            function operateFormat(value, row, index) {
                return [
                    '<div class="tabConDe trash" title="删除">',
                    '</div>',
                    '<a class="tabConEd modify" title="修改" >',
                    '</a>',
                    '<div class="tabConVi view" title="查看">',
                    '</div>'
                ].join("");
            }
            //表格数据绑定
            function myCreateTableData(params) {
                createParams = params;
                Workorder.pageCreateWorkorder(params).then(function(data) {
                    data.total = data.all_recd;
                    data.rows = data.created_order_list ? data.created_order_list : [];
                    for(var i=0;i< data.rows.length;i++){
                        data.rows[i].sys_cn_name = data.rows[i].sys_cn_name ? data.rows[i].sys_cn_name : '';
                        //创建时间
                        data.rows[i].crt_bk_date = data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                        data.rows[i].closed_bk_date ="-----";
                        data.rows[i].deal_user_name = data.rows[i].deal_user_name ? data.rows[i].deal_user_name : '';
                        //关闭时间
                        if(data.rows[i].close_bk_date && data.rows[i].close_bk_time){
                            data.rows[i].closed_bk_date = data.rows[i].close_bk_date +" "+ data.rows[i].close_bk_time;
                        }
                    }
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            };
        }]
    }
});
//我的工单列表--待处理的
tbDirective.directive('pendingWorkorder',function(){
    return {
        restrict: 'AE',
        templateUrl: 'templates/table/pending_workorder_tb.html',
        replace: 'true',
        controller: ["$scope", "$modal", "$timeout","$compile", "$location", "Workorder", "config", "Col_Fmt", "Modal", "CV", function($scope, $modal, $timeout,$compile, $location, Workorder, config, Col_Fmt, Modal, CV){
            var pendingParams = {};
            //待处理的工单
            $scope.workOrderPendingTableControl= {
                options: {
                    ajax: myPendingTableData,
                    pagination: true,
                    pageSize:20,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    rowStyle: function(row, index) {
                        if (index == 0) {
                            $('.pagination-detail').hide();
                        }
                        return { classes: 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='8' style='border:0px;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='deal(item);' style='margin-right:20px;'><i class='fa fa-edit' style='font-size: 14px'></i>&nbsp;处理</button><button class='ordinary-btn' ng-click='retreat(item);' style='margin-right:20px;'><i class='fa fa-undo' style='font-size: 14px'></i>&nbsp;退回</button></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'order_seq',
                        title: '编号',
                        align: 'left',
                        valign: 'middle',
                        width:  '130px',
                        formatter: Col_Fmt.workOrderFlagFmt
                    },{
                        field: 'business_cn_name',
                        title: '系统',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'order_bk_title',
                        title: '标题',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    } ,{
                        field: 'workorder_type',
                        title: '工单类型',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                        formatter: Col_Fmt.workOrderTypeFmt
                    }, {
                        field: 'order_state',
                        title: '状态',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                        formatter: Col_Fmt.workOrderStateFmt
                    }, {
                        field: 'crt_user_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.workOrderFmt
                    }, {
                        field: 'crt_bk_date',
                        title: '创建时间',
                        align: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.workOrderTimeFmt
                    }, {
                        field: 'operate',
                        width: '50px',
                        title: '',
                        align: 'right',
                        valign: 'middle',
                        events: {
                            'click .view' : function(e, value, row, index) {
                                e.stopPropagation();
                                var _is_detail = true;
                                //为了修改此工单的处理序号，修改之后再得到工单基本信息
                                $scope.addProcessOrder(row.order_seq, _is_detail,row.stop_yn_flag);
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            $scope.deal = function (row) {
                //处理工单
                $scope.addProcessOrder(row.order_seq, false ,row.stop_yn_flag);
            };
            //退回工单
            $scope.retreat = function (row) {
                var _order_seq = row.order_seq;
                Modal.workorderRollBack(_order_seq).then(function (ret) {
                    if (ret) {
                        Modal.alert("退回完成！",2);
                        //刷新未处理工单表格
                        myPendingTableData(pendingParams);
                        //获取未处理工单数量
                        $scope.getPendingWorkorderNumber();
                       /* //移除当前处理工单
                        $scope.closeProcessOrder(-1,_order_seq);*/
                    }
                });
            };
            //刷新列表
            $scope.refresh = function(){
                myPendingTableData(pendingParams);
            };
            //表格操作列
            function operateFormat(value, row, index) {
                return [
                    '<div class="tabConVi view" title="查看">',
                    '</div>',
                ].join("");
            }
            //表格数据绑定
            function myPendingTableData(params){
                pendingParams = params;
                Workorder.pagePendingWorkorder(params).then(function(data) {
                    data.total = data.all_recd;
                    data.rows = data.order_process_List ? data.order_process_List : [];
                    for(var i=0;i< data.rows.length;i++){
                        data.rows[i].crt_bk_date = data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                        data.rows[i].sys_cn_name = data.rows[i].sys_cn_name ? data.rows[i].sys_cn_name : '';
                    }
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
//我的工单列表--已处理的
tbDirective.directive('processedWorkorder',function(){
    return {
        restrict: 'AE',
        templateUrl: 'templates/table/procced_workorder_tb.html',
        replace: 'true',
        controller: ["$scope","$compile", "$modal", "$timeout", "$location", "Workorder", "config", "Col_Fmt", "Modal", "CV", function($scope,$compile, $modal, $timeout, $location, Workorder, config, Col_Fmt, Modal, CV){
            var processParams = {};
            //已处理工单
            $scope.workOrderProcessedTableControl= {
                options: {
                    ajax: myProcessedTableData,
                    pagination: true,
                    search: false,
                    sidePagination:'server',
                    pageNumber:1,
                    pageSize :10,
                    showColumns: false ,
                    rowStyle: function(row, index) {
                        if( index == 0 ){
                            $('.pagination-detail').hide()
                        }
                        return {classes : 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='9' style='border:0;text-align: right;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'order_seq',
                        title: '编号',
                        align: 'left',
                        valign: 'middle',
                        width:'130px',
                        formatter: Col_Fmt.workOrderFlagFmt
                    },{
                        field: 'business_cn_name',
                        title: '系统',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'order_bk_title',
                        title: '标题',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    } ,{
                        field: 'workorder_type',
                        title: '工单类型',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                        formatter: Col_Fmt.workOrderTypeFmt
                    }, {
                        field: 'order_state',
                        title: '状态',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                        formatter: Col_Fmt.workOrderStateFmt
                    }, {
                        field: 'crt_user_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.workOrderFmt
                    }, {
                        field: 'crt_bk_date',
                        title: '创建时间',
                        align: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.workOrderTimeFmt
                    }, {
                        field: 'closed_bk_date',
                        title: '关闭时间',
                        align: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.workOrderTimeFmt
                    }, {
                        field: 'operate',
                        width: '50px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .view' : function(e, value, row, index) {
                                e.stopPropagation();
                                var _is_detail = true;
                                //为了修改此工单的处理序号，修改之后再得到工单基本信息
                                $scope.addProcessOrder(row.order_seq, _is_detail,row.stop_yn_flag);
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            //刷新
            $scope.refresh = function(){
                myProcessedTableData(processParams);
            };
            //表格操作列
            function operateFormat(value, row, index) {
                return [
                    '<div class="tabConVi view" title="查看">',
                    '</div>',
                ].join("");
            }
            //表格数据绑定
            function myProcessedTableData(params){
                processParams = params;
                Workorder.pageProcessedWorkorder(params).then(function(data) {
                    data.total = data.all_recd;
                    data.rows = data.order_processed_List ? data.order_processed_List : [];
                    for(var i=0;i< data.rows.length;i++){
                        data.rows[i].sys_cn_name = data.rows[i].sys_cn_name ? data.rows[i].sys_cn_name : '';
                        data.rows[i].crt_bk_date = data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                        data.rows[i].closed_bk_date = data.rows[i].close_bk_date ? (data.rows[i].close_bk_date +" " + data.rows[i].close_bk_time) : "-----";
                    }
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
//所有工单列表
tbDirective.directive("allWorkorderList",function(){
    return {
        restrict: 'AE',
        templateUrl: 'templates/table/all_workorder_list.html',
        replace: 'true',
        controller: ["$scope", "$modal", "$timeout", "$state","$compile", "Workorder", "config", "Col_Fmt", "Modal", "CV", function($scope, $modal, $timeout, $state, $compile, Workorder, config, Col_Fmt, Modal, CV){
            var timer,tblParams;
            //指派工单
            $scope.appoint = function(item){
                var _order_seq = item.order_seq;
                Modal.workOrderAppoint(_order_seq).then(function (ret) {
                    if (ret) {
                        Modal.alert("指派完成！",2);
                        tableData(tblParams);
                    }
                });
            };
            //变更工单
            $scope.exchange = function(item){
                var _order_seq = item.order_seq;
                Modal.workOrderChange(_order_seq).then(function (data) {
                    if (data) {
                        Modal.alert("变更完成！",2);
                        tableData(tblParams);
                    }
                });
            };
            //生成方案
            $scope.exportProgram = function (item) {
                $state.go('fault_program_new',{flag : true,order_seq : item.order_seq,deal_bk_seq : item.deal_bk_seq});
            };
            //搜索参数
            $scope.moreParams = {};
            $scope.allWorkorderTableControl= {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:20,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            '<td colspan="10" style="border:0px;text-align: right;padding-right:90px;">',
                            '<button class="ordinary-btn" ng-click="exchange(item);" style="margin-right:20px;"><i class="fa fa-exchange" style="font-size: 14px"></i>&nbsp;变更</button>',
                            '<button class="ordinary-btn" ng-click="appoint(item);" style="margin-right:20px;"><i class="fa fa-hand-o-right" style="font-size: 14px"></i>&nbsp;指派</button>',
                            (item.order_state == 4 || item.order_state == 5) && item.handle_type == 1 ? '<button class="ordinary-btn" ng-click="exportProgram(item);" style="margin-right:20px;"><i class="fa fa-pencil-square-o" style="font-size: 14px"></i>&nbsp;生成方案</button>' : '',
                            '</td>',
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'order_seq',
                        title: '编号',
                        align: 'left',
                        valign: 'middle',
                        width:'130px',
                        formatter: Col_Fmt.workOrderFlagFmt
                    },{
                        field: 'business_cn_name',
                        title: '系统',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'order_bk_title',
                        title: '标题',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    } ,{
                        field: 'workorder_type',
                        title: '工单类型',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                        formatter: Col_Fmt.workOrderTypeFmt
                    }, {
                        field: 'order_state',
                        title: '状态',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                        formatter: Col_Fmt.workOrderStateFmt
                    }, {
                        field: 'crt_user_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'deal_user_name',
                        title: '责任人',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'crt_bk_date',
                        title: '创建时间',
                        align: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.workOrderTimeFmt
                    }, {
                        field: 'closed_bk_date',
                        title: '关闭时间',
                        align: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.workOrderTimeFmt
                    }, {
                        field: 'operate',
                        width: '100px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .view': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('wo_detail',{wo_seq :row.order_seq,back_state : 'wo_all_list' })
                            }
                        },
                        formatter: operateFormat
                    }]
                }
            };
            //清除
            $scope.clear = function () {
                $scope.info.nomarlKeyWord = '';
            };
            //高级搜索
            $scope.seniorSearch = function(){
                $scope.control.searchSeniorFlag = false;
                // $scope.searchFlag = !$scope.searchFlag;
                $scope.moreParams.key_word = $scope.info.hightSearchObj.key_word;
                $scope.moreParams.system_key_list = [];
                $scope.moreParams.order_type_list = [];
                $scope.moreParams.order_state_list = [];
                for(var i = 0;i < $scope.info.hightSearchObj.system_list.length;i++){
                    if($scope.info.hightSearchObj.system_list[i].flag){
                        $scope.moreParams.system_key_list.push($scope.info.hightSearchObj.system_list[i].value.business_sys_name);
                    }
                }
                for(var i = 0;i < $scope.info.hightSearchObj.workorder_type.length;i++){
                    if($scope.info.hightSearchObj.workorder_type[i].flag){
                        $scope.moreParams.order_type_list.push($scope.info.hightSearchObj.workorder_type[i].key);
                    }
                }
                for(var i = 0;i < $scope.info.hightSearchObj.workorder_status.length;i++){
                    if($scope.info.hightSearchObj.workorder_status[i].flag){
                        $scope.moreParams.order_state_list.push($scope.info.hightSearchObj.workorder_status[i].key);
                    }
                }
                $scope.moreParams.crt_user_id =$scope.info.hightSearchObj.crt_user_id;
                $scope.moreParams.deal_user_id =$scope.info.hightSearchObj.deal_user_id;
                $scope.moreParams.crt_start_date =CV.dtFormat($scope.info.hightSearchObj.crt_start_date,'-');
                $scope.moreParams.crt_end_date =CV.dtFormat($scope.info.hightSearchObj.crt_end_date,'-');
                $scope.moreParams.deal_start_date =CV.dtFormat($scope.info.hightSearchObj.deal_start_date,'-');
                $scope.moreParams.deal_end_date =CV.dtFormat($scope.info.hightSearchObj.deal_end_date,'-');
                tableData(tblParams);
                $scope.nomarlKeyWord = "";
            };
            //普通搜索
            $scope.normalSearch = function(){
                $scope.moreParams ={};
                $scope.moreParams.key_word = $scope.info.nomarlKeyWord;
                tableData(tblParams);
            };
            $scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.control.crt_opened = true;
            };
            $scope.dealOpen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.control.deal_opened = true;
            };
            function operateFormat(value, row, index) {
                return [
                    '<span class="tabConVi view"  title="查看" >',
                    '</span>'
                ].join("");
            }
            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                params.moreParams = $scope.moreParams;
                Workorder.pageAllWorkorder(params).then(function(data) {
                    data.total = data.all_recd;
                    data.rows = data.all_order_list ? data.all_order_list : [];
                    for(var i=0;i< data.rows.length;i++){
                        data.rows[i].sys_cn_name = data.rows[i].sys_cn_name ? data.rows[i].sys_cn_name : '';
                        data.rows[i].crt_bk_date = data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                        data.rows[i].closed_bk_date = data.rows[i].close_bk_date ? (data.rows[i].close_bk_date +" " + data.rows[i].close_bk_time) : "-----";
                    }
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
//导入工单列表
tbDirective.directive("importList",function(){
    return {
        restrict: 'AE',
        templateUrl: 'templates/table/import_tb.html',
        replace: 'true',
        controller: ["$scope", "$timeout","$compile",  "$state", "Workorder", "config", "Col_Fmt", "Modal", "CV", function($scope, $timeout, $compile, $state, Workorder, config, Col_Fmt, Modal, CV){
            var importParams;
           /* $scope.total_flag = true;
            $scope.success_flag = false;
            $scope.fail_flag = false;
            $scope.totalStyle = function(){
                if($scope.total_flag){
                    return{
                        'display'   : "inline",
                        'background-color' :"gold"
                    }
                }
                else{
                    return{
                        'display'   : "inline",
                    }
                }
            };
            $scope.successStyle = function(){
                if($scope.success_flag){
                    return{
                        'display'   : "inline",
                        'background-color' :"gold"
                    }
                }
                else{
                    return{
                        'display'   : "inline",
                    }
                }
            };
            $scope.failStyle = function(){
                if($scope.fail_flag){
                    return{
                        'display'   : "inline",
                        'background-color' :"gold"
                    }
                }
                else{
                    return{
                        'display'   : "inline",
                    }
                }
            };*/
            $scope.importTableControl= {
                options: {
                    ajax: tableData,
                    pagination: false,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style=";height:40px;display: none;">',
                            "<td colspan='8' style='border:0px;text-align: right;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'row_number',
                        title: '行号',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFmt
                    },{
                        field: 'order_seq',
                        title: '编号',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFlagFmt
                    },{
                        field: 'sys_cn_name',
                        title: '系统',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFmt
                    },{
                        field: 'order_bk_title',
                        title: '标题',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFmt
                    },{
                        field: 'order_bk_desc',
                        title: '工单描述',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFmt
                    },{
                        field: 'trouble_bk_desc',
                        title: '故障描述',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFmt
                    },{
                        field: 'user_cn_name',
                        title: '责任人',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFmt
                    },{
                        field: 'problem_desc',
                        title: '问题描述',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.workOrderFmt
                    }]
                }
            };
            //表格数据绑定
            function tableData(params,index) {
                var _data = {};
                var _excelOrderList = [];
                importParams = params;
                params.order_file_name = $scope.info.file_name;
                if(index == 1){
                    for(var i =0 ;i < $scope.excelOrderList.length; i++){
                        if(!$scope.excelOrderList[i].problem_desc){
                            _excelOrderList.push($scope.excelOrderList[i]);
                        }
                    }
                    _data.rows = _excelOrderList;
                    params.success(_data);
                    params.complete();
                }else if(index == 2){
                    for(var i =0 ;i < $scope.excelOrderList.length; i++){
                        if($scope.excelOrderList[i].problem_desc){
                            _excelOrderList.push($scope.excelOrderList[i]);
                        }
                    }
                    _data.rows = _excelOrderList;
                    params.success(_data);
                    params.complete();
                }else if(index == 3){
                    _data.rows = $scope.excelOrderList;
                    params.success(_data);
                    params.complete();
                }else{
                    Workorder.getAllExcelWorkorder(params.order_file_name).then(function(data) {
                        data.total = data.all_recd;
                        $scope.excelOrderList = data.rows = data.excel_order_list ? data.excel_order_list : [];
                        $scope.info.total_size = data.rows.length;
                        for(var i=0;i < data.rows.length;i++){
                            data.rows[i].sys_cn_name = data.rows[i].sys_cn_name ? data.rows[i].sys_cn_name : '';
                            data.rows[i].user_cn_name = "--";
                            if(!data.rows[i].problem_desc){
                                data.rows[i].problem_desc = "";
                                $scope.info.success_num = $scope.info.success_num + 1;
                            }
                        }
                        params.success(data);
                        params.complete();
                    }, function(error) {
                        Modal.alert(error.message,3);
                        $state.go('wo_new');
                    });
                }
            }
            //根据点击不同类型获取不同的导入数据 index 1 成功的条数 2 失败的条数 3 总的条数
            $scope.changeData = function(index){
                tableData(importParams,index);
            };
        }]
    }
});
//我的任务列表
tbDirective.directive("mineTask",function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/mine_task.html',
        replace: 'true',
        controller: ["$scope", "$timeout", "$state", "config", "Task", "Col_Fmt", "Modal","$compile", "CV", function($scope, $timeout, $state, config, Task, Col_Fmt, Modal, $compile,CV){
            var ch_params ={};
            var tbl_params = {};
            var mine_length;
            var check_length;
            var auth_length;
            var trouble_length;
            var _timer;

            $scope.filter_list = [
                {value:'待授权',key:1,checked:true},
                {value:'授权拒绝',key:2,checked:false},
                {value:'待执行',key:3,checked:false},
                {value:'已执行',key:4,checked:false},
                {value:'已关闭',key:5,checked:false}
            ];
            $scope.config = function(item,tab){
                //tab (1:任务授权 2：我的任务处理 3：任务复核 4：故障单任务处理)
                if(tab == 1){
                    $state.go('task_handle',{tab_name:'auth_task',task_id:item.pend_work_seq});
                }else if(tab == 2){
                    $state.go('task_handle',{tab_name:'mine_task',task_id:item.pend_work_seq});
                }else if(tab == 3) {
                    $state.go('task_handle',{tab_name:'review_task',task_id:item.pend_work_seq});
                }else{
                    $state.go('trouble_task_handle',{tab_name:'trouble_task',task_id:item.pg_work_seq,detail_flag:false});
                }
            }
            //授权任务
            $scope.tasksMineUnauthWorkTableControl = {
                options: {
                    ajax: tableData,
                    pagination: false,
                    search: false,
                    showColumns: false,
                    showRefresh: false,
                    sidePagination: 'server',
                    rowStyle: function (row, index) {
                        if (index == 0) {
                            $('.pagination-detail').hide();
                            $('.pagination').show();
                        }
                        if(row.unhandle == 0){
                            return {classes: 'tbl-unhandle tbl-odd'};
                        }else{
                            return {classes: 'tbl-odd'};
                        }
                    },
                    classes: "table table-no-bordered",
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        if(item.unhandle == 0){
                            $scope.item = item;
                            var add = true;
                            var _html = [
                                '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                                "<td colspan='7' style='border:0px;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='config(item,1);' style='margin-right:20px;'>授权</button></td>",
                                '</tr>'
                            ].join('');
                            if($element.next().attr("id") ==  "col_option"){
                                add = false;
                            }
                            if($("#col_option")){
                                $("#col_option").prev().removeClass('table_col_Style');
                                $("#col_option").remove();
                            }
                            if(add){
                                $element.after($compile(_html)($scope));
                                $element.addClass('table_col_Style');
                                $element.next().slideDown();
                            }
                        }
                    },
                    columns: [{
                        field: 'pend_work_seq',
                        title: '任务流水号',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'pendwk_bk_expl',
                        title: '任务说明',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'workflow_state',
                        title: '任务状态',
                        align: 'left',
                        valign: 'middle',
                        width: '100px',
                        formatter: Col_Fmt.taskStatusFmt,
                    }, {
                        field: 'crt_cn_name',
                        title: '提交人',
                        align: 'left',
                        valign: 'middle',
                        width: '100px'
                    }, {
                        field: 'crt_dept_time',
                        title: '提交时间',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'operate',
                        title: '状态',
                        align: 'left',
                        width:  '300px',
                        valign: 'middle',
                        events: {
                            'mouseenter .event':    function (e, value, row, index) {
                                var _window_height = $(window).height();
                                var element = $(this);
                                var context = row.work_detail_list ? row.work_detail_list :[];
                                for(var i=0;i<context.length;i++){
                                    context[i].time = context[i].deal_bk_date +" "+ context[i].deal_bk_time;
                                    if(context[i].pend_type == 1){
                                        context[i].user = "申请人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 2){
                                        context[i].user = "复核人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 3){
                                        context[i].user = "授权人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 4){
                                        context[i].user = "执行人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 5){
                                        context[i].user = "关闭人：" + context[i].deal_user_cn_name;
                                    }
                                }
                                $scope.test = context;
                                if($scope.test.length > 0){
                                    for(var j=0;j<$scope.test.length;j++){
                                        if($scope.test[j].time !="undefined undefined"){
                                            element.siblings().children().eq(j).children().eq(0).text($scope.test[j].time);
                                        }
                                        element.siblings().children().eq(j).children().eq(1).text($scope.test[j].user);
                                    }
                                }
                                if(element.siblings().height() > (auth_length-index)*38 ){
                                    // var _top = (0 - element.siblings().height()-10) +"px";
                                    // element.siblings().css("margin-top",_top);
                                    element.siblings().removeClass('displayNone');
                                }else{
                                    element.siblings().removeClass('displayNone');
                                }
                            },
                            'mouseleave .event':    function(e, value, row, index){
                                var element = $(this);
                                element.siblings().addClass('displayNone');
                            },
                            'mouseenter .leave':    function(e, value, row, index){
                                var _window_height = $(window).height();
                                var element = $(this);
                                if(element.height() > (auth_length-index)*38 ){
                                    // var _top = (0 - element.height()-10) +"px";
                                    // element.css("margin-top",_top);
                                    element.removeClass('displayNone');
                                }else{
                                    element.removeClass('displayNone');
                                }
                            },
                            'mouseleave .leave':    function(e, value, row, index){
                                var element = $(this);
                                element.addClass('displayNone');
                            },
                        },
                        formatter: Col_Fmt.taskProgressFmt
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .detail': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('task_detail',{tab_name:'auth_task',task_id: row.pend_work_seq})
                            }
                        },
                        formatter: viewTblFormat
                    }]
                }
            };
            //复核任务
            $scope.tasksMineUncheckWorkTableControl = {
                options: {
                    ajax: tableData,
                    pagination: false,
                    search: false,
                    showColumns: false,
                    showRefresh: false,
                    sidePagination: 'server',
                    rowStyle: function (row, index) {
                        if (index == 0) {

                            $('.pagination-detail').hide();
                            $('.pagination').show();
                        }
                        if(row.unhandle == 0){
                            return {classes: 'tbl-unhandle tbl-odd'};
                        }else{
                            return {classes: 'tbl-odd'};
                        }
                    },
                    classes: "table table-no-bordered",
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        if(item.unhandle == 0){
                            $scope.item = item;
                            var add = true;
                            var _html = [
                                '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                                "<td colspan='7' style='border:0px;text-align: right;'><button class='ordinary-btn' ng-click='config(item,3);' style='margin-right:80px;'>复核</button></td>",
                                '</tr>'
                            ].join('');
                            if($element.next().attr("id") ==  "col_option"){
                                add = false;
                            }
                            if($("#col_option")){
                                $("#col_option").prev().removeClass('table_col_Style');
                                $("#col_option").remove();
                            }
                            if(add){
                                $element.after($compile(_html)($scope));
                                $element.addClass('table_col_Style');
                                $element.next().slideDown();
                            }
                        }
                    },
                    columns: [{
                        field: 'pend_work_seq',
                        title: '任务流水号',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'pendwk_bk_expl',
                        title: '任务说明',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'workflow_state',
                        title: '任务状态',
                        align: 'left',
                        valign: 'middle',
                        width: '100px',
                        formatter: Col_Fmt.taskStatusFmt
                    }, {
                        field: 'crt_cn_name',
                        title: '提交人',
                        align: 'left',
                        valign: 'middle',
                        width: '100px'
                    }, {
                        field: 'crt_dept_time',
                        title: '提交时间',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'operate',
                        title: '状态',
                        width:  '280px',
                        align: 'left',
                        valign: 'middle',
                        events: {
                            'mouseenter .event':    function (e, value, row, index) {
                                var element = $(this);
                                var context = row.work_detail_list ? row.work_detail_list :[];
                                for(var i=0;i<context.length;i++){
                                    context[i].time = context[i].deal_bk_date +" "+ context[i].deal_bk_time;
                                    if(context[i].pend_type == 1){
                                        context[i].user = "申请人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 2){
                                        context[i].user = "复核人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 3){
                                        context[i].user = "授权人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 4){
                                        context[i].user = "执行人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 5){
                                        context[i].user = "关闭人：" + context[i].deal_user_cn_name;
                                    }
                                }
                                $scope.test = context;
                                if($scope.test.length > 0){
                                    for(var j=0;j<$scope.test.length;j++){
                                        if($scope.test[j].time !="undefined undefined"){
                                            element.siblings().children().eq(j).children().eq(0).text($scope.test[j].time);
                                        }
                                        element.siblings().children().eq(j).children().eq(1).text($scope.test[j].user);
                                    }
                                }
                                if(element.siblings().height() > (check_length-index)*38 ){
                                    // var _top = (0 - element.siblings().height()-10) +"px";
                                    // element.siblings().css("margin-top",_top);
                                    element.siblings().removeClass('displayNone');
                                }else{
                                    element.siblings().removeClass('displayNone');
                                }
                            },
                            'mouseleave .event':    function(e, value, row, index){
                                var element = $(this);
                                element.siblings().addClass('displayNone');
                            },
                            'mouseenter .leave':    function(e, value, row, index){
                                var element = $(this);
                                if(element.height() > (check_length-index)*38 ){
                                    // var _top = (0 - element.height()-10) +"px";
                                    // element.css("margin-top",_top);
                                    element.removeClass('displayNone');
                                }else{
                                    element.removeClass('displayNone');
                                }
                            },
                            'mouseleave .leave':    function(e, value, row, index){
                                var element = $(this);
                                element.addClass('displayNone');
                            },
                        },
                        formatter: Col_Fmt.taskProgressFmt
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .detail': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('task_detail',{tab_name:'review_task',task_id: row.pend_work_seq})
                            }
                        },
                        formatter: viewTblFormat
                    }]
                }
            };
            //我的任务
            $scope.tasksMineWorkListTableControl = {
                options: {
                    ajax: tableData,
                    pagination: false,
                    search: false,
                    showColumns: false,
                    showRefresh: false,
                    sidePagination: 'server',
                    rowStyle: function (row, index) {
                        if (index == 0) {

                            $('.pagination-detail').hide();
                            $('.pagination').show();
                        }
                        if(row.unhandle == 0){
                            return {classes: 'tbl-unhandle tbl-odd'};
                        }else{
                            return {classes: 'tbl-odd'};
                        }
                    },
                    classes: "table table-no-bordered",
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        if( item.workflow_state != 1 && item.workflow_state != 3){
                            $scope.item = item;
                            var add = true;
                            var _html = [
                                '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                                "<td colspan='7' style='border:0px;text-align: right;'><button class='ordinary-btn' ng-click='config(item,2);' style='margin-right:80px;'>处理</button></td>",
                                '</tr>'
                            ].join('');
                            if($element.next().attr("id") ==  "col_option"){
                                add = false;
                            }
                            if($("#col_option")){
                                $("#col_option").prev().removeClass('table_col_Style');
                                $("#col_option").remove();
                            }
                            if(add){
                                $element.after($compile(_html)($scope));
                                $element.addClass('table_col_Style');
                                $element.next().slideDown();
                            }
                        }
                    },
                    columns: [{
                        field: 'pend_work_seq',
                        title: '任务流水号',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'pendwk_bk_expl',
                        title: '任务说明',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'workflow_state',
                        title: '任务状态',
                        align: 'left',
                        valign: 'middle',
                        width: '100px',
                        formatter: Col_Fmt.taskStatusFmt
                    }, {
                        field: 'pend_cn_name',
                        title: '处理人',
                        align: 'left',
                        valign: 'middle',
                        width:'100px'
                    }, {
                        field: 'crt_dept_time',
                        title: '提交时间',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'operate',
                        title: '状态',
                        width:  '300px',
                        align: 'left',
                        valign: 'middle',
                        events: {
                            'mouseenter .event':    function (e, value, row, index) {
                                var element = $(this);
                                var context = row.work_detail_list ? row.work_detail_list :[];
                                for(var i=0;i<context.length;i++){
                                    context[i].time = context[i].deal_bk_date +" "+ context[i].deal_bk_time;
                                    if(context[i].pend_type == 1){
                                        context[i].user = "申请人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 2){
                                        context[i].user = "复核人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 3){
                                        context[i].user = "授权人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 4){
                                        context[i].user = "执行人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 5){
                                        context[i].user = "关闭人：" + context[i].deal_user_cn_name;
                                    }
                                }
                                $scope.test = context;
                                if($scope.test.length > 0){
                                    for(var j=0;j<$scope.test.length;j++){
                                        if($scope.test[j].time !="undefined undefined"){
                                            element.siblings().children().eq(j).children().eq(0).text($scope.test[j].time);
                                        }
                                        element.siblings().children().eq(j).children().eq(1).text($scope.test[j].user);
                                    }
                                }
                                if(element.siblings().height() > (mine_length-index)*38 ){
                                    // var _top = (0 - element.siblings().height()-10) +"px";
                                    // element.siblings().css("margin-top",_top);
                                    element.siblings().removeClass('displayNone');
                                }else{
                                    element.siblings().removeClass('displayNone');
                                }
                            },
                            'mouseleave .event':    function(e, value, row, index){
                                var element = $(this);
                                element.siblings().addClass('displayNone');
                            },
                            'mouseenter .leave':    function(e, value, row, index){
                                var _window_height = $(window).height();
                                var element = $(this);
                                if(element.height() > (mine_length-index)*38 ){
                                    // var _top = (0 - element.height()-10) +"px";
                                    // element.css("margin-top",_top);
                                    element.removeClass('displayNone');
                                }else{
                                    element.removeClass('displayNone');
                                }
                            },
                            'mouseleave .leave':    function(e, value, row, index){
                                var element = $(this);
                                element.addClass('displayNone');

                            },
                            'click .leave':function(e, value, row, index){
                                e.stopPropagation();
                            },
                        },
                        formatter: Col_Fmt.taskProgressFmt
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .detail': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('task_detail',{tab_name:'mine_task',task_id: row.pend_work_seq})
                            }
                        },
                        formatter: viewTblFormat
                    }]
                }
            };
            //故障单任务
            $scope.tasksTroubleTicketTableControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function (row, index) {
                        if (index == 0) {

                            $('.pagination-detail').hide();
                            $('.pagination').show();
                        }
                        if(row.unhandle == 0){
                            return {classes: 'tbl-unhandle tbl-odd'};
                        }else{
                            return {classes: 'tbl-odd'};
                        }
                    },
                    classes: "table table-no-bordered",
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        if( item.workflow_state != 1 && item.workflow_state != 3){
                            $scope.item = item;
                            var add = true;
                            var _html = [
                                '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                                "<td colspan='8' style='border:0px;text-align: right;'><button class='ordinary-btn' ng-click='config(item,4);' style='margin-right:80px;'>处理</button></td>",
                                '</tr>'
                            ].join('');
                            if($element.next().attr("id") ==  "col_option"){
                                add = false;
                            }
                            if($("#col_option")){
                                $("#col_option").prev().removeClass('table_col_Style');
                                $("#col_option").remove();
                            }
                            if(add){
                                $element.after($compile(_html)($scope));
                                $element.addClass('table_col_Style');
                                $element.next().slideDown();
                            }
                        }
                    },
                    columns: [{
                        field: 'program_seq',
                        title: '方案编号',
                        align: 'left',
                        valign: 'middle',
                        width: '120px'
                    }, {
                        field: 'pg_work_seq',
                        title: '授权任务编号',
                        align: 'left',
                        valign: 'middle',
                        width: '165px',
                    }, {
                        field: 'pend_user_cname',
                        title: '待处理人',
                        align: 'left',
                        valign: 'middle',
                        width:'120px'
                    }, {
                        field: 'apply_bk_expl',
                        title: '任务申请说明',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'crt_user_cname',
                        title: '提交人',
                        align: 'left',
                        valign: 'middle',
                        width:'120px'
                    }, {
                        field: 'crt_dept_time',
                        title: '提交时间',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'pgwork_status',
                        title: '状态',
                        width:  '120px',
                        align: 'left',
                        valign: 'middle',
                        events:{
                            'click .event_state':function(e, value, row, index){
                                e.stopPropagation();
                                var element = $(this);
                                var str = '';
                                element.siblings().removeClass('displayNone');
                                element.siblings().css("top",41*index +78 +"px");
                                if(row.step_detail.length == 0){
                                    element.siblings().html('<div style="color:#44dcfd;padding:5px 10px;">正在获取步骤信息&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i></div>');
                                    //服务加载中
                                    if(_timer) $timeout.cancel(_timer);
                                    _timer = $timeout(function(){
                                        Task.getProgramAuthDetail(row.pg_work_seq).then(function(data){
                                            row.step_detail = data.pg_detail_list ? data.pg_detail_list : [];
                                            for(var i=0;i<row.step_detail.length;i++){
                                                row.step_detail[i].time = row.step_detail[i].deal_bk_date +" "+ row.step_detail[i].deal_bk_time;
                                                if(row.step_detail[i].pgpend_type == 1){
                                                    row.step_detail[i].user = "申请人：" + row.step_detail[i].deal_user_cname;
                                                }else if(row.step_detail[i].pgpend_type == 2){
                                                    row.step_detail[i].user = "授权人：" + row.step_detail[i].deal_user_cname;
                                                }else if(row.step_detail[i].pgpend_type == 3 && (row.pgwork_status ==5 || row.pgwork_status ==2)){
                                                    row.step_detail[i].user = "关闭人：" + row.step_detail[i].deal_user_cname;
                                                }else if(row.step_detail[i].pgpend_type == 3 && row.pgwork_status !=5 && row.pgwork_status !=2){
                                                    row.step_detail[i].user = "执行人：" + row.step_detail[i].deal_user_cname;
                                                }else if(row.step_detail[i].pgpend_type == 4){
                                                    row.step_detail[i].user = "关闭人：" + row.step_detail[i].deal_user_cname;
                                                }
                                                str = str+'<div style="padding:2px 10px;">';
                                                str =str +'<span style="padding:8px;background-color:#253549;display:inline-block;width:160px;text-align:left;margin-left: 8px;">'+((row.step_detail[i].time != "undefined undefined")? row.step_detail[i].time : "--") +'</span>';
                                                str =str +'<span style="padding:8px;background-color:#253549;display:inline-block;width:220px;text-align:left;margin-left:4px;">'+(row.step_detail[i].user)+'</span>';
                                                //待执行
                                                if(row.step_detail[i].run_state == 1){
                                                    str =str +'<div title="待执行" style="padding:8px;display:inline-block;width:30px;background-color:#253549;text-align:center;margin-left:4px;height: 40px;margin-bottom: -15px;">--</div>';
                                                }else{
                                                    str =str +'<div title='+((row.step_detail[i].run_state==3) ? "执行成功" : (row.step_detail[i].run_state==2)?"执行中":"执行失败")+' style="padding:8px;display:inline-block;width:30px;text-align:center;margin-left:4px;background: #253549 url(img/task_state'+((row.step_detail[i].run_state==3) ? 1 : (row.step_detail[i].run_state==2)?2:3)+'.png) no-repeat center;height: 40px;margin-bottom: -15px;"></div>';
                                                }
                                                str =str +'</div>';
                                                element.siblings().html(str);
                                            }
                                        },function(error){
                                            element.siblings().html("<div style='color: #A01F1F;word-break:break-all;padding:5px 10px;'>"+error.message+"</div>");
                                        });
                                    },1000);
                                }
                            },
                            'mouseleave .event_state':function(e, value, row, index){
                                var element = $(this);
                                element.siblings().addClass('displayNone');
                            },
                            'mouseenter .leave_state':function(e, value, row, index){
                                var element = $(this);
                                element.removeClass('displayNone');
                            },
                            'mouseleave .leave_state':function(e, value, row, index){
                                var element = $(this);
                                element.addClass('displayNone');
                            },
                            'click .leave_state':function(e, value, row, index){
                               e.stopPropagation();
                            },
                        },
                        formatter: Col_Fmt.taskTroubleProgressFmt
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .detail': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('trouble_task_handle',{tab_name:'trouble_task',task_id: row.pg_work_seq,detail_flag:true});
                            }
                        },
                        formatter: viewTblFormat
                    }]
                }
            };

            function viewTblFormat(value,row,index){
                return [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<a class="tabConVi detail" title="查看" >',
                    '</a>',
                    '</div>'
                ].join("");
            }
            function tableData(params) {
                var arr=[];
                if($scope.control.tab_flag == 1){
                    Task.wk_QueryMineWorkListAction().then(function (data) {
                        var mine_list = data.mine_work_list ? data.mine_work_list :[];
                        for(var i =0;i<mine_list.length;i++){
                            mine_list[i].unhandle = 1;
                        }
                        var executory_list = data.mine_executory_list ? data.mine_executory_list :[];
                        for(var i =0;i<executory_list.length;i++){
                            executory_list[i].unhandle = 0;
                        }
                        data.rows = executory_list.concat(mine_list);
                        for(var i=0;i< data.rows.length; i++){
                            data.rows[i].crt_dept_time =data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                        }
                        mine_length =data.rows.length;
                        params.success(data);
                        params.complete();
                        ch_params = params;
                    }, function (error) {
                        Modal.alert(error.message,3);
                    });
                }else if($scope.control.tab_flag == 2){
                    Task.wk_QueryMineUncheckWorkAction().then(function (data) {
                        var mine_list = data.uncheck_work_list ? data.uncheck_work_list :[];
                        for(var i =0;i<mine_list.length;i++){
                            mine_list[i].unhandle = 1;
                        }
                        var executory_list = data.executory_uncheck_list ? data.executory_uncheck_list :[];
                        for(var i =0;i<executory_list.length;i++){
                            executory_list[i].unhandle = 0;
                        }
                        data.rows = executory_list.concat(mine_list);
                        for(var i=0;i< data.rows.length; i++){
                            data.rows[i].crt_dept_time =data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                        }
                        check_length = data.rows.length;
                        params.success(data);
                        params.complete();
                        ch_params = params;
                    }, function (error) {
                        Modal.alert(error.message,3);
                    });
                }else if($scope.control.tab_flag == 3){
                    Task.wk_QueryMineUnauthWorkAction().then(function (data) {
                        var mine_list = data.unauth_work_list ? data.unauth_work_list :[];
                        for(var i =0;i<mine_list.length;i++){
                            mine_list[i].unhandle = 1;
                        }
                        var executory_list = data.executory_unauth_list ? data.executory_unauth_list :[];
                        for(var i =0;i<executory_list.length;i++){
                            executory_list[i].unhandle = 0;
                        }
                        data.rows = executory_list.concat(mine_list);
                        for(var i=0;i< data.rows.length; i++){
                            data.rows[i].crt_dept_time =data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                        }
                        auth_length = data.rows.length;
                        params.success(data);
                        params.complete();
                        ch_params = params;
                    }, function (error) {
                        Modal.alert(error.message,3);
                    });
                }else{
                    getSubmitState(params);
                    tbl_params = params;
                    Task.wk_QueryTroubleTicketWorkAction(params).then(function(data){
                        if(data){
                            data.total = data.all_recd;
                            data.rows = data.pg_work_list ? data.pg_work_list : [];
                            trouble_length = data.all_recd;
                            for(var i=0;i< data.rows.length; i++){
                                data.rows[i].crt_dept_time =data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                                data.rows[i].step_detail = [];
                            }
                            params.success(data);
                            params.complete();
                            ch_params = params;
                        }
                    },function(error){
                        Modal.alert(error.message,3);
                    });
                }
            };
            //筛选故障单
            $scope.getHandleList = function(index){
                if(testState(index)){
                    $scope.filter_list[index].checked = !$scope.filter_list[index].checked;
                    tbl_params.run_flag = true;
                    tbl_params.data.offset = 0;
                    tableData(tbl_params);
                }
            };
            //校验选中状态
            var testState = function(index){
                var list = [];
                for(var i=0; i<$scope.filter_list.length; i++){
                    if($scope.filter_list[i].checked){
                        list.push($scope.filter_list[i]);
                    }
                }
                if($scope.filter_list[index].checked && list.length==1){
                    return false;
                }
                return true;
            };
            //获取用户提交的状态
            var getSubmitState = function(params){
                for(var i= 0,arr=[]; i<$scope.filter_list.length; i++){
                    if($scope.filter_list[i].checked){
                        arr.push($scope.filter_list[i].key);
                    }
                }
                params.status_list = arr.join(",");
            }
        }]
    }
});
//历史任务列表
tbDirective.directive("hisTask",function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/his_task.html',
        replace: 'true',
        controller: ["$scope", "$timeout","$compile", "$state", "config", "Task", "Col_Fmt", "Modal", "CV",function($scope, $timeout, $compile, $state, config, Task, Col_Fmt, Modal, CV){
            var commit_length;
            var check_length;
            var auth_length;
            //提交历史
            $scope.tasksHistoryCommitTableControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize: 10,
                    pageNumber: 1,
                    search: false,
                    sidePagination: 'server',
                    showColumns: false,
                    showRefresh: false,

                    rowStyle: function (row, index) {
                        if (index == 0) {

                            $('.pagination-detail').hide();
                            $('.pagination').show();
                        }
                        return {classes: 'tbl-odd'};

                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="display: none;">',
                            "<td colspan='6' style='border:0px;text-align: right;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'pend_work_seq',
                        title: '任务流水号',
                        align: 'left',
                        valign: 'middle',
                        width:'165px'
                    }, {
                        field: 'pendwk_bk_expl',
                        title: '任务说明',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'workflow_state',
                        title: '任务状态',
                        align: 'left',
                        valign: 'middle',
                        width: '100px',
                        formatter: Col_Fmt.taskStatusFmt,

                    }, {
                        field: 'deal_bk_dt',
                        title: '结束日期',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'operate',
                        width: '300px',
                        title: '状态',
                        align: 'left',
                        valign: 'middle',
                        events: {
                            'mouseenter .event':    function (e, value, row, index) {
                                var _window_height = $(window).height();
                                var element = $(this);
                                var context = row.work_detail_list ? row.work_detail_list :[];
                                for(var i=0;i<context.length;i++){
                                    context[i].time = context[i].deal_bk_date +" "+ context[i].deal_bk_time;
                                    if(context[i].pend_type == 1){
                                        context[i].user = "申请人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 2){
                                        context[i].user = "复核人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 3){
                                        context[i].user = "授权人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 4){
                                        context[i].user = "执行人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 5){
                                        context[i].user = "关闭人：" + context[i].deal_user_cn_name;
                                    }
                                }
                                $scope.test = context;
                                if($scope.test.length > 0){
                                    for(var j=0;j<$scope.test.length;j++){
                                        if($scope.test[j].time !="undefined undefined"){
                                            element.siblings().children().eq(j).children().eq(0).text($scope.test[j].time);
                                        }
                                        element.siblings().children().eq(j).children().eq(1).text($scope.test[j].user);
                                    }
                                }
                                if(element.siblings().height() > (commit_length-index)*38 && index > 5){
                                    element.siblings().removeClass('displayNone');
                                }else{
                                    element.siblings().removeClass('displayNone');
                                }
                            },
                            'mouseleave .event':    function(e, value, row, index){
                                var element = $(this);
                                element.siblings().addClass('displayNone');
                            },
                            'mouseenter .leave':    function(e, value, row, index){
                                var element = $(this);
                                if(element.siblings().height() > (commit_length-index)*38 && index > 5){
                                    element.removeClass('displayNone');
                                }else{
                                    element.removeClass('displayNone');
                                }
                            },
                            'mouseleave .leave':    function(e, value, row, index){
                                var element = $(this);
                                element.addClass('displayNone');
                            },
                        },
                        formatter: Col_Fmt.taskHistoryProgressFmt
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'left',
                        valign: 'middle',
                        events : {
                            'click .detail': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('task_detail',{tab_name:'submit_his',task_id:row.pend_work_seq});
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            //复核历史
            $scope.tasksHistoryUncheckTableControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize: 10,
                    pageNumber: 1,
                    search: false,
                    sidePagination: 'server',
                    showColumns: false,
                    showRefresh: false,

                    rowStyle: function (row, index) {
                        if (index == 0) {

                            $('.pagination-detail').hide();
                            $('.pagination').show();
                        }
                        return {classes: 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="display: none;">',
                            "<td colspan='7' style='border:0px;text-align: right;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'pend_work_seq',
                        title: '任务流水号',
                        align: 'left',
                        valign: 'middle',
                        width:'165px'
                    }, {
                        field: 'pendwk_bk_expl',
                        title: '任务说明',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'workflow_state',
                        title: '任务状态',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.taskStatusFmt,
                    }, {
                        field: 'crt_user_cn_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        width:'100px'
                    },{
                        field: 'deal_bk_dt',
                        title: '结束日期',
                        align: 'left',
                        valign: 'middle',
                        width:'165px'
                    }, {
                        field: 'operate',
                        width: '300px',
                        title: '状态',
                        align: 'left',
                        valign: 'middle',
                        events: {
                            'mouseenter .event':    function (e, value, row, index) {
                                var _window_height = $(window).height();
                                var element = $(this);
                                var context = row.work_detail_list ? row.work_detail_list :[];
                                for(var i=0;i<context.length;i++){
                                    context[i].time = context[i].deal_bk_date +" "+ context[i].deal_bk_time;
                                    if(context[i].pend_type == 1){
                                        context[i].user = "申请人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 2){
                                        context[i].user = "复核人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 3){
                                        context[i].user = "授权人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 4){
                                        context[i].user = "执行人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 5){
                                        context[i].user = "关闭人：" + context[i].deal_user_cn_name;
                                    }
                                }
                                $scope.test = context;
                                if($scope.test.length > 0){
                                    for(var j=0;j<$scope.test.length;j++){
                                        if($scope.test[j].time !="undefined undefined"){
                                            element.siblings().children().eq(j).children().eq(0).text($scope.test[j].time);
                                        }
                                        element.siblings().children().eq(j).children().eq(1).text($scope.test[j].user);
                                    }
                                }
                                if(element.siblings().height() > (check_length-index)*38 && index > 5){
                                    // var _top = (0 - element.siblings().height()-10) +"px";
                                    // element.siblings().css("margin-top",_top);
                                    element.siblings().removeClass('displayNone');
                                }else{
                                    element.siblings().removeClass('displayNone');
                                }
                            },
                            'mouseleave .event':    function(e, value, row, index){
                                var element = $(this);
                                element.siblings().addClass('displayNone');
                            },
                            'mouseenter .leave':    function(e, value, row, index){
                                var element = $(this);
                                if(element.height() > (check_length-index)*38 && index > 5){
                                    // var _top = (0 - element.siblings().height()-10) +"px";
                                    // element.css("margin-top",_top);
                                    element.removeClass('displayNone');
                                }else{
                                    element.removeClass('displayNone');
                                }
                            },
                            'mouseleave .leave':    function(e, value, row, index){
                                var element = $(this);
                                element.addClass('displayNone');
                            },
                        },
                        formatter: Col_Fmt.taskHistoryProgressFmt
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'left',
                        valign: 'middle',
                        events : {
                            'click .detail': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('task_detail',{tab_name:'review_his', task_id:row.pend_work_seq});
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            //授权历史
            $scope.tasksHistoryUnauthTableControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize: 10,
                    pageNumber: 1,
                    search: false,
                    sidePagination: 'server',
                    showColumns: false,
                    showRefresh: false,

                    rowStyle: function (row, index) {
                        if (index == 0) {

                            $('.pagination-detail').hide();
                            $('.pagination').show();
                        }
                        return {classes: 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="display: none;">',
                            "<td colspan='7' style='border:0px;text-align: right;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'pend_work_seq',
                        title: '任务流水号',
                        align: 'left',
                        valign: 'middle',
                        width:'165px'
                    }, {
                        field: 'pendwk_bk_expl',
                        title: '任务说明',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'workflow_state',
                        title: '任务状态',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.taskStatusFmt
                    }, {
                        field: 'crt_user_cn_name',
                        title: '提交人',
                        align: 'left',
                        valign: 'middle',
                        width: '100px',
                    },{
                        field: 'deal_bk_dt',
                        title: '结束时间',
                        align: 'left',
                        valign: 'middle',
                        width: '165px'
                    }, {
                        field: 'operate',
                        width: '300px',
                        title: '状态',
                        align: 'left',
                        valign: 'middle',
                        events: {
                            'mouseenter .event':    function (e, value, row, index) {
                                var element = $(this);
                                var context = row.work_detail_list ? row.work_detail_list :[];
                                for(var i=0;i<context.length;i++){
                                    context[i].time = context[i].deal_bk_date +" "+ context[i].deal_bk_time;
                                    if(context[i].pend_type == 1){
                                        context[i].user = "申请人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 2){
                                        context[i].user = "复核人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 3){
                                        context[i].user = "授权人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 4){
                                        context[i].user = "执行人：" + context[i].deal_user_cn_name;
                                    }else if(context[i].pend_type == 5){
                                        context[i].user = "关闭人：" + context[i].deal_user_cn_name;
                                    }
                                }
                                $scope.test = context;
                                if($scope.test.length > 0){
                                    for(var j=0;j<$scope.test.length;j++){
                                        if($scope.test[j].time !="undefined undefined"){
                                            element.siblings().children().eq(j).children().eq(0).text($scope.test[j].time);
                                        }
                                        element.siblings().children().eq(j).children().eq(1).text($scope.test[j].user);
                                    }
                                }
                                if(element.siblings().height() > (auth_length-index)*38 && index > 5){
                                    // var _top = (0 - element.siblings().height()-10) +"px";
                                    // element.siblings().css("margin-top",_top);
                                    element.siblings().removeClass('displayNone');
                                }else{
                                    element.siblings().removeClass('displayNone');
                                }
                            },
                            'mouseleave .event':    function(e, value, row, index){
                                var element = $(this);
                                element.siblings().addClass('displayNone');
                            },
                            'mouseenter .leave':    function(e, value, row, index){
                                var element = $(this);
                                if(element.height() > (auth_length-index)*38 && index > 5){
                                    element.removeClass('displayNone');
                                }else{
                                    element.removeClass('displayNone');
                                }
                            },
                            'mouseleave .leave':    function(e, value, row, index){
                                var element = $(this);
                                element.addClass('displayNone');
                            },
                        },
                        formatter: Col_Fmt.taskHistoryProgressFmt
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'left',
                        valign: 'middle',
                        events : {
                            'click .detail': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('task_detail',{tab_name:'auth_his', task_id:row.pend_work_seq});
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            function operateFormat(value, row, index) {
                var _config_word = [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<a class="tabConVi detail" title="查看任务">',
                    '</a>',
                    '</div>'
                ].join('');
                return _config_word;
            }

            //表格数据绑定
            function tableData(params) {
                if($scope.control.tab_flag == 1){
                    Task.wk_PageMineHistoryWorkAction(params).then(function (data) {
                        data.total = data.all_recd;
                        data.rows = data.mine_history_list ? data.mine_history_list :[];
                        for(var i=0;i< data.rows.length; i++){
                            data.rows[i].deal_bk_dt =data.rows[i].deal_bk_date +" "+ data.rows[i].deal_bk_time;
                        }
                        commit_length = data.rows.length;
                        params.success(data);
                        params.complete();
                    }, function (error) {
                        Modal.alert(error.message,3);
                    });
                }else if($scope.control.tab_flag == 2){
                    Task.wk_PageMineHistoryUncheckAction(params).then(function (data) {
                        data.total = data.all_recd;
                        data.rows = data.uncheck_history_list ? data.uncheck_history_list :[];
                        for(var i=0;i< data.rows.length; i++){
                            data.rows[i].deal_bk_dt =data.rows[i].deal_bk_date +" "+ data.rows[i].deal_bk_time;
                        };
                        check_length = data.rows.length;
                        params.success(data);
                        params.complete();
                    }, function (error) {
                        Modal.alert(error.message,3);
                    });
                }else{
                    Task.wk_PageMineHistoryUnauthAction(params).then(function (data) {
                        data.total = data.all_recd;
                        data.rows = data.unauth_history_list ? data.unauth_history_list :[];
                        for(var i=0;i< data.rows.length; i++){
                            data.rows[i].deal_bk_dt =data.rows[i].deal_bk_date +" "+ data.rows[i].deal_bk_time;
                        };
                        auth_length = data.rows.length;
                        params.success(data);
                        params.complete();
                    }, function (error) {
                        Modal.alert(error.message,3);
                    });
                }

            }
        }]
    }
});
//消息列表
tbDirective.directive("messageList",function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/message_list.html',
        replace: 'true',
        scope: {},
        controller: ["$scope", "$timeout","$compile", "$state", "config", "Message", "Col_Fmt", "Modal", "CV",function($scope, $timeout,$compile,  $state, config, Message, Col_Fmt, Modal, CV){
            var timer;
            var tblParams = {};
            $scope.msgTableControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize: 10,
                    pageNumber: 1,
                    search: false,
                    sidePagination: 'server',
                    showColumns: false,
                    showRefresh: false,
                    sortName: 'crt_bk_time',
                    sortOrder: 'asc',
                    rowStyle: function (row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        if(row.rc_flag == 2){
                            return {
                                classes: 'tbl-odd' ,
                                css:{'font-weight':'bold'}

                            };
                        }else{
                            return {classes: 'tbl-odd'};
                        }
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="display: none;">',
                            "<td colspan='4' style='border:0px;text-align: right;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'crt_bk_time',
                        title: '时间',
                        align: 'left',
                        valign: 'middle',
                        width:'165px',
                    }, {
                        field: 'msg_title',
                        title: '主题',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt

                    }, {
                        field: 'crt_user_id',
                        title: '发布人',
                        align: 'left',
                        valign: 'middle',
                        width:'180px',
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .trash': function (e, value, row, index) {
                                e.stopPropagation();
                                var work_seq = row.work_seq;
                                Modal.confirm("确认删除[" + row.msg_title + "]消息？").then(function (choose) {
                                    if (choose) {
                                        Message.deleteOneMessage(work_seq,row.msg_title).then(function (data) {
                                            if(data){
                                                Modal.alert(row.msg_title + "删除消息成功！",2);
                                                tableData(tblParams);
                                            }
                                        }, function (error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .detail': function (e, value, row, index) {
                                e.stopPropagation();
                                var work_seq = row.work_seq;
                                $state.go('msg_detail',{msg_id:work_seq})
                            }
                        },
                        formatter: operateFormat
                    }]
                }
            };
            /* ui-sref="message_detail({work_seq : ' + row.work_seq + '})"*/
            function operateFormat(value, row, index) {
                return [
                    '<div style="position: absolute;margin-top: -12px;">',
                    '<a class="tabConVi detail" title="查看">',
                    '</a>',
                    '<div class="tabConDe trash" href="javascript:void(0)" style="margin-left: 8px;" id='+row.work_seq+' title="删除">',
                    '</div>',
                    '</div>',
                ].join("");
            }

            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                Message.mg_PageMessageActionPg(params).then(function (data) {
                    $timeout(function(){
                        data.total = data.all_recd;
                        data.rows = data.msg_list ? data.msg_list : [];
                        params.success(data);
                        params.complete();
                    },0);
                }, function (error) {
                    Modal.alert(error.message,3);
                });

            }
        }]
    }
});
//处理工单----方案列表
tbDirective.directive("programTab",function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/program_tb.html',
        replace: 'true',
        controller: ["$scope", "$modal","$compile", "$timeout", "$location", "Program","ProgramExec", "config", "Col_Fmt", "Modal", "CV",function($scope,$modal, $compile, $timeout, $location, Program,ProgramExec, config, Col_Fmt, Modal, CV){
            var tblParams = {};
            var _index = $scope.handle_control.curr_index;
            //搜索
            $scope.search = function(index){
                tableData(tblParams);
            };
            $scope.programTableControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize: 10,
                    pageNumber: 1,
                    search: false,
                    sidePagination: 'server',
                    showColumns: false,
                    showRefresh: false,
                    rowStyle: function (row, index) {
                        return  row.pg_yn_flag == 2 ? {classes: 'tbl-odd tb-lightish'}: {classes: 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='5' style='border:0;text-align: right;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table-no-bordered table-hover",
                    columns: [{
                        field: 'program_seq',
                        title: '编号',
                        align: 'left',
                        valign: 'middle',
                        width:'100px'
                    }, {
                        field: 'program_name',
                        title: '方案名称',
                        align: 'left',
                        valign: 'middle',
                        formatter:Col_Fmt.programFmt
                    }, {
                        field: 'user_cn_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        width:'100px'
                    }, {
                        field: 'crt_bk_date',
                        title: '保存时间',
                        align: 'left',
                        valign: 'middle',
                        width:'100px'
                        }, {
                        field: 'operate',
                        width: '120px',
                        title: '',
                        align: 'right',
                        valign: 'middle',
                        cellStyle:function cellStyle(value, row, index, field) {
                            return {
                                css: {"padding": "0px"}
                            };
                        },
                        events: {
                            'click .user': function (e, value, row, index) {
                                e.stopPropagation();
                                if(row.pg_source == 1){
                                    $timeout(function(){
                                        ProgramExec.useProgram($scope.data.sub_tabs[_index].wo_id,$scope.data.sub_tabs[_index].basicData.deal_bk_seq,row.program_seq)
                                            .then(function(data){
                                                $scope.data.sub_tabs[_index].steps = [];
                                                $scope.data.sub_tabs[_index].showParamList = false;
                                                $scope.data.sub_tabs[_index].program_seq = row.program_seq;
                                                $scope.data.sub_tabs[_index].program_name = row.program_name;
                                                return Program.getProgramInfoAndStepList(row.program_seq);
                                            })
                                            .then(function(data) {
                                                if(data.program_step_list){
                                                    for(var i=0; i < data.program_step_list.length; i++){
                                                        $scope.data.sub_tabs[_index].steps.push({
                                                            step_seq: data.program_step_list[i].step_seq,
                                                            step_bk_title:data.program_step_list[i].step_bk_title,
                                                            sql_list:[],
                                                            type:0,
                                                            data:[]
                                                        });
                                                    }
                                                }
                                                return ProgramExec.getStepByProgramStepId(row.program_seq,1);
                                            })
                                            .then(function(data) {
                                                var _sub_tab = $scope.data.sub_tabs[_index];
                                                _sub_tab.steps[0].sql_list = data.sql_list ? data.sql_list : [];
                                                _sub_tab.steps[0].type = data.sql_list ? 1 : 0 ;
                                                //第一次进入，控制不显示全部重置的按钮
                                                _sub_tab.first_show_resetall=false;
                                                _sub_tab.finish_deal_order=false;
                                                _sub_tab.steps[0].stepFormLock = false;
                                            }, function(error) {
                                                Modal.alert(error.message,3);
                                            });
                                    },0);
                                }else if(row.pg_source == 2){
                                    $timeout(function(){
                                        ProgramExec.getImportPath($scope.data.sub_tabs[_index].wo_id,row.program_seq)
                                            .then(function(data){
                                                $scope.data.sub_tabs[_index].showParamList = false;
                                                $scope.data.sub_tabs[_index].batchProgramBtn = true;
                                                //固化方案--批量方案处理上传文件配置
                                                $scope.data.sub_tabs[_index].batch_program_fileupload = {
                                                    suffixs:'xls,xlsx',
                                                    filetype:"EXCEL",
                                                    filename:"",
                                                    uploadpath:data.pg_excel_path,
                                                };
                                                $scope.data.sub_tabs[_index].program_result_msg = {};
                                                $scope.data.sub_tabs[_index].control = {
                                                    show_result : false,
                                                    show_exec_btn: true
                                                };
                                                $scope.data.sub_tabs[_index].program_seq = row.program_seq;
                                                $scope.data.sub_tabs[_index].program_name = row.program_name;
                                                $scope.data.sub_tabs[_index].pg_source = row.pg_source;
                                                return ProgramExec.useProgram($scope.data.sub_tabs[_index].wo_id,$scope.data.sub_tabs[_index].basicData.deal_bk_seq,row.program_seq);
                                            })
                                            .then(function (data) {

                                            },function (error) {
                                                Modal.alert(error.message,3);
                                            })
                                    },0);
                                }else {
                                    ProgramExec.useProgram($scope.data.sub_tabs[_index].wo_id,$scope.data.sub_tabs[_index].basicData.deal_bk_seq,row.program_seq)
                                        .then(function(data){
                                            $scope.data.sub_tabs[_index].steps = [];
                                            $scope.data.sub_tabs[_index].batchSelectProgramBtn = true;
                                            $scope.data.sub_tabs[_index].showParamList = false;
                                            $scope.data.sub_tabs[_index].program_seq = row.program_seq;
                                            $scope.data.sub_tabs[_index].program_name = row.program_name;
                                            $scope.data.sub_tabs[_index].control = {
                                                show_result : false,
                                                show_exec_btn: true,
                                                exec_loading  : false
                                            };
                                            $scope.data.sub_tabs[_index].pg_source = row.pg_source;
                                            return Program.getSelectProgramAllInfo(row.program_seq,$scope.data.sub_tabs[_index].wo_id,$scope.data.sub_tabs[_index].basicData.deal_bk_seq);
                                        })
                                        .then(function (data) {
                                            $scope.data.sub_tabs[_index].step_list = data.program_step_list ? data.program_step_list :[];
                                            for(var i=0;i<$scope.data.sub_tabs[_index].step_list.length;i++){
                                                var _step = $scope.data.sub_tabs[_index].step_list[i];
                                                 for(var j=0;j<_step.program_sql_list.length;j++){
                                                     var _sql = _step.program_sql_list[j];
                                                     if(_sql.sql_param_list){
                                                         for(var k=0;k<_sql.sql_param_list.length;k++){
                                                             _sql.sql_param_list[k].sparam_scope = '';
                                                         }
                                                     }
                                                 }
                                            }
                                        },function (error) {
                                            Modal.alert(error.message,3);
                                        })
                                }
                            },
                            'click .preview': function (e, value, row, index) {
                                e.stopPropagation();
                                $timeout(function(){
                                   Modal.previewProgram(row.program_seq);
                                },0);
                            },
                            'click .download': function (e, value, row, index) {
                                e.stopPropagation();
                                $timeout(function(){
                                    var _program_seq = row.program_seq;
                                    Program.exportBatchProgram(_program_seq).then(function (data) {
                                        $timeout(function () {
                                            if(data){
                                                CV.downloadFile(data.file_full_path);
                                            }
                                        },0);
                                    },function (error) {
                                        Modal.alert(error.message,3);
                                    });
                                },0);
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            function operateFormat(value, row, index) {
                return config.getPromgramConfigCol(value, row, index);
            }
            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                    params.key_word = $scope.key_word;
                    Program.pageProgramList(params).then(function (data) {
                        data.total = data.all_recd;
                        data.rows = data.page_program_list;
                        params.success(data);
                        params.complete();
                    }, function (error) {
                        Modal.alert(error.message,3);
                    });
                }
        }]
    }
});
//方案库列表
tbDirective.directive("programList",function(){
    return {
        restrict: 'AE',
        templateUrl: 'templates/table/fault_program_tbl.html',
        replace: 'true',
        controller: ["$scope", "$location", "$modal", "$state", "$timeout","$compile", "config", "Col_Fmt", "Program", "Modal", "CV",function($scope, $location, $modal, $state, $timeout, $compile,config, Col_Fmt, Program, Modal, CV){
            var timer,tblParams;
            var program ={};     //方案对象
            var finish_params={}; //搜索完成参数
            //下载
            $scope.downLoadProgram = function(item){
                var _program_seq = item.program_seq;
                Program.exportBatchProgram(_program_seq).then(function (data) {
                    $timeout(function () {
                        if(data){
                            CV.downloadFile(data.file_full_path);
                        }
                    },0);
                },function (error) {
                    Modal.alert(error.message,3);
                });
            }
            //方案列表配置
            $scope.programTableControl= {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:20,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        if (index == 0) {
                            $('.pagination-detail').hide();
                        }
                        return { classes: 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            (item.pg_source == 1 || item.pg_source == 3 || !item.pg_source) ? "<td colspan='6' style='border:0px;text-align: right;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>" :"<td colspan='6' style='border:0;text-align: right;'><button class='ordinary-btn' ng-click='downLoadProgram(item);' style='margin-right:80px;'><i class='fa fa-download'></i>&nbsp;下载</button></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'program_seq',
                        title: '编号',
                        align: 'left',
                        valign: 'middle',
                        width:'130px',
                        formatter: Col_Fmt.workOrderFmt
                    },{
                        field: 'program_name',
                        title: '方案名称',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.programFmt
                    },{
                        field: 'program_bk_desc',
                        title: '方案描述',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'user_cn_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        width:"150px",
                        formatter: Col_Fmt.workOrderFmt
                    }, {
                        field: 'crt_bk_time',
                        title: '创建时间',
                        align: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.programTimeFmt
                    },{
                        field: 'operate',
                        width: '100px',
                        title: '',
                        align: 'right',
                        valign: 'middle',
                        events: {
                            'click .trash': function(event, value, row, index) {
                                event.stopPropagation();
                                var _program_seq = row.program_seq;
                                Modal.confirm("确认删除["+_program_seq+"]方案？").then(function (choose) {
                                    if(choose) {
                                        Program.deleteFaultProgram(_program_seq).then(function(data) {
                                            if(data) {
                                                if(data.confirm_msg) {
                                                    Modal.confirm(data.confirm_msg + ",确认删除["+_program_seq+"]方案？").then(function (choose) {
                                                       if(choose) {
                                                           Program.deleteFaultProgram(_program_seq, 2).then(function(data) {
                                                               Modal.alert(_program_seq + " 方案删除成功！",2);
                                                               tableData(tblParams);
                                                           });
                                                       }
                                                    });
                                                } else {
                                                    Modal.alert(_program_seq + " 方案删除成功！",2);
                                                    tableData(tblParams);
                                                }
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .download': function(event, value, row, index) {
                                var _program_seq = row.program_seq;
                                Program.exportBatchProgram(_program_seq).then(function (data) {
                                    $timeout(function () {
                                       if(data){
                                           CV.downloadFile(data.file_full_path);
                                       }
                                    },0);
                                },function (error) {
                                    Modal.alert(error.message,3);
                                });
                            },
                            'click .modify': function (event, value, row, index) {
                                event.stopPropagation();
                                $state.go('fault_program_modify',{ program_id : row.program_seq})
                            },
                            'click .view': function (event, value, row, index) {
                                event.stopPropagation();
                                $state.go('fault_program_detail',{ program_id : row.program_seq ,program_source: row.pg_source})
                            }
                        },
                        formatter: operateFormat
                    }]
                }
            };
            //清空搜索框
            $scope.clear=function(){
                $scope.search_key_word='';
                program.key_word = '';
            };
            //根据关键字搜索方案
            $scope.searchProgramByKeyword = function(){
                program.key_word = $scope.search_key_word;
                queryData(finish_params);
            };
            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(tblParams);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            }

            function operateFormat(value, row, index) {
                return [
                    '<span class="tabConDe trash" title="删除">',
                    '</span>',
                    (!row.pg_source || row.pg_source == 1 || row.pg_source == 3) ? '<span class="tabConEd modify" title="修改">' : '',
                    '</span>',
                    '<span class="tabConVi view" title="查看">',
                    '</span>',
                ].join("");
            }
            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                params.key_word = program.key_word;
                Program.pageProgramList(params).then(function(data) {
                    $timeout(function(){
                        data.total = data.all_recd;
                        data.rows = data.page_program_list ? data.page_program_list : [];
                        for(var i=0;i< data.rows.length;i++){
                            data.rows[i].crt_bk_time = data.rows[i].crt_bk_date +" "+ data.rows[i].crt_bk_time;
                        }
                        finish_params = params;
                        params.success(data);
                        params.complete();
                    },0);
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
//故障类型列表
tbDirective.directive("troubleTypeList", function() {
    return{
        restrict:'AE',
        templateUrl:'templates/table/trouble_type_tbl.html',
        replace: true,
        controller: ["$scope", "$modal","$compile", "$timeout", "$location", "TroubleConfig", "config", "Col_Fmt", "Modal", "CV", function($scope, $modal, $compile, $timeout, $location, TroubleConfig, config, Col_Fmt, Modal, CV) {
            var _tblParams={};//表格数据对象
            //新增故障类型,刷新表格
            $scope.addTroubleType=function(){
                Modal.faultTroubleType().then(function(data){
                    if(data){
                        //新增成功刷新列表数据
                        tableData(_tblParams);
                    }
                });
            };
            //故障列表配置
            $scope.troubleTypeControl = {
                options: {
                    ajax: tableData,
                    pagination: false,
                    search: false,
                    sidePagination: 'server',
                    showColumns: false,
                    showRefresh: false,
                    rowStyle: function (row, index) {
                        if (index == 0) {
                            $('.pagination-detail').hide();
                        }
                        return { classes: 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='4' style='border:0;text-align: center;'><div style='color: #6D7183;'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'trouble_key',
                        title: '故障编号',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                    },{
                        field: 'trouble_code',
                        title: '故障代码',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'trouble_bk_desc',
                        title: '故障描述',
                        align: 'left',
                        valign: 'middle',
                        formatter:Col_Fmt.hideDetailFmt
                    },{
                        field: 'operate',
                        width: '100px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .edit':function(e, value, row, index){
                                var _trouble_key = row.trouble_key;
                                e.stopPropagation();
                                Modal.faultTroubleType(_trouble_key).then(function(ret){
                                    if(ret){
                                        tableData(_tblParams);
                                    }
                                });
                            },
                            'click .trash': function (e, value, row, index) {
                                e.stopPropagation();
                                var _trouble_key = row.trouble_key;
                                Modal.confirm("确认删除故障编号[" + _trouble_key + "]？").then(function (ret) {
                                    if(ret) {
                                        TroubleConfig.deleteTroubleType(_trouble_key).then(function(data) {
                                            if(data) {
                                                Modal.alert("故障编号["+_trouble_key + "]删除成功！",2);
                                                tableData(_tblParams);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            }
                        },
                        formatter: operateFormat
                    }
                    ]
                }
            };
            //操作栏格式化样式
            function operateFormat(value, row, index) {
                return [
                    '<div>',
                    '<div class="tabConDe trash" title="删除" >',
                    '</div>',
                    '<div class="tabConEd edit" title="修改" >',
                    '</div>',
                    '</div>'
                ].join("");
            }
            //表格数据绑定
            function tableData(params) {
                _tblParams = params;
                TroubleConfig.getTroubleTypeList(params).then(function(data) {
                    data.rows = data.trouble_type_list ? data.trouble_type_list : [];
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
//高峰时段
tbDirective.directive("peakDateList",function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/peak_data_tb.html',
        replace: 'true',
        controller: ["$scope", "$timeout","$compile","$modal","TroubleConfig","Col_Fmt", "Modal","CV",function($scope, $timeout, $compile, $modal, TroubleConfig, Col_Fmt, Modal, CV) {
            var tblParams = {};
            //新增高峰日数据
            $scope.addPeakDate=function(){
                Modal.faultPeakData().then(function(ret){
                    if (ret) {
                        tableData(tblParams);
                    }
                });
            };
            //高峰日列表配置
            $scope.peakDataController = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        if(index == 0){
                            $('.pagination-detail').hide()
                        }
                        return {classes : 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        var add = true;
                        var _html_none=[
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='7' style='border:0px;text-align: center;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html_none)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }

                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'time_cn_name',
                        title: '时段中文名',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'time_bk_desc',
                        title: '时段描述',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'wday_type',
                        title: '高峰日类型',
                        align: 'left',
                        valign: 'middle',
                        width: '150px',
                        formatter: Col_Fmt.wdayTypeFmt
                    }, {
                        field: 'start_bk_date',
                        title: '开始日期',
                        align: 'left',
                        valign: 'middle',
                        width: '100px',
                        formatter: Col_Fmt.noZeroFmt
                    }, {
                        field: 'end_bk_date',
                        title: '结束日期',
                        align: 'left',
                        valign: 'middle',
                        width: '100px',
                        formatter: Col_Fmt.noZeroFmt
                    }, {
                        field: 'times',
                        title: '开始结束时间组',
                        align: 'left',
                        valign: 'middle',
                        width: '150px',
                        formatter: Col_Fmt.peakDateListFmt
                    }, {
                        field: 'operate',
                        width: '100px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .edit': function (e, value, row, index) {
                                var _time_work_seq = row.time_work_seq;
                                Modal.faultPeakData(_time_work_seq).then(function (ret) {
                                        if (ret) {
                                            tableData(tblParams);
                                        }
                                    });
                            },
                            'click .trash': function(e, value, row, index) {
                                var time_work_seq =row.time_work_seq;
                                var time_cn_name=row.time_cn_name;
                                Modal.confirm("确认删除["+time_cn_name+"]高峰时段？").then(function (choose) {
                                    if(choose) {
                                        TroubleConfig.deletePeakTimeInterval(time_work_seq).then(function(data) {
                                            if(data) {
                                                Modal.alert("["+time_cn_name +"]高峰时段删除成功！",2);
                                                tableData(tblParams);
                                            }
                                        }, function(error) {
                                            Modal.alert("删除失败",3);
                                        });
                                    }
                                });
                            }
                        },
                        formatter: operateFormat
                    }]
                }
            };
            //操作列格式化
            function operateFormat(value, row, index) {
                return [
                    '<div>',
                    '<div class="tabConDe trash" title="删除">',
                    '</div>',
                    '<div class="tabConEd edit" title="修改" >',
                    '</div>',
                    '</div>'
                ].join("");
            }
            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                TroubleConfig.getPeakTimeIntervalList(params).then(function(data) {
                    data.total = data.all_recd;
                    data.rows = data.time_interval_list ? data.time_interval_list : [];
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
/********巡检模块******************/
//巡检日志--上传文件列表
tbDirective.directive("logFileList",function(){
    return {
        restrict: 'AE',
        templateUrl: 'templates/table/log_fileList_tbl.html',
        replace: 'true',
        scope:{
            sys_name: '=sysName',
            log_name: '=logName',
            log_id:'=logId',
            search  : '&search',
            reset_log:'=resetLog',
        },
        controller: ["$scope", "$location", "$modal", "$timeout", "config", "Col_Fmt", "BusiSys", "Modal", "CV",function($scope, $location, $modal, $timeout, config, Col_Fmt, BusiSys, Modal, CV){
            var timer,tblParams;
            var program ={};     //方案对象
            var finish_params={}; //搜索完成参数

            $scope.logFileListControl= {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,

                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd'};
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'file_date',
                        title: '日期',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.px100Fmt
                    },{
                        field: 'download_date',
                        title: '下载日期',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.px100Fmt
                    },{
                        field: 'local_file_name',
                        title: '文件名',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'soc_ip',
                        title: '节点',
                        align: 'left',
                        valign: 'middle',
                        width:'80px',
                    },{
                        field: 'file_length',
                        title: '大小',
                        align: 'left',
                        valign: 'middle',
                        width:'60px',
                        formatter: Col_Fmt.formByteToM
                    }, {
                        field: 'file_get_type',
                        title: '上传方式',
                        align: 'left',
                        valign: 'middle',
                        width:'75px',
                        formatter: Col_Fmt.formByUploadType
                    },{
                        field: 'error_msg',
                        title: '下载信息',
                        align: 'left',
                        valign: 'middle',
                        width:'150px',
                        formatter: Col_Fmt.showDownMsg
                    },{
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'mouseenter .tbl_config': function () {
                                var configDiv = $(this).children().eq(0).children();
                                var otherDiv = $(this).parent().parent().siblings().find('.pp');
                                var _this = $(this);
                                otherDiv.animate({right: '-252px'},200,function(){
                                    otherDiv.parent().siblings().children().each(function() {
                                        _this.css("background", _this.attr("name") % 2 == 0 ? "#FFF" : "#F6F7FC");
                                    });
                                });
                                if(timer) $timeout.cancel(timer);
                                timer = $timeout(function(){
                                    //划出
                                    _this.css("background", "#5A72A3");
                                    configDiv.animate({right: '30px'}, 500);
                                },200);
                            },
                            'mouseleave .tbl_config':function(){
                                var configDiv = $(this).children().eq(0).children();
                                var _this = $(this).children().eq(1).children();
                                if(timer) $timeout.cancel(timer);
                                timer = $timeout(function(){
                                    configDiv.animate({right: '-252px'}, 200,function (){
                                        _this.parent().siblings().children().each(function() {
                                            _this.css("background", _this.attr("name") % 2 == 0 ? "#FFF" : "#F6F7FC");
                                        })
                                    });
                                },200);
                            },
                            'click .trash': function(e, value, row, index) {
                                var _work_id = row.id;
                                Modal.confirm("确认删除["+row.local_file_name+"]日志？").then(function (choose) {
                                    if(choose) {
                                        BusiSys.logUploadBaseDelete(_work_id,row.local_file_name,row.local_dir).then(function(data) {
                                            if(data) {
                                                Modal.alert(row.local_file_name + " 删除成功！",2);
                                                tableData(tblParams);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .logDownLoad': function(e, value, row, index) {
                                var url = row.download_url;
                                Modal.confirm("确认下载?").then(function (choose) {
                                    if(choose) {
                                        CV.downloadFile(url);
                                    }
                                });
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(tblParams);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            }
            function operateFormat(value, row, index) {
                if(!row.download_url){
                    return [
                        '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                        '<div class="tabConDe trash" href="javascript:void(0)" title="删除">',
                        '</div>',
                        '</div>'
                    ].join("");
                }else{
                    return [
                        '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                        '<div class="tabConDe trash" href="javascript:void(0)" title="删除">',
                        '</div>',
                        '<a class="logDownLoad" title="下载"  href="javascript:void(0)">',
                        '</a>',
                        '</div>'
                    ].join("");
                }

            }
            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                params.key_word = program.key_word;
                BusiSys.viewLogList(params,$scope.sys_name,$scope.log_name,$scope.log_id).then(function(data) {
                    $timeout(function(){
                        data.total = data.all_recd;
                        data.rows = data.logSyncInfoList  ? data.logSyncInfoList  : [];
                        finish_params = params;
                        params.success(data);
                        params.complete();
                    },0);
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
            $scope.search=function(){
                tableData(tblParams);
            }
            $scope.$watch('reset_log', function(newValue, oldValue) {
                if(newValue != oldValue && newValue) {
                    $timeout(function(){
                        tableData(tblParams);
                        $scope.reset_log=false;
                    },500);
                }
            });
            $scope.$watch('log_name', function(newValue, oldValue) {
                if(newValue != oldValue && newValue) {
                    tableData(tblParams);
                    $scope.reset_log=false;
                }
            });
        }]
    }
});
//巡检日志--巡检报告列表
tbDirective.directive("logInspectList",function(){
    return {
        restrict: 'AE',
        templateUrl: 'templates/table/log_inspectReport_tbl.html',
        replace: 'true',
        controller: ["$scope","$compile", "$location", "$modal","$window", "$timeout", "config", "Col_Fmt", "BusiSys", "Modal", "LogXJ","CV",function($scope,$compile, $location, $modal,$window, $timeout, config, Col_Fmt, BusiSys, Modal,LogXJ, CV){
            var timer,tblParams;
            var program ={};     //方案对象
            var finish_params={}; //搜索完成参数
            $scope.downLoad = function(item){
                CV.downloadFile(item.down_file_path);
            };
            $scope.export=function(item){
                var _report_name=item.report_name;
                if(_report_name){
                    $window.open ("templates/pdf/log_report.html?report_name=" + _report_name+ "=true", "_blank", "height=700, width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no," + " location=no," + " status=no")
                }
            };
            $scope.logInspectReportListControl= {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='7' style='border:0px;text-align: right;'><button class='ordinary-btn' ng-click='downLoad(item);' style='margin-right:80px;'><i class='glyphicon glyphicon-download-alt'></i>&nbsp;下载</button></td>",
                            '</tr>'
                        ].join('');
                        var _export_html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='7' style='border:0px;text-align: right;'><button class='ordinary-btn' ng-click='export(item);' style='margin-right:80px;'><i class='glyphicon glyphicon-share-alt'></i>&nbsp;导出</button></td>",
                            '</tr>'
                        ].join('');
                        var _none_html=[
                            '<tr class="col_option" id="col_option" style="display: none;">',
                            "<td colspan='7' style='border:0px;text-align: center;color: #6D7183'>暂无操作项</td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            if(item.report_url && !item.down_file_path){
                                $element.after($compile(_export_html)($scope));
                            }else if(item.down_file_path){
                                $element.after($compile(_html)($scope));
                            }else if(!item.down_file_path && !item.report_url){
                                $element.after($compile(_none_html)($scope));
                            }
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'report_name',
                        title: '报告名称',
                        align: 'left',
                        valign: 'middle',
                        width:'165px',
                    },{
                        field: 'sys_name',
                        title: '应用系统',
                        align: 'left',
                        valign: 'middle',
                        width:'150px'
                    },{
                        field: 'time_interval_type',
                        title: '报告模板',
                        align: 'left',
                        valign: 'middle',
                        width:'84px',
                        formatter: Col_Fmt.timeTypeFomat
                    },{
                        field: 'log_names',
                        title: '日志',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideLogDetailFmt
                    },{
                        field: 'start_date',
                        title: '时间范围',
                        align: 'left',
                        valign: 'middle',
                        width:'150px',
                        formatter: Col_Fmt.formTimeLimit
                    },{
                        field: 'create_date_time',
                        title: '生成时间',
                        align: 'left',
                        valign: 'middle',
                        width:'200px',
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'mouseenter .tbl_config': function () {
                                var configDiv = $(this).children().eq(0).children();
                                var otherDiv = $(this).parent().parent().siblings().find('.pp');
                                var _this = $(this);
                                otherDiv.animate({right: '-252px'},200,function(){
                                    otherDiv.parent().siblings().children().each(function() {
                                        _this.css("background", _this.attr("name") % 2 == 0 ? "#FFF" : "#F6F7FC");
                                    });
                                });
                                if(timer) $timeout.cancel(timer);
                                timer = $timeout(function(){
                                    //划出
                                    _this.css("background", "#5A72A3");
                                    configDiv.animate({right: '30px'}, 500);
                                },200);
                            },
                            'mouseleave .tbl_config':function(){
                                var configDiv = $(this).children().eq(0).children();
                                var _this = $(this).children().eq(1).children();
                                if(timer) $timeout.cancel(timer);
                                timer = $timeout(function(){
                                    configDiv.animate({right: '-252px'}, 200,function (){
                                        _this.parent().siblings().children().each(function() {
                                            _this.css("background", _this.attr("name") % 2 == 0 ? "#FFF" : "#F6F7FC");
                                        })
                                    });
                                },200);
                            },
                            'click .trash': function(e, value, row, index) {
                                var _report_name = row.report_name;
                                var _log_id=row.log_id;
                                Modal.confirm("确认删除["+_report_name+"]日志？").then(function (choose) {
                                    if(choose) {
                                        LogXJ.deleteReportByName(_report_name,_log_id).then(function(data) {
                                            if(data) {
                                                Modal.alert(_report_name + " 删除成功！",2);
                                                tableData(tblParams);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .tabConVi': function(e, value, row, index) {
                                var url = row.report_url;
                                var _report_name=row.report_name;
                                if(_report_name){
                                    $window.open ("templates/pdf/log_report.html?report_name=" + _report_name+ "=true", "_blank", "height=700, width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no," + " location=no," + " status=no")
                                }

                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };
            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(tblParams);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            }
            function operateFormat(value, row, index) {
                return [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<div class="tabConDe trash" title="删除" href="javascript:void(0)" >',
                    '</div>',
                    '<a class="tabConVi" title="查看" href="javascript:void(0)">',
                    '</a>',
                    '</div>'
                ].join("");
            }
            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                params.key_word = program.key_word;
                BusiSys.viewLogReportViewList(params).then(function(data) {
                    $timeout(function(){
                        data.total = data.all_recd;
                        data.rows = data.log_report_list  ? data.log_report_list  : [];
                        angular.forEach(data.rows,function(item){
                            item.create_date_time = item.create_date_time.substring(0,item.create_date_time.lastIndexOf('.'));
                        });
                        finish_params = params;
                        params.success(data);
                        params.complete();
                    },0);
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
            $scope.resetQuery=function(){
                tableData(tblParams);
            }
        }]
    }
});
/********调度模块******************/
//调度--当前任务列表
tbDirective.directive('ywCurrentTaskList',function(){
    return{
        restrict: 'E',
        templateUrl: 'templates/table/yw_current_task_tbl.html',
        replace: 'true',
        controller:["$scope","$rootScope", "$timeout", "$state", "Flow", "config", "Col_Fmt", "TblOption", "MouseMoveEvent", "OptionCol","$compile", "$location", "Modal", "CV", function($scope,$rootScope, $timeout, $state, Flow, config, Col_Fmt, TblOption, MouseMoveEvent, OptionCol, $compile, $location, Modal, CV) {
            var _params = {},_type_timer;
            function tableData(params) {
                _params = params;
                 Flow.getCurrentTaskList(params).then(function (data) {
                     $timeout(function() {
                         data.rows = data.sdtask_list ? data.sdtask_list : [];
                         for(var i = 0; i < data.rows.length; i++){
                             var _row = data.rows[i];
                             _row.task_type_list = _row.sdflow_type ? (_row.sdflow_type + '').split(',') : [];
                         }
                         params.success(data);
                         params.complete();
                     }, 0);
                 }, function (error) {
                    Modal.alert(error.message,3);
                 });
            }
            $scope.exeTask = function(item){
                $state.go('dispatch_task.execute',{
                    task_id : item.sdtask_id
                });
            };
            $scope.ywCurTaskListControl = {options: angular.extend({}, {
                ajax: tableData,
                onClickRow: function (item, $element) {
                    if(!item){
                        return false;
                    }
                    $scope.item = item;
                    var add = true,_html;
                    if(item.sdtask_status == 4 || item.sdtask_status == 5){
                        _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='8' style='border:0px;text-align: center;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                    }else{
                        _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                                "<td colspan='8' style='border:0px;text-align: right;'><button class='ordinary-btn' ng-click='exeTask(item);' style='margin-right:80px;'><i class='fa fa-check'></i>&nbsp;执行</button></td>",
                            '</tr>'
                        ].join('');
                    }
                    if($element.next().attr("id") ==  "col_option"){
                        add = false;
                    }
                    if($("#col_option")){
                        $("#col_option").prev().removeClass('table_col_Style');
                        $("#col_option").remove();
                    }
                    if(add){
                        $element.after($compile(_html)($scope));
                        $element.addClass('table_col_Style');
                        $element.next().slideDown();
                    }
                },
                columns: [{
                    field: 'sdtask_id',
                    title: '任务编号',
                    align: 'left',
                    valign: 'middle',
                    width: '120px',
                    formatter: Col_Fmt.hideDetailFmt
                },{
                    field: 'sdtask_cn_name',
                    title: '任务名称',
                    align: 'left',
                    valign: 'middle',
                    formatter: Col_Fmt.hideDetailFmt
                },{
                    field: 'task_type_list',
                    title: '任务类型',
                    align: 'left',
                    halign: 'center',
                    valign: 'middle',
                    width:'100px',
                    events:{
                        'mouseenter .animate_active':function(){
                            var _this = $(this);
                            $(document).off('mousemove');
                            if(_type_timer) $timeout.cancel(_type_timer);
                            if(_this.next()[0]){
                                if(_this.next()[0].style.display == "none"){
                                    $timeout(function(){
                                        $(".animate_active").next().css({display:'none'});
                                    },0);
                                }
                            }else{
                                $timeout(function(){
                                    $(".animate_active").next().css({display:'none'});
                                },0);
                            }
                            _type_timer = $timeout(function(){
                                _this.next().fadeIn(200);
                            },200);
                        },
                        'mouseleave .animate_active':function(){
                            var _this = $(this);
                            if(_this.next().length > 0){
                                var elem =  _this.next()[0];
                                var _min_width = $(elem).offset().left;
                                var _max_width = _min_width + 122 + 20;
                                var _min_height = $(elem).offset().top;
                                var _max_height = $(elem).offset().top + $(elem).height();
                                $(document).mousemove(function(e){
                                    if((e.pageX < _min_width || e.pageX > _max_width) || (e.pageY < _min_height || e.pageY > _max_height)){
                                        if(_type_timer) $timeout.cancel(_type_timer);
                                        _type_timer = $timeout(function(){
                                            $(".animate_active").next().fadeOut(200);
                                        },0);
                                    }
                                });
                            }
                        }
                    },
                    formatter: Col_Fmt.ywTaskType
                },{
                    field: 'sddispatch_type',
                    title: '执行方式',
                    align: 'left',
                    halign: 'left',
                    valign: 'middle',
                    width:'80px',
                    formatter:Col_Fmt.ywExecType
                },{
                    field: 'exe_user_name',
                    title: '执行人',
                    align: 'left',
                    halign: 'left',
                    valign: 'middle',
                    width:'120px'
                },{
                    field: 'start_bk_datetime',
                    title: '开始时间',
                    align: 'left',
                    valign: 'middle',
                    width: '140px',
                    formatter:Col_Fmt.ywTasktimeFmt
                },{
                    field: 'sdtask_status',
                    title: '任务状态',
                    align: 'center',
                    valign: 'middle',
                    width : '100px',
                   formatter: Col_Fmt.taskExecStaus
                },{
                    width:'70px',
                    events:{
                        'click .tabConDn': function (e, value, row, index) {
                            e.stopPropagation();
                            CV.downloadFile(row.exe_log_path)
                        },
                        'click .tabConVi':function(e, value, row, index){
                            e.stopPropagation();
                            $state.go('dispatch_task.detail',{
                                task_id:row.sdtask_id
                            });
                        }
                    },
                    formatter: function(value, row, index) {
                        var _html='';
                        if(row.exe_log_path && (row.sdtask_status == 4 || row.sdtask_status == 5)){
                            _html = [
                                '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                                '<div class="tabConDn" title="下载日志">',
                                '</div>',
                                '<a class="tabConVi" title="查看">',
                                '</a>',
                                '</div>'
                            ].join("");
                        }else{
                            _html =[
                                '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                                '<div style="width:28px;height:21px;display: inline-block;">',
                                '</div>',
                                '<a class="tabConVi" title="查看" href=#/yw_task_detail/'+row.sdtask_id+'>',
                                '</a>',
                                '</div>'
                            ].join("");
                        }
                        return _html;
                    }
                }]
            }, TblOption)};

            //根据关键字搜索
            $scope.searchTaskByKeyword = function(){
                EmptyAdvancedSearch_Obj();
                _params.key_word =  $scope.control.search_keyword;
                queryData(_params);
            };
            //高级搜索
            $scope.advancedSearch = function(){
                _params.key_word = '';
                $scope.control.search_keyword = '';
                _params.exe_user_id = $scope.info.exe_user_id;
                _params.sdtask_cn_name = $scope.info.task_name;
                _params.sddispatch_type = $scope.info.exe_type;
                _params.sdflow_type = $scope.info.task_type ? [$scope.info.task_type] : '';
                _params.start_bk_datetime = CV.dtFormat($scope.info.start_date);
                _params.end_bk_datetime = CV.dtFormat($scope.info.end_date);
                if($scope.info.start_date > $scope.info.end_date){
                    Modal.alert("开始时间大于结束时间，请重新选择",3);
                }else{
                    $scope.control.open_senior_flag = false;
                    queryData(_params);
                    EmptyAdvancedSearch_fields();
                    EmptyAdvancedSearch_Obj();
                }
            };
            $scope.clear = function(){
                $scope.control.search_keyword = '';
            };
            //显示高级搜索框
            $scope.openSeniorSearch = function () {
                $scope.control.open_senior_flag = !$scope.control.open_senior_flag;
                if($scope.control.open_senior_flag){
                    $scope.info.start_date="";
                    $scope.info.end_date="";
                }
            };
            //清空高级搜索参数
            function EmptyAdvancedSearch_fields(){
                $scope.info.exe_user_id = "";
                $scope.info.task_name = "";
                $scope.info.exe_type = "";
                $scope.info.task_type = "";
                $scope.info.start_date = "";
                $scope.info.end_date = "";
            }
            //清空搜索对象属性
            function EmptyAdvancedSearch_Obj(){
                _params.exe_user_id = "";
                _params.sdtask_cn_name = "";
                _params.sddispatch_type = "";
                _params.sdflow_type = "";
                _params.start_bk_datetime = "";
                _params.end_bk_datetime = "";
            }
            //点击高级搜索框以外 收回高级搜索框
            $scope.collapseAdvSearch = function(){
                $scope.control.open_senior_flag = false;
                EmptyAdvancedSearch_fields();
                EmptyAdvancedSearch_Obj();
            };
            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(params);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            }
        }]
    }
});
//调度--历史任务列表
tbDirective.directive('ywHistoryTaskList',function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/yw_history_task_tbl.html',
        controller:["$scope", "$timeout", "$modal", "$state", "Flow", "config", "Col_Fmt", "TblOption", "MouseMoveEvent", "OptionCol", "Modal", "$compile", "CV", function($scope, $timeout, $modal, $state, Flow, config, Col_Fmt, TblOption, MouseMoveEvent, OptionCol, Modal, $compile, CV) {
            var _params = {},_type_timer;
            $scope.ywHisTaskListControl = {
                options:{
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    sidePagination: 'server',
                    showColumns: false,
                    showRefresh: false,
                    rowStyle: function (row, index) {
                        index === 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd'};
                    },
                    classes: "table table-no-bordered table-hover",
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='10' style='border:0px;text-align: center;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    columns: [{
                    field: 'sdtask_id',
                    title: '任务编号',
                    align: 'left',
                    valign: 'middle',
                    formatter: Col_Fmt.hideDetailFmt
                },{
                    field: 'sdtask_cn_name',
                    title: '任务名称',
                    align: 'left',
                    halign: 'left',
                    valign: 'middle',
                    formatter: Col_Fmt.hideDetailFmt
                },{
                    field: 'task_type_list',
                    title: '任务类型',
                    align: 'left',
                    halign: 'center',
                    valign: 'middle',
                    width:  '100px',
                    events:{
                        'mouseenter .animate_active':function(){
                            var _this = $(this);
                            $(document).off('mousemove');
                            if(_type_timer) $timeout.cancel(_type_timer);
                            if(_this.next()[0]){
                                if(_this.next()[0].style.display == "none"){
                                    $timeout(function(){
                                        $(".animate_active").next().css({display:'none'});
                                    },0);
                                }
                            }else{
                                $timeout(function(){
                                    $(".animate_active").next().css({display:'none'});
                                },0);
                            }
                            _type_timer = $timeout(function(){
                                _this.next().fadeIn(200);
                            },200);
                        },
                        'mouseleave .animate_active':function(){
                            var _this = $(this);
                            if(_this.next().length > 0){
                                var elem =  _this.next()[0];
                                var _min_width = $(elem).offset().left;
                                var _max_width = _min_width + 122 + 20;
                                var _min_height = $(elem).offset().top;
                                var _max_height = $(elem).offset().top + $(elem).height();
                                $(document).mousemove(function(e){
                                    if((e.pageX < _min_width || e.pageX > _max_width) || (e.pageY < _min_height || e.pageY > _max_height)){
                                        if(_type_timer) $timeout.cancel(_type_timer);
                                        _type_timer = $timeout(function(){
                                            $(".animate_active").next().fadeOut(200);
                                        },0);
                                    }
                                });
                            }
                        }
                    },
                    formatter: Col_Fmt.ywTaskType
                },{
                    field: 'sddispatch_type',
                    title: '执行方式',
                    align: 'left',
                    halign: 'left',
                    valign: 'middle',
                    width:'80px',
                    formatter:Col_Fmt.ywExecType
                },{
                    field: 'exe_user_name',
                    title: '执行人',
                    align: 'left',
                    halign: 'left',
                    valign: 'middle'
                },{
                    field: 'start_bk_datetime',
                    title: '开始时间',
                    align: 'left',
                    valign: 'middle',
                    width: '140px',
                    formatter:Col_Fmt.ywTasktimeFmt
                },{
                    field: 'time_used_cn',
                    title: '运行时间',
                    align: 'left',
                    valign: 'middle',
                    width: '100px',
                    formatter:Col_Fmt.noZeroFmt
                },{
                    field: 'end_bk_datetime',
                    title: '结束时间',
                    align: 'left',
                    valign: 'middle',
                    width: '140px',
                    formatter:Col_Fmt.ywTasktimeFmt
                },{
                    field: 'sdtask_status',
                    title: '任务状态',
                    align: 'center',
                    valign: 'middle',
                    width : '100px',
                    formatter: Col_Fmt.taskExecStaus
                },{
                    width:'70px',
                    events:{
                        'click .tabConDn': function (e, value, row, index) {
                            e.stopPropagation();
                            CV.downloadFile(row.exe_log_path)
                        },
                        'click .tabConVi':function(e, value, row, index){
                            e.stopPropagation();
                            $state.go('dispatch_task.detail',{
                                task_id:row.sdtask_id
                            });
                        }
                    },
                    formatter: function(value, row, index){
                        var _html='';
                        if(row.exe_log_path && (row.sdtask_status == 4 || row.sdtask_status == 5)){
                            _html = [
                                '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                                '<div class="tabConDn" title="下载日志">',
                                '</div>',
                                '<a class="tabConVi">',
                                '</a>',
                                '</div>'
                            ].join("");
                        }else{
                            _html = [
                                '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                                '<div style="width:28px;height:21px;display: inline-block;">',
                                '</div>',
                                '<a class="tabConVi" title="查看" href=#/yw_task_detail_his/'+row.sdtask_id+'>',
                                '</a>',
                                '</div>'
                            ].join("");
                        }
                        return _html;
                    }
                }]
                }
            };
            //根据关键字搜索
            $scope.searchTaskByKeyword = function(){
                EmptyAdvancedSearch_Obj();
                _params.key_word =  $scope.control.search_keyword;
                queryData(_params);
            };
            //高级搜索
            $scope.advancedSearch = function(){
                _params.key_word = '';
                $scope.control.search_keyword = '';
                _params.exe_user_id = $scope.info.exe_user_id;
                _params.sdtask_cn_name = $scope.info.task_name;
                _params.sddispatch_type = $scope.info.exe_type;
                _params.sdflow_type = $scope.info.task_type ? [$scope.info.task_type] : '';
                _params.start_bk_datetime = CV.dtFormat($scope.info.start_date);
                _params.end_bk_datetime = CV.dtFormat($scope.info.end_date);
                if($scope.info.start_date > $scope.info.end_date){
                    Modal.alert("开始时间大于结束时间，请重新选择",3);
                }else{
                    $scope.control.open_senior_flag = false;
                    queryData(_params);
                    EmptyAdvancedSearch_fields();
                    EmptyAdvancedSearch_Obj();
                }
            };
            $scope.clear = function(){
                $scope.control.search_keyword = '';
            };
            //显示高级搜索框
            $scope.openSeniorSearch = function () {
                console.log(11);
                $scope.control.open_senior_flag = !$scope.control.open_senior_flag;
                if($scope.control.open_senior_flag){
                    $scope.info.start_date="";
                    $scope.info.end_date="";
                }
            };
            //清空高级搜索参数
            function EmptyAdvancedSearch_fields(){
                $scope.info.exe_user_id = "";
                $scope.info.task_name = "";
                $scope.info.exe_type = "";
                $scope.info.task_type = "";
                $scope.info.start_date = "";
                $scope.info.end_date = "";
            }
            //清空搜索对象属性
            function EmptyAdvancedSearch_Obj(){
                _params.exe_user_id = "";
                _params.sdtask_cn_name = "";
                _params.sddispatch_type = "";
                _params.sdflow_type = "";
                _params.start_bk_datetime = "";
                _params.end_bk_datetime = "";
            }
            //点击高级搜索框以外 收回高级搜索框
            $scope.collapseAdvSearch = function(){
                $scope.control.open_senior_flag = false;
                EmptyAdvancedSearch_fields();
                EmptyAdvancedSearch_Obj();
            };
            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(params);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            };
            //已完成项目数据绑定
            function tableData(params) {
                Flow.pageHistoryTaskList(params).then(function (data) {
                    $timeout(function() {
                        data.total = data.all_recd;
                        data.rows = data.sdtask_his_list ? data.sdtask_his_list : [];
                        for(var i = 0; i < data.rows.length; i++){
                            var _row = data.rows[i];
                            _row.time_used_cn = _row.time_used ? CV.usedCnTime(_row.time_used ) : '--';
                            _row.task_type_list = _row.sdflow_type ? (_row.sdflow_type + '').split(',') : [];
                        }
                        _params = params;
                        params.success(data);
                        params.complete();
                    }, 0);
                }, function (error) {
                    Modal.alert(error.message,3);
                });
            };
        }]
    }
});
//调度--流程列表(人工/自动/关注)
tbDirective.directive('articleFlowList',function(){
    return{
        restrict: 'E',
        templateUrl: 'templates/table/article_flow_list.html',
        controller:["$scope", "$timeout", "$modal", "$state", "BusiSys", "Flow", "config", "Col_Fmt", "TblOption", "MouseMoveEvent", "OptionCol", "Modal", "CV", function($scope, $timeout, $modal, $state, BusiSys,Flow, config, Col_Fmt, TblOption, MouseMoveEvent, OptionCol, Modal, CV) {
            var _params = {};
            var timer;
            var times = 0;
            $scope.search={
                key_word : ''
            };
            //数据绑定
            function tableData(params) {
                $timeout(function(){
                    params.key_word = $scope.search.key_word;
                    var _tab = $scope.tabs[$scope.control.active_tab];
                    params.exe_types = _tab.type || '';
                    if(!_tab.dispatch){
                        Flow.pageAttentionFlowList(params).then(function (data) {
                            $timeout(function() {
                                data.total = data.all_recd;
                                data.rows = data.focus_flow_list ? data.focus_flow_list : [];
                                _params = params;
                                params.success(data);
                                params.complete();
                                if(data.rows.length){
                                    $('tr[data-index=0]').addClass('table_col_Style');
                                    $scope.viewDetail(data.rows[0].sdflow_id,data.rows[0].sdversion_id);
                                }
                            }, 0);
                        }, function (error) {
                            Modal.alert(error.message,3);
                        });
                    }else{
                        Flow.pageOpFlowList(params).then(function (data) {
                            $timeout(function() {
                                data.total = data.all_recd;
                                data.rows = data.flow_list ? data.flow_list : [];
                                _params = params;
                                params.success(data);
                                params.complete();
                                if(data.rows.length){
                                    $('tr[data-index=0]').addClass('table_col_Style');
                                    $scope.viewDetail(data.rows[0].sdflow_id,data.rows[0].sdversion_id);
                                }
                            }, 0);
                        }, function (error) {
                            Modal.alert(error.message,3);
                        });
                    }
                },0);
            }
            $scope.$watch('flow_list_reflash',function(newvalue,oldvalue){
                if(times !=0){
                    $scope.doSearch();
                }
                times = times + 1;
            },true);
            $scope.articleFlowListControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:14,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false,
                    showRefresh: false,
                    sortName: 'default',
                    sortOrder: 'desc',
                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd',css:{"padding":"6px 8px 5px"}};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $element.siblings().removeClass("table_col_Style");
                        $element.addClass('table_col_Style');
                        $scope.viewDetail(item.sdflow_id,item.sdversion_id);
                        return false;
                    },
                    classes: "table table-no-bordered table-hover tbody_height",
                    columns: [{
                        field: 'sdflow_cn_name',
                        title: 'App名称',
                        align: 'left',
                        valign: 'middle',
                        events:{
                            'click .edit_flow': function (e, value, row, index) {
                                e.stopPropagation();
                                var _flow_id = row.sdflow_id;
                                var _version_id = row.sdversion_id;
                                $state.go("dispatch_flow_modify",{flow_id:_flow_id,version_id:_version_id,modify_flag:true});
                            },
                        },
                        formatter: Col_Fmt.flowEditFmt,
                    },{
                        field: 'crt_user_name',
                        title: '创建人',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width:'120px'
                    },{
                        field: 'publish_bk_date',
                        title: '发布时间',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width:'140px',
                        formatter: Col_Fmt.flowPublishTime
                    },{
                        field: 'sdflow_status',
                        title: '状态',
                        align: 'left',
                        halign: 'center',
                        valign: 'middle',
                        width:'90px',
                        formatter: Col_Fmt.flowIsPublishFmt
                    }]
                }
            };
            $scope.doSearch = function() {
                _params.data.offset = 0;
                tableData(_params);
            };
            $scope.clear = function(){
                $scope.search.key_word = '';
            }
        }]
    }
});
//调度--场景列表
tbDirective.directive('dispatchSceneList',function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/dispatch_scene_tb.html',
        replace: 'true',
        controller:["$scope", "$rootScope", "$state", "$timeout", "Scene", "config", "Col_Fmt", "TblOption", "MouseMoveEvent", "OptionCol","$compile",  "Modal", "CV", function($scope, $rootScope, $state, $timeout, Scene, config, Col_Fmt, TblOption, MouseMoveEvent, OptionCol, $compile, Modal, CV) {
            var _params = {};

            $scope.search={key_word : ''};
            $scope.doSearch = function() {
                _params.data.offset = 0;
                tableData(_params);
            };
            $scope.clear = function(){
                $scope.search.key_word = '';
            };

            $scope.dispatchSceneControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:14,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        index === 0 && $('.pagination-detail').hide();
                        return {classes : 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item) return false;
                        $element.siblings().removeClass("table_col_Style");
                        $element.addClass('table_col_Style');
                        var _private_flag = item.scene_type === 3;
                        $scope.viewSingleScene(item.scene_id,_private_flag);
                    },
                    classes: "table table-no-bordered table-hover ",
                    columns: [{
                        field: 'scene_name',
                        title: '微服务组名称',
                        align: 'left',
                        valign: 'middle',
                        width: '120px',
                        formatter: Col_Fmt.sceneNameFmt
                    },{
                        field: 'crt_user_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        width: '100px',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'crt_bk_date',
                        title: '创建时间',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width:  '140px',
                        formatter:Col_Fmt.sceneCrtTime
                    },{
                        field: 'operate',
                        width: '70px',
                        events:{
                            'click .trash': function (e, value, row, index) {
                                e.stopPropagation();
                                var _id = row.scene_id;
                                var _cn_name = row.scene_name ? row.scene_name:'';
                                Modal.confirm("删除[ "+ _cn_name +" ]场景？").then(function (choose) {
                                    if(choose) {
                                        Scene.removeSingleScene(_id).then(function(data) {
                                            if(data) {
                                                Modal.alert("[ " + _cn_name + " ] 删除成功",2);
                                                $state.go('dispatch_scene_list');
                                                tableData(_params);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .edit': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('dispatch_scene_modify',{scene_id:row.scene_id});
                            },
                            'click .view': function (e, value, row, index) {
                                e.stopPropagation();
                                var _scene_type = row.scene_type || 1;
                                $state.go('dispatch_scene_detail',{
                                    scene_id:row.scene_id,
                                    private_flag : _scene_type
                                });
                                //$scope.$apply($location.url('/scene_detail/' + row.scene_id + '/' + _scene_type));
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };

            function operateFormat(value, row, index) {
                return  [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<div class="tabConDe trash" title="删除">',
                    '</div>',
                    '<div class="tabConEd edit" title="修改">',
                    '</div>',
                    '<div class="tabConVi view" title="查看">',
                    '</div>',
                    '</div>'
                ].join("");;
            }
            function tableData(params) {
                params.key_word = $scope.search.key_word;
                _params = params;
                Scene.getSceneListByType(params).then(function (data) {
                     $timeout(function() {
                         data.total = data.all_recd;
                         data.rows = data.scene_list ? data.scene_list : [];
                         params.success(data);
                         params.complete();
                         if(data.rows.length){
                             $('tr[data-index=0]').addClass('table_col_Style');
                             $scope.viewSingleScene(data.rows[0].scene_id,data.rows[0].scene_type === 3);
                         }
                     }, 0);
                 }, function (error) {
                    Modal.alert(error.message,3);
                 });
            }
        }]
    }
});
//调度--策略组列表
tbDirective.directive('dispatchStrategyList',function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/dispatch_strategy_group_tb.html',
        replace: 'true',
        controller:["$scope","$rootScope", "$timeout", "$state", "Strategy", "config", "Col_Fmt", "TblOption", "MouseMoveEvent", "OptionCol","$compile", "$location", "Modal", "CV", function($scope,$rootScope, $timeout, $state, Strategy, config, Col_Fmt, TblOption, MouseMoveEvent, OptionCol, $compile, $location, Modal, CV) {
            var _params = {};

            //更新数据
            $scope.$on("updateTableDate", function(event, data) {
                tableData(_params);
            });
            $scope.dispatchStrategyControl = {options: angular.extend({}, {
                    ajax: tableData,
                    onClickRow: function (item, $element) {
                       return false;
                    },
                    columns: [{
                        field: 'sdstrategy_name',
                        title: '策略组名称',
                        align: 'left',
                        valign: 'middle',
                        width: '150px',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'sdstrategy_desc',
                        title: '策略组描述',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'sdstrategy_type',
                        title: '策略组类型',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width: '100px',
                        formatter:Col_Fmt.strategyTypeCnFmt
                    },{
                        field: 'operate',
                        width: '80px',
                        events:{
                            'click .trash': function (e, value, row, index) {
                                e.stopPropagation();
                                var _id = row.sdstrategy_id ? row.sdstrategy_id : '';
                                var _cn_name = row.sdstrategy_name ? row.sdstrategy_name:'';
                                Modal.confirm("删除[ "+ _cn_name +" ]策略组？").then(function (choose) {
                                    if(choose) {
                                        Strategy.removeStrategyGroup(_id).then(function(data) {
                                            if(data) {
                                                Modal.alert("[ " + _cn_name + " ] 删除成功！",2);
                                                tableData(_params);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .tabConVi': function (e, value, row, index) {
                                e.stopPropagation();
                                $state.go('dispatch_strategy_detail',{
                                    strategy_id : row.sdstrategy_id,
                                });
                            }
                        },
                        formatter: operateFormat
                    }]
                }, TblOption)};

            function operateFormat(value, row, index) {
                var _html =  [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<div class="tabConDe trash" title="删除">',
                    '</div>',
                     '<a class="tabConVi" title="查看">',
                     '</a>',
                    '</div>'
                ].join("");
                return _html;
            }
            function tableData(params) {
                _params = params;
                Strategy.getStrategyGroupList().then(function (data) {
                    $timeout(function() {
                        data.rows = data.strategy_group_list ? data.strategy_group_list : [];
                        params.success(data);
                        params.complete();
                    }, 0);
                }, function (error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
/********公共模块******************/
//组件列表
tbDirective.directive("cmptList", function() {
    return{
        restrict:'AE',
        templateUrl:'templates/table/cmpt_list_tbl.html',
        replace: true,
        controller: ["$scope", "$modal", "$timeout", "$compile","$state", "Cmpt", "config", "Col_Fmt", "Modal", "CV", function($scope, $modal, $timeout,$compile, $state, Cmpt, config, Col_Fmt, Modal, CV) {
            var _tblParams={};
            var _error_message = '';
            var type=1;
            var _temp_search = {};
            $scope.test = function(item){
                $state.go('cmpt_test',{cmpt_id : item.id,cmpt_name:item.cn_name});
            };
            $scope.cmptPublish = function(row){
                var _id   = row.id;
                var _type = row.type;
                Modal.confirm("是否发布组件 ?").then(function(choose){
                    if(choose) {
                        Cmpt.publishCmpt(_id,_type).then(function(data) {
                            if(data) {
                                Modal.alert("发布成功!",2);
                                tableData(_tblParams);
                            }
                        }, function(error) {
                            Modal.alert(error.message,3);
                        });
                    }
                });
            };
            $scope.subgroupListControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    sidePagination: 'server',
                    sortName: 'crt_bk_date,crt_bk_time',
                    sortOrder: 'desc',
                    showColumns: false,
                    showRefresh: false,
                    rowStyle: function (row, index) {
                        if (index == 0) {
                            /* $('.ng-isolate-scope thead').css("backgroundColor", "#353D46");*/
                            $('.pagination-detail').hide();
                        }
                        return { classes: 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;border-top: none;">',
                            "<td colspan='9' style='border:none!important;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='test(item);' style='margin-right:20px;'><i class='fa fa-map-marker'></i>&nbsp;测试</button></td>",
                            '</tr>'
                        ].join('');
                        var _html_testAndPublish = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;border-top: none;">',
                            "<td colspan='9' style='border:none!important;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='test(item);' style='margin-right:20px;'><i class='fa fa-map-marker'></i>&nbsp;测试</button>" +
                            "<button class='ordinary-btn' ng-click='cmptPublish(item)' style='margin-right:20px;'><i class='fa fa-check'></i>&nbsp;发布</button>" +
                            "</td>",
                            '</tr>'
                        ].join('');

                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            if(item.publish_state == 2 || !item.publish_state){
                                $element.after($compile(_html_testAndPublish)($scope));
                            }
                            else{
                                $element.after($compile(_html)($scope));
                            }
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    formatNoMatches: function () {
                        return _error_message;
                    },

                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'crt_bk_time',
                        title: '创建时间',
                        align: 'left',
                        valign: 'middle',
                        sortable: true,
                        width:'145px',
                        formatter: Col_Fmt.combineTimeDate
                    },{
                        field: 'cn_name',
                        title: '组件名',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'module_purposes',
                        title: '组件类型',
                        align: 'left',
                        valign: 'middle',
                        width:'100px',
                        formatter: Col_Fmt.cmptListCmptType
                    },{
                        field: 'impl_type',
                        title: '执行类别',
                        align: 'left',
                        valign: 'middle',
                        width : '80px',
                        formatter: Col_Fmt.subgroupListExecuteTypeFmt
                    },{
                        field: 'tag_list',
                        title: '分类',
                        align: 'center',
                        valign: 'middle',
                        width : '120px',
                        formatter: Col_Fmt.classifyTag
                    },{
                        field: 'crt_user_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        width:'100px'
                    },{
                        field: 'modify_bk_time',
                        title: '修改时间',
                        align: 'left',
                        valign: 'middle',
                        width:'145px',
                        formatter: Col_Fmt.combineModifyTimeDate
                    },{
                        field: 'publish_state',
                        title: '发布状态',
                        align: 'left',
                        valign: 'middle',
                        width:'75px',
                        formatter: Col_Fmt.envIsPublishFmt
                    },{
                        field: 'operate',
                        width: '100px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .trash': function (e, value, row, index) {
                                e.stopPropagation();
                                var _id = row.id;
                                var _cn_name = row.cn_name;
                                Modal.confirm("确认删除[" + _cn_name + "]组件？").then(function (choose) {
                                    if(choose) {
                                        Cmpt.deleteModule(_id).then(function(data) {
                                            if(data) {
                                                Modal.alert(_cn_name + " 删除成功！",2);
                                                tableData(_tblParams);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .publish':function(e, value, row, index){
                                var _id   = row.id;
                                var _type = row.type;
                                Modal.confirm("是否发布组件 ?").then(function(choose){
                                    if(choose) {
                                        Cmpt.publishCmpt(_id,_type).then(function(data) {
                                            if(data) {
                                                Modal.alert("发布成功!",2);
                                                tableData(_tblParams);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            },
                            'click .modify' :function (e, value, row, index) {
                                $state.go('cmpt_modify',{cmpt_id:row.id})
                            },
                            'click .view' :function (e, value, row, index) {
                                $state.go('cmpt_detail',{cmpt_id:row.id})
                            }
                        },
                        formatter: operateFormat
                    }
                    ]
                }
            };
            //清空搜索框
            $scope.clear=function(){
                $scope.search_key_word='';
            };
            //搜索按钮
            $scope.searchCmptByKeyword = function(){
                _tblParams.cn_name = $scope.search_key_word;
                _tblParams.tag_list=[];
                _tblParams.impl_types=[];
                _tblParams.start_modify_date='';
                _tblParams.end_modify_date='';
                _tblParams.crt_user_id  ='';
                _tblParams.publish_state  =0;
                _tblParams.component_purpose=0;
                queryData(_tblParams);
            };
            //高级搜索
            $scope.seniorSearch = function () {
                _temp_search.tag_list =[];
                _temp_search.impl_types =[];
                for (var i = 0; i < $scope.info.high_search_obj.exec_type_list.length; i++) {
                    if ($scope.info.high_search_obj.exec_type_list[i].flag) {
                        _temp_search.impl_types.push($scope.info.high_search_obj.exec_type_list[i].key);
                    }
                }
                for (var i = 0; i < $scope.info.high_search_obj.classify_list.length; i++) {
                    if ($scope.info.high_search_obj.classify_list[i].flag) {
                        _temp_search.tag_list.push($scope.info.high_search_obj.classify_list[i].value);
                    }
                }
                if ($scope.info.high_search_obj.start_modify_date) {
                    if ($scope.info.high_search_obj.end_modify_date) {
                        if ($scope.info.high_search_obj.end_modify_date.getTime() < $scope.info.high_search_obj.start_modify_date.getTime()) {
                            Modal.alert("开始日期应小于结束日期！",3);
                            $scope.info.high_search_obj.start_modify_date = "";
                            $scope.info.high_search_obj.end_modify_date = "";
                            return false;
                        }
                    }
                }
                _tblParams.cn_name = $scope.info.high_search_obj.key_word;
                _tblParams.tag_list = _temp_search.tag_list;
                _tblParams.impl_types = _temp_search.impl_types;
                _tblParams.start_modify_date = $scope.info.high_search_obj.start_modify_date;
                _tblParams.end_modify_date = $scope.info.high_search_obj.end_modify_date;
                _tblParams.crt_user_id  = $scope.info.high_search_obj.crt_user_id;
                _tblParams.publish_state  = $scope.info.high_search_obj.publish_state;
                _tblParams.component_purpose= $scope.info.high_search_obj.component_purpose;
                $scope.search_key_word='';
                queryData(_tblParams);
                $scope.control.search_flag = true
            };
            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(params);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            }

            function operateFormat(value, row, index) {
                return [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<a class="tabConVi view" title="查看">',
                    '</a>',
                    '<a class="tabConEd modify" title="修改">',
                    '</a>',
                    '<div class="tabConDe trash" title="删除" href="javascript:void(0)" >',
                    '</div>',
                    '</div>'
                ].join("");
            }
            function tableData(params) {
                if(_tblParams.cn_name || _tblParams.tag_lis   || _tblParams.impl_types || _tblParams.start_modify_date || _tblParams.end_modify_date || _tblParams.crt_user_id || _tblParams.publish_state || _tblParams.component_purpose){
                    params.cn_name = _tblParams.cn_name;
                    params.tag_list =_tblParams.tag_list;
                    params.impl_types =_tblParams.impl_types;
                    params.start_modify_date =_tblParams.start_modify_date;
                    params.end_modify_date =_tblParams.end_modify_date;
                    params.crt_user_id  =_tblParams.crt_user_id;
                    params.publish_state  =_tblParams.publish_state;
                    params.component_purpose=_tblParams.component_purpose;
                }
                _tblParams = params;
                params.data.sort = params.data.sort ? params.data.sort == 'component_purposes' ? 'component_purposes' : 'crt_bk_date,crt_bk_time':'';
                Cmpt.getCmptPageList(params).then(function(data) {
                    $timeout(function(){
                        var _module_list = data.comp_list ? data.comp_list : [];
                        if(_module_list.length == 0){
                            _error_message = "暂无数据";
                        }
                        for(var i=0;i<_module_list.length;i++){
                            _module_list[i].type = "1";
                            if(_module_list[i].cn_name.substring(0,2) =="/*"){
                                _module_list[i].cn_name = _module_list[i].cn_name.substring(2,_module_list[i].cn_name.length-2);
                            }
                        }
                        data.rows = _module_list;
                        data.total = data.all_recd;
                        params.success(data);
                        params.complete();
                    },200);
                }, function(error) {
                    _error_message = error.message;
                    params.success({});
                    params.complete();
                });
            }
        }]
    }
});
//组件组列表
tbDirective.directive("cmptsList", function() {
    return{
        restrict:'AE',
        templateUrl:'templates/table/cmpts_list_tbl.html',
        replace: true,
        controller: ["$scope", "$modal", "$timeout","$compile", "$state", "Cmpt", "config", "Col_Fmt", "Modal", "CV", function($scope, $modal, $timeout,$compile, $state, Cmpt, config, Col_Fmt, Modal, CV) {
            var _tblParams={},_subgroup = {};
            var _timer, _error_message ='';
            var type=2;
            $scope.test = function(item){
                $location.url('/cmpts_test/'+item.id+'/'+item.cn_name+'/'+type);
            }
            $scope.cmpts_publish = function(row){
                var _comp_id = row.id;
                var _comp_type = row.comp_type;
                Modal.confirm("是否发布组件组 ?").then(function(choose){
                    if(choose) {
                        Cmpt.publishCmpt(_comp_id,_comp_type).then(function(data) {
                            if(data) {
                                Modal.alert("发布成功!",2);
                                tableData(_tblParams);
                            }
                        }, function(error) {
                            Modal.alert(error.message,3);
                        });
                    }
                });
            },
                $scope.subgroupsListControl = {
                    options: {
                        ajax: tableData,
                        pagination: false,
                        sidePagination: 'server',
                        showColumns: false,
                        showRefresh: false,
                        sortName: 'crt_bk_date,crt_bk_time',
                        sortOrder: 'desc',
                        rowStyle: function (row, index) {
                            if (index == 0) {
                                /* $('.ng-isolate-scope thead').css("backgroundColor", "#353D46");*/
                                $('.pagination-detail').hide();
                            }
                            return { classes: 'tbl-odd'};
                        },
                        onClickRow: function (item, $element) {
                            if(!item){
                                return false;
                            }
                            $scope.item = item;
                            var add = true;
                            /*         var _html = [
                                         '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                                         "<td colspan='6' style='border:0px;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='test(item);' style='margin-right:20px;'><i class='fa fa-map-marker'></i>&nbsp;测试</button></td>",
                                         '</tr>'
                                     ].join('');*/
                            var _html_none=[
                                '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                                "<td colspan='6' style='border:0px;text-align: center;'><div style='color: #6D7183;text-align: center'>暂无操作项</div></td>",
                                '</tr>'
                            ].join('');
                            var _html_testAndPublish = [
                                '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                                "<td colspan='6' style='border:0px;text-align: right;padding-right:90px;'>" +
                                "<button class='ordinary-btn' ng-click='cmpts_publish(item)' style='margin-right:20px;'><i class='fa fa-check'></i>&nbsp;发布</button>" +
                                "</td>",
                                '</tr>'
                            ].join('');

                            if($element.next().attr("id") ==  "col_option"){
                                add = false;
                            }
                            if($("#col_option")){
                                $("#col_option").prev().removeClass('table_col_Style');
                                $("#col_option").remove();
                            }
                            if(add){
                                if(item.publish_state == 2 || !item.publish_state){
                                    $element.after($compile(_html_testAndPublish)($scope));
                                }else {
                                    $element.after($compile(_html_none)($scope));
                                }
                                $element.addClass('table_col_Style');
                                $element.next().slideDown();
                            }
                        },
                        formatNoMatches: function () {
                            return _error_message;
                        },
                        classes: "table table-no-bordered table-hover",
                        columns: [{
                            field: 'crt_bk_time',
                            title: '创建时间',
                            align: 'left',
                            valign: 'middle',
                            sortable: true,
                            width : '180px',
                            formatter: Col_Fmt.combineTimeDate
                        },{
                            field: 'cn_name',
                            title: '组件组名',
                            align: 'left',
                            valign: 'middle',
                            formatter: Col_Fmt.hideDetailFmt
                        },{
                            field: 'crt_user_name',
                            title: '创建人',
                            align: 'left',
                            valign: 'middle',
                            width:'150px'
                        },{
                            field: 'modify_bk_time',
                            title: '修改时间',
                            align: 'left',
                            valign: 'middle',
                            width : '180px',
                            formatter: Col_Fmt.combineModifyTimeDate
                        },{
                            field: 'publish_state',
                            title: '发布状态',
                            align: 'left',
                            valign: 'middle',
                            width:'100px',
                            formatter: Col_Fmt.envIsPublishFmt
                        },{
                            field: 'operate',
                            width: '100px',
                            title: '',
                            align: 'center',
                            valign: 'middle',
                            events: {
                                'click .modify' :function (e, value, row, index) {
                                    $state.go('cmpts_modify',{cmpts_id:row.id})
                                },
                                'click .view' :function (e, value, row, index) {
                                    $state.go('cmpts_detail',{cmpts_id:row.id})
                                },
                                'click .trash': function (e, value, row, index) {
                                    e.stopPropagation();
                                    var _comp_id = row.id;
                                    var _comp_cn_name = row.cn_name;
                                    Modal.confirm("确认删除[" + _comp_cn_name + "]组件组？").then(function (choose) {
                                        if(choose) {
                                            Cmpt.deleteSingleCmptGroup(_comp_id).then(function(data) {
                                                if(data) {
                                                    Modal.alert(_comp_cn_name + " 删除成功！",2);
                                                    tableData(_tblParams);
                                                }
                                            }, function(error) {
                                                Modal.alert(error.message,3);
                                            });
                                        }
                                    });
                                },
                                'click .publish':function(e, value, row, index){
                                    var _comp_id = row.id;
                                    var _comp_type = row.comp_type;
                                    Modal.confirm("是否发布组件组 ?").then(function(choose){
                                        if(choose) {
                                            Cmpt.publishCmpt(_comp_id,_comp_type).then(function(data) {
                                                if(data) {
                                                    Modal.alert("发布成功!",2);
                                                    tableData(_tblParams);
                                                }
                                            }, function(error) {
                                                Modal.alert(error.message,3);
                                            });
                                        }
                                    });
                                },
                            },
                            formatter: operateFormat
                        }
                        ]
                    }
                };

            $scope.searchSubgroupsByKeyword = function(){
                _subgroup.key_word = $scope.search_key_word;
                queryData(_tblParams);
            };
            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(_tblParams);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            }

            function operateFormat(value, row, index) {
                //return  config.getSubgroupsListTblConfigCol(value,row, index);
                //return  config.getCmptsListTblConfigCol(value,row, index);     //配置路由
                return [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<div class="tabConDe trash" title="删除" href="javascript:void(0)" >',
                    '</div>',
                    '<a class="tabConEd modify" title="修改" href=#/edit_cmpts/'+row.id+'>',
                    '</a>',
                    '<a class="tabConVi view" title="查看" href=#/detail_cmpts/'+row.id+'>',
                    '</a>',
                    '</div>'
                ].join("");

            }
            function tableData(params) {
                params.key_word = _subgroup.key_word;
                _tblParams = params;
                params.data.sort = 'crt_bk_date,crt_bk_time';
                Cmpt.getCmptGroupList(params).then(function(data) {
                    $timeout(function(){
                        var _comp_list = data.comp_list ? data.comp_list : [];
                        if(_comp_list.length == 0){
                            _error_message = "暂无数据";
                        }
                        for(var i=0;i<_comp_list.length;i++){
                            _comp_list[i].comp_type = "2";
                        }
                        data.rows = _comp_list;
                        params.success(data);
                        params.complete();
                    },200);
                }, function(error) {
                    _error_message = error.message;
                    params.success({});
                    params.complete();
                });
            }
        }]
    }
});
//插件库列表
tbDirective.directive("pluginList",function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/plugin_tb.html',
        replace: 'true',
        controller: ["$scope", "$timeout","$compile","TroubleConfig","config","Col_Fmt", "Plugin", "Modal","CV",function($scope,$timeout,$compile,TroubleConfig, config,Col_Fmt, Plugin, Modal,CV) {
            var tblParams = {};
            var timer,all_data=[];
            $scope.addPlugin = function(){
                Modal.addPlugin('',false).then(function(){
                    tableData(tblParams)
                })
            };
            $scope.downLoadPlugin = function(row){
                console.log(row);
                var _plugin_name = row.plugin_name ? row.plugin_name : '';
                var _download_path = row.plugin_file_name ? row.plugin_file_name : '';
                Modal.confirm("确认是否下载 ["+ _plugin_name +"] 插件 ?").then(function (choose) {
                    if(choose){
                        CV.downloadFile(_download_path);
                    }
                });
            }
            $scope.pluginController = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd',css:{"padding":"6px 8px 5px","cursor":'default'}};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='5' style='border:0px;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='downLoadPlugin(item);' style='margin-right:20px;'><i class='glyphicon glyphicon-new-window'></i>&nbsp;下载</button></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'plugin_name',
                        title: '插件名',
                        align: 'left',
                        valign: 'middle'
                    }, {
                        field: 'plugin_type',
                        title: '插件类型',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.pluginTypeFormat
                    },  {
                        field: 'plugin_file_name',
                        title: '插件文件',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.pluginFileFormat
                    },  {
                        field: 'plugin_bk_desc',
                        title: '插件描述',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .edit': function (e, value, row, index) {
                                e.stopPropagation();
                                Modal.addPlugin(row.plugin_name,true).then(function(){
                                    tableData(tblParams)
                                })
                            },
                            'click .trash': function(e, value, row, index) {
                                e.stopPropagation();
                                Modal.confirm("确认删除[ "+ row.plugin_name+" ]插件 ?").then(function (choose) {
                                    if(choose) {
                                        Plugin.deleteSinglePlugin(row.plugin_name).then(function(data) {
                                            if(data) {
                                                Modal.alert("["+ row.plugin_name +"]插件删除成功！",2);
                                                tableData(tblParams);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            }
                        },
                        formatter: operateFormat
                    }]
                }
            };

            function operateFormat(value, row, index) {
                //return config.getPluginTblConfigCol(value,row, index);
                return [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    //'<div class="tabConVi" title="查看">',
                    //'</div>',
                    '<div class="tabConDe trash" href="javascript:void(0)" title="删除">',
                    '</div>',
                    '<a class="tabConEd edit" href="javascript:void(0)" title="修改">',
                    '</a>',
                    '</div>'
                ].join("");
            }
            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                Plugin.getAllPluginList().then(function(data) {
                    data.total = data.all_recd;
                    data.rows = data.plugin_list  ? data.plugin_list  : [];
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
//服务器列表
tbDirective.directive("serverList", function() {
    return{
        restrict:'AE',
        templateUrl:'templates/table/server_list_tbl.html',
        replace: true,
        controller: ["$scope", "$modal", "$timeout", "$compile","$state", "Server", "Col_Fmt", "Modal", "CV", function($scope, $modal, $timeout,$compile, $state, Server, Col_Fmt, Modal, CV) {
            var _tblParams = {}, _srv = {} ,timer, _error_message ='';
            $scope.srvListControl = {
                options:{
                    ajax: tableData,
                    pageNumber:1,
                    search: false,
                    pagination: true,
                    sidePagination: 'server',
                    showColumns: false,
                    showRefresh: false,
                    sortName: 'create_date',
                    sortOrder: 'd',
                    rowStyle: function (row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd'};
                    },
                    onClickRow: function (item, $element){
                        if(!item){
                            return false;
                        }
                        var add = true;
                        var _html_none=[
                            '<tr class="col_option" id="col_option" style="height:32px;display: none;">',
                            "<td colspan='8' style='border:0px;text-align: center;'><div style='color: #999;text-align: center'>暂无操作项</div></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html_none)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [
                        {
                            field: 'create_date',
                            title: '创建时间',
                            halign: 'left',
                            align: 'left',
                            valign: 'middle',
                            sortable: true,
                            width:'175px',
                            formatter: Col_Fmt.dataTimeFmt
                        },{
                            field: 'server_desc',
                            title: '服务器描述',
                            halign: 'left',
                            align: 'left',
                            valign: 'middle',
                            sortable: true,
                            formatter: Col_Fmt.padding20Fmt
                        },{
                            field:'server_ip',
                            title: '服务器地址',
                            align: 'left',
                            halign: 'left',
                            valign: 'middle',
                            sortable: true,
                            width:'175px',
                            formatter: Col_Fmt.padding20Fmt
                        },{
                            field: 'agent_status',
                            title: 'AGENT',
                            align: 'center',
                            halign: 'center',
                            valign: 'middle',
                            width:'70px',
                            formatter: Col_Fmt.isConfigAgent
                        },{
                            field: 'operate',
                            width: '100px',
                            title: '',
                            align: 'center',
                            valign: 'middle',
                            events: {
                                'click .trash': function (e, value, row, index) {
                                    e.stopPropagation();
                                    var _server_ip = row.server_ip;
                                    Modal.confirm("确认删除服务器[" + _server_ip + "]？").then(function (choose) {
                                        if(choose) {
                                            Server.deleteServer(_server_ip).then(function(data) {
                                                if(data) {
                                                    Modal.success("服务器[ "+_server_ip + " ]删除成功！");
                                                    tableData(_tblParams);
                                                }
                                            }, function(error) {
                                                Modal.error(error.message);
                                            });
                                        }
                                    });
                                },
                                'click .modify' :function (e, value, row, index) {
                                    $state.go('srv_modify',{server_ip:row.server_ip})
                                },
                                'click .view' :function (e, value, row, index) {
                                    $state.go('srv_detail',{server_ip:row.server_ip})
                                }
                            },
                            formatter: operateFormat
                        }]
                }
            };
            function operateFormat(value, row, index) {
                return [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<div class="tabConDe trash" title="删除">',
                    '</div>',
                    '<a class="tabConEd modify" title="修改" href="javascript:void(0)">',
                    '</a>',
                    '<a class="tabConVi view" title="查看" href="javascript:void(0)">',
                    '</a>',
                    '</div>'
                ].join("");
            }
            $scope.doSearch = function(event){
                if(event.type=='keypress' && event.keyCode!='13'){
                    return false;
                }
                _tblParams.data.offset = 0;
                if(!CV.valiForm($scope.doSearchForm)){
                    CV.error("输入IP地址错误！");
                    return false;
                }
                _srv.srv_desc = $scope.srv.srv_desc;
                _srv.server_ip = $scope.srv.server_ip;
                queryData(_tblParams);
            };
            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(_tblParams);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            }
            function tableData(params) {
                params.ce_server_name = _srv.server_desc ?_srv.server_desc:"";
                params.server_ip = _srv.server_ip ? _srv.server_ip:"";
                _tblParams = params;
                Server.pageServerList(params).then(function(data) {
                    $timeout(function(){
                        data.total = data.all_recd;
                        data.rows = data.server_bean_list ? data.server_bean_list : [];
                        if(data.rows.length == 0){
                            _error_message = "";
                        }
                        params.success(data);
                        params.complete();
                    },0);
                }, function(error) {
                    _error_message = error.message;
                    params.success({});
                    params.complete();
                });
            }
        }]
    }
});
//系统列表
tbDirective.directive('sysList',function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/sys_tb.html',
        replace: 'true',
        controller: ["$scope","$state", "$timeout", "$filter","$compile", "$location", "Sys", "config", "Col_Fmt", "Modal", "CV",function($scope,$state,$timeout, $filter, $compile,$location, Sys, config, Col_Fmt, Modal, CV) {
            var tbl_params = {};
            var _node_timer,_program_timer,_user_timer;
            var _sys_list_element = $("#sys_list");
            $scope.config = function(item){
                $state.go("sys_config.struct_config",{sys_id:item.business_sys_name});
            };
            $scope.bsTableCtrl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false,
                    showRefresh: false,
                    sortName: 'default',
                    sortOrder: 'desc',

                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd'};
                    },
                    onClickRow: function (item, $element) {
                        if(!item) return;
                        $scope.item = item;

                        var add = true,_html;
                        _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='7' style='border:0px;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='config(item);' style='margin-right:20px;'><i class='fa fa-wrench'></i>&nbsp;配置</button></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                            //无操作权限
                            if(item.validate_user && item.validate_user != 1){
                                $element.next().find(".ordinary-btn").removeClass("ordinary-btn").addClass("ordinary-btn-disabled");
                                $element.next().find(".ordinary-btn-disabled").attr({disabled:true,title:"当前用户非系统责任人,不可操作"});
                            }
                        }
                    },
                    classes: "table table-no-bordered table-hover ",
                    columns: [{
                        field: 'business_sys_name',
                        title: '应用系统',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width:'200px'
                    }, {
                        field: 'business_cn_name',
                        title: '系统中文名',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    }, {
                        field: 'user_list',
                        title: '责任人',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width: '100px',
                        events:{
                            'mouseenter .user_animate_active':function(e,value,row,index){
                                var _this = $(this);
                                var _clientY = e.clientY; //鼠标距离浏览器窗口顶端
                                var _syslist_clientY = _sys_list_element.offset().top || 110;//系统列表距离浏览器窗口顶端
                                var _mouse_offset_top = ~~(_clientY-_syslist_clientY); //鼠标距离系统列表顶端
                                var _data_length = value ? value.length : 0;
                                var _all_select_element = $(".user_animate_active").next();
                                $(document).off('mousemove');
                                if(_user_timer) $timeout.cancel(_user_timer);
                                if(_node_timer) $timeout.cancel(_node_timer);
                                if(_program_timer) $timeout.cancel(_program_timer);
                                $(".publish_program_animate_active").next().css({display:'none'});
                                $(".animate_active").next().css({display:'none'});
                                if(_this.next()[0]){
                                    if(_this.next()[0].style.display == "none"){
                                        $timeout(function(){
                                            $(".user_animate_active").next().css({display:'none'});
                                        },0);
                                    }
                                }else{
                                    $timeout(function(){
                                        $(".user_animate_active").next().css({display:'none'});
                                    },0);
                                }
                                _user_timer = $timeout(function(){
                                    _this.next().fadeIn(200,function () {
                                        resetListHeight(_mouse_offset_top,_data_length);
                                    });
                                },200);
                            },
                            'mouseleave .user_animate_active':function(){
                                var _this = $(this);
                                if(_this.next().length > 0){
                                    var elem =  _this.next()[0];
                                    var _min_width = $(elem).offset().left;
                                    var _max_width = _min_width + 122 + 20;
                                    var _min_height = $(elem).offset().top;
                                    var _max_height = $(elem).offset().top + $(elem).height();
                                    $(document).mousemove(function(e){
                                        if((e.pageX < _min_width || e.pageX > _max_width) || (e.pageY < _min_height || e.pageY > _max_height)){
                                            if(_program_timer) $timeout.cancel(_program_timer);
                                            if(_node_timer) $timeout.cancel(_node_timer);
                                            if(_user_timer) $timeout.cancel(_user_timer);
                                            _user_timer = $timeout(function(){
                                                $(".user_animate_active").next().fadeOut(200,function () {
                                                    _sys_list_element.css("padding-bottom","0");
                                                });
                                            },0);
                                        }
                                    });
                                }
                            }
                        },
                        formatter: Col_Fmt.sysListUser
                    }/* {
                        field: 'node_list',
                        title: '系统节点',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width: '100px',
                        events:{
                            'mouseenter .animate_active':function(e,value,row,index){
                                var _this = $(this);
                                var _clientY = e.clientY; //鼠标距离浏览器窗口顶端
                                var _syslist_clientY = _sys_list_element.offset().top || 110;//系统列表距离浏览器窗口顶端
                                var _mouse_offset_top = ~~(_clientY-_syslist_clientY); //鼠标距离系统列表顶端
                                var _data_length = value ? value.length : 0;
                                var _all_select_element = $(".animate_active").next();
                                $(document).off('mousemove');
                                if(_node_timer) $timeout.cancel(_node_timer);
                                if(_program_timer) $timeout.cancel(_program_timer);
                                if(_user_timer) $timeout.cancel(_user_timer);
                                $(".publish_program_animate_active").next().css({display:'none'});
                                $(".user_animate_active").next().css({display:'none'});
                                if(_this.next()[0]){
                                    if(_this.next()[0].style.display == "none"){
                                        $timeout(function(){
                                            $(".animate_active").next().css({display:'none'});
                                        },0);
                                    }
                                }else{
                                    $timeout(function(){
                                        $(".animate_active").next().css({display:'none'});
                                    },0);
                                }
                                _node_timer = $timeout(function(){
                                    _this.next().fadeIn(200,function () {
                                        resetListHeight(_mouse_offset_top,_data_length);
                                    });
                                },200);
                            },
                            'mouseleave .animate_active':function(){
                                var _this = $(this);
                                if(_this.next().length > 0){
                                    var elem =  _this.next()[0];
                                    var _min_width = $(elem).offset().left;
                                    var _max_width = _min_width + 122 + 20;
                                    var _min_height = $(elem).offset().top;
                                    var _max_height = $(elem).offset().top + $(elem).height();
                                    $(document).mousemove(function(e){
                                        if((e.pageX < _min_width || e.pageX > _max_width) || (e.pageY < _min_height || e.pageY > _max_height)){
                                            if(_program_timer) $timeout.cancel(_program_timer);
                                            if(_node_timer) $timeout.cancel(_node_timer);
                                            if(_user_timer) $timeout.cancel(_user_timer);
                                            _node_timer = $timeout(function(){
                                                $(".animate_active").next().fadeOut(200,function () {
                                                     _sys_list_element.css("padding-bottom","0");
                                                });
                                            },0);
                                        }
                                    });
                                }
                            }
                        },
                        formatter: Col_Fmt.sysListNodeCount
                    }*/, {
                        field: 'prog_list',
                        title: '系统方案',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width: '100px',
                        events:{
                            'mouseenter .publish_program_animate_active':function(e,value,row,index){
                                var _this = $(this);
                                var _clientY = e.clientY; //鼠标距离浏览器窗口顶端
                                var _syslist_clientY = _sys_list_element.offset().top || 110;//系统列表距离浏览器窗口顶端
                                var _mouse_offset_top = ~~(_clientY-_syslist_clientY); //鼠标距离系统列表顶端
                                var _data_length = value ? value.length : 0;
                                var _all_select_element = $(".publish_program_animate_active").next();
                                $(document).off('mousemove');
                                if(_program_timer) $timeout.cancel(_program_timer);
                                if(_node_timer) $timeout.cancel(_node_timer);
                                if(_user_timer) $timeout.cancel(_user_timer);
                                $(".animate_active").next().css({display:'none'});
                                $(".user_animate_active").next().css({display:'none'});
                                if(_this.next()[0]){
                                    if(_this.next()[0].style.display == "none"){
                                        $timeout(function(){
                                            $(".publish_program_animate_active").next().css({display:'none'});
                                        },0);
                                    }
                                }else{
                                    $timeout(function(){
                                        $(".publish_program_animate_active").next().css({display:'none'});
                                    },0);
                                }
                                _program_timer = $timeout(function(){
                                    _this.next().fadeIn(200,function () {
                                        resetListHeight(_mouse_offset_top,_data_length);
                                    });
                                },200);
                            },
                            'mouseleave .publish_program_animate_active':function(){
                                var _this = $(this);
                                if(_this.next()[0]){
                                    var elem =  _this.next()[0];
                                    var _min_width = $(elem).offset().left;
                                    var _max_width = _min_width + 122+20;
                                    var _min_height = $(elem).offset().top;
                                    var _max_height = $(elem).offset().top + $(elem).height();
                                    $(document).mousemove(function(e){
                                        if((e.pageX < _min_width || e.pageX > _max_width) || (e.pageY < _min_height || e.pageY > _max_height)){
                                            if(_node_timer) $timeout.cancel(_node_timer);
                                            if(_program_timer) $timeout.cancel(_program_timer);
                                            if(_user_timer) $timeout.cancel(_user_timer);
                                            _node_timer = $timeout(function(){
                                                $(".publish_program_animate_active").next().fadeOut(200,function () {
                                                    _sys_list_element.css("padding-bottom","0");
                                                });
                                            },0);
                                        }
                                    });
                                }
                            }
                        },
                        formatter: Col_Fmt.sysListPublishState
                    },  {
                        field: 'logInfoList',
                        title: '日志',
                        align: 'left',
                        halign: 'left',
                        valign: 'middle',
                        width: '100px',
                        events:{
                            'mouseenter .animate_active':function(e,value,row,index){
                                var _this = $(this);
                                var _clientY = e.clientY; //鼠标距离浏览器窗口顶端
                                var _syslist_clientY = _sys_list_element.offset().top || 110;//系统列表距离浏览器窗口顶端
                                var _mouse_offset_top = ~~(_clientY-_syslist_clientY); //鼠标距离系统列表顶端
                                var _data_length = value ? value.length : 0;
                                var _all_select_element = $(".animate_active").next();
                                $(document).off('mousemove');
                                if(_node_timer) $timeout.cancel(_node_timer);
                                if(_program_timer) $timeout.cancel(_program_timer);
                                if(_user_timer) $timeout.cancel(_user_timer);
                                $(".publish_program_animate_active").next().css({display:'none'});
                                $(".user_animate_active").next().css({display:'none'});
                                if(_this.next()[0]){
                                    if(_this.next()[0].style.display == "none"){
                                        $timeout(function(){
                                            $(".animate_active").next().css({display:'none'});
                                        },0);
                                    }
                                }else{
                                    $timeout(function(){
                                        $(".animate_active").next().css({display:'none'});
                                    },0);
                                }
                                _node_timer = $timeout(function(){
                                    _this.next().fadeIn(200,function () {
                                        resetListHeight(_mouse_offset_top,_data_length);
                                    });
                                },200);
                            },
                            'mouseleave .animate_active':function(){
                                var _this = $(this);
                                if(_this.next().length > 0){
                                    var elem =  _this.next()[0];
                                    var _min_width = $(elem).offset().left;
                                    var _max_width = _min_width + 122 + 20;
                                    var _min_height = $(elem).offset().top;
                                    var _max_height = $(elem).offset().top + $(elem).height();
                                    $(document).mousemove(function(e){
                                        if((e.pageX < _min_width || e.pageX > _max_width) || (e.pageY < _min_height || e.pageY > _max_height)){
                                            if(_program_timer) $timeout.cancel(_program_timer);
                                            if(_node_timer) $timeout.cancel(_node_timer);
                                            if(_user_timer) $timeout.cancel(_user_timer);
                                            _node_timer = $timeout(function(){
                                                $(".animate_active").next().fadeOut(200,function () {
                                                    _sys_list_element.css("padding-bottom","0");
                                                });
                                            },0);
                                        }
                                    });
                                }
                            }
                        },
                        formatter: Col_Fmt.sysListLogCount
                    },{
                        field: 'agent_flag',
                        title: 'Agent部署',
                        align: 'center',
                        halign: 'center',
                        valign: 'middle',
                        width: '100px',
                        formatter: Col_Fmt.agentUseFmt
                    },{
                        field: 'operate',
                        width: '100px',
                        title: '',
                        align: 'right',
                        valign: 'middle',
                        events: {
                            'click .trash': function(event) {
                                event.stopPropagation();
                                var id = $(this).attr("id");
                                Modal.confirm("确认删除["+id+"]系统？").then(function (choose) {
                                    if(choose) {
                                        Sys.deleteSys(id).then(function(data) {
                                            if(data) {
                                                Modal.alert(id + " 应用系统删除成功！",2);
                                                tableData(tbl_params);
                                            }
                                        }, function(error) {
                                            if(error.status == 'localauth') {
                                                Modal.localauth(error.data, {'business_sys_name':id}).then(function(data){
                                                    tableData(tbl_params);
                                                });
                                            } else {
                                                Modal.alert(error.message,3);
                                            }
                                            $scope.submited =false;
                                        });
                                    }
                                });
                            },
                            'click .sys-view': function (e, value, row) {//查看页面
                                $state.go("sys_detail",{sys_id:row.business_sys_name});
                            },
                            'click .sys-modify': function (e, value, row) {//修改页面
                                $state.go("sys_modify",{sys_id:row.business_sys_name});
                            },
                        },
                        formatter: operateFormat
                    }]
                }
            };

            function operateFormat(value, row, index) {
                var _operate;
                //无操作权限
                if(row.validate_user && row.validate_user != 1){
                    _operate = [
                        '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                        '<div class="tabConDe btn-not-allowed" disabled title="当前用户非系统责任人,不可操作">',
                        '</div>',
                        '<a class="tabConEd btn-not-allowed" disabled title="当前用户非系统责任人,不可操作"  href="javascript:void(0)">',
                        '</a>',
                        '<a class="tabConVi sys-view" title="查看">',
                        '</a>',
                        '</div>'
                    ].join("");
                }else{
                    _operate = [
                        '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                        '<div class="tabConDe trash" href="javascript:void(0)" id='+row.business_sys_name+' title="删除">',
                        '</div>',
                        '<a class="tabConEd sys-modify" title="修改">',
                        '</a>',
                        '<a class="tabConVi sys-view" title="查看">',
                        '</a>',
                        '</div>'
                    ].join("");
                }
                return _operate;
            }
            //重置列表容器高度
            function resetListHeight(offsetTop,dataLength) {
                if(!dataLength) return;
                var _container_height = _sys_list_element.height(); //系统列表高度
                var _mouse_offset_bottom = ~~(_container_height - offsetTop); //鼠标距离系统列表底部的高度
                var _data_height = dataLength * 34; //每一个数据的高度34
                if(_data_height > _mouse_offset_bottom){
                    _sys_list_element.css({
                        "padding-bottom": (_data_height - _mouse_offset_bottom) + 10 + 'px'});
                }
            }
            //表格数据绑定
            function tableData(params) {
                tbl_params = params;
                Sys.pageSysTbl(params).then(function(data) {
                    //转换用户列表
                    if(data.list_BsSystem){
                        for(var i =0; i < data.list_BsSystem.length; i++){
                            var _row = data.list_BsSystem[i];
                            if(_row.user_cn_name){
                                _row.user_list =  _row.user_cn_name.split(',');
                            }
                        }
                    }
                    data.total = data.all_recd;
                    data.rows = data.list_BsSystem ? data.list_BsSystem : [];
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
//方案配置--添加组件
tbDirective.directive("programCmptList", function() {
    return{
        restrict:'AE',
        templateUrl:'templates/table/program_cmpt_list_tbl.html',
        replace: true,
        controller: ["$scope", "$modal", "$timeout", "$compile","$location", "Cmpt", "config", "Col_Fmt", "Modal", "CV", function($scope, $modal, $timeout,$compile, $location, Cmpt, config, Col_Fmt, Modal, CV) {
            var _tblParams={};
            var _temp_search = {};
            $scope.programCmptListControl = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    sidePagination: 'server',
                    sortName: 'crt_bk_date,crt_bk_time',
                    sortOrder: 'desc',
                    showColumns: false,
                    showRefresh: false,
                    onClickRow: function (item, $element) {
                        item.checked =  !item.checked;
                        if(item.checked){
                            $element.find('td').not(':first').addClass('checked_style');
                            $element.find('.icheckbox_minimal-blue').addClass('checked');
                        }else {
                            $element.find('td').removeClass('checked_style')
                            $element.find('.icheckbox_minimal-blue').removeClass('checked');
                        }
                    },
                    classes: "table table-no-bordered",
                    columns: [{
                        field: 'checked',
                        title: '选择',
                        align: 'center',
                        valign: 'middle',
                        width:'50px',
                        formatter: choosecmptColFmt
                    },{
                        field: 'cn_name',
                        title: '组件名',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.hideDetailFmt
                    },{
                        field: 'impl_type',
                        title: '执行类别',
                        align: 'left',
                        valign: 'middle',
                        width : '100px',
                        formatter: Col_Fmt.subgroupListExecuteTypeFmt
                    },{
                        field: 'tag_list',
                        title: '分类',
                        align: 'center',
                        valign: 'middle',
                        width : '120px',
                        formatter: Col_Fmt.classifyTag
                    },{
                        field: 'crt_user_name',
                        title: '创建人',
                        align: 'left',
                        valign: 'middle',
                        width:'120px'
                    },{
                        field: 'modify_bk_time',
                        title: '修改时间',
                        align: 'left',
                        valign: 'middle',
                        width:'150px',
                        formatter: Col_Fmt.combineModifyTimeDate
                    }]
                }
            };
            //清空搜索框
            $scope.clear=function(){
                $scope.search_key_word='';
            };
            //搜索按钮
            $scope.searchSubgroupByKeyword = function(){
                _tblParams.cn_name = $scope.search_key_word;
                _tblParams.tag_list=[];
                _tblParams.impl_types=[];
                queryData(_tblParams);
            };
            //高级搜索
            $scope.seniorSearch = function () {
                _temp_search.tag_list =[];
                _temp_search.impl_types =[];
                for (var i = 0; i < $scope.info.high_search_obj.exec_type_list.length; i++) {
                    if ($scope.info.high_search_obj.exec_type_list[i].flag) {
                        _temp_search.impl_types.push($scope.info.high_search_obj.exec_type_list[i].key);
                    }
                }
                for (var i = 0; i < $scope.info.high_search_obj.classify_list.length; i++) {
                    if ($scope.info.high_search_obj.classify_list[i].flag) {
                        _temp_search.tag_list.push($scope.info.high_search_obj.classify_list[i].value);
                    }
                }
                _tblParams.cn_name = $scope.info.high_search_obj.key_word;
                _tblParams.tag_list = _temp_search.tag_list;
                _tblParams.impl_types = _temp_search.impl_types;
                $scope.search_key_word='';
                queryData(_tblParams);
                $scope.control.search_flag = true
            };

            // 表格外查询按钮调用事件，方法内部无需修改
            function queryData(params) {
                if(params.data){
                    params.data.offset = 0;
                    tableData(_tblParams);
                }else{
                    Modal.alert("暂无数据记录");
                    return false;
                }
            }

            function operateFormat(value, row, index) {
                //return  config.getSubgroupListTblConfigCol(value,row, index);
                //return  config.getCmptListTblConfigCol(value,row, index);    //配置路由
                return [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    '<div class="tabConDe trash" title="删除" href="javascript:void(0)" >',
                    '</div>',
                    '<a class="tabConEd" title="修改" href=#/edit_cmpt/'+row.id+'>',
                    '</a>',
                    '<a class="tabConVi" title="查看" href=#/detail_cmpt/'+row.id+'>',
                    '</a>',

                    '</div>'
                ].join("");
            }
            function tableData(params) {
                if(_tblParams.cn_name || _tblParams.tag_list || _tblParams.impl_types){
                    params.cn_name= _tblParams.cn_name;
                    params.tag_list=_tblParams.tag_list;
                    params.impl_types=_tblParams.impl_types;
                }
                _tblParams = params;
                params.publish_state=1;
                params.component_purpose=1;
                Cmpt.getCmptPageList(params).then(function(data) {
                    $timeout(function(){
                        if(data){
                            $scope.control.cmpt_list_loading = false;
                            data.rows = data.comp_list ? data.comp_list :[];
                            $scope.info.cmpt_list =data.rows;
                            data.total = data.all_recd;
                            params.success(data);
                            params.complete();
                        }
                    },0);
                }, function(error) {
                    $scope.cmpt_info.cmpt_list_loading = false;
                    $scope.cmpt_info.error_message = error.message;
                    params.success({});
                    params.complete();
                });
            }

            function choosecmptColFmt(value, row, index) {
                var _html='<div class="icheckbox_minimal-blue"><div>';
                return _html
            }
        }]
    }
});
//公共资源列表
tbDirective.directive("resourcesList",function(){
    return{
        restrict: 'AE',
        templateUrl: 'templates/table/resources_tb.html',
        replace: 'true',
        controller: ["$scope", "$timeout","$compile","TroubleConfig","config","Col_Fmt", "CommonResources", "Modal","CV",function($scope,$timeout,$compile,TroubleConfig, config,Col_Fmt, CommonResources, Modal,CV) {
            var tblParams = {};
            var timer,all_data=[];
            $scope.addResources = function(){
                Modal.addResource('',false).then(function(){
                    tableData(tblParams)
                })
            };
            $scope.downLoadPlugin = function(row){
                var _resources_name = row.resource_name ? row.resource_name : '';
                var _resources_file_path = row.resource_file_path ? row.resource_file_path : '';
                Modal.confirm("确认是否下载 ["+ _resources_name +"]  ?").then(function (choose) {
                    if(choose){
                        CV.downloadFile(_resources_file_path);
                    }
                });
            }
            $scope.resourcesController = {
                options: {
                    ajax: tableData,
                    pagination: true,
                    pageSize:10,
                    pageNumber:1,
                    search: false,
                    sidePagination:'server',
                    showColumns: false ,
                    showRefresh: false,
                    rowStyle: function(row, index) {
                        index == 0 ? $('.pagination-detail').hide() : '';
                        return {classes : 'tbl-odd',css:{"padding":"6px 8px 5px","cursor":'default'}};
                    },
                    onClickRow: function (item, $element) {
                        if(!item){
                            return false;
                        }
                        $scope.item = item;
                        var add = true;
                        var _html = [
                            '<tr class="col_option" id="col_option" style="height:40px;display: none;">',
                            "<td colspan='4' style='border:0px;text-align: right;padding-right:90px;'><button class='ordinary-btn' ng-click='downLoadPlugin(item);' style='margin-right:20px;'><i class='fa fa-download'></i>&nbsp;下载</button></td>",
                            '</tr>'
                        ].join('');
                        if($element.next().attr("id") ==  "col_option"){
                            add = false;
                        }
                        if($("#col_option")){
                            $("#col_option").prev().removeClass('table_col_Style');
                            $("#col_option").remove();
                        }
                        if(add){
                            $element.after($compile(_html)($scope));
                            $element.addClass('table_col_Style');
                            $element.next().slideDown();
                        }
                    },
                    classes: "table table-no-bordered table-hover",
                    columns: [{
                        field: 'resource_name',
                        title: '资源名称',
                        align: 'left',
                        valign: 'middle'
                    }, {
                        field: 'resource_desc',
                        title: '资源描述',
                        align: 'left',
                        valign: 'middle',
                    },  {
                        field: 'resource_file_path',
                        title: '资源文件',
                        align: 'left',
                        valign: 'middle',
                        formatter: Col_Fmt.pluginFileFormat
                    },{
                        field: 'operate',
                        width: '80px',
                        title: '',
                        align: 'center',
                        valign: 'middle',
                        events: {
                            'click .edit': function (e, value, row, index) {
                                Modal.addResource(row.resource_name,true).then(function(){
                                    tableData(tblParams)
                                })
                            },
                            'click .trash': function(e, value, row, index) {
                                Modal.confirm("确认删除[ "+ row.resource_name+" ]?").then(function (choose) {
                                    if(choose) {
                                        CommonResources.deleteResources(row.resource_name).then(function(data) {
                                            if(data) {
                                                Modal.alert("["+ row.resource_name +"]删除成功！",2);
                                                tableData(tblParams);
                                            }
                                        }, function(error) {
                                            Modal.alert(error.message,3);
                                        });
                                    }
                                });
                            }
                        },
                        formatter: operateFormat
                    }]
                }
            };

            function operateFormat(value, row, index) {
                //return config.getPluginTblConfigCol(value,row, index);
                return [
                    '<div style="position: absolute;margin-top: -12px;margin-left: 8px;">',
                    //'<div class="tabConVi" title="查看">',
                    //'</div>',
                    '<div class="tabConDe trash" href="javascript:void(0)" title="删除">',
                    '</div>',
                    '<a class="tabConEd edit" href="javascript:void(0)" title="修改">',
                    '</a>',
                    '</div>'
                ].join("");
            }
            //表格数据绑定
            function tableData(params) {
                tblParams = params;
                CommonResources.getAllResourcesList().then(function(data) {
                    data.total = data.all_recd;
                    data.rows = data.resources_list  ? data.resources_list  : [];
                    params.success(data);
                    params.complete();
                }, function(error) {
                    Modal.alert(error.message,3);
                });
            }
        }]
    }
});
