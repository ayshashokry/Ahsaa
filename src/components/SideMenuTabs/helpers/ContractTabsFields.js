export const CONTRACTS_MAIN_DATA=[
    {
        alias:'البلدية',
        fieldName:'BALADEYAH_BRANCH_NAME',
        permissions:[1,2],
        groupPermissions:[6,1]
    },
    {
        alias:'منطقة النشاط',
        fieldName:'CLASS_NAME',
        permissions:[1,2],
        groupPermissions:[6,1]
    },
    {
        alias:'المخطط',
        fieldName:'PLANNED_NUMBER',
        permissions:[1,2],
        groupPermissions:[6,1]
    },
    {
        alias:'رقم قطعة الأرض بالمخطط',
        fieldName:'PART_NUMBER',
        permissions:[1,2],
        groupPermissions:[6,1]
    },
    {
        alias:'رقم المبني/المحل',
        fieldName:'BUILDING_NUMBER',
        permissions:[1,2],
        groupPermissions:[6,1]
    },
    {
        alias:'النشاط',
        fieldName:'ACTIVITY_NAME',
        permissions:[1,2],
        groupPermissions:[6,1]
    },
    {
        alias:'رقم العقد',
        fieldName:'CONTRACT_NUMBER',
        permissions:[1,2],
        groupPermissions:[6,1]
    },
    {
        alias:'حالة العقد',
        fieldName:'TRANSACTION_TYPE_DESC',
        permissions:[1,2],
        groupPermissions:[6,1]
    },
    {
        alias:'بداية العقد ',
        fieldName:'START_DATEH_F',
        permissions:[],
        groupPermissions:[6]
    },
    {
        alias:'نهاية العقد ',
        fieldName:'END_DATEH_F',
        permissions:[],
        groupPermissions:[6]
    },
    {
        alias:'مدة العقد بالسنين ',
        fieldName:'PERIOD_YEAR',
        permissions:[],
        groupPermissions:[6]
    },
    {
        alias:'قيمة العقد  ',
        fieldName:'CONTRACT_VALUE',
        permissions:[],
        groupPermissions:[6]
    },
    {
        alias:'المساحة من العقد  ',
        fieldName:'PART_SPACE',
        permissions:[],
        groupPermissions:[6]
    },
    {
        alias:'ملف العقد  ',
        fieldName:'CONTRACT_FILE',          //it is not included in db table, just added by me 
        permissions:[],
        groupPermissions:[]
    },
]
export const INVESTOR_DATA=[
    {
        alias:'اسم المستثمر ',
        fieldName:'OWNER_NAME',
        permissions:[],
        groupPermissions:[6,1]
    },
    {
        alias:'رقم السجل  ',
        fieldName:'RENT_IDENTIFIER',
        permissions:[],
        groupPermissions:[6]
    },
    // {
    //     alias:'الهاتف  ',
    //     fieldName:'',
    //     permissions:[6,1]
    // },

]

export const CONTRACT_INSTALLMENT_DATA=[
    {
        alias:'رقم القسط',
        fieldName:'SEQNO',
        permissions:[1,2],
        groupPermissions:[6]
    },
    {
        alias:'قيمة القسط  ',
        fieldName:'TOTAL_VAL',
        permissions:[1,2],
        groupPermissions:[6]
    },
    {
        alias:'رقم الفاتورة',
        fieldName:'PAYORDR',
        permissions:[1,2],
        groupPermissions:[6]
    },
    {
        alias:'تاريخ الاستحقاق',
        fieldName:'START_DATEH_F',
        permissions:[1,2],
        groupPermissions:[6]
    },
    {
        alias:'حالة السداد',
        fieldName:'PAYFLG',
        permissions:[1,2],
        groupPermissions:[6]
    },
    {
        alias:'تاريخ السداد',
        fieldName:'PAY_DATEH_F',
        permissions:[1,2],
        groupPermissions:[6]
    },
]
