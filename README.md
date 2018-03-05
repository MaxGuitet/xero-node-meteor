This app is derived from [Meteor Todos example app](https://github.com/meteor/todos) and aim at showing the issue with **Partner** App

## Set up

Before running the app, set your Xero api keys as follows:

- in settings.json, set `consumerKey` and `consumerSecret`
- place your `privatekey.pem` in `/private/xero/privatekey.pem`
- set your app userAgent in `/imports/api/xero/server/xero.js:14`

### Running the app

```bash
npm start
```
Once the app is running, create an account with email/password and sign in.
Connect with Xero using the button on the left.

The page body will contain two buttons:
- `GET ORGANISATION NAME`: will call the `xeroClient.core.organisations.getOrganisation()` method. This one works fine.
- `GET CONTACTS FROM XERO`: will call the `xeroClient.core.contacts.getContacts()` method. This one will raise an error:
`UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 2): RangeError: Maximum call stack size exceeded`.
