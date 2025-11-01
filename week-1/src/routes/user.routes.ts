import express from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = express.Router();

router.post('/register',userController.register);
router.post('/login',userController.login);
router.get('/profile',authMiddleware.verifyToken,userController.profile);
router.get('/logout', userController.logout);
export default router;