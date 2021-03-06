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
 * Simple class used to test class definition`
 */
Aria.classDefinition({
    $classpath : 'test.aria.test.ClassA',
    $constructor : function (optValueA) {
        if (optValueA != null) {
            this.propertyA = optValueA;
        } else {
            this.propertyA = 'valueA';
        }
        this.count = 0;
    },

    $destructor : function () {
        this.propertyA = null;
        this.count = null;
    },

    $prototype : {
        /**
         * Change count
         */
        methodA1 : function () {
            this.count++;
        },

        /**
         * @param {String} arg string argument
         * @return {String}
         */
        methodA2 : function (arg) {
            return arg + 'mA2';
        }
    }
});
