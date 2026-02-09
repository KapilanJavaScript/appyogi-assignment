function responseConstructor({
  statusCode = 400,
  status = false,
  message = '',
  response = null
}) {
  return {
    statusCode,
    body: {
      status: status ? 'success' : 'error',
      message,
      response
    }
  };
}

export default responseConstructor;