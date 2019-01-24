'use strict';

//注册信息控制器
var licenseCtrl = angular.module('LicenseController', []);

/**
 * CorsLares注册
 * */
licenseCtrl.controller('registerLicenseCtrl',["$scope", "$modalInstance", "$timeout",  "User", "Modal", "CV", function($scope, $modalInstance, $timeout, User, Modal, CV){
    //表单
    $scope.form = {};
    //注册信息
    $scope.register_info = {
        min_date : new Date(), //当天日期
        register_flag : true,  //判断是否是注册
        license_info : {},     //许可信息
    };
    //控制
    $scope.control = {
        register_btn_loading : false
    };

    //获取注册信息
    User.getLicense().then(function(data){
        $timeout(function () {
            if (data) {
                //判断是否注册1显示未注册，2显示注册
                var _regist_flag = data.regist_flag;
                //判断是否注册，若注册过显示注册信息
                if (_regist_flag == 1) {
                    $scope.register_info.license_info = {};
                } else {
                    $scope.register_info.license_info  = {
                        name: data.name,
                        zh_name: data.zh_name,
                        expire_end_date: data.expire_end_date,
                        license: data.license,
                        ip: data.ip,
                        version_msg:data.version_msg ? data.version_msg :"",
                    }
                }
            }
        },0)
    },function(error){
        Modal.alert(error.message,3)
    });
    //打开日期控件
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.form.opened = true;
    };
    //提交注册表单
    $scope.formSubmit = function () {
        $scope.control.register_btn_loading = true;
        //表单验证
        if (!CV.valiForm($scope.form.regLicenseForm)) {
            $scope.control.register_btn_loading = false;
            return false;
        }
        //时间格式化
        $scope.register_info.license_info.expire_end_date = CV.dtFormat($scope.register_info.license_info .expire_end_date);
        //提交表单
        User.registLicense($scope.register_info.license_info ).then(function (data) {
            $timeout(function () {
                $scope.control.register_btn_loading = false;
                Modal.alert("注册成功",2);
                $modalInstance.close(true);
            },0);
        }, function (error) {
            $scope.control.register_btn_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 *查看CorsLares注册信息
 * */
licenseCtrl.controller('showLicenseCtrl',["$scope", "$modalInstance", "$timeout", "User", "Modal", function($scope, $modalInstance, $timeout, User, Modal){
    //注册信息
    $scope.register_info = {
        register_flag:true,  //判断是否是注册
        license_info:{},     //许可信息
    };
    //读取License信息
    User.getLicense().then(function(data){
        $timeout(function () {
            $scope.register_info.license_info = {
                name: data.name,
                zh_name: data.zh_name,
                expire_end_date: data.expire_end_date,
                license: data.license,
                ip: data.ip,
                version_msg:data.version_msg ? data.version_msg :"",
            }
        },0)
    },function(error){
        Modal.alert(error.message,3)
    });
    //取消
    $scope.cancel = function () {
        $modalInstance.close(true);
    };
}]);