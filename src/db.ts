import mongoose,{model,Schema} from "mongoose";

mongoose.connect("mongodb+srv://subhrodeep022:zVQyAatfKOdBlQPk@cluster0.sn8ir.mongodb.net/Brainly");

const UserSchmea =new Schema ({
    userName:{type:String,unique:true},
    password:String
})

export const UserModel = model("User",UserSchmea);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true },
})

export const ContentModel = model("Content", ContentSchema);