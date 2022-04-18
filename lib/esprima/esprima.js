!function(e,t){"use strict";"function"==typeof define&&define.amd?define(["exports"],t):"undefined"!=typeof exports?t(exports):t(e.esprima={})}(this,(function(e){"use strict";var t,n,r,a,i,o,c,l,s,u,m,d,p,f,h,y,S,g;function v(e,t){if(!e)throw new Error("ASSERT: "+t)}function k(e){return e>=48&&e<=57}function b(e){return"0123456789abcdefABCDEF".indexOf(e)>=0}function E(e){return"01234567".indexOf(e)>=0}function x(e){return 32===e||9===e||11===e||12===e||160===e||e>=5760&&[5760,6158,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279].indexOf(e)>=0}function C(e){return 10===e||13===e||8232===e||8233===e}function w(e){return 36===e||95===e||e>=65&&e<=90||e>=97&&e<=122||92===e||e>=128&&c.NonAsciiIdentifierStart.test(String.fromCharCode(e))}function I(e){return 36===e||95===e||e>=65&&e<=90||e>=97&&e<=122||e>=48&&e<=57||92===e||e>=128&&c.NonAsciiIdentifierPart.test(String.fromCharCode(e))}function L(e){switch(e){case"implements":case"interface":case"package":case"private":case"protected":case"public":case"static":case"yield":case"let":return!0;default:return!1}}function A(e){return"eval"===e||"arguments"===e}function P(e,t,n,r,a){var i;v("number"==typeof n,"Comment must have valid position"),S.lastCommentStart>=n||(S.lastCommentStart=n,i={type:e,value:t},g.range&&(i.range=[n,r]),g.loc&&(i.loc=a),g.comments.push(i),g.attachComment&&(g.leadingComments.push(i),g.trailingComments.push(i)))}function N(e){var t,n,r,a;for(t=m-e,n={start:{line:d,column:m-p-e}};m<f;)if(r=s.charCodeAt(m),++m,C(r))return g.comments&&(a=s.slice(t+e,m-1),n.end={line:d,column:m-p-1},P("Line",a,t,m-1,n)),13===r&&10===s.charCodeAt(m)&&++m,++d,void(p=m);g.comments&&(a=s.slice(t+e,m),n.end={line:d,column:m-p},P("Line",a,t,m,n))}function O(){var e,t,n,r;for(g.comments&&(e=m-2,t={start:{line:d,column:m-p-2}});m<f;)if(C(n=s.charCodeAt(m)))13===n&&10===s.charCodeAt(m+1)&&++m,++d,++m,p=m,m>=f&&z({},o.UnexpectedToken,"ILLEGAL");else if(42===n){if(47===s.charCodeAt(m+1))return++m,++m,void(g.comments&&(r=s.slice(e+2,m-2),t.end={line:d,column:m-p},P("Block",r,e,m,t)));++m}else++m;z({},o.UnexpectedToken,"ILLEGAL")}function U(){var e,t;for(t=0===m;m<f;)if(x(e=s.charCodeAt(m)))++m;else if(C(e))++m,13===e&&10===s.charCodeAt(m)&&++m,++d,p=m,t=!0;else if(47===e)if(47===(e=s.charCodeAt(m+1)))++m,++m,N(2),t=!0;else{if(42!==e)break;++m,++m,O()}else if(t&&45===e){if(45!==s.charCodeAt(m+1)||62!==s.charCodeAt(m+2))break;m+=3,N(3)}else{if(60!==e)break;if("!--"!==s.slice(m+1,m+4))break;++m,++m,++m,++m,N(4)}}function R(e){var t,n,r,a=0;for(n="u"===e?4:2,t=0;t<n;++t){if(!(m<f&&b(s[m])))return"";r=s[m++],a=16*a+"0123456789abcdef".indexOf(r.toLowerCase())}return String.fromCharCode(a)}function F(){var e,t;for(e=s.charCodeAt(m++),t=String.fromCharCode(e),92===e&&(117!==s.charCodeAt(m)&&z({},o.UnexpectedToken,"ILLEGAL"),++m,(e=R("u"))&&"\\"!==e&&w(e.charCodeAt(0))||z({},o.UnexpectedToken,"ILLEGAL"),t=e);m<f&&I(e=s.charCodeAt(m));)++m,t+=String.fromCharCode(e),92===e&&(t=t.substr(0,t.length-1),117!==s.charCodeAt(m)&&z({},o.UnexpectedToken,"ILLEGAL"),++m,(e=R("u"))&&"\\"!==e&&I(e.charCodeAt(0))||z({},o.UnexpectedToken,"ILLEGAL"),t+=e);return t}function T(){var e,n,r,a,i=m,c=s.charCodeAt(m),l=s[m];switch(c){case 46:case 40:case 41:case 59:case 44:case 123:case 125:case 91:case 93:case 58:case 63:case 126:return++m,g.tokenize&&(40===c?g.openParenToken=g.tokens.length:123===c&&(g.openCurlyToken=g.tokens.length)),{type:t.Punctuator,value:String.fromCharCode(c),lineNumber:d,lineStart:p,start:i,end:m};default:if(61===(e=s.charCodeAt(m+1)))switch(c){case 43:case 45:case 47:case 60:case 62:case 94:case 124:case 37:case 38:case 42:return m+=2,{type:t.Punctuator,value:String.fromCharCode(c)+String.fromCharCode(e),lineNumber:d,lineStart:p,start:i,end:m};case 33:case 61:return m+=2,61===s.charCodeAt(m)&&++m,{type:t.Punctuator,value:s.slice(i,m),lineNumber:d,lineStart:p,start:i,end:m}}}return">>>="===(a=s.substr(m,4))?{type:t.Punctuator,value:a,lineNumber:d,lineStart:p,start:i,end:m+=4}:">>>"===(r=a.substr(0,3))||"<<="===r||">>="===r?{type:t.Punctuator,value:r,lineNumber:d,lineStart:p,start:i,end:m+=3}:l===(n=r.substr(0,2))[1]&&"+-<>&|".indexOf(l)>=0||"=>"===n?{type:t.Punctuator,value:n,lineNumber:d,lineStart:p,start:i,end:m+=2}:"<>=!+-*%&|^/".indexOf(l)>=0?(++m,{type:t.Punctuator,value:l,lineNumber:d,lineStart:p,start:i,end:m}):void z({},o.UnexpectedToken,"ILLEGAL")}function D(){var e,n,r;if(v(k((r=s[m]).charCodeAt(0))||"."===r,"Numeric literal must start with a decimal digit or a decimal point"),n=m,e="","."!==r){if(e=s[m++],r=s[m],"0"===e){if("x"===r||"X"===r)return++m,function(e){for(var n="";m<f&&b(s[m]);)n+=s[m++];return 0===n.length&&z({},o.UnexpectedToken,"ILLEGAL"),w(s.charCodeAt(m))&&z({},o.UnexpectedToken,"ILLEGAL"),{type:t.NumericLiteral,value:parseInt("0x"+n,16),lineNumber:d,lineStart:p,start:e,end:m}}(n);if(E(r))return function(e){for(var n="0"+s[m++];m<f&&E(s[m]);)n+=s[m++];return(w(s.charCodeAt(m))||k(s.charCodeAt(m)))&&z({},o.UnexpectedToken,"ILLEGAL"),{type:t.NumericLiteral,value:parseInt(n,8),octal:!0,lineNumber:d,lineStart:p,start:e,end:m}}(n);r&&k(r.charCodeAt(0))&&z({},o.UnexpectedToken,"ILLEGAL")}for(;k(s.charCodeAt(m));)e+=s[m++];r=s[m]}if("."===r){for(e+=s[m++];k(s.charCodeAt(m));)e+=s[m++];r=s[m]}if("e"===r||"E"===r)if(e+=s[m++],"+"!==(r=s[m])&&"-"!==r||(e+=s[m++]),k(s.charCodeAt(m)))for(;k(s.charCodeAt(m));)e+=s[m++];else z({},o.UnexpectedToken,"ILLEGAL");return w(s.charCodeAt(m))&&z({},o.UnexpectedToken,"ILLEGAL"),{type:t.NumericLiteral,value:parseFloat(e),lineNumber:d,lineStart:p,start:n,end:m}}function B(){var e,n,r,a;return y=null,U(),e=m,n=function(){var e,t,n,r;for(v("/"===(e=s[m]),"Regular expression literal must start with a slash"),t=s[m++],n=!1,r=!1;m<f;)if(t+=e=s[m++],"\\"===e)C((e=s[m++]).charCodeAt(0))&&z({},o.UnterminatedRegExp),t+=e;else if(C(e.charCodeAt(0)))z({},o.UnterminatedRegExp);else if(n)"]"===e&&(n=!1);else{if("/"===e){r=!0;break}"["===e&&(n=!0)}return r||z({},o.UnterminatedRegExp),{value:t.substr(1,t.length-2),literal:t}}(),r=function(){var e,t,n,r;for(t="",n="";m<f&&I((e=s[m]).charCodeAt(0));)if(++m,"\\"===e&&m<f)if("u"===(e=s[m])){if(r=++m,e=R("u"))for(n+=e,t+="\\u";r<m;++r)t+=s[r];else m=r,n+="u",t+="\\u";$({},o.UnexpectedToken,"ILLEGAL")}else t+="\\",$({},o.UnexpectedToken,"ILLEGAL");else n+=e,t+=e;return{value:n,literal:t}}(),a=function(e,t){var n;try{n=new RegExp(e,t)}catch(e){z({},o.InvalidRegExp)}return n}(n.value,r.value),g.tokenize?{type:t.RegularExpression,value:a,lineNumber:d,lineStart:p,start:e,end:m}:{literal:n.literal+r.literal,value:a,start:e,end:m}}function W(){var e,t,n,r;return U(),e=m,t={start:{line:d,column:m-p}},n=B(),t.end={line:d,column:m-p},g.tokenize||(g.tokens.length>0&&(r=g.tokens[g.tokens.length-1]).range[0]===e&&"Punctuator"===r.type&&("/"!==r.value&&"/="!==r.value||g.tokens.pop()),g.tokens.push({type:"RegularExpression",value:n.literal,range:[e,m],loc:t})),n}function j(){var e,n,a;return U(),m>=f?{type:t.EOF,lineNumber:d,lineStart:p,start:m,end:m}:w(e=s.charCodeAt(m))?(n=m,a=92===s.charCodeAt(m)?F():function(){var e,t;for(e=m++;m<f;){if(92===(t=s.charCodeAt(m)))return m=e,F();if(!I(t))break;++m}return s.slice(e,m)}(),{type:1===a.length?t.Identifier:function(e){if(u&&L(e))return!0;switch(e.length){case 2:return"if"===e||"in"===e||"do"===e;case 3:return"var"===e||"for"===e||"new"===e||"try"===e||"let"===e;case 4:return"this"===e||"else"===e||"case"===e||"void"===e||"with"===e||"enum"===e;case 5:return"while"===e||"break"===e||"catch"===e||"throw"===e||"const"===e||"yield"===e||"class"===e||"super"===e;case 6:return"return"===e||"typeof"===e||"delete"===e||"switch"===e||"export"===e||"import"===e;case 7:return"default"===e||"finally"===e||"extends"===e;case 8:return"function"===e||"continue"===e||"debugger"===e;case 10:return"instanceof"===e;default:return!1}}(a)?t.Keyword:"null"===a?t.NullLiteral:"true"===a||"false"===a?t.BooleanLiteral:t.Identifier,value:a,lineNumber:d,lineStart:p,start:n,end:m}):40===e||41===e||59===e?T():39===e||34===e?function(){var e,n,r,a,i,c,l,u,h="",y=!1;for(l=d,u=p,v("'"===(e=s[m])||'"'===e,"String literal must starts with a quote"),n=m,++m;m<f;){if((r=s[m++])===e){e="";break}if("\\"===r)if((r=s[m++])&&C(r.charCodeAt(0)))++d,"\r"===r&&"\n"===s[m]&&++m,p=m;else switch(r){case"u":case"x":c=m,(i=R(r))?h+=i:(m=c,h+=r);break;case"n":h+="\n";break;case"r":h+="\r";break;case"t":h+="\t";break;case"b":h+="\b";break;case"f":h+="\f";break;case"v":h+="\v";break;default:E(r)?(0!==(a="01234567".indexOf(r))&&(y=!0),m<f&&E(s[m])&&(y=!0,a=8*a+"01234567".indexOf(s[m++]),"0123".indexOf(r)>=0&&m<f&&E(s[m])&&(a=8*a+"01234567".indexOf(s[m++]))),h+=String.fromCharCode(a)):h+=r}else{if(C(r.charCodeAt(0)))break;h+=r}}return""!==e&&z({},o.UnexpectedToken,"ILLEGAL"),{type:t.StringLiteral,value:h,octal:y,startLineNumber:l,startLineStart:u,lineNumber:d,lineStart:p,start:n,end:m}}():46===e?k(s.charCodeAt(m+1))?D():T():k(e)?D():g.tokenize&&47===e?function(){var e,t;if(!(e=g.tokens[g.tokens.length-1]))return W();if("Punctuator"===e.type){if("]"===e.value)return T();if(")"===e.value)return!(t=g.tokens[g.openParenToken-1])||"Keyword"!==t.type||"if"!==t.value&&"while"!==t.value&&"for"!==t.value&&"with"!==t.value?T():W();if("}"===e.value){if(g.tokens[g.openCurlyToken-3]&&"Keyword"===g.tokens[g.openCurlyToken-3].type){if(!(t=g.tokens[g.openCurlyToken-4]))return T()}else{if(!g.tokens[g.openCurlyToken-4]||"Keyword"!==g.tokens[g.openCurlyToken-4].type)return T();if(!(t=g.tokens[g.openCurlyToken-5]))return W()}return r.indexOf(t.value)>=0?T():W()}return W()}return"Keyword"===e.type?W():T()}():T()}function G(){var e,r,a;return U(),e={start:{line:d,column:m-p}},r=j(),e.end={line:d,column:m-p},r.type!==t.EOF&&(a=s.slice(r.start,r.end),g.tokens.push({type:n[r.type],value:a,range:[r.start,r.end],loc:e})),r}function K(){var e;return m=(e=y).end,d=e.lineNumber,p=e.lineStart,y=void 0!==g.tokens?G():j(),m=e.end,d=e.lineNumber,p=e.lineStart,e}function V(){var e,t,n;e=m,t=d,n=p,y=void 0!==g.tokens?G():j(),m=e,d=t,p=n}function M(e,t){this.line=e,this.column=t}function H(e,t,n,r){this.start=new M(e,t),this.end=new M(n,r)}function q(){var e,t,n,r;return e=m,t=d,n=p,U(),r=d!==t,m=e,d=t,p=n,r}function z(e,t){var n,r=Array.prototype.slice.call(arguments,2),a=t.replace(/%(\d)/g,(function(e,t){return v(t<r.length,"Message reference must be in range"),r[t]}));throw"number"==typeof e.lineNumber?((n=new Error("Line "+e.lineNumber+": "+a)).index=e.start,n.lineNumber=e.lineNumber,n.column=e.start-p+1):((n=new Error("Line "+d+": "+a)).index=m,n.lineNumber=d,n.column=m-p+1),n.description=a,n}function $(){try{z.apply(null,arguments)}catch(e){if(!g.errors)throw e;g.errors.push(e)}}function X(e){if(e.type===t.EOF&&z(e,o.UnexpectedEOS),e.type===t.NumericLiteral&&z(e,o.UnexpectedNumber),e.type===t.StringLiteral&&z(e,o.UnexpectedString),e.type===t.Identifier&&z(e,o.UnexpectedIdentifier),e.type===t.Keyword){if(function(e){switch(e){case"class":case"enum":case"export":case"extends":case"import":case"super":return!0;default:return!1}}(e.value))z(e,o.UnexpectedReserved);else if(u&&L(e.value))return void $(e,o.StrictReservedWord);z(e,o.UnexpectedToken,e.value)}z(e,o.UnexpectedToken,e.value)}function J(e){var n=K();n.type===t.Punctuator&&n.value===e||X(n)}function Q(e){var n=K();n.type===t.Keyword&&n.value===e||X(n)}function Y(e){return y.type===t.Punctuator&&y.value===e}function Z(e){return y.type===t.Keyword&&y.value===e}function _(){var e;59===s.charCodeAt(m)||Y(";")?K():(e=d,U(),d===e&&(y.type===t.EOF||Y("}")||X(y)))}function ee(e){return e.type===a.Identifier||e.type===a.MemberExpression}function te(e,t){var n,r,a;return n=u,a=y,r=ke(),t&&u&&A(e[0].name)&&$(t,o.StrictParamName),u=n,h.markEnd(h.createFunctionExpression(null,e,[],r),a)}function ne(){var e,n;return n=y,(e=K()).type===t.StringLiteral||e.type===t.NumericLiteral?(u&&e.octal&&$(e,o.StrictOctalLiteral),h.markEnd(h.createLiteral(e),n)):h.markEnd(h.createIdentifier(e.value),n)}function re(){var e,n,r,a,i,c;return c=y,(e=y).type===t.Identifier?(r=ne(),"get"!==e.value||Y(":")?"set"!==e.value||Y(":")?(J(":"),a=de(),h.markEnd(h.createProperty("init",r,a),c)):(n=ne(),J("("),(e=y).type!==t.Identifier?(J(")"),$(e,o.UnexpectedToken,e.value),a=te([])):(i=[he()],J(")"),a=te(i,e)),h.markEnd(h.createProperty("set",n,a),c)):(n=ne(),J("("),J(")"),a=te([]),h.markEnd(h.createProperty("get",n,a),c))):e.type!==t.EOF&&e.type!==t.Punctuator?(n=ne(),J(":"),a=de(),h.markEnd(h.createProperty("init",n,a),c)):void X(e)}function ae(){var e,n,r,c;if(Y("("))return function(){var e;return J("("),e=pe(),J(")"),e}();if(Y("["))return function(){var e,t=[];for(e=y,J("[");!Y("]");)Y(",")?(K(),t.push(null)):(t.push(de()),Y("]")||J(","));return K(),h.markEnd(h.createArrayExpression(t),e)}();if(Y("{"))return function(){var e,t,n,r,c,l=[],s={},m=String;for(c=y,J("{");!Y("}");)t=(e=re()).key.type===a.Identifier?e.key.name:m(e.key.value),r="init"===e.kind?i.Data:"get"===e.kind?i.Get:i.Set,n="$"+t,Object.prototype.hasOwnProperty.call(s,n)?(s[n]===i.Data?u&&r===i.Data?$({},o.StrictDuplicateProperty):r!==i.Data&&$({},o.AccessorDataProperty):r===i.Data?$({},o.AccessorDataProperty):s[n]&r&&$({},o.AccessorGetSet),s[n]|=r):s[n]=r,l.push(e),Y("}")||J(",");return J("}"),h.markEnd(h.createObjectExpression(l),c)}();if(e=y.type,c=y,e===t.Identifier)r=h.createIdentifier(K().value);else if(e===t.StringLiteral||e===t.NumericLiteral)u&&y.octal&&$(y,o.StrictOctalLiteral),r=h.createLiteral(K());else if(e===t.Keyword){if(Z("function"))return function(){var e,t,n,r,a,i,c,l,s,m=null;return l=y,Q("function"),Y("(")||(e=y,m=he(),u?A(e.value)&&$(e,o.StrictFunctionName):A(e.value)?(n=e,r=o.StrictFunctionName):L(e.value)&&(n=e,r=o.StrictReservedWord)),s=(a=be(n)).params,t=a.stricted,n=a.firstRestricted,a.message&&(r=a.message),c=u,i=ke(),u&&n&&z(n,r),u&&t&&$(t,r),u=c,h.markEnd(h.createFunctionExpression(m,s,[],i),l)}();Z("this")?(K(),r=h.createThisExpression()):X(K())}else e===t.BooleanLiteral?((n=K()).value="true"===n.value,r=h.createLiteral(n)):e===t.NullLiteral?((n=K()).value=null,r=h.createLiteral(n)):Y("/")||Y("/=")?(r=void 0!==g.tokens?h.createLiteral(W()):h.createLiteral(B()),V()):X(K());return h.markEnd(r,c)}function ie(){var e=[];if(J("("),!Y(")"))for(;m<f&&(e.push(de()),!Y(")"));)J(",");return J(")"),e}function oe(){return J("."),n=y,function(e){return e.type===t.Identifier||e.type===t.Keyword||e.type===t.BooleanLiteral||e.type===t.NullLiteral}(e=K())||X(e),h.markEnd(h.createIdentifier(e.value),n);var e,n}function ce(){var e;return J("["),e=pe(),J("]"),e}function le(){var e,t,n;return n=y,Q("new"),e=function(){var e,t,n,r;for(r=y,e=S.allowIn,t=Z("new")?le():ae(),S.allowIn=e;Y(".")||Y("[");)Y("[")?(n=ce(),t=h.createMemberExpression("[",t,n)):(n=oe(),t=h.createMemberExpression(".",t,n)),h.markEnd(t,r);return t}(),t=Y("(")?ie():[],h.markEnd(h.createNewExpression(e,t),n)}function se(){var e,n,r=y;return e=function(){var e,t,n,r,a;for(a=y,e=S.allowIn,S.allowIn=!0,t=Z("new")?le():ae(),S.allowIn=e;;){if(Y("."))r=oe(),t=h.createMemberExpression(".",t,r);else if(Y("("))n=ie(),t=h.createCallExpression(t,n);else{if(!Y("["))break;r=ce(),t=h.createMemberExpression("[",t,r)}h.markEnd(t,a)}return t}(),y.type===t.Punctuator&&(!Y("++")&&!Y("--")||q()||(u&&e.type===a.Identifier&&A(e.name)&&$({},o.StrictLHSPostfix),ee(e)||$({},o.InvalidLHSInAssignment),n=K(),e=h.markEnd(h.createPostfixExpression(n.value,e),r))),e}function ue(){var e,n,r;return y.type!==t.Punctuator&&y.type!==t.Keyword?n=se():Y("++")||Y("--")?(r=y,e=K(),n=ue(),u&&n.type===a.Identifier&&A(n.name)&&$({},o.StrictLHSPrefix),ee(n)||$({},o.InvalidLHSInAssignment),n=h.createUnaryExpression(e.value,n),n=h.markEnd(n,r)):Y("+")||Y("-")||Y("~")||Y("!")?(r=y,e=K(),n=ue(),n=h.createUnaryExpression(e.value,n),n=h.markEnd(n,r)):Z("delete")||Z("void")||Z("typeof")?(r=y,e=K(),n=ue(),n=h.createUnaryExpression(e.value,n),n=h.markEnd(n,r),u&&"delete"===n.operator&&n.argument.type===a.Identifier&&$({},o.StrictDelete)):n=se(),n}function me(e,n){var r=0;if(e.type!==t.Punctuator&&e.type!==t.Keyword)return 0;switch(e.value){case"||":r=1;break;case"&&":r=2;break;case"|":r=3;break;case"^":r=4;break;case"&":r=5;break;case"==":case"!=":case"===":case"!==":r=6;break;case"<":case">":case"<=":case">=":case"instanceof":r=7;break;case"in":r=n?7:0;break;case"<<":case">>":case">>>":r=8;break;case"+":case"-":r=9;break;case"*":case"/":case"%":r=11}return r}function de(){var e,n,r,i,c,l;return e=y,c=y,i=n=function(){var e,t,n,r,a;return a=y,e=function(){var e,t,n,r,a,i,o,c,l,s;if(e=y,l=ue(),0===(a=me(r=y,S.allowIn)))return l;for(r.prec=a,K(),t=[e,y],i=[l,r,o=ue()];(a=me(y,S.allowIn))>0;){for(;i.length>2&&a<=i[i.length-2].prec;)o=i.pop(),c=i.pop().value,l=i.pop(),n=h.createBinaryExpression(c,l,o),t.pop(),e=t[t.length-1],h.markEnd(n,e),i.push(n);(r=K()).prec=a,i.push(r),t.push(y),n=ue(),i.push(n)}for(n=i[s=i.length-1],t.pop();s>1;)n=h.createBinaryExpression(i[s-1].value,i[s-2],n),s-=2,e=t.pop(),h.markEnd(n,e);return n}(),Y("?")&&(K(),t=S.allowIn,S.allowIn=!0,n=de(),S.allowIn=t,J(":"),r=de(),e=h.createConditionalExpression(e,n,r),h.markEnd(e,a)),e}(),y.type!==t.Punctuator||"="!==(l=y.value)&&"*="!==l&&"/="!==l&&"%="!==l&&"+="!==l&&"-="!==l&&"<<="!==l&&">>="!==l&&">>>="!==l&&"&="!==l&&"^="!==l&&"|="!==l||(ee(n)||$({},o.InvalidLHSInAssignment),u&&n.type===a.Identifier&&A(n.name)&&$(e,o.StrictLHSAssignment),e=K(),r=de(),i=h.markEnd(h.createAssignmentExpression(e.value,n,r),c)),i}function pe(){var e,t=y;if(e=de(),Y(",")){for(e=h.createSequenceExpression([e]);m<f&&Y(",");)K(),e.expressions.push(de());h.markEnd(e,t)}return e}function fe(){var e,t;return t=y,J("{"),e=function(){for(var e,t=[];m<f&&!Y("}")&&void 0!==(e=xe());)t.push(e);return t}(),J("}"),h.markEnd(h.createBlockStatement(e),t)}function he(){var e,n;return n=y,(e=K()).type!==t.Identifier&&X(e),h.markEnd(h.createIdentifier(e.value),n)}function ye(e){var t,n,r=null;return n=y,t=he(),u&&A(t.name)&&$({},o.StrictVarName),"const"===e?(J("="),r=de()):Y("=")&&(K(),r=de()),h.markEnd(h.createVariableDeclarator(t,r),n)}function Se(e){var t=[];do{if(t.push(ye(e)),!Y(","))break;K()}while(m<f);return t}function ge(){var e,t,n,r=[];for(n=y,Z("default")?(K(),e=null):(Q("case"),e=pe()),J(":");m<f&&!(Y("}")||Z("default")||Z("case"));)t=ve(),r.push(t);return h.markEnd(h.createSwitchCase(e,r),n)}function ve(){var e,n,r,i,c,l,d,p,g,v=y.type;if(v===t.EOF&&X(y),v===t.Punctuator&&"{"===y.value)return fe();if(i=y,v===t.Punctuator)switch(y.value){case";":return h.markEnd((J(";"),h.createEmptyStatement()),i);case"(":return h.markEnd(function(){var e=pe();return _(),h.createExpressionStatement(e)}(),i)}if(v===t.Keyword)switch(y.value){case"break":return h.markEnd(function(){var e,n=null;return Q("break"),59===s.charCodeAt(m)?(K(),S.inIteration||S.inSwitch||z({},o.IllegalBreak),h.createBreakStatement(null)):q()?(S.inIteration||S.inSwitch||z({},o.IllegalBreak),h.createBreakStatement(null)):(y.type===t.Identifier&&(e="$"+(n=he()).name,Object.prototype.hasOwnProperty.call(S.labelSet,e)||z({},o.UnknownLabel,n.name)),_(),null!==n||S.inIteration||S.inSwitch||z({},o.IllegalBreak),h.createBreakStatement(n))}(),i);case"continue":return h.markEnd(function(){var e,n=null;return Q("continue"),59===s.charCodeAt(m)?(K(),S.inIteration||z({},o.IllegalContinue),h.createContinueStatement(null)):q()?(S.inIteration||z({},o.IllegalContinue),h.createContinueStatement(null)):(y.type===t.Identifier&&(e="$"+(n=he()).name,Object.prototype.hasOwnProperty.call(S.labelSet,e)||z({},o.UnknownLabel,n.name)),_(),null!==n||S.inIteration||z({},o.IllegalContinue),h.createContinueStatement(n))}(),i);case"debugger":return h.markEnd((Q("debugger"),_(),h.createDebuggerStatement()),i);case"do":return h.markEnd((Q("do"),g=S.inIteration,S.inIteration=!0,d=ve(),S.inIteration=g,Q("while"),J("("),p=pe(),J(")"),Y(";")&&K(),h.createDoWhileStatement(d,p)),i);case"for":return h.markEnd(function(){var e,t,n,r,a,i,c,l,s,u;return e=t=n=null,Q("for"),J("("),Y(";")?K():(Z("var")||Z("let")?(S.allowIn=!1,u=y,l=K(),s=Se(),e=h.markEnd(h.createVariableDeclaration(s,l.value),u),S.allowIn=!0,1===e.declarations.length&&Z("in")&&(K(),r=e,a=pe(),e=null)):(S.allowIn=!1,e=pe(),S.allowIn=!0,Z("in")&&(ee(e)||$({},o.InvalidLHSInForIn),K(),r=e,a=pe(),e=null)),void 0===r&&J(";")),void 0===r&&(Y(";")||(t=pe()),J(";"),Y(")")||(n=pe())),J(")"),c=S.inIteration,S.inIteration=!0,i=ve(),S.inIteration=c,void 0===r?h.createForStatement(e,t,n,i):h.createForInStatement(r,a,i)}(),i);case"function":return h.markEnd(Ee(),i);case"if":return h.markEnd(function(){var e,t,n;return Q("if"),J("("),e=pe(),J(")"),t=ve(),Z("else")?(K(),n=ve()):n=null,h.createIfStatement(e,t,n)}(),i);case"return":return h.markEnd((l=null,Q("return"),S.inFunctionBody||$({},o.IllegalReturn),32===s.charCodeAt(m)&&w(s.charCodeAt(m+1))?(l=pe(),_(),h.createReturnStatement(l)):q()?h.createReturnStatement(null):(Y(";")||Y("}")||y.type===t.EOF||(l=pe()),_(),h.createReturnStatement(l))),i);case"switch":return h.markEnd(function(){var e,t,n,r,a;if(Q("switch"),J("("),e=pe(),J(")"),J("{"),t=[],Y("}"))return K(),h.createSwitchStatement(e,t);for(r=S.inSwitch,S.inSwitch=!0,a=!1;m<f&&!Y("}");)null===(n=ge()).test&&(a&&z({},o.MultipleDefaultsInSwitch),a=!0),t.push(n);return S.inSwitch=r,J("}"),h.createSwitchStatement(e,t)}(),i);case"throw":return h.markEnd(function(){var e;return Q("throw"),q()&&z({},o.NewlineAfterThrow),e=pe(),_(),h.createThrowStatement(e)}(),i);case"try":return h.markEnd(function(){var e,t,n,r,a=[],i=null;return Q("try"),e=fe(),Z("catch")&&a.push((r=y,Q("catch"),J("("),Y(")")&&X(y),t=he(),u&&A(t.name)&&$({},o.StrictCatchVariable),J(")"),n=fe(),h.markEnd(h.createCatchClause(t,n),r))),Z("finally")&&(K(),i=fe()),0!==a.length||i||z({},o.NoCatchOrFinally),h.createTryStatement(e,[],a,i)}(),i);case"var":return h.markEnd((Q("var"),c=Se(),_(),h.createVariableDeclaration(c,"var")),i);case"while":return h.markEnd(function(){var e,t,n;return Q("while"),J("("),e=pe(),J(")"),n=S.inIteration,S.inIteration=!0,t=ve(),S.inIteration=n,h.createWhileStatement(e,t)}(),i);case"with":return h.markEnd(function(){var e,t;return u&&(U(),$({},o.StrictModeWith)),Q("with"),J("("),e=pe(),J(")"),t=ve(),h.createWithStatement(e,t)}(),i)}return(e=pe()).type===a.Identifier&&Y(":")?(K(),r="$"+e.name,Object.prototype.hasOwnProperty.call(S.labelSet,r)&&z({},o.Redeclaration,"Label",e.name),S.labelSet[r]=!0,n=ve(),delete S.labelSet[r],h.markEnd(h.createLabeledStatement(e,n),i)):(_(),h.markEnd(h.createExpressionStatement(e),i))}function ke(){var e,n,r,i,c,l,d,p,g=[];for(p=y,J("{");m<f&&y.type===t.StringLiteral&&(n=y,e=xe(),g.push(e),e.expression.type===a.Literal);)"use strict"===s.slice(n.start+1,n.end-1)?(u=!0,r&&$(r,o.StrictOctalLiteral)):!r&&n.octal&&(r=n);for(i=S.labelSet,c=S.inIteration,l=S.inSwitch,d=S.inFunctionBody,S.labelSet={},S.inIteration=!1,S.inSwitch=!1,S.inFunctionBody=!0;m<f&&!Y("}")&&void 0!==(e=xe());)g.push(e);return J("}"),S.labelSet=i,S.inIteration=c,S.inSwitch=l,S.inFunctionBody=d,h.markEnd(h.createBlockStatement(g),p)}function be(e){var t,n,r,a,i,c,l=[];if(J("("),!Y(")"))for(a={};m<f&&(n=y,t=he(),i="$"+n.value,u?(A(n.value)&&(r=n,c=o.StrictParamName),Object.prototype.hasOwnProperty.call(a,i)&&(r=n,c=o.StrictParamDupe)):e||(A(n.value)?(e=n,c=o.StrictParamName):L(n.value)?(e=n,c=o.StrictReservedWord):Object.prototype.hasOwnProperty.call(a,i)&&(e=n,c=o.StrictParamDupe)),l.push(t),a[i]=!0,!Y(")"));)J(",");return J(")"),{params:l,stricted:r,firstRestricted:e,message:c}}function Ee(){var e,t,n,r,a,i,c,l,s,m;return m=y,Q("function"),r=y,e=he(),u?A(r.value)&&$(r,o.StrictFunctionName):A(r.value)?(c=r,l=o.StrictFunctionName):L(r.value)&&(c=r,l=o.StrictReservedWord),t=(i=be(c)).params,a=i.stricted,c=i.firstRestricted,i.message&&(l=i.message),s=u,n=ke(),u&&c&&z(c,l),u&&a&&$(a,l),u=s,h.markEnd(h.createFunctionDeclaration(e,t,[],n),m)}function xe(){if(y.type===t.Keyword)switch(y.value){case"const":case"let":return e=y.value,r=y,Q(e),n=Se(e),_(),h.markEnd(h.createVariableDeclaration(n,e),r);case"function":return Ee();default:return ve()}var e,n,r;if(y.type!==t.EOF)return ve()}function Ce(){var e,t,n,r=[];for(e=0;e<g.tokens.length;++e)n={type:(t=g.tokens[e]).type,value:t.value},g.range&&(n.range=t.range),g.loc&&(n.loc=t.loc),r.push(n);g.tokens=r}(n={})[(t={BooleanLiteral:1,EOF:2,Identifier:3,Keyword:4,NullLiteral:5,NumericLiteral:6,Punctuator:7,StringLiteral:8,RegularExpression:9}).BooleanLiteral]="Boolean",n[t.EOF]="<end>",n[t.Identifier]="Identifier",n[t.Keyword]="Keyword",n[t.NullLiteral]="Null",n[t.NumericLiteral]="Numeric",n[t.Punctuator]="Punctuator",n[t.StringLiteral]="String",n[t.RegularExpression]="RegularExpression",r=["(","{","[","in","typeof","instanceof","new","return","case","delete","throw","void","=","+=","-=","*=","/=","%=","<<=",">>=",">>>=","&=","|=","^=",",","+","-","*","/","%","++","--","<<",">>",">>>","&","|","^","!","~","&&","||","?",":","===","==",">=","<=","<",">","!=","!=="],a={AssignmentExpression:"AssignmentExpression",ArrayExpression:"ArrayExpression",BlockStatement:"BlockStatement",BinaryExpression:"BinaryExpression",BreakStatement:"BreakStatement",CallExpression:"CallExpression",CatchClause:"CatchClause",ConditionalExpression:"ConditionalExpression",ContinueStatement:"ContinueStatement",DoWhileStatement:"DoWhileStatement",DebuggerStatement:"DebuggerStatement",EmptyStatement:"EmptyStatement",ExpressionStatement:"ExpressionStatement",ForStatement:"ForStatement",ForInStatement:"ForInStatement",FunctionDeclaration:"FunctionDeclaration",FunctionExpression:"FunctionExpression",Identifier:"Identifier",IfStatement:"IfStatement",Literal:"Literal",LabeledStatement:"LabeledStatement",LogicalExpression:"LogicalExpression",MemberExpression:"MemberExpression",NewExpression:"NewExpression",ObjectExpression:"ObjectExpression",Program:"Program",Property:"Property",ReturnStatement:"ReturnStatement",SequenceExpression:"SequenceExpression",SwitchStatement:"SwitchStatement",SwitchCase:"SwitchCase",ThisExpression:"ThisExpression",ThrowStatement:"ThrowStatement",TryStatement:"TryStatement",UnaryExpression:"UnaryExpression",UpdateExpression:"UpdateExpression",VariableDeclaration:"VariableDeclaration",VariableDeclarator:"VariableDeclarator",WhileStatement:"WhileStatement",WithStatement:"WithStatement"},i={Data:1,Get:2,Set:4},o={UnexpectedToken:"Unexpected token %0",UnexpectedNumber:"Unexpected number",UnexpectedString:"Unexpected string",UnexpectedIdentifier:"Unexpected identifier",UnexpectedReserved:"Unexpected reserved word",UnexpectedEOS:"Unexpected end of input",NewlineAfterThrow:"Illegal newline after throw",InvalidRegExp:"Invalid regular expression",UnterminatedRegExp:"Invalid regular expression: missing /",InvalidLHSInAssignment:"Invalid left-hand side in assignment",InvalidLHSInForIn:"Invalid left-hand side in for-in",MultipleDefaultsInSwitch:"More than one default clause in switch statement",NoCatchOrFinally:"Missing catch or finally after try",UnknownLabel:"Undefined label '%0'",Redeclaration:"%0 '%1' has already been declared",IllegalContinue:"Illegal continue statement",IllegalBreak:"Illegal break statement",IllegalReturn:"Illegal return statement",StrictModeWith:"Strict mode code may not include a with statement",StrictCatchVariable:"Catch variable may not be eval or arguments in strict mode",StrictVarName:"Variable name may not be eval or arguments in strict mode",StrictParamName:"Parameter name eval or arguments is not allowed in strict mode",StrictParamDupe:"Strict mode function may not have duplicate parameter names",StrictFunctionName:"Function name may not be eval or arguments in strict mode",StrictOctalLiteral:"Octal literals are not allowed in strict mode.",StrictDelete:"Delete of an unqualified identifier in strict mode.",StrictDuplicateProperty:"Duplicate data property in object literal not allowed in strict mode",AccessorDataProperty:"Object literal may not have data and accessor property with the same name",AccessorGetSet:"Object literal may not have multiple get/set accessors with the same name",StrictLHSAssignment:"Assignment to eval or arguments is not allowed in strict mode",StrictLHSPostfix:"Postfix increment/decrement may not have eval or arguments operand in strict mode",StrictLHSPrefix:"Prefix increment/decrement may not have eval or arguments operand in strict mode",StrictReservedWord:"Use of future reserved word in strict mode"},c={NonAsciiIdentifierStart:new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),NonAsciiIdentifierPart:new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")},l={name:"SyntaxTree",processComment:function(e){var t,n;if(!(e.type===a.Program&&e.body.length>0)){for(g.trailingComments.length>0?g.trailingComments[0].range[0]>=e.range[1]?(n=g.trailingComments,g.trailingComments=[]):g.trailingComments.length=0:g.bottomRightStack.length>0&&g.bottomRightStack[g.bottomRightStack.length-1].trailingComments&&g.bottomRightStack[g.bottomRightStack.length-1].trailingComments[0].range[0]>=e.range[1]&&(n=g.bottomRightStack[g.bottomRightStack.length-1].trailingComments,delete g.bottomRightStack[g.bottomRightStack.length-1].trailingComments);g.bottomRightStack.length>0&&g.bottomRightStack[g.bottomRightStack.length-1].range[0]>=e.range[0];)t=g.bottomRightStack.pop();t?t.leadingComments&&t.leadingComments[t.leadingComments.length-1].range[1]<=e.range[0]&&(e.leadingComments=t.leadingComments,delete t.leadingComments):g.leadingComments.length>0&&g.leadingComments[g.leadingComments.length-1].range[1]<=e.range[0]&&(e.leadingComments=g.leadingComments,g.leadingComments=[]),n&&(e.trailingComments=n),g.bottomRightStack.push(e)}},markEnd:function(e,t){return g.range&&(e.range=[t.start,m]),g.loc&&(e.loc=new H(void 0===t.startLineNumber?t.lineNumber:t.startLineNumber,t.start-(void 0===t.startLineStart?t.lineStart:t.startLineStart),d,m-p),this.postProcess(e)),g.attachComment&&this.processComment(e),e},postProcess:function(e){return g.source&&(e.loc.source=g.source),e},createArrayExpression:function(e){return{type:a.ArrayExpression,elements:e}},createAssignmentExpression:function(e,t,n){return{type:a.AssignmentExpression,operator:e,left:t,right:n}},createBinaryExpression:function(e,t,n){return{type:"||"===e||"&&"===e?a.LogicalExpression:a.BinaryExpression,operator:e,left:t,right:n}},createBlockStatement:function(e){return{type:a.BlockStatement,body:e}},createBreakStatement:function(e){return{type:a.BreakStatement,label:e}},createCallExpression:function(e,t){return{type:a.CallExpression,callee:e,arguments:t}},createCatchClause:function(e,t){return{type:a.CatchClause,param:e,body:t}},createConditionalExpression:function(e,t,n){return{type:a.ConditionalExpression,test:e,consequent:t,alternate:n}},createContinueStatement:function(e){return{type:a.ContinueStatement,label:e}},createDebuggerStatement:function(){return{type:a.DebuggerStatement}},createDoWhileStatement:function(e,t){return{type:a.DoWhileStatement,body:e,test:t}},createEmptyStatement:function(){return{type:a.EmptyStatement}},createExpressionStatement:function(e){return{type:a.ExpressionStatement,expression:e}},createForStatement:function(e,t,n,r){return{type:a.ForStatement,init:e,test:t,update:n,body:r}},createForInStatement:function(e,t,n){return{type:a.ForInStatement,left:e,right:t,body:n,each:!1}},createFunctionDeclaration:function(e,t,n,r){return{type:a.FunctionDeclaration,id:e,params:t,defaults:n,body:r,rest:null,generator:!1,expression:!1}},createFunctionExpression:function(e,t,n,r){return{type:a.FunctionExpression,id:e,params:t,defaults:n,body:r,rest:null,generator:!1,expression:!1}},createIdentifier:function(e){return{type:a.Identifier,name:e}},createIfStatement:function(e,t,n){return{type:a.IfStatement,test:e,consequent:t,alternate:n}},createLabeledStatement:function(e,t){return{type:a.LabeledStatement,label:e,body:t}},createLiteral:function(e){return{type:a.Literal,value:e.value,raw:s.slice(e.start,e.end)}},createMemberExpression:function(e,t,n){return{type:a.MemberExpression,computed:"["===e,object:t,property:n}},createNewExpression:function(e,t){return{type:a.NewExpression,callee:e,arguments:t}},createObjectExpression:function(e){return{type:a.ObjectExpression,properties:e}},createPostfixExpression:function(e,t){return{type:a.UpdateExpression,operator:e,argument:t,prefix:!1}},createProgram:function(e){return{type:a.Program,body:e}},createProperty:function(e,t,n){return{type:a.Property,key:t,value:n,kind:e}},createReturnStatement:function(e){return{type:a.ReturnStatement,argument:e}},createSequenceExpression:function(e){return{type:a.SequenceExpression,expressions:e}},createSwitchCase:function(e,t){return{type:a.SwitchCase,test:e,consequent:t}},createSwitchStatement:function(e,t){return{type:a.SwitchStatement,discriminant:e,cases:t}},createThisExpression:function(){return{type:a.ThisExpression}},createThrowStatement:function(e){return{type:a.ThrowStatement,argument:e}},createTryStatement:function(e,t,n,r){return{type:a.TryStatement,block:e,guardedHandlers:t,handlers:n,finalizer:r}},createUnaryExpression:function(e,t){return"++"===e||"--"===e?{type:a.UpdateExpression,operator:e,argument:t,prefix:!0}:{type:a.UnaryExpression,operator:e,argument:t,prefix:!0}},createVariableDeclaration:function(e,t){return{type:a.VariableDeclaration,declarations:e,kind:t}},createVariableDeclarator:function(e,t){return{type:a.VariableDeclarator,id:e,init:t}},createWhileStatement:function(e,t){return{type:a.WhileStatement,test:e,body:t}},createWithStatement:function(e,t){return{type:a.WithStatement,object:e,body:t}}},e.version="1.2.2",e.tokenize=function(e,n){var r;"string"==typeof e||e instanceof String||(e=String(e)),h=l,m=0,d=(s=e).length>0?1:0,p=0,f=s.length,y=null,S={allowIn:!0,labelSet:{},inFunctionBody:!1,inIteration:!1,inSwitch:!1,lastCommentStart:-1},g={},(n=n||{}).tokens=!0,g.tokens=[],g.tokenize=!0,g.openParenToken=-1,g.openCurlyToken=-1,g.range="boolean"==typeof n.range&&n.range,g.loc="boolean"==typeof n.loc&&n.loc,"boolean"==typeof n.comment&&n.comment&&(g.comments=[]),"boolean"==typeof n.tolerant&&n.tolerant&&(g.errors=[]);try{if(V(),y.type===t.EOF)return g.tokens;for(K();y.type!==t.EOF;)try{K()}catch(e){if(g.errors){g.errors.push(e);break}throw e}Ce(),r=g.tokens,void 0!==g.comments&&(r.comments=g.comments),void 0!==g.errors&&(r.errors=g.errors)}catch(e){throw e}finally{g={}}return r},e.parse=function(e,n){var r,i,c,v;i=String,"string"==typeof e||e instanceof String||(e=i(e)),h=l,m=0,d=(s=e).length>0?1:0,p=0,f=s.length,y=null,S={allowIn:!0,labelSet:{},inFunctionBody:!1,inIteration:!1,inSwitch:!1,lastCommentStart:-1},g={},void 0!==n&&(g.range="boolean"==typeof n.range&&n.range,g.loc="boolean"==typeof n.loc&&n.loc,g.attachComment="boolean"==typeof n.attachComment&&n.attachComment,g.loc&&null!==n.source&&void 0!==n.source&&(g.source=i(n.source)),"boolean"==typeof n.tokens&&n.tokens&&(g.tokens=[]),"boolean"==typeof n.comment&&n.comment&&(g.comments=[]),"boolean"==typeof n.tolerant&&n.tolerant&&(g.errors=[]),g.attachComment&&(g.range=!0,g.comments=[],g.bottomRightStack=[],g.trailingComments=[],g.leadingComments=[]));try{U(),V(),v=y,u=!1,c=function(){for(var e,n,r,i=[];m<f&&(n=y).type===t.StringLiteral&&(e=xe(),i.push(e),e.expression.type===a.Literal);)"use strict"===s.slice(n.start+1,n.end-1)?(u=!0,r&&$(r,o.StrictOctalLiteral)):!r&&n.octal&&(r=n);for(;m<f&&void 0!==(e=xe());)i.push(e);return i}(),r=h.markEnd(h.createProgram(c),v),void 0!==g.comments&&(r.comments=g.comments),void 0!==g.tokens&&(Ce(),r.tokens=g.tokens),void 0!==g.errors&&(r.errors=g.errors)}catch(e){throw e}finally{g={}}return r},e.Syntax=function(){var e,t={};for(e in"function"==typeof Object.create&&(t=Object.create(null)),a)a.hasOwnProperty(e)&&(t[e]=a[e]);return"function"==typeof Object.freeze&&Object.freeze(t),t}()}));