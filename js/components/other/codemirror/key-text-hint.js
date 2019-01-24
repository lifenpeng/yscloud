// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  //公共参数
    var key_list = [
        {key: '${dir}',				text: "${dir} [目录]"},
        {key: '${upload_dir}',		text: "${upload_dir} [上传目录]"},
        {key: '${backup_dir}',		text: "${backup_dir} [备份目录]"},
        {key: '${path}',		    text: "${path} [路径]"},
        {key: '${full_path}',		text: "${full_path} [全路径]"},
        {key: '${relative_path}',	text: "${relative_path} [相对路径]"},
        {key: '${file}',			text: "${file} [文件]"},
        {key: '${package_name}',	text: "${package_name} [包名]"},
        {key: '${script}',			text: "${script} [脚本]"},
        {key: '${db_name}',			text: "${db_name} [数据库名]"},
        {key: '${tag}',				text: "${tag} [区分标识]"},
    ];

  CodeMirror.registerHelper("hint", "anyword", function(editor, options) {
      var cur = editor.getCursor();           //当前所在字符串
      var token = editor.getTokenAt(cur);     //当前输入字符
      var list = key_list;                    //公共列表-智能提示列表[{key: '', text: ''}]
      if(options.systemKeys && options.systemKeys.length !== 0) list = options.systemKeys; //传入列表-智能提示列表[{key: '', text: ''}]
      if(options.pluginKeys && options.pluginKeys.length !== 0) list = options.pluginKeys.concat(list);
      if(token.string !== '$') return false;
      return {list: list, from: CodeMirror.Pos(cur.line, token.start), to: CodeMirror.Pos(cur.line, token.end)};
  });
});
