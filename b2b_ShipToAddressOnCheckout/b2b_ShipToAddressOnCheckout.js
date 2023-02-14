/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import getCartInfo from '@salesforce/apex/B2B_AddressSelectorFlowController.getCartInfo';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateCartShipToDetails from '@salesforce/apex/B2B_AddressSelectorFlowController.updateCartShipToDetails';
import B2B_Shipping_AddressLabel from '@salesforce/label/c.B2B_Shipping_Address';
import editAddrLabel from '@salesforce/label/c.B2B_Edit_Address';
import shippingAddressCreate from '@salesforce/apex/B2B_AddressSelectorFlowController.shippingAddressCreate';
import noShippingLabel from '@salesforce/label/c.B2B_No_Shipping_Txt';
import selectShippingLabel from '@salesforce/label/c.B2B_Shipping_Address_Select_Txt';
//import getObjectName from '@salesforce/apex/B2B_RelatedProductsController.findObjectNameFromRecordIdPrefix';
import getShippingAddressesByContactIds from '@salesforce/apex/B2B_AddressSelector.getShippingAddressesByContactIds';
import getShippingAddressesContactId from '@salesforce/apex/B2B_AddressSelectorFlowController.getShippingAddressesContactId';





export default class B2b_ShipToAddressOnCheckout extends LightningElement {
    @api availableActions = [];
    @track addressLst = [];
    @track shippingAddrLst = [];
    @track currentCartId = '';
    @track defaultAddr;
    @track selectedShippingAddr = '';
    @track selectedContactId;
    @track selectedShippingAddrTxt = '';
    @track selectedContactName = '';
    @track contLst = [];

    @api contactPointAddressId = '';
    showmodal = false;
    showmodal1  = false;
    showEditAddress = false;
    action='';
    addRecord;
    label = {
        B2B_Shipping_AddressLabel,
        editAddrLabel,
        noShippingLabel,
        selectShippingLabel
    };
    @track isBilling = false;
    @track isShipping = true;
    @track shippingArrMap = new Map();
    @track contactMap = new Map();
    isShippingAddExist = true;
    shippingOption = [];
    contactOption = [];
    isAddrBasedOnContact = false;
    shippingOptionsBasedOnAccount = [];
    accId = '';
    isShippingOptionsExist = false;
    billingAddrVerified = false;
    shippingAddrVerified = true;
    isAddrAvailableForEdit = true;
    isAddEdit = false;
    @track addressEdited = false;

    bName;

    bStreet;

    bCity;

    bState;

    bCountry;

    bPostalCode;

    @api
    get contactPointAddLst() {
        return this.addressLst;
    }

    set contactPointAddLst(contactPointAddLst = []) {
        this.addressLst = contactPointAddLst;
    }
    @api
    get contactLst() {
        return this.contLst;
    }

    set contactLst(contactLst = []) {
        this.contLst = contactLst;
    }
    @api
    get cartId() {
        return this.currentCartId;
    }

    set cartId(value) {
        this.currentCartId = value;
    }
    @api
    get isAddressBasedOnContact() {
        return this.isAddrBasedOnContact;
    }

    set isAddressBasedOnContact(value) {
        this.isAddrBasedOnContact = value;
    }
    @api
    get userAccountId() {
        return this.accId;
    }

    set userAccountId(value) {
        this.accId = value;
    }




