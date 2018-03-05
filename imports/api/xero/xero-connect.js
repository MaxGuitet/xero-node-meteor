import _ from 'lodash';
import { Meteor } from 'meteor/meteor';

import popup from '../popup/popup.js';

const Xero = {
  getRequestUrl(cb) {
    Meteor.call('xero.getRequestToken', (err, res) => {
      let error = null;
      if (err || typeof res !== 'string') {
        error =
          err ||
          new Meteor.Error('xero.getRequestToken.invalid', 'Unable to retrieve request token');
      }
      cb(error, res);
    });
  },

  initiateConnection(cb) {
    this.getRequestUrl((err, url) => {
      if (err) {
        if (_.isFunction(cb)) cb(err);
        return;
      }

      try {
        popup.show(url, cb, { height: 440 });
      } catch (error) {
        if (_.isFunction(cb)) cb(error);
      }
    });
  },
};

export default Xero;
