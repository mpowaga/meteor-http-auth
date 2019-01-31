Package.describe({
  name: 'mpowaga:http-auth',
  version: '0.0.1',
  summary: 'Add HTTP Auth support to your application',
  git: 'https://github.com/mpowaga/meteor-http-auth',
  documentation: null
});

Package.onUse(function(api) {
  api.versionsFrom('1.5.2.2');
  api.use('ecmascript');
  api.mainModule('http-auth.js');
});