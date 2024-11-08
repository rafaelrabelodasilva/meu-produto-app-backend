import { Router, Request, Response } from "express";

const router = Router()

router.get('/teste', (req: Request, res: Response) => {
  return res.json({
    OK: true
  })
  // throw new Error('Exemplo de erro')
})

export { router }