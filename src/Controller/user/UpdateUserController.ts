import { Request, Response } from 'express';
import { UpdateUserService } from '../../services/user/UpdateUserService';

class UpdateUserController {
  async handle(req: Request, res: Response) {
    const { userId, firstName, lastName, email, password } = req.body as {
      userId?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    };

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    const updateUserService = new UpdateUserService();

    try {
      const updatedUser = await updateUserService.execute({
        userId,
        firstName,
        lastName,
        email,
        password,
      });

      return res.json(updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Erro desconhecido.' });
    }
  }
}

export { UpdateUserController };
