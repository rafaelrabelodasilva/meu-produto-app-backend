import { Router, Request, Response } from "express";
import { CreateUserController } from "./Controller/user/CreateUserController";
import { UpdateUserController } from "./Controller/user/UpdateUserController";
import { AuthUserController } from "./Controller/user/AuthUserController";

const router = Router()


router.post('/users', new CreateUserController().handle)
router.put('/users', new UpdateUserController().handle)
router.post('/session', new AuthUserController().handle)


// router.get('/teste', (req: Request, res: Response) => {
//   return res.json({
//     OK: true
//   })
//   // throw new Error('Exemplo de erro')
// })

export { router }