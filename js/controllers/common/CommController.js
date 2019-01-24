'use strict';

//公共控制器
var CommController = angular.module('CommControllers', []);

/**
 * 文件上传/下载--控制器
* */
CommController.controller('fileCtrl', ["$scope", "FileUploader", "baseUrl", "Modal", function ($scope, FileUploader, baseUrl, Modal) {
    /*
     文件上传下载控制器
     fileupload.uploadpath  文件上传路径
     fileupload.filename    文件名
     fileupload.filetype    文件中文说明（如：发布清单）
     fileupload.uploadtype  新增OR修改（如：'add'、'update'、'select'）
     fileupload.count       允许上传文件数量
     fileupload.suffixs     允许文件后缀
     */
    console.log("URL:" + baseUrl+'fileupload?uploadPath='+$scope.fileupload.uploadpath);
    var suffixs = $scope.fileupload.suffixs ? $scope.fileupload.suffixs.split(",") : [];
    var uploader = $scope.uploader = new FileUploader({
        url: baseUrl+'fileupload?uploadPath='+$scope.fileupload.uploadpath
    });
    uploader.filters.push({
        name: 'suffixFilter',   //文件后缀验证
        fn: function (item) {
            if(suffixs.length == 0) {
                return true;
            } else if(suffixs.indexOf(item.name.split(".")[1]) == -1) {
                Modal.alert("文件名后缀限定为["+suffixs.toString().replace(",", " 或 ")+"]格式！",3);
                return false;
            } else {
                return true;
            }
        }
    });
    $scope.$watch('uploader.queue.length',function() {
        uploader.uploadAll();
        if($scope.uploader.queue[0]){
            $scope.fileupload.filename =$scope.uploader.queue[0].file.name;
        }
        if($scope.uploader.queue[2]){
            $scope.fileuploadBack.filename =$scope.uploader.queue[1].file.name;
        }
    });
    //上传控件移除队列
    $scope.remove = function(){
        var temFileName1 = document.getElementsByTagName('input')[1];
        temFileName1.value = "";
        uploader.queue.length=0;
        $scope.fileupload.filename='';
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        //$scope.fileupload.filename = fileItem._file.name;
        $scope.onSuccessThen ? $scope.onSuccessThen($scope.uploader.queue) : "";
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        Modal.alert("文件上传失败\r\n" + response,3);
    };
}]);

