/* eslint-disable no-alert */
import { LightningElement, api, track } from 'lwc';

import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import B2B_Billing_AddressLabel from '@salesforce/label/c.B2B_Billing_Address';
import selectBillingAddLabel from '@salesforce/label/c.B2B_Select_Billing_Address';
import noBillingAddLabel from '@salesforce/label/c.B2B_No_Billing_Addr_Txt';
import billingAddLabel from '@salesforce/label/c.B2B_Billing_Address';
import editAddrLabel from '@salesforce/label/c.B2B_Edit_Address';
import getCartInfo from '@salesforce/apex/B2B_AddressSelectorFlowController.getCartInfo';
import updateCartBillToDetails from '@salesforce/apex/B2B_AddressSelectorFlowController.updateCartBillToDetails';
import getObjectName from '@salesforce/apex/B2B_AddressSelectorFlowController.findObjectNameFromRecordIdPrefix';
import getBillingAddressesByContactIds from '@salesforce/apex/B2B_AddressSelector.getBillingAddressesByContactIds';
import getBillingAddressesContactId from '@salesforce/apex/B2B_AddressSelectorFlowController.getBillingAddressesContactId';

// eslint-disable-next-line @lwc/lwc/no-leading-uppercase-api-name
export default class B2B_BillToAddressOnCheckout extends LightningElement {
    @api availableActions = [];
    @track addressLst = [];
    @track billingAddrLst = [];
    @track currentCartId = '';
    @track defaultAddr;
    label = {
        B2B_Billing_AddressLabel,
        noBillingAddLabel,
        selectBillingAddLabel,
        billingAddLabel,
        editAddrLabel
    };
    @track isBilling = true;
    @track isShipping = false;
    @track selectedBillingAddr;
    @track selectedContactId;
    @track selectedBillingAddrTxt='';
    @track selectedContactName='';
    @track contLst = [];
    showmodal = false;
    showEditAddress = false;
    
    label = {
        B2B_Billing_AddressLabel,
        selectBillingAddLabel
    };
    @track billingArrMap = new Map();
    @track contactMap = new Map();
    isBillingAddExist = true;
    billingOption = [];
    contactOption = [];
    isAddrBasedOnContact = false;
    billingOptionsBasedOnAccount=[];
    accId = '';
    isBillingOptionsExist = false;
    isAddrAvailableForEdit = true;
    billingAddrVerified = true;
    shippingAddrVerified = false;
    isAddEdit = false;
    addRecord;
    action;

