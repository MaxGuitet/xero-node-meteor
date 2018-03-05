import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Meteor } from 'meteor/meteor';

// Import to load these templates
import '../../ui/layouts/app-body.js';
import '../../ui/pages/lists-show.js';

// Import to override accounts templates
import '../../ui/accounts/accounts-templates.js';

FlowRouter.route('/lists/:_id', {
  name: 'Lists.show',
  action() {
    BlazeLayout.render('App_body', { main: 'Lists_show' });
  },
});

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'Lists_show' });
  },
});

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};

FlowRouter.route('/xero/oauth/callback', {
  name: 'xero.authorize.callback',
  action(params, queryParams) {
    BlazeLayout.render('loading');
    Meteor.call('xero.authorizeCallback', queryParams, () => {
      window.close();
    });
  },
});