    connectedCallback() {

        let addLst = this.addressLst;
        let addMap = new Map();
        let contMap = new Map();
        if (!this.isAddrBasedOnContact) {
            this.shippingOption = [];
            this.shippingOptionsBasedOnAccount = [];
            for (let i = 0; i < addLst.length; i++) {
                if (addLst[i].IsActive__c && (addLst[i].AddressType === 'Shipping')) {
                    this.shippingAddrLst.push(addLst[i]);
                    addMap[addLst[i].Id] = addLst[i];
                    this.shippingOption.push({ label: addLst[i].Address__c, value: addLst[i].Id }); 
                }
            }
            this.shippingArrMap = addMap;
            if(this.shippingOption.length > 0){
                this.isShippingOptionsExist = true;
            }
            if (this.shippingAddrLst.length > 0) {
                this.isShippingAddExist = true;
            } else {
                this.isShippingAddExist = false;
            }
        } 
        //else if(this.isAddrBasedOnContact) {
            this.shippingOption = [];
            this.shippingOptionsBasedOnAccount = [];
            //let accountId = this.accId;
            let contacts = this.contLst;
            let contactIds = [];
            for (let i = 0; i < contacts.length; i++) {
                if (contacts[i].Name) {
                    contactIds.push(contacts[i].Id);
                }
            }
            getShippingAddressesContactId({ contactIds: contactIds })
                .then(result => {
                    let addrsLst = result;

                    if (addrsLst.length > 0) {
                        for (let i = 0; i < addrsLst.length; i++) {
                            if (addrsLst[i].AddressType === 'Shipping') {
                                this.shippingAddrLst.push(addrsLst[i]);
                                addMap[addrsLst[i].Id] = addrsLst[i];
                                this.shippingOption.push({ label: addrsLst[i].Name, value: addrsLst[i].Id });
                                this.shippingOptionsBasedOnAccount.push(addrsLst[i]);
                            }
                        }
                    }
                    this.shippingArrMap = addMap;
                    console.log('Shipping Option'+this.shippingOption);
                if(this.shippingOption.length > 0){
                    this.isShippingOptionsExist = true;
                }
                if (this.shippingAddrLst.length > 0) {
                    this.isShippingAddExist = true;
                } else {
                    this.isShippingAddExist = false;
                }
                    
                })
                .catch(error => {
                    console.log('** error' + JSON.stringify(error));
                });
                

        //}
       
        //let contacts = this.contLst;
        for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].Name) {
                contMap[contacts[i].Id] = contacts[i];
                this.contactOption.push({ label: contacts[i].Name, value: contacts[i].Id });
            }
        }
        this.contactMap = contMap

        this.gerCart(this.currentCartId);
    }

    gerCart(cartId) {
        getCartInfo({ cartId: cartId })
            .then(result => {
                this.defaultAddr = result;
                this.selectedShippingAddr = result.shipToAddressId;
                this.isAddEdit = true;
                this.selectedContactId = result.contactId;
                if (result.shipToAddress)
                    this.selectedShippingAddrTxt = result.shipToAddress;
                if (result.contactName)
                    this.selectedContactName = result.contactName;
                if (this.isAddrBasedOnContact) {
               // this.getShippingAddresses(this.selectedContactId);
                }
            })
            .catch(error => {
                console.log('** error' + JSON.stringify(error));
            });
    }

    openModal() {
        this.showmodal = true;
    }
    closeModal() {
        this.showmodal = false;
    }
    closeModal1() {
        this.showmodal1 = false;
    }

    handleContactChange(event) {
        if (event && event.currentTarget && event.currentTarget.value) {
            this.selectedContactId = event.currentTarget.value;
            
        }
    }

    handleChange(event) {
        if (event && event.currentTarget && event.currentTarget.value) {
            this.selectedShippingAddr = event.currentTarget.value;
            this.isAddEdit = true;
        }

    }
    saveCart() {

        setTimeout(() => {
            let shipTo = this.selectedShippingAddr;
            let contactId = this.selectedContactId;
            this.updateShipDetails(contactId, shipTo, this.currentCartId);
        }, 2000);
    }
    
    submitDetails() {
           console.log('init-->');
            console.log('cartid-->' + this.cartId);
            console.log('effectiveaccountid-->' + this.accId);
            const isInputsCorrectInput = [...this.template.querySelectorAll('lightning-input')]
                .reduce((validSoFar, inputField) => {
                    inputField.reportValidity();
                    return validSoFar && inputField.checkValidity();
                }, true);
            console.log('isInputsCorrectInput---->' + isInputsCorrectInput);
            if (isInputsCorrectInput) {
                console.log('if called');
                this.bName = this.template.querySelector("[data-field='Name']").value;
                this.bStreet = this.template.querySelector("[data-field='Street']").value;
                this.bCity = this.template.querySelector("[data-field='City']").value;
                this.bState = this.selectedState;
                this.bCountry = this.selectedCountry;
                this.bPostalCode = this.template.querySelector("[data-field='PostalCode']").value;
                console.log(this.bName, this.bStreet, this.bCity, this.bState, this.bCountry, this.bPostalCode, this.accId, this.selectedBillingAddr);
                if (this.accId != null && this.selectedBillingAddr == null) {
                    this.showSpinner = true;
                    this.shippingAddressSave(this.bName, this.bStreet, this.bCity, this.bState, this.bCountry, this.bPostalCode, this.accId, this.selectedBillingAddr);
                    this.showSpinner = false;
                }
    //             if (this.selectedBillingAddr != null) {
    //                 this.showSpinner = true;
    //                 this.billingAddressUpdate(this.bName, this.bStreet, this.bCity, this.bState, this.bCountry, this.bPostalCode, this.accId, this.selectedBillingAddr);
    //                 this.showSpinner = false;
    //            }
            }
        }
        shippingAddressSave(bName, bStreet, bCity, bState, bCountry, bPostalCode, accId) {
            shippingAddressCreate({
                name: bName, street: bStreet, city: bCity, state: bState, country: bCountry, psCode: bPostalCode,
                accId: accId
            })
                .then((result) => {
                    console.log('Sucess called');
                    console.log('cartid-->' + this.cartId);
                    console.log(result);
                    this.gerCart(this.cartId);
                    const evt = new ShowToastEvent({
                        title: 'Success!',
                        message: 'Record Created successfully ' + result.bName,
                        variant: 'success'
                    });
                    this.showmodal11 = true;
                    this.dispatchEvent(evt);
                    eval("$A.get('e.force:refreshView').fire();");
                })
                .catch(e => {
                    console.log('Error-->' + JSON.stringify(e));
                    const evt = new ShowToastEvent({
                        title: 'Error',
                        message: e,
                        variant: "error",
                        mode: "dismissable"
                    });
                    this.dispatchEvent(evt);
               });
        }
    
    

    updateShipDetails(contactId, shipTo, cartId) {
        let contact = this.getContactRequest(contactId);
        var record = this.getAddressRecordRequest(shipTo);
        updateCartShipToDetails({ contactId: contactId, shipTo: shipTo, cartId: cartId })
            .then(result => {
               // result.shipToAddress = record.Address__c;
               console.log('addressEdited'+this.addressEdited);
               if(this.addressEdited === false){
               this.selectedShippingAddrTxt = record.Address.city;
               this.selectedBillingAddrTxt1 = record.Address.state;
               this.selectedBillingAddrTxt2 = record.Address.country;
               this.selectedBillingAddrTxt3 = record.Address.postalCode;
               
               }
               result.shipToAddress = this.selectedBillingAddrTxt+'\n' + this.selectedBillingAddrTxt1+'\n' + this.selectedBillingAddrTxt2+'\n' + this.selectedBillingAddrTxt3;
                result.shipToContactName = contact.Name;
                this.defaultAddr = result;
               // this.selectedShippingAddrTxt = result.shipToAddress;
                this.selectedContactName = result.shipToContactName;
                this.showmodal = false;
                const attributeChangeEvent = new FlowAttributeChangeEvent('contactPointAddressId', result.shipToAddressId);
                this.dispatchEvent(attributeChangeEvent);
            })
            .catch(error => {
                console.log('** error while update' + error);
            });
    }


    hangleChangeAddress() {
        this.showmodal = true;
    }
    hangleChangeNewAddress(){
        console.log('log11');
        this.showmodal1 = true;
        console.log('log1');
    }

    getAddressRecordRequest(key) {
        var id = null;
        var records = this.shippingArrMap;
        if (records) {
            id = records[key];
        }
        return id;
    }
    getContactRequest(key) {
        var id = null;
        var records = this.contactMap;
        if (records) {
            id = records[key];
        }
        return id;
    }
    getSelectedValue(event) {
        let selectedId = event.detail.selectedId;
        this.addressEdited = false;
        this.selectedShippingAddr = selectedId;
        console.log('addressEdited'+this.addressEdited);
        this.getObjectNameFromId(selectedId);
    }

    getObjectNameFromId(selectedId) {
        // getObjectName({ recordIdOrPrefix: selectedId })
        //     .then(result => {
        //         if (result == 'ContactPointAddress') {
        //             this.selectedShippingAddr = selectedId;
        //             this.isAddEdit = true;
        //         }
        //         else if (result == 'B2B_Contact_Address__c') {
        //             let addrsLst = this.shippingOptionsBasedOnAccount;
        //             for (let i = 0; i < addrsLst.length; i++) {
        //                 if (addrsLst[i].Id == selectedId) {
        //                     this.selectedShippingAddr = addrsLst[i].Contact_Point_Address__c;
        //                     this.isAddEdit = true;
        //                 }
        //             }
        //         }
        //         else if (result == 'Contact') {
        //             this.selectedShippingAddrTxt = '';
        //             this.selectedContactId = selectedId;
        //             if (this.isAddrBasedOnContact) {
        //                 this.shippingOption = [];
        //                 this.getShippingAddresses(selectedId);
        //             }
        //         }

        //     })
        //     .catch(error => {
        //         console.log('** error' + JSON.stringify(error));
        //     });
    }
    getShippingAddresses(selectedId) {
        getShippingAddressesByContactIds({ contactId: selectedId })
            .then(result => {
                this.shippingOption = [];
                this.shippingOptionsBasedOnAccount = [];
                let addrsLst = result;
                if (addrsLst.length > 0) {
                    for (let i = 0; i < addrsLst.length; i++) {
                        this.shippingOption.push({ label: addrsLst[i].Name, value: addrsLst[i].Id });
                        this.shippingOptionsBasedOnAccount.push(addrsLst[i]);
                    }
                    this.isAddrAvailableForEdit = true;
                }else{
                    this.isAddrAvailableForEdit = false;
                }
            })
            .catch(error => {
                console.log('** error' + JSON.stringify(error));
            });

    }
    handleEditAddress(){
        let shipTo = this.selectedShippingAddr;
        if(shipTo != null || shipTo !== '' || typeof shipTo !== 'undefined'){
        this.action = 'update';
        this.showEditAddress = true;
        let record = this.getAddressRecordRequest(shipTo);
        let addRecord={};
        
            addRecord.recordId = record.Id;
            addRecord.street = record.Street;
            addRecord.city = record.City;
            addRecord.state = record.State;
            addRecord.country = record.Country;
            addRecord.postalCode = record.PostalCode;
            addRecord.addressType = record.AddressType;
            this.addRecord = addRecord;

    }else{
        alert(this.label.selectShippingLabel);
    }
       

    }
    closedModal(){
        this.showEditAddress = false;
    }
    updateAddrRecord(event){
        var record = event.detail.updatedRecord;
        this.selectedShippingAddrTxt = record.street+','+record.city+','+record.state+','+record.country+','+record.postalCode;
       this.addressEdited = true;
    }




}