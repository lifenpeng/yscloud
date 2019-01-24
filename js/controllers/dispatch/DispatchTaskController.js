var task = angular.module('dispatchTaskController', []);

//任务列表控制器
task.controller('taskListCtrl',['$scope', '$stateParams', '$timeout', '$state', '$location', 'FlowType', 'ExecuteType', 'User', 'Modal', function($scope, $stateParams, $timeout, $state, $location, FlowType, ExecuteType, User, Modal){
    var _url = $location.absUrl(); //获取浏览器当前的url
    var _max_date = new Date();//日期最大值
    $scope.control = {
        active_tab : _url.slice(_url.lastIndexOf('/')+1), //获取当前显示的tab
        open_senior_flag:false,      //打开高级搜索
        search_keyword  :'',
        datepicker_open : false,    //日历控件的展开收起
    }
    $scope.data = {
        user_list:[],   //用户列表
        task_type_list : FlowType,    //任务类型列表
        execute_type_list : ExecuteType,    //执行类型列表
    };
    $scope.info = { //高级搜索对象
        key_word:"",    //关键字
        start_date:"",  //开始日期
        end_date:"",    //结束日期
        exe_user_id:"", //执行用户id
        exe_type:"",    //执行类型
        task_type:"",   //任务类型
        task_name:""    //任务名
    }
    //切换tab页
    $scope.switchTab = function(tab){
        $scope.control.active_tab = tab;
        $state.go("dispatch_task_list."+tab);
    }
    var init = function () {
        //设置日期可选最大值
        _max_date.setDate((_max_date.getDate()));
        $scope.maxDate = _max_date;
        //获取所有用户
        User.getAllUserCanExec().then(function(data){
            $scope.data.user_list = data.user_dept_list ? data.user_dept_list :[];
        },function(error){
            Modal.alert(error.message)
        })
    };

    //显示日期控件
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.control.datepicker_open = true;
    };
    //选择日期
    $scope.selectDate = function(){
        if ($scope.info.startDate != "" && $scope.info.endDate != ""){
            $scope.control.datepicker_open = false;
        }
    };
    init();
}]);
//任务模板控制器
task.controller('taskCommonCtrl',["$scope",function($scope){
    $scope.control = {
        basic_info_expand : false //默认收起
    }
}]);
//任务基本信息控制器
task.controller('taskBasicInfoCtrl',["$scope", "$rootScope", "$stateParams", "$timeout", "$state", "Flow", "FlowType", "OpTaskExeStatus", "Modal", "CV",function($scope, $rootScope, $stateParams, $timeout, $state, Flow, FlowType, OpTaskExeStatus, Modal , CV){
    //任务ID
    var _task_id = $stateParams.task_id || '';
    //任务信息
    $scope.info = {
        flow_id:'',                 //流程编号
        task_cn_name:'',            //任务中文名
        task_type_cn:'',            //任务类型中文名
        exe_types:0,                //执行方式
        exe_user_name:'',           //执行人
        task_status:0,              //任务状态
    };
    var init = function () {
        //查看任务信息
        Flow.viewTaskDetail(_task_id).then(function (data){
            $scope.info.task_status       =  data.taskBean.sdtask_status;
            $scope.info.task_state_cn     =  CV.findValue(data.taskBean.sdtask_status,OpTaskExeStatus);
            $scope.info.version_id        =  data.taskBean.sdversion_id ? data.taskBean.sdversion_id : '';
            $scope.info.task_id           =  data.taskBean.sdtask_id;
            $scope.info.task_cn_name      =  data.taskBean.sdtask_cn_name;
            $scope.info.end_bk_datetime   =  data.taskBean.end_bk_datetime ? data.taskBean.end_bk_datetime.substring(data.taskBean.end_bk_datetime.lastIndexOf('.'),-1) :'';
            $scope.info.start_bk_datetime =  data.taskBean.start_bk_datetime ? data.taskBean.start_bk_datetime.substring(data.taskBean.start_bk_datetime.lastIndexOf('.'),-1) :'';
            $scope.info.exe_types         =  data.taskBean.sddispatch_type ? data.taskBean.sddispatch_type : 0;
            $scope.info.time_used         =  data.taskBean.time_used ? CV.usedCnTime(data.taskBean.time_used) :'--';
            $scope.info.exe_user_name     =  data.taskBean.exe_user_name ? data.taskBean.exe_user_name : data.taskBean.exe_user_id ? data.taskBean.exe_user_id:'--';

            //任务类型转中文
            if(data.taskBean.sdflow_type){
                $scope.info.task_type =  data.taskBean.sdflow_type.split(',');
                angular.forEach($scope.info.task_type,function(data){
                    $scope.info.task_type_cn += CV.findValue(data,FlowType) + ' ';
                });
            }
        },function(error){
            Modal.alert(error.message);
            $state.go('dispatch_task_list.cur_task');
        });
    };

    init();
}]);
//任务执行控制器
task.controller('taskExecuteCtrl',["$scope", "$rootScope", "$stateParams", "$timeout", "$interval", "$state", "Flow", "FlowType", "OpTaskExeStatus", "Modal", "CV",function($scope, $rootScope, $stateParams, $timeout, $interval, $state, Flow, FlowType, OpTaskExeStatus, Modal , CV){
    /**
     任务状态 1执行中/2--/3异常/4正常完成/5异常完成/6重试中/7暂停/8手动等待,9暂停等待,10失败,11排队中
     作业状态 1未执行/2执行中/3成功/4异常/5跳过/6待重试/7失败/
     */
    //任务ID
    var _task_id = $stateParams.task_id || '';
    //监控定时器
    var _timer,_retry_monitor,_task_status_interval,_skip_monitor,_queuing_monitor;
    //开始作业
    var _start_job,_end_job,_input_param_flag,is_start_exe;
    //页面控制
    angular.extend($scope.control,{
        one_exec_btn: false,        //一键执行按钮是否可点击
        step_exec_btn :false,       //单步执行是否可点击
        close_task  :false,         //非执行中可关闭
        middle_stop : false,        //中止按钮-执行中的可点击
        suspend_task:false,         //暂停按钮-一键和自动执行中的可点击
        one_click   :false,         //一键执行
        clear_click_event:false,    //清除Diagram点击事件
    });
    //任务信息
    $scope.info = {
        flow_id:'',                 //流程编号
        exe_types:0,                //执行方式
        exe_start_datetime:'',      //执行开始时间
        exe_end_datetime:'',        //执行开始时间
        flow_job_list:[],           //流程作业列表
        task_status:0,              //任务状态
        job_id_list:[],             //作业编号列表
        exe_log_path:'',            //执行日志
        flow_diagram_info:{},       //流程图信息
    };
    //排队中处理
    var queuingMonitor = function(){
        if($scope.info.job_id_list.length === 0) return;
        var _job_id_list = $scope.info.job_id_list.slice(1);
        _queuing_monitor = $interval(function () {
            Flow.monitorJobStatus(_task_id,_job_id_list).then(function (data){
                $scope.info.task_status       =  data.task_status;
                $scope.info.task_state_cn     =  CV.findValue(data.task_status,OpTaskExeStatus);
                if($scope.info.task_status !== 11){
                    $interval.cancel(_queuing_monitor); //取消排队监控
                    if($scope.info.task_status === 8){
                        $scope.control.one_exec_btn  = false;
                        $scope.control.step_exec_btn = false;
                    }else{
                        $scope.control.one_exec_btn  = true;
                        $scope.control.step_exec_btn = true;
                        monitorInterval(-1);
                    }
                }
            },function(error){

            });
        },2000)
    };
    //检查任务是否开始执行
    var checkExe = function(task_status,task_status_list){
        task_status_list = task_status_list || [];
        return task_status === 1 ? true : task_status_list.some(function(item){
            return item.job_status === 2;
        });
    };
    //输入任务开始参数
    var inputStartParam = function(meddle_type,_start_job){
        var _param_list = _start_job.sd_job_bean.input || [];
        var _job_id     = _start_job.sd_job_bean.job_id || "1";
        var _curr_step_index = meddle_type == 6 ? 0: -1;
        var _is_single_step  =  meddle_type == 6;
        Modal.inputStartJobParams(_param_list).then(function(param_list){
            if(param_list){
                //保存输入参数
                Flow.saveTaskInputParam(_task_id,_job_id,param_list).then(function(data){
                    _input_param_flag = 2;
                    if(meddle_type == 6) $scope.info.job_id_list = [_job_id];
                    $scope.control.one_exec_btn  = true;
                    $scope.control.step_exec_btn = true;
                    $scope.control.close_task    = false;
                    $scope.control.one_click     = meddle_type != 6;
                    //干预执行
                    Flow.meddleTaskExecute(_task_id,meddle_type).then(function(data){
                        $timeout(function(){
                            console.log('干预成功');
                        },0);
                    },function(error){
                        Modal.alert(error.message);
                        $scope.control.one_exec_btn  = false;
                        $scope.control.step_exec_btn = false;
                        $scope.control.middle_stop   = false;
                        $scope.control.suspend_task  = false;
                        if(_timer) $interval.cancel(_timer);
                    });
                    monitorSrv();
                    monitorInterval(_curr_step_index,false,_is_single_step);
                },function(error){
                    Modal.alert(error.message);
                });
            }
        });
    };
    //开始和结束作业执行中不可中止
    var startOrEndJobExe = function(){
        var _is_executing = false;
        var _start_status = _start_job.sd_job_bean.job_status || 0;
        var _end_status   =  _end_job.sd_job_bean.job_status || 0;
        if(_start_status === 2 || _end_status === 2) _is_executing = true;
        return _is_executing;
    };
    //任务中止后-检查是否存在执行中的作业
    var middleStopCheckJobExe = function(job_status_list){
        var _status_list = job_status_list || [];
        return _status_list.some(function(item){return item.job_status === 2;});
    };
    //任务干预服务
    var taskMeddleSrv = function(meddle_type,_last_task_cn_status){
        Flow.meddleTaskExecute(_task_id,meddle_type).then(function(data){
        },function(error){
            Modal.alert(error.message);
            $scope.control.close_task = true;
            $interval.cancel(_task_status_interval);
            $scope.info.task_state_cn = _last_task_cn_status;
        });
    };
    //更新任务状态（1关闭 2暂停 5中止 8继续执行）
    var updateTaskStatus = function(meddle_type){
        $scope.info.job_id_list = findUndoJob();
        if($scope.info.job_id_list.length === 0) return;
        if(_task_status_interval) $interval.cancel(_task_status_interval);

        _task_status_interval = $interval(function(){
            Flow.monitorJobStatus(_task_id,$scope.info.job_id_list).then(function (data){
                $scope.info.task_status  =  data.task_status;
                var _job_status_list =  data.job_status_list ?  data.job_status_list : [];
                var _node_len        =  $scope.info.flow_diagram_info.nodeDataArray.length;
                $rootScope.dispatch_task_status = 0;//正在处理

                //状态转换
                if(_node_len > 0){
                    for(var i = 0; i < _job_status_list.length; i++){
                        var _status = _job_status_list[i];
                        for(var j = 0; j < _node_len; j++){
                            var _job = $scope.info.flow_diagram_info.nodeDataArray[j];
                            if(_job.type == 3) continue;
                            if(_job.sd_job_bean.job_id == _status.job_id){
                                _job.sd_job_bean.job_status = _status.job_status ? _status.job_status : 1;
                            }
                        }
                    }
                }

                if(meddle_type == 1){
                    if($scope.info.task_status == 4 || $scope.info.task_status ==5){
                        $interval.cancel(_task_status_interval);
                        $scope.control.close_task = false;
                        queryEndTime();//查询结束时间
                        Modal.alert("任务关闭完成");
                        $scope.info.task_state_cn =  CV.findValue($scope.info.task_status,OpTaskExeStatus);
                        $rootScope.dispatch_task_status       =  $scope.info.task_status;//全局任务状态
                    }
                }else if(meddle_type == 2 || meddle_type == 5){
                    if($scope.info.task_status == 7 || $scope.info.task_status == 3 || $scope.info.task_status == 10){
                        $scope.info.task_state_cn =  CV.findValue($scope.info.task_status,OpTaskExeStatus);
                        $rootScope.dispatch_task_status       =  $scope.info.task_status;//全局任务状态
                        if($scope.info.task_status == 3 || $scope.info.task_status == 10){
                            $scope.control.close_task = true;
                            if(meddle_type == 2){
                                $interval.cancel(_task_status_interval);
                            }else if(!middleStopCheckJobExe(_job_status_list)){
                                $interval.cancel(_task_status_interval);
                            }
                        }else{
                            $scope.control.middle_stop   = false;
                            $scope.control.one_exec_btn  = false;
                            $scope.control.step_exec_btn = $scope.info.exe_types == 2;

                            //任务暂停后--等单步作业执行完成停止监控
                            if(cancelStatusMonitor()){
                                $interval.cancel(_task_status_interval);
                                $scope.control.close_task = true;
                                Modal.alert("任务已暂停");
                            }
                        }
                    }else if($scope.info.task_status == 8){ //手动等待
                        if(!middleStopCheckJobExe(_job_status_list)){
                            $interval.cancel(_task_status_interval);
                            $scope.control.one_exec_btn     = false;
                            $scope.control.step_exec_btn    = false;
                            $scope.info.task_state_cn = CV.findValue($scope.info.task_status,OpTaskExeStatus);
                            $rootScope.dispatch_task_status       = $scope.info.task_status;//全局任务状态
                        }
                    }
                }
                //正在关闭的不可关闭
                $scope.control.close_task = meddle_type != 1;
            },function(error){

            });
        },3000);
    };
    //执行进度interval
    var progressInterval = function(obj){
        if(obj.timer) $interval.cancel(obj.timer);
        if(obj.width && obj.width >= 110) return;
        obj.timer = $interval(function(){
            obj.width += ~~(Math.random() * 8); //0-7之间随机数
        },1000);
    };
    //监控服务
    var monitorSrv = function(step_id,is_continue,is_single_step,is_init){
        if($scope.info.job_id_list.length === 0) return;
        //监控作业状态信息
        Flow.monitorJobStatus(_task_id,$scope.info.job_id_list).then(function (data){
            $scope.info.task_status    =  data.task_status;
            $scope.info.task_state_cn  =  CV.findValue(data.task_status,OpTaskExeStatus);
            var _task_status       =  $scope.info.task_status,_task_suspend = true;
            var _job_status_list   =  data.job_status_list ?  data.job_status_list : [];

            //任务暂停时的处理
            if(is_continue && _task_status == 7){
                _task_status = $scope.info.exe_types == 2 ?  1 : 8;
                $scope.info.task_state_cn = $scope.info.exe_types == 2 ? '执行中':'手动等待';
            }

            if((!is_start_exe && is_single_step) || (!is_start_exe && is_continue)){
                is_start_exe = checkExe(_task_status,_job_status_list);
            }else{
                if(is_continue) _task_status  =  $scope.info.task_status;
                var _node_data_len = $scope.info.flow_diagram_info.nodeDataArray.length;
                if(_node_data_len > 0){
                    //状态转换
                    for(var i = 0; i < _job_status_list.length; i++){
                        var _status = _job_status_list[i];
                        for(var j = 0; j < _node_data_len; j++){
                            var _job = $scope.info.flow_diagram_info.nodeDataArray[j];
                            if(_job.type == 3) continue;
                            if(_job.sd_job_bean.job_id == _status.job_id){
                                _job.sd_job_bean.job_status = _status.job_status ? _status.job_status : 1;
                                _job.sd_job_bean.width =  _job.sd_job_bean.width ?  _job.sd_job_bean.width:0;
                                if(_job.sd_job_bean.job_status == 2){
                                    progressInterval(_job.sd_job_bean);
                                    if(_job.sd_job_bean.width >= 100){
                                        _job.sd_job_bean.width = 110;
                                        if(_job.sd_job_bean.timer) $interval.cancel(_job.sd_job_bean.timer);
                                    }
                                }else if(_job.sd_job_bean.job_status == 3 || _job.sd_job_bean.job_status == 5){
                                    _job.sd_job_bean.width = 120;
                                    if(_job.sd_job_bean.timer) $interval.cancel(_job.sd_job_bean.timer);
                                }else if(_job.sd_job_bean.job_status == 4 || _job.sd_job_bean.job_status == 7){
                                    _job.sd_job_bean.width = _job.sd_job_bean.width ? _job.sd_job_bean.width : 10;
                                    if(_job.sd_job_bean.timer) $interval.cancel(_job.sd_job_bean.timer);
                                }
                                if(_job.sd_job_bean.job_status == 2 && _task_status == 7){
                                    _task_suspend = false;
                                }
                            }
                        }
                    }
                    if($scope.info.flow_diagram_info.nodeDataArray[0].sd_job_bean.job_status == 1){
                        $scope.control.close_task = true;
                    }
                }

                //自动任务
                if($scope.info.exe_types == 2){
                    $scope.control.step_exec_btn = true;
                    $scope.control.one_exec_btn = true;
                }
                //暂停的任务
                if(_task_status == 7){
                    $scope.control.one_exec_btn = false;
                    $scope.control.step_exec_btn = $scope.info.exe_types == 2;
                    if(_task_suspend){
                        if(_timer) $interval.cancel(_timer);
                        if(!is_init){
                            $scope.control.close_task = true; //暂停可关闭
                            $scope.info.task_state_cn = "任务暂停";
                            Modal.alert("任务已暂停");
                        }
                    }
                }
                //任务完成
                if(_task_status ==4 || _task_status == 5){
                    $scope.control.close_task = false;
                    if(_timer) $interval.cancel(_timer);
                    queryEndTime();
                }
                //(执行按钮)执行按钮不可点击
                if(_task_status != 7 && _task_status != 8){
                    $scope.control.one_exec_btn = true;
                    $scope.control.step_exec_btn = true;
                }
                //(暂停按钮)一键或自动任务--状态为执行中的可暂停
                $scope.control.suspend_task = ($scope.info.exe_types == 2 || $scope.control.one_click ) && (_task_status == 1 || _task_status == 6);
                //(中止按钮)执行中的可中止(非开始和结束作业)
                $scope.control.middle_stop = ((_task_status == 1 || _task_status == 6) && !startOrEndJobExe());
                //(关闭按钮)执行中/执行完成不可关闭
                $scope.control.close_task = (_task_status == 3 || _task_status > 6);
            }

            //单步执行结束
            if(is_single_step && is_start_exe && (_task_status == 7 || _task_status == 8)){
                $scope.control.one_exec_btn  = false;
                $scope.control.step_exec_btn = false;
                $interval.cancel(_timer);
            }

            //全局任务状态
            $rootScope.dispatch_task_status =  $scope.info.task_status;
        },function(error){

        });
    };
    //定时监控(is_continue 是否继续执行)
    var monitorInterval = function(step_id,is_continue,is_single_step){
        if(_timer) $interval.cancel(_timer);
        if(_retry_monitor)  $interval.cancel(_retry_monitor);
        if(step_id < 0) $scope.info.job_id_list = findUndoJob();
        if(is_single_step || is_continue) is_start_exe = false;

        _timer = $interval(function(){
            monitorSrv(step_id,is_continue,is_single_step);
        },4000);
    };
    //任务暂停后停止监控
    var cancelStatusMonitor = function(){
        var _step_suc = true,len = $scope.info.flow_diagram_info.nodeDataArray.length;
        for(var i = 0; i < len; i++){
            var _job = $scope.info.flow_diagram_info.nodeDataArray[i];
            if(_job.type == 3) continue;
            if(_job.sd_job_bean.job_status && _job.sd_job_bean.job_status == 2){
                _step_suc = false;
            }
        }
        return _step_suc;
    };
    //单个作业跳过
    var skipOneStep = function(job_index,job_list){
        clearExeStatus(job_index);
        $scope.info.task_state_cn = '跳过等待';
        $scope.control.step_exec_btn    = true;
        $scope.control.one_exec_btn     = true;
        Flow.skipOneStepJob(_task_id,job_list).then(function(data){
            $timeout(function(){
                stepSkipMonitor(job_index)
            },0);
        },function(error){
            Modal.alert(error.message);
            if(_timer) $interval.cancel(_timer);
            $scope.info.task_state_cn = '执行异常';
        });
    };
    //单个跳过监控(is_complete 是否强制完成)
    var stepSkipMonitor = function(job_index,is_complete){
        if(_timer)  $interval.cancel(_timer);
        if(_skip_monitor)  $interval.cancel(_skip_monitor);
        if(_retry_monitor)  $interval.cancel(_retry_monitor);
        if(!job_index) return;
        var _node_list = $scope.info.flow_diagram_info.nodeDataArray;
        var _single_job = _node_list[job_index].sd_job_bean;
        var _one_skip_count = 0,_one_complete_count = 0;

        _skip_monitor = $interval(function(){
            if($scope.info.job_id_list.length === 0) return;
            //监控作业状态信息
            Flow.monitorJobStatus(_task_id,[_single_job.job_id]).then(function (data){
                var _task_status = data.task_status;
                var _job_status_list   = data.job_status_list ?  data.job_status_list : [];
                $scope.info.task_status =  data.task_status;

                //状态转换
                for(var i = 0; i < _job_status_list.length; i++){
                    var _status = _job_status_list[i];
                    if(_single_job.job_id == _status.job_id){
                        if(((_status.job_status == 4 || _status.job_status == 7) && _node_list[job_index].type != 4) || (is_complete && _status.job_status ==5)){
                            _single_job.job_status = 2; //跳过等待/完成等待暂时置为执行中
                        }else{
                            _single_job.job_status = _status.job_status ? _status.job_status :1
                        }
                        break;
                    }
                }

                //单个跳过完成
                if(_single_job.job_status == 5 && !is_complete){
                    _one_skip_count++;
                    if(_one_skip_count === 1) Modal.alert("[ "+ _single_job.sdwork_cn_name + " ] 跳过完成");
                }

                //单个强制完成
                if(_single_job.job_status == 3 && is_complete){
                    _one_complete_count++;
                    if(_one_complete_count === 1){
                        _single_job.width = 120;
                        Modal.alert("[ "+ _single_job.sdwork_cn_name + " ] 完成");
                    }
                }

                //单个操作完成
                if(_one_skip_count || _one_complete_count){
                    $interval.cancel(_skip_monitor);
                    //手动单步
                    if($scope.info.exe_types == 1 && !$scope.control.one_click){
                        if(_task_status != 5 && _task_status != 4 && _task_status != 7){
                            $scope.control.one_exec_btn = false;
                            $scope.control.step_exec_btn = false;
                        }
                    }else{
                        monitorInterval(-1);
                    }
                }

                //(关闭按钮)执行中不可关闭
                $scope.control.close_task = ($scope.info.task_status == 3 || $scope.info.task_status > 6);
                //条件作业
                if(_node_list[job_index].type === 4) $scope.info.task_status = _task_status;
                //全局任务状态
                $rootScope.dispatch_task_status        =  $scope.info.task_status;
                $scope.info.task_state_cn  =  CV.findValue( $scope.info.task_status,OpTaskExeStatus);
            },function(error){

            });
        },3000);
    };
    //清空执行状态（meddle_type:10重做，11重试，12重试链, 16强制完成)
    var clearExeStatus = function(job_index,meddle_type){
        var _node_list = $scope.info.flow_diagram_info.nodeDataArray;
        var _curr_job  = _node_list[job_index].sd_job_bean;
        if(!_curr_job) return;

        if(meddle_type){
            if(meddle_type != 12){
                _curr_job.job_status = 2; //执行中
                _curr_job.width      = 5;
            }
        }else if(_node_list[job_index].type !== 4){
            _curr_job.job_status = 2;     //跳过
        }
    };
    //预期是否已经开始重试
    var startRetry = function(single_job,task_status,job_status_list,meddle_type){
        var _start_flag;//是否存在重试链
        for(var i = 0; i < job_status_list.length; i++){
            var _status = job_status_list[i];
            if(meddle_type == 10){
                if(single_job.job_id == _status.job_id && _status.job_status == 2){
                    _start_flag = true;
                    break;
                }
            }else if(meddle_type == 11){
                if(single_job.job_id == _status.job_id && _status.job_status == 2 && (task_status == 6 || task_status == 1)){
                    _start_flag = true;
                    break;
                }
            }else if(meddle_type == 12){
                var _flow_list = $scope.info.flow_diagram_info.nodeDataArray;
                if(_status.job_status == 6 || _status.job_status == 2){
                    for(var j = 0; j < _flow_list.length; j++){
                        var _job = _flow_list[j];
                        if(_job.type ==3) continue;
                        if(_job.sd_job_bean.job_id  == _status.job_id){
                            _start_flag = true;
                            _job.sd_job_bean.job_status = _status.job_status != 2 ? 6 : 2; //待重试
                            break;
                        }
                    }
                }
                if(_start_flag) break;
            }
        }
        return _start_flag;
    };
    //重试监控(meddle_type:10重做 11单个重试 12链式)
    var retryMonitor = function(job_index,meddle_type){
        if(_timer) $interval.cancel(_timer);
        if(_retry_monitor) $interval.cancel(_retry_monitor);
        var _curr_job =  $scope.info.flow_diagram_info.nodeDataArray[job_index].sd_job_bean;
        var is_start_retry,_sync_task_status = 0;

        _retry_monitor = $interval(function(){
            if($scope.info.job_id_list.length === 0) return;
            //监控作业状态信息
            Flow.monitorJobStatus(_task_id,$scope.info.job_id_list).then(function (data){
                var _task_status     = data.task_status;
                var _job_status_list = data.job_status_list ?  data.job_status_list : [];
                if(!is_start_retry){
                    is_start_retry = startRetry(_curr_job,_task_status,_job_status_list,meddle_type);
                }
                //开始重试
                if(is_start_retry){
                    //状态转换
                    for(var i = 0; i < _job_status_list.length; i++){
                        var _status = _job_status_list[i];
                        for(var j = 0; j < $scope.info.flow_diagram_info.nodeDataArray.length; j++){
                            var _node = $scope.info.flow_diagram_info.nodeDataArray[j];
                            if(_node.type == 3) continue;
                            var _job = _node.sd_job_bean;
                            if(_job.job_id == _status.job_id){
                                _job.job_status = _status.job_status ? _status.job_status : 1;
                                _job.width =  _job.width ?  _job.width:0;
                                if(_job.job_status == 2){
                                    progressInterval(_job);
                                    if(_job.width >= 100){
                                        if(_job.timer) $interval.cancel(_job.timer);
                                        _job.width = 110;
                                    }
                                }else if(_job.job_status == 3 || _job.job_status == 5){
                                    if(_job.timer) $interval.cancel(_job.timer);
                                    _job.width = 120;
                                } else if(_job.job_status == 4 || _job.job_status == 7){
                                    if(_job.timer) $interval.cancel(_job.timer);
                                    _job.width = _job.width ? _job.width : 10;
                                    if(_task_status == 3) $scope.control.close_task = true;
                                }
                            }
                        }
                    }

                    if(meddle_type == 10 && (_curr_job.job_status == 4 || _curr_job.job_status == 7)){
                        _sync_task_status++;
                        if(_sync_task_status == 1){
                            taskMeddleSrv(15,$scope.info.task_state_cn);
                        }
                    }

                    if(meddle_type == 12){
                        $scope.control.middle_stop = (_task_status == 1 || _task_status == 6);
                    }

                    //任务状态
                    $scope.info.task_status = _task_status;
                    $scope.info.task_state_cn  =  CV.findValue(_task_status,OpTaskExeStatus);
                    if($scope.info.task_status == 7 && meddle_type == 10){
                        $scope.info.task_state_cn = '重试等待';
                    }

                    //重做中
                    if(_curr_job.job_status == 2 && (meddle_type == 10 || meddle_type == 11)){
                        $scope.info.task_state_cn = meddle_type == 10 ? '重做中' : '重试中';
                    }

                    //当前步骤是否完成
                    var _single_suc = false;
                    //单个处理
                    if(meddle_type == 10 || meddle_type == 11){
                        if(_curr_job.job_status == 3 || _curr_job.job_status == 5){
                            _single_suc = true;
                            if(_retry_monitor)  $interval.cancel(_retry_monitor);
                        }else if(_curr_job.job_status == 4 || _curr_job.job_status == 7){
                            if(_task_status == 3){
                                if(_retry_monitor)  $interval.cancel(_retry_monitor);
                                if(_curr_job.timer)  $interval.cancel(_curr_job.timer);
                            }
                        }
                    }
                    if(_single_suc || meddle_type == 12){
                        $interval.cancel(_retry_monitor);
                        monitorInterval(-1);
                    }

                    //执行中/重试中
                    if((data.task_status == 1 || data.task_status == 6) && meddle_type == 12 ){
                        $scope.info.task_status = data.task_status;
                        $scope.info.task_state_cn  =  CV.findValue($scope.info.task_status,OpTaskExeStatus);
                    }
                    //(关闭按钮)执行中不可关闭
                    $scope.control.close_task = (_task_status == 3 || _task_status > 6);
                }
                //全局任务状态
                $rootScope.dispatch_task_status =  $scope.info.task_status;
            },function(error){

            });
        },3000);
    };
    //寻找所有未执行的作业
    var findUndoJob = function(is_retry_link){
        var _job_list = $scope.info.flow_diagram_info.nodeDataArray;
        var _job_id_list = [];
        for(var i = 0; i < _job_list.length; i++){
            var _job = _job_list[i];
            if(_job.type == 3) continue;
            if(!is_retry_link){
                if(_job.sd_job_bean.job_status && _job.sd_job_bean.job_status != 1 && _job.sd_job_bean.job_status != 2) continue;
            }
            _job.sd_job_bean.job_id = _job.sd_job_bean.job_id ? _job.sd_job_bean.job_id : 0;
            _job_id_list.push(_job.sd_job_bean.job_id);
        }
        return  _job_id_list;
    };
    //查询结束时间
    var queryEndTime = function(){
        $timeout(function(){
            Flow.viewTaskDetail(_task_id).then(function(data){
                $timeout(function(){
                    if(data.taskBean){
                        $scope.info.task_status       =  data.taskBean.sdtask_status;
                        $scope.info.task_state_cn     =  CV.findValue(data.taskBean.sdtask_status,OpTaskExeStatus);
                        $scope.info.end_bk_datetime   =  data.taskBean.end_bk_datetime ? data.taskBean.end_bk_datetime.substring(data.taskBean.end_bk_datetime.lastIndexOf('.'),-1) :'';
                        $scope.info.start_bk_datetime =  data.taskBean.start_bk_datetime ? data.taskBean.start_bk_datetime.substring(data.taskBean.start_bk_datetime.lastIndexOf('.'),-1) :'';
                        $rootScope.dispatch_task_status           =  $scope.info.task_status; //全局任务状态
                        if($scope.info.task_status == 4 || $scope.info.task_status == 5){
                            $scope.info.exe_log_path = data.taskBean.exe_log_path ? data.taskBean.exe_log_path:'';
                            $scope.control.close_task    = false;
                            $scope.control.one_exec_btn  = true;
                            $scope.control.step_exec_btn = true;
                            $scope.control.middle_stop   = false;
                            $scope.control.suspend_task  = false;
                            if(_timer) $interval.cancel(_timer);
                            if(_retry_monitor)  $interval.cancel(_retry_monitor);
                            if(_task_status_interval) $interval.cancel(_task_status_interval);
                            if(_skip_monitor) $interval.cancel(_skip_monitor);
                        }
                    }
                },0)
            },function(error){

            });
        },6000)
    };
    var init = function () {
        //查看任务信息
        Flow.viewTaskDetail(_task_id).then(function (data){
            $scope.info.task_status       =  data.taskBean.sdtask_status;
            $scope.info.flow_id           =  data.taskBean.sdflow_id ? data.taskBean.sdflow_id : '';
            $scope.info.version_id        =  data.taskBean.sdversion_id ? data.taskBean.sdversion_id : '';
            $scope.info.task_id           =  data.taskBean.sdtask_id;
            $scope.info.exe_log_path      =  data.taskBean.exe_log_path ? data.taskBean.exe_log_path:'';
            $scope.info.end_bk_datetime   =  data.taskBean.end_bk_datetime ? data.taskBean.end_bk_datetime.substring(data.taskBean.end_bk_datetime.lastIndexOf('.'),-1) :'';
            $scope.info.start_bk_datetime =  data.taskBean.start_bk_datetime ? data.taskBean.start_bk_datetime.substring(data.taskBean.start_bk_datetime.lastIndexOf('.'),-1) :'';
            $scope.info.time_used         =  data.taskBean.time_used ? CV.usedCnTime(data.taskBean.time_used) :'--';
            $scope.info.exe_user_name     =  data.taskBean.exe_user_name ? data.taskBean.exe_user_name : data.taskBean.exe_user_id ? data.taskBean.exe_user_id:'--';

            _input_param_flag = data.taskBean.start_param_flag ? data.taskBean.start_param_flag : 2;
            $rootScope.dispatch_task_status =  $scope.info.task_status; //全局任务状态

            if(!data.flowBean) return;
            //流程图信息
            $scope.info.flow_diagram_info = data.flowBean ? data.flowBean : {};
            //分层处理节点线条数据
            $scope.info.flow_diagram_info.nodeDataArray = $scope.info.flow_diagram_info.sd_node_list ? $scope.info.flow_diagram_info.sd_node_list : [];
            $scope.info.flow_diagram_info.linkDataArray = $scope.info.flow_diagram_info.link_list ? $scope.info.flow_diagram_info.link_list : [];
            for(var i = 0 ; i < $scope.info.flow_diagram_info.nodeDataArray.length;i++ ){
                var _node_arry = $scope.info.flow_diagram_info.nodeDataArray[i];
                _node_arry.category = _node_arry.category.toString();
                _node_arry.isGroup = _node_arry.is_group;
                _node_arry.group =_node_arry.group < 0 ? -_node_arry.group : _node_arry.group;
                _node_arry.key =_node_arry.key < 0 ? -_node_arry.key : _node_arry.key;
                if(_node_arry.type === 1){
                    _start_job = _node_arry;
                }else if(_node_arry.type === 2){
                    _end_job = _node_arry;
                }

            }
            for(var j = 0; j < $scope.info.flow_diagram_info.linkDataArray.length; j++){
                var _link_array = $scope.info.flow_diagram_info.linkDataArray[j];
                if(_link_array.visible){
                    _link_array.text = _link_array.expr;
                }
            }

            if($scope.info.flow_diagram_info.nodeDataArray.length > 0){
                $scope.info.job_id_list = findUndoJob();    //初始获取所有作业编号
                monitorSrv(-1,false,false,true);            //初始作业状态
                //(暂停按钮)一键或自动任务--执行中的状态可暂停
                $scope.control.suspend_task = (($scope.info.exe_types == 2 || $scope.control.one_click) && $scope.info.task_status == 1);
                //执行中的可中止(非开始和结束作业)
                $scope.control.middle_stop  = ($scope.info.task_status == 1 && !startOrEndJobExe());
            }else{
                $scope.control.one_exec_btn = true;
                $scope.control.step_exec_btn = true;
            }
            //自动任务
            if($scope.info.exe_types == 2){
                $scope.control.step_exec_btn = true;
                $scope.control.one_exec_btn = true;
            }
            //执行中/自动等待/执行异常/失败
            if($scope.info.task_status < 4 || $scope.info.task_status == 6 || $scope.info.task_status == 10){
                $scope.control.one_exec_btn = true;
                $scope.control.step_exec_btn = true;
                monitorInterval(-1)
            }
            if($scope.info.task_status > 3 && $scope.info.task_status != 6 && $scope.info.task_status != 10){
                if(_timer) $interval.cancel(_timer);
                //暂停的任务可继续执行
                if($scope.info.task_status == 7){
                    $scope.control.one_exec_btn = false;
                    $scope.control.step_exec_btn = $scope.info.exe_types == 2;
                }
                //任务完成
                if($scope.info.task_status ==4 || $scope.info.task_status == 5){
                    $scope.control.one_exec_btn = true;
                    $scope.control.step_exec_btn = true;
                    $scope.control.close_task = false;
                }
                //排队中
                if($scope.info.task_status == 11){
                    queuingMonitor();
                }
            }
        },function(error){
            Modal.alert(error.message);
            $state.go('dispatch_task_list.cur_task');
        });
    };

    //查看单个作业
    $scope.viewSingleJob = function(job){
        $rootScope.dispatch_task_status =  $scope.info.task_status; //全局任务状态
        Modal.viewSingleWorkInfo(_task_id,$scope.info.flow_diagram_info.nodeDataArray,job,$scope.info.task_status,false).then(function(data){
            if(data){
                var _meddle_reason = data.meddle_reason ?  data.meddle_reason : '';
                var _job_index = data.job_index + '';                                //单步步骤号（索引值）
                var _job_id = data.job_id;                                           //单个作业id
                var _cus_meddle_type = 0;                                            //自定义干预类型(10：重做，11:重试，12:重试链，16：完成作业)

                if(data.meddle_type != 3){
                    if(data.meddle_type == 1){
                        $scope.info.task_state_cn = "重试等待";
                        _cus_meddle_type = 11;
                    }else if(data.meddle_type == 2){
                        $scope.info.task_state_cn = "重做等待";
                        _cus_meddle_type = 10;
                    }else if(data.meddle_type == 4){
                        $scope.info.task_state_cn = "重试链等待";
                        _cus_meddle_type = 12;
                    }else{
                        $scope.info.task_state_cn = "等待完成";
                        _cus_meddle_type = 16;
                    }
                    //清空执行状态信息
                    clearExeStatus(_job_index,_cus_meddle_type);
                    //开始干预
                    $scope.control.one_exec_btn = true;
                    $scope.control.step_exec_btn = true;
                    $scope.control.close_task = false;
                    Flow.meddleJobExecute(_task_id,_cus_meddle_type,[_job_id],_meddle_reason).then(function(data){
                        $timeout(function(){
                            if(_cus_meddle_type == 10 || _cus_meddle_type == 11 || _cus_meddle_type == 16){
                                $scope.info.job_id_list = [_job_id];
                            }else{
                                $scope.info.job_id_list = findUndoJob(true);
                            }
                            if(_cus_meddle_type == 16){
                                stepSkipMonitor(_job_index,true); //强制完成
                            }else{
                                retryMonitor(_job_index,_cus_meddle_type);
                            }
                        },0);
                    },function(error){
                        Modal.alert(error.message);
                        if(_timer) $interval.cancel(_timer);
                        $scope.control.close_task       = true;
                        $scope.info.task_state_cn = '执行异常';
                    });
                }else{
                    //清空执行状态信息
                    clearExeStatus(_job_index,_cus_meddle_type);
                    $scope.oneStepSkip(_job_index)
                }
            }

            //清除单个作业事件
            $scope.control.clear_click_event = true;
            $timeout(function(){
                $scope.control.clear_click_event = false;
            },100)
        })
    };
    //一键执行
    $scope.oneClickExe = function(){
        if(_input_param_flag == 1 && _start_job && _start_job.sd_job_bean.job_status == 1){
            inputStartParam(7,_start_job);
        }else{
            var _continue = false;                                  //是否继续
            $scope.info.job_id_list = findUndoJob();    //监控的作业id列表
            if($scope.info.job_id_list.length === 0) return;
            $scope.control.one_click     = true;
            $scope.control.one_exec_btn  = true;
            $scope.control.step_exec_btn = true;
            $scope.control.close_task    = false;
            if($scope.info.task_status == 7){          //自动任务暂停后继续执行
                _continue = true;
                $scope.info.task_state_cn = '执行中';
            }
            Flow.meddleTaskExecute(_task_id,7).then(function(data){
                $timeout(function(){
                    console.log('一键干预成功');
                },0);
            },function(error){
                Modal.alert(error.message);
                $scope.control.one_exec_btn  = false;
                $scope.control.step_exec_btn = false;
                $scope.control.middle_stop   = false;
                $scope.control.suspend_task  = false;
                $interval.cancel(_timer);
                if($scope.info.task_status == 7){
                    $scope.info.task_state_cn = '任务暂停';
                }
            });
            monitorInterval(-1,_continue); //定时监控
        }
    };
    //单步执行
    $scope.singleStepExe = function(){
        if(_input_param_flag == 1 && _start_job && _start_job.sd_job_bean.job_status == 1){
            inputStartParam(6,_start_job);
        }else{
            var _continue = false;                                       //是否继续执行
            $scope.info.job_id_list = findUndoJob();         //监控的作业id列表
            if($scope.info.job_id_list.length === 0) return;
            $scope.control.one_click     = false;
            $scope.control.one_exec_btn  = true;
            $scope.control.step_exec_btn = true;
            $scope.control.close_task = false;
            if($scope.info.task_status == 7){
                _continue = true;
                $scope.info.task_state_cn = '手动等待';
            }
            Flow.meddleTaskExecute(_task_id,6).then(function(data){
                $timeout(function(){
                    console.log('单步干预完成')
                },0);
            },function(error){
                Modal.alert(error.message);
                $scope.control.one_exec_btn  = false;
                $scope.control.step_exec_btn = false;
                $scope.control.middle_stop   = false;
                $interval.cancel(_timer);
                if($scope.info.task_status == 7){
                    $scope.info.task_state_cn = '任务暂停';
                }
            });
            //定时监控
            monitorInterval(-1,_continue,true);
        }
    };
    //单个跳过
    $scope.oneStepSkip = function(job_index){
        if(job_index > -1){
            var _job = $scope.info.flow_diagram_info.nodeDataArray[job_index].sd_job_bean;
            var _job_id_list =  [{job_id:_job.job_id,job_status:_job.job_status}];
        }
        if(!_job_id_list) return;

        var _flow_id = $scope.info.flow_id;
        var _version_id = $scope.info.version_id;

        //查询作业输出参数
        Flow.getJobOutput(_task_id,_flow_id,_version_id,_job_id_list).then(function(data){
            $timeout(function(){
                if(data.step_list){
                    Modal.addSkipWorkParams(data.step_list).then(function(step_output){
                        if(step_output){
                            skipOneStep(job_index,step_output)
                        }else{
                            _job.job_status = 4;//取消参数修改-重置状态
                        }
                    })
                }else{
                    skipOneStep(job_index,_job_id_list)
                }
            },0)
        },function(error){
            Modal.alert(error.message)
        });
    };
    //任务干预（meddle_type 1关闭 2暂停 5中止）
    $scope.meddleTask = function(meddle_type){
        var _meddle_type_cn =  meddle_type == 1 ? "关闭" : meddle_type == 2 ? '暂停' : meddle_type == 5 ? '中止': '';
        Modal.confirm("确认" + _meddle_type_cn + "任务 ?").then(function(){
            var _last_task_cn_status = $scope.info.task_state_cn;
            $scope.info.task_state_cn = "正在" + _meddle_type_cn;
            $scope.control.middle_stop      = meddle_type == 2;
            $scope.control.close_task       = false;
            $scope.control.one_exec_btn     = true;
            $scope.control.step_exec_btn    = true;
            $scope.control.suspend_task     = false;
            $rootScope.dispatch_task_status       = 0;

            if(_timer) $interval.cancel(_timer);
            if(meddle_type == 1){
                if(_retry_monitor) $interval.cancel(_retry_monitor);
                if(_skip_monitor) $interval.cancel(_skip_monitor);
            }

            taskMeddleSrv(meddle_type,_last_task_cn_status);
            updateTaskStatus(meddle_type);
        });
    };
    //阻止事件传递
    $scope.stopPropagation = function(e){
        e.stopPropagation();
    };
    //下载执行日志
    $scope.downloadExecLog = function(){
        var _path = $scope.info.exe_log_path;
        if(_path) CV.downloadFile(_path);
    };
    //路由改变停止监控
    $rootScope.$on('$stateChangeSuccess',function(){
        if(_timer) $interval.cancel(_timer);
        if(_retry_monitor) $interval.cancel(_retry_monitor);
        if(_task_status_interval) $interval.cancel(_task_status_interval);
        if(_skip_monitor) $interval.cancel(_skip_monitor);
        if(_queuing_monitor) $interval.cancel(_queuing_monitor);
    });
    init();
}]);
//任务查看控制器
task.controller('taskExecuteDetailCtrl',["$scope", "$rootScope", "$stateParams", "$timeout", "$interval", "$state", "Flow", "FlowType", "OpTaskExeStatus", "Charts", "Modal", "CV",function($scope, $rootScope, $stateParams, $timeout, $interval, $state, Flow, FlowType, OpTaskExeStatus, Charts, Modal, CV){
    //任务ID
    var _optask_id = $stateParams.task_id || '';
    //监控定时
    var _interval;
    //页面控制
    angular.extend($scope.control,{
        task_info_loading : false,//页面信息加载中
        clear_click_event:false   //清除点击事件
    });
    //任务查看信息
    $scope.info = {
        flow_id:'',               //流程编号
        exe_types:0,              //执行方式
        exe_user_name:'',         //执行人
        exe_start_datetime:'',    //执行开始时间
        exe_end_datetime:'',      //执行开始时间
        job_id_list:[],           //作业编号列表
        exe_log_path:'',           //执行日志
        flow_diagram_info:{
            nodeDataArray:[],
            linkDataArray:[]
        }
    };

    //执行进度interval
    var progressInterval = function(obj){
        if(obj.timer) $interval.cancel(obj.timer);
        if(obj.width && obj.width >= 110) return;
        obj.timer = $interval(function(){
            obj.width += ~~(Math.random() * 8);//0-8之间随机数
        },1000);
    };
    //寻找未执行的作业
    var findUndoJob = function(){
        var _job_list = $scope.info.flow_diagram_info.nodeDataArray;
        var _job_id_list = [];
        for(var i = 0; i < _job_list.length; i++){
            var _job = _job_list[i];
            if(_job.type == 3) continue;
            if(_job.sd_job_bean.job_status && _job.sd_job_bean.job_status != 1 && _job.sd_job_bean.job_status != 2) continue;
            _job.sd_job_bean.job_id = _job.sd_job_bean.job_id ? _job.sd_job_bean.job_id : 0;
            _job_id_list.push(_job.sd_job_bean.job_id);
        }
        return  _job_id_list;
    };
    //监控作业状态
    var monitorJobStatus = function(){
        Flow.monitorJobStatus(_optask_id,$scope.info.job_id_list).then(function (data) {
            $timeout(function () {
                $scope.info.task_status       =  data.task_status;
                $scope.info.task_state_cn     =  CV.findValue(data.task_status,OpTaskExeStatus);
                var _job_status_list   = data.job_status_list ?  data.job_status_list : [];
                var _node_list =  $scope.info.flow_diagram_info.nodeDataArray,len = _node_list.length;
                if( len != 0){
                    //状态转换
                    for(var i = 0; i < _job_status_list.length; i++){
                        var _status = _job_status_list[i];
                        for(var j = 0; j < len; j++){
                            var _job = _node_list[j];
                            if(_job.type == 3) continue;
                            if(_job.sd_job_bean.job_id == _status.job_id){
                                _job.sd_job_bean.job_status = _status.job_status ? _status.job_status : 1;
                                _job.sd_job_bean.width =  _job.sd_job_bean.width ?  _job.sd_job_bean.width:0;
                                if(_job.sd_job_bean.job_status == 2){
                                    progressInterval(_job.sd_job_bean);
                                    if(_job.sd_job_bean.width >= 100){
                                        if(_job.sd_job_bean.timer) $interval.cancel(_job.sd_job_bean.timer);
                                        _job.sd_job_bean.width = 110;
                                    }
                                }else if(_job.sd_job_bean.job_status == 3 || _job.sd_job_bean.job_status ==5){
                                    if(_job.sd_job_bean.timer) $interval.cancel(_job.sd_job_bean.timer);
                                    _job.sd_job_bean.width = 120;
                                }else if(_job.sd_job_bean.job_status == 4 || _job.sd_job_bean.job_status == 7){
                                    if(_job.sd_job_bean.timer) $interval.cancel(_job.sd_job_bean.timer);
                                    _job.sd_job_bean.width = _job.sd_job_bean.width ? _job.sd_job_bean.width : 10;
                                }
                            }
                        }
                    }
                }
            },0)
        },function (error) {

        });
    };
    var init =function () {
        _interval = $interval(function () {
            monitorJobStatus();
            $scope.$watch('info.task_status', function (newValue,oldValue) {
                if(newValue == oldValue) return;
                if (newValue == 4 || newValue == 5 || newValue == 7) {
                    if(_interval) $interval.cancel(_interval);
                }
            });
        },5000);
        $scope.control.task_info_loading = true;
        Flow.viewTaskDetail(_optask_id).then(function (data) {
            $timeout(function () {
                $scope.control.task_info_loading = false;
                $scope.info.task_status       = data.taskBean.sdtask_status;
                $scope.info.task_state_cn     = CV.findValue(data.taskBean.sdtask_status,OpTaskExeStatus);
                $scope.info.task_cn_name      = data.taskBean.sdtask_cn_name;
                $scope.info.end_bk_datetime   = data.taskBean.end_bk_datetime ? data.taskBean.end_bk_datetime.substring(data.taskBean.end_bk_datetime.lastIndexOf('.'),-1) :'';
                $scope.info.start_bk_datetime = data.taskBean.start_bk_datetime ? data.taskBean.start_bk_datetime.substring(data.taskBean.start_bk_datetime.lastIndexOf('.'),-1) :'';
                $scope.info.exe_log_path      = data.taskBean.exe_log_path || '';
                $scope.info.time_used         = data.taskBean.time_used ? CV.usedCnTime(data.taskBean.time_used) :'--';

                //流程图信息
                $scope.info.flow_diagram_info = data.flowBean ? data.flowBean : {};
                //分层处理节点线条数据
                $scope.info.flow_diagram_info.nodeDataArray = $scope.info.flow_diagram_info.sd_node_list ? $scope.info.flow_diagram_info.sd_node_list : [];
                $scope.info.flow_diagram_info.linkDataArray = $scope.info.flow_diagram_info.link_list ? $scope.info.flow_diagram_info.link_list : [];
                for(var i = 0 ; i < $scope.info.flow_diagram_info.nodeDataArray.length;i++ ){
                    var _node_arry = $scope.info.flow_diagram_info.nodeDataArray[i];
                    _node_arry.category = _node_arry.category.toString();
                    _node_arry.isGroup = _node_arry.is_group;
                    _node_arry.group =_node_arry.group < 0 ? -_node_arry.group : _node_arry.group;
                    _node_arry.key =_node_arry.key < 0 ? -_node_arry.key : _node_arry.key;
                }
                for(var j =0; j < $scope.info.flow_diagram_info.linkDataArray.length; j++){
                    var _link_data = $scope.info.flow_diagram_info.linkDataArray[j];
                    if(_link_data.visible){
                        _link_data.text = _link_data.expr;
                    }
                }
                if($scope.info.flow_diagram_info.nodeDataArray.length != 0){
                    $scope.info.job_id_list = findUndoJob();    //初始获取所有作业编号
                    monitorJobStatus(); //初始作业状态
                }else{
                    $scope.control.one_exec_btn = true;
                    $scope.control.step_exec_btn = true;
                }

                if($scope.info.task_status == 4 || $scope.info.task_status == 5){
                    $interval.cancel(_interval);
                }
            },0)
        },function (error) {
            Modal.alert(error.message);
            //if($state.url() =="/yw_task_detail_his/" +  _optask_id){
            //    $state.url("/flow_task_list/his_active");
            //}else{
            //    $state.url("/flow_task_list/cus_active");
            //}
        });
    };
    //查看单个作业
    $scope.viewSingleJob = function(job){
        Modal.viewSingleWorkInfo(_optask_id,$scope.info.flow_diagram_info.nodeDataArray,job,$scope.info.task_status,true).then(function(data){
            //清除单个作业事件
            $scope.control.clear_click_event = true;
            $timeout(function(){
                $scope.control.clear_click_event = false;
            },100)
        })
    };
    //下载执行日志
    $scope.downloadExecLog = function(){
        var _path = $scope.info.exe_log_path;
        if(_path) CV.downloadFile(_path);
    };
    //路由改变停止监控
    $rootScope.$on('$stateChangeSuccess',function(){
        if(_interval) $interval.cancel(_interval);
    });
    init();
}]);
//任务概览控制器
task.controller("taskPreviewCtrl", ["$scope", "$rootScope", "$state", "$location", "$timeout","Flow", "ScrollConfig", "Modal", "CV", function($scope, $rootScope, $state, $location, $timeout, Flow, ScrollConfig, Modal, CV) {
    var _url = $location.absUrl(); //获取浏览器当前的url
    $scope.control = {
        active_name: _url.slice(_url.lastIndexOf('/')+1), //获取当前显示的tab
        //日历的显示隐藏
        first_opened:false,
        second_opened:false,
        node_opened:false,
    };
    $scope.info = {
        all_task:{                  //全行
            left_scroll : ScrollConfig,//左侧滚动条配置
            right_scroll : ScrollConfig,//右侧滚动条配置
            start_date:'',          //开始日期
            next_date:'',           //结束日期
            first_task:{            //左侧页面信息
                loading:false,      //加载中
                error_message:'',   //错误信息
                task_list:[]        //任务列表
            },
            second_task:{           //右侧页面信息
                loading:false,      //加载中
                error_message:'',   //错误信息
                task_list:[]        //任务列表
            }
        },
        attention_task:{            //关注
            left_scroll : ScrollConfig,//左侧滚动条配置
            right_scroll : ScrollConfig,//右侧滚动条配置
            start_date:'',          //开始日期
            next_date:'',           //结束日期
            first_task:{            //左侧页面信息
                loading:false,      //加载中
                error_message:'',   //错误信息
                task_list:[]        //任务列表
            },
            second_task:{           //右侧页面信息
                loading:false,      //加载中
                error_message:'',   //错误信息
                task_list:[]        //任务列表
            }
        },
        node_task:{                 //节点
            left_scroll : ScrollConfig,//左侧滚动条配置
            right_scroll : ScrollConfig,//右侧滚动条配置
            start_date:'',          //节点时间
            node_list:[],           //节点列表
            first_task:{            //左侧页面信息
                loading:false,      //加载中
                error_message:'',   //错误信息
                task_list:[]        //任务列表
            },
            second_task:{           //右侧页面信息
                loading:false,      //加载中
                error_message:'',   //错误信息
                task_list:[]        //任务列表
            }
        }
    };
    //全行--初始化时间
    var initDate = function(){
        //今天
        var _date = new Date();
        var _next_date = angular.copy(_date);
        for(var key in $scope.info){
            var _obj = $scope.info[key];
            _obj.start_date = _date;
            _obj.start_date_cn = showFormatDate(_date);
            if(key != 'node_task'){
                _next_date.setDate(_date.getDate()+1);
                _obj.next_date = _next_date;
                _obj.next_date_cn = showFormatDate(_next_date);
                getTaskListServer(key == 'all_task' ?false:true,_obj.start_date,_obj.first_task);
                getTaskListServer(key == 'all_task' ?false:true,_obj.next_date,_obj.second_task);
            }
        }
    };
    //全行--格式化显示时间
    var showFormatDate = function(_date){
        var _year = _date.getFullYear();
        var _month = parseInt(_date.getMonth()+1)<10?'0'+(_date.getMonth()+1):_date.getMonth()+1;
        var _day = parseInt(_date.getDate())<10 ? '0'+_date.getDate():_date.getDate();
        return _year + "年" +_month+ "月"+_day+"日";
    };
    //节点--节点滚动效果
    var nodeTurnAnimate = function(_state_begin){
        //效果偏移
        var _total_length = $scope.info.node_task.node_list.length*229; //节点列表长度
        var _position = _state_begin*229;                     //节点所处当前位置
        var _view_width = parseFloat($('.node_flow').css('width')); //可视宽度
        var _mid_position = parseInt((_view_width-458)/2);  //可视区域的中间位置
        var offset = (_total_length-_position+_mid_position<_view_width)?(_view_width-_total_length+25):(_state_begin == 0 || _position<=_mid_position) ? 0:(_mid_position-_position); //偏移距离
        if(_total_length>_view_width){
            $('.node_flow>div').css('left',offset+'px');
        }
    };
    //全行/关注--获取任务列表服务
    var getTaskListServer = function(is_attentio,run_date,response){
        var _run_date = CV.dtFormat(run_date);
        response.loading = true;
        Flow.getTaskListByDate(is_attentio,_run_date).then(function(data){
            $timeout(function(){
                if(data){
                    response.loading = false;
                    response.task_list = data.task_run_list ? data.task_run_list:[];
                    response.error_message = "";
                }
            },1000);
        },function(error){
            response.loading = false;
            response.error_message = error.message;
        });
    };
    //节点--获取任务列表
    var getTaskListByDateAndNodeServer = function(node_ip,run_date,response){
        var _run_date = CV.dtFormat(run_date);
        response.loading = true;
        Flow.getTaskListByDateAndNode(node_ip,_run_date).then(function(data){
            $timeout(function(){
                if(data){
                    response.loading = false;
                    response.task_list = data.task_run_list ? data.task_run_list:[];
                    response.error_message = "";
                }
            },1000);
        },function(error){
            response.loading = false;
            response.error_message = error.message;
        });
    };
    //节点--同时获取两个节点的任务列表
    var getTwoNodeTaskList = function(){
        var _run_date = $scope.info.node_task.start_date;
        for(var i= 0,_first = 0; i<$scope.info.node_task.node_list.length; i++){
            var _node = $scope.info.node_task.node_list[i];
            if(_node.state){
                if(_first == 0){
                    getTaskListByDateAndNodeServer(_node.node_ip,_run_date,$scope.info.node_task.first_task);
                    _first++;
                }else{
                    getTaskListByDateAndNodeServer(_node.node_ip,_run_date,$scope.info.node_task.second_task);
                    break;
                }
            }
        }
    };
    //节点--查找选中的节点
    var findSelectedNode = function(){
        var _node_list = $scope.info.node_task.node_list,_selected_node = [];
        if(_node_list.length === 0) return;
        angular.forEach(_node_list,function(data,index,array){
            [].push.call(_selected_node,{node_ip:data.node_ip});
        });
        return _selected_node
    };
    var init = function(){
        initDate();
    };
    //跳转到对应的tab页
    $scope.jumpTo = function(tab){
        $scope.control.active_name = tab;
        $state.go('dispatch_task_preview.'+tab);
    }
    //全行--选择完日期的回调函数
    $scope.dateCallBack = function(task,flag,date_picker,other_picker,is_attention){
        var _date = task[date_picker];
        var _next_date = angular.copy(_date);
        task[date_picker+'_cn'] = showFormatDate(_date);
        _next_date.setDate(_next_date.getDate()+flag);
        task[other_picker] = _next_date;
        task[other_picker+'_cn'] = showFormatDate(_next_date);

        getTaskListServer(is_attention,task.start_date,task.first_task);
        getTaskListServer(is_attention,task.next_date,task.second_task);
    };
    //全行--隐藏、显示日历配置面板
    $scope.openCalendar = function (opened,$event){
        $event.preventDefault();
        $event.stopPropagation();
        $scope.control[opened] = !$scope.control[opened];
    };
    //全行--前一天、后一天切换
    $scope.frontOrNextDate = function(task,index,start,next,is_attention){
        var _date = angular.copy(task[start]);
        _date.setDate(_date.getDate()+index);
        task[start] = _date;
        $scope.dateCallBack(task,1,start,next,is_attention);
    };
    //节点--选择节点弹窗
    $scope.chooseNodesModal = function(is_reselect){
        var _selected_node = is_reselect ? findSelectedNode() : [];
        Modal.chooseNodes(_selected_node).then(function(data){
            if(data.length > 0){
                data[0].state = true;
                data.length >1 && (data[1].state = true);
                getTwoNodeTaskList();
            }
            $scope.info.node_task.node_list = data;
        });
    };
    //节点--前一个、后一个节点切换
    $scope.frontOrNextNode = function(flag){
        //节点开始状态
        var _state_begin = -1;
        //修改节点状态
        if($scope.info.node_task.node_list.length >2){
            //数据偏移
            for(var i=0; i<$scope.info.node_task.node_list.length-1; i++){
                var _node = $scope.info.node_task.node_list[i];
                var _next_node = $scope.info.node_task.node_list[i+1];
                if(_node.state && _next_node.state){
                    if(flag == -1){
                        if(i+2 == $scope.info.node_task.node_list.length-1){
                            _node.state = false;
                            _state_begin = i+1;
                            $scope.info.node_task.node_list[i+2].state = true;
                        }else if(i+2 < $scope.info.node_task.node_list.length-1){
                            _node.state = false;
                            _next_node.state = false;
                            _state_begin = i+2;
                            $scope.info.node_task.node_list[i+2].state = true;
                            $scope.info.node_task.node_list[i+3].state = true;
                        }
                    }else{
                        if(i-1 ==0){
                            _state_begin = 0;
                            $scope.info.node_task.node_list[i-1].state = true;
                            $scope.info.node_task.node_list[i+1].state = false;
                        }else if(i-1 >0){
                            _node.state = false;
                            _next_node.state = false;
                            _state_begin = i-2;
                            $scope.info.node_task.node_list[i-1].state = true;
                            $scope.info.node_task.node_list[i-2].state = true;
                        }
                    }
                    (_state_begin != -1) && getTwoNodeTaskList();
                    break;
                }
            };
            if(_state_begin != $scope.info.node_task.node_list.length-1 && _state_begin!=-1){
                nodeTurnAnimate(_state_begin);
            }
        }
    };
    //节点--选择日期
    $scope.selectDate = function(task,date_picker){
        var _date = task[date_picker];
        task[date_picker+'_cn'] = showFormatDate(_date);
        getTwoNodeTaskList();
    };
    //节点--设置节点样式
    $scope.setNodeStyle = function(node,index){
        return {
            'border-color': node.state ? '#FC9E22':'',
            'color':node.state ? '#FC9E22':'',
            'margin-right':index == $scope.info.node_task.node_list.length-1 ? '0px':'25px'
        }
    };
    init();
}]);
