import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { Iuser } from '../models/user.model';

export const authService = {
  async register (name : string, password : string, email : string) {
    const existing  = await userRepository.findByEmail(email);
    if(existing){
      throw new Error('User already exists');
    }
    const hashed = await bcrypt.hash(password,12);
    const user = await userRepository.createUser({name, email , password : hashed});
    const token = jwt.sign({id : user._id}, process.env.JWT_SECRET as string, {expiresIn : '7d'});
    return {user, token};
  },
  async login (email : string , password : string) {
    const user = await userRepository.findByEmail(email);
    if(!user) throw new Error('User not found');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({id : user._id}, process.env.JWT_SECRET as string, {expiresIn : '7d'});
    return {user, token};
  },
  async profile (userId : string) {
    const user = await userRepository.findUserWithoutPass(userId);
    if(!user) throw new Error('User not found');
    return user;
  },
  async logout (userId : string) {
    
  }
}
