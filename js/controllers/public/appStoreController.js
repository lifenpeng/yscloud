var appsCtrl = angular.module('appStoreController', []);

appsCtrl.controller('appListCtrl',["$scope","$state", "$stateParams","Version","Modal", function($scope,$state,$stateParams,Version,Modal){
    $scope.type = $stateParams.sdflow_type;
    $scope.load_msg = '数据正在加载中....';
    $scope.app_list = [];
    if($scope.type){
        Version.getStreamListByKey('',1,$scope.type).then(function (data) {
            if(data.flow_list){
                $scope.app_list = data.flow_list;
                $scope.load_msg = '';
            }
        },function (error) {
            Modal.alert(error.message,3)
        });
    }

    //页面跳转
    $scope.goToSysPage = function(sys){
        console.log(sys);
        if(sys.sdflow_bk_desc){
            $state.go("sys_config.struct_config",{sys_id:sys.sdflow_bk_desc});
        }
    };

    $scope.aps = function(){
        $state.go('app_aps');
    }

}])

appsCtrl.controller('appApsCtrl',["$scope","$state", "$stateParams","Version","Modal", function($scope,$state,$stateParams,Version,Modal){


}])