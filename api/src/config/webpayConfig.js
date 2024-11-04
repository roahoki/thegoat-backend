const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require('transbank-sdk');

let tx;

if (process.env.NODE_ENV === 'production') {
  tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );
} else {
  if (!global.__webpay_instance__) {
    global.__webpay_instance__ = new WebpayPlus.Transaction(
      new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
    );
  }
  tx = global.__webpay_instance__;
}

module.exports = { tx };
