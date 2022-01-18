module.exports = Object.freeze({

    dataTypeEnum: {
        varChar: 'VarChar',
        int: 'Int',
        nvarChar: 'NVarChar',
        float: 'Float',
        decimal: 'Decimal',
        real: 'Real',
        bit: 'Bit',
        date: 'Date'
    },
    
    procedureEnum: {
        proc_login: 'proc_login',
        proc_signUp: 'proc_signUp',
        proc_create_challange: 'proc_create_challange',
        proc_get_dashboard_data: 'proc_get_dashboard_data'
    },

    errorEnum: {
        proc_login: 'LOGIN-ERROR',
        proc_signUp: 'SIGN-UP-ERROR',
        proc_create_challange: 'CREATE-CHALLANGE-ERROR',
        proc_get_dashboard_data: 'GET-DASHBOARD-DATA-ERROR'
    }
})


// dataTypeEnum = {
//     varChar: 'VarChar',
//     int: 'Int',
//     nvarChar: 'NVarChar',
//     float: 'Float',
//     decimal: 'Decimal',
//     real: 'Real',
//     bit: 'Bit',
//     date: 'Date'
// },

// procedureEnum = {
//     proc_login: 'proc_login',
//     proc_signUp: 'proc_signUp',
//     proc_create_challange: 'proc_create_challange'
// },

// errorEnum = {
//     proc_login: 'LOGIN-ERROR',
//     proc_signUp: 'SIGN-UP-ERROR',
//     proc_create_challange: 'CREATE-CHALLANGE-ERROR'
// }

// module.exports = {
//     dataTypeEnum,
//     procedureEnum,
//     errorEnum
// }
