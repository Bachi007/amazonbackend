var express = require('express');
var users=require('../models/users');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
require('dotenv').config();
var nodemailer = require('nodemailer')
var router = express.Router();


router.post("/registration", (req,res)=>{
    users.findOne({username:req.body.username})
    .then(async (existinguser)=>{
      if(existinguser==null){
        var u1=new users({
          username:req.body.username,
          password:await bcrypt.hash(req.body.password,10),
          email:req.body.email,
          phone:req.body.phone,
          role:req.body.role
        })
        u1.save()
        .then(()=>{

          var transport = nodemailer.createTransport({
            service:'gmail',
            auth:{
              user:'chitturi.bhaskarasai@gmail.com',
              pass:"mkwi xaoc xsmg vsyg"
            }
          })
          var mailOptions = {
            from:'chitturi.bhaskarasai@gmail.com',
            to:`${req.body.email}`,
            subject:"Registration Completed with DRF",
            text:`Hey ${req.body.username} congrats, you have completed our registration process and your password is ${req.body.password}`
          }
          transport.sendMail(mailOptions,(err)=>{
            if(err){
              console.log(err)
            }
            else{
              console.log("Email Sent :)")
            }
          })


          res.send({"status":"registration completed"})
        })
        .catch((err)=>console.log(err)) 
      }
      else{
        res.send({"status":"username already exist"})
      }
    })
    



})

router.post("/login",(req,res)=>{

  users.findOne({username:req.body.username})
  .then(async (dbuser)=>{
    if(dbuser!=null){
        if(await bcrypt.compare(req.body.password,dbuser.password)){
          const jwtToken=jwt.sign({username:dbuser.username},process.env.SECRET_KEY,{expiresIn:'2h'})
          res.send({"status":"Login success","token":jwtToken,"userid":dbuser._id,"userrole":dbuser.role});
        }
        else{
          res.send({"status":"username or password incorrect"})
        }
    }
    else{
      res.send({"status":"user not found"})
    }
  })

})

router.patch("/change-password",(req,res)=>{

     const {userid,oldpassword,newpassword} = req.body;
     users.findOne({_id:userid})
     .then(async (dbuser)=>{
            if(dbuser!=null){
              if(bcrypt.compare(oldpassword,dbuser.password)){
                dbuser.password=await bcrypt.hash(newpassword,10);
                dbuser.save()
                .then(()=>{res.send({"status":"password updated"})})
          }
          else{
              res.send({"status":"old password incorrect"})
          }
            }
            else{
              res.send({"status":"user not found"})
            }
     })



})

module.exports = router;
