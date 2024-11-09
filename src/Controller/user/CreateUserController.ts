import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";

class CreateUserController {
  async handle(req: Request, res: Response) {
    const { firstName, lastName, email, password } = req.body

    const createUserService = new CreateUserService()

    try {
      const user = await createUserService.execute({
        firstName,
        lastName,
        email,
        password,
      });

      return res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: "Erro desconhecido." });
    }
  }
}

export { CreateUserController }