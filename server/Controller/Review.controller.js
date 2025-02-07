

const createProductReview = async(req, res) =>{
    const {rating, comment, productId}  = req.body;

    const review = {
        user : req?.user?._id,
        rating: Number(rating),
        comment
    }
} 