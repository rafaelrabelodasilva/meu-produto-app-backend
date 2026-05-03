import { Request, Response } from 'express';
import { CreateCategoryService } from '../../../services/user/category/CreateCategoryService';

class CreateCategoryController {
  async handle(req: Request, res: Response) {
    const { name } = req.body;
    const userId = req.user_id;

    const createCategoryService = new CreateCategoryService();
    const category = await createCategoryService.execute({
      name,
      userId,
    });
    return res.json(category);
  }
}

export { CreateCategoryController };
