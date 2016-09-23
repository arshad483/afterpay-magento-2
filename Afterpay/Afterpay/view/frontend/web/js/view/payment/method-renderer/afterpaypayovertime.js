/**
 * Magento 2 extensions for Afterpay Payment
 *
 * @author Afterpay <steven.gunarso@touchcorp.com>
 * @copyright 2016 Afterpay https://www.afterpay.com.au/
 */
/*browser:true*/
/*global define*/
define(
    [
        'jquery',
        'Magento_Checkout/js/view/payment/default',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/model/payment/additional-validators'
    ],
    function ($, Component, quote, additionalValidators) {
        'use strict';

        return Component.extend({
            /** Don't redirect to the success page immediately after placing order **/
            redirectAfterPlaceOrder: false,
            defaults: {
                template: 'Afterpay_Afterpay/payment/afterpaypayovertime',
                billingAgreement: ''
            },

            /** Returns payment acceptance mark image path */
            getAfterpayPayovertimeLogoSrc: function() {
                return 'https://www.afterpay.com.au/wp-content/themes/afterpay/assets/img/logo_scroll.png';
            },

            /**
             * Terms and condition link
             * @returns {*}
             */
            getTermsConditionUrl: function() {
                return window.checkoutConfig.payment.afterpay.termsConditionUrl;
            },

            /**
             * Get Grand Total of the current cart
             * @returns {*}
             */
            getGrandTotal: function() {
                var total = window.checkoutConfig.totalsData.grand_total;
                var format = window.checkoutConfig.priceFormat.pattern;
                return format.replace(/%s/g, total.toFixed(window.checkoutConfig.priceFormat.precision));
            },

            /**
             * Returns the installment fee of the payment */
            getAfterpayInstallmentFee: function() {
                // Checking and making sure checkoutConfig data exist and not total 0 dollar
                if (typeof window.checkoutConfig !== 'undefined' &&
                    window.checkoutConfig.totalsData.grand_total > 0) {

                    // Set installment fee from grand total and check format price to be output
                    var installmentFee = window.checkoutConfig.totalsData.grand_total / 4;
                    var format = window.checkoutConfig.priceFormat.pattern;

                    // return with the currency code ($) and decimal setting (default: 2)
                    return format.replace(/%s/g, installmentFee.toFixed(window.checkoutConfig.priceFormat.precision));
                }
            },

            /**
             *  process Afterpay Payment
             */
            continueAfterpayPayment: function () {
                // Added additional validation to check
                if (additionalValidators.validate()) {
                    // start afterpay payment is here
                    var afterpay = window.checkoutConfig.payment.afterpay;

                    // Making sure it using current flow
                    if (afterpay.paymentAction == 'order') {
                        this.placeOrder();
                    }
                }
            },

            /**
             * Start popup or redirect payment
             *
             * @param response
             */
            afterPlaceOrder: function() {
                
                $.ajax({
                    url: "/afterpay/payment/process",
                    method:'post',
                    success: function(response) {

                        var data = $.parseJSON(response);

                        AfterPay.init({
                            relativeCallbackURL: window.checkoutConfig.payment.afterpay.afterpayReturnUrl
                        });

                        switch (window.Afterpay.checkoutMode) {
                            case 'lightbox':
                                AfterPay.display({
                                    token: data['token']
                                });
                                break;

                            case 'redirect':
                                AfterPay.redirect({
                                    token: data['token']
                                });
                                break;
                        }
                    }
                });
            }
        });
    }
);
