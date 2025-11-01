import { User, Iuser } from "../models/user.model";

export const userRepository = {
  async createUser(data : Partial<Iuser>) {
    return await User.create(data);
  },
  async findByEmail(email : string) {
    return await User.findOne({email, isDeleted : false});
  },
  async findById(id : string){
    return await User.findOne({ _id: id, isDeleted: false });
  },
  async findUserWithoutPass(id : string){
    return await User.findOne({ _id: id, isDeleted: false }).select('-password');
  }
}