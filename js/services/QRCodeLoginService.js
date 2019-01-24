'use strict';

var QRCodeLoginService = angular.module('QRCodeLoginService', []);

QRCodeLoginService.service('QRCodeLogin', ['CallProvider', 'baseUrl', function(CallProvider, baseUrl){
    this.getQRCodeLoginImage = function main(onSuccess, onLoginSuccess, onError){
        CallProvider.call({
            actionName: 'qr_GetQRCodeLoginImageNameAction.do',
            reqData: {
                "submit_type": 1
            }
        }).then(function(data){
            var imgName = data.imgName;
            var imgURL  = baseUrl + 'app/img/qrcode/' + data.imgName;
            var uuid = imgName.substring(0, imgName.length - 4);
            if(onSuccess){
                onSuccess(imgURL);
            }
            (function longPolling(){
                CallProvider.call({
                    actionName: 'qr_GetLoginStatusForLongPollingAction.do',
                    reqData   : {
                        "submit_type": 1,
                        "uuid"       : uuid
                    }
                }).then(function(data){
                    if (data && data.loginStatus == 0) {
                        longPolling();
                    } else if(data && data.loginStatus == -1){
                        main(onSuccess, onLoginSuccess, onError);
                    } else if(data && data.loginStatus == 1){
                        if(onLoginSuccess) {
                            onLoginSuccess(data.userLoginInOutputBean);
                        }
                    }
                }, function(error){
                    if(onError){
                        onError(error);
                    }
                });
            }());
        }, function(error){
            onError(error);
        });
    };
}]);

QRCodeLoginService.service('QRCodeLocalAuth', ['CallProvider', 'baseUrl', function(CallProvider, baseUrl){
    this.getQRCodeLocalAuthImage = function main(reqParam, onSuccess, onLocalAuthSuccess, onError){
        var cancelObj = {cancel: false};
        CallProvider.call({
            actionName:'qr_GetQRCodeLocalAuthImageNameAction.do',
            reqData: reqParam
        }).then(function(data){
            var imgName = data.imgName;
            var imgURL = baseUrl + 'app/img/qrcode/' + data.imgName;
            var uuid = imgName.substring(0, imgName.length - 4);
            if(onSuccess){
                onSuccess(imgURL);
            }
            (function longPolling(){
                CallProvider.call({
                    actionName: 'qr_GetLocalAuthStatusForLongPollingAction.do',
                    reqData   : {
                        "submit_type": 1,
                        "uuid"       : uuid
                    }
                }).then(function(data){
                    if (data && data.status == 0 && !cancelObj.cancel) {
                        longPolling();
                    } else if(data && data.status == -1){
                        main(reqParam, onSuccess, onLocalAuthSuccess, onError);
                    } else if(data && data.status == 1){
                        if(onLocalAuthSuccess) {
                            onLocalAuthSuccess(data.checkLocalAuthOutputBean);
                        }
                    }
                }, function(error){
                    if(onError){
                        onError(error);
                    }
                });
            }());
        }, function(error){
            if(onError){
                onError(error);
            }
        });
        return cancelObj;
    }
}]);