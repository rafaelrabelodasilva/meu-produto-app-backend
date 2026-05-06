import express, { Request, Response, NextFunction } from 'express';
import { router } from './routes';
import cors from 'cors';

const app = express();
app.use(express.json());
//Libera para qualquer ip
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(cors() as any);

app.use(router);

//MiddleWare
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    //Se for uma instância do tipo error lançado como 400 BAD REQUEST (erro de requisição)
    return res.status(400).json({
      error: err.message,
    });
  }
  //Se for outro tipo de erro então retorna o 500 internal server error
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
});

app.listen(3333, () => console.log('Servidor online!'));
