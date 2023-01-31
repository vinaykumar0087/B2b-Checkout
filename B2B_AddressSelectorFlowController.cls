public with sharing class B2B_AddressSelectorFlowController {
    @TestVisible
    private static B2B_WebCartSelector webCartSelector = new B2B_WebCartSelector();

     @TestVisible
    private static B2B_AddressSelector addressSelector = new B2B_AddressSelector();

    
   
    @AuraEnabled
    public static B2B_WebCartAddressDto getCartInfo(Id cartId) {
         WebCart cartDetails = webCartSelector.getCartById(cartId);
         B2B_WebCartAddressDto cartDto = genUserAddress(cartDetails);
         return cartDto;
    }

    
    @AuraEnabled
    public static String findObjectNameFromRecordIdPrefix(String recordIdOrPrefix){
        String objectName = B2B_Util.getObjectName(recordIdOrPrefix);
        return objectName;
    }

     @AuraEnabled
    public static B2B_WebCartAddressDto getOrderInfo(String recordId) {
        B2B_WebCartAddressDto cartDto = new B2B_WebCartAddressDto();
        try{
         OrderSummary orderSummaryDetails = webCartSelector.getOrdeSummaryrDetails(recordId);
           // Order orderDetails = webCartSelector.getOrderDetails(orderSummaryDetails.OriginalOrderId);
            WebCart cartDetails = webCartSelector.getCartDetailsBasedOnOrderId(orderSummaryDetails.OriginalOrderId);
            if(cartDetails != null){
            cartDto = genUserAddress(cartDetails);
            }
            return cartDto;
        }
        catch(Exception e){
            return null;
        }
        
    }

    @AuraEnabled
    public static List<ContactPointAddress> getShippingAddressesContactId(List<Id> contactIds) {
       /*  try{
     List<B2B_Contact_Address__c> shippingaddresses = B2B_AddressSelector.getShippingAddressesByContacts(contactIds);
     return shippingaddresses;
        }
         catch(Exception e){
            return null; 
        }*/

    List<ContactPointAddress> shippingAddresses= [SELECT Id, Name, ParentId, BestTimeToContactEndTime, BestTimeToContactStartTime, BestTimeToContactTimezone, IsPrimary, AddressType, ContactPointPhoneId, Street, City, State, PostalCode, Country, Latitude, Longitude, GeocodeAccuracy, Address, IsDefault FROM ContactPointAddress WHERE AddressType='Shipping'  ORDER BY CREATEDDATE DESC LIMIT 200];
        return shippingAddresses;
    }

@AuraEnabled
    public static List<ContactPointAddress> getBillingAddressesContactId(List<Id> contactIds) {
    //     try{
    // List<B2B_Contact_Address__c> shippingaddresses = B2B_AddressSelector.getBillingAddressesByContacts(contactIds);
    // return shippingaddresses;
    //     }
    //     catch(Exception e){
    //         return null; 
    //     }
        List<ContactPointAddress> billingAddess= [SELECT Id, Name, ParentId, BestTimeToContactEndTime, BestTimeToContactStartTime, BestTimeToContactTimezone, IsPrimary, AddressType, ContactPointPhoneId, Street, City, State, PostalCode, Country, Latitude, Longitude, GeocodeAccuracy, Address, IsDefault FROM ContactPointAddress WHERE AddressType='Billing' ORDER BY CREATEDDATE DESC LIMIT 200];
        return billingAddess;
        
    }

   
   
     @AuraEnabled
    public static B2B_WebCartAddressDto updateCartShipToDetails(Id contactId,Id shipTo,Id cartId) {
        try{
         WebCart cartDetails = webCartSelector.getCartById(cartId);
         cartDetails.ShipToAddress__c = shipTo;
         cartDetails.ShipToContact__c = contactId;
         update cartDetails;
         ContactPointAddress contAddr = addressSelector.getContactPointAddressBasedonId(shipTo);
         contAddr.IsDefault = true;
         update contAddr;
          B2B_WebCartAddressDto cartDto = genUserAddress(cartDetails);
         return cartDto;
        }catch(Exception e){
            return null; 
        }
    } 
    @AuraEnabled
    public static B2B_WebCartAddressDto updateCartBillToDetails(Id contactId,Id billTo,Id cartId) {
        try{
         WebCart cartDetails = webCartSelector.getCartById(cartId);
         cartDetails.BillToAddress__c = billTo;
         cartDetails.BillToContact__c = contactId;
         update cartDetails;
         ContactPointAddress contAddr = addressSelector.getContactPointAddressBasedonId(billTo);
         contAddr.IsDefault = true;
         update contAddr;
          B2B_WebCartAddressDto cartDto = genUserAddress(cartDetails);
         return cartDto;
        }catch(Exception e){
            return null;
        }
    }
    

     private static B2B_WebCartAddressDto genUserAddress(WebCart cart) {
        B2B_WebCartAddressDto webCartAddress = new B2B_WebCartAddressDto();
        if (String.isNotBlank(cart.ShipToContact__c)) {
            webCartAddress.contactId = cart.ShipToContact__c;
            webCartAddress.contactName = cart.ShipToContact__r.Name;
            webCartAddress.shipToContactName = cart.ShipToContact__r.Name;
             webCartAddress.shipToAccountName = cart.ShipToContact__r.Account.Name;
        }
        if (String.isNotBlank(cart.BillToContact__c)) {
            webCartAddress.billToContactName = cart.BillToContact__r.Phone;
            webCartAddress.billToAccountName = cart.BillToContact__r.Account.Name;
            webCartAddress.billToContactId = cart.BillToContact__c;
        }
        
        
        webCartAddress.shipToAddressId = cart.ShipToAddress__c;
        webCartAddress.shipToAddress = cart.ShipToAddress__r.City;
       
        webCartAddress.billToAddressId = cart.BillToAddress__c;
        webCartAddress.billToAddress = cart.BillToAddress__r.City;
       
        return webCartAddress;
    }
    @AuraEnabled
    public static Map<String,Object> shippingAddressCreate(String name, String street, String city, String state, String country, String psCode, string accId){
        Map<String,Object> billaddr = new Map<String,Object>();
        account accList = [Select Id, Name,Phone From Account Where Id = :accId];
        System.debug('accList--.'+accList);
        List<User> userList = [Select Id, accountId From User Where accountId =:accId];
        ContactPointAddress cpa= new ContactPointAddress();
        cpa.Name=name;
        cpa.City=city;
        cpa.State=state;
        cpa.Street=street;
        cpa.Country=country;
        cpa.PostalCode=psCode;
        cpa.ParentId=accList.Id;
        cpa.AddressType='Shipping';
        cpa.IsDefault=true;
        cpa.IsPrimary=true;
        insert cpa;
        account a = new account();
        a.id=accList.id;
        a.BillingCity=city;
        a.BillingState=state;
        a.BillingStreet=street;
        a.BillingCountry=country;
        a.BillingPostalCode=psCode;
        a.ShippingCity=city;
        a.ShippingState=state;
        a.ShippingStreet=street;
        a.ShippingCountry=country;
        a.ShippingPostalCode=psCode;
        update a;
        billaddr.put('Sucesss',cpa);
        /*if(accList != null){
cpa.ParentId=accList.Id;
update cpa;
}*/
        //  }
        // else{
        //    billaddr.put('Failed',true);
        //}
        return billaddr;
        
        
    }
    
}