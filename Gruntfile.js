module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            "my_target": {
                "files": {
                    'js/cl.min.js': [
                        'js/controllers/common/LicenseController.js',
                        'js/controllers/common/CommController.js',
                        'js/controllers/common/HomePageController.js',
                        'js/controllers/common/UserController.js',
                        'js/controllers/common/TaskController.js',
                        'js/controllers/common/ModalCtrl.js',
                        'js/controllers/release/ProjController.js',
                        'js/controllers/release/ProdController.js',
                        'js/controllers/release/PlanController.js',
                        'js/controllers/release/AnalysisController.js',
                        'js/controllers/release/ApplicationController.js',
                        'js/controllers/release/MonitorController.js',
                        'js/controllers/release/VersionController.js',
                        'js/controllers/release/LargeScreenMonitorController.js',
                        'js/controllers/fault/FaultProgramController.js',
                        'js/controllers/fault/WorkorderController.js',
                        'js/controllers/inspection/InspectionController.js',
                        'js/controllers/inspection/LogViewController.js',
                        'js/controllers/inspection/PDF.js',
                        'js/controllers/dispatch/AutoOperation.js',
                        'js/controllers/dispatch/DispatchFlowController.js',
                        'js/controllers/dispatch/DispatchTaskController.js',
                        'js/controllers/dispatch/DispatchSceneController.js',
                        'js/controllers/dispatch/DispatchOtherController.js',
                        'js/controllers/dispatch/DispatchTaskMonitorController.js',
                        'js/controllers/public/SysController.js',
                        'js/controllers/public/CmptController.js',
                        'js/controllers/public/SrvController.js',


                        <!--app-service-->
                        'js/services/CvService.js',
                        'js/services/http/CommHttpSrv.js',
                        'js/services/http/DispatchHttpSrv.js',
                        'js/services/http/FaultHttpSrv.js',
                        'js/services/http/InspectionHttpSrv.js',
                        'js/services/http/ReleaseHttpSrv.js',

                        'js/services/ChartsService.js',
                        'js/services/ConfigService.js',
                        'js/services/GlobalData.js',
                        'js/services/QRCodeLoginService.js',
                        'js/services/FuncService.js',
                        <!--app-directive-->
                        'js/directives/Directives.js',
                        'js/directives/TableDirective.js',
                        <!--app-main-->
                        'js/controllers/route.js',
                        'js/controllers/main.js',
                        '../agent.js',
                    ],
                    'js/login.min.js': [
                        'js/services/http/CommHttpSrv.js',
                        'js/services/CvService.js',
                        'js/services/GlobalData.js',
                        'js/services/QRCodeLoginService.js',
                        'js/controllers/common/LicenseController.js',
                        'js/controllers/common/ModalCtrl.js',
                        'js/directives/Directives.js',
                        '../login.js',
                    ],
                }
            },

        },
        concat: {
            cl_css: {
                src: [
                    'css/font-awesome.min.css',
                    'css/themes/pink-blue.css',
                    'css/comm/animate.css',
                    'css/comm/angular-ui-tree.css',
                    'css/comm/mCustomScrollbar.css',
                    'css/bootstrap/bootstrap-table.css',
                    'css/bootstrap.css',
                    'css/codemirror/codemirror.css',
                    'css/codemirror/midnight.css',
                    'css/codemirror/simplescrollbars.css',
                    'css/codemirror/show-hint.css',
                    'css/codemirror/fullscreen.css',
                    'css/codemirror/dialog.css',
                    'css/codemirror/matchesonscrollbar.css',
                    'css/calendar/fullcalendar.css',
                    'css/icheck_radio.css',
                    'css/release.css',
                    'css/version.css',
                    'css/home.css',
                    'css/inspection.css',
                    'css/comm.css',
                    'css/fault.css',
                    'css/cmpt.css',
                    'css/public.css',
                    'css/dispatch.css',
                    'css/server.css',
                ],
                dest: 'css/cl.css'
            },
            login_css: {
                src: [
                    'css/font-awesome.min.css',
                    'css/bootstrap.css',
                    'css/comm/foxholder-styles.css',
                    'css/comm.css',
                ],
                dest:'css/login.css'
            }
        },
        cssmin: {
            cl_css: {
                src: 'css/cl.css',
                dest: 'css/cl.min.css'
            },
            login_css: {
                src:'css/login.css',
                dest:'css/login.min.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-css');

    grunt.registerTask('default', ['uglify', 'concat', 'cssmin']);

}
