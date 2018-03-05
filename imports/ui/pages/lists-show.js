/* global confirm */

import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';

import './lists-show.html';

import { displayError } from '../lib/errors.js';

Template.Lists_show.onCreated(function listShowOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    contacts: [],
    organisationName: 'Unknown',
  });
});

Template.Lists_show.helpers({
  contacts() {
    const instance = Template.instance();
    return instance.state.get('contacts');
  },

  contactsCount() {
    const instance = Template.instance();
    return instance.state.get('contacts').length;
  },

  organisationName() {
    const instance = Template.instance();
    return instance.state.get('organisationName');
  },

  xeroConnected() {
    return _.get(Meteor.user(), 'xero.tokenExpiry');
  },
});

Template.Lists_show.events({
  'click .js-update-contacts'(event, instance) {
    const isConnectedToXero = _.get(Meteor.user(), 'xero.tokenExpiry');
    if (isConnectedToXero) {
      Meteor.call('xero.getContacts', (err, res) => {
        if (err) {
          console.error(err);
          displayError(err);
          return;
        }
        instance.state.set('contacts', res);
      });
    }
  },
  'click .js-update-organisation'(event, instance) {
    const isConnectedToXero = _.get(Meteor.user(), 'xero.tokenExpiry');
    if (isConnectedToXero) {
      Meteor.call('xero.getOrgName', (err, res) => {
        if (err) {
          console.log(err);
          displayError(err);
          return;
        }
        instance.state.set('organisationName', res);
      });
    }
  },
});
