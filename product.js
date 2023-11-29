const conn=require('./connection');
const express=require('express');
const cors=require('cors');
const app=express();
const multer=require('multer');
const path=require('path');
const { error } = require('console');


app.use(express.urlencoded({extended:true}));
app.use(cors())
app.use(express.json());








app.listen(3200,()=>{
    console.log('3200 Port Initiative');
})


