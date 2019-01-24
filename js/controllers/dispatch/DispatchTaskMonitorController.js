'use strict';
//自动运维任务
var task = angular.module('taskMonitorController',  ["highcharts-ng", 'ui.bootstrap', 'ngCookies',
    'CvService',
    'DispatchHttpSrv',
    'ChartsService',
    'ModalCtrl',
    'GlobalData']);

task.value('baseUrl', '/clWeb/');

/**
 * 运维任务监控
 * */
task.controller("taskMonitorCtrl", ["$scope", "$rootScope", "$cookieStore", "$location", "$timeout", "$interval", "$window" , "OpTaskState", "DispatchTaskMonitor", "CommData", "Charts", "Modal", "CV", function($scope, $rootScope, $cookieStore, $location, $timeout, $interval, $window, OpTaskState, DispatchTaskMonitor, CommData, Charts, Modal, CV) {
    //任务状态定时,统计信息定时,节点占用率定时
    var _status_interval,_statistics_interval,_node_interval;
    /**
     * 任务状态 1执行中/2--/3异常/4正常完成/5异常完成/6重试中/7暂停/8手动等待/9暂停等待/10失败
     * */
    //运行任务圆环数据
    var task_exe_data ={
        title: '',
        color:'#FFF',
        border_width:10,
        split_color:'#162A40',
        inner_size:'67%',
        dataList:[] //任务执行总数据
    };
    //执行成功
    var task_exesuc_data ={
        title:'',
        color:'#FFF',
        border_width:2,
        split_color:'#162A40',
        inner_size:'67%',
        dataList:[]//执行成功数据
    };
    //执行失败
    var task_exefail_data ={
        title:'',
        color:'#FFF',
        border_width:2,
        split_color:'#162A40',
        inner_size:'67%',
        dataList:[] // 执行失败数据
    };

    //控制
    $scope.control = {
      loading:false,  //数据加载
      change_flag:1,  //默认为1任务，2节点
      task_optype:1, //任务操作类型（默认1）1全部的，2收藏的，3正在执行的，4待执行的，5执行异常的，6执行成功的
      view_node:false, //查看节点标志
      active_node_i:-1, //节点tab选中
      monitor_error:false,          // 监控服务异常
      err_msg:'',                   //任务基本信息出错
      node_err_msg:'',              //节点基本信息出错
      change_optype_loading:false  //切换操作类型加载数据
    };
    //任务/节点监控信息
    $scope.info = {
        statistics_info:{
            task_count:0,executing_count:0,will_execute_count:0,finished_count:0,
            success_count:0,fail_count:0, application_count:0,node_count:0
        },
        task_list:[],       //任务监控列表
        node_info:{         //节点信息
            node_basic_list:[],
            node_used_list:[],
            single_node:{
                basic_info:{},
                sys_info:{},
                process_list:[],
            }
        },
        task_basic_list:[], //任务基本信息列表
        search_info : {     //搜索信息
            key_word:'',
            node_ip:'',
            is_search:false,
        },
    };
    //公共数据
    $scope.data = {
        operation_data:[ //任务操作列数据
            {op_type:1,text:'全部的'},{op_type:2,text:'收藏的'},{op_type:3,text:'正在执行的'},
            {op_type:4,text:'待执行的'},{op_type:5,text:'执行异常的'},{op_type:6,text:'执行成功的'}],
        tem_task_list : [], //临时任务列表
    };
    //切换TAB时状态和控制字段的转化
    var changeTab = function(index) {
        var _last_index = $scope.control.active_node_i;
        if(index == _last_index) return;
        if(_last_index != -1){
            $scope.info.node_info.node_basic_list[_last_index].active = false;  //关闭上一个TAB(第一次不关闭)
            if($scope.info.node_info.node_basic_list[_last_index].one_node_timer){
                $interval.cancel($scope.info.node_info.node_basic_list[_last_index].one_node_timer);
            }
        }
        $scope.info.node_info.node_basic_list[index].active = true;  //激活当前
        $scope.control.active_node_i = index;                               //赋当前TAB下标
    };
    //更新任务进度圆环
    var updateProgress = function(task_list){
        if(!task_list || task_list.length ==0) return;
        for(var i = 0,tasklen = task_list.length; i < tasklen; i++){
            var _task = task_list[i],_data={};
            if(_task.task_status && _task.task_status != 2) continue;
            for(var j = 0,len = _task.exe_list.length; j < len; j++){
                var _exe = _task.exe_list[j];
                //执行进度
                if(_exe.task_status && _exe.task_status != 4 && _exe.task_status != 5 ){
                    _exe.job_num = _exe.job_num ? _exe.job_num : 0;
                    _exe.job_exe_num = _exe.job_exe_num ? _exe.job_exe_num : 0;
                    _exe.prog_rate   =  _exe.job_num ? Math.floor((_exe.job_exe_num/_exe.job_num) * 100) : 0;
                    _exe.percentage = _exe.prog_rate  ?  _exe.prog_rate >= 95 ? 95 :  _exe.prog_rate :  0; //进度百分比
                }
                var _percentage = _exe.percentage ? _exe.percentage : 0,_color='';
                switch (_exe.task_status){
                    case 1 : //1,2,6,8,9(都应为执行中)
                    case 2 : //2自动等待
                    case 6 :  //重试中
                    case 8 : //手动等待
                    case 9 :  _color = '#00B8FE'; break;
                    case 3 : //3异常 5异常完成
                    case 5 :  _color = '#FF7974'; break;
                    case 7 :  _color = '#FFA350'; break;//超时预警等待(暂停)
                    default: _color = '#0D638C'; break;
                }
                _data = {title:  _exe.task_status != 7 ? _percentage + '%' : '',percentage:_percentage,color : _color};
                _exe.exeConfig = Charts.getActivityConfig(_data,46,46);
            }
        }
    };
    //更新统计信息-圆环
    var updateStatisticsCircle = function(){
        var _statis = $scope.info.statistics_info;
        _statis.task_count = _statis.executing_count + _statis.will_execute_count + _statis.finished_count;
        var _executing_rate = parseFloat((_statis.executing_count/_statis.task_count) * 100);
        var _will_exe_rate = parseFloat((_statis.will_execute_count/_statis.task_count) * 100);
        var _finished_exe_rate = parseFloat((_statis.finished_count/_statis.task_count) * 100);
        //任务总执行数据
        task_exe_data.dataList = [{name:'正在运行',y:_executing_rate,color:'#F46EB6'},{name:'将要运行',y:_will_exe_rate,color:'#07B9FD'},{name:'已完成的',y:_finished_exe_rate,color:'#26E9EE'}];
        $scope.circleConfig = Charts.getSplitPieConfig(task_exe_data,180,180);

        //转化成功/失败圆数据
        var _suc_part=[],_fail_part=[];
        for(var i =0; i < _statis.task_count; i++){
            //成功的
            if(i < _statis.success_count){
                _suc_part.push({name:'运行成功',y:parseFloat((_statis.success_count/_statis.task_count) * 100),color:'#B0D364'})
            }else{
                _suc_part.push({name:'运行失败',y:parseFloat((_statis.success_count/_statis.task_count) * 100),color:'transparent'})
            }
            //失败的
            if(i < _statis.fail_count){
                _fail_part.push({name:'运行失败',y:parseFloat((_statis.fail_count/_statis.task_count) * 100),color:'#F27772'})
            }else{
                _fail_part.push({name:'运行成功',y:parseFloat((_statis.fail_count/_statis.task_count) * 100),color:'transparent'})
            }
        }

        //执行成功数据
        task_exesuc_data.dataList = _suc_part;
        $scope.exeSucConfig = Charts.getSplitPieConfig(task_exesuc_data,100,100);

        //执行失败数据
        task_exefail_data.dataList = _fail_part;
        $scope.exeFailConfig = Charts.getSplitPieConfig(task_exefail_data,100,100);
    };
    //过滤等待运行的任务
    var filterWaitTask = function(_task_basic_list,_wait_expand){
        var _wait_list = _task_basic_list.filter(function(item){
            return  !item.task_status;
        });
        if(_wait_list.length != 0){
            $scope.info.task_list.push({is_expand:_wait_expand,task_status:1,task_cn_status:'等待运行',exe_list:_wait_list});
        }
    };
    //过滤正在运行的任务
    var filterExecutingTask = function(_task_basic_list,_exe_expand,task_optype){
        var _exe_list = _task_basic_list.filter(function(item){
            return  (item.task_status && item.task_status != 4 && item.task_status != 5);
        });
        if(_exe_list.length != 0){
            $scope.info.task_list.unshift({is_expand: _exe_expand,task_status:2,task_cn_status:task_optype < 3 ? '正在运行':'',exe_list:_exe_list});
        }
    };
    //过滤运行结束的任务
    var filterFinishedTask = function(_task_basic_list,_exe_expand){
        var _finish_list = _task_basic_list.filter(function(item){
            return  item.task_status == 4 || item.task_status == 5;
        });
        if(_finish_list.length !=0){
            $scope.info.task_list.push({is_expand:_exe_expand,task_status:3,task_cn_status:'运行结束',exe_list : _finish_list});
        }
    };

    //根据任务状态过滤监控信息
    var filterTaskInfoByStatus = function(_task_basic_list,_tem_task_list,task_optype){
        $scope.info.task_list = [];
        _task_basic_list = _task_basic_list || [];
        _tem_task_list   = _tem_task_list   || [];
        var _tem_task_len = _tem_task_list.length;
        if(_task_basic_list.length == 0) return;
        var _wait_expand = false,_finish_expand = false,_exe_expand = _tem_task_len !=0 ? false : true;
        if(_tem_task_len != 0){
            for(var m = 0,len = _tem_task_list.length; m < len; m++){
                var _tem_task = _tem_task_list[m];
                if(_tem_task.task_status == 1){
                    _wait_expand =  _tem_task.is_expand;
                }else if(_tem_task.task_status == 2){
                    _exe_expand =  _tem_task.is_expand;
                }else if(_tem_task.task_status == 3){
                    _finish_expand  = _tem_task.is_expand;
                }
            }
        }
        //全部的/收藏的任务
        if(task_optype == 1 || task_optype == 2){
            //等待运行的
            filterWaitTask(_task_basic_list,_wait_expand,task_optype);
            //正在运行的
            filterExecutingTask(_task_basic_list,_exe_expand,task_optype);
            //运行结束的
            filterFinishedTask(_task_basic_list,_finish_expand,task_optype);
        }
        //特定的分类
        if(task_optype > 2){
            $scope.info.task_list[0] ={
                is_expand: false,
                task_status: task_optype == 3 ? 2:task_optype == 4 ? 1:3,
                task_cn_status: '',
                exe_list:_task_basic_list
            }
        }
    };
    //格式化执行耗时
    var formatTimeUsed = function(){
        if($scope.info.task_basic_list.length == 0) return;
        angular.forEach($scope.info.task_basic_list,function(data){
            //执行耗时
            data.time_used_cn = data.task_time_used ? CV.usedCnTime(data.task_time_used) :  '0秒';
        })
    };
   //根据操作类型获取任务基本信息
    var getTaskBasicByOptype = function(change_type){
        $scope.info.task_list = [];
        $scope.control.change_optype_loading = true;
        DispatchTaskMonitor.getTaskBasicInfoByOptype($scope.control.task_optype).then(function(data){
            $timeout(function(){
                $scope.info.task_basic_list = data.task_monitor_list ? data.task_monitor_list :[];
                //格式化执行耗时
                formatTimeUsed();
                //过滤任务基本信息
                filterTaskInfoByStatus($scope.info.task_basic_list,[],$scope.control.task_optype);
                //执行进度绘图
                updateProgress($scope.info.task_list);
                if(change_type){
                    $scope.data.tem_task_list = [];
                    statisticsInterval();
                    taskStatusInterval();
                }
                $timeout(function(){
                    $scope.control.change_optype_loading = false;
                },100);
            },0);
        },function(error){
           $scope.info.task_list = [];
            $scope.control.change_optype_loading = false;
        });
    };
    //获取所有节点基本信息
    var getAllNodeBasicInfo = function(){
        DispatchTaskMonitor.gatAllNodeBasicInfo($scope.info.search_info.key_word).then(function(data){
            $timeout(function(){
                $scope.control.node_err_msg = '';
                $scope.info.node_info.node_basic_list = data.node_basic_list ? data.node_basic_list : [];
                //格式化节点系统名/版本
                for(var i = 0;i<  $scope.info.node_info.node_basic_list.length; i++){
                    var _node =  $scope.info.node_info.node_basic_list[i];
                    _node.nodeBasicBean =  _node.nodeBasicBean ?  _node.nodeBasicBean : {node_soft_msg:{},node_hard_msg:{}};
                    _node.nodeBasicBean.node_soft_msg.op_system_name =  _node.nodeBasicBean.node_soft_msg.op_system ? _node.nodeBasicBean.node_soft_msg.op_system.split(' ')[0] :'';
                    _node.nodeBasicBean.node_soft_msg.op_system_version =  _node.nodeBasicBean.node_soft_msg.op_system ? _node.nodeBasicBean.node_soft_msg.op_system.split(' ')[1] :''
                }
                data.node_basic_list && getAllNodeUsedRateInfo();
            },0);
        },function(error){
            $scope.control.node_err_msg = error.message;
        });
    };
    //统计信息interval
    var statisticsInterval = function(){
        //统计信息30秒刷新
        _statistics_interval = $interval(function(){
            DispatchTaskMonitor.getTaskStatisticsInfo().then(function(data){
                $timeout(function(){
                    $scope.info.statistics_info = data.taskNumBean;
                    //更新统计信息-圆环
                    updateStatisticsCircle();
                },0);
            },function(error){

            });
        },30000)
    };
   //任务状态interval
    var taskStatusInterval = function(){
        _status_interval = $interval( function(){
            DispatchTaskMonitor.getTaskBasicInfoByOptype($scope.control.task_optype).then(function(data){
                $timeout(function(){
                    $scope.info.task_basic_list = data.task_monitor_list ? data.task_monitor_list :[];
                    //格式化执行耗时
                    formatTimeUsed();
                    //过滤任务基本信息
                    filterTaskInfoByStatus($scope.info.task_basic_list,$scope.data.tem_task_list,$scope.control.task_optype);
                    //执行进度绘图
                    updateProgress($scope.info.task_list);
                    $scope.control.monitor_error = false;
                },0);
            },function(error){
                $scope.control.monitor_error = true;
            });
        },5000);
    };

    //节点监控-占用率使用信息
    var getAllNodeUsedRateInfo = function () {
        DispatchTaskMonitor.monitorAllNodeUsedInfo($scope.info.search_info.key_word).then(function(data){
            $timeout(function(){
                var _node_used_list = data.node_used_list ? data.node_used_list : [];
                //基本信息和使用信息合并
                combineNodeInfo(_node_used_list);
                $scope.control.monitor_error = false;
            },0);
        },function(error){
            $scope.control.monitor_error = true;
        });
    };
    //节点监控-单个节点系统信息
    var getSingleNodeSysInfo = function (single_ip) {
        DispatchTaskMonitor.monitorOneNodeSysInfo(single_ip).then(function(data){
            $timeout(function(){
                $scope.info.node_info.single_node =angular.extend($scope.info.node_info.single_node,{
                    sys_info: data.sys_info
                }) ;
            },0);
        },function(error){
        });
    };
    //节点监控-单个节点进程信息
    var getSingleNodeUsedRateInfo = function (single_ip,node_basic_info) {
        DispatchTaskMonitor.monitorOneNodeProgressInfo(single_ip).then(function(data){
            $timeout(function(){
                //进程状态（progerss_status） 1运行 2 3 睡眠 4暂停 5僵死
                $scope.info.node_info.single_node =angular.extend($scope.info.node_info.single_node,{
                    basic_info:node_basic_info,
                    process_list: data.process_list ? data.process_list : []
                }) ;
            },0);
        },function(error){
        });
    };
    //节点监控-节点基本信息/使用信息合并
    var combineNodeInfo = function(node_used_list){
        for(var i =0; i < node_used_list.length; i++){
            var _used = node_used_list[i];
            for(var j = 0; j < $scope.info.node_info.node_basic_list.length; j++){
                var _node = $scope.info.node_info.node_basic_list[j];
                if(_used.node_soc_ip === _node.node_soc_ip){
                    _node.used_info = _used;
                }
            }
        }
    };
    //节点监控-占用率进度interval
    var nodeUsedRateInterval = function(){
        getAllNodeUsedRateInfo();
        _node_interval = $interval(function(){
            getAllNodeUsedRateInfo();
        },5000)
    };
    //节点监控-根据ip查找索引
    var findNodeIndexByIp = function(){
        var index = -1;
        for(var i = 0; i < $scope.info.node_info.node_basic_list.length; i++){
            var _node = $scope.info.node_info.node_basic_list[i];
            if(_node.node_soc_ip === $scope.info.search_info.node_ip){
                index = i;
            }
        }
        return index;
    };
    //初始化
    var init = function(){
        //数据加载
        $scope.control.loading = true;
        //获取任务统计信息
        DispatchTaskMonitor.getTaskStatisticsInfo().then(function(data){
            $timeout(function(){
                $scope.control.loading = false;
                $scope.info.statistics_info = data.taskNumBean;
                //更新统计信息-圆环
                updateStatisticsCircle();

                //更新统计信息
                statisticsInterval();

                //任务--获取所有任务基本信息
                getTaskBasicByOptype();

                //任务--监控任务（状态）
                taskStatusInterval();

                //节点--获取节点基本信息
                $timeout(function(){
                    getAllNodeBasicInfo();
                },2000);

                //初始化tooltip
                $timeout(function(){
                    $("[data-toggle='tooltip']").tooltip();
                },500);
            },0);
        },function(error){
            $scope.control.loading = false;
            $scope.control.err_msg = error.message;
            if(_status_interval) $interval.cancel(_status_interval);
            Modal.confirm($scope.control.err_msg + " [ 确认退出 ] ?").then(function(){
                $window.location.href='../../../../login.html'
            })
        });
    };

    /**
     * 切换任务/节点
     * **/
    $scope.changeTask = function(flag){
        if($scope.control.change_flag == flag) return;
        $scope.control.change_flag = flag;
        $scope.info.search_info.is_search = false;
        $scope.info.search_info.key_word = '';
        var _last_index = $scope.control.active_node_i;
        if($scope.control.change_flag == 1) {
            $scope.control.view_node =  false;
            statisticsInterval(); //启动统计信息监控(任务总数/节点/应用)
            taskStatusInterval();  //启动任务状态监控
            $interval.cancel(_node_interval);//停止节点使用率监控
            if(_last_index != -1){
                $interval.cancel($scope.info.node_info.node_basic_list[_last_index].one_node_timer);
            }
            //初始化tooltip
            $timeout(function(){
                $("[data-toggle='tooltip']").tooltip();
            },100);
        }else{
            $interval.cancel(_statistics_interval);//停止统计信息监控
            $interval.cancel(_status_interval);//停止任务状态监控
            nodeUsedRateInterval();//启动-节点硬件使用率监控
            if($scope.control.node_err_msg || $scope.info.node_info.node_basic_list.length === 0){
                getAllNodeBasicInfo();
            }
        }
    };

    /**
     *任务
     * */
    //切换任务操作类型
    $scope.changeTaskOpType = function(op_type){
        var _last_type = $scope.control.task_optype;
        if($scope.control.task_optype == op_type) return;
        $('.task-opicon-'+ _last_type ).css({'background-color':'transparent'});   //上一个恢复默认样式
        $('.task-opicon-'+ op_type).css({'background-color':'#0080FF'});           //当前激活
        $scope.control.task_optype  = op_type;                                    //赋当前操作类型
        $interval.cancel(_statistics_interval);                                    //切换时清除统计信息定时
        $interval.cancel(_status_interval);                                       //切换时清除任务状态定时
        getTaskBasicByOptype(op_type);                                            //根据操作类型获取任务基本信息
    };
    //记录展开收起状态
    $scope.recordExpandStatus = function(step,parent_index){
        if($scope.info.task_list.length == 0) return false;
        step.is_expand =  !step.is_expand;     //展开收起标志
        var _curr_expand_status = step.is_expand ? step.is_expand : false;
        var _curr_task_status = step.task_status;
        var _curr_step = {task_status : _curr_task_status, is_expand : _curr_expand_status};
        var _is_exist = false,index = 0,_div_ele = $("#row-container-" + parent_index);
        if(_div_ele.is(':animated')) return;//元素尚在动画中（避免卡顿）
        for(var i = 0; i < $scope.data.tem_task_list.length; i ++) {
            var _tem_task  =  $scope.data.tem_task_list[i];
            if(_tem_task.task_status == _curr_step.task_status){
                _is_exist = true;
                index = i;
                break;
            }
        }
        if(!_is_exist) {
            $scope.data.tem_task_list.push(_curr_step)
        }else{
            $scope.data.tem_task_list[index].is_expand = _curr_expand_status;
        }
        //展开收起
        if(step.is_expand){
            //从收起切换为展开，高度为初始高度
           _div_ele.animate({'height':step.init_height +'px'}, 300);
        }else{
            //从展开切换为收起，高度为一行高度
            _div_ele.animate({'height':120 +'px'}, 200);
        }
    };
    //任务初始化一行的高度
    $scope.taskHeight = function(task,index){
        if($scope.control.task_optype > 2) return {'height':'auto'};
        var _ul_ele = $("#mointor-task-"+ index),
            _div_ele = _ul_ele.parent('div'),
            _ul_height = _ul_ele.height();
        task.show_toggle_btn = _ul_height > 125 ? true : false;
        task.init_height = _ul_height; //初始高度
        if(task.is_expand){
            if(_div_ele.is(':animated')) return;//元素尚在动画中（避免卡顿）
            return {'height':'auto'};
        }
    };
    //查看任务运行信息
    $scope.viewTaskProgress = function(){
        Modal.viewTaskProgressInfo()
    };


    /**
     *节点
     * */
    //系统类型图标
    $scope.operationSysIcon = function(opsys_type,bgSize){
        var _bg_position = {
            'background-size':bgSize,
            'background-position-x':'0px'
        };
        switch (opsys_type){
            case 1 : _bg_position['background-position-y'] = '0px'; break;   //linux
            case 2 : _bg_position['background-position-y'] = '-140px'; break; //windows
            case 3 : _bg_position['background-position-y'] = '-120px'; break; //ios
            case 4 : _bg_position['background-position-y'] = '-159px'; break; //未知
            case 5 : _bg_position['background-position-y'] = '-80px'; break;  //aix
            case 6 : _bg_position['background-position-y'] = '-100px'; break; //hp-ux
            case 7 : _bg_position['background-position-y'] = '-20px'; break;  //freebsd
            case 8 : _bg_position['background-position-y'] = '-60px'; break;  //sco
            case 9 : _bg_position['background-position-y'] = '-40px'; break;  //solaris
            default:_bg_position['background-position-y'] = '-159px'; break;  //未知
        }
        return _bg_position;
    };
    //模糊搜索节点
    $scope.searchNodeByKeyword  = function(){
        $scope.info.search_info.is_search = true;
        $scope.control.active_node_i = -1;
        getAllNodeBasicInfo();
    };
    //根据IP精确搜索
    $scope.searchNodeByIp = function(event){
        //此正则待优化
        var reg = new RegExp("^(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|[1-9])\\."
                              +"(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\."
                              +"(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\."
                              +"(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)$");
        $timeout(function () {
            if(!$scope.info.search_info.node_ip){
                Modal.alert('请输入ip');
                return false;
            }
            if(!reg.test($scope.info.search_info.node_ip)){
                Modal.alert('请重新输入ip');
                return false;
            }
            var _index = findNodeIndexByIp();
            if(_index === -1){
                Modal.alert('暂无搜索结果');
                return false;
            }else if(_index !== $scope.control.active_node_i){
                $scope.tabOne(_index);
            }
        },0);
    };
    //点击单个tab
    $scope.tabOne = function(index) {
        changeTab(index);
        //当前节点对象
        var _curr_node = $scope.info.node_info.node_basic_list[index];
        var _curr_ip = _curr_node.node_soc_ip;
        //监控单个节点信息
        $scope.info.node_info.single_node.basic_info = _curr_node;
        getSingleNodeSysInfo(_curr_ip);
        getSingleNodeUsedRateInfo(_curr_ip,_curr_node);
        _curr_node.one_node_timer = $interval(function(){
            getSingleNodeSysInfo(_curr_ip);
            getSingleNodeUsedRateInfo(_curr_ip,_curr_node);
        },5000);
    };
    //查看节点
    $scope.viewNode = function(index){
        $scope.control.view_node = true;
        $scope.info.search_info.is_search = false;
        $scope.tabOne(index);
        if(_node_interval){
            $interval.cancel(_node_interval);//停止节点使用率监控
        }
    };
    //关闭节点查看
    $scope.closeNodeView = function(){
        $scope.control.view_node = false;
        //关闭单个节点监控
        var _active_index = $scope.control.active_node_i;
        if($scope.info.node_info.node_basic_list[_active_index].one_node_timer){
            $interval.cancel($scope.info.node_info.node_basic_list[_active_index].one_node_timer);
        }
        //启动所有节点监控
        nodeUsedRateInterval();
    };

    //清除动画
    $scope.clearAnimate = function(class_name){
        //解决ie下css3动画不停
        $("." + class_name).css('animate','none');
    };
    //返回
    $scope.back = function(){
       $window.history.back();
        sessionStorage.removeItem("com_data");
    };
    init();
}]);