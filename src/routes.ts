import { Router, Request, Response } from "express";
import { CreateUserController } from "./Controller/user/CreateUserController";

const router = Router()


router.post('/users', new CreateUserController().handle)


router.get('/teste', (req: Request, res: Response) => {
  return res.json({
    OK: true
  })
  // throw new Error('Exemplo de erro')
})

export { router }