const checkTokenHeader = (req, res, next) => {
  if (req.headers['accesstoken'] === undefined) {
    res.status(401).send({ msg: 'Not Authorized' });
    return;
  }
  next();
}

export {
  checkTokenHeader
};