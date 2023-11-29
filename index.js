const conn=require('./connection');
const express=require('express');
const cors=require('cors');
const app=express();
const multer=require('multer');
const path=require('path')
const fs=require('fs/promises');
const util = require('util');
const unlink = util.promisify(fs.unlink);
const Razorpay = require('razorpay');


app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    conn.query("Select * from products",(err,result)=>{
        if(err){
            res.send('Error')
        }
        else{
            res.send(result);
        }

    });
})

// Image Storage Path Define
const storage=multer.diskStorage({
    destination:'./uploads',
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${path.extname(file.originalname)}`)
    }

})

// Storage and Image Validations
const upload=multer({
    storage:storage,
    fileFilter:(req,file,cb)=>{
        if (!file.originalname.match(/\.(png|jpg)$/)) { 
            // upload only png and jpg format
          return cb(new Error('Please upload a Image'))
        }
      cb(null, true)
    }

})

// Category Details Insert (Post with Image)
app.use('/uploads',express.static('./uploads'))
app.post('/create',upload.single('file'),function(req,res){
   const sql="INSERT INTO category (`category_name`,`category_image`) VALUES (?)"
   console.log(req.body);
   console.log(req.file);
   const vlaues=[
    req.body.catename,
    req.file.filename
   ]
conn.query(sql,[vlaues],(err,result)=>{
    if (err) return res.json(err)
    return res.json(result)
})
})

// Fetch and get CategoryDetails 
app.get('/catrgorydetails',(req,res)=>{
    conn.query("SELECT * FROM category",(err,result)=>{
        if(err){
            res.send('Error')
        }
        else{
            res.send(result)
        }
    })
})

// Fetch and get Categories details through ID
app.get('/fetch/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const data = await new Promise((resolve, reject) => {
        conn.query('SELECT * FROM category WHERE category_id = ?', [id], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  
  // Update Category data with Image
  
  app.put('/update/:catid', upload.single('category_image'), async (req, res) => {
    const catid = req.params.catid;
    console.log(catid)
    const category_name = req.body.category_name;
    console.log(category_name)
    const category_image = req.file;
    console.log(category_image)
    try {
      conn.query("SELECT category_image FROM category WHERE category_id=?", [catid],async(err, results) => {
        if (results) {
          console.log(results);
          if(results && results.length>=0){
          const oldImage = results[0].category_image;
          console.log(oldImage)
          if (oldImage) {
            const imagePath = path.join(__dirname, 'uploads', oldImage); // Provide the absolute path to the image
           await fs.unlink(imagePath);
              console.log('Old image removed Successfully');
          }
          }
        } else {
          console.error(err);
        }
      });
        await conn.query("UPDATE category SET category_name=?,category_image=? WHERE category_id=?", [category_name, category_image ? category_image.filename : null, catid]);
        res.status(200).json({ message: 'Category Update Successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete category with id
app.delete("/delete/:id", async (req, res) => {
  const catId = req.params.id;
  try {
    conn.query("DELETE FROM category WHERE category_id= ? ", [catId], function (err, result) {
      if (result) {
        return res.send({ status: true })
        } else {
          console.log(err);
          return res.send({ status: false })
          }
          });
          } catch (e) {
            console.log(e);
            return res.send({ status: false })
            }
            });


                       // Product APIs



// Insert Product Details With Image

const mystorage=multer.diskStorage({
  destination:'./uploads',
  filename:(req,file,cb)=>{
      return cb(null,`${Date.now()}${path.extname(file.originalname)}`)
  }
})

const myupload=multer({
  storage:mystorage,
  fileFilter:(req,file,cb)=>{
      if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
          return cb(new Error('Please Valid file Upload'))

      }
      cb(null,true)
  }


})





app.use('./uploads',express.static('./uploads'))

app.post('/productCreate',myupload.single('file'),function(req,res){
const sql="INSERT INTO products(`product_name`,`product_image`,`product_description`,`product_price`,`product_quantity`,`product_mprice`,`category_id`)VALUES (?)"
const values=[
  req.body.productName,
  req.file.filename,
  req.body.productDesc,
  req.body.productPrice,
  req.body.productQuant,
  req.body.productMarketPrice,
  req.body.productCatid,

]
conn.query(sql,[values],(err,result)=>{
  if(err){
      res.json({message:"Product Insertion UnSuccessfully",status:500})
  }
  else{
      res.json({result,message:"Product Insertion Successfully",status:200})
  }

})

})

// Fetch ProductDetails 

app.get('/productDetails',(req,res)=>{
  conn.query("SELECT * FROM products",(err,result)=>{
      if(err){
          res.send(error)
      }
      else{
          res.send(result)
      }
  })

})

// Fetch ProDuct Details By Id

app.get('/productsById/:pId',async(req,res)=>{

  try{
    const pId=req.params.pId;
    const productData=await new Promise((resolve,reject)=>{

    conn.query("SELECT products.*,category.category_name FROM products LEFT JOIN category ON products.category_id=category.category_id WHERE products.product_id=?",[pId],(err,result)=>{

      if(err){
        reject(err)
      }
      else{
        resolve(result)
      }
      
    });

    });
    res.json(productData)
  }
  catch(err){
    res.json({message:err.message,data:{},status:false});

  }
});


// Product Updated With Image

app.put('/updateproduct/:upId',myupload.single('file'),async(req,res)=>{
  const upId=req.params.upId;
  const product_name=req.body.product_name;
  const category_id=req.body.category_id;
  const product_price=req.body.product_price;
  const product_quantity=req.body.product_quantity;
  const product_mprice=req.body.product_mprice;
  const product_description=req.body.product_description;
  const file=req.file;
  console.log(file);
  
  try{
    conn.query("SELECT product_image FROM products WHERE product_id=?",[upId],async(err,result)=>{
      if(result){
      if(result && result.length>=0){
        const Imageold=result[0].product_image;
        if(Imageold){
          const PathImage=path.join(__dirname,'uploads',Imageold);
          await fs.unlink(PathImage);
          console.log('Product Old Image Remove Successfully');
        }

      }
    }
      else{
        console.error(err);
      }
    });

    await conn.query("UPDATE products SET product_name=?,product_image=?,product_description=?,product_price=?,product_quantity=?,product_mprice=?,category_id=? WHERE product_id=?"
    ,[product_name,file ? file.filename:null,product_description,product_price,product_quantity,product_mprice,category_id,upId]);
    res.status(200).json({message:"Produts Details Updated Successfully"});

  }
  catch(error){
    res.status(500).json({message:error});

  }

});


// Fetch ProDuct Details With Join category

app.get('/productswithcat/',async(req,res)=>{

  try{
    const productData=await new Promise((resolve,reject)=>{

    conn.query("SELECT products.*,category.category_name FROM products LEFT JOIN category ON products.category_id=category.category_id",(err,result)=>{

      if(err){
        reject(err)
      }
      else{
        resolve(result)
      }
      
    });

    });
    res.json(productData)
  }
  catch(err){
    res.json({message:err.message,data:{},status:false});

  }
});


// Delete Product By id

app.delete('/deleteproduct/:prID',async(req,res)=>{
  const prID=req.params.prID;

  try{
    conn.query("DELETE FROM products WHERE product_id=?",[prID],(err,result)=>{
      if(result){
        res.send({status:true});
      }
      else{
        res.send({err,status:false});
      }
    })
  }
  catch(err){
    res.send({err});

  }

})

// Homepage Banner

const bannerStorage=multer.diskStorage({
  destination:'./uploads',
  filename:(req,file,cb)=>{
      return cb(null,file.originalname)
  }
})

const bannerUpload=multer({
  storage:bannerStorage,
  fileFilter:(req,file,cb)=>{
      if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
          return cb(new Error('Please Valid file Upload'))

      }
      cb(null,true)
  }


})


app.use('./uploads',express.static('./uploads'))

app.post('/bannerImage',bannerUpload.single('file'),function(req,res){
const sql="INSERT INTO banner(`banner_image`)VALUES (?)"
const values=[
  req.file.originalname,
]
conn.query(sql,[values],(err,result)=>{
  if(err){
      res.json({message:"Banner Image UnSuccessfully",status:false})
  }
  else{
      res.json({result,message:"Banner Image Successfully",status:true})
  }

})

});


// Category PageBanner

const cBannerStorage=multer.diskStorage({
  destination:'./uploads',
  filename:(req,file,cb)=>{
      return cb(null,file.originalname)
  }
})

const cBannerUpload=multer({
  storage:cBannerStorage,
  fileFilter:(req,file,cb)=>{
      if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
          return cb(new Error('Please Valid file Upload'))

      }
      cb(null,true)
  }


})


app.use('./uploads',express.static('./uploads'))

app.post('/cBannerImage',cBannerUpload.single('file'),function(req,res){
const sql="INSERT INTO category_banner(`cbanner_image`,`cbanner_id`)VALUES (?)"
const values=[
  req.file.originalname,
  req.body.catId,
]
conn.query(sql,[values],(err,result)=>{
  if(err){
      res.json({message:"Category Banner Image Insert UnSuccessfull",status:false})
  }
  else{
      res.json({result,message:"Categpry Banner Image Insert Successfully",status:true})
  }

})

});

// Category With Category Banner

app.get('/categoryBanner/',async(req,res)=>{

  try{
    const cBannerData=await new Promise((resolve,reject)=>{

    conn.query("SELECT category_banner.*,category.category_name FROM category_banner LEFT JOIN category ON category_banner.cbanner_id= category.category_id",(err,result)=>{

      if(err){
        reject(err)
      }
      else{
        resolve(result)
      }
      
    });

    });
    res.json(cBannerData)
  }
  catch(err){
    res.json({message:err.message,data:{},status:false});

  }
});


// Delete Category Banner by Id

app.delete('/deletecbanner/:bnID',async(req,res)=>{
  const bnID=req.params.bnID;

  try{
    conn.query("DELETE FROM category_banner WHERE c_id=?",[bnID],(err,result)=>{
      if(result){
        res.send({status:true});
      }
      else{
        res.send({err,status:false});
      }
    })
  }
  catch(err){
    res.send({err});

  }

});

// Fetch Home Page Banner 

app.get('/banner',(req,res)=>{
  conn.query("SELECT * FROM banner",(err,result)=>{
      if(err){
          res.send(err)
      }
      else{
          res.send(result)
      }
  })

});


// Banner Delete

app.delete('/deletebanner/:bnID',async(req,res)=>{
  const bnID=req.params.bnID;

  try{
    conn.query("DELETE FROM banner WHERE id=?",[bnID],(err,result)=>{
      if(result){
        res.send({status:true});
      }
      else{
        res.send({err,status:false});
      }
    })
  }
  catch(err){
    res.send({err});

  }

});

// Razorpay Api Integration

app.post('/payments',async(req,res)=>{
try{
var {amount}=req.body;
if (!amount) {
  return res.status(400).json({
    success: false,
    error: "Amount is required"
  });
}
console.log(amount);
var instance = new Razorpay({
 key_id:"rzp_test_rR38FXAeKOiyCD", 
 key_secret:"9N5Np1YFSwI72g9sfbl9xaiU" });

const order=await instance.orders.create({
  amount:amount,
  currency:"INR",
  receipt:"receipt#1",
});
const sql="INSERT INTO order(`amount`,`order_id`)VALUES(?,?)";
console.log(sql);
const values=[amount,order.id];
conn.query(sql,values,(err,result)=>{

  if(err){
    res.status(500).json({
      success:false,
      err:"Internl Server error",
    });

  }
  else{
    res.status(200).json({
      success:true,
      order,
      amount,
      result,
    });
  }


})
}
catch(error){
console.log(error);
}
});


app.listen(4200,()=>{
    console.log(`Server is running on port 4200`);
});