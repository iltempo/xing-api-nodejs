'use strict';

var XINGApi         = require('../lib/xing-api.js'),
    expect          = require('chai').expect,
    xingApi,
    client,
    // This should be removed later:
    CONSUMER_KEY    = 'deadbeef1ba60677cb11',
    CONSUMER_SECRET = 'deadbeef5e95a21e168dc66d77f2fce1dfc48a56'
  ;

var oauthStub = {
  getOAuthRequestToken: function (callback) {
    callback(null, 'oauthTokenWith20Char', 'oauthTknSecret20Char');
  },
  getOAuthAccessToken: function (oauthToken, oauthTokenSecret, oauthVerifier, callback) {
    callback(null, 'anAccessToken', 'anAccessTokenSecret', 'results');
  },
  get: function (url, oauth_token, oauth_token_secret, callback) {
    callback(url, oauth_token, oauth_token_secret);
  },
  put: function (url, oauth_token, oauth_token_secret, params, callback) {
    callback(url, oauth_token, oauth_token_secret);
  }
};

describe('xingApi', function () {
  beforeEach(function () {
    xingApi = new XINGApi({ consumerKey: CONSUMER_KEY, consumerSecret: CONSUMER_SECRET });
    xingApi.oauth = oauthStub;
  });

  describe('constructor', function () {
    it('sets consumerKey and consumerSecret if passed', function () {
      expect(xingApi.consumerKey).to.equal(CONSUMER_KEY);
      expect(xingApi.consumerSecret).to.equal(CONSUMER_SECRET);
    });

    it('fails to instantiate if no options given', function () {
      expect(function () {
        new XINGApi();
      }).to.throw('missing arguments: consumerKey and/or consumerSecret');
    });
  });

  describe('getRequestToken', function () {
    it('gets a requestToken', function (done) {
      xingApi.getRequestToken(function (oauthToken, oauthTokenSecret, authorizeUrl) {
        expect(oauthToken.length).to.equal(20);
        expect(oauthTokenSecret.length).to.equal(20);
        expect(authorizeUrl).to.equal('https://api.xing.com/v1/authorize?oauth_token=' + oauthToken);
        done();
      });
    });

    it('doesnt get a requestToken if client is not initialized with consumerKey and -Secret', function () {
      xingApi = new XINGApi({});
      expect(function () {
        xingApi.getRequestToken(function () {
        });
      }).to.throw('missing arguments: consumerKey and/or consumerSecret');
    });

    it('throws an error if no callback function is passed', function () {
      expect(function () {
        xingApi.getRequestToken();
      }).to.throw('no callback function passed to getRequestToken');
    });
  });

  describe('getAccessToken', function () {
    it('calls getOAuthToken on oauth instance', function () {
      xingApi.getAccessToken('aToken', 'aSecret', 'aVerifier',
        function (error, anAccessToken, anAccessTokenSecret, results) {
          expect(error).to.equal(null);
          expect(anAccessToken).to.equal('anAccessToken');
          expect(anAccessTokenSecret).to.equal('anAccessTokenSecret');
          expect(results).to.equal('results');
        });
    });
  });

  describe('client', function () {
    var token = 'aToken',
        secret = 'aSecret';

    beforeEach(function () {
      client = xingApi.client(token, secret);
    });

    describe('get', function () {
      it('prefixes the URL', function () {
        client.get('/v1/users/me', function (url) {
          expect(url).to.equal('https://api.xing.com/v1/users/me');
        });
      });

      it('calls oauth.get', function () {
        client.get('/v1/users/me', function (url, oauthToken, oauthTokenSecret) {
          expect(oauthToken).to.equal(token);
          expect(oauthTokenSecret).to.equal(secret);
        });
      });
    });

    describe('put', function () {
      it('prefixes the URL', function () {
        client.put('/v1/users/me/web_profiles/twitter', {}, function (url) {
          expect(url).to.equal('https://api.xing.com/v1/users/me/web_profiles/twitter');
        });
      });

      it('appends params to the url', function () {
        client.put('/v1/users/me/web_profiles/twitter', {
          foo: 'bar',
          bla: 'baz'
        }, function (url) {
          var base = 'https://api.xing.com/v1/users/me/web_profiles/twitter';
          expect(url).to.equal(base + '?foo=bar&bla=baz');
        });
      });

      it('calls oauth.put', function () {
        client.put('/v1/users/me/web_profiles/twitter', null, function (url, oauthToken, oauthTokenSecret) {
          expect(oauthToken).to.equal(token);
          expect(oauthTokenSecret).to.equal(secret);
        });
      });
    });

    //describe('post', function () {
    //  it('prefixes the URL', function () {
    //    client.put('/v1/users/me/web_profiles/twitter', {}, function (url) {
    //      expect(url).to.equal('https://api.xing.com/v1/users/me/web_profiles/twitter');
    //    });
    //  });
    //
    //  it('appends params to the url', function () {
    //    client.put('/v1/users/me/web_profiles/twitter', {
    //      foo: 'bar',
    //      bla: 'baz'
    //    }, function (url) {
    //      var base = 'https://api.xing.com/v1/users/me/web_profiles/twitter';
    //      expect(url).to.equal(base + '?foo=bar&bla=baz');
    //    });
    //  });
    //
    //  it('calls oauth.put', function () {
    //    client.put('/v1/users/me/web_profiles/twitter', null, function (url, oauthToken, oauthTokenSecret) {
    //      expect(oauthToken).to.equal(token);
    //      expect(oauthTokenSecret).to.equal(secret);
    //    });
    //  });
    //});
  });
});
