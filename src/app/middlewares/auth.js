import jwt from 'jsonwebtoken'
import { promisify } from 'util'

import authConfig from '../../config/authConfig'

export default async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided ' })
  }

  const [, token] = authHeader.split(' ')
  try {
    const decoced = await promisify(jwt.verify)(token, authConfig.secret)
    req.option = decoced.option
    req.client_id = decoced.id
  } catch (error) {
    return res.status(401).json({ error: 'Token Invalid' })
  }
  return next()
}
