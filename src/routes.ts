import { Router, Request, Response } from 'express';
import { CreateUserController } from './Controller/user/CreateUserController';
import { UpdateUserController } from './Controller/user/UpdateUserController';
import { AuthUserController } from './Controller/user/AuthUserController';
import { DetailUserController } from './Controller/user/DetailUserController';
import { isAuthenticated } from './middlewares/isAuthenticated';

const router = Router();

const createUserController = new CreateUserController();
const updateUserController = new UpdateUserController();
const authUserController = new AuthUserController();
const detailUserController = new DetailUserController();

router.post('/users', (req, res) => createUserController.handle(req, res));
router.put('/users', isAuthenticated, (req, res) =>
  updateUserController.handle(req, res),
);
router.post('/session', (req, res) => authUserController.handle(req, res));
router.get('/me', isAuthenticated, (req, res) =>
  detailUserController.handle(req, res),
);

// router.get('/teste', (req: Request, res: Response) => {
//   return res.json({
//     OK: true
//   })
//   // throw new Error('Exemplo de erro')
// })

export { router };
