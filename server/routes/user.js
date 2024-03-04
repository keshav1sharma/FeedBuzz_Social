import express from 'express';
import {getUser,getUserFriend,addRemoveFriend} from '../controllers/users.js'
import {verify} from '../midlleware/auth.js'

const router = express.Router();
// read the content 
router.get("/:id",verify,getUser);
router.get("/:id/friends",verify,getUserFriend);

// update content 
router.patch("/:id/:friendId",verify,addRemoveFriend);

export default router;

