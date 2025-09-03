const knex = require('knex')
const dbConnection = knex({
     client : 'sqlite3',
     connection : {
          filename : 'projet2.sqlite3'
     },
      useNullAsDefault : true
})
module.exports = dbConnection