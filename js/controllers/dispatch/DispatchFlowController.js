/**
 * Created by admin on 2018/5/18.
 * 调度--流程模块
 */
var flow = angular.module('dispatchFlowController', []);

//新增流程基本信息
flow.controller('flowBasicInfoNewCtrl', ['$scope', '$stateParams', '$timeout', '$cookieStore', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'StrategyPriority', 'Modal', 'CV', function ($scope, $stateParams, $timeout, $cookieStore, $state, Flow, FlowType, Scene, Strategy, StrategyPriority, Modal, CV) {
    $scope.data = {
        scene_list: [],  //场景列表
        strategy_group_list: [], //策略组列表
        strategy_priority_list: StrategyPriority, //策略组的优先级
        flow_type_list: angular.copy(FlowType),    //流程类型列表
        save_btn_label: '保存',    //保存按钮上显示的文字
    }
    $scope.info = {
        sdflow_cn_name: '', //流程中文名
        sdarrange_method: 1,   //编排方式(1：简单。2：复杂)
        sdparallel_task: 1, //重复执行（1：允许。2：不允许）
        sddispatch_type: 1, //执行类型（1：人工。2：定时）
        sd_strategy_id: '', //策略组id
        sd_priority: 5,  //优先级
        sdflow_types: [] //流程类型列表
    }
    //控制页面状态
    $scope.control = {
        show_basic_detail: false,//展开收起
        scene_loading: false,    //选择场景 加载中
        strategy_loading: false,    //策略组 加载中
        name_edit_flag: true,    //流程名是否可编辑
        basic_saveing: false,    //流程是否保存状态
    }
    //获取场景列表
    var getSceneList = function () {
        $scope.control.scene_loading = true;
        Scene.getSceneListByType({key_word: '', data: {offset: 0}}).then(function (data) {
            $timeout(function () {
                $scope.control.scene_loading = false;
                $scope.data.scene_list = data.scene_list ? data.scene_list.filter(function (item) {
                    return item.scene_type !== 3
                }) : []; //非私有场景
            }, 0)
        }, function (error) {
            $scope.control.scene_loading = false;
            Modal.alert(error.message)
        });
    }
    //获取策略组列表
    var getStrategyList = function () {
        Strategy.getStrategyGroupList().then(function (data) {
            $timeout(function () {
                $scope.control.strategy_loading = false;
                if (data.strategy_group_list) {
                    $scope.data.strategy_group_list = data.strategy_group_list;
                    //默认为并行策略组
                    if (!$scope.info.sd_strategy_id) {
                        $scope.data.strategy_group_list.some(function (item, index) {
                            return (item.sdstrategy_type === 1) && ($scope.info.sd_strategy_id = $scope.data.strategy_group_list[index].sdstrategy_id);
                        });
                    }
                }
            }, 0)
        }, function (error) {
            $scope.control.strategy_loading = false;
            Modal.alert(error.message);
        });
    }
    //根据策略id查找类型
    var findStrategyTypeById = function (strategy_id) {
        if (!strategy_id) return {};
        var _single_strategy;
        for (var i = 0; i < $scope.data.strategy_group_list.length; i++) {
            var _strategy = $scope.data.strategy_group_list[i];
            if (_strategy.sdstrategy_id === strategy_id) {
                _single_strategy = {
                    strategy_name: _strategy.sdstrategy_name ? _strategy.sdstrategy_name : '',
                    strategy_type: _strategy.sdstrategy_type ? _strategy.sdstrategy_type : 0,
                    strategy_concurrent: _strategy.sdstrategy_concurrent ? _strategy.sdstrategy_concurrent : 0,
                };
                break;
            }
        }
        return _single_strategy;
    }
    //初始化方法
    var init = function () {
        //获取场景列表
        getSceneList();
        //获取策略组列表
        getStrategyList();
    }
    //选择策略组
    $scope.selectStrategy = function (strategy_id) {
        var _curr_strategy = findStrategyTypeById(strategy_id); //根据策略id查找类型
        $scope.info.sd_strategy_id = strategy_id;
        if (_curr_strategy) {
            $scope.control.strategy_type = _curr_strategy.strategy_type;    //策略类型
            $scope.control.strategy_concurrent = _curr_strategy.strategy_concurrent;    //策略
            $scope.info.strategy_name = _curr_strategy.strategy_name;  //策略组名
        }
    };
    //保存-流程基本信息
    $scope.save = function () {
        if (!CV.valiForm($scope.info.workorder_form)) {
            return false;
        }
        //保存基本信息
        $scope.control.basic_saveing = true;
        //处理流程类型
        for (var i = 0; i < $scope.data.flow_type_list.length; i++) {
            var _type = $scope.data.flow_type_list[i];
            _type.flag && $scope.info.sdflow_types.push($scope.data.flow_type_list[i].key);
        }
        Flow.saveFlowBasicData($scope.info, false).then(function (data) {
            if (data) {
                $state.go('dispatch_flow_edit', {
                    flow_id: data.sdflow_id,
                    version_id: data.sdversion_id
                });
            }
        }, function (error) {
            $scope.control.basic_saveing = false;
            Modal.alert(error.message);
        });
    };
    init();
}]);
//修改流程图的基本信息
flow.controller('flowBasicInfoEditCtrl', ['$scope', '$stateParams', '$timeout', '$cookieStore', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'StrategyPriority', 'Modal', 'CV', function ($scope, $stateParams, $timeout, $cookieStore, $state, Flow, FlowType, Scene, Strategy, StrategyPriority, Modal, CV) {
    var _flow_id = $stateParams.flow_id; //流程id
    var _version_id = $stateParams.version_id; //流程版本id
    $scope.data = {
        scene_list: [],  //场景列表
        strategy_group_list: [], //策略组列表
        strategy_priority_list: StrategyPriority, //策略组的优先级
        flow_type_list: angular.copy(FlowType),    //流程类型列表
        save_btn_label: '修改',    //保存按钮上显示的文字
    }
    $scope.info = {
        sdflow_cn_name: '', //流程中文名
        sdarrange_method: 1,   //编排方式(1：简单。2：复杂)
        sdparallel_task: 1, //重复执行（1：允许。2：不允许）
        sddispatch_type: 1, //执行类型（1：人工。2：定时）
        sd_strategy_id: '', //策略组id
        sd_priority: 5,  //优先级
        sdflow_types: [], //流程类型列表
    }
    //控制页面状态
    $scope.control = {
        show_basic_detail: true,//展开收起(默认收起)
        scene_loading: false,    //选择场景 加载中
        strategy_loading: false,    //策略组 加载中
        name_edit_flag: true,    //流程名是否可编辑
        basic_saveing: false,    //流程是否保存状态
    };
    //获取场景列表
    var getSceneList = function () {
        $scope.control.scene_loading = true;
        Scene.getSceneListByType({key_word: '', data: {offset: 0}}).then(function (data) {
            $timeout(function () {
                $scope.control.scene_loading = false;
                $scope.data.scene_list = data.scene_list ? data.scene_list.filter(function (item) {
                    return item.scene_type !== 3
                }) : []; //非私有场景
            }, 0)
        }, function (error) {
            $scope.control.scene_loading = false;
            Modal.alert(error.message)
        });
    }
    //获取策略组列表
    var getStrategyList = function () {
        Strategy.getStrategyGroupList().then(function (data) {
            $timeout(function () {
                $scope.control.strategy_loading = false;
                if (data.strategy_group_list) {
                    $scope.data.strategy_group_list = data.strategy_group_list;
                    //默认为并行策略组
                    if (!$scope.info.sd_strategy_id) {
                        $scope.data.strategy_group_list.some(function (item, index) {
                            return (item.sdstrategy_type === 1) && ($scope.info.sd_strategy_id = $scope.data.strategy_group_list[index].sdstrategy_id);
                        });
                    }
                }
            }, 0)
        }, function (error) {
            $scope.control.strategy_loading = false;
            Modal.alert(error.message);
        });
    }
    //根据id获取页面基本信息
    var getFlowBasicDetail = function () {
        Flow.viewFlowBasicInfo(_flow_id, _version_id).then(function (data) {
            angular.extend($scope.info, data.basicInfo ? data.basicInfo : {});
            $scope.info.sd_strategy_id && $scope.selectStrategy($scope.info.sd_strategy_id);

            //处理流程类型
            var _sdflow_types = $scope.info.sdflow_type.split(',');
            for (var i = 0; i < $scope.data.flow_type_list.length; i++) {
                var _opflow = $scope.data.flow_type_list[i];
                for (var j = 0; j < _sdflow_types.length; j++) {
                    if (_opflow.key == _sdflow_types[j]) {
                        $scope.data.flow_type_list[i].flag = true;
                    }
                }
            }
        }, function (error) {
            Modal.alert(error.message);
        });
    }
    //根据策略id查找类型
    var findStrategyTypeById = function (strategy_id) {
        if (!strategy_id) return {};
        var _single_strategy;
        for (var i = 0; i < $scope.data.strategy_group_list.length; i++) {
            var _strategy = $scope.data.strategy_group_list[i];
            if (_strategy.sdstrategy_id === strategy_id) {
                _single_strategy = {
                    strategy_name: _strategy.sdstrategy_name ? _strategy.sdstrategy_name : '',
                    strategy_type: _strategy.sdstrategy_type ? _strategy.sdstrategy_type : 0,
                    strategy_concurrent: _strategy.sdstrategy_concurrent ? _strategy.sdstrategy_concurrent : 0,
                };
                break;
            }
        }
        return _single_strategy;
    }
    //初始化方法
    var init = function () {
        //获取场景列表
        getSceneList();
        //获取策略组列表
        getStrategyList();
        //根据id获取页面基本信息
        getFlowBasicDetail();
    }
    //选择策略组
    $scope.selectStrategy = function (strategy_id) {
        var _curr_strategy = findStrategyTypeById(strategy_id); //根据策略id查找类型
        $scope.info.sd_strategy_id = strategy_id;
        if (_curr_strategy) {
            $scope.control.strategy_type = _curr_strategy.strategy_type;    //策略类型
            $scope.control.strategy_concurrent = _curr_strategy.strategy_concurrent;    //策略
            $scope.info.strategy_name = _curr_strategy.strategy_name;  //策略组名
        }
    };
    //修改-流程基本信息
    $scope.save = function () {
        if (!CV.valiForm($scope.info.workorder_form)) {
            return false;
        }
        //保存基本信息
        $scope.control.basic_saveing = true;
        //处理流程类型
        for (var i = 0; i < $scope.data.flow_type_list.length; i++) {
            var _type = $scope.data.flow_type_list[i];
            _type.flag && $scope.info.sdflow_types.push($scope.data.flow_type_list[i].key);
        }
        Flow.saveFlowBasicData($scope.info, true).then(function (data) {
            if (data) {
                $state.go('dispatch_flow_edit', {
                    flow_id :  _flow_id,
                    version_id : _version_id,
                });
            }
        }, function (error) {
            $scope.control.basic_saveing = false;
            Modal.alert(error.message);
        });
    };
    //添加私有场景元素（向下传递）
    $scope.$on("addPalette",function (event,data) {
        $scope.$broadcast("privatePalette", data);
    });
    init();
}]);
//查看流程基本信息
flow.controller('flowBasicInfoDetailCtrl', ['$scope', '$stateParams', '$timeout', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'Modal', function ($scope, $stateParams, $timeout, $state, Flow, FlowType, Scene, Strategy, Modal) {
    $scope.info = {} //页面信息
    $scope.data = {
        flow_type_list: angular.copy(FlowType),    //流程类型列表
    }
    $scope.control = {
        show_basic_detail: true,//展开收起
    }
    //处理流程类型
    var dealFlowType = function () {
        var _sdflow_types = $scope.info.sdflow_type;
        _sdflow_types = _sdflow_types.split(',');
        for (var i = 0; i < $scope.data.flow_type_list.length; i++) {
            var _flow_type = $scope.data.flow_type_list[i];
            for (var j = 0; j < _sdflow_types.length; j++) {
                if (_flow_type.key == _sdflow_types[j]) {
                    _flow_type.flag = true;
                }
            }
        }
    }
    //处理周期时间
    var dealCycleTime = function (_data) {
        if (_data.cycle_info) {
            _data.cycle_info.cycles = [];
            if (_data.cycle_info.cycle_type == 1) {
                if (_data.cycle_info.customize_time_list) {
                    for (var i = 0; i < _data.cycle_info.customize_time_list.length; i++) {
                        var _dataValue = _data.cycle_info.customize_time_list[i].substring(0, 10);
                        var _dataStrShow = _data.cycle_info.customize_time_list[i].substring(0, 4) + "年" + _data.cycle_info.customize_time_list[i].substring(5, 7) + "月" + _data.cycle_info.customize_time_list[i].substring(8, 10);
                        var _hh = _data.cycle_info.customize_time_list[i].substring(11, 13);
                        var _mi = _data.cycle_info.customize_time_list[i].substring(14, 16);
                        _data.cycle_info.cycles.push({
                            ww: 0,
                            dd: 0,
                            mm: 0,
                            hh: _hh,
                            mi: _mi,
                            customize_times: '',
                            date: _dataValue,
                            date_str: _dataStrShow
                        })
                    }
                }
            } else if (_data.cycle_info.cycle_type == 2) {
                _data.cycle_info.cycles = _data.cycle_info.cycleTimeBeen;
                _data.cycle_info.time_unit = _data.cycle_info.cycleTimeBeen[0].unit;
            } else {
                if (_data.cycle_info.loop_time) {
                    _data.cycle_info.cycles = [_data.cycle_info.loop_time];
                    _data.cycle_info.time_unit = _data.cycle_info.loop_time.unit;
                }
            }
        }
        return _data;
    }
    //处理返回的时间
    var dealTimingData = function (obj) {
        //开始时间-结束时间处理
        if (obj.start_bk_datetime) {
            obj.start_bk_datetime_val = obj.start_bk_datetime.substring(0, 4) + "年" + obj.start_bk_datetime.substring(5, 7) + "月" + obj.start_bk_datetime.substring(8, 10);
        }
        if (obj.end_bk_datetime) {
            obj.end_bk_datetime_val = obj.end_bk_datetime.substring(0, 4) + "年" + obj.end_bk_datetime.substring(5, 7) + "月" + obj.end_bk_datetime.substring(8, 10);
        }
        //处理周期
        var _data = angular.copy(obj);
        dealCycleTime(_data);
        obj.cycle_info = _data.cycle_info || {};
        return obj;
    }
    //配置时间
    $scope.configTime = function (flag) {
        var _data = angular.copy($scope.info);
        dealCycleTime(_data); //处理周期时间
        _data.view_flag = flag;
        Modal.configFlowTime(_data).then(function (data) {
        })
    };
    //初始化方法
    var init = function () {
        Flow.viewFlowBasicInfo($stateParams.flow_id, $stateParams.version_id).then(function (data) {
            $scope.info = data.basicInfo;
            $scope.info.sdarrange_method = data.basicInfo.sdarrange_method || 1;
            $scope.info.scene_name = data.scene_name || '--';
            $scope.info.sdstrategy_name = data.sdstrategy_name || '--';
            $scope.info.strategy_concurrent = data.strategy_concurrent || '';
            $scope.info.strategy_type = data.strategy_type || '';
            $scope.info.scene_id = data.scene_main_id || '';
            //处理返回的流程类型
            dealFlowType();
            //处理定时数据
            angular.extend($scope.info, dealTimingData(data.sdFlowJsonBean ? data.sdFlowJsonBean : {}));
        }, function (error) {
            Modal.alert(error.message);
        });
    }
    init();
}]);
//复制流程基本信息
flow.controller('flowBasicInfoCopyCtrl', ['$scope', '$stateParams', '$timeout', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'StrategyPriority','Params', 'Modal', 'CV', function ($scope, $stateParams, $timeout, $state, Flow, FlowType, Scene, Strategy, StrategyPriority,Params, Modal, CV) {
    var _flow_id = $stateParams.flow_id; //流程id
    var _version_id = $stateParams.version_id;  //流程版本id
    $scope.data = {
        scene_list: [],  //场景列表
        strategy_group_list: [], //策略组列表
        strategy_priority_list: StrategyPriority, //策略组的优先级
        flow_type_list: angular.copy(FlowType),    //流程类型列表
        save_btn_label: '保存',    //保存按钮上显示的文字
    }
    $scope.info = {
        workorder_form: '',  //表单名
        sdflow_cn_name: '', //流程中文名
        sdarrange_method: 1,   //编排方式(1：简单。2：复杂)
        sdparallel_task: 1, //重复执行（1：允许。2：不允许）
        sddispatch_type: 1, //执行类型（1：人工。2：定时）
        sd_strategy_id: '', //策略组id
        sd_priority: 5,  //优先级
        sdflow_types: [], //流程类型列表
    }
    //控制页面状态
    $scope.control = {
        show_basic_detail: false,//展开收起
        scene_loading: false,    //选择场景 加载中
        strategy_loading: false, //策略组 加载中
        name_edit_flag: true,    //流程名是否可编辑
        basic_saveing: false,    //流程是否保存状态
    };
    //获取场景列表
    var getSceneList = function () {
        $scope.control.scene_loading = true;
        Scene.getSceneListByType({key_word: '', data: {offset: 0}}).then(function (data) {
            $timeout(function () {
                $scope.control.scene_loading = false;
                $scope.data.scene_list = data.scene_list ? data.scene_list.filter(function (item) {
                    return item.scene_type !== 3
                }) : []; //非私有场景
            }, 0)
        }, function (error) {
            $scope.control.scene_loading = false;
            Modal.alert(error.message)
        });
    }
    //获取策略组列表
    var getStrategyList = function () {
        Strategy.getStrategyGroupList().then(function (data) {
            $timeout(function () {
                $scope.control.strategy_loading = false;
                if (data.strategy_group_list) {
                    $scope.data.strategy_group_list = data.strategy_group_list;
                    //默认为并行策略组
                    if (!$scope.info.sd_strategy_id) {
                        $scope.data.strategy_group_list.some(function (item, index) {
                            return (item.sdstrategy_type === 1) && ($scope.info.sd_strategy_id = $scope.data.strategy_group_list[index].sdstrategy_id);
                        });
                    }
                }
            }, 0)
        }, function (error) {
            $scope.control.strategy_loading = false;
            Modal.alert(error.message);
        });
    }
    //根据id获取页面基本信息
    var getFlowBasicDetail = function () {
        Flow.viewFlowBasicInfo(_flow_id, _version_id).then(function (data) {
            $scope.info.sdflow_cn_name = '';
            $scope.info.sdflow_bk_desc = '';
            $scope.info.sddispatch_type = data.basicInfo.sddispatch_type || 1;
            $scope.info.sdparallel_task = data.basicInfo.sdparallel_task || 1;
            $scope.info.sdarrange_method = data.basicInfo.sdarrange_method || 1;
            $scope.info.sdflow_type = data.basicInfo.sdflow_type || '';
            $scope.info.sd_strategy_id = data.basicInfo.sd_strategy_id || '';
            $scope.info.scene_main_id = data.basicInfo.scene_main_id || '';


            $scope.info.sd_strategy_id && $scope.selectStrategy($scope.info.sd_strategy_id);

            //处理流程类型
            var _sdflow_types = $scope.info.sdflow_type.split(',');
            for (var i = 0; i < $scope.data.flow_type_list.length; i++) {
                var _opflow = $scope.data.flow_type_list[i];
                for (var j = 0; j < _sdflow_types.length; j++) {
                    if (_opflow.key == _sdflow_types[j]) {
                        $scope.data.flow_type_list[i].flag = true;
                    }
                }
            }
        }, function (error) {
            Modal.alert(error.message);
        });
    }
    //根据策略id查找类型
    var findStrategyTypeById = function (strategy_id) {
        if (!strategy_id) return {};
        var _single_strategy;
        for (var i = 0; i < $scope.data.strategy_group_list.length; i++) {
            var _strategy = $scope.data.strategy_group_list[i];
            if (_strategy.sdstrategy_id === strategy_id) {
                _single_strategy = {
                    strategy_name: _strategy.sdstrategy_name ? _strategy.sdstrategy_name : '',
                    strategy_type: _strategy.sdstrategy_type ? _strategy.sdstrategy_type : 0,
                    strategy_concurrent: _strategy.sdstrategy_concurrent ? _strategy.sdstrategy_concurrent : 0,
                };
                break;
            }
        }
        return _single_strategy;
    }
    var init = function () {
        //获取场景列表
        getSceneList();
        //获取策略组列表
        getStrategyList();
        //根据id获取页面基本信息
        getFlowBasicDetail();
    }
    //选择策略组
    $scope.selectStrategy = function (strategy_id) {
        var _curr_strategy = findStrategyTypeById(strategy_id); //根据策略id查找类型
        $scope.info.sd_strategy_id = strategy_id;
        if (_curr_strategy) {
            $scope.control.strategy_type = _curr_strategy.strategy_type;    //策略类型
            $scope.control.strategy_concurrent = _curr_strategy.strategy_concurrent;    //策略
            $scope.info.strategy_name = _curr_strategy.strategy_name;  //策略组名
        }
    };
    //修改-流程基本信息
    $scope.save = function () {
        if (!CV.valiForm($scope.info.workorder_form)) {
            return false;
        }
        //保存基本信息
        $scope.control.basic_saveing = true;
        //处理流程类型
        for (var i = 0; i < $scope.data.flow_type_list.length; i++) {
            var _type = $scope.data.flow_type_list[i];
            _type.flag && $scope.info.sdflow_types.push($scope.data.flow_type_list[i].key);
        }
        Flow.saveFlowBasicData($scope.info, false).then(function (data) {
            if (data) {
                Params.setParams({flow_id:_flow_id,version_id:_version_id});
                $state.go('dispatch_flow_edit', {
                    flow_id: data.sdflow_id,
                    version_id: data.sdversion_id
                });
            }
        }, function (error) {
            $scope.control.basic_saveing = false;
            Modal.alert(error.message);
        });
    };
    init();
}]);
//流程图新增、修改
flow.controller('flowChartEditCtrl', ['$scope', '$stateParams', '$timeout', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'ElementCategory', 'User', 'ScrollConfig','Params', 'Modal', 'CV', function ($scope, $stateParams, $timeout, $state, Flow, FlowType, Scene, Strategy, ElementCategory, User, ScrollConfig,Params, Modal, CV) {
    var _sdflow_id = Params.getParams().flow_id ? Params.getParams().flow_id : $stateParams.flow_id;
    var _sdversion_id = Params.getParams().version_id ? Params.getParams().version_id : $stateParams.version_id;
    $scope.info.sdflow_id = $stateParams.flow_id;
    $scope.info.sdversion_id = $stateParams.version_id;
    //将父控制中的基本信息缓存起来
    angular.extend($scope.control, {
        modify_flag: $stateParams.modify_flag || false,   //判断是否是修改
        job_config: false,    //控制右侧属性配置显示
        reflash_node: false,    //节点刷新控制
        load_flow: false,  //控制指令的加载
        selectKeyFromIns: 0,
        user_config_show: false,    //控制执行人的显示隐藏
        basic_ele: true,     //基础元素默认展开
        basic_ele1: true,
        basic_ele2: true,
        basic_ele3: true,
        basic_ele4: true,
        private_ele: false,    //私有元素默认展开
        palette0: true,    //条件展开收起
        palette1: true,     //轮询展开收起
        palette2: true,     //文件展开收起
        palette3: true,     //数据库展开收起
        palette4: true,     //网络展开收起
        palette5: true,     //应用展开收起
        palette6: true,     //脚本展开收起
        palette7: true,     //服务展开收起
        palette8: true,     //其他展开收起
        palette9: false,     //其他展开收起
    });
    $scope.data = {
        user_list: [],   //可选用户列表
        s95:[],
        hf:[],
        paperma:[],
        tobacco:[],
        treeStu:{
            num:0,
            name:""
        },
        treeOneStu:{
            num:0,
            name:""
        },
        treeTwoStu:{
            num:0,
            name:""
        },
        treeInfo:{
            num:0,
            name:""
        },
        palette_list: {      //模板数据
            condition_list: [],  //条件下的数据
            polling_list: [  //轮询模块下的数据
                {category: "7", text: "轮询", type: 6, sd_job_bean: {}},
            ],
            file_list: [     //文件模块下的数据
                {category: "7", text: "ftp文件", type: 7, sd_job_bean: {}},
                {category: "7", text: "ftp文件", type: 8, sd_job_bean: {}},
                {category: "7", text: "sftp文件", type: 9, sd_job_bean: {}},
                {category: "7", text: "sftp文件", type: 10, sd_job_bean: {}},
                {category: "7", text: "agent文件", type: 11, sd_job_bean: {}},
                {category: "7", text: "agent文件", type: 12, sd_job_bean: {}},
                {category: "7", text: "拷贝文件", type: 13, sd_job_bean: {}}
            ],
            db_list: [       //数据库模块下的数据
                {category: "7", text: "数据库", type: 14, sd_job_bean: {}},
                {category: "7", text: "数据库脚本", type: 15, sd_job_bean: {}},
            ],
            web_list: [      //网络模块下的数据
                {category: "7", text: "网络配置", type: 16, sd_job_bean: {}},
            ],
            apply_list: [    //应用模块下的数据
                {category: "7", text: "应用启动", type: 17, sd_job_bean: {}},
                {category: "7", text: "应用停止", type: 18, sd_job_bean: {}},
            ],
            shell_list: [    //脚本模块下的数据
                {category: "7", text: "Python", type: 19, sd_job_bean: {}},
                {category: "7", text: "Shell", type: 20, sd_job_bean: {}},
                {category: "7", text: "Bat", type: 21, sd_job_bean: {}},
                {category: "7", text: "Java", type: 30, sd_job_bean: {}},
                {category: "7", text: "C", type: 31, sd_job_bean: {}},
                {category: "7", text: "C++", type: 32, sd_job_bean: {}},
            ],
            webS_list: [     //服务模块下的数据
                {category: "7", text: "WebService", type: 24, sd_job_bean: {}},
                {category: "7", text: "Tcp", type: 25, sd_job_bean: {}},
                {category: "7", text: "HTTP", type: 26, sd_job_bean: {}},
            ],
            other_list: [    //其他模块下的数据
                {category: "9", text: "CL", type: 28, sd_job_bean: {}},
                {category: "9", text: "RPG", type: 29, sd_job_bean: {}},
            ],
            hf_list: [    //其他模块下的数据
                {category: "9", text: "site", type: 33, sd_job_bean: {}},
            ],
            hf_list_one: [    //其他模块下的数据
                {category: "9", text: "area", type: 34, sd_job_bean: {}},
            ],
            hf_list_two: [    //其他模块下的数据
                {category: "9", text: "cell", type: 35, sd_job_bean: {}},
            ],
            hf_list_info: [    //其他模块下的数据
                {category: "9", text: "unit", type: 36, sd_job_bean: {}},
            ],
        },
        private_palette_list: [],    //私有元素模板
        scene_palette_list: [],      //场景元素模板
        attr_data: {               //属性配置需要的数据
            pre_job_basic_data: [], //前置作业列表
            ref_job_list: [],        //引用作业列表 前端选择用
        }
    };

    $scope.initTree = function(name){
        for(var i=0;i<$scope.data[name].length;i++){
            $scope.data[name][i].stu = false;
            $scope.data[name][i].re = false;
        }
    }

    $scope.treeData = {
        s95:{
            cen:[{name:'s95',iden:'s95'}],
            site:[
                {
                    category: "7",
                    text: "site",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "area",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "cell",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "unit", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 36, sd_job_bean: {}},
                                    ]
                                },
                            ]
                        },
                    ]
                }
            ],
        },
        hf:{
            cen:[{name:'恒丰纸业工厂模型',iden:'hf'}],
            site:[
                {
                    category: "7",
                    text: "一分厂",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "造纸车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "打浆段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "打浆机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "贮浆罐", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "混浆机", type: 36, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "造纸段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "压榨机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "干燥机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "卷取机", type: 36, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "成品段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "复卷机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "分切机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "包装机", type: 36, sd_job_bean: {}},
                                    ]
                                }
                            ]
                        },
                        {
                            category: "7",
                            text: "印刷车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[]
                        }
                    ]
                },
                {category: "7", text: "二分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "三分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "四分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "五分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "六分厂", type: 33, sd_job_bean: {},area:[]}
                ],
        },
        paperma:{
            cen:[{name:'恒丰纸业工厂模型',iden:'paperma'}],
            site:[
                {
                    category: "7",
                    text: "一分厂",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "造纸车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "打浆段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "打浆机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "贮浆罐", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "混浆机", type: 36, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "造纸段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "压榨机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "干燥机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "卷取机", type: 36, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "成品段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "复卷机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "分切机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "包装机", type: 36, sd_job_bean: {}},
                                    ]
                                }
                            ]
                        },
                        {
                            category: "7",
                            text: "印刷车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[]
                        }
                    ]
                }
            ],
        },
        tobacco:{
            cen:[{name:'烟草行业模型库',iden:'tobacco'}],
            site:[
                {
                    category: "7",
                    text: "site",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "area",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "cell",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "加料机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "电子称", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "回潮机", type: 36, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "cell",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "切丝机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "烘丝机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "储柜", type: 36, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "cell",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "卷接机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "包装机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "封箱机", type: 36, sd_job_bean: {}},
                                        {category: "7", text: "喂丝机", type: 36, sd_job_bean: {}},
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
        }
    }

    for(var v in $scope.treeData){
        treeInit($scope.treeData[v],$scope.treeData[v].cen[0].iden);
    }

    function treeInit(data,name){
        for(var i=0;i<data.site.length;i++){
            $scope.data[name].push({
                num:name+i.toString(),
                stu:false,
                re:false,
                child:[],
                data:[data.site[i]],
                name:name
            });
            for(var v=0;v<data.site[i].area.length;v++){
                $scope.data[name][i].child.push({
                    num:name+i.toString()+v.toString(),
                    stu:false,
                    re:false,
                    child:[],
                    data:[data.site[i].area[v]]
                });
                for(var k=0;k<data.site[i].area[v].cell.length;k++){
                    $scope.data[name][i].child[v].child.push({
                        num:name+i.toString()+v.toString()+k.toString(),
                        stu:false,
                        re:false,
                        child:[],
                        data:[data.site[i].area[v].cell[k]]
                    });
                    for(var j=0;j<data.site[i].area[v].cell[k].unit.length;j++){
                        $scope.data[name][i].child[v].child[k].child.push(
                            {
                            num:name+i.toString()+v.toString()+k.toString()+j.toString(),
                            data:[data.site[i].area[v].cell[k].unit[j]]
                        })
                    }
                }
            }
        }
    }


    $scope.$on('reLoad',function(even,data){
            $scope.data.treeStu.num++;
            $scope.data.treeStu.name = data.name;
    })
    $scope.$on('reLoadOne',function(even,data){
        $scope.data.treeOneStu.num++;
        $scope.data.treeOneStu.name = data.name;
    })
    $scope.$on('reLoadTwo',function(even,data){
        $scope.data.treeTwoStu.num++;
        $scope.data.treeTwoStu.name = data.name;
    })
    $scope.$on('reLoadInfo',function(even,data){
        $scope.data.treeInfo.num++;
        $scope.data.treeInfo.name = data.name;
    })


    $scope.treeOne = function(v,name){
        $scope.data[name][v].stu = !$scope.data[name][v].stu;
        if(!$scope.data[name][v].stu){
            $scope.data[name][v].re = false;
        }
        for(var i=0;i<$scope.data[name][v].child.length;i++){
            $scope.data[name][v].child[i].stu = false;
            $scope.data[name][v].child[i].re = false;
            for(var k=0;k<$scope.data[name][v].child[i].child.length;k++){
                $scope.data[name][v].child[i].child[k].stu = false;
                $scope.data[name][v].child[i].child[k].re = false;
            }
        }
    }

    $scope.treeTwo = function(v1,v2,name){
        $scope.data[name][v1].child[v2].stu = !$scope.data[name][v1].child[v2].stu;
        if(!$scope.data[name][v1].child[v2].stu){
            $scope.data[name][v1].child[v2].re = false;
        }
        for(var i=0;i<$scope.data[name][v1].child[v2].child.length;i++){
            $scope.data[name][v1].child[v2].child[i].stu = false;
            $scope.data[name][v1].child[v2].child[i].re = false;
        }
    }
    $scope.treeInfo = function(v1,v2,v3,name){
        $scope.data[name][v1].child[v2].child[v3].stu = !$scope.data[name][v1].child[v2].child[v3].stu;
        if(!$scope.data[name][v1].child[v2].child[v3].stu){
            $scope.data[name][v1].child[v2].child[v3].re = false;
        }
    }

    //流程插件配置
    $scope.configs = {
        drag_left_scroll: ScrollConfig,//左侧滚动条配置
        undoOpreation: {},   //撤销obj
        redoOpreation: {},   //前进obj
        layoutArray: {       //自动排列
            autoArrang: false,
        },
    };
    $scope.flow_info = {    //流程图信息
        nodeDataArray: [],   //节点列表
        linkDataArray: [],   //关系列表
    }
    //根据编排方式返回基础元素的数据
    var initDataByArrangMethod = function () {
        if ($scope.info.sdarrange_method == 1) {
            $scope.data.palette_list.condition_list = [
                {category: "1", text: "开始", type: 1, sd_job_bean: {}},
                {category: "2", text: "结束", type: 2, sd_job_bean: {}},
                {category: "6", text: "作业分组", "isGroup": true, type: 3, grid: 0},
                {category: "3", text: "条件", type: 4, sd_job_bean: {}},
                {category: "5", text: "中断", type: 5, sd_job_bean: {}},
            ]
        } else {
            $scope.data.palette_list.condition_list = [
                {category: "1", text: "开始", type: 1, sd_job_bean: {}},
                {category: "2", text: "结束", type: 2, sd_job_bean: {}},
                {category: "3", text: "条件", type: 4, sd_job_bean: {}},
                {category: "5", text: "中断", type: 5, sd_job_bean: {}},
            ]
        }
        //拿到数据后再加载指令
        $scope.control.load_flow = true;
    }

    //元素分类转中文
    var categoryToCn = function (category) {
        return category ? CV.findValue(category, ElementCategory) : '--';
    };
    //获取用户列表
    var getUserList = function () {
        User.getAllUserCanExec().then(function (data) {
            $scope.data.user_list = data.user_dept_list || [];
            //处理执行人
            $scope.flow_info.exe_user_list = $scope.flow_info.exe_user_ids || [];
            for (var i = 0; i < $scope.flow_info.exe_user_list.length; i++) {
                var _check_user = $scope.flow_info.exe_user_list[i];
                for (var j = 0; j < $scope.data.user_list.length; j++) {
                    var _user = $scope.data.user_list[j];
                    if (_user.user_id === _check_user) {
                        _user.flag = true;
                    }
                }
            }
            //获取场景元素（包含私有元素）
            getEleListBySceneId($scope.info.scene_main_id);
        }, function (error) {
            $scope.control.basic_saveing = false;
            Modal.alert(error.message);
        });
    };
    //获取场景元素by编号(包含私有场景)
    var getEleListBySceneId = function (scene_id) {
        Scene.getSingleSceneDetail(scene_id, true).then(function (data) {
            $timeout(function () {
                //主场景处理
                var _category_list = data.scene_bean ? (data.scene_bean.category_list ? data.scene_bean.category_list : []) : [];
                //私有场景处理
                var _private_category_list = data.private_scene_bean ? (data.private_scene_bean.category_list ? data.private_scene_bean.category_list : []) : [];

                for (var i = 0; i < _category_list.length; i++) {
                    var _category = _category_list[i];
                    _category.element_list = _category.element_list ? _category.element_list : [];
                    _category.category_cn = _category.text ? _category.text : categoryToCn(_category.category);
                    for (var j = 0; j < _category.element_list.length; j++) {
                        var _ele = _category.element_list[j];
                        _ele.category = '7'; //添加到流程的分类默认为（普通作业）
                        _ele.sd_job_bean = _ele.element_info ? _ele.element_info : {};
                        _ele.text = _ele.sd_job_bean.sdwork_cn_name ? _ele.sd_job_bean.sdwork_cn_name : _ele.text; //元素名称
                        _ele.sd_job_bean.is_special_element = true; //非基本元素
                    }
                }
                if (_category_list.length) {
                    var _single_scene = {
                        scene_id: data.scene_bean.scene_id,
                        scene_name: data.scene_bean.scene_name,
                        category_list: _category_list
                    };
                    $timeout(function () {
                        $scope.data.scene_palette_list.push(_single_scene);
                    }, 10);
                }

                //私有场景处理
                var _private_palette_list = [];
                for (var m = 0; m < _private_category_list.length; m++) {
                    var _private_category = _private_category_list[m];
                    _private_category.element_list = _private_category.element_list ? _private_category.element_list : [];
                    _private_category.category_cn = _private_category.text ? _private_category.text : categoryToCn(_private_category.category);
                    for (var n = 0; n < _private_category.element_list.length; n++) {
                        var _private_ele = _private_category.element_list[n];
                        _private_ele.element_info = _private_ele.element_info ? _private_ele.element_info : {};
                        _private_ele.element_info.is_special_element = true; //非基本元素
                        _private_palette_list.push({
                            category: '7',                              //元素分类(私有元素暂为7：普通元素)
                            type: _private_ele.type,               //元素类型
                            text: _private_ele.element_info.sdwork_cn_name ? _private_ele.element_info.sdwork_cn_name : _private_ele.text,    //元素名称
                            sd_job_bean: _private_ele.element_info     //元素属性信息
                        });
                    }
                }
                if (_private_palette_list.length) {
                    $scope.data.private_palette_list = _private_palette_list; //私有元素模板数据
                }

                //保存成功-数据准备完成(可以编辑流程)
                $scope.control.collapse_basic_detail = true;
                //更新私有元素
                _private_palette_list.length && $scope.$broadcast("updatePalette");
                set_div_height(500, true);
            }, 0)
        }, function (error) {
            //$scope.control.basic_saveing = false;
            //if(_is_update){
            //    $scope.control.basic_save_flag = true;
            //}else{
            //    $scope.control.basic_save_flag = false;
            //    $scope.control.modify = true;
            //}
            Modal.alert(error.message);
        });
    };
    //设置流程画布各容器高度
    var set_div_height = function (timeout, reset_canvas) {
        var _timeout = timeout || 5;
        $timeout(function () {
            if ($('.header_bg').offset()) {
                var _height = $(window).height() - $('.header_bg').offset().top - 75;
                $('.dragLeft').css('height', _height);
                $('.dragMid').css('height', _height);
                $('.grid_bg').css('height', _height);
                $('.job_div').css('height', _height - 31 -58); //31 头部标题高度 58底部按钮高度
                $('.jobno_div').css('height', _height - 1);
                if (reset_canvas) $scope.autoArray();
            }
        }, _timeout);
    }
    //处理修改时返回的数据
    var dealDataWhenModify = function () {
        //处理连线
        $scope.flow_info.link_list = $scope.flow_info.link_list || [];
        for (var i = 0; i < $scope.flow_info.link_list.length; i++) {
            var _link = $scope.flow_info.link_list[i];
            if (_link.visible) {
                _link.text = _link.expr;
            }
        }
        $scope.flow_info.linkDataArray = $scope.flow_info.link_list;
        //开始时间-结束时间处理
        if ($scope.flow_info.start_bk_datetime) {
            var _start_date = $scope.flow_info.start_bk_datetime;
            $scope.flow_info.start_bk_datetime_val = _start_date.substring(0, 4) + "年" + _start_date.substring(5, 7) + "月" + _start_date.substring(8, 10);
        }
        if ($scope.flow_info.end_bk_datetime) {
            var _end_date = $scope.flow_info.end_bk_datetime;
            $scope.flow_info.end_bk_datetime_val = _end_date.substring(0, 4) + "年" + _end_date.substring(5, 7) + "月" + _end_date.substring(8, 10);
        }
        //处理周期
        var _data = angular.copy($scope.flow_info);
        if (_data.cycle_info) {
            if (_data.cycle_info.cycle_type == 1) {
                if (_data.cycle_info.customize_time_list) {
                    _data.cycle_info.cycles = [];
                    for (var i = 0; i < _data.cycle_info.customize_time_list.length; i++) {
                        var _custom_time = _data.cycle_info.customize_time_list[i];
                        var _dataValue = _custom_time.substring(0, 10);
                        var _hh = _custom_time.substring(11, 13);
                        var _mi = _custom_time.substring(14, 16);
                        var _dataStrShow = _custom_time.substring(0, 4) + "年" + _custom_time.substring(5, 7) + "月" + _custom_time.substring(8, 10);
                        _data.cycle_info.cycles.push({
                            ww: 0,
                            dd: 0,
                            mm: 0,
                            hh: _hh,
                            mi: _mi,
                            customize_times: '',
                            date: _dataValue,
                            date_str: _dataStrShow
                        })
                    }
                }
            } else if (_data.cycle_info.cycle_type == 2) {
                _data.cycle_info.cycles = _data.cycle_info.cycleTimeBeen;
                _data.cycle_info.time_unit = _data.cycle_info.cycleTimeBeen[0].unit;
            } else if (_data.cycle_info.cycle_type == 3) {
                _data.cycle_info.cycles = [_data.cycle_info.loop_time];
                _data.cycle_info.time_unit = _data.cycle_info.loop_time.unit;
            }
            $scope.flow_info.cycle_info = _data.cycle_info;
        }
    }
    var init = function () {
        Flow.viewFlowDetailData(_sdflow_id, _sdversion_id).then(function (data) {
            angular.extend($scope.flow_info, data.sdFlowJsonBean ? data.sdFlowJsonBean : {});
            $scope.flow_info.exe_user_ids = $scope.flow_info.exe_user_ids ? $scope.flow_info.exe_user_ids : ($scope.info.exe_user_ids ? $scope.info.exe_user_ids.split(',') : []);
            //获取已绘制的节点信息
            $scope.flow_info.nodeDataArray = $scope.flow_info.sd_node_list || [];
            for (var i = 0; i < $scope.flow_info.nodeDataArray.length; i++) {
                var _node = $scope.flow_info.nodeDataArray[i];
                _node.category = _node.category.toString();
                _node.isGroup = _node.is_group;
                _node.group = _node.group < 0 ? -_node.group : _node.group;
                _node.key = _node.key < 0 ? -_node.key : _node.key;
                //处理作业属性 时间条件
                var _sd_job_bean = _node.sd_job_bean;
                if (_sd_job_bean) {
                    if (_sd_job_bean.sdwork_cn_name) {
                        _sd_job_bean.config = true;
                    }
                    if (_sd_job_bean.datetime_condition) {
                        _sd_job_bean.date_condition = _sd_job_bean.datetime_condition.substring(0, 10);
                        _sd_job_bean.h_condition = _sd_job_bean.datetime_condition.substring(11, 13);
                        _sd_job_bean.m_condition = _sd_job_bean.datetime_condition.substring(14, 16);
                    }
                }
            }
            //处理修改时返回的数据
            dealDataWhenModify();
            //避免绘图不显示-重排
            $scope.autoArray();
            //查询用户集合并处理
            getUserList();
            //设置流程画布各容器高度
            set_div_height(20);
            //根据编排方式返回基础元素的数据
            initDataByArrangMethod();
        }, function (error) {
        })
    }
    //自动排列
    $scope.autoArray = function () {
        $scope.configs.layoutArray.autoArrang = !$scope.configs.layoutArray.autoArrang;
    };
    //编辑流程时-添加场景
    $scope.addScene = function () {
        Modal.addScene($scope.data.scene_palette_list).then(function (result) {
            if (result) {
                $scope.data.scene_palette_list = $scope.data.scene_palette_list.concat(result);
            }
        })
    };
    //保存流程图信息
    $scope.saveExendData = function () {
        if ($scope.info.sddispatch_type == 1 && $scope.flow_info.exe_user_list.length == 0) {
            Modal.alert("请配置执行人！");
            return false;
        }
        if ($scope.info.sddispatch_type == 2 && !$scope.flow_info.start_bk_datetime_val) {
            Modal.alert("请配置执行时间！");
            return false;
        }
        if ($scope.info.sddispatch_type == 2) {
            if ($scope.flow_info.cycle_info.cycle_type && $scope.flow_info.cycle_info.cycles.length == 0) {
                Modal.alert("执行时间配置不完整，请重配！");
                return false;
            }
        }
        for (var i = 0; i < $scope.flow_info.nodeDataArray.length; i++) {
            var _node_data = $scope.flow_info.nodeDataArray[i];
            if (_node_data.type == 1 || _node_data.type == 2) {
                _node_data.sd_job_bean.job_id = _node_data.key;
            }
            _node_data.is_group = _node_data.isGroup;
            _node_data.key = _node_data.key < 0 ? -_node_data.key : _node_data.key;
            if (_node_data.sd_job_bean) {
                _node_data.sd_job_bean.job_id = _node_data.key + '';
            }
            if (_node_data.type != 3) {
                _node_data.group = _node_data.group < 0 ? -_node_data.group : _node_data.group;
            }

        }
        for (var i = 0; i < $scope.flow_info.linkDataArray.length; i++) {
            var _link_data = $scope.flow_info.linkDataArray[i];
            if (_link_data.visible) {
                _link_data.expr = _link_data.text;
            }
            _link_data.from = _link_data.from < 0 ? -_link_data.from : _link_data.from;
            _link_data.to = _link_data.to < 0 ? -_link_data.to : _link_data.to;
        }
        $scope.flow_info.sdversion_id = $scope.info.sdversion_id;
        $scope.flow_info.sdflow_id = $scope.info.sdflow_id;
        //获得提交数据
        Flow.saveFlowExtendData($scope.flow_info).then(function () {
            if ($scope.info.sddispatch_type == 1) {
                $state.go('dispatch_flow_list', {active_name: 'handle'});
            } else {
                $state.go('dispatch_flow_list', {active_name: 'auto'});
            }
        }, function (error) {
            Modal.alert(error.message)
        });
    };
    //定时流程-配置时间
    $scope.configTime = function () {
        $scope.flow_info.cycle_info = $scope.flow_info.cycle_info || {};
        $scope.flow_info.cycle_info.customize_time_list = $scope.flow_info.cycle_info.customize_time_list || [];
        $scope.flow_info.cycle_info.cycleTimeBeen = $scope.flow_info.cycle_info.cycleTimeBeen || [];
        $scope.flow_info.cycle_info.loop_time = $scope.flow_info.cycle_info.loop_time || {};
        var _data = angular.copy($scope.flow_info);
        Modal.configFlowTime(_data).then(function (data) {
            $scope.flow_info.start_bk_datetime = data.start_bk_datetime;
            $scope.flow_info.end_bk_datetime = data.end_bk_datetime;
            $scope.flow_info.start_bk_datetime_val = CV.dtFormat(data.start_bk_datetime);
            $scope.flow_info.end_bk_datetime_val = CV.dtFormat(data.end_bk_datetime);
            $scope.flow_info.cycle_info.cycle_type = data.cycle_type;
            $scope.flow_info.cycle_info.cycles = data.cycles;
            $scope.flow_info.period_list_str = data.period_list_str;
            $scope.flow_info.time_unit = data.time_unit;
            $scope.flow_info.cycle_info.time_unit = data.time_unit;
            $scope.flow_info.cycle_info.customize_time_list = [];
            if ($scope.flow_info.cycle_info.cycle_type == 1) {
                for (var i = 0; i < $scope.flow_info.cycle_info.cycles.length; i++) {
                    var _one_cycle = $scope.flow_info.cycle_info.cycles[i];
                    _one_cycle.hh = _one_cycle.hh || '00';
                    _one_cycle.mi = _one_cycle.mi || '00';
                    var _hh_number = parseInt(_one_cycle.hh),_hh = '';
                        _hh = (_hh_number >=0 && _hh_number < 10) ? "0" + _hh_number : _hh_number;
                    var _mi_number = parseInt(_one_cycle.mi),_mi = '';
                        _mi = (_mi_number>=0 && _mi_number < 10) ? "0" + _mi_number : _mi_number;
                    $scope.flow_info.cycle_info.customize_time_list.push(_one_cycle.date + " " + _hh + ":" + _mi + ":00");
                }
            } else if ($scope.flow_info.cycle_info.cycle_type == 2) {
                for (var i = 0; i < $scope.flow_info.cycle_info.cycles.length; i++) {
                    $scope.flow_info.cycle_info.cycles[i].unit = data.time_unit;
                }
                $scope.flow_info.cycle_info.cycleTimeBeen = $scope.flow_info.cycle_info.cycles;
            } else {
                for (var i = 0; i < $scope.flow_info.cycle_info.cycles.length; i++) {
                    $scope.flow_info.cycle_info.cycles[i].unit = data.time_unit;
                }
                $scope.flow_info.cycle_info.loop_time = $scope.flow_info.cycle_info.cycles[0];
            }

            console.log($scope.flow_info.cycle_info);
        })
    };
    //显示执行人配置信息
    $scope.configUser = function () {
        $scope.control.user_config_show = !$scope.control.user_config_show;
    };
    //选择执行人
    $scope.chooseUser = function (index) {
        var _user = $scope.data.user_list[index];
        _user.flag = !_user.flag;
        if (_user.flag) {
            $scope.flow_info.exe_user_list.push(_user.user_id);
        } else {
            for (var i = 0; i < $scope.flow_info.exe_user_list.length; i++) {
                var _exe_user = $scope.flow_info.exe_user_list[i];
                if (_exe_user == _user.user_id)
                    $scope.flow_info.exe_user_list.splice(i, 1);
            }
        }
    };
    //保存执行人
    $scope.saveFlowExeUser = function () {
        if ($scope.info.sddispatch_type == 1 && $scope.flow_info.exe_user_list.length === 0) {
            Modal.alert("请选择执行人！");
            return false;
        }
        $scope.control.save_exeuser_loading = true;
        $scope.flow_info.sdflow_id =  $scope.info.sdflow_id;
        $scope.flow_info.sdversion_id = $scope.info.sdversion_id;
        Flow.editFLowExeUser($scope.flow_info).then(function (data) {
            $scope.control.user_config_show = !$scope.control.user_config_show;
            $scope.control.save_exeuser_loading = false;
        }, function (error) {
            $scope.control.save_exeuser_loading = false;
            Modal.alert(error.message)
        })
    };
    //点击节点进行配置
    $scope.config = function (key) {
        var _data = {
            linkDataArray: $scope.flow_info.linkDataArray,
            nodeDataArray: $scope.flow_info.nodeDataArray,
        }

        var _param = $scope.control.modify_flag ? 'dispatch_flow_modify' : 'dispatch_flow_edit';
        $state.go(_param + '.config', {
            config_data: _data,
            node_obj: key
        });
    }
    //点击空白画布右侧属性配置跳转到无数据页面
    $scope.goToNoDataPage = function () {
        var _param = $scope.control.modify_flag ? 'dispatch_flow_modify' : 'dispatch_flow_edit';
        set_div_height();
        $state.go(_param + '.no_data');
    }
    //编辑流程时-删除场景
    $scope.removeScene = function (index, scene_name, event) {
        event.stopPropagation();
        var _scene_prompt = scene_name ? "删除[ " + scene_name + " ]场景 ?" : '删除场景 ?';
        Modal.confirm(_scene_prompt).then(function () {
            $scope.data.scene_palette_list.splice(index, 1);
        });
    };
    //查看流程基本信息-展开收起
    $scope.togledetail = function () {
        $scope.control.show_basic_detail = !$scope.control.show_basic_detail;
        set_div_height(800, true);
    };
    //窗口变化处理
    $(window).resize(function () {
        set_div_height();
    });
    //添加私有场景元素
    $scope.$on("privatePalette",function (event,data) {
        $scope.$broadcast("addPalette",data)
    });
    //路由状态改变
    $scope.$on('$stateChangeSuccess',function () {
       Params.init();
    });
    init();

}]);
//流程图查看
flow.controller('flowChartDetailCtrl', ['$scope', '$stateParams', '$timeout', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'User', 'Modal', function ($scope, $stateParams, $timeout, $state, Flow, FlowType, Scene, Strategy, User, Modal) {
    $scope.info.sdflow_id = $stateParams.flow_id,
        $scope.info.sdversion_id = $stateParams.version_id,
        $scope.data = {
            user_list: [], //可选用户列表
        }
    $scope.flow_info = {    //流程图信息
        nodeDataArray: [],   //节点列表
        linkDataArray: [],   //关系列表
    }
    //设置流程画布各容器高度
    var set_div_height = function (timeout) {
        var _timeout = timeout || 5;
        $timeout(function () {
            if ($('.header_bg').offset()) {
                var _height = $(window).height() - $('.header_bg').offset().top - 75;
                $('.dragMid').css('height', _height);
                $('.grid_bg_detail').css('height', _height - 1);
                $('.job_div').css('height', _height - 31);
                $('.jobno_div').css('height', _height);
            }
        }, _timeout);
    }
    //处理修改时返回的数据
    var dealDataWhenModify = function () {
        //处理连线
        $scope.flow_info.link_list = $scope.flow_info.link_list || [];
        for (var i = 0; i < $scope.flow_info.link_list.length; i++) {
            var _link = $scope.flow_info.link_list[i];
            if (_link.visible) {
                _link.text = _link.expr;
            }
        }
        $scope.flow_info.linkDataArray = $scope.flow_info.link_list;
        //开始时间-结束时间处理
        if ($scope.flow_info.start_bk_datetime) {
            var _start_date = $scope.flow_info.start_bk_datetime;
            $scope.flow_info.start_bk_datetime_val = _start_date.substring(0, 4) + "年" + _start_date.substring(5, 7) + "月" + _start_date.substring(8, 10);
        }
        if ($scope.flow_info.end_bk_datetime) {
            var _end_date = $scope.flow_info.end_bk_datetime;
            $scope.flow_info.end_bk_datetime_val = _end_date.substring(0, 4) + "年" + _end_date.substring(5, 7) + "月" + _end_date.substring(8, 10);
        }
        //处理周期
        var _data = angular.copy($scope.flow_info);
        if (_data.cycle_info) {
            if (_data.cycle_info.cycle_type == 1) {
                if (_data.cycle_info.customize_time_list) {
                    _data.cycle_info.cycles = [];
                    for (var i = 0; i < _data.cycle_info.customize_time_list.length; i++) {
                        var _custom_time = _data.cycle_info.customize_time_list[i];
                        var _dataValue = _custom_time.substring(0, 10);
                        var _hh = _custom_time.substring(11, 13);
                        var _mi = _custom_time.substring(14, 16);
                        var _dataStrShow = _custom_time.substring(0, 4) + "年" + _custom_time.substring(5, 7) + "月" + _custom_time.substring(8, 10);
                        _data.cycle_info.cycles.push({
                            ww: 0,
                            dd: 0,
                            mm: 0,
                            hh: _hh,
                            mi: _mi,
                            customize_times: '',
                            date: _dataValue,
                            date_str: _dataStrShow
                        })
                    }
                }
            } else if (_data.cycle_info.cycle_type == 2) {
                _data.cycle_info.cycles = _data.cycle_info.cycleTimeBeen;
                _data.cycle_info.time_unit = _data.cycle_info.cycleTimeBeen[0].unit;
            } else if (_data.cycle_info.cycle_type == 3) {
                _data.cycle_info.cycles = [_data.cycle_info.loop_time];
                _data.cycle_info.time_unit = _data.cycle_info.loop_time.unit;
            }
            $scope.flow_info.cycle_info = _data.cycle_info;
        }
    }
    //获取用户列表
    var getUserList = function () {
        User.getAllUserCanExec().then(function (data) {
            $scope.data.user_list = data.user_dept_list || [];
            //处理执行人
            $scope.flow_info.exe_user_list = $scope.flow_info.exe_user_ids || [];
            for (var i = 0; i < $scope.flow_info.exe_user_list.length; i++) {
                var _check_user = $scope.flow_info.exe_user_list[i];
                for (var j = 0; j < $scope.data.user_list.length; j++) {
                    var _user = $scope.data.user_list[j];
                    if (_user.user_id === _check_user) {
                        _user.flag = true;
                    }
                }
            }
        }, function (error) {
            $scope.control.basic_saveing = false;
            Modal.alert(error.message);
        });
    };
    var init = function () {
        Flow.viewFlowDetailData($stateParams.flow_id, $stateParams.version_id).then(function (data) {
            angular.extend($scope.flow_info, data.sdFlowJsonBean ? data.sdFlowJsonBean : {});
            $scope.flow_info.exe_user_ids = $scope.flow_info.exe_user_ids ? $scope.flow_info.exe_user_ids : ($scope.info.exe_user_ids ? $scope.info.exe_user_ids.split(',') : []);

            //分层处理节点线条数据
            $scope.flow_info.nodeDataArray = $scope.flow_info.sd_node_list || [];
            for (var i = 0; i < $scope.flow_info.nodeDataArray.length; i++) {
                var _node = $scope.flow_info.nodeDataArray[i];
                _node.category = _node.category.toString();
                _node.isGroup = _node.is_group;
                _node.group = _node.group < 0 ? -_node.group : _node.group;
                _node.key = _node.key < 0 ? -_node.key : _node.key;
                //处理作业属性 时间条件
                var _job_bean = _node.sd_job_bean;
                if (_job_bean) {
                    if (_job_bean.datetime_condition) {
                        _job_bean.date_condition = _job_bean.datetime_condition.substring(0, 10);
                        _job_bean.h_condition = _job_bean.datetime_condition.substring(11, 13);
                        _job_bean.m_condition = _job_bean.datetime_condition.substring(14, 16);
                    }
                }
            }
            //处理修改时返回的数据
            dealDataWhenModify();
            //获取用户列表
            getUserList();
            set_div_height(50);
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //点击节点查看属性配置信息
    $scope.config = function (key) {
        var _data = {
            linkDataArray: $scope.flow_info.linkDataArray,
            nodeDataArray: $scope.flow_info.nodeDataArray,
        }
        $state.go('dispatch_flow_detail.config', {
            config_data: _data,
            node_obj: key
        });
    };
    //配置时间
    $scope.configTime = function (flag) {
        var _data = angular.copy($scope.flow_info);
        if (_data.cycle_info) {
            _data.cycle_info.cycles = [];
            if (_data.cycle_info.cycle_type == 1) {
                if (_data.cycle_info.customize_time_list) {
                    for (var i = 0; i < _data.cycle_info.customize_time_list.length; i++) {
                        var _dataValue = _data.cycle_info.customize_time_list[i].substring(0, 10);
                        var _dataStrShow = _data.cycle_info.customize_time_list[i].substring(0, 4) + "年" + _data.cycle_info.customize_time_list[i].substring(5, 7) + "月" + _data.cycle_info.customize_time_list[i].substring(8, 10);
                        var _hh = _data.cycle_info.customize_time_list[i].substring(11, 13);
                        var _mi = _data.cycle_info.customize_time_list[i].substring(14, 16);
                        _data.cycle_info.cycles.push({
                            ww: 0,
                            dd: 0,
                            mm: 0,
                            hh: _hh,
                            mi: _mi,
                            customize_times: '',
                            date: _dataValue,
                            date_str: _dataStrShow
                        })
                    }
                }
            } else if (_data.cycle_info.cycle_type == 2) {
                _data.cycle_info.cycles = _data.cycle_info.cycleTimeBeen;
                _data.cycle_info.time_unit = _data.cycle_info.cycleTimeBeen[0].unit;
            } else {
                _data.cycle_info.cycles = [_data.cycle_info.loop_time];
                _data.cycle_info.time_unit = _data.cycle_info.loop_time.unit;

            }
        } else {
            _data.cycle_info = {}
        }
        _data.view_flag = flag;
        Modal.configFlowTime(_data).then(function (data) {
        })
    };
    //显示执行人配置信息
    $scope.configUser = function () {
        $scope.control.user_config_show = !$scope.control.user_config_show;
    };
    //查看流程基本信息-展开收起
    $scope.togledetail = function () {
        $scope.control.show_basic_detail = !$scope.control.show_basic_detail;
        set_div_height(800);
    };
    //窗口变化处理
    $(window).resize(function () {
        set_div_height();
    });
    init();
}]);
//流程图属性配置
flow.controller('flowAttributeCtrl', ['$scope', '$stateParams', '$timeout', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'JobErrorType', 'PreJobErrorType', 'ParamValueSource', 'FlowJobType', 'CodeMirrorOption', 'CmptFunc', 'ProtocolType', 'CommData', 'RequestMethod', 'ScrollConfig', 'Modal', 'CV', function ($scope, $stateParams, $timeout, $state, FLow, FlowType, Scene, Strategy, JobErrorType, PreJobErrorType, ParamValueSource, FlowJobType, CodeMirrorOption, CmptFunc, ProtocolType, CommData, RequestMethod, ScrollConfig, Modal, CV) {
    console.log('_____________________________________')
    var _not_watch_types = [1, 2, 3, 5]; //不需要监听的类型
    $scope.data = {
        error_handle_list: JobErrorType,
        pre_error_handle_list: PreJobErrorType,
        param_source_list: ParamValueSource,
        request_method_list : RequestMethod,
        linkDataArray: $stateParams.config_data ? $stateParams.config_data.linkDataArray : [],
        nodeDataArray: $stateParams.config_data ? $stateParams.config_data.nodeDataArray : [],
    };
    $scope.info = {
        current_node: {},//当前节点数据
        attr_data: {} //属性数据
    }
    $scope.config = {
        drag_right_scroll: ScrollConfig, //中间滚动条配置
    }
    //初始化属性数据
    var inite_data = function (obj) {
        obj = obj || {};
        if ($scope.jobForm) $scope.jobForm.$setPristine(); //初始化表单
        $scope.info.attr_data = {
            is_special_element: obj.is_special_element || false,
            exec_script: obj.exec_script || '',
            business_sys_name: obj.business_sys_name || '',
            script_source: obj.script_source || 1,
            sql_source: obj.sql_source || 1,
            script_file_name: obj.script_file_name || '',
            dataBase_type: obj.dataBase_type || 1,
            service_name: obj.service_name || '',
            service_ip: obj.service_ip || '',
            service_url: obj.service_url || '',
            service_port: obj.service_port || '',
            service_comm_info: obj.service_comm_info || {},
            config: obj.config || false,
            comp_cn_name: obj.comp_cn_name || '',
            sdwork_cn_name: obj.sdwork_cn_name || '',			// 作业中文名
            job_bk_desc: obj.job_bk_desc || '',			// 作业描述
            over_type: obj.over_type || 1,               // 手动结束，自动结束
            comp_id: obj.comp_id || '',  			    // 组件ID
            input: obj.input || [],
            comp_impl_type: obj.comp_impl_type || '',         // 参数实现类型
            datetime_condition: obj.datetime_condition || '',		// 日期条件
            date_condition: obj.date_condition || '',
            h_condition: obj.h_condition || "",
            m_condition: obj.m_condition || "",
            timeused: obj.timeused || '',               // 执行预时
            pre_job_list: obj.pre_job_list || [],
            timeout: obj.timeout || "",				// 超时时间
            error_handle: obj.error_handle || 1,		    // 出错处理方式（1等待， 2跳过，3重试）
            retry_interval: obj.retry_interval || '',	        // 重试间隔（单位秒）
            retry_times: obj.retry_times || '',		    // 重试次数（默认三次）
            source_list: obj.source_list || [],            // 数据源
            pre_job_basic_data: obj.pre_job_basic_data || [],     // 前置作业列表
            ref_job_list: obj.ref_job_list || [],           // 引用作业列表 前端选择用
            ref_job_param_list: obj.ref_job_param_list || [],     // 引用参数列表 前端选择用
            polling_interval: obj.polling_interval || '',       // 轮询次数
            polling_max_times: obj.polling_max_times || '',       // 最大间隔
            output: obj.output || [],
            expr: obj.expr || '',				    // 表达式
            result_judge: obj.result_judge || '',           // 结果判定
            job_method: obj.job_method || 0,              // 作业类型 1是选择组件 2是自定义
            env_name: obj.env_name || '',               // 语言环境名（由以下四个组成）
            language_name: obj.language_name || '',          // 语言名称
            language_version: obj.language_version || '',       // 语言版本
            operating_system: obj.operating_system || '',       // 操作系统
            bit_number: obj.bit_number || '',             // 操作位数
            annex_file: obj.annex_file || '',              //c/c++附件
            plugin_list: obj.plugin_list || [],            // 插件列表(shell/python/java/c,c++)
            command: obj.command || {},            // 插件列表(shell/python/java/c,c++)
            request_method      : obj.request_method ||  1,  // 服务作业请求方式(1: Post 2:Get)
        }
    };
    //获取单个节点的配置信息
    var getNodeConfigInfo = function (obj) {
        var _from_key = '', _pre_list = [];
        $scope.info.current_node = obj;
        $scope.control.job_config = true;
        //模板库类型中文
        $scope.info.current_node.templateLib_type_cn = CV.findValue(obj.type, FlowJobType);

        //轮询作业处理
        if (obj.type == 6) {
            $scope.data.error_handle_list = [{key: 1, value: "等待"}, {key: 2, value: "跳过"}];
        } else {
            $scope.data.error_handle_list = JobErrorType;
        }

        if (obj.sd_job_bean.job_id) {
            inite_data(obj.sd_job_bean);
        } else {
            if (obj.sd_job_bean.sdwork_cn_name) {
                inite_data(obj.sd_job_bean);
            } else {
                inite_data();
            }
        }
        $scope.info.attr_data.job_id = obj.key;
        //处理前置集合/引用作业集合
        for (var j = 0; j < $scope.data.linkDataArray.length; j++) {
            var _link_data = $scope.data.linkDataArray[j];
            if (obj.group) {
                if (_link_data.to == obj.group) {
                    _from_key = _link_data.from;
                    _pre_list.push(_from_key);
                }
            } else {
                if (_link_data.to == obj.key) {
                    _from_key = _link_data.from;
                    _pre_list.push(_from_key);
                }
            }
        }
        var findPreNode = function (key) {
            if (!key && key !== 0) return;
            for (var i = 0; i < $scope.data.linkDataArray.length; i++) {
                var _link_data = $scope.data.linkDataArray[i];
                if (key == _link_data.to) {
                    _pre_list.push(_link_data.from);
                    findPreNode(_link_data.from);
                    break;
                }
            }
        };
        findPreNode(_from_key);
        $scope.info.attr_data.pre_job_basic_data = [];
        $scope.info.attr_data.ref_job_list = [];
        $scope.info.attr_data.ref_node_list = [];
        for (var i = 0; i < _pre_list.length; i++) {
            var _one_node = _pre_list[i];
            for (var j = 0; j < $scope.data.nodeDataArray.length; j++) {
                var _nodedata_array = $scope.data.nodeDataArray[j];
                if (!_nodedata_array.sd_job_bean) continue;

                var _job_id = _nodedata_array.sd_job_bean.job_id || '';
                var _job_cn_name = _nodedata_array.text;
                var _soc_list = _nodedata_array.sd_job_bean.source_list ? _nodedata_array.sd_job_bean.source_list : [];

                if (_nodedata_array.key == _one_node && _nodedata_array.type == 4) continue;
                if (_nodedata_array.key == _one_node && _nodedata_array.type != 3) {
                    $scope.info.attr_data.pre_job_basic_data.push({job_id: _job_id, sdwork_cn_name: _job_cn_name});//前置列表
                    $scope.info.attr_data.ref_job_list.push({
                        job_id: _job_id,
                        sdwork_cn_name: _job_cn_name,
                        source_list: _soc_list
                    });//引用列表
                }
            }
        }
        //处理引用参数集合/引用节点集合
        if (obj.sd_job_bean.input) {
            var _input_len = obj.sd_job_bean.input.length;
            if (_input_len === 0) return;
            for (var k = 0; k < _input_len; k++) {
                var _input_param = obj.sd_job_bean.input[k];
                if (_input_param.param_source == 2 && _input_param.ref_job_id) {
                    $scope.getRefJobParme(_input_param.ref_job_id, _input_param, true);
                }
            }
        }
    }
    //设置流程画布各容器高度
    var set_div_height = function (timeout) {
        var _timeout = timeout || 0;
        $timeout(function () {
            if ($('.header_bg').offset()) {
                var _height = $(window).height() - $('.header_bg').offset().top - 75;
                $('.grid_bg').css('height', _height);
                $('.job_div').css('height', _height - 31 - 58); //31 头部标题高度 58底部按钮高度
                $('.jobno_div').css('height', _height - 1);
            }
        }, _timeout);
    }
    var init = function () {
        $stateParams.node_obj && getNodeConfigInfo($stateParams.node_obj);
        set_div_height(200);
    }
    //公共-参数默认值输入框智能提示
    $scope.dispatchParamShellLoaded = function (_editor) {
        CodeMirrorOption.getDynamicRefParams(_editor);
        //项目参数动态更新
        $scope.$watch('info.attr_data', function (newValue, oldValue) {
            if (_not_watch_types.indexOf($scope.info.current_node.type) == -1) {
                var _new_params = [], _old_list = [];
                if ($scope.info.current_node.type == 4) {
                    _old_list = angular.copy(newValue.input);
                } else {
                    _old_list = angular.copy(newValue.output);
                }
                angular.forEach(_old_list, function (data, index, array) {
                    if (data.param_name) {
                        _new_params.push({
                            'key': '${' + data.param_name + '}',
                            'text': '${' + data.param_name + '}[' + data.param_cn_name + ']'
                        });
                    }
                });
                CodeMirrorOption.getDynamicRefParams(_editor, _new_params);
            }
        }, true)
    };
    //开始节点增加一个参数（输入）
    $scope.startAddSoc = function () {
        $scope.info.attr_data.input.push({
            param_name: '',
            param_cn_name: '',
            param_value: ''
        });
    };
    //开始节点删除一个参数（输入）
    $scope.removeStartSoc = function (index) {
        $scope.info.attr_data.input.splice(index, 1);
    };
    //配置作业时-添加私有元素
    $scope.addPrivateElement = function () {
        var _curr_node = {
            type: $scope.info.current_node.type,
            element_info: $scope.info.attr_data,
        };
        Modal.convertPrivateEle(_curr_node).then(function (result) {
            if (result) {
                var _element_name =  result.element_info.sdwork_cn_name || '';
                $scope.$emit("addPalette", result);
                Modal.alert("私有元素 [ "+ _element_name +" ] 添加成功");
            }
        })
    };
    //添加一个输入参数
    $scope.addInputParam = function (source) {
        $scope.info.attr_data.input.push({
            param_name: '',
            param_cn_name: '',
            param_source: source ? source : 1,
            param_value: ''
        });
    };
    //删除一个输入参数
    $scope.removeInputParam = function (index) {
        $scope.info.attr_data.input.splice(index, 1);
    };
    //选择出错处理方式
    $scope.selectErrorHandle = function (error_hadle) {
        if (error_hadle === 3) {
            $scope.info.attr_data.retry_times = 3;
            $scope.info.attr_data.retry_interval = 4;
        }
    };
    //新增前置信息
    $scope.addPreJobList = function () {
        $scope.info.attr_data.pre_job_list.push({job_id: '', sdwork_cn_name: '', error_handle: 1});
    };
    //删除前置
    $scope.removePreJob = function (index) {
        $scope.info.attr_data.pre_job_list.splice(index, 1);
    };
    //选择前置作业
    $scope.choosePreJob = function (job_id, one_pre) {
        for (var i = 0; i < $scope.info.attr_data.pre_job_basic_data.length; i++) {
            if ($scope.info.attr_data.pre_job_basic_data[i].job_id == job_id) {
                one_pre.sdwork_cn_name = $scope.info.attr_data.pre_job_basic_data[i].sdwork_cn_name;
            }
        }
    };
    //设置时间条件
    $scope.setTimeCondition = function () {
        var _date = {
            date_str: $scope.info.attr_data.date_condition,
            h_condition: $scope.info.attr_data.h_condition,
            m_condition: $scope.info.attr_data.m_condition
        };
        console.log(_date)
        Modal.configFlowTimeCondition(_date).then(function (data) {
            if (data) {
                var _month = (data.date.getMonth() + 1) < 10 ? '0' + (data.date.getMonth() + 1) : (data.date.getMonth() + 1);
                var _day = data.date.getDate() < 10 ? '0' + data.date.getDate() : data.date.getDate();
                $scope.info.attr_data.date_condition = data.date.getFullYear() + '-' + _month + '-' + _day;
                $scope.info.attr_data.h_condition = data.hh;
                $scope.info.attr_data.m_condition = data.mm;
            }
        })
    };
    //选择引用作业的输出参数
    $scope.getRefJobParme = function (ref_job_id, param, is_query) {
        param.is_no_node = false;
        if (!is_query) {
            param.ref_job_list = [];
            param.ref_param_name = '';
        }
        //条件作业输出参数只能引用
        if ($scope.info.current_node.type == 4) {
            param.param_source = 2;
        }
        for (var i = 0; i < $scope.data.nodeDataArray.length; i++) {
            var _node_data = $scope.data.nodeDataArray[i];
            if (_node_data.sd_job_bean) {
                if (_node_data.sd_job_bean.job_id == ref_job_id) {
                    if (_node_data.type == 1 || (_node_data.type > 23 && _node_data.type < 28)) param.is_no_node = true;
                    $scope.info.attr_data.ref_job_param_list = _node_data.sd_job_bean.output ? _node_data.sd_job_bean.output : [];
                    $scope.info.attr_data.ref_node_list = _node_data.sd_job_bean.source_list ? _node_data.sd_job_bean.source_list : [];
                }
            }
        }

    };
    //添加数据源
    $scope.addSoc = function () {
        $timeout(function () {
            $scope.info.attr_data.source_list.push({ip: '', soc_name: '', ip2: '', soc_name2: ''});
        }, 0);
    };
    //删除数据源
    $scope.removeOneSoc = function (index) {
        $scope.info.attr_data.source_list.splice(index, 1);
    };
    //同步未选择作业的高度
    $scope.noSelectJobHeight = function () {
        var _drag_mid_height = $('.dragMid').height();
        return {
            height: _drag_mid_height ? _drag_mid_height - 1 : 0
        }
    };
    //转化协议类型
    $scope.getProtocolTypeCnName = function (protocol_type) {
        return CV.findValue(protocol_type, ProtocolType).substring(0, 5).toLowerCase();
    };
    //配置数据源
    $scope.configSoc = function (imply_type) {
        var _imply_type = imply_type;
        if ($scope.info.current_node.type == 14 || $scope.info.current_node.type == 15) {
            _imply_type = '';
        }
        Modal.configDataSource(_imply_type, '', $scope.info.attr_data.source_list, 2).then(function (ret) {
            var _list = [];
            for (var i = 0; i < ret.length; i++) {
                if (imply_type > 2 && imply_type < 6) {
                    if (ret[i].exe_soc_name && ret[i].ver_soc_name) {
                        _list.push(ret[i]);
                    }
                } else {
                    if (ret[i].exe_soc_name) {
                        _list.push(ret[i]);
                    }
                }
            }
            $scope.info.attr_data.source_list = _list;
        });
    };
    //选择引用作业的节点
    $scope.selectRefNode = function (param) {
        param.ref_job_list = param.ref_job_list || [];
        Modal.selectFlowRefNode(param.ref_job_list, $scope.info.attr_data.ref_node_list).then(function (data) {
            if (data) {
                param.ref_job_list = data;
            }
        });
    };
    //设置作业方式
    $scope.setJobMethod = function () {
        var special_element = $scope.info.attr_data.is_special_element || false;
        console.log($scope.info.current_node.type)
        console.log($scope.info.attr_data)
        console.log(special_element)
        Modal.setFlowJobMethod($scope.info.current_node.type, $scope.info.attr_data, false, special_element).then(function (result) {
            $scope.info.attr_data.job_method = result.job_method;
            if (result.job_method == 1) {
                $scope.info.attr_data.comp_id = result.comp_id;
                $scope.info.attr_data.comp_impl_type = result.impl_type;
                $scope.info.attr_data.comp_cn_name = result.comp_cn_name;
                $scope.info.attr_data.input = result.input || [];
                $scope.info.attr_data.output = result.output || [];
                $scope.info.attr_data.exec_script = result.exec_script;
                $scope.info.attr_data.script_source = result.script_source;
                $scope.info.attr_data.env_name = result.env_name;
                $scope.info.attr_data.language_name = result.language_name;
                $scope.info.attr_data.language_version = result.language_version;
                $scope.info.attr_data.operating_system = result.operating_system;
                $scope.info.attr_data.bit_number = result.bit_number;
                $scope.info.attr_data.plugin_list = result.plugin_list;
                $scope.info.attr_data.annex_file = result.annex_file;
            } else {
                $scope.info.attr_data.comp_id = '';
                $scope.info.attr_data.comp_impl_type = result.impl_type;
                $scope.info.attr_data.output = result.output ? result.output : [];
                $scope.info.attr_data.input = result.param_list;
                $scope.info.attr_data.exec_script = result.exec_script;
                $scope.info.attr_data.business_sys_name = result.business_sys_name;
                $scope.info.attr_data.script_source = result.script_source;
                $scope.info.attr_data.sql_source = result.sql_source;
                $scope.info.attr_data.script_file_name = result.script_file_name;
                $scope.info.attr_data.dataBase_type = result.dataBase_type;
                $scope.info.attr_data.service_name = result.service_name;
                $scope.info.attr_data.service_port = result.service_port;
                $scope.info.attr_data.service_ip = result.service_ip;
                $scope.info.attr_data.service_url = result.service_url;
                $scope.info.attr_data.env_name = result.env_name;
                $scope.info.attr_data.language_name = result.language_name;
                $scope.info.attr_data.language_version = result.language_version;
                $scope.info.attr_data.operating_system = result.operating_system;
                $scope.info.attr_data.bit_number = result.bit_number;
                $scope.info.attr_data.plugin_list = result.plugin_list;
                $scope.info.attr_data.annex_file = result.annex_file;
                $scope.info.attr_data.request_method = result.request_method || 1;
                if (result.command && result.command.cmds) {
                    $scope.info.attr_data.command.exec_script = CmptFunc.cmdsToString(result.command.cmds);
                }
                for (var i = 0; i < $scope.info.attr_data.input.length; i++)  $scope.info.attr_data.input[i].param_source = 1;
            }
        })
    };
    //保存配置信息
    $scope.saveJobConfig = function () {
        if (!CV.valiForm($scope.jobForm)) {
            return false;
        }
        //处理服务类型的公共数据
        if($scope.info.current_node.type == 25){
            if (!$scope.info.attr_data.service_ip) {
                Modal.alert('请设置作业方式');
                return;
            }
            $scope.info.attr_data.service_comm_info = CommData;
        }
        if ($scope.info.current_node.type == 24 || $scope.info.current_node.type == 26) {
            if (!$scope.info.attr_data.service_name) {
                Modal.alert('请设置作业方式');
                return;
            }
            $scope.info.attr_data.service_comm_info = CommData;
        }

        if ($scope.info.attr_data.h_condition != '' || $scope.info.attr_data.m_condition != '') {
            var _h_condition = $scope.info.attr_data.h_condition.length == 1 ? '0' + $scope.info.attr_data.h_condition : $scope.info.attr_data.h_condition;
            var _m_condition = $scope.info.attr_data.m_condition.length == 1 ? '0' + $scope.info.attr_data.m_condition : $scope.info.attr_data.m_condition;
        } else {
            _h_condition = "00";
            _m_condition = "00";
        }
        if ($scope.info.attr_data.date_condition) {
            if (_h_condition > 23) {
                Modal.alert("时间条件小时输入有误，请重新输入");
                return false;
            }
            if (_m_condition > 59) {
                Modal.alert("时间条件分钟输入有误，请重新输入");
                return false;
            }
            $scope.info.attr_data.datetime_condition = $scope.info.attr_data.date_condition + " " + _h_condition + ":" + _m_condition + ":00";
        }

        if ($scope.info.current_node.type == 1) {
            $scope.info.attr_data.sdwork_cn_name = '开始';
            $scope.info.attr_data.output = $scope.info.attr_data.input || [];
        }
        if ($scope.info.current_node.type == 2) {
            $scope.info.attr_data.sdwork_cn_name = '结束';
            $scope.info.attr_data.output = $scope.info.attr_data.input || [];
        }
        for (var i = 0; i < $scope.data.nodeDataArray.length; i++) {
            if ($scope.data.nodeDataArray[i].key == $scope.info.current_node.key) {
                $scope.data.nodeDataArray[i].text = $scope.info.attr_data.sdwork_cn_name;
                $scope.data.nodeDataArray[i].sd_job_bean = $scope.info.attr_data;
                $scope.data.nodeDataArray[i].sd_job_bean.config = true;
            }
        }
        $scope.control.reflash_node = !$scope.control.reflash_node;
        $scope.control.job_config = false;
        $timeout(function () {
            var _height = $(window).height() - $('.header_bg').offset().top - 55;
            $('.jobno_div').css('height', _height - 1);
        }, 10);
        inite_data();
    };
    //取消作业配置
    $scope.cancelJobConfig = function () {
        $scope.control.job_config = false;
        $timeout(function () {
            var _height = $(window).height() - $('.header_bg').offset().top - 55;
            $('.jobno_div').css('height', _height - 1);
        }, 10)
    };
    //窗口变化处理
    $(window).resize(function () {
        set_div_height();
    });
    init();
}]);
//流程图属性查看
flow.controller('flowAttributeDetailCtrl', ['$scope', '$stateParams', '$timeout', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'JobErrorType', 'PreJobErrorType', 'ParamValueSource', 'FlowJobType', 'CodeMirrorOption', 'CmptFunc', 'ProtocolType', 'ScrollConfig', 'Modal', 'CV', function ($scope, $stateParams, $timeout, $state, FLow, FlowType, Scene, Strategy, JobErrorType, PreJobErrorType, ParamValueSource, FlowJobType, CodeMirrorOption, CmptFunc, ProtocolType, ScrollConfig, Modal, CV) {
    $scope.info = {
        current_node: {},//当前节点数据
        attr_data: {} //属性数据
    }
    $scope.data = {
        error_handle_list: JobErrorType,
        pre_error_handle_list: PreJobErrorType,
        param_source_list: ParamValueSource,
        linkDataArray: $stateParams.config_data ? $stateParams.config_data.linkDataArray : [],
        nodeDataArray: $stateParams.config_data ? $stateParams.config_data.nodeDataArray : [],
    }
    $scope.config = {
        scroll_bar: ScrollConfig
    }
    $scope.result_options = CodeMirrorOption.Sh(true);
    var inite_data = function (obj) {
        obj = obj || {};
        $scope.info.attr_data = {
            exec_script: obj.exec_script ? obj.exec_script : '',
            business_sys_name: obj.business_sys_name ? obj.business_sys_name : '',
            script_source: obj.script_source ? obj.script_source : 1,
            sql_source: obj.sql_source ? obj.sql_source : 1,
            script_file_name: obj.script_file_name ? obj.script_file_name : '',
            dataBase_type: obj.dataBase_type ? obj.dataBase_type : 1,
            service_name: obj.service_name ? obj.service_name : '',
            config: obj.config ? obj.config : false,
            comp_cn_name: obj.comp_cn_name ? obj.comp_cn_name : '',
            sdwork_cn_name: obj.sdwork_cn_name ? obj.sdwork_cn_name : '',			//作业中文名
            job_bk_desc: obj.job_bk_desc ? obj.job_bk_desc : '',			//作业描述
            over_type: obj.over_type ? obj.over_type : 1,               //手动结束，自动结束
            comp_id: obj.comp_id ? obj.comp_id : '',  			    //组件ID
            input: obj.input ? obj.input : [],
            comp_impl_type: obj.comp_impl_type ? obj.comp_impl_type : '',         //参数实现类型
            datetime_condition: obj.datetime_condition ? obj.datetime_condition : '',	    //日期条件
            date_condition: obj.date_condition ? obj.date_condition : '',
            h_condition: obj.h_condition ? obj.h_condition : "",
            m_condition: obj.m_condition ? obj.m_condition : "",
            timeused: obj.timeused ? obj.timeused : '',               //执行预时
            pre_job_list: obj.pre_job_list ? obj.pre_job_list : [],
            timeout: obj.timeout ? obj.timeout : "",				//超时时间
            error_handle: obj.error_handle ? obj.error_handle : 1,		    //出错处理方式（1等待， 2跳过， 3重试）
            retry_interval: obj.retry_interval ? obj.retry_interval : '',			//重试间隔（单位分钟）
            retry_times: obj.retry_times ? obj.retry_times : '',		    //重试次数（默认三次）
            source_list: obj.source_list ? obj.source_list : [],            //数据源
            pre_job_basic_data: obj.pre_job_basic_data ? obj.pre_job_basic_data : [],     //前置作业列表
            ref_job_list: obj.ref_job_list ? obj.ref_job_list : [],           //引用作业列表 前端选择用
            ref_job_param_list: obj.ref_job_param_list ? obj.ref_job_param_list : [],     //引用参数列表 前端选择用
            ref_node_list: obj.ref_node_list ? obj.ref_node_list : [],          //引用作业节点列表 前端选择用（修改）
            output: obj.output ? obj.output : [],
            expr: obj.expr ? obj.expr : '',				    //表达式
            result_judge: obj.result_judge ? obj.result_judge : '',           //结果判定
            job_method: obj.job_method ? obj.job_method : 1,              //作业类型 1是选择组件 2是自定义
            env_name: obj.env_name ? obj.env_name : '',               // 语言环境名（由以下四个组成）
            language_name: obj.language_name ? obj.language_name : '',          // 语言名称
            language_version: obj.language_version ? obj.language_version : '',       // 语言版本
            operating_system: obj.operating_system ? obj.operating_system : '',       // 操作系统
            bit_number: obj.bit_number ? obj.bit_number : '',             // 操作位数
            annex_file: obj.annex_file ? obj.annex_file : '',              //c/c++附件
            plugin_list: obj.plugin_list ? obj.plugin_list : [],            // 插件列表(shell/python/java/c,c++)
            request_method      : obj.request_method     ? obj.request_method : 1,    // 服务作业请求方式(1: Post 2:Get)
        }
    };
    //获取单个节点的配置信息
    var getNodeConfigInfo = function (obj) {
        var _from_key = '';
        var _pre_list = [];
        var _break_flag = false;
        $scope.info.current_node = obj;
        if (obj.sd_job_bean.job_id) {
            inite_data(obj.sd_job_bean);
            $scope.info.attr_data.job_id = obj.sd_job_bean.job_id;
        } else {
            inite_data();
        }

        //处理前置集合/引用参数集合
        for (var i = 0; i < $scope.data.linkDataArray.length; i++) {
            if (obj.group) {
                if ($scope.data.linkDataArray[i].to == obj.group) {
                    _from_key = $scope.data.linkDataArray[i].from;
                    _pre_list.push(_from_key);
                }
            } else {
                if ($scope.data.linkDataArray[i].to == obj.key) {
                    _from_key = $scope.data.linkDataArray[i].from;
                    _pre_list.push(_from_key);
                }
            }
        }
        var findPreNode = function (key) {
            for (var i = 0; i < $scope.data.linkDataArray.length; i++) {
                if (key == $scope.data.linkDataArray[i].to) {
                    _pre_list.push($scope.data.linkDataArray[i].from);
                    findPreNode($scope.data.linkDataArray[i].from);
                    break;
                }
            }
        };
        findPreNode(_from_key);
        $scope.info.attr_data.pre_job_basic_data = [];
        $scope.info.attr_data.ref_job_list = [];
        for (var i = 0; i < _pre_list.length; i++) {
            var _one_node = _pre_list[i];
            for (var j = 0; j < $scope.data.nodeDataArray.length; j++) {
                var _flow_nodedata = $scope.data.nodeDataArray[j];
                if (!_flow_nodedata.sd_job_bean) continue;
                if (_flow_nodedata.key == _one_node && _flow_nodedata.type == 4) {
                    _break_flag = true;
                    break;
                }
                if (_flow_nodedata.key == _one_node && _flow_nodedata.type != 3 && _flow_nodedata.type != 1) {
                    var _job_id = _flow_nodedata.sd_job_bean.job_id || '';
                    var _job_cn_name = _flow_nodedata.text;
                    $scope.info.attr_data.pre_job_basic_data.push({job_id: _job_id, sdwork_cn_name: _job_cn_name});//前置列表
                    $scope.info.attr_data.ref_job_list.push({job_id: _job_id, sdwork_cn_name: _job_cn_name});//引用列表
                }
                if (_flow_nodedata.group == _one_node) {
                    var _job_id = _flow_nodedata.sd_job_bean.job_id || '';
                    var _job_cn_name = _flow_nodedata.sd_job_bean.text;
                    $scope.info.attr_data.pre_job_basic_data.push({job_id: _job_id, sdwork_cn_name: _job_cn_name});//前置列表
                    $scope.info.attr_data.ref_job_list.push({job_id: _job_id, sdwork_cn_name: _job_cn_name});//引用列表
                }
            }
            if (_break_flag) break;
        }
        set_div_height(100);
    }
    //设置流程画布各容器高度
    var set_div_height = function (timeout) {
        var _timeout = timeout || 0;
        $timeout(function () {
            if ($('.header_bg').offset()) {
                var _height = $(window).height() - $('.header_bg').offset().top - 75;
                $('.grid_bg_detail').css('height', _height - 1);
                $('.right_config_div').css('height', _height - 30);
            }
        }, _timeout);
    }
    var init = function () {
        set_div_height();
        $stateParams.node_obj && getNodeConfigInfo($stateParams.node_obj);
    }
    $scope.paramShellLoaded = function (_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //转化协议类型
    $scope.getProtocolTypeCnName = function (protocol_type) {
        return CV.findValue(protocol_type, ProtocolType).substring(0, 5).toLowerCase();
    };
    //出错处理转中文
    $scope.errorHandleTOCn = function (type) {
        return type ? CV.findValue(type, JobErrorType) : '--';
    };
    //窗口变化处理
    $(window).resize(function () {
        set_div_height();
    });
    init();
}]);
//流程列表
flow.controller('flowListCtrl', ['$scope', '$stateParams', '$timeout', '$state', 'ScrollBarConfig', 'Modal', function ($scope, $stateParams, $timeout, $state, ScrollBarConfig, Modal) {
    $scope.control = {
        active_tab: $stateParams.active_name || 'handle'
    }
    $scope.flow_list_reflash = { //控制流程列表的刷新
        flag: false,
    }
    //定义关联数组，来决定dispatch_type的值以及获取的服务。
    $scope.tabs = [];
    $scope.tabs['handle'] = {type: 1, dispatch: true};
    $scope.tabs['auto'] = {type: 2, dispatch: true};
    $scope.tabs['attention'] = {type: '', dispatch: false};
    $scope.flow_list_scroll = ScrollBarConfig.Y();
    $scope.switchTab = function (tab) {
        $scope.control.active_tab = tab;
        $state.go('dispatch_flow_list', {active_name: tab});
    }
    //查看流程
    $scope.viewDetail = function (flow_id, version_id) {
        $state.go('dispatch_flow_list.flow_info', {
            active_name: $scope.control.active_tab,
            flow_id: flow_id,
            version_id: version_id
        });
    };
    //计算右侧流程信息容器高度
    $scope.calculateFlowinfoHeight = function(){
        return {
            'height' : $('.ui-view-content').height() - 135 //(135：容器距离顶部的高度+内边距)
        }
    };
    //计算左侧流程列表容器高度
    $scope.calculateFlowListHeight = function(){
        return {
            'height' : $('.ui-view-content').height() -(62+8) //(70：容器距离顶部的高度+内边距)
        }
    };
    $(window).resize(function () {
        $timeout(function () {
            $scope.calculateFlowinfoHeight();
            $scope.calculateFlowListHeight();
        },50);
    });
}]);
//流程列表中每一条流程信息编辑
flow.controller('flowListInfoCtrl', ['$scope', '$stateParams', '$timeout', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'Modal', 'CV', function ($scope, $stateParams, $timeout, $state, Flow, FlowType, Scene, Strategy, Modal, CV) {
    var _flow_id = $stateParams.flow_id;
    var _version_id = $stateParams.version_id;
    $scope.info = {
        basic: {   //流程基本信息
            flow_type_list: []
        },
        flow: {}  //流程图信息
    };
    angular.extend($scope.control, {
        is_publish: false,     //是否发布
        show_config: false,    //是否显示配置下拉框
        error: false,          //判断服务是否异常
        focus_flag: false,     //是否关注
        hand_up: false,    //是否挂起
    });
    //获取具体的流程信息
    var getFlowInfo = function () {
        //获取基本信息
        Flow.viewFlowBasicInfo(_flow_id, _version_id).then(function (data) {
            angular.extend($scope.info.basic, data.basicInfo);
            $scope.control.is_publish = $scope.info.basic.sdflow_status == 1 ? false : true;
            if ($scope.info.basic.sdflow_type && $scope.info.basic.sdflow_type.length != 1) {
                $scope.info.basic.flow_type_list = $scope.info.basic.sdflow_type.split(',');
            } else {
                $scope.info.basic.flow_type_list = [$scope.info.basic.sdflow_type];
            }
            for (var i = 0; i < $scope.info.basic.flow_type_list.length; i++) {
                $scope.info.basic.flow_type_list[i] = CV.findValue($scope.info.basic.flow_type_list[i], FlowType);
            }
            $scope.control.show_modify = false;
            $scope.control.error = false;
            $scope.control.focus_flag = $scope.info.basic.focus_flag || false;
            $scope.control.hand_up = parseInt($scope.info.basic.sdflow_status) == 3 ? true : false;

        }, function (error) {
            $scope.control.error = true;
        });
        //获取流程图信息
        Flow.viewFlowDetailData(_flow_id, _version_id).then(function (data) {
            $scope.info.flow = data.sdFlowJsonBean ? data.sdFlowJsonBean : {};
            if (data.sdFlowJsonBean) {
                $scope.info.basic.user_cn_names = data.sdFlowJsonBean.user_cn_names || data.sdFlowJsonBean.exe_user_ids;
            }
            //分层处理节点线条数据
            $scope.info.flow.nodeDataArray = $scope.info.flow.sd_node_list || [];
            $scope.info.flow.link_list = $scope.info.flow.link_list || [];
            for (var i = 0; i < $scope.info.flow.nodeDataArray.length; i++) {
                var _node_data = $scope.info.flow.nodeDataArray[i];
                _node_data.category = _node_data.category.toString();
                _node_data.isGroup = _node_data.is_group;
                _node_data.group = _node_data.group < 0 ? -_node_data.group : _node_data.group;
            }
            for (var i = 0; i < $scope.info.flow.link_list.length; i++) {
                var _link = $scope.info.flow.link_list[i];
                if (_link.visible) {
                    _link.text = _link.expr;
                }
            }
            $scope.info.flow.linkDataArray = $scope.info.flow.link_list;
            //开始时间-结束时间处理
            if ($scope.info.flow.start_bk_datetime) {
                var _start_time = $scope.info.flow.start_bk_datetime;
                $scope.info.flow.start_bk_datetime_val = _start_time.substring(0, 4) + "年" + _start_time.substring(5, 7) + "月" + _start_time.substring(8, 10);
            }
            if ($scope.info.flow.end_bk_datetime) {
                var _end_time = $scope.info.flow.end_bk_datetime;
                $scope.info.flow.end_bk_datetime_val = _end_time.substring(0, 4) + "年" + _end_time.substring(5, 7) + "月" + _end_time.substring(8, 10);
            }
        }, function (error) {
            $scope.control.error = true;
        });
    }
    var init = function () {
        if (_flow_id && _version_id) {
            //获取具体流程信息
            getFlowInfo();
        }
    }
    //配置时间
    $scope.configTime = function (flag) {
        var _data = angular.copy($scope.info.flow);
        _data.cycle_info.cycles = [];
        if (_data.cycle_info.cycle_type == 1) {
            if (_data.cycle_info.customize_time_list) {
                for (var i = 0; i < _data.cycle_info.customize_time_list.length; i++) {
                    var _customize = _data.cycle_info.customize_time_list[i];
                    var _dataValue = _customize.substring(0, 10);
                    var _dataStrShow = _customize.substring(0, 4) + "年" + _customize.substring(5, 7) + "月" + _customize.substring(8, 10);
                    var _hh = _customize.substring(11, 13);
                    var _mi = _customize.substring(14, 16);
                    _data.cycle_info.cycles.push({
                        ww: 0,
                        dd: 0,
                        mm: 0,
                        hh: _hh,
                        mi: _mi,
                        customize_times: '',
                        date: _dataValue,
                        date_str: _dataStrShow
                    })
                }
            }
        } else if (_data.cycle_info.cycle_type == 2) {
            _data.cycle_info.cycles = _data.cycle_info.cycleTimeBeen || [];
            _data.cycle_info.time_unit = _data.cycle_info.cycleTimeBeen ? _data.cycle_info.cycleTimeBeen[0].unit : 0;
        } else {
            _data.cycle_info.cycles = [_data.cycle_info.loop_time];
            _data.cycle_info.time_unit = _data.cycle_info.loop_time.unit;
        }
        _data.view_flag = flag;
        Modal.configFlowTime(_data);
    };
    //删除流程
    $scope.removeDetail = function () {
        Modal.confirm("确认删除[" + $scope.info.basic.sdflow_cn_name + "]App？").then(function (choose) {
            if (choose) {
                Flow.deleteOpFlow($scope.info.basic.sdflow_id, $scope.info.basic.sdversion_id).then(function (data) {
                    $scope.flow_list_reflash.flag = !$scope.flow_list_reflash.flag;
                    $scope.info = {
                        basic: {},
                        flow: {},
                    };
                    $scope.sdflow_id = '';
                }, function (error) {
                    Modal.alert(error.message);
                });
            }
        });
    };
    //显示配置项
    $scope.showModify = function () {
        $scope.control.show_modify = !$scope.control.show_modify;
    };
    //关注流程
    $scope.attentionFlow = function () {
        $scope.control.focus_flag = !$scope.control.focus_flag;
        Flow.attentionFlow($scope.info.basic.sdflow_id, $scope.control.focus_flag, $scope.info.basic.sdversion_id).then(function (data) {
            $scope.flow_list_reflash.flag = !$scope.flow_list_reflash.flag;
            if ($scope.control.focus_flag) {
                Modal.alert("关注成功");
            } else {
                Modal.alert("取消关注成功");
            }
        }, function (error) {
            Modal.alert(error.message);
            $scope.control.focus_flag = !$scope.control.focus_flag;
        });
    };
    //流程挂起、解挂
    $scope.handleUpOrDownFlow = function (flag) {
        if ($scope.control.is_publish) {
            Flow.handleUpOrDownflow($scope.info.basic.sdflow_id, flag, $scope.info.basic.sdversion_id).then(function (data) {
                if (flag == 1) {
                    $scope.control.hand_up = !$scope.control.hand_up;
                    Modal.alert("挂起成功");
                } else {
                    $scope.control.hand_up = !$scope.control.hand_up;
                    Modal.alert("解挂成功");
                }
                $scope.flow_list_reflash.flag = !$scope.flow_list_reflash.flag;
            }, function (error) {
                Modal.alert(error.message);
                $scope.control.focus_flag = !$scope.control.focus_flag;
            });
        } else {
            Modal.alert("App未发布！");
        }
    };
    //流程发布
    $scope.pubFlow = function () {
        var _no_publish = false;
        var _no_job = true;
        for (var i = 0; i < $scope.info.flow.nodeDataArray.length; i++) {
            var _node_data = $scope.info.flow.nodeDataArray[i];
            if (!_node_data.isGroup && !_node_data.sd_job_bean.job_id) {
                _no_publish = true;
                break;
            }
            if (_node_data.type != 1 && _node_data.type != 2) {
                _no_job = false;
            }
        }
        if (!_no_publish && !_no_job) {
            Modal.publishReasonModal().then(function (data) {
                Flow.publishFlow($scope.info.basic.sdflow_id, $scope.info.flow.sdversion_id, data).then(function (data) {
                    $scope.control.is_publish = true;
                    $scope.flow_list_reflash.flag = !$scope.flow_list_reflash.flag;
                }, function (error) {
                    Modal.alert(error.message);
                });
            })
        } else {
            Modal.alert("流程未完善,不可发布！");
        }
    };
    //流程执行
    $scope.executeFlow = function () {
        Flow.getOptaskId($scope.info.basic.sdflow_id, $scope.info.flow.sdversion_id).then(function (data) {
            var _task_id = data.task_id ? data.task_id : '';
            $state.go('dispatch_task.execute', {
                task_id: _task_id,
            });
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //计算流程图的高度
    $scope.calculateHeight = function (){
      return {
          'height' :  $('.flow-info-view').height() -(100+40) //(140：容器距离顶部的高度+底部按钮边距)
      }
    };
    //流程类型鼠标事件
    $scope.mouseEnterPopover = function () {
        $('.flowtype_popover').css('display', 'block');
    };
    $scope.mouseLeavePopover = function () {
        $('.flowtype_popover').css('display', 'none');
    };
    init();
}]);

