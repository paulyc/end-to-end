// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Executes End-to-End actions.
 */

goog.provide('e2e.ext.actions.Executor');

goog.require('e2e.ext.actions.Action');
goog.require('e2e.ext.actions.GetKeyDescription');
goog.require('e2e.ext.constants');
goog.require('e2e.ext.messages');
goog.require('e2e.openpgp.ContextImpl');

goog.scope(function() {
var actions = e2e.ext.actions;
var constants = e2e.ext.constants;
var messages = e2e.ext.messages;



/**
 * Constructor for the action executor.
 * @param {!function(...)=} opt_errorCallback If set, this is the default
 *     callback to call when an error is encountered.
 * @constructor
 */
actions.Executor = function(opt_errorCallback) {

  /**
   * The default callback to call when an error is encountered.
   * @type {!function(...)}
   * @private
   */
  this.errorCallback_ = opt_errorCallback || goog.nullFunction;
};


/**
 * Executes an action of the specified type using the provided request.
 * @param {messages.ApiRequest} request The input to the action.
 * @param {!goog.ui.Component} requestor The UI component through which the
 *     action was invoked.
 * @param {!function(...)} callback The callback to invoke once the action
 *     completes.
 * @param {!function(...)=} opt_errorCallback The callback to invoke if an error
 *     is encountered. If omitted, the default error callback will be invoked.
 */
actions.Executor.prototype.execute =
    function(request, requestor, callback, opt_errorCallback) {
  var action = this.getAction_(request.action);
  var errorCallback = opt_errorCallback || this.errorCallback_;

  if (action) {
    this.getContext_(goog.bind(function(ctx) {
      try {
        action.execute(ctx, request, requestor, callback, errorCallback);
      } catch (error) {
        errorCallback(error);
      }
    }, this), errorCallback);
  } else {
    var error = new Error();
    error.messageId = 'errorUnsupportedAction';
    errorCallback(error);
  }

};


/**
 * Returns the action that corresponds to the provided action type.
 * @param {constants.Actions} actionType The type of the action.
 * @return {actions.Action} The action.
 * @private
 */
actions.Executor.prototype.getAction_ = function(actionType) {
  switch (actionType) {
    case constants.Actions.GET_KEY_DESCRIPTION:
      return new actions.GetKeyDescription();
  }
  return null;
};


/**
 * Gets the PGP context.
 * @param {!function(e2e.openpgp.ContextImpl)} callback The callback where
 *     the PGP context is to be passed.
 * @param {!function(...)} errorCallback The callback to invoke if an error is
 *     encountered.
 * @private
 */
actions.Executor.prototype.getContext_ = function(callback, errorCallback) {
  chrome.runtime.getBackgroundPage(goog.bind(function(backgroundPage) {
    if (backgroundPage) {
      callback(
          /** @type {!e2e.openpgp.ContextImpl} */
          (backgroundPage.launcher.getContext()));
    } else {
      errorCallback(chrome.runtime.lastError);
    }
  }, this));
};

}); // goog.scope