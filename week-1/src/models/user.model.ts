import mongoose, {Document, Schema} from "mongoose";

export interface Iuser extends Document {
  name : string;
  email : string;
  password : string;
  isDeleted?: boolean;
}

const userSchema : Schema = new Schema({
  name : {type : String, required : true},
  email : {type : String, required : true, unique : true},
  password : {type : String, required : true},
  isDeleted : {
    type : Boolean,
    default : false
  },  
},{timestamps : true});

export const User = mongoose.model<Iuser>("User", userSchema);