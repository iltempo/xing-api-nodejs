/*
 * xing_api.js
 * https://github.com/volkert/xing-api
 *
 * Copyright (c) 2014 Volker Tietz
 * Licensed under the MIT license.
 */

'use strict';

var OAuth              = require('oauth').OAuth,
    stringify          = require('querystring').stringify,
    XING_BASE_URL      = 'https://api.xing.com',
    XING_REQUEST_URL   = XING_BASE_URL + '/v1/request_token',
    XING_ACCESS_URL    = XING_BASE_URL + '/v1/access_token',
    XING_AUTHORIZE_URL = XING_BASE_URL + '/v1/authorize',
    ERRORS             = {
      MISSING_CONSUMER_DATA: 'missing arguments: consumerKey and/or consumerSecret',
      MISSING_REQUEST_TOKEN_CALLBACK: 'no callback function passed to getRequestToken'
    }
  ;

module.exports = function (options) {
  if (typeof options === 'undefined') {
    throw Error(ERRORS.MISSING_CONSUMER_DATA);
  }
  var that = this;

  that.consumerKey = options.consumerKey;
  that.consumerSecret = options.consumerSecret;
  that.oauthCallback = options.oauthCallback || 'oob';
  that.oauthToken = null;
  that.oauthTokenSecret = null;

  that.oauth = new OAuth(
    XING_REQUEST_URL,
    XING_ACCESS_URL,
    that.consumerKey,
    that.consumerSecret,
    '1.0',
    that.oauthCallback,
    'HMAC-SHA1'
  );

  that.getRequestToken = function (callback) {
    if (arguments.length === 0) {
      throw new Error(ERRORS.MISSING_REQUEST_TOKEN_CALLBACK);
    }

    if (that.consumerKey && that.consumerSecret) {
      that.oauth.getOAuthRequestToken(function (error, oauthToken, oauthTokenSecret) {
        if (error) {
          console.error(error);
        }
        callback(oauthToken, oauthTokenSecret, XING_AUTHORIZE_URL + '?oauth_token=' + oauthToken);
      });
    } else {
      throw new Error(ERRORS.MISSING_CONSUMER_DATA);
    }
  };

  that.getAccessToken = function (oauthToken, oauthTokenSecret, oauthVerifier, callback) {
    that.oauth.getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, callback);
  };

  that.client = function (oauthToken, oauthSecret) {
    var _oauthToken = oauthToken,
        _oauthSecret = oauthSecret;

    function urlPrefix(url) {
      if (url.match(/^https:\/\/api\.xing\.com/) === null) {
        return 'https://api.xing.com' + url;
      } else {
        return url;
      }
    }

    return {
      get: function (url, callback) {
        url = urlPrefix(url);
        that.oauth.get(url, _oauthToken, _oauthSecret, callback);
      },
      //post: function (url, data, callback) {
      //  url = urlPrefix(url);
      //
      //  if(params && Object.keys(params).length > 0) {
      //    url += '?' + stringify(params);
      //  }
      //
      //  that.oauth.post(url, _oauthToken, _oauthSecret, callback);
      //},
      put: function (url, params, callback) {
        url = urlPrefix(url);

        if(params && Object.keys(params).length > 0) {
          url += '?' + stringify(params);
        }

        that.oauth.put(url, _oauthToken, _oauthSecret, null, callback);
      }
    };
  };
};
