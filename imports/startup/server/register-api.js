import { Meteor } from 'meteor/meteor';

import '../../api/xero/server/methods.js';

Meteor.publish(null, function getUserSelf() {
  return Meteor.users.find({ _id: this.userId });
});
