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

//自定义Mode(适用于版本管理-文件比对-背景高亮)
CodeMirror.defineMode("filecompare", function() {
  return {
    token: function(stream, state) {
      var sol = stream.sol() || state.afterSection; //行的开始
      var eol = stream.eol();//行的结尾

      state.afterSection = false;


      if (sol) {
        if (state.nextMultiline) {
          state.inMultiline = true;
          state.nextMultiline = false;
        } else {
          state.position = ""; //可自定义开始标记
        }
      }

      if (eol && ! state.nextMultiline) {
        state.inMultiline = false;
        state.position = ""; //可自定义结束标记
      }

      if (sol) {
        while(stream.eatSpace()) {}
      }

      var ch = stream.next(); //每一个字符

      //特殊标记(ì:删除 í:添加 ī:修改)
      if(ch === "ì" ){
          state.afterSection = true;
          stream.skipTo("ì"); stream.eat("ì");
          return "compare-delete";
      }else if(ch === "í" ){
          state.afterSection = true;
          stream.skipTo("í"); stream.eat("í");
          return "compare-add";
      }else if(ch === "ī" ){
          state.afterSection = true;
          stream.skipTo("ī"); stream.eat("ī");
          return "compare-change";
      }
          return state.position;

      },
      startState: function() {
        return {
          position : "",       // Current position, "def", "quote" or "comment"
          nextMultiline : false,  // Is the next line multiline value
          inMultiline : false,    // Is the current line a multiline value
          afterSection : false    // Did we just open a section
        };
      }

  };
});

CodeMirror.defineMIME("text/x-filecompare", "filecompare");

});
