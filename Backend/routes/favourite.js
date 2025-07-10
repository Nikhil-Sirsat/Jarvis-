import express from 'express';
const router = express.Router();
import { auth } from '../Middleware/AuthMid.js';
import { asyncHandler } from '../Middleware/asyncHandler.js';
import { addFavourite, getFavourites, isFavourite, removeFavourite } from '../controllers/favourite.js';

router.post('/:msgId', auth, asyncHandler(addFavourite));

router.get('/get_Favourites', auth, asyncHandler(getFavourites));

router.get('/isFavourite/:msgId', auth, asyncHandler(isFavourite));

router.delete('/:msgId', auth, asyncHandler(removeFavourite));

export default router;