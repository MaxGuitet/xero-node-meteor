import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { createXeroClient, createXeroClientForUser } from './xero.js';

Meteor.methods({
  'xero.getRequestToken': async function() {
    // Check user and tenant are defined
    const user = Meteor.users.findOne({
      _id: this.userId,
    });
    if (!user) {
      throw new Meteor.Error(404, 'User not found');
    }

    /**
     * User not yet connected, we simply call createXeroClient since we do not have
     * anything on the client's "xero" object
     */
    const xeroClient = createXeroClient();
    const requestToken = await xeroClient.getRequestToken();

    Meteor.users.update(
      {
        _id: user._id,
      },
      {
        $set: {
          'xero.requestToken': requestToken.token,
          'xero.requestSecret': requestToken.secret,
        },
      }
    );

    return xeroClient.buildAuthorizeUrl(requestToken.token);
  },

  'xero.authorizeCallback': async function(params) {
    check(params, {
      oauth_token: String,
      oauth_verifier: String,
      org: String,
    });
    const user = Meteor.users.findOne({
      _id: this.userId,
    });
    if (!user) {
      throw new Meteor.Error(404, 'User not found');
    }

    if (user.xero.requestToken !== params.oauth_token) {
      throw new Meteor.Error(400, 'Invalid Token');
    }

    /**
     * For some reason, on the callback route xero.authorize.callback,
     * the method is called twice which triggers an error on the second call.
     * Checking for 'xero.org' allow us to prevent this, despite how dirty it is.
     */
    if (_.get(user, 'xero.org')) {
      return null;
    }

    Meteor.users.update(
      {
        _id: user._id,
      },
      {
        $set: {
          'xero.org': params.org,
        },
      }
    );

    try {
      const xeroClient = createXeroClient();
      const { results } = await xeroClient.setAccessToken(
        params.oauth_token,
        user.xero.requestSecret,
        params.oauth_verifier
      );

      if (results) {
        const expire = new Date();
        expire.setTime(expire.getTime() + results.oauth_expires_in * 1000);
        Meteor.users.update(
          {
            _id: Meteor.userId(),
          },
          {
            $set: {
              'xero.accessToken': results.oauth_token,
              'xero.accessSecret': results.oauth_token_secret,
              'xero.sessionHandle': results.oauth_session_handle,
              'xero.tokenExpiry': expire,
            },
          }
        );
      } else {
        throw new Error('Invalid Xero Credentials');
      }

      return true;
    } catch (err) {
      Meteor.call('xero.disconnectUser');
      return false;
    }
  },

  'xero.disconnectUser': function() {
    if (!this.userId) {
      throw new Meteor.Error(
        'xero.disconnectUser.notLoggedIn',
        'Only logged in users can disconnect.'
      );
    }

    return Meteor.users.update(
      {
        _id: this.userId,
      },
      {
        $unset: {
          xero: '',
        },
      }
    );
  },
});
