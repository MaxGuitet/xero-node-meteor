import _ from 'lodash';
import xero from 'xero-node';
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

// Start of transition to xero-node library rather than custom code
// Begin with replacing interactions, then oauth (harder)

const baseXeroConfig = {
  authorizeCallbackUrl: Meteor.settings.xero.callbackUrl,
  consumerKey: Meteor.settings.xero.consumerKey,
  consumerSecret: Meteor.settings.xero.consumerSecret,
  privateKey: Assets.getText('xero/privatekey.pem'),
  userAgent: 'Test User Agent',
};

export const createXeroClient = options => {
  const { accessToken, accessSecret, sessionHandle, tokenExpiry } = options || {};
  return new xero.PartnerApplication({
    ...baseXeroConfig,
    accessToken,
    accessSecret,
    tokenExpiry,
    sessionHandle,
  });
};

export const createXeroClientForUser = user => {
  const { accessToken, accessSecret, sessionHandle, tokenExpiry } = _.get(user, 'xero') || {};
  if (!accessToken || !accessSecret) {
    throw new Meteor.Error(400, 'not_connected');
  }
  const xeroClient = createXeroClient({
    accessToken,
    accessSecret,
    tokenExpiry,
    sessionHandle,
  });

  xeroClient.eventEmitter.on(
    'xeroTokenUpdate',
    Meteor.bindEnvironment(opts => {
      console.log('updating tokens', opts);
      Meteor.users.update(
        {
          _id: user._id,
        },
        {
          $set: {
            'xero.accessToken': opts.accessToken,
            'xero.accessSecret': opts.accessSecret,
            'xero.sessionHandle': opts.sessionHandle,
            'xero.tokenExpiry': opts.tokenExpiry,
          },
        }
      );
    })
  );
  return xeroClient;
};

export const getXeroOrgName = new ValidatedMethod({
  name: 'xero.getOrgName',
  validate() {},
  async run() {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(404, 'User not found');
    }
    const xeroClient = createXeroClientForUser(user);
    const { Name } = await xeroClient.core.organisations.getOrganisation();
    return Name;
  },
});

export const getXeroContacts = new ValidatedMethod({
  name: 'xero.getContacts',
  validate() {},
  async run() {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(404, 'User not found');
    }
    const xeroClient = createXeroClientForUser(user);

    try {
      const contacts = await xeroClient.core.contacts.getContacts();
      console.log(contacts);
      return contacts;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(400, 'Error caught');
    }
  },
});
