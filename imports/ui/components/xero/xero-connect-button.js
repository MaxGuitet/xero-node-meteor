import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Xero from '/imports/api/xero/xero-connect.js';

import './xero-connect-button.html';

Template.xeroConnectButton.onCreated(function() {
  this.isBusy = new ReactiveVar(false);
});

Template.xeroConnectButton.helpers({
  hasXeroEnabled() {
    return _.get(Meteor.user(), 'xero.org');
  },

  loggedIn() {
    return Meteor.user();
  },

  isBusy() {
    return Template.instance().isBusy.get();
  },
});

Template.xeroConnectButton.events({
  'click #connectXero': function(evt, template) {
    evt.preventDefault();
    template.isBusy.set(true);

    // Open Xero login window with request URL generated within onCreated
    Xero.initiateConnection(err => {
      template.isBusy.set(false);

      if (err) {
        console.error(`Unable to connect to Xero. ${err.reason || err}`);
        return;
      } else if (!_.get(Meteor.user(), 'xero.org')) {
        console.error(`Unable to connect to Xero.`);
        return;
      }
      console.log('Your account is now linked with your Xero account.');
    });
  },

  'click #disconnectXero': function(evt) {
    evt.preventDefault();
    Meteor.call('xero.disconnectUser', err => {
      if (err) {
        console.error(`Unable to remove connection. ${err.reason}`);
        return;
      }
      console.log('Your account has been disconnected from Xero.');
    });
  },
});