    @api BillingContactPointAddressId = '';



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
        console.log('billing address');
        let addLst = this.addressLst;
        let addMap = new Map();
        let contMap = new Map();
        if (!this.isAddrBasedOnContact) {
        for (let i = 0; i < addLst.length; i++) {
            if ( (addLst[i].AddressType === 'Billing')) {
                this.billingAddrLst.push(addLst[i]);
                addMap[addLst[i].Id] = addLst[i];
                this.billingOption.push({ label: addLst[i].Name, value: addLst[i].Id });
            }
        }
        this.billingArrMap = addMap;
        if(this.billingOption.length > 0){
            this.isBillingOptionsExist = true;
        }
        if (this.billingAddrLst.length > 0) {
            this.isBillingAddExist = true;
        } else {
            this.isBillingAddExist = false;
        }

    }
    //else if(this.isAddrBasedOnContact) {
        this.billingOption = [];
        this.billingOptionsBasedOnAccount = [];
        //let accountId = this.accId;
        let contacts = this.contLst;
        let contactIds = [];
        for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].Name) {
                contactIds.push(contacts[i].Id);
            }
        }
        getBillingAddressesContactId({ contactIds: contactIds })
            .then(result => { 
                let addrsLst = result;

                if (addrsLst.length > 0) { 
                    for (let i = 0; i < addrsLst.length; i++) {
                        if (addrsLst[i].AddressType === 'Billing') {
                            this.billingAddrLst.push(addrsLst[i]);
                            addMap[addrsLst[i].Id] = addrsLst[i];
                            this.billingOption.push({ label: addrsLst[i].Name, value: addrsLst[i].Id });
                            this.billingOptionsBasedOnAccount.push(addrsLst[i]);
                        }
                    }
                }
                this.billingArrMap = addMap;
                console.log('billing option---'+this.billingOption);
            if(this.billingOption.length > 0){
                this.isBillingOptionsExist = true;
            }
            if (this.billingAddrLst.length > 0) {
                this.isBillingAddExist = true;
            } else {
                this.isBillingAddExist = false;
            }
                
            })
            .catch(error => {
                console.log(error);
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
                this.selectedBillingAddr = result.billToAddressId;
                this.selectedContactId = result.billToContactId;
                if(result.billToAddress)
                    this.selectedBillingAddrTxt = result.billToAddress;
                if(result.billToContactName)
                    this.selectedContactName = result.billToContactName;
                // if (this.isAddrBasedOnContact) {
                //     this.getBillingAddresses(this.selectedContactId);
                // }
            })
            .catch(error => {
                console.log(error);
            });
    }

    openModal() {
        this.showmodal = true;
    }
    closeModal() {
        this.showmodal = false;
    }
    handleContactChange(event) {
        if (event && event.currentTarget && event.currentTarget.value) {
            this.selectedContactId = event.currentTarget.value;
        }
    }

    handleChange(event) {
        if (event && event.currentTarget && event.currentTarget.value) {
            this.selectedBillingAddr = event.currentTarget.value;
        }

    }
    saveCart() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            let billTo = this.selectedBillingAddr;
            let contactId = this.selectedContactId;
            this.updateBillDetails(contactId,billTo,this.currentCartId);
        }, 2000);
    }
    updateBillDetails(contactId,billTo,cartId){
        console.log('billTo'+billTo);
        console.log('contactId'+contactId);
        console.log('selectedBillingAddrTxt'+this.selectedBillingAddrTxt);
        let contact = this.getContactRequest(contactId);
        let record = this.getAddressRecordRequest(billTo);
        console.log('*** record'+JSON.stringify(record));
        updateCartBillToDetails({ contactId: contactId, billTo: billTo, cartId: cartId })
        .then(result => {
            if(record != null )
            this.selectedBillingAddrTxt = record.Name;
            result.billToAddress = this.selectedBillingAddrTxt;
            result.billToContactName = contact.Name;
            this.defaultAddr = result;
           // this.selectedBillingAddrTxt = result.billToAddress;
            this.selectedContactName = result.billToContactName;
            this.showmodal = false;
            const attributeChangeEvent = new FlowAttributeChangeEvent('BillingContactPointAddressId', result.billToAddressId);
            this.dispatchEvent(attributeChangeEvent);
        })
        .catch(error => {
            console.log('** error while update' + error);
        });
    }
    hangleChangeAddress() {
        this.showmodal = true;
        console.log('log31');
    }
   


    getContactRequest(key) {
        var id = null;
        var records = this.contactMap;
        if (records) {
            id = records[key];
        }
        return id;
    }
    getAddressRecordRequest(key) {
        var id = null;
        var records = this.billingArrMap;
        if (records) {
            id = records[key];
        }
        return id;
    }
    getSelectedValue(event) {
        let selectedId = event.detail.selectedId;
        this.getObjectNameFromId(selectedId);
    }

    getObjectNameFromId(selectedId) {
        getObjectName({ recordIdOrPrefix: selectedId })
            .then(result => {
                if (result === 'ContactPointAddress') {
                    this.selectedBillingAddr = selectedId;
                }
                // else if(result ==='B2B_Contact_Address__c'){
                //     let addrsLst = this.billingOptionsBasedOnAccount;
                //     for(let i=0;i<addrsLst.length;i++){
                //        if(addrsLst[i].Id === selectedId){
                //         this.selectedBillingAddr = addrsLst[i].Contact_Point_Address__c;
                //        }
                //     }
                // }
                // else if (result === 'Contact') {
                //     this.selectedBillingAddrTxt = '';
                //     this.selectedContactId = selectedId;
                //     if(this.isAddrBasedOnContact){
                //     this.billingOption=[];
                //     this.getBillingAddresses(selectedId);
                //     }

                // }

            })
            .catch(error => {
                console.log('** error' + JSON.stringify(error));
            });
    }
    getBillingAddresses(selectedId){
        getBillingAddressesByContactIds({ contactId: selectedId })
        .then(result => {
            this.billingOption=[];
            let addrsLst = result;
            if(addrsLst.length>0){
                for(let i=0;i<addrsLst.length;i++){
                    this.billingOption.push({ label: addrsLst[i].Name, value: addrsLst[i].Id });
                    this.billingOptionsBasedOnAccount.push(addrsLst[i]);
                }
                this.isAddrAvailableForEdit = true;
            }else{
                this.isAddrAvailableForEdit = false;
            }
        })
        .catch(error => {
            console.log(error);
        });

    }
    handleEditAddress(){
        let billTo = this.selectedBillingAddr;
        if(billTo != null || billTo !== '' || typeof billTo !== 'undefined'){
        this.action = 'update';
        this.showEditAddress = true;
        let record = this.getAddressRecordRequest(billTo);
        let addRecord={};
        if(!this.isAddrBasedOnContact){
            addRecord.recordId = record.Id;
            addRecord.street = record.Street;
            addRecord.city = record.City;
            addRecord.state = record.State;
            addRecord.country = record.Country;
            addRecord.postalCode = record.PostalCode;
            addRecord.addressType = record.AddressType;
            this.addRecord = addRecord;

        }else{
            addRecord.recordId = record.Id;
            addRecord.street = record.Street__c;
            addRecord.city = record.City__c;
            addRecord.state = record.State__c;
            addRecord.country = record.Country__c;
            addRecord.postalCode = record.Postal_Code__c;
            addRecord.addressType = record.Address_Type__c;
            this.addRecord = addRecord;
        }
    }else{
        alert('Please select shipping address');
    }
       

    }
    closedModal(){
        this.showEditAddress = false;
    }
    updateAddrRecord(event){
        var record = event.detail.updatedRecord;
        this.selectedBillingAddrTxt = record.street+','+record.city+','+record.state+','+record.country+','+record.postalCode;
       
    }



}