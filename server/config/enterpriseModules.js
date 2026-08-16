module.exports = {
  "rate-plans": {
    "label": "Rate Plans & Pricing",
    "fields": {
      "name": "String",
      "code": "String",
      "mealPlan": "String",
      "baseRate": "Number",
      "refundable": "Boolean",
      "minStay": "Number",
      "maxStay": "Number",
      "active": "Boolean"
    }
  },
  "rate-rules": {
    "label": "Dynamic Pricing Rules",
    "fields": {
      "name": "String",
      "ruleType": "String",
      "startDate": "Date",
      "endDate": "Date",
      "weekday": "String",
      "occupancyThreshold": "Number",
      "adjustmentType": "String",
      "adjustmentValue": "Number",
      "priority": "Number",
      "active": "Boolean"
    }
  },
  "crs-allotments": {
    "label": "CRS / Central Inventory",
    "fields": {
      "propertyCode": "String",
      "roomTypeCode": "String",
      "date": "Date",
      "available": "Number",
      "rate": "Number",
      "restrictions": "Mixed"
    }
  },
  "channel-mappings": {
    "label": "Channel Manager",
    "fields": {
      "channel": "String",
      "externalRoomType": "String",
      "internalRoomType": "String",
      "externalRatePlan": "String",
      "internalRatePlan": "String",
      "status": "String",
      "lastSync": "Date",
      "lastError": "String"
    }
  },
  "booking-engine-content": {
    "label": "Direct Booking Engine",
    "fields": {
      "section": "String",
      "title": "String",
      "content": "String",
      "locale": "String",
      "brand": "String",
      "active": "Boolean"
    }
  },
  "groups": {
    "label": "Group Bookings",
    "fields": {
      "name": "String",
      "type": "String",
      "arrival": "Date",
      "departure": "Date",
      "roomsBlocked": "Number",
      "releaseDate": "Date",
      "negotiatedRate": "Number",
      "deposit": "Number",
      "masterFolio": "Boolean",
      "status": "String"
    }
  },
  "loyalty-accounts": {
    "label": "Loyalty Program",
    "fields": {
      "guestId": "ObjectId",
      "membershipNumber": "String",
      "tier": "String",
      "points": "Number",
      "lifetimePoints": "Number",
      "expiryDate": "Date",
      "status": "String"
    }
  },
  "loyalty-transactions": {
    "label": "Loyalty Transactions",
    "fields": {
      "guestId": "ObjectId",
      "type": "String",
      "points": "Number",
      "reference": "String",
      "description": "String",
      "expiresAt": "Date"
    }
  },
  "service-requests": {
    "label": "Guest Service / Complaints",
    "fields": {
      "guestId": "ObjectId",
      "roomId": "ObjectId",
      "category": "String",
      "priority": "String",
      "department": "String",
      "assignedTo": "ObjectId",
      "status": "String",
      "slaDueAt": "Date",
      "description": "String",
      "resolution": "String",
      "guestConfirmed": "Boolean"
    }
  },
  "guest-journeys": {
    "label": "Automated Guest Journey",
    "fields": {
      "guestId": "ObjectId",
      "reservationId": "ObjectId",
      "trigger": "String",
      "channel": "String",
      "template": "String",
      "scheduledAt": "Date",
      "status": "String",
      "result": "Mixed"
    }
  },
  "upsell-offers": {
    "label": "Upselling Engine",
    "fields": {
      "name": "String",
      "type": "String",
      "price": "Number",
      "eligibility": "Mixed",
      "inventoryRequired": "Boolean",
      "active": "Boolean",
      "revenueAttribution": "Number"
    }
  },
  "laundry-orders": {
    "label": "Laundry Management",
    "fields": {
      "guestId": "ObjectId",
      "roomId": "ObjectId",
      "reservationId": "ObjectId",
      "items": "Mixed",
      "serviceType": "String",
      "pickupAt": "Date",
      "deliveryAt": "Date",
      "status": "String",
      "total": "Number",
      "folioPosted": "Boolean"
    }
  },
  "linen-items": {
    "label": "Linen Management",
    "fields": {
      "item": "String",
      "cleanStock": "Number",
      "inRoom": "Number",
      "inLaundry": "Number",
      "damaged": "Number",
      "missing": "Number",
      "discarded": "Number",
      "parStock": "Number",
      "unitCost": "Number"
    }
  },
  "minibar-entries": {
    "label": "Minibar Management",
    "fields": {
      "roomId": "ObjectId",
      "reservationId": "ObjectId",
      "items": "Mixed",
      "amount": "Number",
      "stockDeducted": "Boolean",
      "folioPosted": "Boolean",
      "capturedBy": "ObjectId"
    }
  },
  "outlets": {
    "label": "F&B Outlets",
    "fields": {
      "name": "String",
      "type": "String",
      "location": "String",
      "openTime": "String",
      "closeTime": "String",
      "active": "Boolean"
    }
  },
  "restaurant-tables": {
    "label": "Restaurant Tables",
    "fields": {
      "outletId": "ObjectId",
      "number": "String",
      "section": "String",
      "capacity": "Number",
      "status": "String"
    }
  },
  "menu-items": {
    "label": "Menu Management",
    "fields": {
      "outletId": "ObjectId",
      "category": "String",
      "name": "String",
      "price": "Number",
      "taxPercent": "Number",
      "modifiers": "Mixed",
      "available": "Boolean",
      "kitchenStation": "String"
    }
  },
  "pos-orders": {
    "label": "Restaurant POS",
    "fields": {
      "outletId": "ObjectId",
      "tableId": "ObjectId",
      "roomId": "ObjectId",
      "reservationId": "ObjectId",
      "waiterId": "ObjectId",
      "items": "Mixed",
      "subtotal": "Number",
      "tax": "Number",
      "serviceCharge": "Number",
      "discount": "Number",
      "total": "Number",
      "paymentMethod": "String",
      "status": "String",
      "folioPosted": "Boolean"
    }
  },
  "kitchen-tickets": {
    "label": "Kitchen Display System",
    "fields": {
      "orderId": "ObjectId",
      "station": "String",
      "items": "Mixed",
      "priority": "String",
      "status": "String",
      "receivedAt": "Date",
      "readyAt": "Date",
      "timerSeconds": "Number"
    }
  },
  "spa-appointments": {
    "label": "Spa & Wellness",
    "fields": {
      "guestId": "ObjectId",
      "reservationId": "ObjectId",
      "service": "String",
      "therapist": "String",
      "treatmentRoom": "String",
      "startAt": "Date",
      "endAt": "Date",
      "price": "Number",
      "status": "String",
      "folioPosted": "Boolean"
    }
  },
  "events": {
    "label": "Banquet & Event Management",
    "fields": {
      "name": "String",
      "type": "String",
      "venue": "String",
      "startAt": "Date",
      "endAt": "Date",
      "guestCount": "Number",
      "food": "Mixed",
      "decor": "Mixed",
      "av": "Mixed",
      "layout": "String",
      "packagePrice": "Number",
      "deposit": "Number",
      "beo": "Mixed",
      "status": "String"
    }
  },
  "conference-rooms": {
    "label": "Conference Rooms",
    "fields": {
      "name": "String",
      "capacity": "Number",
      "layouts": "Mixed",
      "equipment": "Mixed",
      "rentalPrice": "Number",
      "status": "String"
    }
  },
  "inventory-items": {
    "label": "Inventory Management",
    "fields": {
      "sku": "String",
      "name": "String",
      "category": "String",
      "department": "String",
      "store": "String",
      "unit": "String",
      "qtyOnHand": "Number",
      "minStock": "Number",
      "reorderPoint": "Number",
      "batch": "String",
      "expiry": "Date",
      "averageCost": "Number"
    }
  },
  "stock-transactions": {
    "label": "Stock Transactions",
    "fields": {
      "itemId": "ObjectId",
      "type": "String",
      "qty": "Number",
      "fromStore": "String",
      "toStore": "String",
      "unitCost": "Number",
      "reference": "String",
      "reason": "String"
    }
  },
  "suppliers": {
    "label": "Supplier Management",
    "fields": {
      "name": "String",
      "contact": "String",
      "email": "String",
      "phone": "String",
      "taxId": "String",
      "bankDetails": "Mixed",
      "paymentTerms": "String",
      "categories": "Mixed",
      "rating": "Number",
      "complianceDocs": "Mixed",
      "status": "String"
    }
  },
  "purchase-requests": {
    "label": "Purchase Requests / RFQ",
    "fields": {
      "requestNumber": "String",
      "department": "String",
      "items": "Mixed",
      "neededBy": "Date",
      "budgetRef": "String",
      "status": "String",
      "requestedBy": "ObjectId",
      "approvalId": "ObjectId",
      "rfqNumber": "String",
      "supplierQuotes": "Mixed",
      "comparison": "Mixed",
      "selectedSupplierId": "ObjectId",
      "selectedQuoteAmount": "Number"
    }
  },
  "purchase-orders": {
    "label": "Purchase Orders / GRN",
    "fields": {
      "poNumber": "String",
      "supplierId": "ObjectId",
      "items": "Mixed",
      "subtotal": "Number",
      "tax": "Number",
      "total": "Number",
      "status": "String",
      "approvedBy": "ObjectId",
      "goodsReceived": "Mixed",
      "supplierInvoice": "String"
    }
  },
  "ar-accounts": {
    "label": "Accounts Receivable",
    "fields": {
      "accountType": "String",
      "accountId": "ObjectId",
      "invoiceNumber": "String",
      "amount": "Number",
      "dueDate": "Date",
      "paidAmount": "Number",
      "status": "String"
    }
  },
  "ap-accounts": {
    "label": "Accounts Payable",
    "fields": {
      "supplierId": "ObjectId",
      "invoiceNumber": "String",
      "amount": "Number",
      "dueDate": "Date",
      "paidAmount": "Number",
      "status": "String"
    }
  },
  "night-audits": {
    "label": "Night Audit",
    "fields": {
      "businessDate": "Date",
      "openFolios": "Number",
      "roomChargesPosted": "Number",
      "taxPosted": "Number",
      "noShowsProcessed": "Number",
      "exceptions": "Mixed",
      "status": "String",
      "closedBy": "ObjectId",
      "closedAt": "Date"
    }
  },
  "cashier-shifts": {
    "label": "Cashier Management",
    "fields": {
      "cashierId": "ObjectId",
      "openedAt": "Date",
      "closedAt": "Date",
      "openingBalance": "Number",
      "cashReceipts": "Number",
      "cardReceipts": "Number",
      "refunds": "Number",
      "paidOuts": "Number",
      "expectedCash": "Number",
      "actualCash": "Number",
      "variance": "Number",
      "status": "String"
    }
  },
  "corporate-accounts": {
    "label": "Corporate Accounts",
    "fields": {
      "name": "String",
      "code": "String",
      "contact": "String",
      "negotiatedRate": "Number",
      "paymentTerms": "String",
      "creditLimit": "Number",
      "outstanding": "Number",
      "contract": "Mixed",
      "status": "String"
    }
  },
  "travel-agents": {
    "label": "Travel Agents",
    "fields": {
      "name": "String",
      "code": "String",
      "contact": "String",
      "commissionPercent": "Number",
      "contractedRates": "Mixed",
      "production": "Number",
      "commissionPayable": "Number",
      "status": "String"
    }
  },
  "transport-requests": {
    "label": "Transportation",
    "fields": {
      "guestId": "ObjectId",
      "reservationId": "ObjectId",
      "type": "String",
      "vehicle": "String",
      "driver": "String",
      "pickupLocation": "String",
      "dropLocation": "String",
      "pickupAt": "Date",
      "cost": "Number",
      "status": "String",
      "folioPosted": "Boolean"
    }
  },
  "maintenance-work-orders": {
    "label": "Maintenance Work Orders",
    "fields": {
      "roomId": "ObjectId",
      "assetId": "ObjectId",
      "location": "String",
      "category": "String",
      "technician": "ObjectId",
      "priority": "String",
      "targetAt": "Date",
      "status": "String",
      "description": "String",
      "resolution": "String",
      "roomOutOfOrder": "Boolean"
    }
  },
  "preventive-maintenance": {
    "label": "Preventive Maintenance",
    "fields": {
      "assetId": "ObjectId",
      "category": "String",
      "scheduleType": "String",
      "interval": "Number",
      "nextDue": "Date",
      "checklist": "Mixed",
      "status": "String"
    }
  },
  "assets": {
    "label": "Asset Management",
    "fields": {
      "assetId": "String",
      "category": "String",
      "name": "String",
      "serialNumber": "String",
      "purchaseDate": "Date",
      "cost": "Number",
      "warrantyEnd": "Date",
      "location": "String",
      "assignedTo": "ObjectId",
      "status": "String",
      "maintenanceHistory": "Mixed"
    }
  },
  "lost-found": {
    "label": "Lost & Found",
    "fields": {
      "item": "String",
      "roomId": "ObjectId",
      "guestId": "ObjectId",
      "foundLocation": "String",
      "employeeId": "ObjectId",
      "photo": "String",
      "storageLocation": "String",
      "status": "String",
      "notes": "String"
    }
  },
  "incidents": {
    "label": "Security / Incident Management",
    "fields": {
      "type": "String",
      "guestId": "ObjectId",
      "employeeId": "ObjectId",
      "location": "String",
      "severity": "String",
      "description": "String",
      "attachments": "Mixed",
      "actions": "Mixed",
      "outcome": "String",
      "confidential": "Boolean",
      "status": "String"
    }
  },
  "employees": {
    "label": "Employee / HR",
    "fields": {
      "employeeCode": "String",
      "name": "String",
      "department": "String",
      "role": "String",
      "email": "String",
      "phone": "String",
      "joiningDate": "Date",
      "employmentType": "String",
      "status": "String"
    }
  },
  "shifts": {
    "label": "Shift Management",
    "fields": {
      "employeeId": "ObjectId",
      "date": "Date",
      "shiftType": "String",
      "startTime": "String",
      "endTime": "String",
      "overtimeMinutes": "Number",
      "status": "String",
      "approvedBy": "ObjectId"
    }
  },
  "attendance": {
    "label": "Attendance",
    "fields": {
      "employeeId": "ObjectId",
      "date": "Date",
      "checkIn": "Date",
      "checkOut": "Date",
      "lateMinutes": "Number",
      "overtimeMinutes": "Number",
      "status": "String",
      "source": "String"
    }
  },
  "documents": {
    "label": "Document Management",
    "fields": {
      "entityType": "String",
      "entityId": "ObjectId",
      "name": "String",
      "type": "String",
      "url": "String",
      "tags": "Mixed",
      "expiresAt": "Date",
      "accessLevel": "String",
      "retentionUntil": "Date"
    }
  },
  "report-presets": {
    "label": "Reporting System",
    "fields": {
      "name": "String",
      "module": "String",
      "filters": "Mixed",
      "columns": "Mixed",
      "schedule": "String",
      "format": "String",
      "recipients": "Mixed",
      "active": "Boolean"
    }
  },
  "forecasts": {
    "label": "Forecasting",
    "fields": {
      "date": "Date",
      "roomDemand": "Number",
      "occupancyPercent": "Number",
      "roomRevenue": "Number",
      "staffingNeed": "Number",
      "fnbDemand": "Number",
      "model": "String",
      "scenario": "String",
      "actual": "Mixed"
    }
  },
  "currencies": {
    "label": "Multi-Currency",
    "fields": {
      "code": "String",
      "name": "String",
      "symbol": "String",
      "rateToBase": "Number",
      "effectiveAt": "Date",
      "active": "Boolean"
    }
  },
  "translations": {
    "label": "Multi-Language",
    "fields": {
      "locale": "String",
      "namespace": "String",
      "key": "String",
      "value": "String",
      "brandVariant": "String",
      "propertyVariant": "String"
    }
  },
  "tax-rules": {
    "label": "Tax Configuration",
    "fields": {
      "name": "String",
      "type": "String",
      "rate": "Number",
      "department": "String",
      "productType": "String",
      "segment": "String",
      "effectiveFrom": "Date",
      "effectiveTo": "Date",
      "version": "Number",
      "active": "Boolean"
    }
  },
  "integrations": {
    "label": "API & Integration Hub",
    "fields": {
      "name": "String",
      "type": "String",
      "provider": "String",
      "authType": "String",
      "status": "String",
      "config": "Mixed",
      "lastSuccess": "Date",
      "lastError": "String",
      "retryCount": "Number"
    }
  },
  "webhooks": {
    "label": "Webhooks",
    "fields": {
      "name": "String",
      "event": "String",
      "url": "String",
      "secret": "String",
      "active": "Boolean",
      "lastStatus": "Number",
      "lastAttempt": "Date",
      "retryPolicy": "Mixed"
    }
  },
  "door-lock-keys": {
    "label": "Smart Door Locks",
    "fields": {
      "roomId": "ObjectId",
      "reservationId": "ObjectId",
      "vendor": "String",
      "credentialId": "String",
      "validFrom": "Date",
      "validUntil": "Date",
      "status": "String"
    }
  },
  "iot-devices": {
    "label": "IoT Smart Room",
    "fields": {
      "roomId": "ObjectId",
      "deviceType": "String",
      "vendor": "String",
      "deviceId": "String",
      "state": "Mixed",
      "lastSeen": "Date",
      "status": "String"
    }
  },
  "energy-readings": {
    "label": "Energy Management",
    "fields": {
      "roomId": "ObjectId",
      "deviceId": "String",
      "timestamp": "Date",
      "kwh": "Number",
      "occupancy": "Boolean",
      "exception": "String"
    }
  },
  "subscriptions": {
    "label": "Subscription Plans",
    "fields": {
      "organizationId": "ObjectId",
      "plan": "String",
      "modules": "Mixed",
      "userLimit": "Number",
      "propertyLimit": "Number",
      "storageGb": "Number",
      "status": "String",
      "startsAt": "Date",
      "renewsAt": "Date",
      "billingRef": "String"
    }
  },
  "plans": {
    "label": "Commercial Plans",
    "fields": {
      "name": "String",
      "code": "String",
      "priceMonthly": "Number",
      "modules": "Mixed",
      "limits": "Mixed",
      "enterpriseSupport": "Boolean",
      "active": "Boolean"
    }
  },
  "feature-flags": {
    "label": "Feature Toggles",
    "fields": {
      "organizationId": "ObjectId",
      "key": "String",
      "enabled": "Boolean",
      "config": "Mixed"
    }
  },
  "backup-runs": {
    "label": "Backup & Recovery",
    "fields": {
      "startedAt": "Date",
      "completedAt": "Date",
      "type": "String",
      "status": "String",
      "location": "String",
      "verified": "Boolean",
      "rpoMinutes": "Number",
      "rtoMinutes": "Number",
      "notes": "String"
    }
  },
  "integration-logs": {
    "label": "Integration Monitoring",
    "fields": {
      "integrationId": "ObjectId",
      "direction": "String",
      "event": "String",
      "requestId": "String",
      "status": "String",
      "attempt": "Number",
      "payload": "Mixed",
      "response": "Mixed",
      "error": "String"
    }
  }
  ,"promo-codes": {
    "label": "Booking Promo Codes",
    "fields": {
      "code": "String", "description": "String", "discountType": "String", "discountValue": "Number",
      "startDate": "Date", "endDate": "Date", "minNights": "Number", "memberOnly": "Boolean", "active": "Boolean"
    }
  },
  "hotel-packages": {
    "label": "Booking Packages",
    "fields": {
      "name": "String", "code": "String", "description": "String", "roomTypeId": "ObjectId", "ratePlan": "String",
      "price": "Number", "addons": "Mixed", "startDate": "Date", "endDate": "Date", "active": "Boolean"
    }
  }
};
