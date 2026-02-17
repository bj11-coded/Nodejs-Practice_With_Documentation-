import Joi from "joi";


const postSchema = Joi.object({
  title: Joi.string().min(3).max(20).required(),
  description: Joi.string().min(3).max(300).required(),
  postedBy: Joi.string().required(),
});

export default postSchema;


