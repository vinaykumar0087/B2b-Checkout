import { LightningElement ,api,track,wire} from 'lwc';
import getBuyerInfo from '@salesforce/apex/b2borderreviewcontroller.getBuyerInfo';
import getCartItemsById from '@salesforce/apex/b2borderreviewcontroller.getCartItemsById';
import getContactPointAddress from '@salesforce/apex/b2borderreviewcontroller.getContactPointAddress';
import getOrderProductSummaryById from '@salesforce/apex/b2borderreviewcontroller.getOrderProductSummaryById';
import communityId from '@salesforce/community/Id';

export default class B2borderreview extends LightningElement {
    currentCartId;
    _contactPointAddressId
    buyerInfo;
    shipInfo;
    billInfo;
    cartInfo;
    orderInfo;
    @api

    get orderId() {

        return this.currentOrderId;

    }
    set orderId(value) {

        this.currentOrderId = value;

    }

    @api
    get cartId() {
        return this.currentCartId;
    }
    set cartId(value) {
        this.currentCartId = value;
    }
    @api
    get contactPointAddressId() {
        return this._contactPointAddressId;
    }

    set contactPointAddressId(value) {
        this._contactPointAddressId = value;
    }

    // get renderTable(){
    //     return this.cartInfo != undefined ? true : true
    // }

    handleBuyerInfo(){
        let params = {};
        getBuyerInfo({dataMap : params})
        .then((result)=>{
            console.log('Get Buyer Info');
            console.log(result);
            if(result.isSuccess){
                this.buyerInfo = result.contactRecord;
            }
            console.log(this.buyerInfo);
            
        })
        .catch((error=>{
            console.log(error);
        }))
    }

    getCartItems(){
        if(this.currentCartId != undefined){
            let params = {
                'cartId' : this.currentCartId
            };
            getCartItemsById({dataMap : params})
            .then((result)=>{
                console.log('Get cart Items');
                console.log(result);
                if(result.isSuccess){
                    this.cartInfo = result.cartItems
                }
                console.log(this.cartInfo);
    
            })
            .catch((error=>{
                console.log(error);
            }))
        }
    }
    getOrderProductSummaryById(){
        if(this.currentOrderId != undefined){
            let params = {
                'orderId' : this.currentOrderId
            };
            getOrderProductSummaryById({dataMap : params})
            .then((result)=>{
                console.log('Get ordered Items');
                console.log(result);
                if(result.isSuccess){
                    console.log(result.orderRecord);
                    this.orderInfo = result.orderRecord
                }
                console.log(this.orderInfo);
    
            })
            .catch((error=>{
                console.log(error);
            }))

        }
    }
    handleGetContactPointAddress(){
        let params = {};
        getContactPointAddress({dataMap : params})
        .then((result)=>{
            console.log(result);
            for (let key in result) {
                if(result[key].AddressType == 'Shipping' && result[key].IsDefault == true){
                    this.shipInfo = result[key];
                }
                else if(result[key].AddressType == 'Billing' && result[key].IsDefault == true){
                    this.billInfo = result[key];
                }
            } 
            console.log('shipping ops',JSON.stringify(this.shipInfo));
            console.log('Billing ops',JSON.stringify(this.billInfo));
        })
        .catch((error=>{
            console.log(error);
        }))
    }

    connectedCallback(){
        console.log('cartId>>>>>>>>>' + this.currentCartId);
        console.log('contactId' + this._contactPointAddressId);
        console.log('order summary Id' + this.currentOrderId);
        console.log('communityId....' + communityId);
        console.log('cartInfo>>>>>' + this.cartInfo);
        this.handleBuyerInfo();
        this.handleGetContactPointAddress();
        this.getCartItems();
        this.getOrderProductSummaryById();
    }
}