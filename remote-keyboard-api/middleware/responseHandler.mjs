const responseMiddleware = (req, res, next) => {
  const { statusCode, body } = res.locals.response;
  res.status(statusCode).json(body);
}

export default responseMiddleware;