(function() {
    var E, a, u, z, e, y, f, h, p, l, A, g, m, q, o, r, v, x, d, k, s, t, j, n, D, C, B, i, b, w = [].slice,
        c = [].indexOf || function(H) {
            for (var G = 0, F = this.length; G < F; G++) {
                if (G in this && this[G] === H) {
                    return G
                }
            }
            return -1
        };
    if (window.Dropbox == null) {
        window.Dropbox = {}
    }
    if (Dropbox.baseUrl == null) {
        Dropbox.baseUrl = "https://www.dropbox.com"
    }
    if (Dropbox.blockBaseUrl == null) {
        Dropbox.blockBaseUrl = "https://dl.dropbox.com"
    }
    Dropbox.addListener = function(H, G, F) {
        if (H.addEventListener) {
            H.addEventListener(G, F, false)
        } else {
            H.attachEvent("on" + G, function(I) {
                I.preventDefault = function() {
                    return this.returnValue = false
                };
                return F(I)
            })
        }
    };
    Dropbox.removeListener = function(H, G, F) {
        if (H.removeEventListener) {
            H.removeEventListener(G, F, false)
        } else {
            H.detachEvent("on" + G, F)
        }
    };
    z = function(G) {
        var H, F;
        F = encodeURIComponent(Dropbox.VERSION);
        H = G.indexOf("?") === -1 ? "?" : "&";
        return "" + G + H + "version=" + F
    };
    y = function(P, K) {
        var N, L, J, F, I, O, H, G, M;
        O = encodeURIComponent(window.location.protocol + "//" + window.location.host);
        N = encodeURIComponent(Dropbox.appKey);
        F = encodeURIComponent(P.linkType || "");
        H = encodeURIComponent(P._trigger || "js");
        I = Boolean(P.multiselect);
        L = encodeURIComponent(((M = P.extensions) != null ? typeof M.join === "function" ? M.join(" ") : void 0 : void 0) || "");
        J = Boolean(P.folderselect);
        K = Boolean(K);
        G = "" + Dropbox.baseUrl + "/chooser?origin=" + O + "&app_key=" + N + "&link_type=" + F;
        G += "&trigger=" + H + "&multiselect=" + I + "&extensions=" + L + "&folderselect=" + J + "&iframe=" + K;
        return z(G)
    };
    D = function(H) {
        var I, F, G;
        F = encodeURIComponent(window.location.protocol + "//" + window.location.host);
        I = encodeURIComponent(Dropbox.appKey);
        G = "" + Dropbox.baseUrl + "/saver?origin=" + F + "&app_key=" + I;
        return z(G)
    };
    k = 1;
    o = function(G, I) {
        var K, H, J, F;
        K = encodeURIComponent(Dropbox.appKey);
        F = "" + Dropbox.baseUrl + "/dropins/job_status?job=" + I + "&app_key=" + K;
        F = z(F);
        J = function(M) {
            var L;
            if (M.status === "COMPLETE") {
                if (typeof G.progress === "function") {
                    G.progress(1)
                }
                if (typeof G.success === "function") {
                    G.success()
                }
            } else {
                if ((L = M.status) === "PENDING" || L === "DOWNLOADING") {
                    if (M.progress != null) {
                        if (typeof G.progress === "function") {
                            G.progress(M.progress / 100)
                        }
                    }
                    setTimeout(H, 1500)
                } else {
                    if (M.status === "FAILED") {
                        if (typeof G.error === "function") {
                            G.error(M.error)
                        }
                    }
                }
            }
        };
        if ("withCredentials" in new XMLHttpRequest()) {
            H = function() {
                var L;
                L = new XMLHttpRequest();
                L.onload = function() {
                    return J(JSON.parse(L.responseText))
                };
                L.onerror = function() {
                    return typeof G.error === "function" ? G.error() : void 0
                };
                L.open("GET", F, true);
                return L.send()
            }
        } else {
            if (!Dropbox.disableJSONP) {
                H = function() {
                    var N, M, L;
                    N = "DropboxJsonpCallback" + k++;
                    M = false;
                    window[N] = function(O) {
                        M = true;
                        return J(O)
                    };
                    L = document.createElement("script");
                    L.src = "" + F + "&callback=" + N;
                    L.onreadystatechange = function() {
                        var O;
                        if (L.readyState === "loaded") {
                            if (!M) {
                                if (typeof G.error === "function") {
                                    G.error()
                                }
                            }
                            return (O = L.parentNode) != null ? O.removeChild(L) : void 0
                        }
                    };
                    return document.getElementsByTagName("head")[0].appendChild(L)
                }
            } else {
                if ((typeof XDomainRequest !== "undefined" && XDomainRequest !== null) && "https:" === document.location.protocol) {
                    H = function() {
                        var L;
                        L = new XDomainRequest();
                        L.onload = function() {
                            return J(JSON.parse(L.responseText))
                        };
                        L.onerror = function() {
                            return typeof G.error === "function" ? G.error() : void 0
                        };
                        L.open("get", F);
                        return L.send()
                    }
                } else {
                    throw new Error("Unable to find suitable means of cross domain communication")
                }
            }
        }
        if (typeof G.progress === "function") {
            G.progress(0)
        }
        return H()
    };
    r = function(L, M, N) {
        var J, I, K, H, G, F;
        I = JSON.parse(L.data);
        if ((typeof v !== "undefined" && v !== null) && N._popup) {
            K = v.contentWindow
        } else {
            K = L.source
        }
        switch (I.method) {
            case "origin_request":
                L.source.postMessage(JSON.stringify({
                    method: "origin"
                }), Dropbox.baseUrl);
                break;
            case "ready":
                if (N.files != null) {
                    if (N._fetch_url_on_save) {
                        F = (function() {
                            var R, P, Q, O;
                            Q = N.files;
                            O = [];
                            for (R = 0, P = Q.length; R < P; R++) {
                                H = Q[R];
                                O.push({
                                    filename: H.filename
                                })
                            }
                            return O
                        })();
                        G = JSON.stringify({
                            method: "files_with_callback",
                            params: F
                        })
                    } else {
                        G = JSON.stringify({
                            method: "files",
                            params: N.files
                        })
                    }
                    K.postMessage(G, Dropbox.baseUrl)
                }
                if (typeof N.ready === "function") {
                    N.ready()
                }
                break;
            case "files_selected":
            case "files_saved":
                if (typeof M === "function") {
                    M()
                }
                if (typeof N.success === "function") {
                    N.success(I.params)
                }
                break;
            case "progress":
                if (typeof N.progress === "function") {
                    N.progress(I.params)
                }
                break;
            case "close_dialog":
                if (typeof M === "function") {
                    M()
                }
                if (typeof N.cancel === "function") {
                    N.cancel()
                }
                break;
            case "web_session_error":
                if (typeof M === "function") {
                    M()
                }
                if (typeof N.webSessionFailure === "function") {
                    N.webSessionFailure()
                }
                break;
            case "web_session_unlinked":
                if (typeof M === "function") {
                    M()
                }
                if (typeof N.webSessionUnlinked === "function") {
                    N.webSessionUnlinked()
                }
                break;
            case "resize":
                if (typeof N.resize === "function") {
                    N.resize(I.params)
                }
                break;
            case "error":
                if (typeof M === "function") {
                    M()
                }
                if (typeof N.error === "function") {
                    N.error(I.params)
                }
                break;
            case "job_id":
                if (typeof M === "function") {
                    M()
                }
                o(N, I.params);
                break;
            case "save_callback":
                J = function(O) {
                    I = {
                        method: "continue_saving",
                        params: {
                            download_url: O != null ? O.url : void 0
                        }
                    };
                    K.postMessage(JSON.stringify(I), Dropbox.baseUrl)
                };
                g(N, I, J);
                break;
            case "_debug_log":
                if (typeof console !== "undefined" && console !== null) {
                    console.log(I.params.msg)
                }
        }
    };
    g = function(F, I, H) {
        var G;
        if (F._fetch_url_on_save) {
            G = F.files[0];
            if (typeof G.url !== "function") {
                if (typeof F.error === "function") {
                    F.error("Something went wrong, file url callback not provided.")
                }
            }
            G.url(H)
        }
    };
    v = null;
    h = function() {
        if (/\bTrident\b/.test(navigator.userAgent) && (document.body != null) && (v == null)) {
            v = document.createElement("iframe");
            v.setAttribute("id", "dropbox_xcomm");
            v.setAttribute("src", Dropbox.baseUrl + "/static/api/1/xcomm.html");
            v.style.display = "none";
            document.body.appendChild(v)
        }
    };
    Dropbox.createChooserWidget = function(F) {
        var G;
        G = p(y(F, true));
        G._handler = function(H) {
            if (H.source === G.contentWindow && H.origin === Dropbox.baseUrl) {
                r(H, null, F)
            }
        };
        Dropbox.addListener(window, "message", G._handler);
        return G
    };
    Dropbox.cleanupWidget = function(F) {
        if (!F._handler) {
            throw new Error("Invalid widget!")
        }
        Dropbox.removeListener(window, "message", F._handler);
        delete F._handler
    };
    n = function(F, G) {
        var I, H;
        I = (window.screenX || window.screenLeft) + ((window.outerWidth || document.documentElement.offsetWidth) - F) / 2;
        H = (window.screenY || window.screenTop) + ((window.outerHeight || document.documentElement.offsetHeight) - G) / 2;
        return "width=" + F + ",height=" + G + ",left=" + I + ",top=" + H
    };
    if (Dropbox._dropinsjs_loaded) {
        if (typeof console !== "undefined" && console !== null) {
            if (typeof console.warn === "function") {
                console.warn("dropins.js included more than once")
            }
        }
        return
    }
    Dropbox._dropinsjs_loaded = true;
    if (Dropbox.appKey == null) {
        Dropbox.appKey = (i = document.getElementById("dropboxjs")) != null ? i.getAttribute("data-app-key") : void 0
    }
    B = function(F) {
        return F
    };
    E = "https://www.dropbox.com/developers/dropins/chooser/js";
    u = ["text", "documents", "images", "video", "audio"];
    Dropbox.init = function(F) {
        if (F.translation_function != null) {
            B = F.translation_function
        }
        if (F.appKey != null) {
            Dropbox.appKey = F.appKey
        }
    };
    p = function(F) {
        var G;
        G = document.createElement("iframe");
        G.src = F;
        G.style.display = "block";
        G.style.backgroundColor = "white";
        G.style.border = "none";
        return G
    };
    j = function(L) {
        var H, F, N, G, K, M, J, I;
        if (typeof L[0] === "string") {
            G = L.shift();
            if (typeof L[0] === "string") {
                F = L.shift()
            } else {
                F = q(G)
            }
            N = L.shift() || {};
            N.files = [{
                url: G,
                filename: F
            }]
        } else {
            N = L.shift();
            if (N == null) {
                throw new Error("Missing arguments. See documentation.")
            }
            if (!(((J = N.files) != null ? J.length : void 0) || typeof N.files === "function")) {
                throw new Error("Missing files. See documentation.")
            }
            I = N.files;
            for (K = 0, M = I.length; K < M; K++) {
                H = I[K];
                if (typeof H.url === "function") {
                    N._fetch_url_on_save = true
                }
                if (!H.filename) {
                    H.filename = q(H.url)
                }
            }
            if (N._fetch_url_on_save && N.files.length > 1) {
                throw new Error("File url as callback is only supported for single files.")
            }
        }
        return N
    };
    Dropbox.save = function() {
        var I, K, J, H, L, G, F;
        I = 1 <= arguments.length ? w.call(arguments, 0) : [];
        H = j(I);
        if (!Dropbox.isBrowserSupported()) {
            alert(B("Your browser does not support the Dropbox Saver"));
            return
        }
        H._popup = true;
        if (!(typeof H.files === "object" && H.files.length)) {
            throw new Error("The object passed in must have a 'files' property that contains a list of objects. See documentation.")
        }
        F = H.files;
        for (L = 0, G = F.length; L < G; L++) {
            J = F[L];
            if (H._fetch_url_on_save) {
                if (typeof J.url !== "function") {
                    throw new Error("File urls should be either all functions or all urls, not a mix of both. See documentation.")
                }
            } else {
                if (typeof J.url !== "string") {
                    throw new Error("File urls to download incorrectly configured. Each file must have a url. See documentation.")
                }
            }
        }
        K = n(352, 237);
        return t(D(H), K, H)
    };
    t = function(H, I, G) {
        var K, J, L, F, M;
        K = function() {
            if (!F.closed) {
                F.close()
            }
            Dropbox.removeListener(window, "message", J);
            clearInterval(M)
        };
        J = function(N) {
            if (N.source === F || N.source === (v != null ? v.contentWindow : void 0)) {
                r(N, K, G)
            }
        };
        L = function() {
            if (F.closed) {
                K();
                if (typeof G.cancel === "function") {
                    G.cancel()
                }
            }
        };
        F = window.open(H, "dropbox", "" + I + ",resizable=yes,location=yes");
        if (!F) {
            throw new Error("Failed to open a popup window. Dropbox.choose and Dropbox.save should only be called from within a user-triggered event handler such as a tap or click event.")
        }
        F.focus();
        M = setInterval(L, 100);
        Dropbox.addListener(window, "message", J);
        return F
    };
    C = function(I) {
        var J, H, K, G, F;
        if (I.success == null) {
            if (typeof console !== "undefined" && console !== null) {
                if (typeof console.warn === "function") {
                    console.warn("You must provide a success callback to the Chooser to see the files that the user selects")
                }
            }
        }
        H = function() {
            if (typeof console !== "undefined" && console !== null) {
                if (typeof console.warn === "function") {
                    console.warn("The provided list of extensions or file types is not valid. See Chooser documentation: " + E)
                }
            }
            if (typeof console !== "undefined" && console !== null) {
                if (typeof console.warn === "function") {
                    console.warn("Available file types are: " + u.join(", "))
                }
            }
            return delete I.extensions
        };
        if ((I.extensions != null) && (Array.isArray != null)) {
            if (Array.isArray(I.extensions)) {
                F = I.extensions;
                for (K = 0, G = F.length; K < G; K++) {
                    J = F[K];
                    if (!J.match(/^\.[\.\w$#&+@!()\-'`_~]+$/) && c.call(u, J) < 0) {
                        H()
                    }
                }
            } else {
                H()
            }
        }
        return I
    };
    e = function(G) {
        var K, J, F, H, L, I;
        if (!Dropbox.isBrowserSupported()) {
            alert(B("Your browser does not support the Dropbox Chooser"));
            return
        }
        I = 640;
        F = 552;
        if (G.iframe) {
            L = p(y(G, true));
            L.style.width = I + "px";
            L.style.height = F + "px";
            L.style.margin = "125px auto 0 auto";
            L.style.border = "1px solid #ACACAC";
            L.style.boxShadow = "rgba(0, 0, 0, .2) 0px 4px 16px";
            H = document.createElement("div");
            H.style.position = "fixed";
            H.style.left = H.style.right = H.style.top = H.style.bottom = "0";
            H.style.zIndex = "1000";
            H.style.backgroundColor = "rgba(160, 160, 160, 0.2)";
            H.appendChild(L);
            document.body.appendChild(H);
            J = function(M) {
                if (M.source === L.contentWindow) {
                    r(M, (function() {
                        document.body.removeChild(H);
                        Dropbox.removeListener(window, "message", J)
                    }), G)
                }
            };
            Dropbox.addListener(window, "message", J)
        } else {
            K = n(I, F);
            t(y(G), K, G)
        }
    };
    Dropbox.choose = function(F) {
        if (F == null) {
            F = {}
        }
        F = C(F);
        e(F)
    };
    Dropbox.isBrowserSupported = function() {
        var F;
        F = d();
        Dropbox.isBrowserSupported = function() {
            return F
        };
        return F
    };
    d = function() {
        var I, H, G, F;
        F = [/IEMobile\/(7|8|9|10)\./, /BB10;/, /CriOS/];
        for (H = 0, G = F.length; H < G; H++) {
            I = F[H];
            if (I.test(navigator.userAgent)) {
                return false
            }
        }
        if (!((typeof JSON !== "undefined" && JSON !== null) && (window.postMessage != null) && (window.addEventListener != null))) {
            return false
        }
        return true
    };
    m = function(F) {
        return F.replace(/\/+$/g, "").split("/").pop()
    };
    q = function(G) {
        var F;
        F = document.createElement("a");
        F.href = G;
        return m(F.pathname)
    };
    f = function(G, H) {
        var F;
        if (H != null) {
            H.innerHTML = ""
        } else {
            H = document.createElement("a");
            H.href = "#"
        }
        H.className += " dropbox-dropin-btn";
        if (Dropbox.isBrowserSupported()) {
            H.className += " dropbox-dropin-default"
        } else {
            H.className += " dropbox-dropin-disabled"
        }
        F = document.createElement("span");
        F.className = "dropin-btn-status";
        H.appendChild(F);
        G = document.createTextNode(G);
        H.appendChild(G);
        return H
    };
    Dropbox.createChooseButton = function(F) {
        var G;
        if (F == null) {
            F = {}
        }
        F = C(F);
        G = f(B("Choose from Dropbox"));
        Dropbox.addListener(G, "click", function(H) {
            H.preventDefault();
            e({
                success: function(I) {
                    G.className = "dropbox-dropin-btn dropbox-dropin-success";
                    if (typeof F.success === "function") {
                        F.success(I)
                    }
                },
                cancel: F.cancel,
                linkType: F.linkType,
                multiselect: F.multiselect,
                folderselect: F.folderselect,
                extensions: F.extensions,
                iframe: F.iframe,
                _trigger: "button"
            })
        });
        return G
    };
    Dropbox.createSaveButton = function() {
        var G, H, F;
        G = 1 <= arguments.length ? w.call(arguments, 0) : [];
        F = j(G);
        H = G.shift();
        H = f(B("Save to Dropbox"), H);
        Dropbox.addListener(H, "click", function(I) {
            var J;
            I.preventDefault();
            if (!(H.className.indexOf("dropbox-dropin-error") >= 0 || H.className.indexOf("dropbox-dropin-default") >= 0 || H.className.indexOf("dropbox-dropin-disabled") >= 0)) {
                return
            }
            J = (typeof F.files === "function" ? F.files() : void 0) || F.files;
            if (!(J != null ? J.length : void 0)) {
                H.className = "dropbox-dropin-btn dropbox-dropin-error";
                if (typeof F.error === "function") {
                    F.error("Missing files")
                }
                return
            }
            Dropbox.save({
                files: J,
                success: function() {
                    H.className = "dropbox-dropin-btn dropbox-dropin-success";
                    if (typeof F.success === "function") {
                        F.success()
                    }
                },
                progress: function(K) {
                    H.className = "dropbox-dropin-btn dropbox-dropin-progress";
                    if (typeof F.progress === "function") {
                        F.progress(K)
                    }
                },
                cancel: function() {
                    if (typeof F.cancel === "function") {
                        F.cancel()
                    }
                },
                error: function(K) {
                    H.className = "dropbox-dropin-btn dropbox-dropin-error";
                    if (typeof F.error === "function") {
                        F.error(K)
                    }
                }
            })
        });
        return H
    };
    s = function(G, F) {
        return "background: " + G + ";\nbackground: -moz-linear-gradient(top, " + G + " 0%, " + F + " 100%);\nbackground: -webkit-linear-gradient(top, " + G + " 0%, " + F + " 100%);\nbackground: linear-gradient(to bottom, " + G + " 0%, " + F + " 100%);\nfilter: progid:DXImageTransform.Microsoft.gradient(startColorstr='" + G + "', endColorstr='" + F + "',GradientType=0);"
    };
    l = document.createElement("style");
    l.type = "text/css";
    A = '@-webkit-keyframes rotate {\n  from  { -webkit-transform: rotate(0deg); }\n  to   { -webkit-transform: rotate(360deg); }\n}\n\n@keyframes rotate {\n  from  { transform: rotate(0deg); }\n  to   { transform: rotate(360deg); }\n}\n\n.dropbox-dropin-btn, .dropbox-dropin-btn:link, .dropbox-dropin-btn:hover {\n  display: inline-block;\n  height: 14px;\n  font-family: "Lucida Grande", "Segoe UI", "Tahoma", "Helvetica Neue", "Helvetica", sans-serif;\n  font-size: 11px;\n  font-weight: 600;\n  color: #636363;\n  text-decoration: none;\n  padding: 1px 7px 5px 3px;\n  border: 1px solid #ebebeb;\n  border-radius: 2px;\n  border-bottom-color: #d4d4d4;\n  ' + (s("#fcfcfc", "#f5f5f5")) + "\n}\n\n.dropbox-dropin-default:hover, .dropbox-dropin-error:hover {\n  border-color: #dedede;\n  border-bottom-color: #cacaca;\n  " + (s("#fdfdfd", "#f5f5f5")) + "\n}\n\n.dropbox-dropin-default:active, .dropbox-dropin-error:active {\n  border-color: #d1d1d1;\n  box-shadow: inset 0 1px 1px rgba(0,0,0,0.1);\n}\n\n.dropbox-dropin-btn .dropin-btn-status {\n  display: inline-block;\n  width: 15px;\n  height: 14px;\n  vertical-align: bottom;\n  margin: 0 5px 0 2px;\n  background: transparent url('" + Dropbox.baseUrl + "/static/images/widgets/dbx-saver-status.png') no-repeat;\n  position: relative;\n  top: 2px;\n}\n\n.dropbox-dropin-default .dropin-btn-status {\n  background-position: 0px 0px;\n}\n\n.dropbox-dropin-progress .dropin-btn-status {\n  width: 18px;\n  margin: 0 4px 0 0;\n  background: url('" + Dropbox.baseUrl + "/static/images/widgets/dbx-progress.png') no-repeat center center;\n  -webkit-animation-name: rotate;\n  -webkit-animation-duration: 1.7s;\n  -webkit-animation-iteration-count: infinite;\n  -webkit-animation-timing-function: linear;\n  animation-name: rotate;\n  animation-duration: 1.7s;\n  animation-iteration-count: infinite;\n  animation-timing-function: linear;\n}\n\n.dropbox-dropin-success .dropin-btn-status {\n  background-position: -15px 0px;\n}\n\n.dropbox-dropin-disabled {\n  background: #e0e0e0;\n  border: 1px #dadada solid;\n  border-bottom: 1px solid #ccc;\n  box-shadow: none;\n}\n\n.dropbox-dropin-disabled .dropin-btn-status {\n  background-position: -30px 0px;\n}\n\n.dropbox-dropin-error .dropin-btn-status {\n  background-position: -45px 0px;\n}\n\n@media only screen and (-webkit-min-device-pixel-ratio: 1.4) {\n  .dropbox-dropin-btn .dropin-btn-status {\n    background-image: url('" + Dropbox.baseUrl + "/static/images/widgets/dbx-saver-status-2x.png');\n    background-size: 60px 14px;\n    -webkit-background-size: 60px 14px;\n  }\n\n  .dropbox-dropin-progress .dropin-btn-status {\n    background: url('" + Dropbox.baseUrl + "/static/images/widgets/dbx-progress-2x.png') no-repeat center center;\n    background-size: 20px 20px;\n    -webkit-background-size: 20px 20px;\n  }\n}\n\n.dropbox-saver:hover, .dropbox-chooser:hover {\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.dropbox-chooser, .dropbox-dropin-btn {\n  line-height: 11px !important;\n  text-decoration: none !important;\n  box-sizing: content-box !important;\n  -webkit-box-sizing: content-box !important;\n  -moz-box-sizing: content-box !important;\n}\n";
    if (l.styleSheet) {
        l.styleSheet.cssText = A
    } else {
        l.textContent = A
    }
    document.getElementsByTagName("head")[0].appendChild(l);
    setTimeout(h, 0);
    a = function() {
        if (document.removeEventListener) {
            document.removeEventListener("DOMContentLoaded", a, false)
        } else {
            if (document.detachEvent) {
                document.detachEvent("onreadystatechange", a)
            }
        }
        h();
        x()
    };
    if ((b = document.readyState) === "interactive" || b === "complete") {
        setTimeout(a, 0)
    } else {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", a, false)
        } else {
            document.attachEvent("onreadystatechange", a)
        }
    }
    Dropbox.VERSION = "2";
    x = function() {
        var G, H, F, I;
        I = document.getElementsByTagName("a");
        for (H = 0, F = I.length; H < F; H++) {
            G = I[H];
            if (c.call((G.getAttribute("class") || "").split(" "), "dropbox-saver") >= 0) {
                (function(J) {
                    Dropbox.createSaveButton({
                        files: function() {
                            return [{
                                url: J.getAttribute("data-url") || J.href,
                                filename: J.getAttribute("data-filename") || m(J.pathname)
                            }]
                        }
                    }, J)
                })(G)
            }
        }
    }
}).call(this);