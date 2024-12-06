import express from 'express';
import { ContentModel, LinkModel, UserModel } from './db';
import jwt from 'jsonwebtoken';
import {JWT_PASSWORD} from './config'
import { userMiddleware } from './middleware';
import { random } from './utils';
import cors from "cors";
const app =express();
app.use(cors());

app.use(express.json());

app.post("/api/v1/signup",async(req,res)=>{

    //hash the password
    const userName=req.body.userName;
    const password=req.body.password;

    try {
        await UserModel.create({
            userName,
            password
        });
    
        res.json({message:"you are log in"});
        
    } catch (error) {
        res.status(402).json({message:"user allready exists "})
    }

    
});

app.post("/api/v1/signin",async(req,res)=>{

    const userName=req.body.userName;
    const password=req.body.password;

   const existsUser= await UserModel.findOne({
        userName,
        password
   });
   if(existsUser){
    const token=jwt.sign({
        id:existsUser._id
    },JWT_PASSWORD)

    res.json(token);
   }else{
    res.status(403).json({message:"incorrect passwords"});
   }
    
});
app.post("/api/v1/content",userMiddleware,async(req,res)=>{
    const link =req.body.link;
    const type=req.body.type;
    const title=req.body.title;

   await  ContentModel.create({
        link,
        type,
        title,
    
        //@ts-ignore
        userId:req.userId,
        tags:[]

    })
    res.json({
        message :"content added"
    })
});

app.get("/api/v1/content",userMiddleware,async(req,res)=>{
    //@ts-ignore
    const userId=req.userId;
    const content =await ContentModel.find({
        userId:userId
    }).populate("userId","userName")
    res.json({
        content
    })
});



app.delete("/api/v1/content",userMiddleware,async(req,res)=>{
    const contentId=req.body.contentId;

    await ContentModel.deleteOne({
        contentId,
        //@ts-ignore
        userId:req.userId
    })
    res.json({
        message:"deleted"
    })
})

app.post("/api/v1/brain/share",userMiddleware,async(req,res)=>{
    const share =req.body.share;
    if(share){
    const existingLink=await LinkModel.findOne({
       
       //@ts-ignore
        userId:req.userId
    })

    if(existingLink){
        res.json({
            hash:existingLink.hash
        })
        return;
    }

    
        const hash=random(10);
      await  LinkModel.create({
        //@ts-ignore
            userId:req.userId,
            hash:hash
        })
        res.json({
            hash
        })
    }else{
      await  LinkModel.deleteOne({
        //@ts-ignore   
        userId:req.userId
        })
    }
    res.json({
        message:"link removed"
    })
})

app.get("/api/v1/brain/:shareLink",async(req,res)=>{
    const hash=req.params.shareLink;

    const link =await LinkModel.findOne({
        hash
    })

    if(!hash){
        res.status(411).json({
            message:"sorry incorrect link"
        })
        return;
    }

    const content=await ContentModel.find({
        //@ts-ignore
        userId:link.userId
    })

    const user=await UserModel.find({
        _id:link?.userId
    })


    if(!user){
        res.status(411).json({
            message:"error happend"
        })
        return;
    }
    res.json({
        //@ts-ignore
        username:user.userName,
        content
    })
})


app.listen(3000);