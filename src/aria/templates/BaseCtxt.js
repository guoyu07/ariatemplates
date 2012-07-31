/*
 * Copyright 2012 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A context object is a wrapper around a Template. It provides the basic methods needed to call a macro on a template.
 * This class is extended by aria.templates.TemplateCtxt and aria.templates.CSSCtxt
 * @class aria.templates.BaseCtxt
 */
Aria.classDefinition({
    $classpath : 'aria.templates.BaseCtxt',
    $singleton : false,
    $constructor : function () {
        /**
         * Configuration parameters passed to initTemplate. Bean: aria.templates.CfgBeans.InitCSSTemplateCfg
         * @type Object
         * @protected
         */
        this._cfg = null;

        /**
         * List of chunks generated by the template engine
         * @type Array
         * @protected
         */
        this._out = null;

        /**
         * CSS template that the context is wrapping
         * @protected
         * @type aria.templates.CSSTemplate
         */
        this._tpl = null;

        /**
         * Stores references to the macro libraries accessed by the template or library
         */
        this._macrolibs = [];

    },
    $destructor : function () {
        // call destructor foreach in this._macrolibs
        if (!this._macrolibs) {
            return;
        }
        // dispose macro libraries
        for (var i = 0; i < this._macrolibs.length; i++) {
            var macrolib = this._macrolibs[i];
            aria.templates.ITemplate.prototype.$destructor.call(macrolib._tpl);
            macrolib.$dispose();
        }
        this._macrolibs = null;

    },
    $statics : {
        // ERROR MESSAGES:
        TEMPLATE_CONSTR_ERROR : "Error while creating a new instance of template '%1' - please check script constructor.",
        TEMPLATE_DESTR_ERROR : "Error while destroying an instance of template '%1' - please check script destructor.",
        MACRO_NOT_FOUND : "Missing macro '%1' in template '%2'.",
        MACRO_CALL_ERROR : "Error while calling macro '%1' in template '%2'.",
        LIBRARY_HANDLE_CONFLICT : "Template error: can't load shared macro library '%1'. A macro, text template, variable or another library has already been declared with the same name.",
        LIBRARY_ALREADY_LOADED : "Template error: library at classpath '%1' has already been loaded."
    },
    $prototype : {
        /**
         * Check that a macro object is correctly defined A macro object should have
         *
         * <pre>
         * {name : String, args: Array}
         * </pre>
         */
        checkMacro : function (macro) {
            if (macro == null) {
                return this._cfg.macro;
            }
            if (typeof(macro) == "string") {
                macro = {
                    name : macro,
                    args : [],
                    scope : this._tpl
                };
            } else {
                if (macro.args == null) {
                    macro.args = [];
                }
                if (macro.scope == null) {
                    macro.scope = this._tpl;
                }
            }
            // TODO: add a stronger check
            return macro;
        },

        /**
         * Call a macro. Note: this protected function is also called from the out object (MarkupWriter).
         * @protected
         */
        _callMacro : function (out, macro) {
            this.$assert(62, this._out != null);
            macro = this.checkMacro(macro);
            var tpl = macro.scope;
            var fct = tpl["macro_" + macro.name];
            if (fct == null) {
                this.$logError(this.MACRO_NOT_FOUND, [macro.name, tpl.$classpath]);
            }
            try {
                fct.apply(tpl, macro.args);
            } catch (ex) {
                this.$logError(this.MACRO_CALL_ERROR, [macro.name, tpl.$classpath], ex);
            }
        },

        /**
         * Private function, creates links to the macro libraries declared in the template. Sets handle names as
         * properties of the template pointing to the appropriate library.
         * @param {Array} macrolibsMap A map of all libraries declared by the template or Library in the form { handle :
         * "class.path", handle2 : "class.path2" }
         */
        __loadMacrolibs : function (macrolibsMap) {
            // macrolibsMap ~= {myLib : "path.to.lib1", otherLib : "path.to.otherLib"}
            var allClasspaths = {}; // simply stores all classpaths which need to be loaded, to avoid repetitions
            var allCPlength = 0; // number of classpaths to be loaded

            for (var handle in macrolibsMap) {
                if (macrolibsMap.hasOwnProperty(handle)) {
                    if (this._tpl[handle] !== undefined) {
                        // a variable, macro or other library with the same name has already been declared
                        // ignore the library declaration
                        delete macrolibsMap[handle];
                        this.$logError(this.LIBRARY_HANDLE_CONFLICT, [handle]);
                        continue;
                    } else if (allClasspaths[macrolibsMap[handle]]) {
                        // // we've already loaded a library with the same classpath: throw an error
                        this.$logError(this.LIBRARY_ALREADY_LOADED, [handle]);
                        continue;
                    }

                    allClasspaths[macrolibsMap[handle]] = true;
                    allCPlength++;
                }
            }

            if (allCPlength == 0) {
                // no deps - sync cb
                return;
            }

            for (var handle in macrolibsMap) {
                if (macrolibsMap.hasOwnProperty(handle)) {
                    // bind handle to template scope
                    this._tpl[handle] = Aria.getClassInstance(macrolibsMap[handle]);
                    // TODO: clean this code which uses a template context without initializing it the
                    // usual way (there is no call to the initTemplate method, because a library has less things to do,
                    // but there should be a common initialization method for things which are common)

                    // Create a shortcut for the __$write method which is often used:
                    this._tpl[handle].__$write = this._tpl.__$write;
                    var libCtxt = new aria.templates.TemplateCtxt();
                    libCtxt._tpl = this._tpl[handle];
                    this._macrolibs.push(libCtxt);
                    aria.templates.ITemplate.call(this._tpl[handle], libCtxt);
                    libCtxt._tpl.__$initTemplate();
                    libCtxt.__loadMacrolibs(libCtxt._tpl.__$macrolibs);
                }
            }

        }
    }
});