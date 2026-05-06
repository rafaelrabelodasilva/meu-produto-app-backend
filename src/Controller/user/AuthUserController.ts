import { Request, Response } from 'express';
import { AuthUserService } from '../../services/user/AuthUserService';

class AuthUserController {
  async handle(req: Request, res: Response) {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const authUserService = new AuthUserService();

    const auth = await authUserService.execute({ email, password });

    return res.json(auth);
  }
}

export { AuthUserController };
