const mysql=require('mysql');

const conn=mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DBNAME
})

conn.connect((err)=>{

    if(err){
        console.error(err);
    }
    else{
        console.log('Database Connection Estabilished');
    }

});

module.exports=conn;
