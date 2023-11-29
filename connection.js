const mysql=require('mysql');

const conn=mysql.createConnection({
    'host':'localhost',
    'user':'root',
    'password':'',
    'database':'mystore'
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
