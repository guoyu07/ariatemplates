/*
 * Copyright 2013 Amadeus s.a.s.
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

Aria.tplScriptDefinition({
    $classpath : "test.aria.widgets.action.link.disabled.LinkDisabledTplScript",
    $prototype : {

        onToggleDisabledClick : function (evt) {
            this.$json.setValue(this.data, "link1Disabled", !this.data.link1Disabled);
            this.$json.setValue(this.data, "link2Disabled", !this.data.link2Disabled);
        },

        onClickLink1 : function () {
            this.$json.setValue(this.data, "clicksNumber1", this.data.clicksNumber1 + 1);
        },

        onClickLink2 : function () {
            this.$json.setValue(this.data, "clicksNumber2", this.data.clicksNumber2 + 1);
        }
    }
});
