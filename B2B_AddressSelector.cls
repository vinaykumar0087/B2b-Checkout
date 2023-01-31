public inherited sharing class B2B_AddressSelector {
    
    @TestVisible
    private static B2B_UserSelector userSelector = new B2B_UserSelector();
    
    public Object getContactAddressesByContactId(Id contactId) {
        // if (contactId == null) return new Map<Id, B2B_Contact_Address__c>();
        
        // Map<Id, B2B_Contact_Address__c> contactAddressesByContactIds = this.getContactAddressesByContactIds(new Set<Id>{
        //     contactId
        //         });
        // return !contactAddressesByContactIds.isEmpty()
        //     ? contactAddressesByContactIds : new Map<Id, B2B_Contact_Address__c>();
       return null;
    }
    
    public Object getContactAddressesByContactIds(Set<Id> contactIds) {
        // if (contactIds == null || contactIds.isEmpty()) return null;
        
        // Map<Id, B2B_Contact_Address__c> shippingContactAddressesByContactIds = new Map<Id, B2B_Contact_Address__c>([
        //     SELECT
        //     Id,
        //     Default_Bill_To__c,
        //     Default_Ship_To__c,
        //     Address__c,
        //     Contact_Point_Address__c,Contact_Point_Address__r.Address_Status__c,
        //     Contact__c,
        //     Address_Type__c,
        //     Favorite__c,
        //     Street__c,City__c,State__c,Country__c,Postal_Code__c
        //     FROM B2B_Contact_Address__c
        //     WHERE Contact__c IN :contactIds
        //     AND IsActive__c = true
        //     WITH SECURITY_ENFORCED ORDER BY Favorite__c DESC
        // ]);
        
        
        return null;
    }
    
    public Object getShippingContactAddressesByContactIds(Set<Id> contactIds) {
        // Map<Id, List<B2B_Contact_Address__c>> shippingContactAddressesByContactIds = new Map<Id, List<B2B_Contact_Address__c>>();
        // if (contactIds == null || contactIds.isEmpty()) return shippingContactAddressesByContactIds;
        
        // Map<Id, Contact> contactsByIds = userSelector.getContactsByIds(contactIds);
        
        // for (B2B_Contact_Address__c contactAddress : [
        //     SELECT
        //     Id,
        //     Default_Bill_To__c,
        //     Default_Ship_To__c,
        //     Address__c,
        //     Contact_Point_Address__c,
        //     Contact__c,
        //     Address_Type__c,Street__c,City__c,State__c,Country__c,Postal_Code__c
        //     FROM B2B_Contact_Address__c
        //     WHERE Contact__c IN :contactIds
        //     AND (Address_Type__c IN :B2B_SetupConstants.SHIP_CONTACT_ADDRESS_TYPES OR Address_Type__c IN :B2B_SetupConstants.BILL_CONTACT_ADDRESS_TYPES)
        //     AND IsActive__c = true
        //     ORDER BY CreatedDate DESC
        // ]) {
        //     List<B2B_Contact_Address__c> contactAddresses = shippingContactAddressesByContactIds.containsKey(contactAddress.Contact__c)
        //         ? shippingContactAddressesByContactIds.get(contactAddress.Contact__c) : new List<B2B_Contact_Address__c>();
        //     contactAddresses.add(contactAddress);
        //     shippingContactAddressesByContactIds.put(contactAddress.Contact__c, contactAddresses);
            
        // }
        
        return null;
    }
    
    @AuraEnabled
    public static Object getShippingAddressesByContactIds(Id contactId) {
        // List<B2B_Contact_Address__c> shippingLst = new List<B2B_Contact_Address__c>();
        // if (contactId == null ) return shippingLst;
        // else{
        // shippingLst =  getShippingAddressesByContacts(new List<Id>{contactId});
        // return shippingLst;
        // }
        return null;
    }
    
    @AuraEnabled
    public static Object getBillingAddressesByContactIds(Id contactId) {
        // List<B2B_Contact_Address__c> billingLst = new List<B2B_Contact_Address__c>();
        //  if (contactId == null ) return billingLst;
        //  else{
        //      billingLst = getBillingAddressesByContacts(new List<Id>{contactId});
        // return billingLst;
        //  }
         return null;
    }

    public static object getBillingAddressesByContacts(List<Id> contactIds){
        //  User u = [select Id,AccountId from User where id=: UserInfo.getUserId() LIMIT 1];
        // List<B2B_Contact_Address__c> billingLst = new List<B2B_Contact_Address__c>();
        
        // billingLst =  [
        //     SELECT
        //     Id,
        //     Default_Bill_To__c,
        //     Default_Ship_To__c,
        //     Address__c,
        //     Contact_Point_Address__c,
        //     Contact__c,
        //     Address_Type__c,Street__c,City__c,State__c,Country__c,Postal_Code__c
        //     FROM B2B_Contact_Address__c
        //     WHERE Contact__c IN :contactIds
        //     AND Contact_Point_Address__r.ParentId =: u.AccountId
        //     AND Contact_Point_Address__r.Address_Status__c = 'Verified'
        //     AND Address_Type__c IN :B2B_SetupConstants.BILL_CONTACT_ADDRESS_TYPES
        //     ORDER BY CreatedDate DESC
        // ];
        return null;

    }

    public static Object getShippingAddressesByContacts(List<Id> contactIds){
        //  User u = [select Id,AccountId from User where id=: UserInfo.getUserId() LIMIT 1];
        // List<B2B_Contact_Address__c> shippingLst = new List<B2B_Contact_Address__c>();
        
        // shippingLst =  [
        //     SELECT
        //     Id,
        //     Default_Bill_To__c,
        //     Default_Ship_To__c,
        //     Address__c,
        //     Contact_Point_Address__c,
        //     Contact__c,
        //     Address_Type__c,Street__c,City__c,State__c,Country__c,Postal_Code__c
        //     FROM B2B_Contact_Address__c
        //     WHERE Contact__c IN :contactIds
        //     AND Contact_Point_Address__r.ParentId =: u.AccountId
        //     AND Contact_Point_Address__r.Address_Status__c = 'Verified'
        //     AND Address_Type__c IN :B2B_SetupConstants.SHIP_CONTACT_ADDRESS_TYPES
        //     ORDER BY CreatedDate DESC
        // ];
        return null;

    }
    
    public Map<Id, ContactPointAddress> getContactPointAddressesByIds(String accountId) {
        
        
        if(accountId != null){
            return new Map<Id, ContactPointAddress>([
                SELECT Id, AddressType, Street, City, State, Country, PostalCode,IsDefault
                FROM ContactPointAddress
                WHERE ParentId =: accountId
                
            ]);
        }
        else{
            return null;
        }
    }
    
    
    public  ContactPointAddress getContactPointAddressBasedonId(String recordId){
        try{
            if(recordId != null) {
                String soql = 'SELECT ' + B2B_Util.getAllObjectFields(String.valueOf(ContactPointAddress.getSObjectType())) +
                    ' FROM ' + String.valueOf(ContactPointAddress.getSObjectType()) +
                    ' WHERE Id = :recordId';
                ContactPointAddress contPointAddr = Database.query(soql);
                return contPointAddr;
            }
            else{
                return null;
            }
        }catch(Exception e){
            return null;
            
        }
    }
    
    public  object getContactAddressBasedonId(String recordId){
    //     try{
    //         if(recordId != null) {
    //              List<String> additionalFields = new List<String>{
    //     'Contact_Point_Address__r.Address_Status__c'
    // };
    //             String soql = 'SELECT ' + B2B_Util.getAllObjectFields(String.valueOf(B2B_Contact_Address__c.getSObjectType())) + ', ' +
    //              String.join(additionalFields, ', ') +
    //                 ' FROM ' + String.valueOf(B2B_Contact_Address__c.getSObjectType()) +
    //                 ' WHERE Id = :recordId';
    //             B2B_Contact_Address__c contAddr = Database.query(soql);
    //             return contAddr;
    //         }
    //         else{
    //             return null;
    //         }
    //     }catch(Exception e){
    //         return null;
            
    //     }
    return null;
    }

    

    
    public  Object getContactAddresse(Id contactPointAddrId) {
        // User u = [select Id,AccountId from User where id=: UserInfo.getUserId() LIMIT 1];
        // List<B2B_Contact_Address__c> addrLst = new List<B2B_Contact_Address__c>();
        // if (contactPointAddrId == null ) return addrLst;
        
        // addrLst =  [
        //     SELECT
        //     Id,
        //     Default_Bill_To__c,
        //     Default_Ship_To__c,
        //     Address__c,
        //     Contact_Point_Address__c,Contact_Point_Address__r.Address_Status__c,
        //     Contact__c,
        //     Address_Type__c,Street__c,City__c,State__c,Country__c,Postal_Code__c
        //     FROM B2B_Contact_Address__c
        //     WHERE Contact_Point_Address__c =: contactPointAddrId
        //     ORDER BY CreatedDate DESC
        // ];
        return null;
    }
}